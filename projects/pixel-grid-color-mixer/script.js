const gridSize = 20;
let isDrawing = false;
let currentColor = 'rgb(255,0,0)';
let brushSize = 1;
let gridVisible = true;

const pixelGrid = document.getElementById('pixelGrid');
const redSlider = document.getElementById('redSlider');
const greenSlider = document.getElementById('greenSlider');
const blueSlider = document.getElementById('blueSlider');
const redValue = document.getElementById('redValue');
const greenValue = document.getElementById('greenValue');
const blueValue = document.getElementById('blueValue');
const colorPreview = document.getElementById('colorPreview');
const currentColorDisplay = document.getElementById('currentColor');
const coordX = document.getElementById('coordX');
const coordY = document.getElementById('coordY');
const toggleGridBtn = document.getElementById('toggleGrid');
const clearCanvasBtn = document.getElementById('clearCanvas');

function createGrid() {
    for(let i = 0; i < gridSize * gridSize; i++) {
        const pixel = document.createElement('div');
        pixel.classList.add('pixel');
        if(gridVisible) pixel.classList.add('grid-visible');
        pixel.dataset.index = i;
        pixel.dataset.row = Math.floor(i / gridSize);
        pixel.dataset.col = i % gridSize;
        
        pixel.addEventListener('mousedown', startDrawing);
        pixel.addEventListener('mouseenter', draw);
        pixel.addEventListener('mouseover', updateCoordinates);
        
        pixelGrid.appendChild(pixel);
    }
}

function startDrawing(e) {
    isDrawing = true;
    draw(e);
}

function draw(e) {
    if(!isDrawing && e.type !== 'click') return;
    e.preventDefault();
    
    const row = parseInt(e.target.dataset.row);
    const col = parseInt(e.target.dataset.col);
    
    for(let i = 0; i < brushSize; i++) {
        for(let j = 0; j < brushSize; j++) {
            const targetRow = row + i;
            const targetCol = col + j;
            
            if(targetRow < gridSize && targetCol < gridSize) {
                const index = targetRow * gridSize + targetCol;
                const pixel = document.querySelector(`[data-index="${index}"]`);
                if(pixel) pixel.style.backgroundColor = currentColor;
            }
        }
    }
}

function updateCoordinates(e) {
    const row = parseInt(e.target.dataset.row);
    const col = parseInt(e.target.dataset.col);
    coordX.textContent = col + 1;
    coordY.textContent = row + 1;
}

function updateColor() {
    const r = redSlider.value;
    const g = greenSlider.value;
    const b = blueSlider.value;
    
    redValue.textContent = r;
    greenValue.textContent = g;
    blueValue.textContent = b;
    
    currentColor = `rgb(${r},${g},${b})`;
    colorPreview.style.backgroundColor = currentColor;
    currentColorDisplay.textContent = currentColor;
}

function setBrushSize(e) {
    brushSize = parseInt(e.target.dataset.size);
    document.querySelectorAll('.brush-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    e.target.classList.add('active');
}

function toggleGrid() {
    gridVisible = !gridVisible;
    toggleGridBtn.textContent = gridVisible ? 'Hide Grid' : 'Show Grid';
    document.querySelectorAll('.pixel').forEach(pixel => {
        pixel.classList.toggle('grid-visible');
    });
}

function clearCanvas() {
    document.querySelectorAll('.pixel').forEach(pixel => {
        pixel.style.backgroundColor = 'white';
    });
}

redSlider.addEventListener('input', updateColor);
greenSlider.addEventListener('input', updateColor);
blueSlider.addEventListener('input', updateColor);

document.addEventListener('mouseup', () => isDrawing = false);
document.addEventListener('mouseleave', () => isDrawing = false);

document.querySelectorAll('.brush-btn').forEach(btn => {
    btn.addEventListener('click', setBrushSize);
});

toggleGridBtn.addEventListener('click', toggleGrid);
clearCanvasBtn.addEventListener('click', clearCanvas);

pixelGrid.addEventListener('click', draw);
pixelGrid.addEventListener('touchstart', (e) => {
    e.preventDefault();
    isDrawing = true;
    draw(e);
});
pixelGrid.addEventListener('touchmove', (e) => {
    e.preventDefault();
    const touch = e.touches[0];
    const element = document.elementFromPoint(touch.clientX, touch.clientY);
    if(element && element.classList.contains('pixel')) {
        draw({target: element});
        updateCoordinates({target: element});
    }
});
pixelGrid.addEventListener('touchend', () => isDrawing = false);

createGrid();
updateColor();