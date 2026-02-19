/**
 * SPH Fluid Engine
 * Smoothed Particle Hydrodynamics for simulating water physics.
 */

const canvas = document.getElementById('game-canvas');
const ctx = canvas.getContext('2d');

// --- SPH Constants ---
const GRAVITY = 0.3;
const SMOOTHING_RADIUS = 30; // h
const TARGET_DENSITY = 2.0;
const PRESSURE_MULTIPLIER = 15; // k
const VISCOSITY = 0.8;
const MAX_PARTICLES = 400; // Limit for performance

// --- Game State ---
let width, height;
let player = { x: 100, y: 100, vy: 0, w: 30, h: 50 };
let particles = [];
let terrain = []; // Array of rects
let cameraX = 0;
let fuel = 100;
let isThrusting = false;
let isPlaying = false;
let score = 0;

// Spatial Hash for Optimization
let grid = {};
const CELL_SIZE = SMOOTHING_RADIUS;

// --- Physics Classes ---

class Particle {
    constructor(x, y, vx, vy) {
        this.x = x;
        this.y = y;
        this.vx = vx;
        this.vy = vy;
        this.density = 0;
        this.pressure = 0;
        this.fx = 0;
        this.fy = 0;
        this.id = Math.random();
    }
}

// --- Init ---

function init() {
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
    setupInput();
    generateTerrain();
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
    
    // Reset
    player = { x: 150, y: height/2, vy: 0, w: 30, h: 50 };
    cameraX = 0;
    fuel = 100;
    particles = [];
    score = 0;
    isPlaying = true;
    
    // Pre-fill some pools
    spawnPool(400, height - 100, 50);
    
    loop();
}

function spawnPool(x, y, count) {
    for(let i=0; i<count; i++) {
        particles.push(new Particle(
            x + (Math.random()-0.5)*50,
            y + (Math.random()-0.5)*50,
            0, 0
        ));
    }
}

// --- SPH Logic ---

function updateSPH() {
    // 1. Build Spatial Grid
    grid = {};
    for (let p of particles) {
        const key = `${Math.floor(p.x/CELL_SIZE)},${Math.floor(p.y/CELL_SIZE)}`;
        if (!grid[key]) grid[key] = [];
        grid[key].push(p);
    }

    // 2. Calculate Density & Pressure
    for (let p of particles) {
        let density = 0;
        const neighbors = getNeighbors(p);
        
        for (let n of neighbors) {
            const dst = Math.hypot(p.x - n.x, p.y - n.y);
            if (dst < SMOOTHING_RADIUS) {
                // Poly6 Kernel Approximation
                density += smoothingKernel(dst, SMOOTHING_RADIUS);
            }
        }
        p.density = density;
        // P = k * (rho - rho_target)
        p.pressure = PRESSURE_MULTIPLIER * (density - TARGET_DENSITY);
    }

    // 3. Calculate Forces (Pressure Gradient + Viscosity)
    for (let p of particles) {
        let fPressX = 0, fPressY = 0;
        let fViscX = 0, fViscY = 0;
        const neighbors = getNeighbors(p);

        for (let n of neighbors) {
            if (p === n) continue;
            const dst = Math.hypot(p.x - n.x, p.y - n.y);
            
            if (dst < SMOOTHING_RADIUS && dst > 0) {
                // Pressure Force direction
                const dirX = (n.x - p.x) / dst;
                const dirY = (n.y - p.y) / dst;
                
                // Spiky Kernel Gradient for Pressure
                const slope = smoothingKernelDerivative(dst, SMOOTHING_RADIUS);
                const sharedPressure = (p.pressure + n.pressure) / 2;
                
                fPressX += sharedPressure * dirX * slope / n.density;
                fPressY += sharedPressure * dirY * slope / n.density; // Fix sign?
                // Actually Spiky Gradient is negative, so force pushes away.
                // Standard SPH: Fp = - mass * (Pi + Pj)/(2*rhoj) * GradW
                // Here we simplify signs.
                
                // Viscosity
                // Fv = mu * (vj - vi) * LapW
                // Simplified viscosity
                fViscX += (n.vx - p.vx) * VISCOSITY / n.density;
                fViscY += (n.vy - p.vy) * VISCOSITY / n.density;
            }
        }
        
        p.fx = fPressX + fViscX;
        p.fy = fPressY + fViscY + GRAVITY; // Add Gravity here
    }

    // 4. Integrate
    for (let i = particles.length - 1; i >= 0; i--) {
        let p = particles[i];
        p.vx += p.fx; // Force directly modifies velocity (assuming mass=1)
        p.vy += p.fy;
        
        p.x += p.vx;
        p.y += p.vy;
        
        // Bounds & Terrain Collision
        resolveCollisions(p);
        
        // Cull off-screen (left side)
        if (p.x < cameraX - 100) particles.splice(i, 1);
    }
}

function smoothingKernel(r, h) {
    // Poly6
    if (r >= h) return 0;
    const q = (h*h - r*r);
    return q*q*q; // Scale factor omitted for simple gameplay physics
}

function smoothingKernelDerivative(r, h) {
    // Spiky Gradient (simplified)
    if (r >= h) return 0;
    const q = (h - r);
    return q*q; 
}

function getNeighbors(p) {
    const cx = Math.floor(p.x / CELL_SIZE);
    const cy = Math.floor(p.y / CELL_SIZE);
    let results = [];
    
    for(let i=-1; i<=1; i++) {
        for(let j=-1; j<=1; j++) {
            const key = `${cx+i},${cy+j}`;
            if(grid[key]) results.push(...grid[key]);
        }
    }
    return results;
}

