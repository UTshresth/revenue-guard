const razorpay = require('../razorpay/client');
const { Case, AuditTrail } = require('../db');

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

const verifyPaymentLinks = async () => {
  console.log("🔍 Verifying status of sent Payment Links...");
  
  try {
    // 1. Find all open cases
    const openCases = await Case.findAll({ where: { status: 'open' } });
    let recoveredCount = 0;

    for (const c of openCases) {
      // 2. Find the associated payment link ID from the AuditTrail
      const audit = await AuditTrail.findOne({
        where: { case_id: c.id, action: 'payment_link_created' },
        order: [['createdAt', 'DESC']]
      });

      if (audit && audit.payment_link_id) {
        await sleep(300); // Prevent Razorpay 429 Rate Limit
        try {
          // 3. Check the real status in Razorpay via API
          const link = await razorpay.paymentLink.fetch(audit.payment_link_id);
          
          if (link.status === 'paid') {
            console.log(`✅ Case ${c.id} was PAID! Recovered ₹${link.amount_paid / 100}`);
            
            // 4. Update the Database
            await c.update({
              status: 'recovered',
              recovered_amount: link.amount_paid,
              recovered_at: new Date()
            });
            
            // Log the successful recovery
            await AuditTrail.create({
              case_id: c.id,
              action: 'payment_recovered',
              message_sent: 'Customer completed payment via recovery link.'
            });
            
            recoveredCount++;
          } else {
            console.log(`⏳ Case ${c.id} is still pending (Link Status: ${link.status})`);
          }
        } catch (linkError) {
          console.error(`⚠️ Failed to fetch link ${audit.payment_link_id} for case ${c.id}:`, linkError);
        }
      }
    }
    
    return { success: true, recoveredCount };
  } catch (error) {
    console.error("Error verifying payment links:", error);
    throw error;
  }
};

module.exports = { verifyPaymentLinks };
