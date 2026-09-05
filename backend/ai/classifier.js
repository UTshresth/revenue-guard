require('dotenv').config();
const Groq = require('groq-sdk');

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

const analyzePaymentFailure = async (failureData) => {
  const prompt = `You are an AI revenue recovery expert.
Analyze the following Razorpay payment failure and provide a recovery strategy.
Respond strictly in JSON format with these fields:
- root_cause (string: plain explanation of why it failed)
- category (string: 'soft_decline', 'hard_decline', 'transient', or 'config_error')
- recovery_strategy (string: 'wait_and_nudge', 'immediate_retry', 'update_method', 'silent_retry')
- channel (string: 'sms', 'email', 'whatsapp', 'silent')
- wait_hours (number: how long to wait before reaching out)
- personalized_message (string: a short, polite recovery message under 150 chars)
- reasoning (string: brief explanation of your decision)

Failure Data:
${JSON.stringify(failureData, null, 2)}`;

  const completion = await groq.chat.completions.create({
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
  return JSON.parse(rawContent);
};

module.exports = {
  analyzePaymentFailure
};
