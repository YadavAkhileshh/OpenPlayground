// Recipe Database
const recipes = [
    {
        id: 1,
        title: "Classic Spaghetti Carbonara",
        cuisine: "Italian",
        difficulty: "Medium",
        time: "30 mins",
        ingredients: ["spaghetti", "eggs", "parmesan cheese", "pancetta", "black pepper", "salt"],
        instructions: [
            "Cook spaghetti in salted boiling water until al dente.",
            "In a bowl, whisk eggs and grated Parmesan cheese.",
            "Cook pancetta in a pan until crispy.",
            "Drain pasta, reserving some pasta water.",
            "Mix hot pasta with pancetta, then add egg mixture off heat.",
            "Add pasta water if needed for creaminess. Season with pepper and serve."
        ],
        nutrition: {
            calories: 450,
            protein: "18g",
            carbs: "45g",
            fat: "20g"
        },
        image: "https://images.unsplash.com/photo-1551892376-3e0034c9cb87?w=400",
        dietary: ["gluten-free option"]
    },
    {
        id: 2,
        title: "Chicken Stir-Fry",
        cuisine: "Asian",
        difficulty: "Easy",
        time: "20 mins",
        ingredients: ["chicken breast", "broccoli", "bell peppers", "soy sauce", "garlic", "ginger", "rice"],
        instructions: [
            "Cut chicken into bite-sized pieces and season with salt and pepper.",
            "Heat oil in a wok or large pan over high heat.",
            "Add chicken and stir-fry until cooked through.",
            "Add garlic, ginger, broccoli, and bell peppers. Stir-fry for 3-4 minutes.",
            "Add soy sauce and cook for another 2 minutes.",
            "Serve over steamed rice."
        ],
        nutrition: {
            calories: 380,
            protein: "35g",
            carbs: "30g",
            fat: "12g"
        },
        image: "https://images.unsplash.com/photo-1603133872878-684f208fb84b?w=400",
        dietary: ["gluten-free"]
    },
    {
        id: 3,
        title: "Vegetarian Buddha Bowl",
        cuisine: "Mediterranean",
        difficulty: "Easy",
        time: "25 mins",
        ingredients: ["quinoa", "chickpeas", "avocado", "cherry tomatoes", "cucumber", "feta cheese", "olive oil", "lemon"],
        instructions: [
            "Cook quinoa according to package instructions.",
            "Drain and rinse chickpeas.",
            "Slice avocado, tomatoes, and cucumber.",
            "Arrange quinoa, chickpeas, and vegetables in a bowl.",
            "Top with crumbled feta cheese.",
            "Drizzle with olive oil and lemon juice. Season to taste."
        ],
        nutrition: {
            calories: 420,
            protein: "15g",
            carbs: "50g",
            fat: "18g"
        },
        image: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=400",
        dietary: ["vegetarian", "vegan option", "gluten-free"]
    },
    {
        id: 4,
        title: "Beef Tacos",
        cuisine: "Mexican",
        difficulty: "Medium",
        time: "35 mins",
        ingredients: ["ground beef", "taco shells", "lettuce", "tomato", "cheese", "onion", "taco seasoning", "sour cream"],
        instructions: [
            "Brown ground beef in a skillet over medium heat.",
            "Add taco seasoning and water according to package instructions.",
            "Simmer for 10 minutes until thickened.",
            "Warm taco shells in oven.",
            "Fill shells with beef, lettuce, tomato, cheese, and onion.",
            "Top with sour cream and serve."
        ],
        nutrition: {
            calories: 380,
            protein: "25g",
            carbs: "25g",
            fat: "20g"
        },
        image: "https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=400",
        dietary: []
    },
    {
        id: 5,
        title: "Salmon with Roasted Vegetables",
        cuisine: "American",
        difficulty: "Easy",
        time: "40 mins",
        ingredients: ["salmon fillet", "broccoli", "carrots", "potatoes", "olive oil", "lemon", "garlic", "herbs"],
        instructions: [
            "Preheat oven to 400°F (200°C).",
            "Cut vegetables into bite-sized pieces.",
            "Toss vegetables with olive oil, garlic, and herbs.",
            "Place salmon and vegetables on a baking sheet.",
            "Bake for 20-25 minutes until salmon is cooked through.",
            "Squeeze lemon over salmon before serving."
        ],
        nutrition: {
            calories: 420,
            protein: "35g",
            carbs: "20g",
            fat: "22g"
        },
        image: "https://images.unsplash.com/photo-1467003909585-2f8a72700288?w=400",
        dietary: ["gluten-free", "keto"]
    }
];

// Available ingredients for drag and drop
const availableIngredients = [
    "chicken breast", "ground beef", "salmon fillet", "spaghetti", "rice", "quinoa",
    "broccoli", "bell peppers", "cherry tomatoes", "cucumber", "lettuce", "carrots",
    "potatoes", "avocado", "onion", "garlic", "ginger", "eggs", "parmesan cheese",
    "feta cheese", "cheese", "pancetta", "chickpeas", "soy sauce", "olive oil",
    "lemon", "taco shells", "taco seasoning", "sour cream", "black pepper", "salt",
    "herbs"
];

