const express = require('express');
const OpenAI = require('openai');
const cors = require('cors');
require('dotenv').config();

// Validate GitHub PAT
const apiKey = process.env.GITHUB_TOKEN;
if (!apiKey || !apiKey.startsWith('ghp_')) {
  console.error('Invalid GitHub PAT format. Must start with "ghp-"');
  process.exit(1);
}

const app = express();
const port = 5000;

app.use(cors());
app.use(express.json());

// Configure OpenAI client
const client = new OpenAI({
  apiKey: process.env.GITHUB_TOKEN,
  baseURL: "https://models.inference.ai.azure.com"
});

// Helper function to clean response and extract JSON
const extractJSON = (text) => {
  try {
    // Remove markdown code blocks if present
    const jsonStr = text.replace(/```json\n|\n```/g, '').trim();
    return JSON.parse(jsonStr);
  } catch (error) {
    console.error('JSON extraction failed:', error);
    throw new Error('Invalid JSON format in response');
  }
};

app.post('/generate-feedback', async (req, res) => {
  const { fileContent, subject, systemPrompt } = req.body;

  try {
    const feedbackResponse = await client.chat.completions.create({
      messages: [
        { 
          role: "system", 
          content: `${systemPrompt} Important: Return only valid JSON without markdown code blocks.` 
        },
        { role: "user", content: fileContent }
      ],
      model: "gpt-4o",
      temperature: 0.7,
      max_tokens: 1000
    });

    const responseContent = feedbackResponse.choices[0].message.content;
    console.log('Raw response:', responseContent);

    const feedbackData = extractJSON(responseContent);
    console.log('Parsed feedback:', feedbackData);

    res.json(feedbackData);
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ 
      error: 'Error generating feedback',
      details: error.message 
    });
  }
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});