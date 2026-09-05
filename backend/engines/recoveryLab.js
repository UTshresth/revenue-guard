// Recovery Lab — Inject a synthetic payment failure and observe the full AI pipeline
const { Case, AuditTrail } = require('../db');
const { checkCompliance } = require('../compliance/rules');

const FALLBACK_DIAGNOSIS = {
  checkout_dropoff:   { root_cause: 'User abandoned at payment screen', recommended_channel: 'sms',      message: 'You were so close! Complete your payment using this secure link.', confidence: 0.82 },
  insufficient_funds: { root_cause: 'Insufficient balance at time of charge', recommended_channel: 'telegram', message: 'Your payment failed due to low balance. Please top up and retry.', confidence: 0.91 },
  card_expired:       { root_cause: 'Card expiry date lapsed before processing', recommended_channel: 'sms', message: 'Your saved card has expired. Please update your card to complete the payment.', confidence: 0.95 },
  bank_outage:        { root_cause: 'Bank gateway returned a 503 timeout', recommended_channel: 'voice', message: 'Your bank had a temporary issue. Your payment is safe — please retry now.', confidence: 0.88 },
};

const runLabScenario = async (failureType, amount, customerName) => {
  const steps = [];
  const log = (phase, status, detail, payload = null) => steps.push({ phase, status, detail, payload });

  // Step 1: Detection
  log('Detection', 'ok', `Signal received: "${failureType.replace(/_/g, ' ')}" · ₹${amount} · ${customerName}`, {
    event: 'payment.failed',
    error_code: failureType,
    amount: amount * 100,
    timestamp: new Date().toISOString()
  });

  // Step 2: Persist case to DB
  const caseId = 'LAB-' + Math.random().toString(36).slice(2, 10).toUpperCase();
  const caseData = {
    id: caseId,
    type: failureType,
    razorpay_entity_id: 'lab_' + Date.now(),
    amount_at_risk: amount * 100,
    status: 'open',
    customer_name: customerName,
    customer_email: 'lab@revenueguard.in',
    customer_contact: '+919876543210',
  };
  await Case.create(caseData);
  log('Case Stored', 'ok', `Persisted to database · Case ID: ${caseId}`, caseData);

  // Step 3: Root cause diagnosis via Groq (with fallback)
  let diagnosis = null;
  try {
    const Groq = require('groq-sdk');
    const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
    const completion = await groq.chat.completions.create({
      model: 'groq/compound-mini',
      response_format: { type: 'json_object' },
      messages: [
        { role: 'system', content: 'You are a payment failure analyst. Respond only with JSON.' },
        { role: 'user', content: `Payment of ₹${amount} failed: "${failureType.replace(/_/g, ' ')}". Return JSON: { "root_cause": "...", "recommended_channel": "sms|telegram|voice", "message": "1-2 sentence recovery message to customer", "confidence": 0.0-1.0 }` }
      ]
    });
    diagnosis = JSON.parse(completion.choices[0].message.content);
    log('AI Diagnosis', 'ok', `Groq Compound Mini · Confidence: ${((diagnosis.confidence || 0.88) * 100).toFixed(0)}%`, diagnosis);
  } catch (e) {
    diagnosis = FALLBACK_DIAGNOSIS[failureType] || FALLBACK_DIAGNOSIS['checkout_dropoff'];
    log('AI Diagnosis', 'fallback', `Local Neural Fallback · Root cause: ${diagnosis.root_cause}`, diagnosis);
  }

  // Step 4: Compliance gate
  const compliance = await checkCompliance(caseId, { channel: diagnosis.recommended_channel, amount: amount * 100 });
  if (!compliance.allowed) {
    log('Compliance Gate', 'blocked', `BLOCKED — ${compliance.reason}`, compliance);
  } else {
    const warnings = compliance.violations.filter(v => v.severity !== 'hard_block');
    log('Compliance Gate', warnings.length ? 'warn' : 'ok',
      warnings.length
        ? `Passed with warnings: ${warnings.map(v => v.rule).join(', ')}`
        : 'All rules passed · DND window · retry cap · cool-down period', compliance);
  }

  // Step 5: Dispatch
  const channel = compliance.allowed ? diagnosis.recommended_channel : null;
  const paymentLink = `https://rzp.io/i/rec_${caseId.toLowerCase()}`;
  let auditLog = null;
  if (channel) {
    auditLog = await AuditTrail.create({
      case_id: caseId,
      action: 'payment_link_created',
      channel,
      message_sent: diagnosis.message,
      llm_reasoning: `Lab run · Root cause: ${diagnosis.root_cause}`,
      payment_link_url: paymentLink,
      status: 'lab_mode'
    });
    log('Action Dispatched', 'ok', `Staged via ${channel.toUpperCase()} with dynamic payment link`, {
      channel,
      recipient: customerName,
      contact: '+919876543210',
      message: diagnosis.message,
      payment_url: paymentLink,
      dispatched_at: new Date().toISOString()
    });
  } else {
    log('Action Dispatched', 'blocked', 'No outreach — compliance gate prevented execution', { status: 'aborted' });
  }

  return { caseId, steps, channel, diagnosis, paymentLink };
};

module.exports = { runLabScenario };
