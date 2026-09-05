const twilio = require('twilio');
require('dotenv').config();

const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
const twilioNumber = process.env.TWILIO_PHONE_NUMBER; 
const targetNumber = process.env.TARGET_PHONE_NUMBER;

// ──────────────────────────────────
// Store the latest script so our /api/twiml endpoint can serve it
// ──────────────────────────────────
let pendingScript = 'Hello, this is RevenueGuard AI calling about your pending payment.';

const setPendingScript = (text) => {
  pendingScript = text;
};

const getPendingScript = () => pendingScript;

// ──────────────────────────────────
// SMS 
// ──────────────────────────────────
const sendWhatsAppMessage = async (message) => {
  try {
    console.log(`📱 Sending SMS to ${targetNumber}...`);
    
    // Attempting to send the raw AI script as requested.
    // Note: If this is an Indian (+91) number on a Trial account, Twilio might block this due to TRAI DLT regulations.
    const response = await client.messages.create({
      body: message.substring(0, 1600), // Twilio max length is 1600 chars
      from: twilioNumber,
      to: targetNumber,
    });
    console.log(`✅ SMS sent successfully! SID: ${response.sid}`);
    return response.sid;
  } catch (error) {
    console.error(`❌ Failed to send SMS:`, error.message);
    throw error;
  }
};

// ──────────────────────────────────
// Voice Call - uses stable localhost.run tunnel
// ──────────────────────────────────
const makeVoiceCall = async (scriptText) => {
  try {
    console.log(`📞 Calling ${targetNumber}...`);
    console.log(`📝 Script: "${scriptText.substring(0, 100)}..."`);
    
    setPendingScript(scriptText);
    
    // Using a rock-solid, persistent localhost.run SSH tunnel we started in the background
    const twimlUrl = 'https://a2be1a1efbfcce.lhr.life/api/twiml';
    
    const response = await client.calls.create({
      url: twimlUrl,
      to: targetNumber,
      from: twilioNumber
    });
    
    console.log(`✅ Call initiated via Webhook! SID: ${response.sid}`);
    return response.sid;
  } catch (error) {
    console.error(`❌ Failed to make Voice call:`, error);
    throw error;
  }
};

module.exports = { sendWhatsAppMessage, makeVoiceCall, getPendingScript, setPendingScript };