// DOM Elements
const ingredientList = document.getElementById('ingredient-list');
const selectedList = document.getElementById('selected-list');
const generateBtn = document.getElementById('generate-recipe');
const randomBtn = document.getElementById('random-recipe');
const clearBtn = document.getElementById('clear-selection');
const recipeCard = document.getElementById('recipe-card');
const noRecipe = document.getElementById('no-recipe');
const saveBtn = document.getElementById('save-recipe');
const ratingStars = document.querySelectorAll('.star');
const savedList = document.getElementById('saved-list');
const shoppingBtn = document.getElementById('generate-shopping-list');
const shoppingItems = document.getElementById('shopping-items');

// State
let selectedIngredients = [];
let currentRecipe = null;
let savedRecipes = JSON.parse(localStorage.getItem('savedRecipes')) || [];

// Initialize the app
function init() {
    populateIngredients();
    setupDragAndDrop();
    setupEventListeners();
    loadSavedRecipes();
}

// Populate available ingredients
function populateIngredients() {
    availableIngredients.forEach(ingredient => {
        const ingredientEl = document.createElement('div');
        ingredientEl.className = 'ingredient-item';
        ingredientEl.textContent = ingredient;
        ingredientEl.draggable = true;
        ingredientEl.dataset.ingredient = ingredient;
        ingredientList.appendChild(ingredientEl);
    });
}

// Setup drag and drop functionality
function setupDragAndDrop() {
    const ingredientItems = document.querySelectorAll('.ingredient-item');

    ingredientItems.forEach(item => {
        item.addEventListener('dragstart', handleDragStart);
        item.addEventListener('dragend', handleDragEnd);
    });

    selectedList.addEventListener('dragover', handleDragOver);
    selectedList.addEventListener('drop', handleDrop);
    selectedList.addEventListener('dragleave', handleDragLeave);
}

function handleDragStart(e) {
    e.dataTransfer.setData('text/plain', e.target.dataset.ingredient);
    e.target.classList.add('dragging');
}

function handleDragEnd(e) {
    e.target.classList.remove('dragging');
}

function handleDragOver(e) {
    e.preventDefault();
    selectedList.classList.add('active');
}

function handleDragLeave(e) {
    selectedList.classList.remove('active');
}

function handleDrop(e) {
    e.preventDefault();
    selectedList.classList.remove('active');

    const ingredient = e.dataTransfer.getData('text/plain');
    if (ingredient && !selectedIngredients.includes(ingredient)) {
        addToSelected(ingredient);
    }
}

function addToSelected(ingredient) {
    selectedIngredients.push(ingredient);
    updateSelectedDisplay();
}

function removeFromSelected(ingredient) {
    selectedIngredients = selectedIngredients.filter(item => item !== ingredient);
    updateSelectedDisplay();
}

function updateSelectedDisplay() {
    selectedList.innerHTML = '';

    if (selectedIngredients.length === 0) {
        selectedList.innerHTML = '<p>Drop ingredients here</p>';
        return;
    }

    selectedIngredients.forEach(ingredient => {
        const item = document.createElement('div');
        item.className = 'ingredient-item selected';
        item.textContent = ingredient;
        item.addEventListener('click', () => removeFromSelected(ingredient));
        selectedList.appendChild(item);
    });
}

// Setup event listeners
function setupEventListeners() {
    generateBtn.addEventListener('click', generateRecipe);
    randomBtn.addEventListener('click', generateRandomRecipe);
    clearBtn.addEventListener('click', clearSelection);
    saveBtn.addEventListener('click', saveRecipe);
    ratingStars.forEach(star => star.addEventListener('click', rateRecipe));
    shoppingBtn.addEventListener('click', generateShoppingList);
}

// Generate recipe based on selected ingredients and preferences
function generateRecipe() {
    const dietary = Array.from(document.getElementById('dietary').selectedOptions).map(option => option.value);
    const cuisine = document.getElementById('cuisine').value;

    let filteredRecipes = recipes.filter(recipe => {
        // Check if recipe matches selected ingredients (at least 50% match)
        const ingredientMatch = selectedIngredients.length === 0 ||
            selectedIngredients.some(ing => recipe.ingredients.includes(ing));

        // Check dietary restrictions
        const dietaryMatch = dietary.length === 0 ||
            dietary.every(diet => recipe.dietary.includes(diet));

        // Check cuisine
        const cuisineMatch = cuisine === 'any' || recipe.cuisine.toLowerCase() === cuisine;

        return ingredientMatch && dietaryMatch && cuisineMatch;
    });

    if (filteredRecipes.length === 0) {
        showNoRecipe();
        return;
    }

    // Select the best matching recipe (most ingredient matches)
    const bestMatch = filteredRecipes.reduce((best, current) => {
        const bestMatches = selectedIngredients.filter(ing => best.ingredients.includes(ing)).length;
        const currentMatches = selectedIngredients.filter(ing => current.ingredients.includes(ing)).length;
        return currentMatches > bestMatches ? current : best;
    });

    displayRecipe(bestMatch);
}

