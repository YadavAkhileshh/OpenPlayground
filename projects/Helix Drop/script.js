/**
 * Helix Drop Engine
 * Uses 2D canvas scaling to simulate 3D cylindrical perspective.
 */

const canvas = document.getElementById('game-canvas');
const ctx = canvas.getContext('2d');

// --- Config ---
const GRAVITY = 0.5;
const BOUNCE_FORCE = -10;
const ROTATION_SENSITIVITY = 0.01;
const PLATFORM_GAP = 180; // Vertical distance
const COLUMN_RADIUS = 30;
const PLATFORM_RADIUS = 100;

// --- State ---
let width, height;
let ball = { y: 0, vy: 0, bounceY: 0 }; // x is fixed center
let platforms = []; // Array of ring objects
let rotation = 0; // Tower rotation (radians)
let cameraY = 0;
let score = 0;
let bestScore = 0;
let isPlaying = false;
let input = { isDown: false, lastX: 0 };
let splats = []; // {platIndex, angle, color}

// Colors
const PALETTE = ['#ff0055', '#0099ff', '#00cc66', '#ffcc00', '#9933ff'];

// --- Init ---

function init() {
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
    setupInput();
    
    // Load best score
    const saved = localStorage.getItem('helix_best');
    if (saved) bestScore = parseInt(saved);
    document.getElementById('best-score').innerText = bestScore;
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
    
    score = 0;
    rotation = 0;
    cameraY = 0;
    splats = [];
    
    // Reset Ball
    ball.y = height / 3;
    ball.vy = 0;
    ball.bounceY = ball.y;
    
    // Generate Initial Platforms
    platforms = [];
    for(let i=0; i<10; i++) {
        addPlatform(i * PLATFORM_GAP + height/2);
    }
    
    isPlaying = true;
    loop();
}

function addPlatform(y) {
    // Gap size in radians (e.g., 60 degrees)
    const gapSize = Math.PI / 2.5; 
    const angle = Math.random() * Math.PI * 2;
    
    platforms.push({
        y: y,
        gapStart: angle,
        gapSize: gapSize,
        color: PALETTE[Math.floor(Math.random() * PALETTE.length)],
        passed: false,
        splats: [] // Decals on this platform
    });
}

// --- Logic ---

function update() {
    if (!isPlaying) return;
    
    // 1. Ball Physics
    ball.vy += GRAVITY;
    ball.y += ball.vy;
    
    // 2. Collision Detection
    // Ball X,Z is effectively (0, PLATFORM_RADIUS) in polar coords relative to tower center?
    // Visually, ball is at screen center X, slightly forward Z.
    // In our simplified math, the "Ball Angle" is fixed at PI/2 (90 deg, front of screen).
    // The TOWER rotates. So we check if the gap aligns with PI/2.
    
    // We normalize collision angle to be relative to the platform's rotation
    const ballAngle = Math.PI / 2; // Fixed 'front' view
    
    // Check nearest platform below/at ball
    // We iterate backwards to find the one we might hit
    for (let i = 0; i < platforms.length; i++) {
        const p = platforms[i];
        
        // Check vertical collision (ball falling down through platform level)
        // Give some tolerance (radius of ball approx 10)
        if (ball.y + 10 > p.y && ball.y - ball.vy + 10 <= p.y) {
            
            // Normalize current gap position
            // Effective Gap Start = p.gapStart + rotation
            let relAngle = (ballAngle - rotation) % (Math.PI * 2);
            if (relAngle < 0) relAngle += Math.PI * 2;
            
            // Check if ball angle is inside the gap
            // Platform Gap is [gapStart, gapStart + gapSize]
            let start = p.gapStart % (Math.PI*2);
            let end = (p.gapStart + p.gapSize) % (Math.PI*2);
            
            let inGap = false;
            
            if (start < end) {
                inGap = relAngle > start && relAngle < end;
            } else {
                // Wrap around case (e.g. 350 to 10 deg)
                inGap = relAngle > start || relAngle < end;
            }
            
            if (inGap) {
                // Fall through!
                if (!p.passed) {
                    p.passed = true;
                    score++;
                    document.getElementById('score').innerText = score;
                    // Add new platform at bottom
                    addPlatform(platforms[platforms.length-1].y + PLATFORM_GAP);
                }
            } else {
                // Bounce!
                ball.y = p.y - 10;
                ball.vy = BOUNCE_FORCE;
                
                // Add Splat
                p.splats.push({
                    angle: relAngle, // Store relative to platform
                    color: '#c0392b', // Paint color
                    size: 15 + Math.random() * 10
                });
                
                // Game Over check? (If we had "Red Segments", check here)
            }
        }
    }
    
    // 3. Camera Follow
    // Keep ball in upper third
    const targetCam = ball.y - height / 3;
    cameraY += (targetCam - cameraY) * 0.1;
    
    // Cleanup passed platforms
    if (platforms[0].y < cameraY - 100) {
        platforms.shift();
    }
    
    // Death (Fall too far without platforms?) 
    // Actually, in this infinite runner, you usually die by hitting a specific color.
    // For this MVP, let's say you die if you hit a "Death Block" (not implemented yet)
    // or we can make it purely endless score attack.
    // Let's stick to Endless Score for now.
}

