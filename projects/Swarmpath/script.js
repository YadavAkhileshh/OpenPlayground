/**
 * CONFIGURATION
 */
const CONFIG = {
    // Movement
    baseSpeed: 2.5,     // Fast default speed
    scoutSpeed: 3.5,    // Super fast searching speed
    turnSpeed: 0.2,
    sensorAngle: Math.PI / 4,
    sensorDist: 35,     // Long range sensors
    
    // Pheromones
    evaporation: 0.98,
    scentStrength: 60,
    
    // Colony
    spawnCost: 8,
    maxAnts: 600
};

// State Variables
let ants = [], foods = [];
let queen = { x: 0, y: 0, food: 0, timer: 0 };
let pheromones = { food: null, home: null, w: 0, h: 0 };
let width, height;
let fastForward = false;
let debug = false;
let frame = 0;

// DOM Elements
const cvs = document.getElementById('simCanvas');
const ctx = cvs.getContext('2d');
const soilCvs = document.getElementById('soilCanvas');
const soilCtx = soilCvs.getContext('2d');

/**
 * INITIALIZATION
 */
function init() {
    resize();
    
    initGrid();
    drawSoil();
    
    // Setup Colony Center
    queen.x = width / 2;
    queen.y = height / 2;
    
    ants = [];
    foods = [];
    
    // Spawn Initial Ants
    for(let i=0; i<20; i++) ants.push(new Ant());
    
    // Initial Chamber Dig
    dig(queen.x, queen.y, 45); 

    // Initial Food Sources
    createFood(width/2 - 250, height/2, 800);
    createFood(width/2 + 250, height/2, 800);

    // Start Loop
    loop();
}

function resize() {
    width = window.innerWidth;
    height = window.innerHeight;
    cvs.width = width;
    cvs.height = height;
    soilCvs.width = width;
    soilCvs.height = height;
}

function initGrid() {
    const scale = 4;
    const c = Math.ceil(width / scale);
    const r = Math.ceil(height / scale);
    pheromones.food = new Float32Array(c * r);
    pheromones.home = new Float32Array(c * r);
    pheromones.w = c; 
    pheromones.h = r;
}

function drawSoil() {
    soilCtx.fillStyle = '#3e2f26';
    soilCtx.fillRect(0, 0, width, height);
    // Add noise texture
    for(let i=0; i<10000; i++) {
        soilCtx.fillStyle = Math.random() > 0.5 ? '#4e3b30' : '#2a201a';
        soilCtx.fillRect(Math.random() * width, Math.random() * height, 3, 3);
    }
}

/**
 * ANT INTELLIGENCE CLASS
 */
class Ant {
    constructor() {
        this.x = queen.x; 
        this.y = queen.y;
        this.angle = Math.random() * Math.PI * 2;
        this.hasFood = false;
        this.state = 'SCOUT'; // Default to fast roaming
    }

    update() {
        this.think();     // 1. Logic
        this.sense();     // 2. Sensors
        this.move();      // 3. Physics
        this.interact();  // 4. Digging/Pheromones
    }

    think() {
        // Interaction with Food
        if (!this.hasFood) {
            for (let i = foods.length - 1; i >= 0; i--) {
                const f = foods[i];
                if (Math.hypot(this.x - f.x, this.y - f.y) < f.radius + 6) {
                    f.amount--;
                    if(f.amount <= 0) foods.splice(i, 1);
                    this.hasFood = true;
                    this.state = 'RETURN'; // Go home
                    this.angle += Math.PI; // About face
                    return;
                }
            }
        }
        // Interaction with Queen
        else if (this.hasFood) {
            if (Math.hypot(this.x - queen.x, this.y - queen.y) < 30) {
                queen.food++;
                this.hasFood = false;
                this.state = 'SCOUT'; // Go find more
                this.angle += Math.PI;
                return;
            }
        }
    }

