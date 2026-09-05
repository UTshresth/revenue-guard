require('dotenv').config();
const groq = require('groq-sdk');
const groqClient = new groq({ apiKey: process.env.GROQ_API_KEY });

async function listModels() {
  const models = await groqClient.models.list();
  console.log(models.data.map(m => m.id).join(', '));
}
listModels();
