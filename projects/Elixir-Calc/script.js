// --- Mock Card Database ---
const cardDatabase = [
    { id: 1, name: "Hog Rider", cost: 4, type: "troop", tags: ["win-condition"] },
    { id: 2, name: "Fireball", cost: 4, type: "spell", tags: ["heavy-spell"] },
    { id: 3, name: "The Log", cost: 2, type: "spell", tags: ["light-spell"] },
    { id: 4, name: "Knight (Evo)", cost: 3, type: "troop", tags: ["mini-tank", "evolution"] },
    { id: 5, name: "Musketeer", cost: 4, type: "troop", tags: ["anti-air"] },
    { id: 6, name: "Skeletons", cost: 1, type: "troop", tags: ["cycle"] },
    { id: 7, name: "Cannon", cost: 3, type: "building", tags: ["defense"] },
    { id: 8, name: "Ice Spirit", cost: 1, type: "troop", tags: ["cycle", "anti-air"] },
    { id: 9, name: "Goblin Barrel", cost: 3, type: "spell", tags: ["win-condition"] },
    { id: 10, name: "Inferno Tower", cost: 5, type: "building", tags: ["defense", "anti-air"] },
    { id: 11, name: "Firecracker (Evo)", cost: 3, type: "troop", tags: ["anti-air", "evolution"] },
    { id: 12, name: "Zap", cost: 2, type: "spell", tags: ["light-spell", "anti-air"] },
    { id: 13, name: "Valkyrie", cost: 4, type: "troop", tags: ["mini-tank", "splash"] },
    { id: 14, name: "Miner", cost: 3, type: "troop", tags: ["win-condition"] },
    { id: 15, name: "Poison", cost: 4, type: "spell", tags: ["heavy-spell"] },
    { id: 16, name: "Bats", cost: 2, type: "troop", tags: ["swarm", "anti-air"] }
];

// --- State ---
let activeDeck = []; // Max length 8
const MAX_CARDS = 8;

// --- DOM Elements ---
const deckGrid = document.getElementById('activeDeck');
const rosterGrid = document.getElementById('cardRoster');
const avgElixirDisplay = document.getElementById('avgElixir');
const deckCountDisplay = document.getElementById('deckCount');
const warningsContainer = document.getElementById('synergyWarnings');
const filterBtns = document.querySelectorAll('.filter-btn');

// --- Initialization ---
function init() {
    renderDeck();
    renderRoster("all");

    filterBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            filterBtns.forEach(b => b.classList.remove('active'));
            e.target.classList.add('active');
            renderRoster(e.target.getAttribute('data-filter'));
        });
    });
}

// --- Render Logic ---
function renderDeck() {
    deckGrid.innerHTML = '';
    deckCountDisplay.innerText = activeDeck.length;

    // Always render 8 slots
    for (let i = 0; i < MAX_CARDS; i++) {
        const slot = document.createElement('div');
        slot.className = 'card-slot';

        if (activeDeck[i]) {
            const card = activeDeck[i];
            slot.classList.add('filled');
            if (card.tags.includes('evolution')) slot.classList.add('evo');
            
            slot.innerHTML = `
                <div class="card-cost">${card.cost}</div>
                <div class="card-name">${card.name}</div>
            `;
            // Remove on click
            slot.addEventListener('click', () => removeCard(card.id));
        }

        deckGrid.appendChild(slot);
    }

    calculateSynergy();
}

function renderRoster(filterType) {
    rosterGrid.innerHTML = '';
    
    const filteredCards = filterType === "all" 
        ? cardDatabase 
        : cardDatabase.filter(c => c.type === filterType);

    filteredCards.forEach(card => {
        const isSelected = activeDeck.some(c => c.id === card.id);
        
        const cardEl = document.createElement('div');
        cardEl.className = `roster-card ${isSelected ? 'selected' : ''}`;
        if (card.tags.includes('evolution')) cardEl.classList.add('evo');

        cardEl.innerHTML = `
            <div class="card-cost">${card.cost}</div>
            <div class="card-name">${card.name}</div>
        `;

        if (!isSelected) {
            cardEl.addEventListener('click', () => addCard(card));
        }

        rosterGrid.appendChild(cardEl);
    });
}

// --- State Management ---
function addCard(card) {
    if (activeDeck.length < MAX_CARDS) {
        activeDeck.push(card);
        renderDeck();
        // Re-render roster to apply 'selected' state visually
        const currentFilter = document.querySelector('.filter-btn.active').getAttribute('data-filter');
        renderRoster(currentFilter);
    }
}

function removeCard(id) {
    activeDeck = activeDeck.filter(c => c.id !== id);
    renderDeck();
    const currentFilter = document.querySelector('.filter-btn.active').getAttribute('data-filter');
    renderRoster(currentFilter);
}

// --- Synergy & Math ---
function calculateSynergy() {
    // 1. Average Elixir
    if (activeDeck.length === 0) {
        avgElixirDisplay.innerText = "0.0";
    } else {
        const total = activeDeck.reduce((sum, card) => sum + card.cost, 0);
        avgElixirDisplay.innerText = (total / activeDeck.length).toFixed(1);
    }

    warningsContainer.innerHTML = '';

    // Only show synergy data if deck is partially or fully built
    if (activeDeck.length < 4) {
        warningsContainer.innerHTML = `<span class="warning-badge" style="color:#9ca3af; border-color:#4b5563; background: transparent;">Add cards to analyze</span>`;
        return;
    }

    // Combine all tags in the current deck
    const deckTags = activeDeck.flatMap(card => card.tags);

    let hasWinCon = deckTags.includes('win-condition');
    let hasAntiAir = deckTags.includes('anti-air');
    let hasSpell = deckTags.includes('light-spell') || deckTags.includes('heavy-spell');
    let evoCount = deckTags.filter(t => t === 'evolution').length;

    if (!hasWinCon) addBadge("Missing Win Condition", false);
    if (!hasAntiAir) addBadge("Weak to Air", false);
    if (!hasSpell) addBadge("Needs a Spell", false);
    if (evoCount > 2) addBadge("Too Many Evos!", false);

    if (hasWinCon && hasAntiAir && hasSpell && evoCount <= 2 && activeDeck.length === 8) {
        addBadge("Deck Balanced!", true);
    }
}

function addBadge(text, isSuccess) {
    const span = document.createElement('span');
    span.className = isSuccess ? 'success-badge' : 'warning-badge';
    span.innerText = text;
    warningsContainer.appendChild(span);
}

init();