const razorpay = require('../razorpay/client');
const { Case, AuditTrail } = require('../db');
const Groq = require('groq-sdk');
const groqClient = new Groq({ apiKey: process.env.GROQ_API_KEY });

// Engine 4: Invoice Chasing
// Scans Razorpay for overdue/issued invoices and sends AI-crafted follow-ups
const processOverdueInvoices = async () => {
  console.log("📄 Scanning Razorpay for overdue invoices...");

  try {
    const invoices = await razorpay.invoices.all({ count: 10 });
    
    // Filter for invoices that are issued but not paid
    const overdueInvoices = (invoices.items || []).filter(
      inv => inv.status === 'issued' && inv.amount_due > 0
    );
    console.log(`Found ${overdueInvoices.length} overdue invoices.`);

    for (const inv of overdueInvoices) {
      // Skip if we already have a case for this invoice
      const existingCase = await Case.findOne({
        where: { razorpay_entity_id: inv.id }
      });
      if (existingCase) continue;

      console.log(`\nProcessing Invoice: ${inv.id} | Due: ₹${inv.amount_due / 100}`);

      // 1. Create tracking case
      const recoveryCase = await Case.create({
        id: `RG-INV-${Date.now()}`,
        type: 'invoice_overdue',
        razorpay_entity_id: inv.id,
        amount_at_risk: inv.amount_due,
        customer_name: inv.customer_details?.name || 'B2B Client',
        customer_email: inv.customer_details?.email,
        customer_contact: inv.customer_details?.contact
      });

      // 2. AI decides escalation strategy
      const prompt = `You are an AI accounts-receivable agent for a B2B SaaS company.
An invoice for ₹${inv.amount_due / 100} to "${inv.customer_details?.name || 'Unknown'}" is overdue.
Invoice description: "${inv.description || 'N/A'}"

Decide the best follow-up approach. Return JSON:
- escalation_level: "gentle_reminder", "formal_notice", or "escalate_to_human"
- channel: "email", "sms", or "whatsapp"
- message: A professional follow-up message (under 200 chars)
- reasoning: Why you chose this approach`;

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
      console.log(`🤖 AI: ${aiDecision.escalation_level} -> ${aiDecision.reasoning}`);

      // 3. Create a payment link for quick settlement
      const paymentLink = await razorpay.paymentLink.create({
        amount: inv.amount_due,
        currency: "INR",
        description: `Invoice settlement: ${inv.id}`,
        customer: {
          name: inv.customer_details?.name || "Client",
          email: inv.customer_details?.email || "client@example.com",
          contact: inv.customer_details?.contact || "+919876543210"
        },
        notify: { sms: false, email: false },
        expire_by: Math.floor(Date.now() / 1000) + (7 * 86400)
      });
      console.log(`✅ Invoice Recovery Link: ${paymentLink.short_url}`);

      // 4. Log everything
      await AuditTrail.create({
        case_id: recoveryCase.id,
        action: 'payment_link_created',
        channel: aiDecision.channel,
        message_sent: aiDecision.message,
        llm_reasoning: aiDecision.reasoning,
        payment_link_id: paymentLink.id,
        payment_link_url: paymentLink.short_url
      });

      await recoveryCase.update({ status: 'open' });
    }
  } catch (error) {
    console.error("Error processing invoices:", error);
  }
};

module.exports = { processOverdueInvoices };