// --- Game Logic ---

function resolveCollisions(p) {
    // Floor
    if (p.y > height - 20) {
        p.y = height - 20;
        p.vy *= -0.5; // Damping
        p.vx *= 0.9;  // Friction
    }
    
    // Terrain Rects
    // Simple AABB vs Point
    for (let t of terrain) {
        if (p.x > t.x && p.x < t.x + t.w && p.y > t.y && p.y < t.y + t.h) {
            // Push out closest side
            // (Simplified: just push up for floors)
            if (p.vy > 0) {
                p.y = t.y;
                p.vy *= -0.5;
                p.vx *= 0.9;
            }
        }
    }
}

function updateGame() {
    // 1. Player Physics
    player.vy += GRAVITY * 0.5; // Lighter gravity for player
    
    // Thrust
    if (isThrusting && fuel > 0) {
        player.vy -= 0.8; // Fly up
        fuel -= 0.3;
        
        // Emit Particles
        if (particles.length < MAX_PARTICLES) {
            // Shoot down/back
            particles.push(new Particle(player.x, player.y + 40, -3 + Math.random(), 5 + Math.random()));
            particles.push(new Particle(player.x, player.y + 40, -2 + Math.random(), 4 + Math.random()));
        }
    }
    
    player.y += player.vy;
    
    // 2. Camera Move
    player.x += 2; // Constant forward speed
    cameraX = player.x - 150;
    score = Math.floor(player.x / 100);
    
    // 3. Collision with Fluid (Refill)
    // Simple density check around player
    let nearbyFluid = 0;
    const neighbors = getNeighbors(player); // Player acts like particle for query
    for(let n of neighbors) {
        if (Math.hypot(player.x - n.x, player.y - n.y) < 40) nearbyFluid++;
    }
    
    if (nearbyFluid > 5) {
        // Player is submerged
        if (fuel < 100) fuel += 1.0;
        // Buoyancy lift
        player.vy -= 0.5;
    }
    
    // 4. Terrain Bounds
    if (player.y > height - 50) {
        player.y = height - 50;
        player.vy = 0;
    }
    if (player.y < 0) player.y = 0;
    
    // Generate terrain ahead
    generateTerrain();
}

function generateTerrain() {
    const farEdge = cameraX + width;
    if (terrain.length === 0 || terrain[terrain.length-1].x < farEdge) {
        const lastX = terrain.length ? terrain[terrain.length-1].x + terrain[terrain.length-1].w : 0;
        const gap = 100 + Math.random() * 100;
        const w = 200 + Math.random() * 300;
        const h = 50 + Math.random() * 100;
        
        // Pit logic: Add a floor rect, sometimes leave a gap (pit)
        // We actually want walls/basins for water.
        
        // Floor segment
        terrain.push({
            x: lastX,
            y: height - 50,
            w: w,
            h: 50
        });
        
        // Sometimes add a wall to hold water
        if (Math.random() > 0.6) {
            terrain.push({
                x: lastX + w, 
                y: height - 150,
                w: 20, 
                h: 150 
            });
            // Add water in basin
            spawnPool(lastX + w/2, height - 100, 30);
        }
    }
    
    // Cleanup old terrain
    terrain = terrain.filter(t => t.x + t.w > cameraX - 100);
}

// --- Draw ---

function draw() {
    // Background
    ctx.clearRect(0, 0, width, height);
    
    ctx.save();
    ctx.translate(-cameraX, 0);
    
    // Draw Terrain
    ctx.fillStyle = '#2c3e50';
    for(let t of terrain) {
        ctx.fillRect(t.x, t.y, t.w, t.h);
        // Grass top
        ctx.fillStyle = '#27ae60';
        ctx.fillRect(t.x, t.y, t.w, 10);
        ctx.fillStyle = '#2c3e50';
    }
    
    // Draw Fluid (Metaballs-ish)
    // Draw circles with blur could work, but for performance just blue circles
    ctx.fillStyle = '#3498db';
    // ctx.filter = 'blur(4px) contrast(1.2)'; // Expensive! Use simple render for speed
    
    ctx.beginPath();
    for(let p of particles) {
        ctx.moveTo(p.x + 5, p.y);
        ctx.arc(p.x, p.y, 5, 0, Math.PI*2);
    }
    ctx.fill();
    // ctx.filter = 'none';
    
    // Draw Player
    ctx.fillStyle = '#ecf0f1';
    ctx.fillRect(player.x, player.y, player.w, player.h);
    // Jetpack
    ctx.fillStyle = '#95a5a6';
    ctx.fillRect(player.x - 10, player.y + 10, 10, 30);
    
    ctx.restore();
    
    // UI Updates
    document.getElementById('fuel-bar').style.width = fuel + "%";
    document.getElementById('dist-val').innerText = score;
    
    if (fuel <= 0 && Math.abs(player.vy) < 0.1 && nearbyFluid < 5) {
        // Stop if out of fuel and stuck?
        // Actually just let them run until they hit a wall or pit
    }
}

// --- Input ---

function setupInput() {
    const start = () => isThrusting = true;
    const end = () => isThrusting = false;
    
    window.addEventListener('mousedown', start);
    window.addEventListener('mouseup', end);
    window.addEventListener('touchstart', (e) => { e.preventDefault(); start(); });
    window.addEventListener('touchend', end);
}

function loop() {
    if (isPlaying) {
        updateGame();
        updateSPH();
        draw();
        requestAnimationFrame(loop);
    }
}

// Start
init();