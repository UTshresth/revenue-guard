const express = require('express');
const cors = require('cors');
const { syncDb } = require('./db');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

// ──────────────────────────────────
// DB Models
// ──────────────────────────────────
const { Case, AuditTrail, PromiseToPay } = require('./db');

// ──────────────────────────────────
// Engine Imports
// ──────────────────────────────────
const { processAbandonedCheckouts } = require('./engines/checkoutRecovery');
const { processOverdueInvoices } = require('./engines/invoiceChasing');
const { processSubscriptionChurn } = require('./engines/subscriptionRecovery');
const { processMandateFailures, checkBrokenPromises, createPromiseToPay, NPCI_RULES } = require('./engines/mandateCompliance');
const { verifyPaymentLinks } = require('./engines/verifyRecovery');

// ──────────────────────────────────
// Health Check
// ──────────────────────────────────
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date(), engines: 5 });
});

// ──────────────────────────────────
// Dashboard Stats (Real DB data)
// ──────────────────────────────────
app.get('/api/dashboard/stats', async (req, res) => {
  try {
    const totalRecovered = await Case.sum('recovered_amount') || 0;
    const totalAtRisk = await Case.sum('amount_at_risk') || 0;
    const totalCases = await Case.count();
    const recoveredCases = await Case.count({ where: { status: 'recovered' } });
    const openCases = await Case.count({ where: { status: 'open' } });

    // Promise to Pay Stats
    const { PromiseToPay } = require('./db');
    const ptpPending = await PromiseToPay.count({ where: { status: 'pending' } });
    const ptpFulfilled = await PromiseToPay.count({ where: { status: 'fulfilled' } });
    const ptpBroken = await PromiseToPay.count({ where: { status: 'broken' } });

    // Retry System Stats
    const retryExhausted = await AuditTrail.count({ where: { action: 'payment_link_created', is_violation: true } });
    const totalRetries = await AuditTrail.count({ where: { action: 'payment_link_created' } });


    const cases = await Case.findAll({
      order: [['createdAt', 'DESC']],
      limit: 20
    });

    const formattedCases = await Promise.all(cases.map(async (c) => {
      // Find the most recent audit trail with AI reasoning/message for this case
      const audit = await AuditTrail.findOne({
        where: { case_id: c.id },
        order: [['createdAt', 'DESC']]
      });

      return {
        id: c.id,
        customer: c.customer_name || 'Customer',
        type: c.type.replace(/_/g, ' '),
        amount: c.amount_at_risk / 100,
        amountFormatted: `₹${(c.amount_at_risk / 100).toLocaleString()}`,
        status: c.status,
        channel: audit?.channel || 'sms',
        time: new Date(c.createdAt).toLocaleTimeString(),
        createdAt: c.createdAt,
        link: audit?.payment_link_url || null,
        messageSent: audit?.message_sent || null,
        llmReasoning: audit?.llm_reasoning || null
      };
    }));

    // Root-cause breakdown
    const checkoutCount = await Case.count({ where: { type: 'checkout_dropoff' } });
    const invoiceCount = await Case.count({ where: { type: 'invoice_overdue' } });
    const subscriptionCount = await Case.count({ where: { type: 'subscription_churn' } });
    const paymentCount = await Case.count({ where: { type: 'payment_degradation' } });

    // ROI calculation
    const totalLinksSent = await AuditTrail.count({ where: { action: 'payment_link_created' } });
    const costPerOutreach = 0.50; // ₹0.50 per SMS
    const totalCost = totalLinksSent * costPerOutreach;
    const roi = totalCost > 0 ? ((totalRecovered / 100) / totalCost).toFixed(1) : 0;

    res.json({
      totalRecovered: totalRecovered / 100,
      totalAtRisk: totalAtRisk / 100,
      totalCases,
      recoveredCases,
      openCases,
      recentCases: formattedCases,
      rootCause: {
        checkout_dropoff: checkoutCount,
        invoice_overdue: invoiceCount,
        subscription_churn: subscriptionCount,
        payment_degradation: paymentCount
      },
      ptpStats: {
        active: ptpPending,
        fulfilled: ptpFulfilled,
        broken: ptpBroken,
        total: ptpPending + ptpFulfilled + ptpBroken
      },
      retrySystem: {
        activeRetries: totalRetries - retryExhausted,
        exhausted: retryExhausted,
        maxAllowed: 3 // Hardcoded from compliance rules
      },
      roi: {
        totalCost,
        totalRecovered: totalRecovered / 100,
        multiplier: roi,
        linksSent: totalLinksSent
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch stats' });
  }
});

// ──────────────────────────────────
// Audit Trail API
// ──────────────────────────────────
app.get('/api/audit-trail', async (req, res) => {
  try {
    const audits = await AuditTrail.findAll({
      order: [['createdAt', 'DESC']],
      limit: 50
    });
    res.json(audits);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch audit trail' });
  }
});

// Case detail
app.get('/api/cases/:id', async (req, res) => {
  try {
    const caseData = await Case.findByPk(req.params.id);
    if (!caseData) return res.status(404).json({ error: 'Case not found' });

    const audits = await AuditTrail.findAll({
      where: { case_id: req.params.id },
      order: [['createdAt', 'ASC']]
    });

    const ptps = await PromiseToPay.findAll({
      where: { case_id: req.params.id }
    });

    res.json({ case: caseData, auditTrail: audits, promisesToPay: ptps });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch case' });
  }
});

// ──────────────────────────────────
// Agent Execution Endpoints
// ──────────────────────────────────

// Run ALL engines at once (the "AI Agent" button)
app.post('/api/agent/run', async (req, res) => {
  try {
    const results = {};

    // Engine 2: Checkout recovery
    await processAbandonedCheckouts();
    results.checkouts = 'done';

    // Engine 4: Invoice chasing
    await processOverdueInvoices();
    results.invoices = 'done';

    // Engine 3: Subscription churn
    try {
      await processSubscriptionChurn();
      results.subscriptions = 'done';
    } catch (e) {
      results.subscriptions = 'skipped (no subscription data)';
    }

    // Engine 5: Mandate compliance
    try {
      await processMandateFailures();
      results.mandates = 'done';
    } catch (e) {
      results.mandates = 'skipped';
    }

    // Check broken PTP promises
    try {
      await checkBrokenPromises();
      results.ptpCheck = 'done';
    } catch (e) {
      results.ptpCheck = 'skipped';
    }

    // ── Demo seed: ensure all failure types are represented ──
    // If no real Razorpay data exists for a type, create demo cases so
    // the dashboard always shows diverse failure categories.
    const demoSeeds = [
      {
        type: 'invoice_overdue',
        id: `RG-INV-DEMO-${Date.now()}`,
        amount: Math.floor(Math.random() * 20000 + 5000) * 100, // ₹500–₹2,500 in paise
        customer_name: 'Arjun Mehta',
        customer_email: 'arjun.mehta@example.com',
        customer_contact: '+919900000001',
        message: 'Your invoice is overdue. Pay now to avoid service interruption.',
        reasoning: 'High-value B2B client. Direct reminder with urgency.'
      },
      {
        type: 'subscription_churn',
        id: `RG-SUB-DEMO-${Date.now() + 1}`,
        amount: Math.floor(Math.random() * 5000 + 999) * 100, // ₹99–₹599 in paise
        customer_name: 'Priya Kapoor',
        customer_email: 'priya.kapoor@example.com',
        customer_contact: '+919900000002',
        message: 'Your subscription payment failed. Update your card to keep access.',
        reasoning: 'Recurring billing failure. Card may have expired — prompt update.'
      },
      {
        type: 'payment_degradation',
        id: `RG-DEG-DEMO-${Date.now() + 2}`,
        amount: Math.floor(Math.random() * 30000 + 8000) * 100,
        customer_name: 'Rohan Verma',
        customer_email: 'rohan.verma@example.com',
        customer_contact: '+919900000003',
        message: 'We detected a gateway issue during your transaction. Retry now.',
        reasoning: 'Bank gateway timeout. Customer should retry with alternate method.'
      },
    ];

    for (const seed of demoSeeds) {
      // Only insert if this failure type has 0 non-checkout cases today
      const existing = await Case.count({ where: { type: seed.type } });
      if (existing === 0) {
        const newCase = await Case.create({
          id: seed.id,
          type: seed.type,
          razorpay_entity_id: `demo_${seed.type}_${Date.now()}`,
          amount_at_risk: seed.amount,
          customer_name: seed.customer_name,
          customer_email: seed.customer_email,
          customer_contact: seed.customer_contact,
          status: 'open',
        });
        await AuditTrail.create({
          case_id: newCase.id,
          action: 'payment_link_created',
          channel: seed.type === 'invoice_overdue' ? 'telegram' : seed.type === 'subscription_churn' ? 'sms' : 'voice',
          message_sent: seed.message,
          llm_reasoning: seed.reasoning,
          payment_link_id: null,
          payment_link_url: null,
        });
      }
    }
    results.demoSeed = 'diversity cases ensured';

    res.json({ success: true, message: 'All engines executed', results });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Agent execution failed' });
  }
});

// Verify payment links
app.post('/api/agent/verify', async (req, res) => {
  try {
    const result = await verifyPaymentLinks();
    res.json({ success: true, message: `Found ${result.recoveredCount} new recoveries.` });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Verification failed' });
  }
});

// Promise-to-Pay creation
app.post('/api/ptp', async (req, res) => {
  try {
    const { caseId, amount, date, method } = req.body;
    const ptp = await createPromiseToPay(caseId, { amount, date, method });
    res.json({ success: true, ptp });
  } catch (error) {
    res.status(500).json({ error: 'Failed to create PTP' });
  }
});

// NPCI Rules info (for the dashboard)
app.get('/api/compliance/rules', (req, res) => {
  const { COMPLIANCE_CONFIG } = require('./compliance/rules');
  res.json({ npci: NPCI_RULES, compliance: COMPLIANCE_CONFIG });
});

// ──────────────────────────────────
// Engine 6: Voice Agent API
// ──────────────────────────────────
const { generateVoiceScript } = require('./engines/voiceAgent');
const { makeVoiceCall, getPendingScript } = require('./engines/twilioClient');

app.post('/api/voice/script', async (req, res) => {
  try {
    const { caseId, callContext, language } = req.body;
    const scriptData = await generateVoiceScript(caseId, callContext, language);
    res.json(scriptData);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// TwiML webhook - Twilio calls THIS URL when the phone picks up
app.get('/api/twiml', (req, res) => {
  const script = getPendingScript() || "Hello, this is RevenueGuard.";
  console.log(`🎙️ Twilio fetched TwiML webhook! Serving script: "${script.substring(0, 80)}..."`);
  
  res.type('text/xml');
  res.send(`<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Say>${script.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')}</Say>
</Response>`);
});

// Also support POST (Twilio uses POST by default)
app.post('/api/twiml', (req, res) => {
  const script = getPendingScript() || "Hello, this is RevenueGuard.";
  console.log(`🎙️ Twilio fetched TwiML webhook (POST)! Serving script: "${script.substring(0, 80)}..."`);
  
  res.type('text/xml');
  res.send(`<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Say>${script.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')}</Say>
</Response>`);
});

app.post('/api/voice/call', async (req, res) => {
  try {
    const { scriptText } = req.body;
    await makeVoiceCall(scriptText);
    res.json({ success: true, message: 'Call initiated with custom script!' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/voice/sms', async (req, res) => {
  try {
    const { scriptText } = req.body;
    const { sendWhatsAppMessage } = require('./engines/twilioClient');
    await sendWhatsAppMessage(scriptText);
    res.json({ success: true, message: 'SMS initiated' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ──────────────────────────────────
// Engine 7: Autonomous Negotiation Agent (Tool Calling)
// ──────────────────────────────────
const { processNegotiationChat, sessionMemory, createPaymentLinkTool, initializeNegotiationChat } = require('./engines/negotiator');

app.post('/api/voice/telegram', async (req, res) => {
  try {
    const { caseId, scriptText } = req.body;
    
    // 1. Fetch Case
    const { Case, AuditTrail } = require('./db');
    const c = await Case.findByPk(caseId);
    if (!c) throw new Error('Case not found');

    // 2. Generate Razorpay Payment Link for the full amount
    const amount = c.amount_at_risk / 100;
    const toolResult = await createPaymentLinkTool(
      amount, 
      "Voice AI Generated Settlement Link", 
      c.customer_name || 'Customer', 
      c.customer_email || 'test@example.com',
      caseId
    );

    // 3. Save to AuditTrail
    await AuditTrail.create({
      case_id: caseId,
      action: 'payment_link_created',
      channel: 'telegram',
      message_sent: scriptText,
      llm_reasoning: 'Sent via Telegram from the Voice Agent Dashboard',
      payment_link_id: toolResult.link_id,
      payment_link_url: toolResult.short_url
    });

    // 4. Send via Telegram
    const telegramToken = process.env.TELEGRAM_BOT_TOKEN;
    const chatId = process.env.TELEGRAM_CHAT_ID;
    
    if (!telegramToken || !chatId || telegramToken === 'YOUR_BOT_TOKEN' || chatId === 'YOUR_CHAT_ID') {
      return res.status(500).json({ error: 'TELEGRAM_BOT_TOKEN or TELEGRAM_CHAT_ID missing in .env file.' });
    }

    const finalMessage = `RevenueGuard Voice AI\n\n${scriptText}\n\nPayment Link: ${toolResult.short_url}`;
    
    const tgRes = await fetch(`https://api.telegram.org/bot${telegramToken}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chat_id: chatId, text: finalMessage })
    });
    
    const tgData = await tgRes.json();
    if (!tgData.ok) {
      throw new Error(tgData.description || 'Failed to send Telegram message');
    }

    res.json({ success: true, message: 'Telegram message sent successfully with payment link!', link: toolResult.short_url });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/negotiate/chat', async (req, res) => {
  try {
    const { caseId, message, constraints } = req.body;
    const response = await processNegotiationChat(caseId, message, constraints);
    res.json(response);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Reset chat memory for a case
app.post('/api/negotiate/reset', async (req, res) => {
  try {
    const { caseId, constraints } = req.body;
    await initializeNegotiationChat(caseId, constraints);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ──────────────────────────────────
// Step-by-Step Demo Runner
// ──────────────────────────────────
const { runDemoStep } = require('./engines/demoRunner');

app.post('/api/demo/step', async (req, res) => {
  try {
    const { step } = req.body; // 'seed', 'detect', 'analyze', 'recover'
    const result = await runDemoStep(step);
    res.json(result);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
});

// ──────────────────────────────────
// Engine 8: ML Prediction
// ──────────────────────────────────
const { trainModel, predictDropoff, isModelReady } = require('./engines/mlPredictor');

app.post('/api/ml/predict', (req, res) => {
  try {
    if (!isModelReady()) return res.status(503).json({ error: 'Model is currently training...' });
    const { params } = req.body;
    const prediction = predictDropoff(params);
    res.json(prediction);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ──────────────────────────────────
// Recovery Lab Route
// ──────────────────────────────────
const { runLabScenario } = require('./engines/recoveryLab');
app.post('/api/lab/run', async (req, res) => {
  try {
    const { failureType, amount, customerName } = req.body;
    const result = await runLabScenario(failureType, Number(amount), customerName || 'Test Customer');
    res.json({ success: true, ...result });
  } catch (error) {
    console.error('[Lab]', error);
    res.status(500).json({ success: false, error: error.message, steps: [] });
  }
});

// ──────────────────────────────────
// Start Server
// ──────────────────────────────────
const PORT = process.env.PORT || 3001;

app.listen(PORT, async () => {
  await syncDb();
  console.log(`⚡ RevenueGuard Agent running on port ${PORT}`);
  console.log(`   Engines: Checkout | Invoice | Subscription | Mandate | Verification | ML Prediction`);
  
  // Kick off ML Model Training in the background!
  trainModel();
});

