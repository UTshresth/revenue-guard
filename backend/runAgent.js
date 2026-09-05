require('dotenv').config();
const { syncDb } = require('./db');
const { processAbandonedCheckouts } = require('./engines/checkoutRecovery');

const runAgent = async () => {
  console.log("🚀 Starting RevenueGuard Recovery Agent...");
  
  // Ensure DB is synced before running
  await syncDb();
  
  // Run Engine 2 (Checkout drop-off)
  await processAbandonedCheckouts();

  console.log("\n🏁 Agent run complete! Check your database or the Razorpay Dashboard to see the newly generated Payment Links.");
  process.exit(0);
};

runAgent();
