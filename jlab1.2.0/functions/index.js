const functions = require("firebase-functions");

const SYSTEM_PROMPT = `
You are a meal-ordering assistant. Your ONLY job is to help the user decide what to eat right now.
If the user goes off-topic, politely steer them back to food ordering.
Ask short follow-up questions until you have: cuisine, budget, dietary restrictions, time, servings, and delivery vs cook.
Once you have enough, produce:
1) A restaurant order summary (dish name, sides, modifications, spice level, drink)
2) A home-cook recipe version (ingredients, steps, time, servings)
3) 3 restaurant suggestions (name, reason, contact method, url)

Always reply in JSON with this exact structure:
{
  "assistantMessage": "string",
  "order": {
    "title": "string",
    "items": ["string"],
    "notes": ["string"]
  },
  "recipe": {
    "title": "string",
    "description": "string",
    "time": "string",
    "servings": number,
    "ingredients": ["string"],
    "steps": ["string"],
    "tips": ["string"],
    "image": "string"
  },
  "restaurants": [
    { "name": "string", "reason": "string", "contact": "string", "url": "string" }
  ]
}
If you still need info, keep order/recipe/restaurants empty but still include the keys.
`;

const OPENAI_URL = "https://api.openai.com/v1/chat/completions";
const MODEL = "gpt-4o-mini";

function setCors(res) {
    res.set("Access-Control-Allow-Origin", "*");
    res.set("Access-Control-Allow-Methods", "POST, OPTIONS");
    res.set("Access-Control-Allow-Headers", "Content-Type, Authorization");
}

exports.aiChat = functions.https.onRequest(async (req, res) => {
    setCors(res);

    if (req.method === "OPTIONS") {
        return res.status(204).send("");
    }

    if (req.method !== "POST") {
        return res.status(405).json({ error: "Method not allowed." });
    }

    const config = functions.config();
    const apiKey = config.openai && config.openai.key;
    if (!apiKey) {
        return res.status(500).json({ error: "AI key not configured." });
    }

    const { messages } = req.body || {};
    if (!Array.isArray(messages)) {
        return res.status(400).json({ error: "Invalid messages payload." });
    }

    const payload = {
        model: MODEL,
        messages: [
            { role: "system", content: SYSTEM_PROMPT.trim() },
            ...messages
        ],
        temperature: 0.7,
        response_format: { type: "json_object" }
    };

    try {
        const response = await fetch(OPENAI_URL, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${apiKey}`
            },
            body: JSON.stringify(payload)
        });

        if (!response.ok) {
            const errorText = await response.text();
            return res.status(502).json({ error: "AI request failed.", details: errorText });
        }

        const data = await response.json();
        const content =
            data.choices &&
            data.choices[0] &&
            data.choices[0].message &&
            data.choices[0].message.content;

        return res.status(200).json({ reply: content || "" });
    } catch (error) {
        return res.status(500).json({ error: "Server error." });
    }
});
