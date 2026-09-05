const razorpay = require('../razorpay/client');
const { Case, AuditTrail } = require('../db');
const Groq = require('groq-sdk');
const groqClient = new Groq({ apiKey: process.env.GROQ_API_KEY });

// Engine 3: Subscription Churn Prevention
// Detects subscriptions that are halted/pending and tries to re-engage
const processSubscriptionChurn = async () => {
  console.log("🔄 Scanning Razorpay for at-risk subscriptions...");

  try {
    // Fetch subscriptions — look for ones that are halted or pending
    const subscriptions = await razorpay.subscriptions.all({ count: 10 });

    const atRiskSubs = (subscriptions.items || []).filter(
      sub => sub.status === 'halted' || sub.status === 'pending'
    );
    console.log(`Found ${atRiskSubs.length} at-risk subscriptions.`);

    for (const sub of atRiskSubs) {
      // Skip if already tracked
      const existingCase = await Case.findOne({
        where: { razorpay_entity_id: sub.id }
      });
      if (existingCase) continue;

      const amount = sub.current_end ? (sub.total_count * 100) : 0; // estimate
      console.log(`\nProcessing Subscription: ${sub.id} | Status: ${sub.status}`);

      // 1. Create tracking case
      const recoveryCase = await Case.create({
        id: `RG-SUB-${Date.now()}`,
        type: 'subscription_churn',
        razorpay_entity_id: sub.id,
        amount_at_risk: amount || 99900, // fallback estimate
      });

      // 2. AI generates save ladder strategy
      const prompt = `You are a SaaS retention specialist AI.
A subscription (ID: ${sub.id}) has status "${sub.status}".
The customer's payment method likely failed or they chose to cancel.

Generate a "save ladder" — a multi-step win-back approach.
Return JSON:
- step_1: { action: string, message: string } (immediate, e.g. payment method update nudge)
- step_2: { action: string, message: string } (after 24h, e.g. offer discount)
- step_3: { action: string, message: string } (after 72h, e.g. last chance)
- reasoning: Why you designed this ladder
- risk_level: "low", "medium", or "high"`;

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
      console.log(`🤖 AI Save Ladder: Risk=${aiDecision.risk_level}`);

      // 3. Log the AI strategy
      await AuditTrail.create({
        case_id: recoveryCase.id,
        action: 'save_ladder_generated',
        channel: 'multi',
        message_sent: aiDecision.step_1?.message || 'Update your payment method',
        llm_reasoning: JSON.stringify(aiDecision)
      });

      await recoveryCase.update({ status: 'open' });
    }
  } catch (error) {
    console.error("Error processing subscriptions:", error);
  }
};

module.exports = { processSubscriptionChurn };
