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

const API_BASE = "";
const DEFAULT_RECIPE_IMAGE =
  "https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=1100&q=80";

let chatHistory = [];

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

function getApiConfig() {
  const base =
    window.AI_RECIPE_API_BASE ||
    localStorage.getItem("AI_RECIPE_API_BASE") ||
    API_BASE;
  return { base };
}

function isAiConfigured() {
  return true;
}

function setAiStatus() {
  aiStatus.textContent = isAiConfigured() ? "AI: Connected" : "AI: Not connected";
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
  recipeMeta.textContent = `${recipe.description || "Recipe details"} • ${recipe.time || "30 mins"} • Serves ${recipe.servings || 2}`;
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
        ${item.url ? `<a href="${item.url}" target="_blank" rel="noopener">Open website</a>` : ""}
      </div>
    `
    )
    .join("");
}

function parseAiPayload(text) {
  if (!text) return { assistantMessage: "No response received." };

  const codeMatch = text.match(/```json([\s\S]*?)```/i);
  if (codeMatch) {
    try {
      return JSON.parse(codeMatch[1].trim());
    } catch (error) {
      return { assistantMessage: text };
    }
  }

  try {
    return JSON.parse(text);
  } catch (error) {
    return { assistantMessage: text };
  }
}

async function requestChatFromApi(messages) {
  const { base } = getApiConfig();
  const endpoint = base ? `${base.replace(/\/$/, "")}/api/chat` : "/api/chat";

  const response = await fetch(endpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ messages })
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.message || "Chat request failed.");
  }

  const payload = await response.json();
  return payload.reply || payload.message || "";
}

function buildChatHistory(userText) {
  const baseMessages = [
    { role: "system", content: SYSTEM_PROMPT.trim() }
  ];
  return [...baseMessages, ...chatHistory, { role: "user", content: userText }];
}

async function handleSendMessage(text) {
  if (!text) return;

  pushChatMessage(text, true);
  chatInput.value = "";
  statusMessage.textContent = "Thinking...";
  setBusy(true);

  try {
    const history = buildChatHistory(text);
    const reply = await requestChatFromApi(history);
    const parsed = parseAiPayload(reply);
    pushChatMessage(parsed.assistantMessage || reply, false);

    chatHistory = [
      ...chatHistory,
      { role: "user", content: text },
      { role: "assistant", content: parsed.assistantMessage || reply }
    ].slice(-12);

    renderOrderSummary(parsed.order || {});
    renderRecipe(parsed.recipe || {});
    renderRestaurants(parsed.restaurants || []);
    statusMessage.textContent = "";
  } catch (error) {
    pushChatMessage("AI request failed. Please try again.", false);
    statusMessage.textContent = "";
  } finally {
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

setAiStatus();
renderOrderSummary({});
renderRecipe({});
renderRestaurants([]);
pushChatMessage(
  "Tell me what you want to eat right now. I will build your order and recipe.",
  false
);

function recipeImageUrl(recipe) {
  if (recipe.image) return recipe.image;
  if (recipe.name) {
    return `https://source.unsplash.com/featured/?${encodeURIComponent(
      `${recipe.name} food`
    )}`;
  }
  return DEFAULT_RECIPE_IMAGE;
}

function getApiConfig() {
  const base =
    window.AI_RECIPE_API_BASE ||
    localStorage.getItem("AI_RECIPE_API_BASE") ||
    API_BASE;
  return { base };
}

function isAiConfigured() {
  const { base } = getApiConfig();
  return Boolean(base);
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

function setBusy(isBusy) {
  generateBtn.disabled = isBusy;
  surpriseBtn.disabled = isBusy;
  sendBtn.disabled = isBusy;
  mealInput.disabled = isBusy;
  chatInput.disabled = isBusy;
}

function titleCase(text) {
  return text
    .split(" ")
    .filter(Boolean)
    .map((word) => word[0].toUpperCase() + word.slice(1))
    .join(" ");
}

function findRecipeByName(query) {
  const lowered = query.toLowerCase();
  return recipes.find((recipe) => lowered.includes(recipe.name.toLowerCase()));
}

function matchHint(query) {
  const lowered = query.toLowerCase();
  return ingredientHints.find((hint) =>
    hint.match.some((word) => lowered.includes(word))
  );
}

function generateRecipeFromPromptFallback(prompt) {
  const matched = findRecipeByName(prompt);
  if (matched) return matched;

  const hint = matchHint(prompt);
  const name = titleCase(prompt.trim() || "Chef's Choice");
  const main = hint ? hint.main : "your favorite protein";
  const flavor = hint ? hint.flavor : "simple herbs and spices";

  return {
    id: `custom-${Date.now()}`,
    name,
    description: `A cozy ${name.toLowerCase()} inspired by ${flavor}.`,
    servings: defaultRecipe.servings,
    time: defaultRecipe.time,
    tags: ["ai-generated"],
    ingredients: [
      `${main}`,
      ...defaultRecipe.ingredients
    ],
    steps: [
      `Season ${main} with salt, pepper, and spices.`,
      ...defaultRecipe.steps
    ],
    tips: [
      `Add a finishing squeeze of citrus to brighten the ${flavor}.`,
      ...defaultRecipe.tips
    ]
  };
}

function renderRecipe(recipe) {
  currentRecipe = recipe;
  recipeTitle.textContent = recipe.name;
  recipeMeta.textContent = `${recipe.description} • ${recipe.time} • Serves ${recipe.servings}`;
  setRecipeImage(recipeImageUrl(recipe), recipe.name);
  ingredientsList.innerHTML = recipe.ingredients
    .map((item) => `<li>${item}</li>`)
    .join("");
  stepsList.innerHTML = recipe.steps.map((step) => `<li>${step}</li>`).join("");
  tipsBlock.textContent = recipe.tips ? recipe.tips.join(" ") : "";
  saveBtn.disabled = false;
  statusMessage.textContent = "";
}

function renderRecipeCards() {
  recipeList.innerHTML = recipes
    .map(
      (recipe) => `
      <div class="card">
        <img src="${recipe.image}" alt="${recipe.name}" />
        <div>
          <h3>${recipe.name}</h3>
          <p>${recipe.description}</p>
          <p class="muted">${recipe.time} • Serves ${recipe.servings}</p>
        </div>
        <button type="button" class="ghost" data-id="${recipe.id}">View recipe</button>
      </div>
    `
    )
    .join("");
}

function pushChatMessage(text, isUser) {
  const bubble = document.createElement("div");
  bubble.className = `chat-message ${isUser ? "chat-user" : "chat-assistant"}`;
  bubble.textContent = text;
  chatWindow.appendChild(bubble);
  chatWindow.scrollTop = chatWindow.scrollHeight;
}

function assistantResponse(message) {
  const lowered = message.toLowerCase();

  if (lowered.includes("recommend") || lowered.includes("suggest")) {
    const suggestion = recipes[Math.floor(Math.random() * recipes.length)];
    return `You might love "${suggestion.name}". It takes about ${suggestion.time}. Want the recipe loaded?`;
  }

  if (lowered.includes("surprise")) {
    const surprise = recipes[Math.floor(Math.random() * recipes.length)];
    renderRecipe(surprise);
    return `Surprise coming up! I loaded "${surprise.name}".`;
  }

  if (lowered.includes("substitute") || lowered.includes("replace")) {
    return "Tell me the ingredient you want to swap and I will suggest alternatives.";
  }

  const hint = matchHint(message);
  if (hint) {
    const pick = recipes.find((recipe) =>
      recipe.tags.some((tag) => tag.includes(hint.main))
    );
    if (pick) {
      return `If you like ${hint.main}, try "${pick.name}". It pairs well with ${hint.flavor}.`;
    }
  }

  return "I can help with substitutions, timing, or ideas. What are you cooking?";
}

async function requestRecipeFromApi(prompt, isSurprise) {
  const { base, key } = getApiConfig();
  if (!base) {
    throw new Error("AI_NOT_CONFIGURED");
  }

  const response = await fetch(`${base}/api/recipe`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(key ? { Authorization: `Bearer ${key}` } : {})
    },
    body: JSON.stringify({ prompt, surprise: isSurprise })
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.message || "AI request failed.");
  }

  const payload = await response.json();
  return payload.recipe || payload;
}

async function requestChatFromApi(messages) {
  const { base, key } = getApiConfig();
  if (!base) {
    throw new Error("AI_NOT_CONFIGURED");
  }

  const response = await fetch(`${base}/api/chat`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(key ? { Authorization: `Bearer ${key}` } : {})
    },
    body: JSON.stringify({ messages })
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.message || "Chat request failed.");
  }

  const payload = await response.json();
  return payload.reply || "";
}

function normalizeRecipe(recipe, promptFallback) {
  const name = recipe.name || titleCase(promptFallback || "Chef's Choice");
  return {
    id: recipe.id || `ai-${Date.now()}`,
    name,
    description: recipe.description || `A tasty ${name.toLowerCase()} meal.`,
    servings: recipe.servings || defaultRecipe.servings,
    time: recipe.time || defaultRecipe.time,
    tags: recipe.tags || ["ai-generated"],
    ingredients: recipe.ingredients || defaultRecipe.ingredients,
    steps: recipe.steps || defaultRecipe.steps,
    tips: recipe.tips || defaultRecipe.tips,
    image: recipe.image || recipeImageUrl({ name })
  };
}

async function handleGenerate() {
  const prompt = mealInput.value.trim();
  if (!prompt) {
    statusMessage.textContent = "Type a meal name to get started.";
    return;
  }

  statusMessage.textContent = "Asking the AI chef for a recipe...";
  setBusy(true);
  try {
    if (isAiConfigured()) {
      const recipe = await requestRecipeFromApi(prompt, false);
      renderRecipe(normalizeRecipe(recipe, prompt));
      statusMessage.textContent = "Recipe ready!";
      return;
    }
    throw new Error("AI_NOT_CONFIGURED");
  } catch (error) {
    if (error.message === "AI_NOT_CONFIGURED") {
      const recipe = generateRecipeFromPromptFallback(prompt);
      recipe.image = recipeImageUrl(recipe);
      renderRecipe(recipe);
      statusMessage.textContent =
        "AI not configured. Showing a local recipe until API is set.";
    } else {
      statusMessage.textContent =
        "AI request failed. Check your API key and try again.";
    }
  } finally {
    setBusy(false);
  }
}

async function handleSurprise() {
  statusMessage.textContent = "Picking a surprise recipe...";
  setBusy(true);
  try {
    if (isAiConfigured()) {
      const recipe = await requestRecipeFromApi("", true);
      renderRecipe(normalizeRecipe(recipe, "Chef's Surprise"));
      statusMessage.textContent = "Surprise recipe ready!";
      return;
    }
    throw new Error("AI_NOT_CONFIGURED");
  } catch (error) {
    if (error.message === "AI_NOT_CONFIGURED") {
      const pick = recipes[Math.floor(Math.random() * recipes.length)];
      renderRecipe(pick);
      statusMessage.textContent =
        "AI not configured. Showing a local surprise until API is set.";
    } else {
      statusMessage.textContent =
        "AI request failed. Check your API key and try again.";
    }
  } finally {
    setBusy(false);
  }
  mealInput.value = "";
}

function loadSavedRecipes() {
  try {
    return JSON.parse(localStorage.getItem("savedRecipes") || "[]");
  } catch (error) {
    return [];
  }
}

function saveRecipes(list) {
  localStorage.setItem("savedRecipes", JSON.stringify(list));
}

function renderSavedRecipes() {
  const saved = loadSavedRecipes();
  if (!saved.length) {
    savedList.innerHTML = "<p class=\"muted\">No saved recipes yet.</p>";
    return;
  }

  savedList.innerHTML = saved
    .map(
      (recipe) => `
      <div class="saved-card">
        <img src="${recipeImageUrl(recipe)}" alt="${recipe.name}" />
        <div>
          <h3>${recipe.name}</h3>
          <p class="muted">Saved on ${recipe.savedAt}</p>
        </div>
        <button class="ghost" data-id="${recipe.id}">View</button>
      </div>
    `
    )
    .join("");

  savedList.querySelectorAll("button").forEach((button) => {
    button.addEventListener("click", () => {
      const saved = loadSavedRecipes();
      const found = saved.find((item) => item.id === button.dataset.id);
      if (found) renderRecipe(found);
    });
  });
}

generateBtn.addEventListener("click", handleGenerate);
surpriseBtn.addEventListener("click", handleSurprise);
saveBtn.addEventListener("click", () => {
  if (!currentRecipe) return;
  const confirmation = window.confirm(
    `Did you cook "${currentRecipe.name}"? Save it for later?`
  );
  if (!confirmation) return;

  const saved = loadSavedRecipes();
  const already = saved.some((item) => item.name === currentRecipe.name);
  if (already) {
    statusMessage.textContent = "That recipe is already saved.";
    return;
  }

  const payload = {
    ...currentRecipe,
    savedAt: new Date().toLocaleDateString()
  };
  saved.unshift(payload);
  saveRecipes(saved);
  renderSavedRecipes();
  statusMessage.textContent = "Saved! Find it in your saved recipes list.";
});

sendBtn.addEventListener("click", async () => {
  const text = chatInput.value.trim();
  if (!text) return;
  pushChatMessage(text, true);
  chatInput.value = "";
  chatHistory = [...chatHistory, { role: "user", content: text }].slice(-12);

  setBusy(true);
  try {
    if (isAiConfigured()) {
      const reply = await requestChatFromApi(chatHistory);
      if (reply) {
        pushChatMessage(reply, false);
        chatHistory = [...chatHistory, { role: "assistant", content: reply }];
      }
      return;
    }
    throw new Error("AI_NOT_CONFIGURED");
  } catch (error) {
    if (error.message === "AI_NOT_CONFIGURED") {
      const fallback = assistantResponse(text);
      pushChatMessage(fallback, false);
    } else {
      pushChatMessage(
        "AI request failed. Check your API key and try again.",
        false
      );
    }
  } finally {
    setBusy(false);
  }
});

chatInput.addEventListener("keydown", (event) => {
  if (event.key === "Enter") {
    sendBtn.click();
  }
});

renderRecipeCards();
renderSavedRecipes();
pushChatMessage(
  "Hi! Tell me a meal to cook, ask for a surprise, or request a recommendation.",
  false
);

recipeList.addEventListener("click", (event) => {
  const button = event.target.closest("button[data-id]");
  if (!button) return;
  const recipe = recipes.find((item) => item.id === button.dataset.id);
  if (recipe) renderRecipe(recipe);
});
