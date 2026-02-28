/**
 * Fractal-Explorer Engine
 * Renders the Mandelbrot Set (z_n+1 = z_n^2 + c) pixel-by-pixel.
 * Implements Pan, Zoom, and Adaptive Resolution.
 */

const canvas = document.getElementById('fractal-canvas');
const ctx = canvas.getContext('2d');

// --- Config ---
let width, height;
let maxIter = 100;
let palette = 'fire'; // fire, ocean, bw

// Viewport State (Complex Plane Coordinates)
let panX = -0.5;
let panY = 0;
let zoom = 200; // Pixels per unit
let currentZoomLevel = 1;

// Drag State
let isDragging = false;
let startDrag = { x: 0, y: 0 };
let startPan = { x: 0, y: 0 };

// Render Loop State
let renderTimeout;

// --- Initialization ---
function init() {
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
    setupControls();
    setupInteractions();
    
    // Initial Render
    scheduleRender();
}

function resizeCanvas() {
    width = canvas.parentElement.clientWidth;
    height = canvas.parentElement.clientHeight;
    canvas.width = width;
    canvas.height = height;
    scheduleRender();
}

// --- Interaction Logic ---

function setupInteractions() {
    // Zoom (Wheel)
    canvas.addEventListener('wheel', (e) => {
        e.preventDefault();
        
        // Mouse position in complex plane before zoom
        const mouseRe = (e.offsetX - width / 2) / zoom + panX;
        const mouseIm = (e.offsetY - height / 2) / zoom + panY;

        // Apply Zoom factor
        const zoomFactor = 1.1;
        if (e.deltaY < 0) zoom *= zoomFactor; // Zoom In
        else zoom /= zoomFactor;              // Zoom Out

        // Adjust Pan so mouse stays relative
        panX = mouseRe - (e.offsetX - width / 2) / zoom;
        panY = mouseIm - (e.offsetY - height / 2) / zoom;

        updateStats();
        // Fast Render (Low Res) immediately
        render(5); 
        // Schedule High Res render
        scheduleRender();
    });

    // Pan (Drag)
    canvas.addEventListener('mousedown', (e) => {
        isDragging = true;
        startDrag = { x: e.clientX, y: e.clientY };
        startPan = { x: panX, y: panY };
        canvas.style.cursor = 'grabbing';
    });

    window.addEventListener('mousemove', (e) => {
        if (!isDragging) return;
        
        const dx = e.clientX - startDrag.x;
        const dy = e.clientY - startDrag.y;
        
        panX = startPan.x - dx / zoom;
        panY = startPan.y - dy / zoom;
        
        render(5); // Low Res while dragging
    });

    window.addEventListener('mouseup', () => {
        if (isDragging) {
            isDragging = false;
            canvas.style.cursor = 'grab';
            scheduleRender(); // High Res when stopped
        }
    });
}

function setupControls() {
    // Iteration Slider
    const iterSlider = document.getElementById('iter-slider');
    iterSlider.addEventListener('input', (e) => {
        maxIter = parseInt(e.target.value);
        document.getElementById('iter-val').innerText = maxIter;
        scheduleRender();
    });

    // Palette Radios
    document.querySelectorAll('input[name="palette"]').forEach(r => {
        r.addEventListener('change', (e) => {
            palette = e.target.value;
            scheduleRender();
        });
    });

    // Reset
    document.getElementById('btn-reset').addEventListener('click', () => {
        panX = -0.5;
        panY = 0;
        zoom = 200;
        updateStats();
        scheduleRender();
    });

    // Download
    document.getElementById('btn-download').addEventListener('click', () => {
        const link = document.createElement('a');
        link.download = 'mandelbrot.png';
        link.href = canvas.toDataURL();
        link.click();
    });
}

// --- Rendering Engine ---

function scheduleRender() {
    clearTimeout(renderTimeout);
    // Debounce High Quality Render (Wait 200ms after last interaction)
    renderTimeout = setTimeout(() => {
        render(1); // 1 = High Res (1:1 pixel)
    }, 200);
}

function updateStats() {
    const mag = (zoom / 200).toFixed(2);
    document.getElementById('stat-zoom').innerText = `${mag}x`;
}

function render(pixelSize = 1) {
    const t0 = performance.now();

    // Access raw pixel data for speed
    // If pixelSize > 1, we just draw rects. If pixelSize = 1, we use ImageData.
    
    if (pixelSize > 1) {
        // Fast Mode (Blocks)
        for (let x = 0; x < width; x += pixelSize) {
            for (let y = 0; y < height; y += pixelSize) {
                const color = calculatePixel(x, y);
                ctx.fillStyle = `rgb(${color[0]},${color[1]},${color[2]})`;
                ctx.fillRect(x, y, pixelSize, pixelSize);
            }
        }
    } else {
        // High Quality Mode (ImageData)
        const imgData = ctx.createImageData(width, height);
        const data = imgData.data;

        for (let x = 0; x < width; x++) {
            for (let y = 0; y < height; y++) {
                const color = calculatePixel(x, y);
                const index = (y * width + x) * 4;
                data[index] = color[0];     // R
                data[index + 1] = color[1]; // G
                data[index + 2] = color[2]; // B
                data[index + 3] = 255;      // A
            }
        }
        ctx.putImageData(imgData, 0, 0);
    }

    const t1 = performance.now();
    if (pixelSize === 1) {
        document.getElementById('stat-render').innerText = `Render: ${(t1 - t0).toFixed(0)}ms`;
    }
}

// The Math: z = z^2 + c
function calculatePixel(x, y) {
    // Map Pixel to Complex Plane
    let cRe = (x - width / 2) / zoom + panX;
    let cIm = (y - height / 2) / zoom + panY;

    // Optimization: Cardioid / Bulb check could go here to skip math for inner black body
    
    let zRe = 0, zIm = 0;
    let i = 0;
    
    // Iteration Loop
    for (; i < maxIter; i++) {
        // z^2 = (a+bi)(a+bi) = a^2 - b^2 + 2abi
        let zRe2 = zRe * zRe;
        let zIm2 = zIm * zIm;
        
        if (zRe2 + zIm2 > 4) break; // Escaped

        let nextRe = zRe2 - zIm2 + cRe;
        let nextIm = 2 * zRe * zIm + cIm;
        
        zRe = nextRe;
        zIm = nextIm;
    }

    return getColor(i);
}

function getColor(iter) {
    if (iter === maxIter) return [0, 0, 0]; // In the set (Black)

    // Smooth coloring (optional advanced step, sticking to linear for vanilla speed)
    const t = iter / maxIter;

    if (palette === 'bw') {
        const val = Math.floor(t * 255);
        return [val, val, val];
    } 
    else if (palette === 'fire') {
        // Red/Orange/Yellow spectrum
        return [
            Math.floor(255 * Math.sqrt(t)),      // R
            Math.floor(255 * (t * t)),           // G
            Math.floor(50 * Math.sin(t * Math.PI)) // B
        ];
    }
    else if (palette === 'ocean') {
        // Blue/Cyan/White
        return [
            Math.floor(255 * (1 - t) * t * 4), // R
            Math.floor(255 * t),               // G
            Math.floor(255 * Math.min(1, t*1.5)) // B
        ];
    }
    return [255, 255, 255];
}

// Start
init();