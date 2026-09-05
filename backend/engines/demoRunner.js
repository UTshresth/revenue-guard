const razorpay = require('../razorpay/client');
const { Case, AuditTrail } = require('../db');
const Groq = require('groq-sdk');
const groqClient = new Groq({ apiKey: process.env.GROQ_API_KEY });

// Step-by-step demo runner with detailed logs
// Returns every action so the frontend can display proof

const runDemoStep = async (step) => {
  const logs = [];
  const log = (emoji, msg, data) => {
    logs.push({ emoji, message: msg, data, timestamp: new Date().toISOString() });
    console.log(`${emoji} ${msg}`);
  };

  try {
    if (step === 'seed') {
      // STEP 1: Create real Razorpay orders (simulated abandoned checkouts)
      log('🏗️', 'Creating abandoned checkout order on Razorpay...', null);
      
      const order = await razorpay.orders.create({
        amount: 249900, // ₹2,499
        currency: "INR",
        receipt: `demo_${Date.now()}`,
        notes: { scenario: "demo_abandoned_checkout", source: "revenue_guard" }
      });
      
      log('✅', `Order created in Razorpay`, {
        order_id: order.id,
        amount: `₹${order.amount / 100}`,
        status: order.status,
        razorpay_dashboard: `https://dashboard.razorpay.com/app/orders/${order.id}`
      });

      // Also create an invoice
      log('🏗️', 'Creating overdue invoice on Razorpay...', null);
      const invoice = await razorpay.invoices.create({
        type: "invoice",
        customer: {
          name: "Demo Corp",
          email: "demo@example.com",
          contact: "+919876543210"
        },
        line_items: [{ name: "Monthly SaaS License", amount: 199900, currency: "INR" }],
        expire_by: Math.floor(Date.now() / 1000) + 600, // 10 mins
        currency: "INR",
        description: "Demo Invoice - RevenueGuard"
      });

      log('✅', `Invoice created in Razorpay`, {
        invoice_id: invoice.id,
        amount: `₹${invoice.amount / 100}`,
        status: invoice.status,
        razorpay_dashboard: `https://dashboard.razorpay.com/app/invoices`
      });

      return { success: true, logs, summary: `Created 1 order (₹2,499) + 1 invoice (₹1,999) in your Razorpay account` };
    }

    if (step === 'detect') {
      // STEP 2: Scan Razorpay for abandoned orders
      log('🔍', 'Calling Razorpay API: orders.all() to find abandoned checkouts...', null);
      
      const oneDayAgo = Math.floor(Date.now() / 1000) - 86400;
      const orders = await razorpay.orders.all({ from: oneDayAgo, count: 5 });
      const abandoned = orders.items.filter(o => o.status === 'created' && o.amount > 0);
      
      log('📊', `Razorpay returned ${orders.items.length} orders, ${abandoned.length} are abandoned`, {
        total_orders: orders.items.length,
        abandoned_count: abandoned.length,
        abandoned_orders: abandoned.map(o => ({ id: o.id, amount: `₹${o.amount/100}`, status: o.status }))
      });

      // Also scan invoices
      log('🔍', 'Calling Razorpay API: invoices.all() to find overdue invoices...', null);
      const invoices = await razorpay.invoices.all({ count: 5 });
      const overdue = (invoices.items || []).filter(i => i.status === 'issued' && i.amount_due > 0);
      
      log('📊', `Found ${overdue.length} overdue invoices`, {
        overdue_invoices: overdue.map(i => ({ id: i.id, amount: `₹${i.amount_due/100}`, customer: i.customer_details?.name }))
      });

      return { success: true, logs, summary: `Detected ${abandoned.length} abandoned checkouts + ${overdue.length} overdue invoices` };
    }

    if (step === 'analyze') {
      // STEP 3: Run AI analysis on the first abandoned order
      log('🔍', 'Fetching an abandoned order to analyze...', null);
      
      const oneDayAgo = Math.floor(Date.now() / 1000) - 86400;
      const orders = await razorpay.orders.all({ from: oneDayAgo, count: 3 });
      const abandoned = orders.items.filter(o => o.status === 'created' && o.amount > 0);
      
      if (abandoned.length === 0) {
        log('⚠️', 'No abandoned orders found. Run the "Seed" step first.', null);
        return { success: false, logs, summary: 'No data to analyze' };
      }

      const order = abandoned[0];
      log('🧠', `Sending to Groq AI for root-cause analysis...`, { order_id: order.id, amount: `₹${order.amount/100}` });

      const prompt = `You are a revenue recovery AI. 
A customer abandoned their checkout for an order of ₹${order.amount/100}.
Generate a recovery strategy. Return JSON:
- strategy: "discount", "urgency", or "support"
- message: SMS text (under 120 chars)
- reasoning: Why you chose this
- root_cause: What likely happened`;

      const completion = await groqClient.chat.completions.create({
        messages: [{ role: "user", content: prompt }],
        model: "groq/compound-mini",
        response_format: { type: "json_object" }
      });

      let rawContent = completion.choices[0].message.content;
      if (rawContent.startsWith('```json')) {
        rawContent = rawContent.replace(/^```json\n/, '').replace(/\n```$/, '');
      }
      const aiResult = JSON.parse(rawContent);

      log('🤖', `AI Analysis Complete`, {
        model: 'groq/compound-mini',
        strategy: aiResult.strategy,
        root_cause: aiResult.root_cause,
        message: aiResult.message,
        reasoning: aiResult.reasoning,
        raw_response: rawContent
      });

      return { success: true, logs, summary: `AI diagnosed: "${aiResult.root_cause}" → Strategy: ${aiResult.strategy}` };
    }

    if (step === 'recover') {
      // STEP 4: Create a real payment link and track in DB
      log('🔍', 'Finding an untracked abandoned order...', null);
      
      const oneDayAgo = Math.floor(Date.now() / 1000) - 86400;
      const orders = await razorpay.orders.all({ from: oneDayAgo, count: 3 });
      const abandoned = orders.items.filter(o => o.status === 'created' && o.amount > 0);
      
      if (abandoned.length === 0) {
        return { success: false, logs, summary: 'No orders to recover' };
      }

      const order = abandoned[0];
      
      // Check if already tracked
      const existing = await Case.findOne({ where: { razorpay_entity_id: order.id } });
      if (existing) {
        log('ℹ️', `Order ${order.id} already tracked as case ${existing.id}`, null);
      }

      // AI analysis
      log('🧠', 'Running AI strategy...', null);
      const prompt = `Customer abandoned ₹${order.amount/100} checkout. Return JSON: { "strategy": "discount"|"urgency"|"support", "message": "SMS text under 120 chars", "reasoning": "why" }`;
      const completion = await groqClient.chat.completions.create({
        messages: [{ role: "user", content: prompt }],
        model: "groq/compound-mini",
        response_format: { type: "json_object" }
      });
      let rawContent = completion.choices[0].message.content;
      if (rawContent.startsWith('```json')) {
        rawContent = rawContent.replace(/^```json\n/, '').replace(/\n```$/, '');
      }
      const ai = JSON.parse(rawContent);
      log('🤖', `AI says: ${ai.strategy}`, { strategy: ai.strategy, message: ai.message });

      // Create Payment Link via Razorpay API
      log('💳', 'Calling Razorpay API: paymentLink.create()...', null);
      const paymentLink = await razorpay.paymentLink.create({
        amount: order.amount,
        currency: "INR",
        description: `Recovery: ${order.receipt || order.id}`,
        customer: { name: "Customer", email: "test@example.com", contact: "+919876543210" },
        notify: { sms: false, email: false },
        expire_by: Math.floor(Date.now() / 1000) + (7 * 86400)
      });

      log('✅', 'Payment Link CREATED', {
        link_id: paymentLink.id,
        short_url: paymentLink.short_url,
        amount: `₹${paymentLink.amount / 100}`,
        status: paymentLink.status,
        click_to_pay: paymentLink.short_url
      });

      // Save to DB
      const caseId = `RG-CHK-${Date.now()}`;
      await Case.create({
        id: caseId,
        type: 'checkout_dropoff',
        razorpay_entity_id: order.id,
        amount_at_risk: order.amount,
      });
      await AuditTrail.create({
        case_id: caseId,
        action: 'payment_link_created',
        channel: 'sms',
        message_sent: ai.message,
        llm_reasoning: ai.reasoning,
        payment_link_id: paymentLink.id,
        payment_link_url: paymentLink.short_url
      });

      log('💾', 'Saved to database', { case_id: caseId, audit_action: 'payment_link_created' });

      return { 
        success: true, 
        logs, 
        summary: `Recovery link created: ${paymentLink.short_url}`,
        paymentLink: paymentLink.short_url
      };
    }

    return { success: false, logs: [{ emoji: '❌', message: 'Unknown step', timestamp: new Date().toISOString() }] };

  } catch (error) {
    log('❌', `Error: ${error.message}`, { stack: error.stack?.split('\n').slice(0, 3) });
    return { success: false, logs, summary: `Failed: ${error.message}` };
  }
};

module.exports = { runDemoStep };