// --- Rendering ---

function draw() {
    ctx.clearRect(0, 0, width, height);
    
    // Background Gradient is in CSS, canvas is transparent
    
    ctx.save();
    // Center of screen
    ctx.translate(width / 2, 0);
    
    // Draw Central Pillar (Background)
    ctx.fillStyle = '#555';
    ctx.fillRect(-COLUMN_RADIUS, 0, COLUMN_RADIUS*2, height);
    
    // Draw Platforms (Back to Front ordering isn't strictly necessary if gaps don't overlap much visually, but helps)
    // Actually we need to draw relative to Ball Y (Camera)
    
    platforms.forEach(p => {
        const screenY = p.y - cameraY;
        if (screenY > -50 && screenY < height + 50) {
            drawPlatform(p, screenY);
        }
    });
    
    // Draw Ball
    const ballScreenY = ball.y - cameraY;
    drawBall(ballScreenY);
    
    ctx.restore();
}

function drawPlatform(p, y) {
    // We simulate 3D by scaling Y
    // Use scale(1, 0.4) to squash circle into ellipse
    ctx.save();
    ctx.translate(0, y);
    ctx.scale(1, 0.4); 
    ctx.rotate(rotation); // Rotate the whole platform context
    
    // Draw Full Ring
    // We draw the "solid" part. The gap is the empty part.
    // Arc from gapEnd to gapStart (inverse of gap)
    const start = p.gapStart + p.gapSize;
    const end = p.gapStart;
    
    ctx.beginPath();
    // Outer arc
    ctx.arc(0, 0, PLATFORM_RADIUS, start, end);
    // Inner arc (pillar hole)
    ctx.arc(0, 0, COLUMN_RADIUS, end, start, true); // Counter clockwise
    ctx.closePath();
    
    ctx.fillStyle = p.color;
    ctx.fill();
    
    // Draw Side Thickness (Fake 3D)
    // A bit complex for simple canvas shapes, skip for MVP or just add stroke
    ctx.lineWidth = 2;
    ctx.strokeStyle = 'rgba(0,0,0,0.2)';
    ctx.stroke();
    
    // Draw Splats
    p.splats.forEach(s => {
        ctx.fillStyle = 'rgba(255, 255, 255, 0.6)'; // Paint color
        ctx.beginPath();
        // Draw splat at stored angle
        const sx = Math.cos(s.angle) * (PLATFORM_RADIUS * 0.7);
        const sy = Math.sin(s.angle) * (PLATFORM_RADIUS * 0.7);
        ctx.arc(sx, sy, s.size, 0, Math.PI*2);
        ctx.fill();
    });
    
    ctx.restore();
}

function drawBall(y) {
    ctx.fillStyle = '#ff0055';
    ctx.beginPath();
    ctx.arc(0, y, 10, 0, Math.PI*2);
    ctx.fill();
    
    // Highlight
    ctx.fillStyle = '#fff';
    ctx.beginPath();
    ctx.arc(-3, y-3, 3, 0, Math.PI*2);
    ctx.fill();
}

// --- Input ---

function setupInput() {
    const startDrag = (x) => {
        input.isDown = true;
        input.lastX = x;
    };
    
    const moveDrag = (x) => {
        if (!input.isDown) return;
        const dx = x - input.lastX;
        rotation += dx * ROTATION_SENSITIVITY;
        input.lastX = x;
    };
    
    const endDrag = () => {
        input.isDown = false;
    };
    
    // Mouse
    canvas.addEventListener('mousedown', e => startDrag(e.clientX));
    window.addEventListener('mousemove', e => moveDrag(e.clientX));
    window.addEventListener('mouseup', endDrag);
    
    // Touch
    canvas.addEventListener('touchstart', e => {
        e.preventDefault(); 
        startDrag(e.touches[0].clientX);
    });
    window.addEventListener('touchmove', e => {
        e.preventDefault(); 
        moveDrag(e.touches[0].clientX);
    });
    window.addEventListener('touchend', endDrag);
}

function loop() {
    update();
    draw();
    requestAnimationFrame(loop);
}

// Start
init();