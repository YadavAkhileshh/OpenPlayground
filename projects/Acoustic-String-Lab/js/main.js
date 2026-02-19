/**
 * Main Entry Point
 * Orchestrates the application modules.
 */
import { CONFIG } from './config.js';
import { GameStore } from './state/store.js';
import { generateLevel } from './logic/generator.js';
import { renderGrid, showWin } from './ui/renderer.js';
import { initDragHandlers } from './input/drag-handler.js';

function init() {
    console.log("Initializing Gradient Sort...");
    
    // Setup initial level
    startLevel();
    
    // UI Event Listeners
    document.getElementById('btn-shuffle').addEventListener('click', startLevel);
    document.getElementById('btn-restart').addEventListener('click', () => {
        document.getElementById('win-overlay').classList.add('hidden');
        startLevel();
    });
    
    document.getElementById('diff-select').addEventListener('change', (e) => {
        const val = e.target.value;
        if(val === 'easy') GameStore.gridSize = 5;
        if(val === 'medium') GameStore.gridSize = 7;
        if(val === 'hard') GameStore.gridSize = 10;
        startLevel();
    });
}

function startLevel() {
    const size = GameStore.gridSize;
    const tiles = generateLevel(size);
    GameStore.tiles = tiles;
    GameStore.isComplete = false;
    
    renderGrid(tiles, size);
    initDragHandlers();
}

// Start
init();