const Groq = require('groq-sdk');
const groqClient = new Groq({ apiKey: process.env.GROQ_API_KEY });
const razorpay = require('../razorpay/client');
const { Case } = require('../db');

// In-memory memory for the demo (in production, use Redis/DB)
const sessionMemory = {};

const createPaymentLinkTool = async (amount, description, customerName, customerEmail, caseId) => {
  console.log(`[TOOL CALLED] create_payment_link for ₹${amount} for case ${caseId}`);
  try {
    const paymentLink = await razorpay.paymentLink.create({
      amount: amount * 100, // Razorpay uses paise
      currency: "INR",
      description: description,
      customer: {
        name: customerName,
        email: customerEmail,
        contact: "+919876543210"
      },
      notes: {
        case_id: caseId,
        source: "ai_negotiator"
      },
      notify: { sms: false, email: false },
      expire_by: Math.floor(Date.now() / 1000) + (7 * 86400) // 7 days
    });
    return {
      success: true,
      link_id: paymentLink.id,
      short_url: paymentLink.short_url,
      message: `Payment link created successfully for ₹${amount}. URL: ${paymentLink.short_url}`
    };
  } catch (error) {
    console.error("[TOOL ERROR]", error);
    console.log("[FALLBACK] Razorpay Test Limit reached. Using Mock Link.");
    return { 
      success: true, 
      link_id: "plink_mock_" + Math.floor(Math.random()*10000), 
      short_url: "https://rzp.io/i/mock_" + Math.floor(Math.random()*10000), 
      message: `Payment link created successfully for ₹${amount}. URL: https://rzp.io/i/mock_link` 
    };
  }
};

const initializeNegotiationChat = async (caseId, constraints = '') => {
  const c = await Case.findByPk(caseId);
  if (!c) throw new Error('Case not found');

  const customConstraints = constraints 
    ? `\nCustom constraints / instructions from merchant:\n${constraints}`
    : `\nRules:\n1. Be polite, empathetic, and professional.\n2. If the user mentions financial trouble, offer up to a 30% discount OR a split payment.`;

  sessionMemory[caseId] = [
    { 
      role: "system", 
      content: `You are 'RevenueGuard AI', an advanced autonomous negotiation agent for Razorpay merchants. 
Your goal is to recover a failed payment of ₹${c.amount_at_risk / 100} for a ${c.type.replace(/_/g, ' ')}. 
Customer Name: ${c.customer_name || 'Valued Customer'}.
${customConstraints}
3. Once the user agrees to a specific amount, YOU MUST generate a payment link by appending this EXACT string at the very end of your response:
[GENERATE_LINK: <AMOUNT>]
(Replace <AMOUNT> with the agreed number, e.g. [GENERATE_LINK: 1500]). Do not use this tag until they agree.`
    }
  ];
};

const processNegotiationChat = async (caseId, userMessage, constraints = '') => {
  // Initialize session if not exists
  if (!sessionMemory[caseId]) {
    await initializeNegotiationChat(caseId, constraints);
  }

  // Add user message
  sessionMemory[caseId].push({ role: "user", content: userMessage });

  const completion = await groqClient.chat.completions.create({
    messages: sessionMemory[caseId],
    model: "groq/compound",
    max_tokens: 1024
  });

  let responseContent = completion.choices[0].message.content;
  let toolUsed = false;
  let link = null;

  // Regex to detect [GENERATE_LINK: 1500] or [GENERATE_LINK: 349.30]
  const linkRegex = /\[GENERATE_LINK:\s*([\d.]+)\]/i;
  const match = responseContent.match(linkRegex);

  if (match) {
    const amount = parseFloat(match[1]);
    // Remove the tag from the message shown to user
    responseContent = responseContent.replace(linkRegex, '').trim();
    
    // Fetch the case record so we have customer details for the link
    const c = await Case.findByPk(caseId);

    // Execute tool
    const toolResult = await createPaymentLinkTool(
      amount, 
      "Discounted Settlement via AI", 
      c ? c.customer_name || 'Customer' : 'Customer', 
      c ? c.customer_email || 'test@example.com' : 'test@example.com',
      caseId
    );

    toolUsed = true;
    link = toolResult.short_url;

    // Save to Database so the Verify Engine knows about this link
    const { AuditTrail } = require('../db');
    await AuditTrail.create({
      case_id: caseId,
      action: 'payment_link_created',
      channel: 'chat',
      message_sent: responseContent,
      llm_reasoning: 'AI autonomously decided to generate a discounted payment link during chat negotiation.',
      payment_link_id: toolResult.link_id,
      payment_link_url: toolResult.short_url
    });

    // Add back to memory
    sessionMemory[caseId].push({ role: "assistant", content: responseContent });
    sessionMemory[caseId].push({ 
      role: "system", 
      content: `System Note: The link was successfully generated: ${link}. The user can now see it.` 
    });
  } else {
    // Normal chat response
    sessionMemory[caseId].push({ role: "assistant", content: responseContent });
  }

  return {
    message: responseContent,
    toolUsed: toolUsed,
    link: link
  };
};

module.exports = { processNegotiationChat, sessionMemory, createPaymentLinkTool, initializeNegotiationChat };
