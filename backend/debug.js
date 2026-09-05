require('dotenv').config();
const razorpay = require('./razorpay/client');

async function checkLinks() {
  const links = await razorpay.paymentLink.all({ count: 10 });
  for (let link of links.payment_links) {
    if (link.amount_paid > 0) {
      console.log(`PAID LINK -> ID: ${link.id}, Status: ${link.status}, Amount Paid: ${link.amount_paid}`);
    }
  }
}

checkLinks();
