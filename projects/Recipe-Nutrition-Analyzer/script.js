class RecipeAnalyzer {
    constructor() {
        this.ingredients = [];
        this.currentRecipe = null;
        this.savedRecipes = [];
        this.dailyGoals = {
            calories: 2000,
            protein: 50,
            carbs: 250,
            fats: 65,
        };

        this.initializeElements();
        this.setupEventListeners();
        this.loadFromLocalStorage();
        this.renderSavedRecipes();
        this.setupMacroChart();

        // Deploy recipe templates
        this.deployTemplates();
    }

    initializeElements() {
        this.ingredientInput = document.getElementById("ingredientInput");
        this.addIngredientBtn = document.getElementById("addIngredientBtn");
        this.ingredientsList = document.getElementById("ingredientsList");
        this.recipeNameInput = document.getElementById("recipeName");
        this.servingSizeInput = document.getElementById("servingSize");
        this.suggestionsContainer = document.getElementById("suggestions");
        this.calcBtn = document.getElementById("calcBtn");
        this.clearBtn = document.getElementById("clearBtn");
        this.saveRecipeBtn = document.getElementById("saveRecipeBtn");
        this.savedRecipesList = document.getElementById("savedRecipesList");
        this.macroChart = document.getElementById("macroChart");
    }

    setupEventListeners() {
        this.addIngredientBtn.addEventListener("click", () => this.addIngredient());
        this.ingredientInput.addEventListener("keypress", (e) => {
            if (e.key === "Enter") this.addIngredient();
        });
        this.ingredientInput.addEventListener("input", (e) => this.showSuggestions(e.target.value));
        this.calcBtn.addEventListener("click", () => this.calculateNutrition());
        this.clearBtn.addEventListener("click", () => this.clearRecipe());
        this.saveRecipeBtn.addEventListener("click", () => this.saveRecipe());

        // Goal setting
        document.getElementById("saveGoalsBtn").addEventListener("click", () => this.saveGoals());

        // Print
        document.getElementById("printLabelBtn").addEventListener("click", () => this.printLabel());

        // Modal close buttons
        document.getElementById("closeRecipeModal").addEventListener("click", () => {
            document.getElementById("recipeModal").classList.remove("active");
        });
        document.getElementById("closeTemplateModal").addEventListener("click", () => {
            document.getElementById("templateModal").classList.remove("active");
        });
    }

    showSuggestions(query) {
        if (query.length < 1) {
            this.suggestionsContainer.classList.remove("active");
            return;
        }

        const matches = COMPLETE_FOOD_DATABASE.filter((food) =>
            food.name.toLowerCase().includes(query.toLowerCase())
        ).slice(0, 10);

        if (matches.length === 0) {
            this.suggestionsContainer.classList.remove("active");
            return;
        }

        this.suggestionsContainer.innerHTML = matches
            .map(
                (food) =>
                    `<div class="suggestion-item" onclick="analyzer.selectSuggestion('${food.name}', ${food.calories}, ${food.protein}, ${food.carbs}, ${food.fat}, ${food.fiber})">${food.name}</div>`
            )
            .join("");
        this.suggestionsContainer.classList.add("active");
    }

    selectSuggestion(name, calories, protein, carbs, fat, fiber) {
        this.ingredientInput.value = name;
        this.suggestionsContainer.classList.remove("active");
        this.addIngredient();
    }

    addIngredient() {
        const ingredientName = this.ingredientInput.value.trim();
        if (!ingredientName) return;

        const food = COMPLETE_FOOD_DATABASE.find(
            (f) => f.name.toLowerCase() === ingredientName.toLowerCase()
        );

        if (!food) {
            alert("Ingredient not found in database");
            return;
        }

        const ingredient = {
            name: food.name,
            quantity: 100,
            unit: food.unit || "g",
            calories: food.calories,
            protein: food.protein,
            carbs: food.carbs,
            fat: food.fat,
            fiber: food.fiber,
            vitamins: food.vitamins || {},
        };

        // Check if ingredient already exists
        const existing = this.ingredients.find((i) => i.name === ingredient.name);
        if (existing) {
            existing.quantity += 100;
        } else {
            this.ingredients.push(ingredient);
        }

        this.ingredientInput.value = "";
        this.suggestionsContainer.classList.remove("active");
        this.renderIngredients();
    }

    renderIngredients() {
        this.ingredientsList.innerHTML = this.ingredients
            .map(
                (ing, idx) =>
                    `
            <div class="item">
                <div class="item-name">${ing.name}</div>
                <input type="number" value="${ing.quantity}" class="item-quantity" onchange="analyzer.updateQuantity(${idx}, this.value)">
                <div class="item-quantity">${ing.unit}</div>
                <button class="item-remove" onclick="analyzer.removeIngredient(${idx})">
                    <i class="ri-close-line"></i>
                </button>
            </div>
            `
            )
            .join("");
    }

    updateQuantity(idx, quantity) {
        this.ingredients[idx].quantity = parseFloat(quantity) || 0;
    }

    removeIngredient(idx) {
        this.ingredients.splice(idx, 1);
        this.renderIngredients();
    }

    calculateNutrition() {
        if (this.ingredients.length === 0) {
            alert("Please add ingredients first");
            return;
        }

        const servings = parseFloat(this.servingSizeInput.value) || 1;

        // Calculate totals
        let totalCalories = 0;
        let totalProtein = 0;
        let totalCarbs = 0;
        let totalFats = 0;
        let totalFiber = 0;
        const allVitamins = {};

        this.ingredients.forEach((ing) => {
            // Calculate per quantity (usually per 100g)
            const multiplier = ing.quantity / 100;
            totalCalories += ing.calories * multiplier;
            totalProtein += ing.protein * multiplier;
            totalCarbs += ing.carbs * multiplier;
            totalFats += ing.fat * multiplier;
            totalFiber += ing.fiber * multiplier;

            // Collect vitamins
            Object.entries(ing.vitamins).forEach(([vitamin, value]) => {
                allVitamins[vitamin] = (allVitamins[vitamin] || 0) + value * multiplier;
            });
        });

        // Divide by servings
        this.currentRecipe = {
            name: this.recipeNameInput.value || "Unnamed Recipe",
            servings: servings,
            calories: totalCalories / servings,
            protein: totalProtein / servings,
            carbs: totalCarbs / servings,
            fats: totalFats / servings,
            fiber: totalFiber / servings,
            vitamins: allVitamins,
            totalCalories: totalCalories,
            totalProtein: totalProtein,
            totalCarbs: totalCarbs,
            totalFats: totalFats,
            date: new Date().toLocaleDateString(),
        };

        this.displayNutritionSummary();
        this.displayMacroBreakdown();
        this.displayVitamins();
        this.generateNutritionLabel();
        this.generateHealthInsights();
    }

    displayNutritionSummary() {
        document.getElementById("summaryCalories").textContent = Math.round(this.currentRecipe.calories);
        document.getElementById("summaryProtein").textContent = Math.round(this.currentRecipe.protein);
        document.getElementById("summaryCarbs").textContent = Math.round(this.currentRecipe.carbs);
        document.getElementById("summaryFats").textContent = Math.round(this.currentRecipe.fats);
    }

    displayMacroBreakdown() {
        const protein = this.currentRecipe.protein;
        const carbs = this.currentRecipe.carbs;
        const fats = this.currentRecipe.fats;
        const total = protein + carbs + fats;

        const proteinPercent = (protein / total) * 100;
        const carbsPercent = (carbs / total) * 100;
        const fatsPercent = (fats / total) * 100;

        // Draw pie chart
        const ctx = this.macroChart.getContext("2d");
        const width = this.macroChart.width;
        const height = this.macroChart.height;
        const centerX = width / 2;
        const centerY = height / 2;
        const radius = Math.min(width, height) / 3;

        ctx.clearRect(0, 0, width, height);

        // Draw pie slices
        const colors = ["#FF6B6B", "#4ECDC4", "#45B7D1"];
        const values = [proteinPercent, carbsPercent, fatsPercent];
        const labels = ["Protein", "Carbs", "Fats"];

        let startAngle = -Math.PI / 2;

        values.forEach((value, idx) => {
            const currentAngle = (value / 100) * Math.PI * 2;
            ctx.fillStyle = colors[idx];
            ctx.beginPath();
            ctx.moveTo(centerX, centerY);
            ctx.arc(centerX, centerY, radius, startAngle, startAngle + currentAngle);
            ctx.closePath();
            ctx.fill();

            // Draw labels
            const labelAngle = startAngle + currentAngle / 2;
            const labelX = centerX + Math.cos(labelAngle) * (radius * 0.7);
            const labelY = centerY + Math.sin(labelAngle) * (radius * 0.7);

            ctx.fillStyle = "white";
            ctx.font = "bold 12px Arial";
            ctx.textAlign = "center";
            ctx.textBaseline = "middle";
            ctx.fillText(Math.round(value) + "%", labelX, labelY);

            startAngle += currentAngle;
        });

        // Display goal comparison
        const goalComparison = document.getElementById("goalComparison");
        goalComparison.innerHTML = `
            <div class="progress-item">
                <div class="progress-label">
                    <span>Calories: ${Math.round(this.currentRecipe.calories)} / ${this.dailyGoals.calories}</span>
                    <span>${Math.round((this.currentRecipe.calories / this.dailyGoals.calories) * 100)}%</span>
                </div>
                <div class="progress-bar">
                    <div class="progress-fill" style="width: ${Math.min((this.currentRecipe.calories / this.dailyGoals.calories) * 100, 100)}%"></div>
                </div>
            </div>
            <div class="progress-item">
                <div class="progress-label">
                    <span>Protein: ${Math.round(this.currentRecipe.protein)}g / ${this.dailyGoals.protein}g</span>
                    <span>${Math.round((this.currentRecipe.protein / this.dailyGoals.protein) * 100)}%</span>
                </div>
                <div class="progress-bar">
                    <div class="progress-fill" style="width: ${Math.min((this.currentRecipe.protein / this.dailyGoals.protein) * 100, 100)}%"></div>
                </div>
            </div>
            <div class="progress-item">
                <div class="progress-label">
                    <span>Carbs: ${Math.round(this.currentRecipe.carbs)}g / ${this.dailyGoals.carbs}g</span>
                    <span>${Math.round((this.currentRecipe.carbs / this.dailyGoals.carbs) * 100)}%</span>
                </div>
                <div class="progress-bar">
                    <div class="progress-fill" style="width: ${Math.min((this.currentRecipe.carbs / this.dailyGoals.carbs) * 100, 100)}%"></div>
                </div>
            </div>
            <div class="progress-item">
                <div class="progress-label">
                    <span>Fats: ${Math.round(this.currentRecipe.fats)}g / ${this.dailyGoals.fats}g</span>
                    <span>${Math.round((this.currentRecipe.fats / this.dailyGoals.fats) * 100)}%</span>
                </div>
                <div class="progress-bar">
                    <div class="progress-fill" style="width: ${Math.min((this.currentRecipe.fats / this.dailyGoals.fats) * 100, 100)}%"></div>
                </div>
            </div>
        `;
    }

    displayVitamins() {
        const vitaminsList = document.getElementById("vitaminsList");
        const vitaminMap = {
            "Protein": { value: Math.round(this.currentRecipe.protein) + "g", icon: "💪" },
            "Fiber": { value: Math.round(this.currentRecipe.fiber) + "g", icon: "🌾" },
            "Vitamin A": { value: Math.round(this.currentRecipe.vitamins["A"] || 0), icon: "👁️" },
            "Vitamin C": { value: Math.round(this.currentRecipe.vitamins["C"] || 0) + "mg", icon: "🍊" },
            "Vitamin D": { value: Math.round(this.currentRecipe.vitamins["D"] || 0), icon: "☀️" },
            "Vitamin E": { value: Math.round(this.currentRecipe.vitamins["E"] || 0) + "mg", icon: "✨" },
            "Zinc": { value: Math.round(this.currentRecipe.vitamins["Zinc"] || 0) + "mg", icon: "⚡" },
            "Iron": { value: Math.round(this.currentRecipe.vitamins["Iron"] || 0) + "mg", icon: "⚙️" },
        };

        vitaminsList.innerHTML = Object.entries(vitaminMap)
            .map(
                ([name, data]) =>
                    `
            <div class="nutrient-item">
                <div class="nutrient-name">${data.icon} ${name}</div>
                <div class="nutrient-value">${data.value}</div>
            </div>
            `
            )
            .join("");
    }

    generateNutritionLabel() {
        const label = document.getElementById("nutritionLabel");

        // Estimate daily values
        const dailyValueCalories = 2000;
        const dailyValueProtein = 50;
        const dailyValueCarbs = 300;
        const dailyValueFats = 78;

        const proteinPercent = Math.round((this.currentRecipe.protein / dailyValueProtein) * 100);
        const carbsPercent = Math.round((this.currentRecipe.carbs / dailyValueCarbs) * 100);
        const fatsPercent = Math.round((this.currentRecipe.fats / dailyValueFats) * 100);

        label.innerHTML = `
            <div class="nutrition-facts-title">Nutrition Facts</div>
            <div class="serving-info">
                <strong>Serving Size:</strong> 1 Serving${this.currentRecipe.servings > 1 ? ` (Total: ${this.currentRecipe.servings})` : ""}<br>
                <strong>Servings Per Container:</strong> ${this.currentRecipe.servings}
            </div>
            
            <div class="calories-label">Calories ${Math.round(this.currentRecipe.calories)}</div>
            
            <div class="nutrient-row bold">
                <span>% Daily Value*</span>
            </div>
            
            <div class="nutrient-row">
                <span><strong>Total Fat</strong> ${Math.round(this.currentRecipe.fats)}g</span>
                <span><strong>${fatsPercent}%</strong></span>
            </div>
            
            <div class="nutrient-row">
                <span><strong>Carbohydrate</strong> ${Math.round(this.currentRecipe.carbs)}g</span>
                <span><strong>${carbsPercent}%</strong></span>
            </div>
            
            <div class="nutrient-row">
                <span><strong>Protein</strong> ${Math.round(this.currentRecipe.protein)}g</span>
                <span><strong>${proteinPercent}%</strong></span>
            </div>
            
            <div class="nutrient-row">
                <span>Dietary Fiber ${Math.round(this.currentRecipe.fiber)}g</span>
            </div>
            
            <div class="nutrient-row" style="font-size: 0.7rem; padding-top: 0.5rem;">
                <span>*Percent Daily Values are based on a 2,000 calorie diet.</span>
            </div>
        `;
    }

    generateHealthInsights() {
        const insights = [];
        const insightsList = document.getElementById("insightsList");

        // Calorie insights
        if (this.currentRecipe.calories > this.dailyGoals.calories) {
            insights.push({
                type: "warning",
                title: "High Calorie Content",
                text: `This serving contains ${Math.round(this.currentRecipe.calories)} calories, which is ${Math.round(((this.currentRecipe.calories / this.dailyGoals.calories) - 1) * 100)}% above your daily goal.`,
            });
        } else if (this.currentRecipe.calories < this.dailyGoals.calories / 2) {
            insights.push({
                type: "success",
                title: "Low Calorie Meal",
                text: `Great! This meal is low in calories and suitable for light eating or snacking.`,
            });
        }

        // Protein insights
        if (this.currentRecipe.protein < 10) {
            insights.push({
                type: "warning",
                title: "Low Protein",
                text: "This recipe is low in protein. Consider adding chicken, eggs, or legumes for more protein.",
            });
        } else if (this.currentRecipe.protein > 30) {
            insights.push({
                type: "success",
                title: "Protein Rich",
                text: `Excellent! This meal contains ${Math.round(this.currentRecipe.protein)}g of protein, great for muscle recovery.`,
            });
        }

        // Fiber insights
        if (this.currentRecipe.fiber > 5) {
            insights.push({
                type: "success",
                title: "Good Fiber Content",
                text: `This recipe contains ${Math.round(this.currentRecipe.fiber)}g of fiber, which is beneficial for digestion.`,
            });
        }

        // Macro balance
        const totalMacro = this.currentRecipe.protein + this.currentRecipe.carbs + this.currentRecipe.fats;
        const proteinPercent = (this.currentRecipe.protein / totalMacro) * 100;

        if (proteinPercent > 30) {
            insights.push({
                type: "success",
                title: "Balanced Macros",
                text: "Good macro distribution for muscle building and recovery.",
            });
        }

        if (insightsList) {
            insightsList.innerHTML = insights
                .map(
                    (insight) =>
                        `
                <div class="insight-item ${insight.type}">
                    <div class="insight-title">${insight.title}</div>
                    <div class="insight-text">${insight.text}</div>
                </div>
                `
                )
                .join("");
        }
    }

    saveRecipe() {
        if (!this.currentRecipe) {
            alert("Please calculate nutrition first");
            return;
        }

        const recipe = {
            ...this.currentRecipe,
            ingredients: this.ingredients.map((ing) => ({
                name: ing.name,
                quantity: ing.quantity,
                unit: ing.unit,
            })),
        };

        this.savedRecipes.push(recipe);
        this.saveToLocalStorage();
        this.renderSavedRecipes();
        alert("Recipe saved!");
    }

    renderSavedRecipes() {
        this.savedRecipesList.innerHTML = this.savedRecipes
            .map((recipe, idx) => {
                const recipeCalories = Math.round(recipe.calories);
                const recipeProtein = Math.round(recipe.protein);
                return `
                <div class="saved-recipe-item">
                    <div class="recipe-name">${recipe.name}</div>
                    <div class="recipe-details">${recipeCalories} cal | ${recipeProtein}g protein</div>
                    <div class="recipe-actions">
                        <button class="btn-secondary" onclick="analyzer.loadRecipe(${idx})">Load</button>
                        <button class="btn-danger" onclick="analyzer.deleteRecipe(${idx})">Delete</button>
                    </div>
                </div>
                `;
            })
            .join("");
    }

    loadRecipe(idx) {
        const recipe = this.savedRecipes[idx];
        this.recipeNameInput.value = recipe.name;
        this.servingSizeInput.value = recipe.servings;
        this.ingredients = recipe.ingredients.map((ing) => {
            const food = COMPLETE_FOOD_DATABASE.find((f) => f.name === ing.name);
            return {
                ...ing,
                calories: food?.calories || 0,
                protein: food?.protein || 0,
                carbs: food?.carbs || 0,
                fat: food?.fat || 0,
                fiber: food?.fiber || 0,
                vitamins: food?.vitamins || {},
            };
        });

        this.renderIngredients();
        this.calculateNutrition();
    }

    deleteRecipe(idx) {
        if (confirm("Delete this recipe?")) {
            this.savedRecipes.splice(idx, 1);
            this.saveToLocalStorage();
            this.renderSavedRecipes();
        }
    }

    clearRecipe() {
        this.ingredients = [];
        this.currentRecipe = null;
        this.recipeNameInput.value = "";
        this.servingSizeInput.value = "1";
        this.renderIngredients();
        document.getElementById("nutritionLabel").innerHTML =
            '<div class="label-placeholder"><p>Calculate nutrition to view FDA-style label</p></div>';
    }

    saveGoals() {
        this.dailyGoals = {
            calories: parseFloat(document.getElementById("goalCalories").value),
            protein: parseFloat(document.getElementById("goalProtein").value),
            carbs: parseFloat(document.getElementById("goalCarbs").value),
            fats: parseFloat(document.getElementById("goalFats").value),
        };
        this.saveToLocalStorage();
        if (this.currentRecipe) {
            this.displayMacroBreakdown();
        }
        alert("Daily goals saved!");
    }

    printLabel() {
        window.print();
    }

    deployTemplates() {
        // Add template buttons to UI (optional enhancement)
        // This could be expanded to show templates in a modal
    }

    setupMacroChart() {
        // Initialize canvas for macro chart
        this.macroChart.width = 300;
        this.macroChart.height = 300;
    }

    saveToLocalStorage() {
        localStorage.setItem(
            "recipeAnalyzer",
            JSON.stringify({
                recipes: this.savedRecipes,
                goals: this.dailyGoals,
            })
        );
    }

    loadFromLocalStorage() {
        const data = localStorage.getItem("recipeAnalyzer");
        if (data) {
            const parsed = JSON.parse(data);
            this.savedRecipes = parsed.recipes || [];
            this.dailyGoals = parsed.goals || this.dailyGoals;

            // Update goal inputs
            document.getElementById("goalCalories").value = this.dailyGoals.calories;
            document.getElementById("goalProtein").value = this.dailyGoals.protein;
            document.getElementById("goalCarbs").value = this.dailyGoals.carbs;
            document.getElementById("goalFats").value = this.dailyGoals.fats;
        }
    }
}

// Initialize application
let analyzer;
window.addEventListener("load", () => {
    analyzer = new RecipeAnalyzer();
});
