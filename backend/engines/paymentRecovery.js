const razorpay = require('../razorpay/client');
const { analyzePaymentFailure } = require('../ai/classifier');
const { Case, AuditTrail } = require('../db');
const { checkCompliance } = require('../compliance/rules');

// Engine 1: Payment Degradation Recovery
const handlePaymentFailed = async (paymentData) => {
  // 1. Create a tracking case
  const recoveryCase = await Case.create({
    id: `RG-${Date.now()}`,
    type: 'payment_degradation',
    razorpay_entity_id: paymentData.id,
    amount_at_risk: paymentData.amount,
    customer_contact: paymentData.contact,
    customer_email: paymentData.email
  });

  // 2. AI analyzes root cause and strategy
  const diagnosis = await analyzePaymentFailure(paymentData);
  
  // Log AI decision
  await AuditTrail.create({
    case_id: recoveryCase.id,
    action: 'ai_diagnosis',
    llm_reasoning: JSON.stringify(diagnosis)
  });

  // 3. Compliance Check
  const compliance = await checkCompliance(recoveryCase.id, diagnosis);
  if (!compliance.allowed) {
    await recoveryCase.update({ status: 'escalated' });
    await AuditTrail.create({
      case_id: recoveryCase.id,
      action: 'compliance_block',
      is_violation: true,
      message_sent: compliance.reason
    });
    return { status: 'blocked', reason: compliance.reason };
  }

  // 4. Execute Action (Create Payment Link)
  // For safety in test mode, we only generate the link if requested
  if (diagnosis.channel !== 'silent') {
    const paymentLink = await razorpay.paymentLink.create({
      amount: paymentData.amount,
      currency: "INR",
      description: `Recovery for Order #${paymentData.order_id}`,
      customer: {
        email: paymentData.email,
        contact: paymentData.contact
      },
      notify: { sms: true, email: true }, // Razorpay auto-sends
      expire_by: Math.floor(Date.now() / 1000) + (7 * 86400) // 7 days
    });

    await AuditTrail.create({
      case_id: recoveryCase.id,
      action: 'payment_link_created',
      channel: diagnosis.channel,
      message_sent: diagnosis.personalized_message,
      payment_link_id: paymentLink.id,
      payment_link_url: paymentLink.short_url
    });

    return { status: 'recovery_initiated', link: paymentLink.short_url };
  }

  return { status: 'silent_retry_scheduled', delay: diagnosis.wait_hours };
};

module.exports = {
  handlePaymentFailed
};
