const elements = {
  mealForm: document.getElementById("meal-form"),
  mealName: document.getElementById("meal-name"),
  mealDay: document.getElementById("meal-day"),
  mealType: document.getElementById("meal-type"),
  mealCost: document.getElementById("meal-cost"),
  calendar: document.getElementById("calendar"),
  recipeForm: document.getElementById("recipe-form"),
  recipeName: document.getElementById("recipe-name"),
  recipeTime: document.getElementById("recipe-time"),
  recipeMacro: document.getElementById("recipe-macro"),
  recipes: document.getElementById("recipes"),
  groceryForm: document.getElementById("grocery-form"),
  groceryName: document.getElementById("grocery-name"),
  groceryQty: document.getElementById("grocery-qty"),
  groceryPrice: document.getElementById("grocery-price"),
  groceries: document.getElementById("groceries"),
  budget: document.getElementById("budget"),
  budgetSpent: document.getElementById("budget-spent"),
  budgetBar: document.getElementById("budget-bar"),
  groceryTotal: document.getElementById("grocery-total"),
  mealAverage: document.getElementById("meal-average"),
  pantryForm: document.getElementById("pantry-form"),
  pantryName: document.getElementById("pantry-name"),
  pantryStatus: document.getElementById("pantry-status"),
  pantry: document.getElementById("pantry"),
  macroForm: document.getElementById("macro-form"),
  macroProtein: document.getElementById("macro-protein"),
  macroCarbs: document.getElementById("macro-carbs"),
  macroFats: document.getElementById("macro-fats"),
  proteinProgress: document.getElementById("protein-progress"),
  proteinBar: document.getElementById("protein-bar"),
  carbProgress: document.getElementById("carb-progress"),
  carbBar: document.getElementById("carb-bar"),
  fatProgress: document.getElementById("fat-progress"),
  fatBar: document.getElementById("fat-bar"),
  exportCsv: document.getElementById("export-csv"),
  exportSummary: document.getElementById("export-summary"),
  swaps: document.getElementById("swaps"),
  refreshSwaps: document.getElementById("refresh-swaps"),
  diet: document.getElementById("diet"),
  weeklyMeals: document.getElementById("weekly-meals"),
  budgetUsage: document.getElementById("budget-usage"),
  macroScore: document.getElementById("macro-score")
};

const STORAGE_KEYS = {
  meals: "preppulse_meals",
  recipes: "preppulse_recipes",
  groceries: "preppulse_groceries",
  pantry: "preppulse_pantry",
  macros: "preppulse_macros",
  settings: "preppulse_settings"
};

const AI_SWAPS = [
  "Swap pasta for zucchini noodles for a lighter dinner.",
  "Use Greek yogurt instead of mayo for added protein.",
  "Try roasted chickpeas as a crunchy salad topper.",
  "Replace sugary snacks with fruit + nut butter.",
  "Batch-cook quinoa to save prep time midweek."
];

let state = {
  meals: [],
  recipes: [],
  groceries: [],
  pantry: [],
  macros: { protein: 120, carbs: 180, fats: 60 },
  settings: { diet: "" }
};

const formatCurrency = (value) =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(value);

const loadState = () => {
  const meals = localStorage.getItem(STORAGE_KEYS.meals);
  const recipes = localStorage.getItem(STORAGE_KEYS.recipes);
  const groceries = localStorage.getItem(STORAGE_KEYS.groceries);
  const pantry = localStorage.getItem(STORAGE_KEYS.pantry);
  const macros = localStorage.getItem(STORAGE_KEYS.macros);
  const settings = localStorage.getItem(STORAGE_KEYS.settings);

  if (meals) state.meals = JSON.parse(meals);
  if (recipes) state.recipes = JSON.parse(recipes);
  if (groceries) state.groceries = JSON.parse(groceries);
  if (pantry) state.pantry = JSON.parse(pantry);
  if (macros) state.macros = JSON.parse(macros);
  if (settings) state.settings = JSON.parse(settings);

  elements.diet.value = state.settings.diet || "";
};

const saveState = () => {
  localStorage.setItem(STORAGE_KEYS.meals, JSON.stringify(state.meals));
  localStorage.setItem(STORAGE_KEYS.recipes, JSON.stringify(state.recipes));
  localStorage.setItem(STORAGE_KEYS.groceries, JSON.stringify(state.groceries));
  localStorage.setItem(STORAGE_KEYS.pantry, JSON.stringify(state.pantry));
  localStorage.setItem(STORAGE_KEYS.macros, JSON.stringify(state.macros));
  localStorage.setItem(STORAGE_KEYS.settings, JSON.stringify(state.settings));
};

