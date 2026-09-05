require('dotenv').config();
const razorpay = require('./razorpay/client');

async function testFetch() {
  try {
    const link = await razorpay.paymentLink.fetch('plink_TTCayZipxrnVMZ');
    console.log("Success:", link.status);
  } catch (error) {
    console.error("Error fetching:", error);
  }
}

testFetch();
