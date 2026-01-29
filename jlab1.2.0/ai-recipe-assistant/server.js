const path = require("path");
const express = require("express");
const dotenv = require("dotenv");

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const OPENAI_MODEL = process.env.OPENAI_MODEL || "gpt-4o-mini";

app.use(express.json({ limit: "1mb" }));
app.use(express.static(path.join(__dirname)));

app.post("/api/recipe", async (req, res) => {
  if (!OPENAI_API_KEY) {
    res.status(500).json({ message: "Missing OPENAI_API_KEY in .env" });
    return;
  }

  const prompt = req.body?.prompt?.trim();
  const surprise = Boolean(req.body?.surprise);
  const userPrompt = surprise
    ? "Surprise me with a delicious recipe."
    : prompt;

  if (!userPrompt) {
    res.status(400).json({ message: "Prompt is required." });
    return;
  }

  try {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: OPENAI_MODEL,
        temperature: 0.7,
        response_format: { type: "json_object" },
        messages: [
          {
            role: "system",
            content:
              "You are an AI chef. Return a JSON object with keys: name, description, servings, time, tags (array), ingredients (array of strings), steps (array of strings), tips (array of strings), image (short food description)."
          },
          {
            role: "user",
            content: `Create a recipe for: ${userPrompt}`
          }
        ]
      })
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      res.status(response.status).json({
        message: error.error?.message || "OpenAI request failed."
      });
      return;
    }

    const data = await response.json();
    const raw = data.choices?.[0]?.message?.content || "{}";
    const recipe = JSON.parse(raw);

    if (recipe.image && typeof recipe.image === "string") {
      recipe.image = `https://source.unsplash.com/featured/?${encodeURIComponent(
        recipe.image
      )}`;
    }

    res.json({ recipe });
  } catch (error) {
    res.status(500).json({ message: "Server error while generating recipe." });
  }
});

app.post("/api/chat", async (req, res) => {
  if (!OPENAI_API_KEY) {
    res.status(500).json({ message: "Missing OPENAI_API_KEY in .env" });
    return;
  }

  const messages = Array.isArray(req.body?.messages) ? req.body.messages : [];
  if (!messages.length) {
    res.status(400).json({ message: "Messages are required." });
    return;
  }

  try {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: OPENAI_MODEL,
        temperature: 0.6,
        messages: [
          {
            role: "system",
            content:
              "You are a friendly cooking assistant. Answer with concise tips and recommendations."
          },
          ...messages
        ]
      })
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      res.status(response.status).json({
        message: error.error?.message || "OpenAI request failed."
      });
      return;
    }

    const data = await response.json();
    const reply = data.choices?.[0]?.message?.content || "";
    res.json({ reply });
  } catch (error) {
    res.status(500).json({ message: "Server error while chatting." });
  }
});

app.listen(PORT, () => {
  console.log(`AI Recipe Assistant running on http://localhost:${PORT}`);
});
