/**
 * Mandala Drawing Engine
 * Handles radial symmetry, mirroring, and canvas input.
 */

const canvas = document.getElementById('drawing-canvas');
const ctx = canvas.getContext('2d');

// --- State ---
let width, height;
let centerX, centerY;
let isDrawing = false;
let lastX = 0;
let lastY = 0;

// Settings
let segments = 12;
let brushColor = '#00ffcc';
let brushSize = 3;

// --- Init ---

function init() {
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
    setupInput();
    
    // Default setup
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
}

function resizeCanvas() {
    // Save current drawing? 
    // Usually resizing canvas clears it. For a drawing app, 
    // we might want to save to an image and redraw, but simpler to just clear.
    width = canvas.parentElement.clientWidth;
    height = canvas.parentElement.clientHeight;
    canvas.width = width;
    canvas.height = height;
    
    centerX = width / 2;
    centerY = height / 2;
    
    // Restore context settings after resize reset
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
}

// --- Drawing Logic ---

function startDraw(e) {
    isDrawing = true;
    const { x, y } = getPos(e);
    lastX = x;
    lastY = y;
}

function draw(e) {
    if (!isDrawing) return;
    
    const { x, y } = getPos(e);
    
    ctx.lineWidth = brushSize;
    ctx.strokeStyle = brushColor;
    
    // Save context to perform symmetry operations safely
    ctx.save();
    
    // Move origin to center
    ctx.translate(centerX, centerY);
    
    // Calculate angle step (360 / segments)
    const angleStep = (Math.PI * 2) / segments;
    
    // Draw in every sector
    for (let i = 0; i < segments; i++) {
        ctx.save();
        ctx.rotate(i * angleStep);
        
        // 1. Draw Original Stroke
        // Coordinates must be relative to center now
        drawLine(lastX - centerX, lastY - centerY, x - centerX, y - centerY);
        
        // 2. Draw Mirrored Stroke (Reflection) 
        // This creates the "Kaleidoscope" effect where lines meet
        ctx.scale(1, -1); // Flip Y axis
        drawLine(lastX - centerX, lastY - centerY, x - centerX, y - centerY);
        
        ctx.restore();
    }
    
    ctx.restore(); // Restore back to screen coordinates
    
    lastX = x;
    lastY = y;
}

function drawLine(x1, y1, x2, y2) {
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.stroke();
}

function endDraw() {
    isDrawing = false;
}

function getPos(e) {
    // Handle Mouse and Touch
    const rect = canvas.getBoundingClientRect();
    let cx, cy;
    
    if (e.touches) {
        cx = e.touches[0].clientX;
        cy = e.touches[0].clientY;
    } else {
        cx = e.clientX;
        cy = e.clientY;
    }
    
    return {
        x: cx - rect.left,
        y: cy - rect.top
    };
}

// --- UI Actions ---

function clearCanvas() {
    // Confirm?
    ctx.clearRect(0, 0, width, height);
}

function downloadArt() {
    const link = document.createElement('a');
    link.download = 'my-mandala.png';
    link.href = canvas.toDataURL();
    link.click();
}

function setupInput() {
    // Canvas Events
    canvas.addEventListener('mousedown', startDraw);
    window.addEventListener('mousemove', draw);
    window.addEventListener('mouseup', endDraw);
    
    canvas.addEventListener('touchstart', e => { e.preventDefault(); startDraw(e); });
    window.addEventListener('touchmove', e => { e.preventDefault(); draw(e); });
    window.addEventListener('touchend', endDraw);
    
    // UI Events
    document.getElementById('segment-slider').oninput = (e) => {
        segments = parseInt(e.target.value);
        document.getElementById('seg-val').innerText = segments;
    };
    
    document.getElementById('size-slider').oninput = (e) => {
        brushSize = parseInt(e.target.value);
    };
    
    document.getElementById('color-input').oninput = (e) => {
        brushColor = e.target.value;
    };
}

// Start
init();