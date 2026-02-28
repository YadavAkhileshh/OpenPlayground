// --- Game Data & Configuration ---
const UPGRADES_CONFIG = [
    { id: 'cooling', name: 'Cooling Fan', icon: '🌀', baseCost: 15, baseYield: 0.5, desc: 'Prevents thermal throttling.' },
    { id: 'raspi', name: 'Raspberry Pi Cluster', icon: '🍓', baseCost: 100, baseYield: 4, desc: 'A tiny but mighty worker pool.' },
    { id: 'ec2', name: 'AWS EC2 Instance', icon: '☁️', baseCost: 1100, baseYield: 32, desc: 'Scalable cloud compute capacity.' },
    { id: 'k8s', name: 'Kubernetes Pod', icon: '🚢', baseCost: 12000, baseYield: 260, desc: 'Automated container orchestration.' },
    { id: 'datacenter', name: 'Regional Data Center', icon: '🏢', baseCost: 130000, baseYield: 3100, desc: 'A massive physical server farm.' },
    { id: 'quantum', name: 'Quantum Mainframe', icon: '⚛️', baseCost: 1500000, baseYield: 45000, desc: 'Compute power that defies physics.' }
];

const COST_MULTIPLIER = 1.15; // Standard idle game exponential scaling

// --- State Management ---
let state = {
    money: 0,
    moneyPerSec: 0,
    clickValue: 1,
    uptimeSeconds: 0,
    inventory: {}
};

// Initialize inventory counts to 0
UPGRADES_CONFIG.forEach(u => state.inventory[u.id] = 0);

// --- DOM Elements ---
const moneyDisplay = document.getElementById('moneyDisplay');
const mpsDisplay = document.getElementById('mpsDisplay');
const uptimeDisplay = document.getElementById('uptimeDisplay');
const clickStage = document.getElementById('clickStage');
const btnServe = document.getElementById('btnServe');
const upgradesContainer = document.getElementById('upgradesContainer');
const btnHardReset = document.getElementById('btnHardReset');
const toast = document.getElementById('toast');

// --- Utility Functions ---
// Formats large numbers beautifully (e.g., 1,500.20 or 1.5M)
function formatMoney(num) {
    if (num >= 1000000000) return (num / 1000000000).toFixed(2) + 'B';
    if (num >= 1000000) return (num / 1000000).toFixed(2) + 'M';
    return num.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function formatTime(seconds) {
    const h = Math.floor(seconds / 3600).toString().padStart(2, '0');
    const m = Math.floor((seconds % 3600) / 60).toString().padStart(2, '0');
    const s = Math.floor(seconds % 60).toString().padStart(2, '0');
    return `${h}:${m}:${s}`;
}

// Formula: Cost = BaseCost * (1.15 ^ count)
function getUpgradeCost(id) {
    const config = UPGRADES_CONFIG.find(u => u.id === id);
    const count = state.inventory[id];
    return config.baseCost * Math.pow(COST_MULTIPLIER, count);
}

function recalculateMPS() {
    let total = 0;
    UPGRADES_CONFIG.forEach(u => {
        total += u.baseYield * state.inventory[u.id];
    });
    state.moneyPerSec = total;
    mpsDisplay.innerText = formatMoney(state.moneyPerSec);
}

function showToast(msg) {
    toast.innerText = msg;
    toast.classList.remove('hidden');
    setTimeout(() => toast.classList.add('hidden'), 2000);
}

// --- Core Mechanics ---
function handleClick(e) {
    state.money += state.clickValue;
    updateUI();

    // Visual feedback: Floating text calculation
    const rect = btnServe.getBoundingClientRect();
    // Fallback to center if keyboard triggered
    const x = e.clientX ? e.clientX - rect.left : rect.width / 2;
    const y = e.clientY ? e.clientY - rect.top : rect.height / 2;

    createFloatingText(x, y, `+$${state.clickValue}`);
}

function createFloatingText(x, y, text) {
    const el = document.createElement('div');
    el.className = 'floating-text';
    el.innerText = text;
    // Add slight random scatter
    el.style.left = `${x + (Math.random() * 40 - 20)}px`;
    el.style.top = `${y + (Math.random() * 20 - 10)}px`;
    
    clickStage.appendChild(el);

    // Garbage collection after animation
    setTimeout(() => el.remove(), 1000);
}

function buyUpgrade(id) {
    const cost = getUpgradeCost(id);
    if (state.money >= cost) {
        state.money -= cost;
        state.inventory[id]++;
        recalculateMPS();
        renderStore(); // Full re-render to update costs
        updateUI();
    }
}

// --- Rendering ---
function renderStore() {
    upgradesContainer.innerHTML = ''; // Clear current
    
    UPGRADES_CONFIG.forEach(config => {
        const cost = getUpgradeCost(config.id);
        const count = state.inventory[config.id];
        const canAfford = state.money >= cost;

        const card = document.createElement('div');
        card.className = `upgrade-card ${canAfford ? '' : 'disabled'}`;
        card.onclick = () => buyUpgrade(config.id);

        card.innerHTML = `
            <div class="u-icon">${config.icon}</div>
            <div class="u-details">
                <h3>${config.name}</h3>
                <div class="u-stats">
                    <span class="u-cost">Cost: $${formatMoney(cost)}</span>
                    <span class="u-yield">+${formatMoney(config.baseYield)}/s</span>
                </div>
            </div>
            <div class="u-count">${count}</div>
        `;
        upgradesContainer.appendChild(card);
    });
}

function updateUI() {
    moneyDisplay.innerText = formatMoney(state.money);
    
    // Quick loop to update button states without full DOM rebuild
    const cards = upgradesContainer.children;
    UPGRADES_CONFIG.forEach((config, index) => {
        const cost = getUpgradeCost(config.id);
        if (state.money >= cost) {
            cards[index].classList.remove('disabled');
        } else {
            cards[index].classList.add('disabled');
        }
    });
}

// --- Save / Load System ---
function saveGame() {
    localStorage.setItem('cloudArchitectSave', JSON.stringify(state));
    showToast('Infrastructure State Saved');
}

function loadGame() {
    const saved = localStorage.getItem('cloudArchitectSave');
    if (saved) {
        try {
            const parsed = JSON.parse(saved);
            // Merge carefully to handle game updates/new properties
            state = { ...state, ...parsed };
            recalculateMPS();
        } catch (e) {
            console.error("Save file corrupted");
        }
    }
    renderStore();
    updateUI();
}

function wipeData() {
    if (confirm("CRITICAL WARNING: Terminate all instances and wipe data? This cannot be undone.")) {
        localStorage.removeItem('cloudArchitectSave');
        location.reload();
    }
}

// --- Game Loops ---
// Main physics/math loop: Runs 10 times a second for smooth continuous numbers
setInterval(() => {
    state.money += state.moneyPerSec / 10;
    updateUI();
}, 100);

// Clock & Save Loop: Runs 1 time a second
setInterval(() => {
    state.uptimeSeconds++;
    uptimeDisplay.innerText = formatTime(state.uptimeSeconds);
    
    // Auto-save every 15 seconds
    if (state.uptimeSeconds % 15 === 0) {
        saveGame();
    }
}, 1000);

// --- Event Listeners ---
btnServe.addEventListener('mousedown', handleClick);
btnHardReset.addEventListener('click', wipeData);

// --- Initialization ---
loadGame();