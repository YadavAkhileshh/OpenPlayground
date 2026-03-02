// Comprehensive Food Database
const FOOD_DATABASE = [
    // Proteins
    { name: "Chicken Breast", calories: 165, protein: 31, carbs: 0, fat: 3.6, fiber: 0, unit: "100g", vitamins: { 'B12': 0.3, 'B6': 0.9, 'Niacin': 10.3 } },
    { name: "Salmon", calories: 208, protein: 22, carbs: 0, fat: 13, fiber: 0, unit: "100g", vitamins: { 'Omega-3': 2.3, 'D': 570, 'B12': 3.2 } },
    { name: "Lean Beef", calories: 250, protein: 26, carbs: 0, fat: 15, fiber: 0, unit: "100g", vitamins: { 'B12': 1.5, 'Iron': 2.6, 'Zinc': 6 } },
    { name: "Turkey Breast", calories: 135, protein: 29, carbs: 0, fat: 1, fiber: 0, unit: "100g", vitamins: { 'B6': 0.9, 'Niacin': 5.1 } },
    { name: "Eggs", calories: 155, protein: 13, carbs: 1.1, fat: 11, fiber: 0, unit: "100g", vitamins: { 'B12': 0.89, 'Choline': 251 } },
    { name: "Tuna", calories: 132, protein: 29, carbs: 0, fat: 0.5, fiber: 0, unit: "100g", vitamins: { 'Omega-3': 0.3, 'Selenium': 90 } },
    { name: "Shrimp", calories: 99, protein: 24, carbs: 0, fat: 0.3, fiber: 0, unit: "100g", vitamins: { 'Selenium': 55, 'B12': 0.34 } },
    { name: "Tofu", calories: 76, protein: 8, carbs: 2, fat: 5, fiber: 0.4, unit: "100g", vitamins: { 'Iron': 2.7 } },
    { name: "Greek Yogurt", calories: 59, protein: 10, carbs: 3.3, fat: 0.4, fiber: 0, unit: "100g", vitamins: { 'B12': 0.37 } },
    { name: "Cottage Cheese", calories: 98, protein: 11, carbs: 3.4, fat: 5, fiber: 0, unit: "100g", vitamins: { 'B12': 0.78 } },
    { name: "Pork Tenderloin", calories: 242, protein: 27, carbs: 0, fat: 14, fiber: 0, unit: "100g", vitamins: { 'B1': 0.64, 'B12': 0.7 } },
    { name: "Lentils", calories: 116, protein: 9, carbs: 20, fat: 0.4, fiber: 8, unit: "100g", vitamins: { 'Folate': 181, 'Iron': 3.3 } },

    // Vegetables
    { name: "Broccoli", calories: 34, protein: 2.8, carbs: 7, fat: 0.4, fiber: 2.4, unit: "100g", vitamins: { 'C': 89.2, 'K': 101.6, 'Folate': 63 } },
    { name: "Spinach", calories: 23, protein: 2.9, carbs: 3.6, fat: 0.4, fiber: 2.7, unit: "100g", vitamins: { 'K': 482.9, 'A': 469, 'Folate': 194 } },
    { name: "Carrots", calories: 41, protein: 0.9, carbs: 10, fat: 0.2, fiber: 2.8, unit: "100g", vitamins: { 'A': 835, 'K': 13.2, 'C': 5.9 } },
    { name: "Tomato", calories: 18, protein: 0.9, carbs: 3.9, fat: 0.2, fiber: 1.2, unit: "100g", vitamins: { 'C': 12.7, 'K': 7.9, 'Lycopene': 2573 } },
    { name: "Bell Pepper", calories: 31, protein: 1, carbs: 6, fat: 0.3, fiber: 2.2, unit: "100g", vitamins: { 'C': 80.4, 'A': 48.2, 'K': 4.9 } },
    { name: "Lettuce", calories: 15, protein: 1.4, carbs: 3, fat: 0.2, fiber: 1.3, unit: "100g", vitamins: { 'K': 102.5, 'A': 141, 'Folate': 38 } },
    { name: "Cucumber", calories: 16, protein: 0.7, carbs: 4, fat: 0.1, fiber: 0.5, unit: "100g", vitamins: { 'K': 16.4 } },
    { name: "Broccoli Sprouts", calories: 34, protein: 2.8, carbs: 7, fat: 0.4, fiber: 2.4, unit: "100g", vitamins: { 'C': 89.2 } },
    { name: "Kale", calories: 49, protein: 4.3, carbs: 9, fat: 0.9, fiber: 1.3, unit: "100g", vitamins: { 'K': 704.8, 'C': 80.4 } },
    { name: "Cabbage", calories: 25, protein: 1.3, carbs: 6, fat: 0.1, fiber: 2.3, unit: "100g", vitamins: { 'C': 36.6, 'K': 76.4 } },
    { name: "Zucchini", calories: 21, protein: 1.5, carbs: 4, fat: 0.4, fiber: 1.1, unit: "100g", vitamins: { 'C': 20, 'A': 39 } },
    { name: "Asparagus", calories: 27, protein: 3, carbs: 5, fat: 0.1, fiber: 2.1, unit: "100g", vitamins: { 'K': 91.6, 'Folate': 149 } },
    { name: "Green Beans", calories: 31, protein: 1.8, carbs: 7, fat: 0.2, fiber: 2.7, unit: "100g", vitamins: { 'C': 16.4, 'K': 29.8 } },

    // Fruits
    { name: "Banana", calories: 89, protein: 1.1, carbs: 23, fat: 0.3, fiber: 2.6, unit: "100g", vitamins: { 'B6': 0.4, 'C': 8.7, 'Potassium': 358 } },
    { name: "Apple", calories: 52, protein: 0.3, carbs: 14, fat: 0.2, fiber: 2.4, unit: "100g", vitamins: { 'C': 4.6, 'K': 2.2 } },
    { name: "Blueberries", calories: 57, protein: 0.7, carbs: 14, fat: 0.3, fiber: 2.4, unit: "100g", vitamins: { 'C': 9.7, 'K': 19.3 } },
    { name: "Strawberries", calories: 32, protein: 0.8, carbs: 8, fat: 0.3, fiber: 2, unit: "100g", vitamins: { 'C': 58.8, 'Manganese': 0.4 } },
    { name: "Orange", calories: 47, protein: 0.9, carbs: 12, fat: 0.3, fiber: 2.4, unit: "100g", vitamins: { 'C': 53.2, 'Folate': 30 } },
    { name: "Watermelon", calories: 30, protein: 0.6, carbs: 8, fat: 0.2, fiber: 0.4, unit: "100g", vitamins: { 'C': 8.1, 'Lycopene': 4532 } },
    { name: "Grapes", calories: 67, protein: 0.7, carbs: 17, fat: 0.2, fiber: 0.9, unit: "100g", vitamins: { 'C': 3.7 } },
    { name: "Avocado", calories: 160, protein: 2, carbs: 9, fat: 15, fiber: 7, unit: "100g", vitamins: { 'K': 21, 'E': 1.5 } },
    { name: "Mango", calories: 60, protein: 0.8, carbs: 15, fat: 0.4, fiber: 1.6, unit: "100g", vitamins: { 'C': 36.4, 'A': 54 } },
    { name: "Kiwi", calories: 61, protein: 1.1, carbs: 15, fat: 0.5, fiber: 3, unit: "100g", vitamins: { 'C': 92.7, 'K': 27.8 } },
    { name: "Lemon", calories: 29, protein: 1.1, carbs: 9, fat: 0.3, fiber: 2.8, unit: "100g", vitamins: { 'C': 53 } },

    // Grains & Carbs
    { name: "Brown Rice", calories: 111, protein: 2.6, carbs: 23, fat: 0.9, fiber: 1.8, unit: "100g", vitamins: { 'B1': 0.19, 'Manganese': 1.3 } },
    { name: "White Rice", calories: 130, protein: 2.7, carbs: 28, fat: 0.3, fiber: 0.4, unit: "100g", vitamins: { 'B1': 0.07 } },
    { name: "Quinoa", calories: 120, protein: 4.4, carbs: 21, fat: 1.9, fiber: 2.8, unit: "100g", vitamins: { 'Manganese': 1.2, 'Magnesium': 197 } },
    { name: "Whole Wheat Bread", calories: 247, protein: 9, carbs: 44, fat: 4.6, fiber: 7, unit: "100g", vitamins: { 'B1': 0.5 } },
    { name: "White Bread", calories: 265, protein: 9, carbs: 49, fat: 3.2, fiber: 2.7, unit: "100g", vitamins: { 'B1': 0.3 } },
    { name: "Oats", calories: 389, protein: 17, carbs: 66, fat: 7, fiber: 10, unit: "100g", vitamins: { 'Manganese': 5, 'Phosphorus': 523 } },
    { name: "Pasta", calories: 131, protein: 5, carbs: 25, fat: 1, fiber: 1.8, unit: "100g", vitamins: { 'B1': 0.1 } },
    { name: "Sweet Potato", calories: 86, protein: 1.6, carbs: 20, fat: 0.1, fiber: 3, unit: "100g", vitamins: { 'A': 714, 'C': 2.4 } },
    { name: "Potato", calories: 77, protein: 2, carbs: 17, fat: 0.1, fiber: 2.1, unit: "100g", vitamins: { 'B6': 0.3, 'C': 19.7 } },
    { name: "Barley", calories: 354, protein: 12, carbs: 73, fat: 2, fiber: 17, unit: "100g", vitamins: { 'Selenium': 37 } },
    { name: "Couscous", calories: 112, protein: 3.8, carbs: 23, fat: 0.14, fiber: 1.5, unit: "100g", vitamins: { 'Selenium': 48.5 } },

    // Dairy & Alternatives
    { name: "Milk (Whole)", calories: 61, protein: 3.2, carbs: 4.8, fat: 3.3, fiber: 0, unit: "100g", vitamins: { 'B12': 0.36, 'Calcium': 113 } },
    { name: "Milk (Skim)", calories: 35, protein: 3.4, carbs: 5, fat: 0.1, fiber: 0, unit: "100g", vitamins: { 'B12': 0.37, 'Calcium': 125 } },
    { name: "Parmesan Cheese", calories: 431, protein: 38, carbs: 1.3, fat: 29, fiber: 0, unit: "100g", vitamins: { 'B12': 1.48, 'Calcium': 1184 } },
    { name: "Cheddar Cheese", calories: 403, protein: 23, carbs: 1.3, fat: 33, fiber: 0, unit: "100g", vitamins: { 'B12': 0.66, 'Calcium': 721 } },
    { name: "Butter", calories: 717, protein: 0.9, carbs: 0.1, fat: 81, fiber: 0, unit: "100g", vitamins: { 'A': 684 } },
    { name: "Almond Milk", calories: 30, protein: 1, carbs: 1.3, fat: 2.5, fiber: 0.4, unit: "100g", vitamins: { 'E': 7.4, 'Calcium': 240 } },
    { name: "Coconut Milk", calories: 230, protein: 2.3, carbs: 5.5, fat: 24, fiber: 0, unit: "100g", vitamins: { 'Iron': 4 } },

    // Nuts & Seeds
    { name: "Almonds", calories: 579, protein: 21, carbs: 22, fat: 50, fiber: 12.5, unit: "100g", vitamins: { 'E': 25.6, 'Magnesium': 270 } },
    { name: "Walnuts", calories: 654, protein: 9, carbs: 14, fat: 65, fiber: 6.7, unit: "100g", vitamins: { 'Omega-3': 9.08 } },
    { name: "Peanuts", calories: 567, protein: 26, carbs: 16, fat: 49, fiber: 8.6, unit: "100g", vitamins: { 'B1': 0.74, 'E': 8.3 } },
    { name: "Chia Seeds", calories: 486, protein: 17, carbs: 42, fat: 31, fiber: 34, unit: "100g", vitamins: { 'Omega-3': 17.8 } },
    { name: "Flax Seeds", calories: 534, protein: 18, carbs: 29, fat: 42, fiber: 27, unit: "100g", vitamins: { 'Omega-3': 22.8 } },
    { name: "Pumpkin Seeds", calories: 541, protein: 24, carbs: 5, fat: 46, fiber: 1.1, unit: "100g", vitamins: { 'Magnesium': 592, 'Iron': 8.8 } },
    { name: "Sunflower Seeds", calories: 584, protein: 20, carbs: 20, fat: 51, fiber: 8.6, unit: "100g", vitamins: { 'E': 37.3, 'Selenium': 79.2 } },

    // Legumes
    { name: "Black Beans", calories: 132, protein: 8.9, carbs: 24, fat: 0.5, fiber: 6.4, unit: "100g", vitamins: { 'Folate': 149, 'Iron': 2.1 } },
    { name: "Chickpeas", calories: 164, protein: 9, carbs: 27, fat: 2.6, fiber: 7.6, unit: "100g", vitamins: { 'Folate': 172, 'Iron': 4.3 } },
    { name: "Kidney Beans", calories: 127, protein: 8.7, carbs: 23, fat: 0.4, fiber: 6.4, unit: "100g", vitamins: { 'Folate': 130, 'Iron': 2.6 } },
    { name: "Peas", calories: 81, protein: 5.4, carbs: 14, fat: 0.4, fiber: 2.7, unit: "100g", vitamins: { 'Vitamin C': 40, 'K': 24.8 } },

    // Oils & Condiments
    { name: "Olive Oil", calories: 884, protein: 0, carbs: 0, fat: 100, fiber: 0, unit: "100g", vitamins: { 'E': 14.4, 'K': 60.2 } },
    { name: "Coconut Oil", calories: 892, protein: 0, carbs: 0, fat: 100, fiber: 0, unit: "100g", vitamins: {} },
    { name: "Honey", calories: 304, protein: 0.3, carbs: 82, fat: 0, fiber: 0.2, unit: "100g", vitamins: {} },
    { name: "Peanut Butter", calories: 588, protein: 25, carbs: 20, fat: 50, fiber: 5.7, unit: "100g", vitamins: { 'B1': 0.64, 'E': 4.6 } },

    // Cereals & Sweets
    { name: "Wheat Cereal", calories: 360, protein: 10, carbs: 73, fat: 1.5, fiber: 2.5, unit: "100g", vitamins: { 'B1': 0.5, 'Iron': 8 } },
    { name: "Dark Chocolate", calories: 598, protein: 6, carbs: 46, fat: 42, fiber: 7, unit: "100g", vitamins: { 'Iron': 12, 'Magnesium': 228 } },
];