// Generate random recipe
function generateRandomRecipe() {
    const randomRecipe = recipes[Math.floor(Math.random() * recipes.length)];
    displayRecipe(randomRecipe);
}

// Clear selection
function clearSelection() {
    selectedIngredients = [];
    updateSelectedDisplay();
    document.getElementById('dietary').selectedIndex = -1;
    document.getElementById('cuisine').value = 'any';
}

// Display recipe
function displayRecipe(recipe) {
    currentRecipe = recipe;

    document.getElementById('recipe-title').textContent = recipe.title;
    document.getElementById('recipe-cuisine').textContent = recipe.cuisine;
    document.getElementById('recipe-difficulty').textContent = recipe.difficulty;
    document.getElementById('recipe-time').textContent = recipe.time;
    document.getElementById('recipe-image').src = recipe.image;
    document.getElementById('recipe-image').alt = recipe.title;

    // Ingredients
    const ingredientsList = document.getElementById('recipe-ingredients');
    ingredientsList.innerHTML = '';
    recipe.ingredients.forEach(ingredient => {
        const li = document.createElement('li');
        li.textContent = ingredient;
        ingredientsList.appendChild(li);
    });

    // Instructions
    const instructionsList = document.getElementById('recipe-instructions');
    instructionsList.innerHTML = '';
    recipe.instructions.forEach(instruction => {
        const li = document.createElement('li');
        li.textContent = instruction;
        instructionsList.appendChild(li);
    });

    // Nutrition
    const nutritionGrid = document.getElementById('recipe-nutrition');
    nutritionGrid.innerHTML = '';
    Object.entries(recipe.nutrition).forEach(([key, value]) => {
        const item = document.createElement('div');
        item.className = 'nutrition-item';
        item.innerHTML = `<strong>${key.charAt(0).toUpperCase() + key.slice(1)}:</strong><br>${value}`;
        nutritionGrid.appendChild(item);
    });

    // Reset rating
    ratingStars.forEach(star => star.classList.remove('active'));

    recipeCard.classList.remove('hidden');
    noRecipe.classList.add('hidden');
}

// Show no recipe message
function showNoRecipe() {
    recipeCard.classList.add('hidden');
    noRecipe.classList.remove('hidden');
}

// Save recipe
function saveRecipe() {
    if (!currentRecipe) return;

    if (!savedRecipes.find(r => r.id === currentRecipe.id)) {
        savedRecipes.push(currentRecipe);
        localStorage.setItem('savedRecipes', JSON.stringify(savedRecipes));
        loadSavedRecipes();
        alert('Recipe saved successfully!');
    } else {
        alert('Recipe already saved!');
    }
}

// Rate recipe
function rateRecipe(e) {
    const rating = parseInt(e.target.dataset.rating);
    ratingStars.forEach((star, index) => {
        if (index < rating) {
            star.classList.add('active');
        } else {
            star.classList.remove('active');
        }
    });
}

// Load saved recipes
function loadSavedRecipes() {
    savedList.innerHTML = '';

    if (savedRecipes.length === 0) {
        savedList.innerHTML = '<p>No saved recipes yet.</p>';
        return;
    }

    savedRecipes.forEach(recipe => {
        const card = document.createElement('div');
        card.className = 'saved-recipe-card';
        card.innerHTML = `
            <h4>${recipe.title}</h4>
            <p>${recipe.cuisine} • ${recipe.time}</p>
            <button onclick="displayRecipeById(${recipe.id})">View Recipe</button>
        `;
        savedList.appendChild(card);
    });
}

// Display recipe by ID
function displayRecipeById(id) {
    const recipe = recipes.find(r => r.id === id);
    if (recipe) {
        displayRecipe(recipe);
    }
}

// Generate shopping list
function generateShoppingList() {
    if (!currentRecipe) {
        alert('Please generate a recipe first!');
        return;
    }

    shoppingItems.innerHTML = '';

    currentRecipe.ingredients.forEach(ingredient => {
        const item = document.createElement('div');
        item.className = 'shopping-item';
        item.innerHTML = `
            <span>${ingredient}</span>
            <input type="checkbox" onchange="toggleShoppingItem(this)">
        `;
        shoppingItems.appendChild(item);
    });
}

// Toggle shopping item
function toggleShoppingItem(checkbox) {
    const item = checkbox.parentElement;
    if (checkbox.checked) {
        item.style.textDecoration = 'line-through';
        item.style.opacity = '0.6';
    } else {
        item.style.textDecoration = 'none';
        item.style.opacity = '1';
    }
}

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', init);
