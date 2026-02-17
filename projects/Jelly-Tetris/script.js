/**
 * Jelly Tetris Engine
 * Soft-body physics using Verlet Integration.
 */

const canvas = document.getElementById('game-canvas');
const ctx = canvas.getContext('2d');

// --- Physics Config ---
const GRAVITY = 0.5;
const FRICTION = 0.98; // Air resistance
const BOUNCE = 0.4;
const STIFFNESS = 0.1; // Spring stiffness
const ITERATIONS = 5; // Solver iterations per frame
const BLOCK_SIZE = 30;

// --- State ---
let width, height;
let points = [];
let sticks = [];
let activePiece = null; // { pointIndices: [], centerIndex: int, color: str }
let settledPieces = []; // List of point indices that are locked
let score = 0;
let isPlaying = false;
let gameOverFlag = false;

// --- Physics Classes ---

class Point {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.oldx = x;
        this.oldy = y;
        this.pinned = false;
        this.isSettled = false;
    }

    update() {
        if (this.pinned) return;

        const vx = (this.x - this.oldx) * FRICTION;
        const vy = (this.y - this.oldy) * FRICTION;

        this.oldx = this.x;
        this.oldy = this.y;

        this.x += vx;
        this.y += vy;
        this.y += GRAVITY;
    }

    constrain() {
        // Floor
        if (this.y > height - 10) {
            this.y = height - 10;
            this.oldy = this.y + (this.y - this.oldy) * BOUNCE;
        }
        // Walls
        if (this.x > width - 10) {
            this.x = width - 10;
            this.oldx = this.x + (this.x - this.oldx) * BOUNCE;
        }
        if (this.x < 10) {
            this.x = 10;
            this.oldx = this.x + (this.x - this.oldx) * BOUNCE;
        }
    }
}

class Stick {
    constructor(p0, p1, length) {
        this.p0 = p0;
        this.p1 = p1;
        this.length = length || distance(p0, p1);
    }

    update() {
        const dx = this.p1.x - this.p0.x;
        const dy = this.p1.y - this.p0.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        const diff = this.length - dist;
        const percent = (diff / dist) / 2;
        const offsetx = dx * percent * STIFFNESS; // Apply stiffness
        const offsety = dy * percent * STIFFNESS;

        if (!this.p0.pinned) {
            this.p0.x -= offsetx;
            this.p0.y -= offsety;
        }
        if (!this.p1.pinned) {
            this.p1.x += offsetx;
            this.p1.y += offsety;
        }
    }
}

function distance(p0, p1) {
    return Math.sqrt((p1.x - p0.x)**2 + (p1.y - p0.y)**2);
}

// --- Tetromino Definitions ---

// Relative grid coordinates for shapes
const SHAPES = {
    I: [[0,0], [0,1], [0,2], [0,3]],
    O: [[0,0], [1,0], [0,1], [1,1]],
    T: [[0,0], [-1,0], [1,0], [0,1]],
    L: [[0,0], [0,1], [0,2], [1,2]],
    J: [[0,0], [0,1], [0,2], [-1,2]],
    S: [[0,0], [1,0], [0,1], [-1,1]],
    Z: [[0,0], [-1,0], [0,1], [1,1]]
};
const COLORS = ['#e74c3c', '#8e44ad', '#3498db', '#e67e22', '#2ecc71', '#f1c40f'];

// --- Game Logic ---

function init() {
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
    setupInput();
}

function resizeCanvas() {
    const container = canvas.parentElement;
    width = container.clientWidth;
    height = container.clientHeight;
    // Keep aspect ratio for game consistency
    if (width > height * 0.6) width = height * 0.6;
    
    canvas.width = width;
    canvas.height = height;
}

function startGame() {
    document.getElementById('start-screen').classList.add('hidden');
    document.getElementById('game-over').classList.add('hidden');
    
    points = [];
    sticks = [];
    activePiece = null;
    score = 0;
    isPlaying = true;
    gameOverFlag = false;
    document.getElementById('score-val').innerText = score;
    
    spawnPiece();
    loop();
}