// Extend the database with more items
const EXTENDED_DATABASE = [
    // More proteins
    { name: "Ham", calories: 215, protein: 23, carbs: 1.6, fat: 13, fiber: 0, unit: "100g", vitamins: { 'B1': 0.76 } },
    { name: "Bacon", calories: 541, protein: 37, carbs: 0.2, fat: 43, fiber: 0, unit: "100g", vitamins: { 'B1': 0.64, 'B2': 0.25 } },
    { name: "Ground Turkey", calories: 170, protein: 20, carbs: 0, fat: 10, fiber: 0, unit: "100g", vitamins: { 'B6': 0.7 } },
    { name: "Duck Breast", calories: 337, protein: 19, carbs: 0, fat: 29, fiber: 0, unit: "100g", vitamins: { 'B2': 0.3, 'Iron': 2.3 } },
    { name: "Lamb", calories: 294, protein: 25, carbs: 0, fat: 21, fiber: 0, unit: "100g", vitamins: { 'B12': 2.4, 'Iron': 2.1 } },
    { name: "Veal", calories: 180, protein: 29, carbs: 0, fat: 7, fiber: 0, unit: "100g", vitamins: { 'B12': 1.3 } },
    { name: "Fish Fillet", calories: 100, protein: 23, carbs: 0, fat: 0.8, fiber: 0, unit: "100g", vitamins: { 'D': 400, 'Selenium': 36 } },
    { name: "Lobster", calories: 89, protein: 19.3, carbs: 0.5, fat: 0.9, fiber: 0, unit: "100g", vitamins: { 'Selenium': 88 } },
    { name: "Crab", calories: 87, protein: 18, carbs: 0.8, fat: 1.1, fiber: 0, unit: "100g", vitamins: { 'B12': 4.2, 'Selenium': 87 } },
    { name: "Mozzarella", calories: 280, protein: 28, carbs: 3.1, fat: 17, fiber: 0, unit: "100g", vitamins: { 'B12': 0.63 } },
    { name: "Feta Cheese", calories: 265, protein: 14, carbs: 4.1, fat: 21, fiber: 0, unit: "100g", vitamins: { 'B12': 0.96 } },

    // More vegetables
    { name: "Cauliflower", calories: 25, protein: 1.9, carbs: 5, fat: 0.3, fiber: 2.4, unit: "100g", vitamins: { 'C': 46.4, 'K': 20, 'Folate': 57 } },
    { name: "Brussels Sprouts", calories: 43, protein: 3.4, carbs: 9, fat: 0.3, fiber: 2.4, unit: "100g", vitamins: { 'C': 85, 'K': 177 } },
    { name: "Celery", calories: 16, protein: 0.7, carbs: 3.7, fat: 0.2, fiber: 1.6, unit: "100g", vitamins: { 'K': 29.3, 'C': 3.1 } },
    { name: "Beet", calories: 43, protein: 1.7, carbs: 10, fat: 0.2, fiber: 2.4, unit: "100g", vitamins: { 'Folate': 109, 'Manganese': 0.3 } },
    { name: "Corn", calories: 86, protein: 3.3, carbs: 19, fat: 1.4, fiber: 2.4, unit: "100g", vitamins: { 'C': 6.8, 'Folate': 46 } },
    { name: "Eggplant", calories: 25, protein: 0.98, carbs: 6, fat: 0.2, fiber: 3, unit: "100g", vitamins: { 'C': 2.2 } },
    { name: "Mushroom", calories: 22, protein: 3.1, carbs: 3.3, fat: 0.3, fiber: 1, unit: "100g", vitamins: { 'D': 570, 'B2': 0.4 } },
    { name: "Onion", calories: 40, protein: 1.1, carbs: 9, fat: 0.1, fiber: 1.7, unit: "100g", vitamins: { 'C': 7.4, 'B6': 0.1 } },
    { name: "Garlic", calories: 149, protein: 6.4, carbs: 33, fat: 0.5, fiber: 2.1, unit: "100g", vitamins: { 'B6': 1.2, 'C': 31.2 } },
];

