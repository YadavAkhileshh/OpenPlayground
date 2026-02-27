/**
 * Pixel Power Wash Engine
 * Uses destination-out masking to simulate cleaning.
 */

const canvas = document.getElementById('dirt-canvas');
const ctx = canvas.getContext('2d');
const cursor = document.getElementById('nozzle-cursor');

// --- State ---
let width, height;
let isScrubbing = false;
let nozzleSize = 30;
let cleanPercent = 0;
let lastCheckTime = 0;
let totalPixels = 0;

// --- Init ---

function init() {
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
    setupInput();
    
    // Create initial dirt layer
    resetDirt();
}

function resizeCanvas() {
    width = canvas.parentElement.clientWidth;
    height = canvas.parentElement.clientHeight;
    canvas.width = width;
    canvas.height = height;
    
    // If resizing, we should probably re-fill dirt or scale it, 
    // but for simplicity, we'll just reset dirt to avoid artifacts.
    resetDirt();
}

function resetDirt() {
    // 1. Fill with solid dirt color
    ctx.globalCompositeOperation = 'source-over';
    ctx.fillStyle = '#3e3e3e'; // Base mud color
    ctx.fillRect(0, 0, width, height);
    
    // 2. Add some noise/texture for realism
    addDirtTexture();
    
    // Reset UI
    cleanPercent = 0;
    updateProgress();
    document.getElementById('success-overlay').classList.add('hidden');
    
    // Calculate total area for percentage
    totalPixels = width * height;
}

function addDirtTexture() {
    // Simple noise generation
    const noiseCanvas = document.createElement('canvas');
    noiseCanvas.width = 100;
    noiseCanvas.height = 100;
    const nCtx = noiseCanvas.getContext('2d');
    
    // Draw random specks
    for(let i=0; i<500; i++) {
        nCtx.fillStyle = `rgba(30, 30, 30, ${Math.random() * 0.5})`;
        nCtx.beginPath();
        nCtx.arc(Math.random()*100, Math.random()*100, Math.random()*3, 0, Math.PI*2);
        nCtx.fill();
    }
    
    // Tile it over the main canvas
    const pattern = ctx.createPattern(noiseCanvas, 'repeat');
    ctx.fillStyle = pattern;
    ctx.fillRect(0, 0, width, height);
}

// --- Interaction Logic ---

function scrub(x, y) {
    // Set composition mode to "Erase"
    ctx.globalCompositeOperation = 'destination-out';
    
    ctx.beginPath();
    ctx.arc(x, y, nozzleSize, 0, Math.PI * 2);
    ctx.fill();
    
    // Spray Effect (Optional Visuals on top of canvas?)
    // Could spawn particles here if we had a particle engine
    
    // Calculate Progress
    // Optimization: Don't check every frame. Check every 200ms or so.
    const now = Date.now();
    if (now - lastCheckTime > 200) {
        checkProgress();
        lastCheckTime = now;
    }
}

function checkProgress() {
    // Getting image data is expensive!
    // Sample a low-res version for performance
    const sampleScale = 0.1; // 10% resolution
    const w = Math.floor(width * sampleScale);
    const h = Math.floor(height * sampleScale);
    
    // Draw current canvas to small offscreen canvas to sample
    const offCanvas = document.createElement('canvas');
    offCanvas.width = w;
    offCanvas.height = h;
    const offCtx = offCanvas.getContext('2d');
    
    offCtx.drawImage(canvas, 0, 0, w, h);
    
    const imgData = offCtx.getImageData(0, 0, w, h);
    const data = imgData.data;
    let transparentCount = 0;
    
    // Iterate Alpha Channel (every 4th)
    for (let i = 3; i < data.length; i += 4) {
        if (data[i] < 50) { // Consider mostly transparent as clean
            transparentCount++;
        }
    }
    
    const totalSamplePixels = w * h;
    cleanPercent = Math.floor((transparentCount / totalSamplePixels) * 100);
    
    updateProgress();
    
    if (cleanPercent >= 98) {
        levelComplete();
    }
}

function updateProgress() {
    document.getElementById('percent-val').innerText = cleanPercent + "%";
    document.getElementById('progress-bar').style.width = cleanPercent + "%";
}

function levelComplete() {
    // Clear remaining specs
    ctx.clearRect(0, 0, width, height);
    document.getElementById('percent-val').innerText = "100%";
    document.getElementById('progress-bar').style.width = "100%";
    document.getElementById('success-overlay').classList.remove('hidden');
}

function nextLevel() {
    changeImage();
    resetDirt();
}

function changeImage() {
    // New random Unsplash image 
    const keywords = ['city', 'space', 'ocean', 'cyberpunk', 'forest'];
    const word = keywords[Math.floor(Math.random() * keywords.length)];
    const url = `https://source.unsplash.com/random/1920x1080/?${word}`;
    document.getElementById('clean-bg').style.backgroundImage = `url('${url}')`;
    resetDirt();
}

// --- Input ---

function setupInput() {
    // Mouse
    window.addEventListener('mousedown', () => isScrubbing = true);
    window.addEventListener('mouseup', () => isScrubbing = false);
    
    window.addEventListener('mousemove', e => {
        // Move Custom Cursor
        cursor.style.left = e.clientX + 'px';
        cursor.style.top = e.clientY + 'px';
        
        // Scrub if mouse down
        if (isScrubbing) {
            const rect = canvas.getBoundingClientRect();
            scrub(e.clientX - rect.left, e.clientY - rect.top);
        }
    });
    
    // Touch
    window.addEventListener('touchstart', (e) => isScrubbing = true);
    window.addEventListener('touchend', () => isScrubbing = false);
    window.addEventListener('touchmove', e => {
        if (isScrubbing) {
            e.preventDefault(); // Stop scroll
            const rect = canvas.getBoundingClientRect();
            const touch = e.touches[0];
            
            cursor.style.left = touch.clientX + 'px';
            cursor.style.top = touch.clientY + 'px';
            
            scrub(touch.clientX - rect.left, touch.clientY - rect.top);
        }
    });

    // Controls
    document.getElementById('size-slider').oninput = (e) => {
        nozzleSize = parseInt(e.target.value);
        cursor.style.width = (nozzleSize * 2) + 'px';
        cursor.style.height = (nozzleSize * 2) + 'px';
    };
}

// Start
init();