function spawnPiece() {
    if (gameOverFlag) return;

    const typeKeys = Object.keys(SHAPES);
    const type = typeKeys[Math.floor(Math.random() * typeKeys.length)];
    const coords = SHAPES[type];
    const color = COLORS[Math.floor(Math.random() * COLORS.length)];
    
    const startX = width / 2;
    const startY = -60;
    
    // Create Points
    const newPointIndices = [];
    coords.forEach(c => {
        const p = new Point(startX + c[0] * BLOCK_SIZE, startY + c[1] * BLOCK_SIZE);
        points.push(p);
        newPointIndices.push(points.length - 1);
    });

    // Create Sticks (Structural + Cross-bracing)
    // Connect every point to every other point in the piece for rigidity
    for (let i = 0; i < newPointIndices.length; i++) {
        for (let j = i + 1; j < newPointIndices.length; j++) {
            const p1 = points[newPointIndices[i]];
            const p2 = points[newPointIndices[j]];
            sticks.push(new Stick(p1, p2));
        }
    }
    
    activePiece = {
        indices: newPointIndices,
        color: color,
        center: newPointIndices[0], // Approximate center for rotation
        settleTimer: 0
    };
}

function updatePhysics() {
    // Update Points
    for (let p of points) {
        p.update();
        p.constrain();
    }

    // Update Sticks (Iterate multiple times for stability)
    for (let i = 0; i < ITERATIONS; i++) {
        for (let s of sticks) {
            s.update();
        }
        // Collisions between points
        resolveCollisions();
    }
}

function resolveCollisions() {
    // Brute force point vs point collision (O(N^2) but N is small)
    // Radius of a point "blob"
    const radius = BLOCK_SIZE / 2;
    
    for (let i = 0; i < points.length; i++) {
        for (let j = i + 1; j < points.length; j++) {
            const p1 = points[i];
            const p2 = points[j];
            
            // Check approx distance
            const dx = p1.x - p2.x;
            const dy = p1.y - p2.y;
            const distSq = dx*dx + dy*dy;
            const minDst = radius * 2; // Diameter
            
            if (distSq < minDst * minDst) {
                const dist = Math.sqrt(distSq);
                const overlap = minDst - dist;
                const offsetX = (dx / dist) * overlap * 0.5;
                const offsetY = (dy / dist) * overlap * 0.5;
                
                // Push apart
                if (!p1.isSettled) {
                    p1.x += offsetX;
                    p1.y += offsetY;
                }
                if (!p2.isSettled) {
                    p2.x -= offsetX;
                    p2.y -= offsetY;
                }
            }
        }
    }
}

function updateGameLogic() {
    if (!activePiece) return;

    // Check if active piece has settled
    let maxVel = 0;
    activePiece.indices.forEach(idx => {
        const p = points[idx];
        const vel = Math.sqrt((p.x - p.oldx)**2 + (p.y - p.oldy)**2);
        maxVel = Math.max(maxVel, vel);
    });

    // Detect collision with settled pieces or floor for locking
    // Simple logic: if moving slowly and near bottom/settled stack
    let isTouching = false;
    // Check height
    activePiece.indices.forEach(idx => {
        const p = points[idx];
        if (p.y >= height - 15) isTouching = true;
    });
    
    // Or touching other points (simplified check via resolveCollisions side effect logic usually,
    // but here we just check velocity damping)

    if (maxVel < 0.2 && isTouching || (maxVel < 0.1 && activePiece.indices.some(idx => points[idx].y > height/2))) {
        activePiece.settleTimer++;
    } else {
        activePiece.settleTimer = 0;
    }

    if (activePiece.settleTimer > 60) {
        lockPiece();
    }
}

function lockPiece() {
    // Mark points as settled (optional logic flag)
    activePiece.indices.forEach(idx => points[idx].isSettled = true);
    
    // Check Game Over (Too high)
    activePiece.indices.forEach(idx => {
        if (points[idx].y < 50) gameOver();
    });

    if (!gameOverFlag) {
        checkLines();
        spawnPiece();
    }
}

