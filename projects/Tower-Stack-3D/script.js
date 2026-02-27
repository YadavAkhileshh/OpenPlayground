/**
 * Tower Stack 3D Engine
 * Uses Isometric Projection to render 3D blocks on a 2D canvas.
 */

const canvas = document.getElementById('game-canvas');
const ctx = canvas.getContext('2d');

// --- Config ---
const BLOCK_HEIGHT = 20; // Visual height of a layer
const START_SIZE = 150;  // Initial width/depth
const MOVE_SPEED = 3;
const ZOOM = 1.2;

// --- State ---
let width, height;
let blocks = []; // The stack
let debris = []; // Falling cut pieces
let activeBlock = null; // The one moving
let score = 0;
let isPlaying = false;
let cameraY = 0;
let hue = 0;

// --- Physics Classes ---

class Block {
    constructor(x, z, w, d, yIndex, color) {
        this.x = x;
        this.z = z;
        this.w = w;
        this.d = d;
        this.yIndex = yIndex; // Logical height
        this.color = color;
        
        // Physics for debris
        this.vy = 0;
        this.yPos = yIndex * BLOCK_HEIGHT; // Visual Y position
    }

    draw() {
        // Convert 3D coords to 2D Isometric
        // Iso Formula:
        // screenX = (x - z)
        // screenY = (x + z)/2 - y
        
        const isoX = (this.x - this.z) * ZOOM + width / 2;
        const isoY = (this.x + this.z) * 0.5 * ZOOM + (height / 1.5) - (this.yPos * ZOOM) + cameraY;
        
        const wIso = this.w * ZOOM;
        const dIso = this.d * ZOOM; // Visual scaling approximate for perspective

        // We need to draw a cube (Top, Left, Right faces)
        // We need 4 corners of the top face
        // Top Face (Diamond)
        const topP1 = toIso(this.x, this.z);
        const topP2 = toIso(this.x + this.w, this.z);
        const topP3 = toIso(this.x + this.w, this.z + this.d);
        const topP4 = toIso(this.x, this.z + this.d);

        // Adjust for Y and Camera
        const offY = (this.yPos * ZOOM) - cameraY;
        
        const drawPoly = (p1, p2, p3, p4, color) => {
            ctx.fillStyle = color;
            ctx.beginPath();
            ctx.moveTo(p1.x, p1.y - offY);
            ctx.lineTo(p2.x, p2.y - offY);
            ctx.lineTo(p3.x, p3.y - offY);
            ctx.lineTo(p4.x, p4.y - offY);
            ctx.closePath();
            ctx.fill();
            // Optional: Stroke for definition
            // ctx.strokeStyle = "rgba(0,0,0,0.1)";
            // ctx.stroke();
        };

        // Draw Left Face (Darkest)
        const h = BLOCK_HEIGHT * ZOOM;
        drawPoly(
            topP4, topP3,
            {x: topP3.x, y: topP3.y + h},
            {x: topP4.x, y: topP4.y + h},
            shadeColor(this.color, -20)
        );

        // Draw Right Face (Mid)
        drawPoly(
            topP3, topP2,
            {x: topP2.x, y: topP2.y + h},
            {x: topP3.x, y: topP3.y + h},
            shadeColor(this.color, -10)
        );

        // Draw Top Face (Lightest)
        drawPoly(topP1, topP2, topP3, topP4, this.color);
    }
    
    updateDebris() {
        this.vy += 0.5; // Gravity
        this.yPos -= this.vy;
    }
}

// Helper: Convert X/Z to Screen X/Y (without Y offset)
function toIso(x, z) {
    const screenX = (x - z) * ZOOM + width / 2;
    const screenY = (x + z) * 0.5 * ZOOM + (height / 1.5);
    return { x: screenX, y: screenY };
}

function shadeColor(color, percent) {
    // HSL parsing simpler, but let's assume color is HSL string
    // "hsl(100, 80%, 60%)"
    const regex = /hsl\((\d+),\s*(\d+)%,\s*(\d+)%\)/;
    const match = color.match(regex);
    if (!match) return color;
    
    let h = parseInt(match[1]);
    let s = parseInt(match[2]);
    let l = parseInt(match[3]);
    
    l = Math.max(0, Math.min(100, l + percent));
    return `hsl(${h}, ${s}%, ${l}%)`;
}

// --- Init ---

function init() {
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
    
    // Input
    window.addEventListener('mousedown', handleClick);
    window.addEventListener('keydown', e => {
        if (e.code === 'Space') handleClick();
    });
    
    // Initial loop for background
    loop();
}

function resizeCanvas() {
    width = canvas.parentElement.clientWidth;
    height = canvas.parentElement.clientHeight;
    canvas.width = width;
    canvas.height = height;
}

