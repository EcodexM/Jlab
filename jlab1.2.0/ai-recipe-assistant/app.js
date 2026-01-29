const chatWindow = document.getElementById("chatWindow");
const chatInput = document.getElementById("chatInput");
const sendBtn = document.getElementById("sendBtn");
const orderSummary = document.getElementById("orderSummary");
const recipeTitle = document.getElementById("recipeTitle");
const recipeMeta = document.getElementById("recipeMeta");
const ingredientsList = document.getElementById("ingredientsList");
const stepsList = document.getElementById("stepsList");
const tipsBlock = document.getElementById("tipsBlock");
const statusMessage = document.getElementById("statusMessage");
const recipeImage = document.getElementById("recipeImage");
const restaurantList = document.getElementById("restaurantList");
const aiStatus = document.getElementById("aiStatus");
const chipButtons = Array.from(document.querySelectorAll(".chip"));
const subscriptionPanel = document.getElementById("subscriptionPanel");

const API_ENDPOINT = "/api/chat";
const DEFAULT_RECIPE_IMAGE =
    "https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=1100&q=80";
const MAX_HISTORY = 12;

let chatHistory = [];

function setAiStatus(state, detail) {
    const label = detail ? `AI: ${state} • ${detail}` : `AI: ${state}`;
    aiStatus.textContent = label;
}

function setRecipeImage(src, altText) {
    recipeImage.onerror = null;
    recipeImage.src = src;
    recipeImage.alt = altText || "Recipe image";
    recipeImage.onerror = () => {
        recipeImage.onerror = null;
        recipeImage.src = DEFAULT_RECIPE_IMAGE;
        recipeImage.alt = "Recipe image";
    };
}

function pushChatMessage(text, isUser) {
    const bubble = document.createElement("div");
    bubble.className = `chat-message ${isUser ? "chat-user" : "chat-assistant"}`;
    bubble.textContent = text;
    chatWindow.appendChild(bubble);
    chatWindow.scrollTop = chatWindow.scrollHeight;
}

function setBusy(isBusy) {
    sendBtn.disabled = isBusy;
    chatInput.disabled = isBusy;
    chipButtons.forEach((button) => {
        button.disabled = isBusy;
    });
}

function renderOrderSummary(order) {
    if (!order || (!order.title && !order.items?.length)) {
        orderSummary.innerHTML = "<p class=\"muted\">Order summary will appear here.</p>";
        return;
    }

    const items = (order.items || []).map((item) => `<li>${item}</li>`).join("");
    const notes = (order.notes || []).map((item) => `<li>${item}</li>`).join("");

    orderSummary.innerHTML = `
    <h3>${order.title || "Your order"}</h3>
    ${items ? `<h4>Items</h4><ul class="list">${items}</ul>` : ""}
    ${notes ? `<h4>Notes</h4><ul class="list">${notes}</ul>` : ""}
  `;
}

function renderRecipe(recipe) {
    if (!recipe || !recipe.title) {
        recipeTitle.textContent = "Awaiting your conversation";
        recipeMeta.textContent = "The assistant will craft a recipe based on your order.";
        ingredientsList.innerHTML = "";
        stepsList.innerHTML = "";
        tipsBlock.textContent = "";
        setRecipeImage(DEFAULT_RECIPE_IMAGE, "Recipe preview");
        return;
    }

    recipeTitle.textContent = recipe.title;
    recipeMeta.textContent = `${recipe.description || "Recipe details"} • ${recipe.time || "30 mins"
        } • Serves ${recipe.servings || 2}`;
    setRecipeImage(recipe.image || DEFAULT_RECIPE_IMAGE, recipe.title);
    ingredientsList.innerHTML = (recipe.ingredients || [])
        .map((item) => `<li>${item}</li>`)
        .join("");
    stepsList.innerHTML = (recipe.steps || [])
        .map((step) => `<li>${step}</li>`)
        .join("");
    tipsBlock.textContent = (recipe.tips || []).join(" ");
}

function renderRestaurants(restaurants) {
    if (!restaurants || !restaurants.length) {
        restaurantList.innerHTML =
            "<p class=\"muted\">Restaurants will be suggested after your order is created.</p>";
        return;
    }

    restaurantList.innerHTML = restaurants
        .map(
            (item) => `
      <div class="restaurant-card">
        <h4>${item.name || "Restaurant"}</h4>
        <p class="muted">${item.reason || ""}</p>
        ${item.contact ? `<p>Contact: ${item.contact}</p>` : ""}
        ${item.url
                    ? `<a href="${item.url}" target="_blank" rel="noopener">Open website</a>`
                    : ""
                }
      </div>
    `
        )
        .join("");
}

function showSubscriptionPanel() {
    if (!subscriptionPanel) return;
    subscriptionPanel.classList.remove("hidden");
    subscriptionPanel.scrollIntoView({ behavior: "smooth", block: "start" });
}

function parseAiPayload(payload) {
    if (!payload) {
        return { assistantMessage: "No response received." };
    }

    if (typeof payload === "object") {
        return payload;
    }

    const codeMatch = payload.match(/```json([\s\S]*?)```/i);
    if (codeMatch) {
        try {
            return JSON.parse(codeMatch[1].trim());
        } catch (error) {
            return { assistantMessage: payload };
        }
    }

    try {
        return JSON.parse(payload);
    } catch (error) {
        return { assistantMessage: payload };
    }
}

async function requestChatFromApi(messages) {
    const response = await fetch(API_ENDPOINT, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages })
    });

    if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        const err = new Error(error.error || error.message || "Chat request failed.");
        err.code = error.code;
        err.details = error.details;
        throw err;
    }

    const payload = await response.json();
    return payload.reply || payload.message || payload;
}

async function handleSendMessage(text) {
    if (!text) return;

    pushChatMessage(text, true);
    chatInput.value = "";
    statusMessage.textContent = "Thinking...";
    setBusy(true);

    try {
        const history = [...chatHistory, { role: "user", content: text }].slice(
            -MAX_HISTORY
        );
        const reply = await requestChatFromApi(history);
        const parsed = parseAiPayload(reply);

        pushChatMessage(parsed.assistantMessage || "Got it! Tell me more.", false);

        chatHistory = [
            ...chatHistory,
            { role: "user", content: text },
            { role: "assistant", content: parsed.assistantMessage || "" }
        ].slice(-MAX_HISTORY);

        renderOrderSummary(parsed.order || {});
        renderRecipe(parsed.recipe || {});
        renderRestaurants(parsed.restaurants || []);
        setAiStatus("Connected");
    } catch (error) {
        if (error.code === "LIMIT_REACHED") {
            pushChatMessage(
                "You've reached the free limit. Please subscribe to continue.",
                false
            );
            showSubscriptionPanel();
            setAiStatus("Limit reached");
        } else {
            pushChatMessage("AI request failed. Please try again.", false);
            setAiStatus("Error", "Check /api/chat");
        }
    } finally {
        statusMessage.textContent = "";
        setBusy(false);
    }
}

sendBtn.addEventListener("click", () => {
    handleSendMessage(chatInput.value.trim());
});

chatInput.addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
        sendBtn.click();
    }
});

chipButtons.forEach((button) => {
    button.addEventListener("click", () => {
        handleSendMessage(button.dataset.prompt || "");
    });
});

setAiStatus("Ready");
renderOrderSummary({});
renderRecipe({});
renderRestaurants([]);
pushChatMessage(
    "Tell me what you want to eat right now. I will build your order and recipe.",
    false
);