function checkLines() {
    // Check vertical slices
    // Divide height into buckets. If a bucket has enough mass across width, clear it.
    const buckets = {};
    const bucketSize = BLOCK_SIZE; // Height of a row
    
    points.forEach((p, index) => {
        const yBucket = Math.floor(p.y / bucketSize);
        if (!buckets[yBucket]) buckets[yBucket] = [];
        buckets[yBucket].push(index);
    });

    const rowsToClear = [];
    
    for (let y in buckets) {
        // Find min and max X in this row
        const rowPoints = buckets[y].map(idx => points[idx]);
        let minX = width, maxX = 0;
        rowPoints.forEach(p => {
            if(p.x < minX) minX = p.x;
            if(p.x > maxX) maxX = p.x;
        });

        // If span is mostly full (e.g., > 90% of width)
        if (maxX - minX > width * 0.9 && rowPoints.length > 5) {
            rowsToClear.push(y);
        }
    }

    if (rowsToClear.length > 0) {
        score += rowsToClear.length * 100;
        document.getElementById('score-val').innerText = score;

        // Remove points and sticks
        // This is tricky in array-based physics. 
        // Strategy: Mark 'dead', filter arrays.
        
        const indicesToRemove = new Set();
        rowsToClear.forEach(y => {
            buckets[y].forEach(idx => indicesToRemove.add(idx));
        });

        // Remove Sticks connecting to dead points
        sticks = sticks.filter(s => {
            const i1 = points.indexOf(s.p0);
            const i2 = points.indexOf(s.p1);
            return !indicesToRemove.has(i1) && !indicesToRemove.has(i2);
        });

        // Remove Points (Filter and shift activePiece indices? Hard.
        // Easier: Just move them off screen or make invisible/non-colliding)
        
        // Let's implement actual removal for performance
        // We need to map old indices to new indices
        const newPoints = [];
        const indexMap = {};
        let newIdx = 0;

        points.forEach((p, i) => {
            if (!indicesToRemove.has(i)) {
                newPoints.push(p);
                indexMap[i] = newIdx++;
            } else {
                // Create particle effect
                createExplosion(p.x, p.y);
            }
        });

        points = newPoints;
        
        // Remap sticks
        sticks.forEach(s => {
            // Objects reference remains, so we don't strictly need to remap INDICES 
            // if sticks hold object references (which they do).
            // So filtering points is enough!
        });
        
        // Active piece indices might be messed up if we cleared lines while piece falling?
        // Unlikely if we only clear on lock.
    }
}

function createExplosion(x, y) {
    // Just visual implementation in Draw if needed
}

function gameOver() {
    gameOverFlag = true;
    isPlaying = false;
    document.getElementById('final-score').innerText = score;
    document.getElementById('game-over').classList.remove('hidden');
}

// --- Draw ---

function draw() {
    ctx.clearRect(0, 0, width, height);
    
    // Draw Sticks (Constraints)
    ctx.beginPath();
    ctx.strokeStyle = '#555';
    ctx.lineWidth = 2;
    // Don't draw internal bracing sticks to keep look clean?
    // Or just draw the "Skin".
    // Let's draw active piece skin and settled piece skins.
    
    // Simple Debug Draw first:
    // sticks.forEach(s => {
    //    ctx.moveTo(s.p0.x, s.p0.y);
    //    ctx.lineTo(s.p1.x, s.p1.y);
    // });
    // ctx.stroke();
    
    // Draw Points (Jelly Blobs)
    points.forEach(p => {
        ctx.fillStyle = '#e74c3c'; // Need color mapping
        ctx.beginPath();
        ctx.arc(p.x, p.y, BLOCK_SIZE/2 + 2, 0, Math.PI*2);
        ctx.fill();
        
        // Highlight
        ctx.fillStyle = 'rgba(255,255,255,0.3)';
        ctx.beginPath();
        ctx.arc(p.x - 5, p.y - 5, 5, 0, Math.PI*2);
        ctx.fill();
    });
}

// --- Inputs ---

function setupInput() {
    window.addEventListener('keydown', e => {
        if (!isPlaying || !activePiece) return;
        
        // Apply forces to active piece
        const force = 2;
        
        if (e.key === 'ArrowLeft') {
            activePiece.indices.forEach(i => points[i].x -= force);
        }
        if (e.key === 'ArrowRight') {
            activePiece.indices.forEach(i => points[i].x += force);
        }
        if (e.key === 'ArrowDown') {
            activePiece.indices.forEach(i => points[i].y += force);
        }
        if (e.key === 'ArrowUp') {
            rotatePiece();
        }
    });
}

function rotatePiece() {
    // Rotate around center of mass
    const center = points[activePiece.indices[0]]; // Approx center
    const cx = center.x;
    const cy = center.y;
    const angle = Math.PI / 2;
    
    activePiece.indices.forEach(i => {
        const p = points[i];
        const dx = p.x - cx;
        const dy = p.y - cy;
        
        // Rotate coords
        const nx = dx * Math.cos(angle) - dy * Math.sin(angle);
        const ny = dx * Math.sin(angle) + dy * Math.cos(angle);
        
        // Apply to position
        p.x = cx + nx;
        p.y = cy + ny;
        // Reset velocity for stability
        p.oldx = p.x; 
        p.oldy = p.y;
    });
}

function loop() {
    if (isPlaying) {
        updatePhysics();
        updateGameLogic();
        draw();
        requestAnimationFrame(loop);
    }
}

// Start
init();