    sense() {
        // Determine what to smell
        let grid = null;
        if (this.hasFood) grid = pheromones.home; // Look for home trail
        else grid = pheromones.food; // Look for food trail

        // Sensor Geometry
        const L = this.getScent(this.angle - CONFIG.sensorAngle, grid);
        const C = this.getScent(this.angle, grid);
        const R = this.getScent(this.angle + CONFIG.sensorAngle, grid);

        // BEHAVIOR:
        // If we smell NOTHING, we are in "Free Roam" mode.
        // In Free Roam, move straighter and faster (scouting).
        if (L < 1 && C < 1 && R < 1 && !this.hasFood) {
            this.state = 'SCOUT';
            // Randomly wiggle slightly, but mostly keep bearing
            this.angle += (Math.random() - 0.5) * 0.05; 
        } else {
            // We smell something! Track it tight.
            if (C > L && C > R) { /* Go straight */ }
            else if (C < L && C < R) { this.angle += (Math.random() - 0.5) * 2; } // Confused
            else if (L > R) { this.angle -= CONFIG.turnSpeed; }
            else { this.angle += CONFIG.turnSpeed; }
        }

        // Keep bounds
        if(this.x < 5 || this.x > width - 5 || this.y < 5 || this.y > height - 5) {
            this.angle += Math.PI;
            this.x = Math.max(10, Math.min(width - 10, this.x));
            this.y = Math.max(10, Math.min(height - 10, this.y));
        }
    }

    getScent(ang, grid) {
        const sx = this.x + Math.cos(ang) * CONFIG.sensorDist;
        const sy = this.y + Math.sin(ang) * CONFIG.sensorDist;
        
        let score = 0;
        
        // 1. Grid Scent
        const gx = Math.floor(sx / 4), gy = Math.floor(sy / 4);
        if(gx >= 0 && gx < pheromones.w && gy >= 0 && gy < pheromones.h) {
            score += grid[gy * pheromones.w + gx];
        }

        // 2. Vision (See objectives directly)
        if (this.hasFood) {
            // See Queen
            const d = Math.hypot(sx - queen.x, sy - queen.y);
            if (d < 100) score += 1000 / (d + 1);
        } else {
            // See Food
            for(let f of foods) {
                const d = Math.hypot(sx - f.x, sy - f.y);
                if (d < 100) score += 1000 / (d + 1);
            }
        }
        return score;
    }

    move() {
        // Scouts move faster to cover map
        let spd = (this.state === 'SCOUT') ? CONFIG.scoutSpeed : CONFIG.baseSpeed;
        this.x += Math.cos(this.angle) * spd;
        this.y += Math.sin(this.angle) * spd;
    }

    interact() {
        // 1. DROP PHEROMONE
        const gx = Math.floor(this.x / 4), gy = Math.floor(this.y / 4);
        if(gx >= 0 && gx < pheromones.w && gy >= 0 && gy < pheromones.h) {
            const arr = this.hasFood ? pheromones.food : pheromones.home;
            arr[gy * pheromones.w + gx] = Math.min(255, arr[gy * pheromones.w + gx] + CONFIG.scentStrength);
        }

        // 2. DIGGING LOGIC
        // Rule: Only dig if CARRYING food (highway) or expanding nest
        const distToNest = Math.hypot(this.x - queen.x, this.y - queen.y);
        
        // Nest Expansion (Population based size)
        const nestSize = 45 + (ants.length * 0.2);
        if (distToNest < nestSize) {
            dig(this.x, this.y, 8);
        }
        
        // Highway Construction
        if (this.hasFood) {
            // Dig radius based on Pheromone strength (Popularity = Wider)
            const strength = pheromones.food[gy * pheromones.w + gx];
            
            if (strength > 20) {
                // Determine tunnel width: 4px base, up to 12px for super-highways
                const width = 4 + (strength / 30);
                dig(this.x, this.y, Math.min(12, width));
            }
        }
    }
}

/**
 * HELPER FUNCTIONS
 */
function dig(x, y, r) {
    soilCtx.globalCompositeOperation = 'destination-out';
    soilCtx.beginPath();
    soilCtx.arc(x, y, r, 0, Math.PI * 2);
    soilCtx.fill();
    soilCtx.globalCompositeOperation = 'source-over';
}

function createFood(x, y, amt) {
    foods.push({x, y, amount: amt, radius: 10});
}

/**
 * MAIN LOOP
 */
