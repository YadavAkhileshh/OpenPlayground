const canvas = document.getElementById('fractalCanvas');
const ctx = canvas.getContext('2d');
const imageData = ctx.createImageData(canvas.width, canvas.height);
const data = imageData.data;

let fractalType = 'mandelbrot';
let maxIterations = 100;
let zoom = 1;
let panX = 0;
let panY = 0;
let colorShift = 0;
let baseColor = [0, 0, 0]; // RGB values

// Controls
const fractalTypeSelect = document.getElementById('fractalType');
const iterationsSlider = document.getElementById('iterations');
const iterationsValue = document.getElementById('iterationsValue');
const zoomSlider = document.getElementById('zoom');
const zoomValue = document.getElementById('zoomValue');
const colorShiftSlider = document.getElementById('colorShift');
const colorShiftValue = document.getElementById('colorShiftValue');
const colorPicker = document.getElementById('colorPicker');
const resetButton = document.getElementById('reset');

// Event listeners
fractalTypeSelect.addEventListener('change', () => {
    fractalType = fractalTypeSelect.value;
    renderFractal();
});

iterationsSlider.addEventListener('input', () => {
    maxIterations = parseInt(iterationsSlider.value);
    iterationsValue.textContent = maxIterations;
    renderFractal();
});

zoomSlider.addEventListener('input', () => {
    zoom = parseFloat(zoomSlider.value);
    zoomValue.textContent = zoom.toFixed(1);
    renderFractal();
});

colorShiftSlider.addEventListener('input', () => {
    colorShift = parseInt(colorShiftSlider.value);
    colorShiftValue.textContent = colorShift;
    renderFractal();
});

colorPicker.addEventListener('input', () => {
    const color = hexToRgb(colorPicker.value);
    baseColor = [color.r, color.g, color.b];
    renderFractal();
});

resetButton.addEventListener('click', () => {
    zoom = 1;
    panX = 0;
    panY = 0;
    zoomSlider.value = zoom;
    zoomValue.textContent = zoom.toFixed(1);
    renderFractal();
});

// Mouse interaction for panning
let isDragging = false;
let lastMouseX, lastMouseY;

canvas.addEventListener('mousedown', (e) => {
    isDragging = true;
    lastMouseX = e.clientX;
    lastMouseY = e.clientY;
});

canvas.addEventListener('mousemove', (e) => {
    if (isDragging) {
        const deltaX = e.clientX - lastMouseX;
        const deltaY = e.clientY - lastMouseY;
        panX += deltaX / zoom / 100;
        panY += deltaY / zoom / 100;
        lastMouseX = e.clientX;
        lastMouseY = e.clientY;
        renderFractal();
    }
});

canvas.addEventListener('mouseup', () => {
    isDragging = false;
});

// Mandelbrot set calculation
function mandelbrot(x, y) {
    let zx = 0, zy = 0;
    let iteration = 0;
    while (zx * zx + zy * zy < 4 && iteration < maxIterations) {
        const xtemp = zx * zx - zy * zy + x;
        zy = 2 * zx * zy + y;
        zx = xtemp;
        iteration++;
    }
    return iteration;
}

// Julia set calculation
function julia(x, y, cRe = -0.7, cIm = 0.27015) {
    let zx = x, zy = y;
    let iteration = 0;
    while (zx * zx + zy * zy < 4 && iteration < maxIterations) {
        const xtemp = zx * zx - zy * zy + cRe;
        zy = 2 * zx * zy + cIm;
        zx = xtemp;
        iteration++;
    }
    return iteration;
}

// Color mapping function
function getColor(iteration) {
    if (iteration === maxIterations) {
        return [0, 0, 0]; // Black for points in the set
    }
    const ratio = iteration / maxIterations;
    const hue = (ratio * 360 + colorShift) % 360;
    const saturation = 100;
    const lightness = ratio * 50 + 25;

    const c = (1 - Math.abs(2 * lightness / 100 - 1)) * saturation / 100;
    const x = c * (1 - Math.abs((hue / 60) % 2 - 1));
    const m = lightness / 100 - c / 2;

    let r, g, b;
    if (hue < 60) {
        r = c; g = x; b = 0;
    } else if (hue < 120) {
        r = x; g = c; b = 0;
    } else if (hue < 180) {
        r = 0; g = c; b = x;
    } else if (hue < 240) {
        r = 0; g = x; b = c;
    } else if (hue < 300) {
        r = x; g = 0; b = c;
    } else {
        r = c; g = 0; b = x;
    }

    r = Math.round((r + m) * 255);
    g = Math.round((g + m) * 255);
    b = Math.round((b + m) * 255);

    // Blend with base color
    r = Math.round((r + baseColor[0]) / 2);
    g = Math.round((g + baseColor[1]) / 2);
    b = Math.round((b + baseColor[2]) / 2);

    return [r, g, b];
}

// Render fractal
function renderFractal() {
    for (let px = 0; px < canvas.width; px++) {
        for (let py = 0; py < canvas.height; py++) {
            const x = (px - canvas.width / 2) / (canvas.width / 4) / zoom + panX;
            const y = (py - canvas.height / 2) / (canvas.height / 4) / zoom + panY;

            let iteration;
            if (fractalType === 'mandelbrot') {
                iteration = mandelbrot(x, y);
            } else {
                iteration = julia(x, y);
            }

            const color = getColor(iteration);
            const index = (py * canvas.width + px) * 4;
            data[index] = color[0];     // Red
            data[index + 1] = color[1]; // Green
            data[index + 2] = color[2]; // Blue
            data[index + 3] = 255;      // Alpha
        }
    }
    ctx.putImageData(imageData, 0, 0);
}

// Utility function to convert hex to RGB
function hexToRgb(hex) {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16)
    } : null;
}

// Initial render
renderFractal();
