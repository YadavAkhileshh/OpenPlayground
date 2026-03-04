// ================= MASTER DATA =================

let ingredients = [];
let recipes = [];
let currentRecipeIngredients = [];
let mealPlan = {};
let shoppingList = []; 

const cookingUnits = [
    "mg","g","kg",
    "ml","L",
    "pcs","nos",
    "tsp","tbsp","cup",
    "oz","lb"
];

// ================= ON LOAD =================

window.onload = function () {

    populateUnitDropdown("ingredientUnit");
    populateUnitDropdown("ingredientMinUnit");
    populateUnitDropdown("recipeIngredientUnit");

    loadFromLocalStorage();
    restoreDailyMealToast();

    updateIngredients();
    updateRecipes();
    updateStats();
    generatePlanner();
    refreshIngredientDropdown();
    updateShoppingList(); 
};

// ================= UNIT DROPDOWN =================

function populateUnitDropdown(selectId) {
    const select = document.getElementById(selectId);
    if(!select) return;

    select.innerHTML = "";

    cookingUnits.forEach(unit => {
        const opt = document.createElement("option");
        opt.value = unit;
        opt.innerText = unit;
        select.appendChild(opt);
    });
}

// ================= LOCAL STORAGE =================

function saveToLocalStorage() {
    localStorage.setItem("ingredients", JSON.stringify(ingredients));
    localStorage.setItem("recipes", JSON.stringify(recipes));
    localStorage.setItem("mealPlan", JSON.stringify(mealPlan));
}

function loadFromLocalStorage() {

    const savedIngredients = localStorage.getItem("ingredients");
    const savedRecipes = localStorage.getItem("recipes");
    const savedMealPlan = localStorage.getItem("mealPlan");
    const savedShopping = localStorage.getItem("shoppingList"); 

    if (savedIngredients) ingredients = JSON.parse(savedIngredients);
    if (savedRecipes) recipes = JSON.parse(savedRecipes);
    if (savedMealPlan) mealPlan = JSON.parse(savedMealPlan);
    if (savedShopping) shoppingList = JSON.parse(savedShopping); 
}

function restoreDailyMealToast() {

    const saved = localStorage.getItem("dailyMealToast");

    if (!saved) return;

    const data = JSON.parse(saved);

    if (data.date === new Date().toDateString()) {
        showDailyMealToast(data.meal);
    } else {
        localStorage.removeItem("dailyMealToast");
    }
}

// ================= ADD INGREDIENT =================

function addIngredient() {

    const name = document.getElementById("ingredientName").value.trim();
    const qty = parseFloat(document.getElementById("ingredientQty").value);
    const unit = document.getElementById("ingredientUnit").value;
    const minQty = parseFloat(document.getElementById("ingredientMin").value);
    const minUnit = document.getElementById("ingredientMinUnit").value;

    if (!name || isNaN(qty) || isNaN(minQty)) {
        alert("Fill all fields properly");
        return;
    }

    if (ingredients.find(i => i.name === name)) {
        alert("Ingredient already exists");
        return;
    }

    ingredients.push({
        name,
        qty,
        unit,
        minQty,
        minUnit
    });

    saveToLocalStorage();
    updateShoppingList();
    updateIngredients();
    updateStats();
    refreshIngredientDropdown();

    document.getElementById("ingredientName").value = "";
    document.getElementById("ingredientQty").value = "";
    document.getElementById("ingredientMin").value = "";
}

const days = [
    "Monday","Tuesday","Wednesday",
    "Thursday","Friday","Saturday","Sunday"
];

function generatePlanner() {

    const grid = document.getElementById("plannerGrid");
    grid.innerHTML = "";

    days.forEach(day => {

        const card = document.createElement("div");
        card.className = "day-card";

        card.innerHTML = `
            <h4>${day}</h4>
            <p>${mealPlan[day] || "No Meal Assigned"}</p>
        `;

        grid.appendChild(card);
    });
}

// ================= UPDATE INGREDIENT UI =================

function updateIngredients() {

    const list = document.getElementById("ingredientList");
    if(!list) return;

    list.innerHTML = "";

    ingredients.forEach(i => {

        const lowStock = i.qty <= i.minQty;

        const card = document.createElement("div");
        card.className = "card";

        card.innerHTML = `
            <h4>${i.name}</h4>
            <p>${i.qty} ${i.unit}</p>
            <p>Minimum: ${i.minQty} ${i.minUnit}</p>
            ${lowStock ? "<p style='color:red;font-weight:bold;'>⚠ Low Stock</p>" : ""}
        `;

        list.appendChild(card);
    });
}

// ================= RECIPE DROPDOWN =================

function refreshIngredientDropdown() {

    const select = document.getElementById("recipeIngredientSelect");
    if(!select) return;

    select.innerHTML = "";

    ingredients.forEach(i => {
        const opt = document.createElement("option");
        opt.value = i.name;
        opt.innerText = `${i.name} (${i.qty} ${i.unit})`;
        select.appendChild(opt);
    });
}

// ================= ADD INGREDIENT TO RECIPE =================

function addIngredientToRecipe() {

    const name = document.getElementById("recipeIngredientSelect").value;
    const qty = parseFloat(document.getElementById("recipeIngredientQty").value);
    const unit = document.getElementById("recipeIngredientUnit").value;

    const ingredient = ingredients.find(i => i.name === name);

    if (!ingredient) {
        alert("Ingredient not found");
        return;
    }

    if (ingredient.unit !== unit) {
        alert("Unit mismatch! Use same unit as inventory.");
        return;
    }

    if (isNaN(qty) || qty <= 0) {
        alert("Enter valid quantity");
        return;
    }

    currentRecipeIngredients.push({ name, qty, unit });

    updateRecipePreview();

    document.getElementById("recipeIngredientQty").value = "";
}