function startGame() {
    document.getElementById('start-screen').classList.add('hidden');
    document.getElementById('game-over').classList.add('hidden');
    
    // Reset State
    blocks = [];
    debris = [];
    score = 0;
    cameraY = 0;
    hue = 0;
    
    // Base Block
    const base = new Block(
        -START_SIZE/2, -START_SIZE/2, 
        START_SIZE, START_SIZE, 
        0, 
        `hsl(${hue}, 80%, 60%)`
    );
    blocks.push(base);
    
    spawnNextBlock();
    isPlaying = true;
}

function spawnNextBlock() {
    const prev = blocks[blocks.length - 1];
    hue = (hue + 10) % 360;
    
    // Determine spawn pos based on direction
    // Even score: Move along X (Z fixed)
    // Odd score: Move along Z (X fixed)
    const isX = score % 2 === 0;
    
    let x, z;
    if (isX) {
        x = -200; // Far left
        z = prev.z;
    } else {
        x = prev.x;
        z = -200; // Far back
    }
    
    activeBlock = new Block(x, z, prev.w, prev.d, score + 1, `hsl(${hue}, 80%, 60%)`);
    activeBlock.direction = isX ? 'x' : 'z';
    // Starting speed (increases with score)
    activeBlock.speed = MOVE_SPEED + (score * 0.05); 
}

// --- Game Logic ---

function handleClick() {
    if (!isPlaying) return;
    
    if (placeBlock()) {
        score++;
        document.getElementById('score').innerText = score;
        spawnNextBlock();
        
        // Move Camera
        // If stack gets high, scroll down
        if (score > 5) {
            // Target camera position
            // We want active block to be somewhat centered
        }
    } else {
        gameOver();
    }
}

function placeBlock() {
    const prev = blocks[blocks.length - 1];
    const curr = activeBlock;
    
    let cutW = curr.w;
    let cutD = curr.d;
    let cutX = curr.x;
    let cutZ = curr.z;
    
    // Delta determines overlap
    if (curr.direction === 'x') {
        const delta = curr.x - prev.x;
        if (Math.abs(delta) >= prev.w) return false; // Missed entirely
        
        // Trim
        cutW = prev.w - Math.abs(delta);
        cutX = delta > 0 ? curr.x : prev.x;
        
        // Create Debris (The slice that falls off)
        const debrisW = Math.abs(delta);
        const debrisX = delta > 0 ? (curr.x + cutW) : (curr.x);
        
        addDebris(debrisX, curr.z, debrisW, curr.d, curr.yIndex, curr.color);
        
    } else {
        const delta = curr.z - prev.z;
        if (Math.abs(delta) >= prev.d) return false;
        
        // Trim
        cutD = prev.d - Math.abs(delta);
        cutZ = delta > 0 ? curr.z : prev.z;
        
        // Debris
        const debrisD = Math.abs(delta);
        const debrisZ = delta > 0 ? (curr.z + cutD) : (curr.z);
        
        addDebris(curr.x, debrisZ, curr.w, debrisD, curr.yIndex, curr.color);
    }
    
    // Update active block to match cut size
    curr.x = cutX;
    curr.z = cutZ;
    curr.w = cutW;
    curr.d = cutD;
    
    blocks.push(curr);
    activeBlock = null;
    return true;
}

function addDebris(x, z, w, d, y, color) {
    const deb = new Block(x, z, w, d, y, color);
    debris.push(deb);
}

function gameOver() {
    isPlaying = false;
    document.getElementById('final-score').innerText = score;
    document.getElementById('game-over').classList.remove('hidden');
}

function update() {
    // 1. Move Active Block
    if (activeBlock && isPlaying) {
        if (activeBlock.direction === 'x') {
            activeBlock.x += activeBlock.speed;
            // Bounce bounds
            if (activeBlock.x > 150 || activeBlock.x < -200) activeBlock.speed *= -1;
        } else {
            activeBlock.z += activeBlock.speed;
            if (activeBlock.z > 150 || activeBlock.z < -200) activeBlock.speed *= -1;
        }
    }
    
    // 2. Camera Lerp
    const targetCam = Math.max(0, (score - 3) * BLOCK_HEIGHT * ZOOM);
    cameraY += (targetCam - cameraY) * 0.1;
    
    // 3. Debris Physics
    debris.forEach(d => d.updateDebris());
    debris = debris.filter(d => d.yPos > -500); // Remove if fell off screen
}

// --- Rendering ---

function draw() {
    ctx.clearRect(0, 0, width, height);
    
    // Draw Debris first (background)
    debris.forEach(d => d.draw());

    // Draw Stack (Bottom to Top)
    blocks.forEach(b => b.draw());
    
    // Draw Active
    if (activeBlock) activeBlock.draw();
}

function loop() {
    update();
    draw();
    requestAnimationFrame(loop);
}

// Start
init();