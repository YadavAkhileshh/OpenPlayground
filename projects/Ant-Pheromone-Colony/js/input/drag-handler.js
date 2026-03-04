import { GameStore } from '../state/store.js';
import { renderGrid, showWin } from '../ui/renderer.js';
import { checkWin } from '../logic/validator.js';

export function initDragHandlers() {
    const tiles = document.querySelectorAll('.tile[draggable="true"]');
    
    tiles.forEach(tile => {
        tile.addEventListener('dragstart', handleDragStart);
        tile.addEventListener('dragover', handleDragOver);
        tile.addEventListener('drop', handleDrop);
        tile.addEventListener('dragenter', handleDragEnter);
        tile.addEventListener('dragleave', handleDragLeave);
    });
}

function handleDragStart(e) {
    e.dataTransfer.effectAllowed = 'move';
    GameStore.dragSrcIndex = parseInt(this.dataset.index);
    this.classList.add('dragging');
}

function handleDragOver(e) {
    e.preventDefault(); // Necessary to allow dropping
    e.dataTransfer.dropEffect = 'move';
}

function handleDragEnter(e) {
    this.style.transform = 'scale(1.1)';
    this.style.zIndex = '10';
}

function handleDragLeave(e) {
    this.style.transform = 'scale(1)';
    this.style.zIndex = '1';
}

function handleDrop(e) {
    e.stopPropagation();
    
    const srcIndex = GameStore.dragSrcIndex;
    const destIndex = parseInt(this.dataset.index);
    
    if (srcIndex !== destIndex) {
        // Swap in State
        const temp = GameStore.tiles[srcIndex];
        GameStore.tiles[srcIndex] = GameStore.tiles[destIndex];
        GameStore.tiles[destIndex] = temp;
        
        // Re-render
        renderGrid(GameStore.tiles, GameStore.gridSize);
        initDragHandlers(); // Re-bind events to new DOM elements
        
        // Check Win
        if (checkWin()) {
            showWin();
        }
    }
}