// ================= RECIPE PREVIEW =================

function updateRecipePreview() {

    const preview = document.getElementById("recipeIngredientPreview");
    if(!preview) return;

    preview.innerHTML = "";

    currentRecipeIngredients.forEach(i => {
        preview.innerHTML += `<p>${i.name} - ${i.qty} ${i.unit}</p>`;
    });
}

// ================= SAVE RECIPE =================

function saveRecipe() {

    const name = document.getElementById("recipeName").value.trim();

    if (!name || currentRecipeIngredients.length === 0) {
        alert("Add recipe name and ingredients");
        return;
    }

    recipes.push({
        name,
        ingredients: [...currentRecipeIngredients]
    });

    currentRecipeIngredients = [];

    document.getElementById("recipeName").value = "";

    updateRecipePreview();
    updateRecipes();
    updateStats();
    saveToLocalStorage();
}

// ================= UPDATE RECIPES UI =================

function updateRecipes() {

    const list = document.getElementById("recipeList");
    const select = document.getElementById("recipeSelect");

    if(!list) return;

    list.innerHTML = "";
    if(select) select.innerHTML = "";

    recipes.forEach(r => {

        const card = document.createElement("div");
        card.className = "card";

        card.innerHTML = `
            <h4>${r.name}</h4>
            ${r.ingredients.map(i => `<p>${i.name} - ${i.qty} ${i.unit}</p>`).join("")}
        `;

        list.appendChild(card);

        if(select){
            const opt = document.createElement("option");
            opt.value = r.name;
            opt.innerText = r.name;
            select.appendChild(opt);
        }
    });
}

// ================= SHOPPING LIST =================

function updateShoppingList() {

    shoppingList = [];

    ingredients.forEach(i => {

        if (i.qty <= i.minQty) {

            const needed = i.minQty - i.qty;

            shoppingList.push({
                name: i.name,
                needed: needed,
                unit: i.unit
            });
        }
    });

    localStorage.setItem("shoppingList", JSON.stringify(shoppingList));
    renderShoppingList();
}

// ================= RENDER SHOPPING LIST =================

function renderShoppingList() {

    const container = document.getElementById("shoppingListContainer");
    if (!container) return;

    container.innerHTML = "";

    if (shoppingList.length === 0) {
        container.innerHTML = "<p>✅ No items needed</p>";
        return;
    }

    shoppingList.forEach(item => {

        const div = document.createElement("div");
        div.className = "card";

        div.innerHTML = `
            <h4>${item.name}</h4>
            <p style="color:red;font-weight:bold;">
                Buy ${item.needed} ${item.unit}
            </p>
        `;

        container.appendChild(div);
    });
}

// ================= ASSIGN MEAL =================

function assignMeal() {

    const selectedRecipe = document.getElementById("recipeSelect").value;
    const selectedDay = document.getElementById("daySelect").value;

    if (!selectedRecipe || !selectedDay) {
        alert("Select recipe and day");
        return;
    }

    const recipe = recipes.find(r => r.name === selectedRecipe);

    if (!recipe) {
        alert("Recipe not found");
        return;
    }

    // 🔴 Check stock first
    for (let ri of recipe.ingredients) {

        const ing = ingredients.find(i => i.name === ri.name);

        if (!ing || ing.qty < ri.qty) {
            showToast(`❌ Not enough ${ri.name}`, "error");
            return;
        }
    }

    // 🟢 Deduct stock
    recipe.ingredients.forEach(ri => {
        const ing = ingredients.find(i => i.name === ri.name);
        ing.qty -= ri.qty;
    });
    updateShoppingList();

    // ✅ Save meal to that day
    mealPlan[selectedDay] = selectedRecipe;
    if (selectedDay === getTodayName()) {
        showDailyMealToast(selectedRecipe);
    }

    saveToLocalStorage();
    updateIngredients();
    updateStats();
    generatePlanner();

    showToast(`🍳 ${selectedRecipe} assigned to ${selectedDay}`, "success");
}

// ================= STATISTICS =================

function updateStats() {

    const totalIngredients = ingredients.length;
    const lowStock = ingredients.filter(i => i.qty <= i.minQty).length;
    const totalRecipes = recipes.length;
    const totalQuantity = ingredients.reduce((sum, i) => sum + i.qty, 0);

    document.getElementById("totalIngredients").innerText = totalIngredients;
    document.getElementById("lowStockCount").innerText = lowStock;
    document.getElementById("totalRecipes").innerText = totalRecipes;
    document.getElementById("totalQuantity").innerText = totalQuantity;
}

function getTodayName() {
    const days = [
        "Sunday","Monday","Tuesday",
        "Wednesday","Thursday","Friday","Saturday"
    ];
    return days[new Date().getDay()];
}

function showDailyMealToast(mealName) {

    const container = document.getElementById("toastContainer");

    container.innerHTML = ""; // Only one daily toast

    const toast = document.createElement("div");
    toast.className = "daily-toast";
    toast.innerHTML = `🍽 Today's Meal:<br><strong>${mealName}</strong>`;

    container.appendChild(toast);

    // Save for persistence
    localStorage.setItem("dailyMealToast", JSON.stringify({
        date: new Date().toDateString(),
        meal: mealName
    }));
}