function loop() {
    const steps = fastForward ? 4 : 1;
    
    for(let s = 0; s < steps; s++) {
        // Evaporation
        for(let i = 0; i < pheromones.food.length; i++) {
            pheromones.food[i] *= CONFIG.evaporation;
            pheromones.home[i] *= CONFIG.evaporation;
        }

        // Ants
        ants.forEach(a => a.update());

        // Queen Spawn
        if (queen.food > CONFIG.spawnCost && ants.length < CONFIG.maxAnts) {
            queen.timer++;
            if (queen.timer > 10) { // Fast spawn
                queen.food -= CONFIG.spawnCost;
                ants.push(new Ant());
                queen.timer = 0;
            }
        }
    }

    draw();
    frame++;
    requestAnimationFrame(loop);
}

function draw() {
    ctx.clearRect(0, 0, width, height);

    // DEBUG SCENT VIEW
    if (debug) {
        const id = ctx.getImageData(0, 0, width, height);
        const d = id.data;
        // Perf optimization: Only draw every few frames or keep simple
        for(let y = 0; y < pheromones.h; y++) {
            for(let x = 0; x < pheromones.w; x++) {
                const i = y * pheromones.w + x;
                const f = pheromones.food[i];
                const h = pheromones.home[i];
                if (f > 10 || h > 10) {
                    // Map grid to pixels
                    const px = (y * 4) * width * 4 + (x * 4) * 4;
                    // Prevent out of bounds
                    if (px < d.length - 4) {
                        d[px] = f;      // Red
                        d[px+1] = h;    // Green
                        d[px+2] = 0;    // Blue
                        d[px+3] = 255;  // Alpha
                    }
                }
            }
        }
        ctx.putImageData(id, 0, 0);
    }

    // DRAW FOOD
    foods.forEach(f => {
        ctx.fillStyle = '#0f8';
        ctx.shadowBlur = 10; 
        ctx.shadowColor = '#0f8';
        ctx.beginPath(); 
        ctx.arc(f.x, f.y, Math.sqrt(f.amount) + 2, 0, Math.PI * 2); 
        ctx.fill();
        ctx.shadowBlur = 0;
    });

    // DRAW QUEEN
    ctx.fillStyle = '#d0d';
    ctx.beginPath(); 
    ctx.arc(queen.x, queen.y, 10, 0, Math.PI * 2); 
    ctx.fill();

    // DRAW ANTS
    ctx.fillStyle = '#eee';
    ants.forEach(a => {
        if (a.hasFood) ctx.fillStyle = '#0f8';
        else ctx.fillStyle = '#fff';
        ctx.fillRect(a.x - 1.5, a.y - 1.5, 3, 3);
    });

    // UPDATE UI
    if (frame % 10 === 0) {
        document.getElementById('s-pop').innerText = ants.length;
        document.getElementById('s-food').innerText = Math.floor(queen.food);
    }
}

/**
 * EVENT LISTENERS
 */
// Mouse event handler
function handleMouseOrTouch(e) {
    let clientX, clientY;
    
    if (e.type.includes('touch')) {
        // Touch event
        clientX = e.touches[0].clientX;
        clientY = e.touches[0].clientY;
    } else {
        // Mouse event
        clientX = e.clientX;
        clientY = e.clientY;
    }
    
    createFood(clientX, clientY, 1000);
}

// Mouse events
cvs.addEventListener('mousedown', handleMouseOrTouch);

// Touch events for mobile
cvs.addEventListener('touchstart', handleMouseOrTouch);

document.getElementById('btn-ff').addEventListener('click', (e) => {
    fastForward = !fastForward;
    e.target.classList.toggle('active');
});

document.getElementById('btn-debug').addEventListener('click', (e) => {
    debug = !debug;
    e.target.classList.toggle('active');
});

document.getElementById('btn-reset').addEventListener('click', () => {
    // Reset Logic
    ants = []; 
    foods = []; 
    queen.food = 0;
    
    // Clear soil
    drawSoil();
    
    // Redig nest
    dig(queen.x, queen.y, 45);
    
    // Reset Grid
    initGrid();
    
    // Respawn Initial Ants
    for(let i=0; i<20; i++) ants.push(new Ant());
});

window.addEventListener('resize', () => {
    // On resize, we simply reload to keep coordinates sane
    location.reload();
});

// Start Simulation
init();