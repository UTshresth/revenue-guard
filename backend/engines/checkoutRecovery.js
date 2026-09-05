const razorpay = require('../razorpay/client');
const { Case, AuditTrail } = require('../db');
const groq = require('groq-sdk');
const groqClient = new groq({ apiKey: process.env.GROQ_API_KEY });

const processAbandonedCheckouts = async () => {
  console.log("🔍 Scanning Razorpay for abandoned checkouts...");
  
  // Fetch orders from the last 24 hours that are still in "created" state (unpaid)
  const oneDayAgo = Math.floor(Date.now() / 1000) - 86400;
  
  try {
    const orders = await razorpay.orders.all({
      from: oneDayAgo,
      count: 10
    });

    const abandonedOrders = orders.items.filter(order => order.status === 'created' && order.amount > 0);
    console.log(`Found ${abandonedOrders.length} abandoned orders.`);

    for (const order of abandonedOrders) {
      console.log(`\nProcessing Order: ${order.id} | Amount: ₹${order.amount/100}`);
      
      // 1. Create a Case
      const recoveryCase = await Case.create({
        id: `RG-CHK-${Date.now()}`,
        type: 'checkout_dropoff',
        razorpay_entity_id: order.id,
        amount_at_risk: order.amount,
      });

      // 2. AI Reasoning (simulated context)
      const prompt = `You are a revenue recovery AI. 
      A customer abandoned their checkout for an order of ₹${order.amount/100}.
      Generate a short, persuasive SMS message to win them back.
      Return JSON with:
      - strategy: "discount", "urgency", or "support"
      - message: The SMS text (under 120 chars)
      - reasoning: Why you chose this message.`;

      const completion = await groqClient.chat.completions.create({
        messages: [{ role: "user", content: prompt }],
        model: "groq/compound-mini",
        response_format: { type: "json_object" }
      });
      let rawContent = completion.choices[0].message.content;
      if (rawContent.startsWith('```json')) {
        rawContent = rawContent.replace(/^```json\n/, '').replace(/\n```$/, '');
      }
      const aiDecision = JSON.parse(rawContent);
      console.log(`🤖 AI Decision: ${aiDecision.strategy} -> ${aiDecision.reasoning}`);

      // 3. Write intent to Outbox (Fault-Tolerant Execution)
      // Instead of calling Razorpay directly (which can fail mid-flight),
      // we write a PENDING action to the Outbox. The dispatcher will process it.
      const crypto = require('crypto');
      const idempotencyKey = crypto.randomUUID();

      await require('../db').Outbox.create({
        idempotency_key: idempotencyKey,
        case_id: recoveryCase.id,
        action_type: 'create_payment_link',
        payload: {
          amount: order.amount,
          currency: "INR",
          description: `Complete your order: ${order.receipt}`,
          customer: {
            name: "Test Customer",
            email: "test@example.com",
            contact: "+919876543210"
          },
          notify: { sms: false, email: false },
          expire_by: Math.floor(Date.now() / 1000) + (7 * 86400),
          notes: {
            channel: 'sms',
            message_sent: aiDecision.message,
            llm_reasoning: aiDecision.reasoning
          }
        }
      });
      console.log(`📦 Wrote recovery intent to Outbox (Key: ${idempotencyKey})`);

      await recoveryCase.update({ status: 'open' });
    }
  } catch (error) {
    console.error("Error processing checkouts:", error);
  }
};

module.exports = { processAbandonedCheckouts };
