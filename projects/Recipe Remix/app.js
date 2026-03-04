// Recipe Remix - main JS

const pantryInput = document.getElementById('pantry-input');
const generateBtn = document.getElementById('generate-btn');
const recipeOutput = document.getElementById('recipe-output');
const saveFavoriteBtn = document.getElementById('save-favorite');

const favoritesList = document.getElementById('favorites-list');
const historyList = document.getElementById('history-list');
function updateHistory() {
    const history = JSON.parse(localStorage.getItem('recipeRemixHistory') || '[]');
    historyList.innerHTML = '';
    history.slice(-10).reverse().forEach(item => {
        const li = document.createElement('li');
        li.textContent = item;
        historyList.appendChild(li);
    });
}
const clearPantryBtn = document.getElementById('clear-pantry-btn');
// Clear pantry input
clearPantryBtn.onclick = () => {
    pantryInput.value = '';
    recipeOutput.textContent = '';
    saveFavoriteBtn.style.display = 'none';
};

// Simulate AI recipe generation
function generateRecipe(ingredients) {
    if (!ingredients.length) return 'Please enter some pantry items!';
    const ideas = [
        `How about a frittata with ${ingredients.join(', ')}?`,
        `Try making pancakes using ${ingredients.join(', ')}!`,
        `A creative stir-fry with ${ingredients.join(', ')} could be delicious!`,
        `Mix ${ingredients.join(', ')} for a unique salad.`,
        `Bake a casserole with ${ingredients.join(', ')}.`
    ];
    return ideas[Math.floor(Math.random() * ideas.length)];
}

function updateFavorites() {
    const favorites = JSON.parse(localStorage.getItem('recipeRemixFavorites') || '[]');
    favoritesList.innerHTML = '';
    favorites.forEach((fav, idx) => {
        const li = document.createElement('li');
        li.textContent = fav;
        const removeBtn = document.createElement('button');
        removeBtn.textContent = 'Remove';
        removeBtn.onclick = () => {
            favorites.splice(idx, 1);
            localStorage.setItem('recipeRemixFavorites', JSON.stringify(favorites));
            updateFavorites();
        };
        li.appendChild(removeBtn);
        favoritesList.appendChild(li);
    });
}

generateBtn.onclick = () => {
    const ingredients = pantryInput.value.split(',').map(i => i.trim()).filter(Boolean);
    const recipe = generateRecipe(ingredients);
    recipeOutput.textContent = recipe;
    saveFavoriteBtn.style.display = recipe && !recipe.startsWith('Please') ? 'inline-block' : 'none';
    if (recipe && !recipe.startsWith('Please')) {
        let history = JSON.parse(localStorage.getItem('recipeRemixHistory') || '[]');
        history.push(recipe);
        localStorage.setItem('recipeRemixHistory', JSON.stringify(history));
        updateHistory();
    }
};

saveFavoriteBtn.onclick = () => {
    const recipe = recipeOutput.textContent;
    if (!recipe) return;
    const favorites = JSON.parse(localStorage.getItem('recipeRemixFavorites') || '[]');
    if (!favorites.includes(recipe)) {
        favorites.push(recipe);
        localStorage.setItem('recipeRemixFavorites', JSON.stringify(favorites));
        updateFavorites();
    }
};

// Load favorites and history on page load
updateFavorites();
updateHistory();
