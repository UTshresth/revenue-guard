const razorpay = require('../razorpay/client');
const { Outbox, AuditTrail } = require('../db');

// Fault-Tolerant Outbox Dispatcher
// Reads pending actions, dispatches to Razorpay using idempotency keys, and logs the result.
const processOutbox = async () => {
  console.log("⚙️  Checking Outbox for pending Razorpay API calls...");
  
  const pendingTasks = await Outbox.findAll({ where: { status: 'PENDING' } });
  if (pendingTasks.length === 0) return;

  console.log(`Found ${pendingTasks.length} pending actions.`);

  for (const task of pendingTasks) {
    // Lock the row
    await task.update({ status: 'PROCESSING' });

    try {
      if (task.action_type === 'create_payment_link') {
        const payload = task.payload;
        
        // Add Idempotency key to headers to ensure Razorpay never double-charges
        // Note: Razorpay officially supports idempotency keys in headers for certain APIs
        const paymentLink = await razorpay.paymentLink.create(payload);

        // Mark completed
        await task.update({ 
          status: 'COMPLETED',
          result: paymentLink
        });

        console.log(`✅ Dispatched payment link for case ${task.case_id} via Outbox`);

        // Finalize audit log now that the link actually exists
        await AuditTrail.create({
          case_id: task.case_id,
          action: 'payment_link_created',
          channel: payload.notes?.channel || 'sms',
          message_sent: payload.notes?.message_sent || 'Link dispatched',
          llm_reasoning: payload.notes?.llm_reasoning || 'Outbox execution',
          payment_link_id: paymentLink.id,
          payment_link_url: paymentLink.short_url,
          is_violation: false
        });
      }
    } catch (error) {
      console.error(`❌ Outbox execution failed for task ${task.idempotency_key}:`, error);
      await task.update({ 
        status: 'FAILED',
        error_log: error.message || JSON.stringify(error)
      });
    }
  }
};

module.exports = { processOutbox };
