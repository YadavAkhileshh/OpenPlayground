// --- DOM Elements ---
const gridContainer = document.getElementById('garden');
const toolBtns = document.querySelectorAll('.tool-btn');
const slider = document.getElementById('timeline-slider');
const monthDisplay = document.getElementById('current-month');
const inspectorText = document.getElementById('inspector-text');

// Modals
document.getElementById('btn-guide').addEventListener('click', () => document.getElementById('guide-modal').classList.remove('hidden'));
document.getElementById('close-guide').addEventListener('click', () => document.getElementById('guide-modal').classList.add('hidden'));

// --- State Management ---
let currentTool = 'seed-apple';
let globalMonth = 1;

// Define the 6 specific plant types
const PlantTypes = {
    'apple': { stages: ['🌰', '🌱', '🌿', '🌳', '🍎'], growthRate: 4 },
    'orange': { stages: ['🌰', '🌱', '🌿', '🌳', '🍊'], growthRate: 4 },
    'banana': { stages: ['🌰', '🌱', '🌿', '🌴', '🍌'], growthRate: 4 },
    'rose': { stages: ['🌱', '🌿', '🌹'], growthRate: 2 },
    'sunflower': { stages: ['🌱', '🌿', '🌻'], growthRate: 2 },
    'lily': { stages: ['🌱', '🌿', '🌸'], growthRate: 2 }
};

// 6x6 Grid = 36 Plots
const rows = 6;
const cols = 6;
const gardenState = [];

// --- Initialization ---
function initGarden() {
    for (let i = 0; i < rows * cols; i++) {
        gardenState.push({
            id: i,
            plantType: null,
            plantedMonth: null,
            waterLevel: 0,
            fertilizerLevel: 0
        });

        const cell = document.createElement('div');
        cell.classList.add('cell');
        cell.dataset.id = i;
        
        cell.addEventListener('click', () => handleCellClick(i));
        cell.addEventListener('mouseenter', () => inspectCell(i));
        
        gridContainer.appendChild(cell);
    }
}

// --- Tool Selection ---
toolBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        toolBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        currentTool = btn.dataset.tool;
    });
});

// --- Core Interaction Logic ---
function handleCellClick(index) {
    const plot = gardenState[index];

    if (currentTool.startsWith('seed-')) {
        // If it's a seed tool, strip "seed-" to get the plant name (e.g. "apple")
        if (plot.plantType === null) {
            plot.plantType = currentTool.replace('seed-', '');
            plot.plantedMonth = globalMonth;
            plot.waterLevel = 0;
            plot.fertilizerLevel = 0;
        }
    } else {
        // Handle standard tools
        switch (currentTool) {
            case 'water':
                if (plot.plantType !== null) plot.waterLevel++;
                break;
            case 'fertilizer':
                if (plot.plantType !== null) plot.fertilizerLevel++;
                break;
            case 'trowel':
                plot.plantType = null;
                plot.plantedMonth = null;
                plot.waterLevel = 0;
                plot.fertilizerLevel = 0;
                break;
        }
    }

    renderGrid();
    inspectCell(index); 
}

// --- The Growth Engine (Time-Series Math) ---
function calculateGrowthStage(plot) {
    if (plot.plantType === null) return null;

    const ageInMonths = globalMonth - plot.plantedMonth;
    if (ageInMonths < 0) return '🟫'; 

    const plantSpec = PlantTypes[plot.plantType];
    
    let growthScore = ageInMonths 
                    + (ageInMonths * (plot.waterLevel * 0.5)) 
                    + (plot.fertilizerLevel * 3);

    let stageIndex = Math.floor(growthScore / plantSpec.growthRate);

    if (stageIndex < 0) stageIndex = 0;
    if (stageIndex >= plantSpec.stages.length) stageIndex = plantSpec.stages.length - 1;

    return plantSpec.stages[stageIndex];
}

// --- Rendering ---
function renderGrid() {
    const cells = document.querySelectorAll('.cell');
    
    gardenState.forEach((plot, i) => {
        const cellDOM = cells[i];
        cellDOM.innerHTML = ''; 

        const stageEmoji = calculateGrowthStage(plot);

        if (stageEmoji && stageEmoji !== '🟫') {
            const plantEl = document.createElement('div');
            plantEl.classList.add('plant-emoji');
            plantEl.textContent = stageEmoji;
            
            const age = Math.max(0, globalMonth - plot.plantedMonth);
            const scale = Math.min(1.2, 0.5 + (age * 0.1)); 
            plantEl.style.transform = `scale(${scale})`;
            
            cellDOM.appendChild(plantEl);

            if (plot.waterLevel > 0) {
                const w = document.createElement('div');
                w.classList.add('water-indicator');
                w.textContent = '💧'.repeat(Math.min(3, plot.waterLevel));
                cellDOM.appendChild(w);
            }
            if (plot.fertilizerLevel > 0) {
                const f = document.createElement('div');
                f.classList.add('fert-indicator');
                f.textContent = '✨'.repeat(Math.min(3, plot.fertilizerLevel));
                cellDOM.appendChild(f);
            }
        }
    });
}

// --- Inspector ---
function inspectCell(index) {
    const plot = gardenState[index];
    if (plot.plantType === null) {
        inspectorText.innerHTML = `<strong>Plot ${index + 1}:</strong> Empty soil. Ready for planting.`;
        return;
    }

    const age = globalMonth - plot.plantedMonth;
    let status = age < 0 ? "Has not been planted yet!" : `Age: ${age} months.`;
    
    // Capitalize plant name dynamically
    let plantName = plot.plantType.charAt(0).toUpperCase() + plot.plantType.slice(1);

    inspectorText.innerHTML = `
        <strong>Plot ${index + 1} (${plantName}):</strong><br>
        Planted in Month: ${plot.plantedMonth}<br>
        ${status}<br>
        Water: ${plot.waterLevel} | Fertilizer: ${plot.fertilizerLevel}
    `;
}

// --- Time Machine Slider ---
slider.addEventListener('input', (e) => {
    globalMonth = parseInt(e.target.value);
    monthDisplay.textContent = globalMonth;
    renderGrid();
});

// Start the engine
initGarden();
renderGrid();
