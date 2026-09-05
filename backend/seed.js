require('dotenv').config();
const razorpay = require('./razorpay/client');

const seedFailures = async () => {
  console.log("Seeding real Razorpay orders in test mode to simulate abandonments...");
  try {
    // We create a few orders that will just sit there (abandoned checkouts)
    const order1 = await razorpay.orders.create({
      amount: 49900,
      currency: "INR",
      receipt: "seed_abandoned_001",
      notes: { scenario: "price_shock" }
    });
    console.log(`Created Abandoned Order: ${order1.id}`);

    const order2 = await razorpay.orders.create({
      amount: 150000,
      currency: "INR",
      receipt: "seed_abandoned_002",
      notes: { scenario: "payment_timeout" }
    });
    console.log(`Created Abandoned Order: ${order2.id}`);

    // Create an invoice (expires in 16 minutes to simulate approaching overdue)
    const expireDate = Math.floor(Date.now() / 1000) + (16 * 60); // 16 minutes from now
    const invoice = await razorpay.invoices.create({
      type: "invoice",
      customer: {
        name: "Test B2B Corp",
        email: "finance@testb2b.com",
        contact: "+919876543210"
      },
      line_items: [{ name: "SaaS License", amount: 500000, currency: "INR" }],
      expire_by: expireDate,
      currency: "INR",
      description: "Seed Invoice (will be overdue in 16 mins)"
    });
    console.log(`Created Invoice: ${invoice.id}`);

    console.log("\n✅ Seeding complete. These entities now exist in your Razorpay test dashboard.");
    console.log("Next: We will run the Recovery Agent to process them.");
  } catch (error) {
    console.error("Error seeding data:", error);
  }
};

seedFailures();