const addMeal = (meal) => {
  state.meals.unshift(meal);
  saveState();
  render();
};

const addRecipe = (recipe) => {
  state.recipes.unshift(recipe);
  saveState();
  render();
};

const addGrocery = (item) => {
  state.groceries.unshift(item);
  saveState();
  render();
};

const addPantry = (item) => {
  state.pantry.unshift(item);
  saveState();
  render();
};

const renderCalendar = () => {
  elements.calendar.innerHTML = "";
  if (state.meals.length === 0) {
    elements.calendar.innerHTML = `<p class="muted">No meals planned yet.</p>`;
    return;
  }

  state.meals.slice(0, 8).forEach((meal) => {
    const item = document.createElement("div");
    item.className = "calendar-item";
    item.innerHTML = `
      <div class="calendar-item__row">
        <strong>${meal.name}</strong>
        <span class="tag">${meal.day}</span>
      </div>
      <div class="calendar-item__row">
        <span class="muted">${meal.type}</span>
        <span class="muted">${formatCurrency(meal.cost)}</span>
      </div>
    `;
    elements.calendar.appendChild(item);
  });
};

const renderRecipes = () => {
  elements.recipes.innerHTML = "";
  if (state.recipes.length === 0) {
    elements.recipes.innerHTML = `<p class="muted">No recipes saved.</p>`;
    return;
  }

  state.recipes.slice(0, 6).forEach((recipe) => {
    const item = document.createElement("div");
    item.className = "recipe";
    item.innerHTML = `
      <div class="recipe__row">
        <strong>${recipe.name}</strong>
        <span class="tag">${recipe.macro}</span>
      </div>
      <div class="recipe__row">
        <span class="muted">Prep ${recipe.time} min</span>
        <span class="muted">Saved</span>
      </div>
    `;
    elements.recipes.appendChild(item);
  });
};

const renderGroceries = () => {
  elements.groceries.innerHTML = "";
  if (state.groceries.length === 0) {
    elements.groceries.innerHTML = `<p class="muted">No grocery items yet.</p>`;
    return;
  }

  state.groceries.slice(0, 8).forEach((item) => {
    const row = document.createElement("div");
    row.className = "grocery";
    row.innerHTML = `
      <div class="grocery__row">
        <strong>${item.name}</strong>
        <span class="tag">${item.qty}</span>
      </div>
      <div class="grocery__row">
        <span class="muted">${formatCurrency(item.price)}</span>
        <button class="btn ghost" data-id="${item.id}">Remove</button>
      </div>
    `;
    elements.groceries.appendChild(row);
  });
};

const renderPantry = () => {
  elements.pantry.innerHTML = "";
  if (state.pantry.length === 0) {
    elements.pantry.innerHTML = `<p class="muted">Pantry is empty.</p>`;
    return;
  }

  state.pantry.slice(0, 6).forEach((item) => {
    const row = document.createElement("div");
    row.className = "pantry-item";
    row.innerHTML = `
      <div class="pantry-item__row">
        <strong>${item.name}</strong>
        <span class="tag">${item.status}</span>
      </div>
      <div class="pantry-item__row">
        <span class="muted">Tracked</span>
        <button class="btn ghost" data-id="${item.id}">Remove</button>
      </div>
    `;
    elements.pantry.appendChild(row);
  });
};

const renderAnalytics = () => {
  const totalGrocery = state.groceries.reduce((sum, item) => sum + item.price, 0);
  const totalMeal = state.meals.reduce((sum, meal) => sum + meal.cost, 0);
  const total = totalGrocery + totalMeal;
  const budget = Number(elements.budget.value);
  const usage = Math.min((total / budget) * 100, 100);

  elements.budgetSpent.textContent = formatCurrency(total);
  elements.budgetBar.style.width = `${usage}%`;
  elements.groceryTotal.textContent = formatCurrency(totalGrocery);
  elements.mealAverage.textContent = state.meals.length
    ? formatCurrency(totalMeal / state.meals.length)
    : formatCurrency(0);

  elements.weeklyMeals.textContent = state.meals.length;
  elements.budgetUsage.textContent = formatCurrency(total);

  const macroScore = Math.min(100, Math.round((state.meals.length / 14) * 100));
  elements.macroScore.textContent = `${macroScore}%`;
};

const renderMacros = () => {
  const protein = Math.min(100, Math.round((state.meals.length * 20 / state.macros.protein) * 100));
  const carbs = Math.min(100, Math.round((state.meals.length * 30 / state.macros.carbs) * 100));
  const fats = Math.min(100, Math.round((state.meals.length * 10 / state.macros.fats) * 100));

  elements.proteinProgress.textContent = `${protein}%`;
  elements.carbProgress.textContent = `${carbs}%`;
  elements.fatProgress.textContent = `${fats}%`;
  elements.proteinBar.style.width = `${protein}%`;
  elements.carbBar.style.width = `${carbs}%`;
  elements.fatBar.style.width = `${fats}%`;
};

