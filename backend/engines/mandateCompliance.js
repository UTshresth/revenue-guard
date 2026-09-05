const { Case, AuditTrail, PromiseToPay } = require('../db');
const Groq = require('groq-sdk');
const groqClient = new Groq({ apiKey: process.env.GROQ_API_KEY });

// Engine 5: Mandate & NPCI Compliance + Promise-to-Pay Tracker
// Handles e-mandate retry logic according to NPCI rules and tracks PTP commitments

const NPCI_RULES = {
  max_retry_attempts: 3,             // Max 3 retries per mandate
  retry_window_days: 5,              // Must retry within 5 days of failure
  min_hours_between_retries: 12,     // At least 12 hours between retries
  max_amount_without_consent: 500000 // ₹5,000 in paise — above this needs explicit consent
};

// Check if a retry is NPCI-compliant
const checkNPCICompliance = async (caseId) => {
  const pastRetries = await AuditTrail.findAll({
    where: { case_id: caseId, action: 'mandate_retry' }
  });

  if (pastRetries.length >= NPCI_RULES.max_retry_attempts) {
    return { allowed: false, reason: `NPCI Limit: Already retried ${pastRetries.length}/${NPCI_RULES.max_retry_attempts} times.` };
  }

  // Check time gap
  if (pastRetries.length > 0) {
    const lastRetry = pastRetries[pastRetries.length - 1];
    const hoursSinceLast = (Date.now() - new Date(lastRetry.createdAt).getTime()) / (1000 * 60 * 60);
    if (hoursSinceLast < NPCI_RULES.min_hours_between_retries) {
      return { allowed: false, reason: `NPCI Timing: Only ${hoursSinceLast.toFixed(1)} hours since last retry. Need ${NPCI_RULES.min_hours_between_retries}h.` };
    }
  }

  return { allowed: true };
};

// Process mandate failures
const processMandateFailures = async () => {
  console.log("🏦 Scanning for mandate/recurring payment failures...");

  try {
    const openCases = await Case.findAll({
      where: { type: 'payment_degradation', status: 'open' }
    });

    for (const c of openCases) {
      // Check NPCI compliance before any retry
      const compliance = checkNPCICompliance(c.id);
      if (!(await compliance).allowed) {
        console.log(`⛔ Case ${c.id}: ${(await compliance).reason}`);
        await AuditTrail.create({
          case_id: c.id,
          action: 'npci_block',
          is_violation: false,
          message_sent: (await compliance).reason
        });
        continue;
      }

      console.log(`✅ Case ${c.id}: NPCI compliant, eligible for retry.`);

      // Log the mandate retry attempt
      await AuditTrail.create({
        case_id: c.id,
        action: 'mandate_retry',
        channel: 'auto',
        message_sent: 'NPCI-compliant retry scheduled.'
      });
    }

    return { success: true };
  } catch (error) {
    console.error("Error processing mandates:", error);
    throw error;
  }
};

// Promise-to-Pay: Record and track customer commitments
const createPromiseToPay = async (caseId, { amount, date, method }) => {
  const ptp = await PromiseToPay.create({
    case_id: caseId,
    promised_amount: amount,
    promised_date: date,
    promised_method: method || 'unspecified',
    status: 'pending'
  });

  await AuditTrail.create({
    case_id: caseId,
    action: 'ptp_recorded',
    message_sent: `Customer promised ₹${amount / 100} by ${date} via ${method || 'unspecified'}`
  });

  console.log(`📝 PTP recorded for case ${caseId}: ₹${amount / 100} by ${date}`);
  return ptp;
};

// Check for broken promises (PTP past due date but case still open)
const checkBrokenPromises = async () => {
  console.log("🔍 Checking for broken promise-to-pay commitments...");

  const pendingPTPs = await PromiseToPay.findAll({
    where: { status: 'pending' }
  });

  let brokenCount = 0;

  for (const ptp of pendingPTPs) {
    if (new Date(ptp.promised_date) < new Date()) {
      // Promise date has passed — check if the case was recovered
      const parentCase = await Case.findByPk(ptp.case_id);
      if (parentCase && parentCase.status !== 'recovered') {
        await ptp.update({ status: 'broken' });
        brokenCount++;

        // AI decides escalation
        const prompt = `A customer promised to pay ₹${ptp.promised_amount / 100} by ${ptp.promised_date} via ${ptp.promised_method}. They did NOT pay.
Generate a firm but professional follow-up. Return JSON:
- action: "final_reminder" or "escalate_to_collections"
- message: string (under 150 chars)
- reasoning: string`;

        const completion = await groqClient.chat.completions.create({
          messages: [
            { role: "system", content: "You are a JSON-only response agent." },
            { role: "user", content: prompt }
          ],
          model: "groq/compound-mini",
          response_format: { type: "json_object" }
        });

        let rawContent = completion.choices[0].message.content;
        if (rawContent.startsWith('```json')) {
          rawContent = rawContent.replace(/^```json\n/, '').replace(/\n```$/, '');
        }
        const aiDecision = JSON.parse(rawContent);

        await AuditTrail.create({
          case_id: ptp.case_id,
          action: 'ptp_broken_escalation',
          message_sent: aiDecision.message,
          llm_reasoning: aiDecision.reasoning
        });

        console.log(`⚠️ Broken PTP: Case ${ptp.case_id} - ${aiDecision.action}`);
      }
    }
  }

  return { brokenCount };
};

module.exports = {
  NPCI_RULES,
  checkNPCICompliance,
  processMandateFailures,
  createPromiseToPay,
  checkBrokenPromises
};
