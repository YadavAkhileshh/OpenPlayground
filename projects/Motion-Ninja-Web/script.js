/**
 * Motion Ninja Engine
 * Uses Frame Differencing (Computer Vision) to detect motion without ML libraries.
 */

const video = document.getElementById('webcam');
const displayCanvas = document.getElementById('display-canvas');
const displayCtx = displayCanvas.getContext('2d');
const diffCanvas = document.getElementById('diff-canvas');
const diffCtx = diffCanvas.getContext('2d');
const debugCanvas = document.getElementById('debug-view');
const debugCtx = debugCanvas.getContext('2d');

// --- Config ---
const MOTION_THRESHOLD = 30; // Pixel change sensitivity (0-255)
const DOWNSAMPLE = 10; // Process 1/10th resolution for speed
const GRAVITY = 0.4;

// --- State ---
let width, height;
let isPlaying = false;
let previousFrame = null;
let fruits = []; // Game objects
let score = 0;
let lives = 0;
let lastTime = 0;
let spawnTimer = 0;

// --- Initialization ---

document.getElementById('btn-start').addEventListener('click', startCamera);
document.getElementById('btn-restart').addEventListener('click', resetGame);
document.getElementById('toggle-debug').addEventListener('change', (e) => {
    debugCanvas.style.display = e.target.checked ? 'block' : 'none';
});

async function startCamera() {
    try {
        const stream = await navigator.mediaDevices.getUserMedia({ 
            video: { width: 640, height: 480, facingMode: "user" } 
        });
        video.srcObject = stream;
        await video.play();
        
        // Setup canvases once video is ready
        width = video.videoWidth;
        height = video.videoHeight;
        
        displayCanvas.width = width;
        displayCanvas.height = height;
        
        // Low-res processing canvas
        diffCanvas.width = width / DOWNSAMPLE;
        diffCanvas.height = height / DOWNSAMPLE;
        
        document.getElementById('start-screen').classList.add('hidden');
        resetGame();
        requestAnimationFrame(loop);
    } catch (err) {
        alert("Camera access denied or unavailable. Please enable permissions.");
        console.error(err);
    }
}

function resetGame() {
    score = 0;
    lives = 0;
    fruits = [];
    isPlaying = true;
    document.getElementById('game-over').classList.add('hidden');
    updateUI();
}

// --- Computer Vision Core ---

function processMotion() {
    // 1. Draw current video frame to low-res canvas
    diffCtx.drawImage(video, 0, 0, diffCanvas.width, diffCanvas.height);
    
    // 2. Get pixel data
    const frame = diffCtx.getImageData(0, 0, diffCanvas.width, diffCanvas.height);
    const data = frame.data;
    const len = data.length;
    
    // 3. Compare with previous frame 
    if (!previousFrame) {
        previousFrame = data;
        return [];
    }

    const motionPixels = []; // Store active zones {x, y}
    const prev = previousFrame;
    
    // Debug visual
    const debugImg = debugCtx.createImageData(diffCanvas.width, diffCanvas.height);
    
    // Iterate pixels (RGBA = 4 bytes)
    for (let i = 0; i < len; i += 4) {
        // Simple luminance diff: (R+G+B)/3
        const avg1 = (data[i] + data[i+1] + data[i+2]) / 3;
        const avg2 = (prev[i] + prev[i+1] + prev[i+2]) / 3;
        const diff = Math.abs(avg1 - avg2);

        if (diff > MOTION_THRESHOLD) {
            // Motion detected!
            const pixelIndex = i / 4;
            const y = Math.floor(pixelIndex / diffCanvas.width);
            const x = pixelIndex % diffCanvas.width;
            
            // Map back to screen coords
            // NOTE: Canvas is mirrored via CSS, but logic coords need strict mapping
            // Since CSS mirrors, visual left is logic right.
            // Let's keep logic standard (0,0 is top-left of video feed) and handle mirroring visually.
            
            motionPixels.push({
                x: x * DOWNSAMPLE,
                y: y * DOWNSAMPLE
            });

            // Debug White pixel
            debugImg.data[i] = 255; 
            debugImg.data[i+1] = 255; 
            debugImg.data[i+2] = 255; 
            debugImg.data[i+3] = 255;
        } else {
            // Black pixel
            debugImg.data[i+3] = 255;
        }
    }

    // Update state
    previousFrame = data;
    
    // Render Debug
    if(document.getElementById('toggle-debug').checked) {
        debugCtx.putImageData(debugImg, 0, 0);
    }

    return motionPixels;
}

