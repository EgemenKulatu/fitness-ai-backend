const express = require('express');
const cors = require('cors');
const axios = require('axios');
require('dotenv').config();
const fs = require('fs');
const path = require('path');

function readWhitelist() {
  const filePath = path.join(__dirname, 'data', 'whitelist.json');
  try {
    const rawData = fs.readFileSync(filePath, 'utf-8');
    return JSON.parse(rawData);
  } catch (err) {
    console.error('❌ Whitelist read error:', err.message);
    return [];
  }
}



const app = express();
app.use(cors());
app.use(express.json());

app.post('/api/ai-plan', async (req, res) => {
  const { trainingType, age, weight, height } = req.body;

const whitelist = readWhitelist();
const prompt = `
You are generating a fitness program for an app.
Only use exercises from this list: ${whitelist.join(', ')}.
User wants to focus on ${trainingType}.
They are ${age} years old, weigh ${weight} kg, and are ${height} cm tall.
Generate a beginner-level weekly workout plan using only the provided exercise IDs with sets and reps.
Only return the workout plan in a structured format. Do not explain your reasoning or include a thought process.
Format the response like this:
push-ups: 3x8
plank: 3x30s
`;


  try {
    const response = await axios.post(
      'https://openrouter.ai/api/v1/chat/completions',
      {
        model: 'tngtech/deepseek-r1t-chimera:free',
        messages: [
          { role: 'system', content: 'You are a personal fitness coach.' },
          { role: 'user', content: prompt },
        ],
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
          'Content-Type': 'application/json',
        },
      }
    );

    const message = response.data.choices?.[0]?.message?.content;
    res.json({ plan: message });
  } catch (error) {
    console.error(error.response?.data || error.message);
    res.status(500).json({ error: 'AI response failed' });
  }
});

app.listen(3001, '0.0.0.0', () => {
  console.log("✅ Server running at http://localhost:3001");
});
