const { verifyPaymentLinks } = require('./engines/verifyRecovery');

async function test() {
  const result = await verifyPaymentLinks();
  console.log("RESULT:", result);
}

test();