// Combine all databases
const COMPLETE_FOOD_DATABASE = [...FOOD_DATABASE, ...EXTENDED_DATABASE];

// Quick reference for common items
const QUICK_ITEMS = [
    "Chicken Breast",
    "Salmon",
    "Eggs",
    "Broccoli",
    "Spinach",
    "Brown Rice",
    "Sweet Potato",
    "Almonds",
    "Greek Yogurt",
    "Banana",
    "Oats",
    "Olive Oil",
    "Lentils",
    "Tomato",
    "Mushroom",
];

// Recipe templates
const RECIPE_TEMPLATES = [
    {
        name: "Grilled Chicken Salad",
        ingredients: [
            { name: "Chicken Breast", quantity: 150, unit: "g" },
            { name: "Spinach", quantity: 100, unit: "g" },
            { name: "Tomato", quantity: 100, unit: "g" },
            { name: "Olive Oil", quantity: 15, unit: "ml" },
            { name: "Mushroom", quantity: 50, unit: "g" },
        ],
    },
    {
        name: "Pasta with Vegetables",
        ingredients: [
            { name: "Pasta", quantity: 150, unit: "g" },
            { name: "Tomato", quantity: 200, unit: "g" },
            { name: "Broccoli", quantity: 100, unit: "g" },
            { name: "Garlic", quantity: 10, unit: "g" },
            { name: "Olive Oil", quantity: 10, unit: "ml" },
        ],
    },
    {
        name: "Smoothie Bowl",
        ingredients: [
            { name: "Greek Yogurt", quantity: 150, unit: "g" },
            { name: "Banana", quantity: 100, unit: "g" },
            { name: "Blueberries", quantity: 50, unit: "g" },
            { name: "Almonds", quantity: 30, unit: "g" },
            { name: "Honey", quantity: 10, unit: "ml" },
        ],
    },
    {
        name: "Vegetable Stir-Fry",
        ingredients: [
            { name: "Broccoli", quantity: 150, unit: "g" },
            { name: "Bell Pepper", quantity: 100, unit: "g" },
            { name: "Mushroom", quantity: 100, unit: "g" },
            { name: "Garlic", quantity: 15, unit: "g" },
            { name: "Olive Oil", quantity: 15, unit: "ml" },
        ],
    },
    {
        name: "Breakfast Oatmeal",
        ingredients: [
            { name: "Oats", quantity: 50, unit: "g" },
            { name: "Milk (Whole)", quantity: 200, unit: "ml" },
            { name: "Banana", quantity: 80, unit: "g" },
            { name: "Almonds", quantity: 20, unit: "g" },
            { name: "Honey", quantity: 10, unit: "ml" },
        ],
    },
];
