const recipes = [
  {
    id: "carbonara",
    name: "Spaghetti Carbonara",
    description: "Silky pasta with pancetta, parmesan, and black pepper.",
    image:
      "https://images.unsplash.com/photo-1525755662778-989d0524087e?auto=format&fit=crop&w=1000&q=80",
    servings: 2,
    time: "25 mins",
    tags: ["pasta", "quick"],
    ingredients: [
      "200 g spaghetti",
      "100 g pancetta or bacon, diced",
      "2 eggs + 1 egg yolk",
      "50 g grated parmesan",
      "1 garlic clove, smashed",
      "Fresh black pepper",
      "Salt for pasta water"
    ],
    steps: [
      "Boil spaghetti in salted water until al dente.",
      "Crisp pancetta with garlic, then discard garlic.",
      "Whisk eggs and parmesan with plenty of pepper.",
      "Toss hot pasta with pancetta off heat.",
      "Quickly stir in egg mixture for a creamy sauce."
    ],
    tips: ["Use the pasta water to loosen the sauce if needed."]
  },
  {
    id: "tikka",
    name: "Chicken Tikka Masala",
    description: "Creamy spiced tomato curry with tender chicken.",
    image:
      "https://images.unsplash.com/photo-1604908176997-125f25cc6f3d?auto=format&fit=crop&w=1000&q=80",
    servings: 4,
    time: "45 mins",
    tags: ["chicken", "comfort"],
    ingredients: [
      "500 g chicken thighs, cubed",
      "1 cup yogurt",
      "2 tbsp garam masala",
      "1 tbsp grated ginger",
      "2 garlic cloves, minced",
      "1 onion, sliced",
      "1 can crushed tomatoes",
      "1/2 cup cream",
      "Salt, chili, and cilantro"
    ],
    steps: [
      "Marinate chicken in yogurt, spices, ginger, and garlic.",
      "Sear chicken until golden and set aside.",
      "Cook onion until soft, add tomatoes and simmer.",
      "Return chicken and finish with cream.",
      "Serve with rice or naan."
    ],
    tips: ["Add a knob of butter for extra richness."]
  },
  {
    id: "stirfry",
    name: "Veggie Stir Fry",
    description: "Colorful vegetables with a sweet-savory glaze.",
    image:
      "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=1000&q=80",
    servings: 2,
    time: "20 mins",
    tags: ["vegetarian", "quick"],
    ingredients: [
      "1 bell pepper, sliced",
      "1 cup broccoli florets",
      "1 carrot, sliced",
      "150 g mushrooms",
      "2 tbsp soy sauce",
      "1 tbsp honey",
      "1 tsp sesame oil",
      "1 tbsp minced garlic",
      "Cooked rice"
    ],
    steps: [
      "Heat oil in a wok and add garlic.",
      "Stir fry veggies until crisp-tender.",
      "Whisk soy sauce, honey, and sesame oil.",
      "Pour sauce over veggies and toss.",
      "Serve over rice."
    ],
    tips: ["Add tofu or shrimp for extra protein."]
  },
  {
    id: "salmon",
    name: "Lemon Garlic Salmon",
    description: "Flaky salmon with bright citrus and herbs.",
    image:
      "https://images.unsplash.com/photo-1467003909585-2f8a72700288?auto=format&fit=crop&w=1000&q=80",
    servings: 2,
    time: "18 mins",
    tags: ["seafood", "light"],
    ingredients: [
      "2 salmon fillets",
      "1 tbsp olive oil",
      "2 garlic cloves, minced",
      "1 lemon, sliced",
      "1 tsp dried oregano",
      "Salt and pepper"
    ],
    steps: [
      "Season salmon with salt, pepper, and oregano.",
      "Sear in olive oil for 3-4 mins per side.",
      "Add garlic and lemon slices, spooning oil over fish.",
      "Cook until flaky.",
      "Serve with salad or roasted veggies."
    ],
    tips: ["Do not overcook; pull when still slightly translucent."]
  },
  {
    id: "pancakes",
    name: "Classic Pancakes",
    description: "Fluffy, golden pancakes for any time of day.",
    image:
      "https://images.unsplash.com/photo-1495214783159-3503fd1b572d?auto=format&fit=crop&w=1000&q=80",
    servings: 3,
    time: "20 mins",
    tags: ["breakfast", "sweet"],
    ingredients: [
      "1 cup flour",
      "1 tbsp sugar",
      "1 tsp baking powder",
      "1/2 tsp baking soda",
      "1 cup milk",
      "1 egg",
      "2 tbsp melted butter",
      "Pinch of salt"
    ],
    steps: [
      "Whisk dry ingredients in a bowl.",
      "Mix milk, egg, and butter separately.",
      "Combine wet and dry until just mixed.",
      "Cook on a greased skillet until bubbles form.",
      "Flip and cook until golden."
    ],
    tips: ["Rest batter 5 minutes for fluffier pancakes."]
  },
  {
    id: "burrito",
    name: "Rainbow Burrito Bowl",
    description: "A fresh, crunchy bowl with bold flavors.",
    image:
      "https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?auto=format&fit=crop&w=1000&q=80",
    servings: 2,
    time: "25 mins",
    tags: ["healthy", "bowl"],
    ingredients: [
      "1 cup cooked rice",
      "1 can black beans, rinsed",
      "1 cup corn",
      "1 avocado, sliced",
      "1 tomato, diced",
      "1/2 red onion, sliced",
      "1 tbsp lime juice",
      "Cilantro and salsa"
    ],
    steps: [
      "Warm rice and beans.",
      "Arrange rice, beans, corn, avocado, tomato, and onion.",
      "Drizzle lime juice and add salsa.",
      "Top with cilantro.",
      "Serve immediately."
    ],
    tips: ["Add grilled chicken for extra protein."]
  }
];

