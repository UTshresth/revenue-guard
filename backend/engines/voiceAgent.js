const Groq = require('groq-sdk');
const groqClient = new Groq({ apiKey: process.env.GROQ_API_KEY });
const { Case } = require('../db');

// Engine 6: Voice Agent (Script Generator)
const generateVoiceScript = async (caseId, callContext = '', language = 'Hinglish') => {
  try {
    const c = await Case.findByPk(caseId);
    if (!c) throw new Error('Case not found');

    const contextLine = callContext
      ? `\n\nAdditional context / instructions for this specific call:\n${callContext}`
      : '';

    const langInstruction = language.toLowerCase() === 'english'
      ? `Generate a polite, professional script in clear English.`
      : `Generate a polite, professional script in "Hinglish" (Hindi written in English alphabet mixed with English words). It should sound natural for an Indian customer.`;

    const prompt = `You are an AI voice agent calling a customer on behalf of a SaaS company. 
The customer has an overdue payment of ₹${c.amount_at_risk / 100} for a "${c.type.replace(/_/g, ' ')}".
${contextLine}

${langInstruction} Incorporate any specific context or instructions above.

Return ONLY JSON:
{
  "script": "The text to be spoken by the TTS engine",
  "english_translation": "What it means in pure English",
  "tone": "polite / firm / urgent"
}`;

    const completion = await groqClient.chat.completions.create({
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
  } catch (error) {
    console.error("Voice Agent Error:", error.message);
    return {
      script: "Namaste, yeh call RevenueGuard ki taraf se hai. Aapka payment pending hai. Kripya apna dashboard check karein aur payment complete karein. Dhanyawad.",
      english_translation: "Hello, this call is from RevenueGuard. Your payment is pending. Please check your dashboard and complete the payment. Thank you.",
      tone: "polite"
    };
  }
};

module.exports = { generateVoiceScript };
