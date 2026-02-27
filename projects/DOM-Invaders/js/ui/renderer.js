const gridEl = document.getElementById('game-board');

export function renderGrid(tiles, size) {
    gridEl.innerHTML = '';
    
    // Setup CSS Grid params
    gridEl.style.gridTemplateColumns = `repeat(${size}, 1fr)`;
    gridEl.style.width = 'fit-content';
    
    tiles.forEach((tile, index) => {
        const el = document.createElement('div');
        el.className = `tile ${tile.isFixed ? 'fixed' : ''}`;
        el.style.backgroundColor = tile.color;
        el.dataset.index = index;
        
        if (!tile.isFixed) {
            el.draggable = true;
        }
        
        gridEl.appendChild(el);
    });
}

export function showWin() {
    document.getElementById('win-overlay').classList.remove('hidden');
}