const mealInput = document.getElementById("mealInput");
const generateBtn = document.getElementById("generateBtn");
const surpriseBtn = document.getElementById("surpriseBtn");
const recipeTitle = document.getElementById("recipeTitle");
const recipeMeta = document.getElementById("recipeMeta");
const ingredientsList = document.getElementById("ingredientsList");
const stepsList = document.getElementById("stepsList");
const tipsBlock = document.getElementById("tipsBlock");
const recipeImage = document.getElementById("recipeImage");
const saveBtn = document.getElementById("saveBtn");
const statusMessage = document.getElementById("statusMessage");
const recipeList = document.getElementById("recipeList");
const chatWindow = document.getElementById("chatWindow");
const chatInput = document.getElementById("chatInput");
const sendBtn = document.getElementById("sendBtn");
const savedList = document.getElementById("savedList");

const API_BASE = "";
const API_KEY = "";
const DEFAULT_RECIPE_IMAGE =
  "https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=1100&q=80";

let currentRecipe = null;
let chatHistory = [];

const ingredientHints = [
  {
    match: ["chicken", "tikka", "curry"],
    main: "chicken",
    flavor: "warm spices and creamy tomato"
  },
  {
    match: ["salmon", "fish", "seafood"],
    main: "salmon",
    flavor: "lemon, garlic, and herbs"
  },
  {
    match: ["pasta", "spaghetti", "noodle"],
    main: "pasta",
    flavor: "garlic, olive oil, and parmesan"
  },
  {
    match: ["salad", "bowl", "veggie", "vegetable"],
    main: "fresh vegetables",
    flavor: "citrus and crunchy toppings"
  },
  {
    match: ["pancake", "breakfast", "sweet"],
    main: "fluffy pancakes",
    flavor: "vanilla and maple syrup"
  }
];

const defaultRecipe = {
  servings: 2,
  time: "30 mins",
  ingredients: [
    "2 tbsp olive oil",
    "1 onion, sliced",
    "2 garlic cloves, minced",
    "1 cup mixed vegetables",
    "Salt and pepper",
    "Fresh herbs"
  ],
  steps: [
    "Prep all ingredients and heat a pan.",
    "Saute onion and garlic until fragrant.",
    "Add main ingredient and cook until tender.",
    "Stir in vegetables and seasonings.",
    "Finish with herbs and serve warm."
  ],
  tips: ["Taste as you go and adjust seasoning."]
};

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
  const key =
    window.AI_RECIPE_API_KEY ||
    localStorage.getItem("AI_RECIPE_API_KEY") ||
    API_KEY ||
    "";
  return { base, key };
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
