// backend/server.js

import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import OpenAI from "openai";

dotenv.config(); // Load API key from .env

const app = express();
app.use(cors()); // Allow frontend to make requests
app.use(express.json()); // Parse JSON requests

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// POST /api/chat endpoint
app.post("/api/chat", async (req, res) => {
  try {
    const { message } = req.body;

    if (!message) {
      return res.status(400).json({ error: "Message is required" });
    }

    // Send user message to OpenAI
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: message }],
    });

    const aiReply = completion.choices[0].message.content;

    res.json({ reply: aiReply });

  } catch (error) {
    console.error("AI Error:", error);
    res.status(500).json({ error: "Failed to get AI response" });
  }
});

// Start backend server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Backend running on http://localhost:${PORT}`);
});
