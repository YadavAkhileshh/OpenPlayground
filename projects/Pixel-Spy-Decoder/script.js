/**
 * Pixel Spy Decoder Engine
 * Handles Image Bit Manipulation (LSB Extraction).
 */

const canvas = document.getElementById('spy-canvas');
const ctx = canvas.getContext('2d');

// --- Config ---
const WIDTH = 600;
const HEIGHT = 400;

// --- State ---
let originalData = null; // Uint8ClampedArray
let currentLevel = 1;

const LEVELS = [
    {
        id: 1,
        mission: "Level 1: The code is hidden in the Least Significant Bit (LSB) of the RED channel.",
        secret: "ALPHA",
        channel: 'r',
        type: 'text'
    },
    {
        id: 2,
        mission: "Level 2: Visual intel hidden in the BLUE channel LSB. Identify the shape.",
        secret: "STAR",
        channel: 'b',
        type: 'shape'
    },
    {
        id: 3,
        mission: "Level 3: Complex encoding. Code is in GREEN LSB, but requires Inversion to read.",
        secret: "OMEGA",
        channel: 'g',
        type: 'text_inv'
    }
];

// --- Initialization ---

function init() {
    canvas.width = WIDTH;
    canvas.height = HEIGHT;
    
    // UI Events
    document.getElementById('btn-submit').addEventListener('click', checkCode);
    
    loadLevel(1);
}

function loadLevel(lvl) {
    currentLevel = lvl;
    const data = LEVELS[lvl-1];
    
    document.getElementById('mission-text').innerText = data.mission;
    document.getElementById('code-input').value = '';
    document.getElementById('status-msg').classList.add('hidden');
    
    // Generate the Puzzle Image programmatically
    generatePuzzle(data);
}

// --- Image Generation (Steganography Encoder) ---

function generatePuzzle(levelData) {
    // 1. Create a clean background (Noise)
    const imgData = ctx.createImageData(WIDTH, HEIGHT);
    const data = imgData.data;
    
    for (let i = 0; i < data.length; i += 4) {
        // Random noise background
        data[i] = Math.floor(Math.random() * 255);     // R
        data[i+1] = Math.floor(Math.random() * 255); // G
        data[i+2] = Math.floor(Math.random() * 255); // B
        data[i+3] = 255; // Alpha
        
        // CLEAR LSBs (Set to 0) to prepare for hiding
        // Format: xxxxxxx0
        data[i] = data[i] & 0xFE; 
        data[i+1] = data[i+1] & 0xFE;
        data[i+2] = data[i+2] & 0xFE;
    }
    
    // 2. Embed Secret
    // We create a temporary canvas to draw the secret, then read its pixels
    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = WIDTH;
    tempCanvas.height = HEIGHT;
    const tCtx = tempCanvas.getContext('2d');
    
    // Draw Secret to Temp
    tCtx.fillStyle = '#000'; // Background
    tCtx.fillRect(0, 0, WIDTH, HEIGHT);
    tCtx.fillStyle = '#fff'; // Signal (1s)
    
    if (levelData.type.includes('text')) {
        tCtx.font = 'bold 100px monospace';
        tCtx.textAlign = 'center';
        tCtx.fillText(levelData.secret, WIDTH/2, HEIGHT/2 + 30);
    } else if (levelData.type === 'shape') {
        // Draw Star
        drawStar(tCtx, WIDTH/2, HEIGHT/2, 5, 80, 40);
    }
    
    const secretData = tCtx.getImageData(0, 0, WIDTH, HEIGHT).data;
    
    // 3. Merge Secret into LSB
    // If secret pixel is White (high), set LSB to 1. Else 0.
    
    const offset = levelData.channel === 'r' ? 0 : (levelData.channel === 'g' ? 1 : 2);
    
    for (let i = 0; i < data.length; i += 4) {
        // Check temp canvas red channel (it's b/w so r=g=b)
        // If > 128, consider it a '1'
        const isSecretBit = secretData[i] > 128 ? 1 : 0;
        
        // Inject bit
        data[i + offset] = data[i + offset] | isSecretBit;
    }
    
    // Save "Clean" original state (which contains the hidden data)
    originalData = imgData;
    ctx.putImageData(imgData, 0, 0);
}

function drawStar(ctx, cx, cy, spikes, outerRadius, innerRadius) {
    let rot = Math.PI / 2 * 3;
    let x = cx;
    let y = cy;
    let step = Math.PI / spikes;

    ctx.beginPath();
    ctx.moveTo(cx, cy - outerRadius);
    for (let i = 0; i < spikes; i++) {
        x = cx + Math.cos(rot) * outerRadius;
        y = cy + Math.sin(rot) * outerRadius;
        ctx.lineTo(x, y);
        rot += step;

        x = cx + Math.cos(rot) * innerRadius;
        y = cy + Math.sin(rot) * innerRadius;
        ctx.lineTo(x, y);
        rot += step;
    }
    ctx.lineTo(cx, cy - outerRadius);
    ctx.closePath();
    ctx.fill();
}

// --- Filter Logic ---

window.applyFilter = (type) => {
    if (!originalData) return;
    
    // Get current display data (allows stacking filters?) 
    // For simplicity in this puzzle, we act on originalData source but display result
    // Or we act on current canvas state. Let's act on current state to allow Stacking.
    
    const imgData = ctx.getImageData(0, 0, WIDTH, HEIGHT);
    const data = imgData.data;
    
    for (let i = 0; i < data.length; i += 4) {
        const r = data[i];
        const g = data[i+1];
        const b = data[i+2];
        
        if (type === 'red-lsb') {
            // Isolate Red LSB: 0 or 1
            const bit = r & 1; 
            // Scale to full range (0 or 255) to make it visible
            const val = bit * 255;
            data[i] = val; data[i+1] = 0; data[i+2] = 0;
        } 
        else if (type === 'green-lsb') {
            const val = (g & 1) * 255;
            data[i] = 0; data[i+1] = val; data[i+2] = 0;
        }
        else if (type === 'blue-lsb') {
            const val = (b & 1) * 255;
            data[i] = 0; data[i+1] = 0; data[i+2] = val;
        }
        else if (type === 'invert') {
            data[i] = 255 - r;
            data[i+1] = 255 - g;
            data[i+2] = 255 - b;
        }
        else if (type === 'contrast') {
            // Simple threshold
            data[i] = r > 100 ? 255 : 0;
            data[i+1] = g > 100 ? 255 : 0;
            data[i+2] = b > 100 ? 255 : 0;
        }
    }
    
    ctx.putImageData(imgData, 0, 0);
}

window.resetImage = () => {
    if (originalData) ctx.putImageData(originalData, 0, 0);
}

// --- Game Logic ---

function checkCode() {
    const input = document.getElementById('code-input').value.toUpperCase().trim();
    const data = LEVELS[currentLevel-1];
    
    if (input === data.secret) {
        const status = document.getElementById('status-msg');
        status.innerText = "ACCESS GRANTED";
        status.classList.remove('hidden');
        status.style.background = "#00ff41";
        
        setTimeout(() => {
            if (currentLevel < LEVELS.length) {
                loadLevel(currentLevel + 1);
            } else {
                alert("ALL MISSIONS COMPLETE. YOU ARE A MASTER SPY.");
                loadLevel(1);
            }
        }, 1500);
    } else {
        const status = document.getElementById('status-msg');
        status.innerText = "ACCESS DENIED";
        status.classList.remove('hidden');
        status.style.background = "#ff0000";
        setTimeout(() => status.classList.add('hidden'), 1000);
    }
}

// Start
init();