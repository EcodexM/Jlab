const functions = require("firebase-functions");
const admin = require("firebase-admin");
const crypto = require("crypto");
const Stripe = require("stripe");

if (!admin.apps.length) {
    admin.initializeApp();
}

const db = admin.firestore();

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
const RECIPE_LIMIT = 3;
const STRIPE_CURRENCY = "usd";

function setCors(res) {
    res.set("Access-Control-Allow-Origin", "*");
    res.set("Access-Control-Allow-Methods", "POST, OPTIONS");
    res.set("Access-Control-Allow-Headers", "Content-Type, Authorization");
}

function getClientIp(req) {
    const forwarded = req.headers["x-forwarded-for"];
    if (forwarded) {
        return forwarded.split(",")[0].trim();
    }
    return req.ip || "unknown";
}

function hashIp(ip) {
    return crypto.createHash("sha256").update(ip).digest("hex");
}

async function getUsage(docRef) {
    const snap = await docRef.get();
    if (!snap.exists) {
        return { count: 0, date: null };
    }
    return snap.data();
}

function getTodayKey() {
    return new Date().toISOString().slice(0, 10);
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

    const ip = getClientIp(req);
    const ipHash = hashIp(ip);
    const usageRef = db.collection("aiRecipeUsage").doc(ipHash);
    const todayKey = getTodayKey();

    try {
        const usage = await getUsage(usageRef);
        const count = usage.date === todayKey ? usage.count || 0 : 0;
        if (count >= RECIPE_LIMIT) {
            return res.status(429).json({
                code: "LIMIT_REACHED",
                error: "LIMIT_REACHED",
                message: "Free recipe limit reached."
            });
        }
    } catch (error) {
        return res.status(500).json({ error: "Usage check failed." });
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
        let shouldCount = false;
        try {
            const parsed = JSON.parse(content || "{}");
            shouldCount = Boolean(parsed.recipe && parsed.recipe.title);
        } catch (error) {
            shouldCount = false;
        }

        if (shouldCount) {
            await usageRef.set(
                {
                    count: admin.firestore.FieldValue.increment(1),
                    date: todayKey,
                    updatedAt: admin.firestore.FieldValue.serverTimestamp()
                },
                { merge: true }
            );
        }

        return res.status(200).json({ reply: content || "" });
    } catch (error) {
        return res.status(500).json({ error: "Server error." });
    }
});

exports.resetUsage = functions.https.onRequest(async (req, res) => {
    setCors(res);

    if (req.method === "OPTIONS") {
        return res.status(204).send("");
    }

    if (req.method !== "POST") {
        return res.status(405).json({ error: "Method not allowed." });
    }

    const config = functions.config();
    const token = config.admin && config.admin.token;
    const provided = req.headers.authorization?.replace("Bearer ", "") || "";
    if (!token || provided !== token) {
        return res.status(403).json({ error: "Unauthorized." });
    }

    try {
        const snapshot = await db.collection("aiRecipeUsage").get();
        const batch = db.batch();
        snapshot.forEach((doc) => batch.delete(doc.ref));
        await batch.commit();
        return res.status(200).json({ ok: true });
    } catch (error) {
        return res.status(500).json({ error: "Reset failed." });
    }
});

exports.createCheckout = functions.https.onRequest(async (req, res) => {
    setCors(res);

    if (req.method === "OPTIONS") {
        return res.status(204).send("");
    }

    if (req.method !== "POST") {
        return res.status(405).json({ error: "Method not allowed." });
    }

    const config = functions.config();
    const stripeKey = config.stripe && config.stripe.secret;
    const priceStarter = config.stripe && config.stripe.price_starter;
    const priceChef = config.stripe && config.stripe.price_chef;
    const priceTeam = config.stripe && config.stripe.price_team;

    if (!stripeKey || !priceStarter || !priceChef || !priceTeam) {
        return res.status(500).json({ error: "Stripe is not configured." });
    }

    const stripe = Stripe(stripeKey);
    const { plan } = req.body || {};

    const priceMap = {
        starter: priceStarter,
        chef: priceChef,
        team: priceTeam
    };

    const priceId = priceMap[plan];
    if (!priceId) {
        return res.status(400).json({ error: "Invalid plan." });
    }

    try {
        const session = await stripe.checkout.sessions.create({
            mode: "subscription",
            line_items: [{ price: priceId, quantity: 1 }],
            success_url: "https://jlab-ebe8d.web.app/ai-recipe-assistant?success=true",
            cancel_url: "https://jlab-ebe8d.web.app/ai-recipe-assistant?canceled=true",
            currency: STRIPE_CURRENCY
        });
        return res.status(200).json({ url: session.url });
    } catch (error) {
        return res.status(500).json({ error: "Checkout failed." });
    }
});