// --- Game Logic ---

class Fruit {
    constructor() {
        this.r = 30;
        // Spawn at bottom, random X
        this.x = Math.random() * (width - 100) + 50;
        this.y = height + this.r;
        
        // Launch up
        this.vx = (Math.random() - 0.5) * 4;
        this.vy = -(Math.random() * 5 + 10);
        
        this.color = `hsl(${Math.random()*360}, 80%, 50%)`;
        this.active = true;
    }

    update() {
        this.x += this.vx;
        this.y += this.vy;
        this.vy += GRAVITY;
        this.angle += 0.1;
    }

    draw(ctx) {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.r, 0, Math.PI*2);
        ctx.fillStyle = this.color;
        ctx.fill();
        ctx.lineWidth = 3;
        ctx.strokeStyle = '#fff';
        ctx.stroke();
    }
}

function updateGame(motionPixels) {
    if (!isPlaying) return;

    // Spawn logic
    spawnTimer++;
    if (spawnTimer > 60) { // Every ~1 sec
        fruits.push(new Fruit());
        spawnTimer = 0;
    }

    // Update Fruits
    for (let i = fruits.length - 1; i >= 0; i--) {
        const f = fruits[i];
        f.update();

        // 1. Check Collision with Motion
        // Optimization: Checking against thousands of motion pixels is slow.
        // Better: Check if fruit's area contains any motion pixel.
        
        let sliced = false;
        
        // We only check points INSIDE the fruit bounding box
        // Map fruit pos to low-res grid
        const lowX = Math.floor(f.x / DOWNSAMPLE);
        const lowY = Math.floor(f.y / DOWNSAMPLE);
        const lowR = Math.ceil(f.r / DOWNSAMPLE);

        // Simple Bounding Box check against motion array? 
        // Or just iterate motion pixels and check distance?
        // Iterating motion pixels (usually < 1000 active) is faster than checking grid.
        
        for (let mp of motionPixels) {
            // Simple distance check
            const dx = mp.x - f.x;
            const dy = mp.y - f.y;
            if (dx*dx + dy*dy < f.r*f.r) {
                sliced = true;
                break;
            }
        }

        if (sliced) {
            // Splatter Effect (Simplified)
            score += 10;
            createSplatter(f.x, f.y, f.color);
            fruits.splice(i, 1);
            updateUI();
            continue;
        }

        // 2. Check Miss (Fell off screen)
        if (f.y > height + 50 && f.vy > 0) {
            lives++;
            fruits.splice(i, 1);
            updateUI();
            if (lives >= 3) gameOver();
        }
    }
}

// Particle System for Splatters
let particles = [];
function createSplatter(x, y, color) {
    for(let i=0; i<10; i++) {
        particles.push({
            x: x, y: y,
            vx: (Math.random()-0.5)*10,
            vy: (Math.random()-0.5)*10,
            life: 1.0,
            color: color
        });
    }
}

function gameOver() {
    isPlaying = false;
    document.getElementById('final-score').innerText = score;
    document.getElementById('game-over').classList.remove('hidden');
}

function updateUI() {
    document.getElementById('score-val').innerText = score;
    document.getElementById('lives-val').innerText = lives;
}

// --- Render Loop ---

function loop() {
    // 1. Draw Webcam Feed
    displayCtx.drawImage(video, 0, 0, width, height);

    // 2. Computer Vision Step
    const motionData = processMotion();

    // 3. Game Step
    updateGame(motionData);

    // 4. Render Game Objects
    for (let f of fruits) f.draw(displayCtx);
    
    // Render Particles
    for (let i = particles.length - 1; i >= 0; i--) {
        let p = particles[i];
        p.x += p.vx;
        p.y += p.vy;
        p.life -= 0.05;
        
        displayCtx.globalAlpha = p.life;
        displayCtx.fillStyle = p.color;
        displayCtx.beginPath();
        displayCtx.arc(p.x, p.y, 5, 0, Math.PI*2);
        displayCtx.fill();
        
        if(p.life <= 0) particles.splice(i, 1);
    }
    displayCtx.globalAlpha = 1.0;

    requestAnimationFrame(loop);
}