const renderSwaps = () => {
  elements.swaps.innerHTML = "";
  const pool = AI_SWAPS.sort(() => 0.5 - Math.random()).slice(0, 3);
  pool.forEach((text) => {
    const item = document.createElement("div");
    item.className = "swap";
    item.textContent = text;
    elements.swaps.appendChild(item);
  });
};

const exportCsv = () => {
  if (state.groceries.length === 0) return;
  const rows = ["Item,Quantity,Price"];
  state.groceries.forEach((item) => {
    rows.push([item.name, item.qty, item.price].join(","));
  });
  downloadFile("preppulse-grocery-list.csv", rows.join("\n"));
};

const exportSummary = () => {
  const summary = `PrepPulse Weekly Summary\nMeals planned: ${state.meals.length}\nRecipes saved: ${state.recipes.length}\nGrocery items: ${state.groceries.length}\nPantry items: ${state.pantry.length}\nBudget used: ${formatCurrency(state.groceries.reduce((sum, item) => sum + item.price, 0))}`;
  downloadFile("preppulse-summary.txt", summary);
};

const downloadFile = (filename, content) => {
  const blob = new Blob([content], { type: "text/plain" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
};

const setupListeners = () => {
  elements.mealForm.addEventListener("submit", (event) => {
    event.preventDefault();
    const meal = {
      id: crypto.randomUUID(),
      name: elements.mealName.value.trim(),
      day: elements.mealDay.value,
      type: elements.mealType.value,
      cost: Number(elements.mealCost.value)
    };
    if (!meal.name) return;
    addMeal(meal);
    elements.mealForm.reset();
  });

  elements.recipeForm.addEventListener("submit", (event) => {
    event.preventDefault();
    const recipe = {
      id: crypto.randomUUID(),
      name: elements.recipeName.value.trim(),
      time: Number(elements.recipeTime.value),
      macro: elements.recipeMacro.value
    };
    if (!recipe.name) return;
    addRecipe(recipe);
    elements.recipeForm.reset();
  });

  elements.groceryForm.addEventListener("submit", (event) => {
    event.preventDefault();
    const item = {
      id: crypto.randomUUID(),
      name: elements.groceryName.value.trim(),
      qty: elements.groceryQty.value.trim(),
      price: Number(elements.groceryPrice.value)
    };
    if (!item.name) return;
    addGrocery(item);
    elements.groceryForm.reset();
  });

  elements.groceries.addEventListener("click", (event) => {
    const button = event.target.closest("button[data-id]");
    if (!button) return;
    state.groceries = state.groceries.filter((item) => item.id !== button.dataset.id);
    saveState();
    render();
  });

  elements.pantryForm.addEventListener("submit", (event) => {
    event.preventDefault();
    const item = {
      id: crypto.randomUUID(),
      name: elements.pantryName.value.trim(),
      status: elements.pantryStatus.value
    };
    if (!item.name) return;
    addPantry(item);
    elements.pantryForm.reset();
  });

  elements.pantry.addEventListener("click", (event) => {
    const button = event.target.closest("button[data-id]");
    if (!button) return;
    state.pantry = state.pantry.filter((item) => item.id !== button.dataset.id);
    saveState();
    render();
  });

  elements.macroForm.addEventListener("submit", (event) => {
    event.preventDefault();
    state.macros = {
      protein: Number(elements.macroProtein.value),
      carbs: Number(elements.macroCarbs.value),
      fats: Number(elements.macroFats.value)
    };
    saveState();
    renderMacros();
  });

  elements.budget.addEventListener("input", renderAnalytics);
  elements.refreshSwaps.addEventListener("click", renderSwaps);
  elements.diet.addEventListener("input", () => {
    state.settings.diet = elements.diet.value;
    saveState();
  });
  elements.exportCsv.addEventListener("click", exportCsv);
  elements.exportSummary.addEventListener("click", exportSummary);
};

const render = () => {
  renderCalendar();
  renderRecipes();
  renderGroceries();
  renderPantry();
  renderAnalytics();
  renderMacros();
  renderSwaps();
  saveState();
};

const init = () => {
  loadState();
  elements.macroProtein.value = state.macros.protein;
  elements.macroCarbs.value = state.macros.carbs;
  elements.macroFats.value = state.macros.fats;
  render();
  setupListeners();
};

init();
