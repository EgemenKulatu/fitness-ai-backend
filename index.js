const express = require('express');
const cors = require('cors');
const axios = require('axios');
require('dotenv').config();


const app = express();
app.use(cors());
app.use(express.json());

app.post('/api/ai-plan', async (req, res) => {
  const { trainingType, age, weight, height } = req.body;

  const prompt = `
User wants to focus on ${trainingType}.
They are ${age} years old, weigh ${weight} kg, and are ${height} cm tall.
Generate a beginner-level weekly workout plan with exercises, sets, and reps.
`;

  try {
    const response = await axios.post(
      'https://openrouter.ai/api/v1/chat/completions',
      {
        model: 'deepseek/deepseek-chat-v3-0324:free',
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

app.listen(3001, () => {
  console.log('✅ Server running at http://localhost:3001');
});
