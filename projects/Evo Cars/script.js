/**
 * Evo-Cars Engine
 * Custom Verlet Physics + Genetic Algorithm.
 */

const canvas = document.getElementById('sim-canvas');
const ctx = canvas.getContext('2d');

// --- Config ---
const POPULATION_SIZE = 20;
const GRAVITY = 0.5;
const FRICTION = 0.98;
const GROUND_FRICTION = 0.8;
const ITERATIONS = 5; // Physics accuracy
const MUTATION_RATE = 0.05;

// --- State ---
let width, height;
let cars = [];
let deadCars = [];
let terrain = [];
let generation = 1;
let cameraX = 0;
let simSpeed = 1;
let bestDistance = 0;

// --- Physics Classes ---

class Point {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.oldx = x;
        this.oldy = y;
        this.pinned = false;
        this.id = Math.random();
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
}

class Stick {
    constructor(p1, p2, length) {
        this.p1 = p1;
        this.p2 = p2;
        this.length = length || distance(p1, p2);
        this.stiffness = 1.0; // Rigid
    }

    update() {
        const dx = this.p2.x - this.p1.x;
        const dy = this.p2.y - this.p1.y;
        const dist = Math.sqrt(dx*dx + dy*dy);
        const diff = this.length - dist;
        const percent = (diff / dist) / 2 * this.stiffness;
        const offsetX = dx * percent;
        const offsetY = dy * percent;

        if (!this.p1.pinned) {
            this.p1.x -= offsetX;
            this.p1.y -= offsetY;
        }
        if (!this.p2.pinned) {
            this.p2.x += offsetX;
            this.p2.y += offsetY;
        }
    }
}

class Car {
    constructor(genome) {
        this.genome = genome || this.randomGenome();
        this.points = [];
        this.sticks = [];
        this.wheels = [];
        this.isDead = false;
        this.score = 0;
        this.health = 200; // Timeout if stuck
        this.maxX = 0;
        
        this.build();
    }

    randomGenome() {
        // [BodySize, WheelSize1, WheelSize2, WheelPos1, WheelPos2, Density]
        return [
            40 + Math.random() * 40, // Body Size
            20 + Math.random() * 25, // Rear Wheel
            20 + Math.random() * 25, // Front Wheel
            0.2 + Math.random() * 0.6, // Rear axle pos
            0.2 + Math.random() * 0.6  // Front axle pos
        ];
    }

    build() {
        const startX = 100;
        const startY = height / 2 - 200;
        const g = this.genome;

        // Chassis (Trapezoid-ish)
        // P0 (Top Left), P1 (Top Right), P2 (Bottom Right), P3 (Bottom Left)
        const size = g[0];
        this.points.push(new Point(startX - size, startY - size)); // 0
        this.points.push(new Point(startX + size, startY - size)); // 1
        this.points.push(new Point(startX + size, startY + size)); // 2
        this.points.push(new Point(startX - size, startY + size)); // 3

        // Center mass point for stability
        this.points.push(new Point(startX, startY)); // 4

        // Connect Chassis
        this.sticks.push(new Stick(this.points[0], this.points[1]));
        this.sticks.push(new Stick(this.points[1], this.points[2]));
        this.sticks.push(new Stick(this.points[2], this.points[3]));
        this.sticks.push(new Stick(this.points[3], this.points[0]));
        // Cross bracing
        this.sticks.push(new Stick(this.points[0], this.points[2]));
        this.sticks.push(new Stick(this.points[1], this.points[3]));
        this.sticks.push(new Stick(this.points[0], this.points[4]));
        this.sticks.push(new Stick(this.points[1], this.points[4]));
        this.sticks.push(new Stick(this.points[2], this.points[4]));
        this.sticks.push(new Stick(this.points[3], this.points[4]));

        // Wheels
        // Wheels are just points with radius for collision, constrained to chassis
        const rearWheel = new Point(startX - size + (g[3] * size*2), startY + size + g[1]);
        const frontWheel = new Point(startX - size + (g[4] * size*2), startY + size + g[2]);
        
        this.points.push(rearWheel); // 5
        this.points.push(frontWheel); // 6

        // Axles (Springs/Shocks)
        // Connect Rear Wheel to P3 and P4
        this.sticks.push(new Stick(this.points[3], rearWheel));
        this.sticks.push(new Stick(this.points[4], rearWheel));

        // Connect Front Wheel to P2 and P4
        this.sticks.push(new Stick(this.points[2], frontWheel));
        this.sticks.push(new Stick(this.points[4], frontWheel));

        // Wheel Props
        this.wheels.push({ point: rearWheel, r: g[1] });
        this.wheels.push({ point: frontWheel, r: g[2] });
    }

    update() {
        if (this.isDead) return;

        // Decrease health (stuck check)
        if (this.points[4].x > this.maxX + 2) {
            this.maxX = this.points[4].x;
            this.health = 200; // Reset health if moving forward
        } else {
            this.health--;
        }

        if (this.health <= 0 || this.points[4].y > height + 500) {
            this.isDead = true;
        }

        // Apply Motor Torque (Rotate wheels forward)
        // In verlet, we just push the wheel point forward along the ground
        for (let w of this.wheels) {
            w.point.x += 0.5; // Engine power
        }

        this.score = this.maxX;
    }

    draw(isBest) {
        if (this.isDead && !isBest) return;

        ctx.lineWidth = 2;
        ctx.strokeStyle = isBest ? '#ff0055' : 'rgba(255,255,255,0.3)';
        ctx.fillStyle = isBest ? 'rgba(255,0,85,0.2)' : 'transparent';

        // Chassis
        ctx.beginPath();
        ctx.moveTo(this.points[0].x, this.points[0].y);
        ctx.lineTo(this.points[1].x, this.points[1].y);
        ctx.lineTo(this.points[2].x, this.points[2].y);
        ctx.lineTo(this.points[3].x, this.points[3].y);
        ctx.closePath();
        ctx.stroke();
        ctx.fill();

        // Wheels
        ctx.fillStyle = isBest ? '#fff' : 'rgba(255,255,255,0.5)';
        for (let w of this.wheels) {
            ctx.beginPath();
            ctx.arc(w.point.x, w.point.y, w.r, 0, Math.PI*2);
            ctx.fill();
            // Spokes viz
            ctx.beginPath();
            ctx.moveTo(w.point.x, w.point.y);
            ctx.lineTo(w.point.x + Math.cos(w.point.x/w.r)*w.r, w.point.y + Math.sin(w.point.x/w.r)*w.r);
            ctx.strokeStyle = '#000';
            ctx.stroke();
        }
    }
}

// --- Helpers ---
function distance(p1, p2) {
    const dx = p1.x - p2.x;
    const dy = p1.y - p2.y;
    return Math.sqrt(dx*dx + dy*dy);
}

// --- Terrain Generation ---
function generateTerrain() {
    terrain = [];
    let x = 0;
    let y = height / 2 + 100;
    
    // Flat start area
    terrain.push({x: -500, y: y});
    terrain.push({x: 500, y: y});
    x = 500;

    // Rugged terrain
    for (let i = 0; i < 200; i++) {
        x += 40 + Math.random() * 60;
        // Slope increases with distance
        let slope = (Math.random() - 0.4) * (50 + i * 0.5); 
        y += slope;
        // Floor constraint
        if (y < height / 2) y = height / 2;
        if (y > height - 50) y = height - 50;
        
        terrain.push({x: x, y: y});
    }
}

// --- Physics Engine Core ---

function resolveConstraints(car) {
    // 1. Stick Constraints
    for (let s of car.sticks) s.update();

    // 2. Terrain Collision (Circle-Line collision for wheels)
    for (let w of car.wheels) {
        // Simple ground height check logic for speed (Optimization)
        // Find segment below wheel
        // Binary search or index mapping would be faster, but linear scan is OK for < 200 segments
        for (let i = 0; i < terrain.length - 1; i++) {
            const p1 = terrain[i];
            const p2 = terrain[i+1];
            
            if (w.point.x >= p1.x && w.point.x <= p2.x) {
                // Interpolate Y
                const t = (w.point.x - p1.x) / (p2.x - p1.x);
                const groundY = p1.y + t * (p2.y - p1.y);
                
                // Check penetration
                if (w.point.y + w.r > groundY) {
                    const depth = (w.point.y + w.r) - groundY;
                    w.point.y -= depth;
                    
                    // Apply Ground Friction
                    const vx = (w.point.x - w.point.oldx) * GROUND_FRICTION;
                    w.point.oldx = w.point.x - vx;
                }
                break; // Found segment
            }
        }
    }
    
    // Chassis collision (Simple point check)
    for(let i=0; i<4; i++) {
        const p = car.points[i];
         for (let j = 0; j < terrain.length - 1; j++) {
            if (p.x >= terrain[j].x && p.x <= terrain[j+1].x) {
                const t = (p.x - terrain[j].x) / (terrain[j+1].x - terrain[j].x);
                const groundY = terrain[j].y + t * (terrain[j+1].y - terrain[j].y);
                if (p.y > groundY) {
                    // Touching ground with chassis -> Bad friction, drag
                    p.y = groundY;
                    const vx = (p.x - p.oldx) * 0.5; // High drag
                    p.oldx = p.x - vx;
                    car.health -= 5; // Damage chassis
                }
                break;
            }
         }
    }
}

// --- Genetic Algorithm ---

function nextGeneration() {
    deadCars.sort((a, b) => b.score - a.score);
    bestDistance = Math.max(bestDistance, deadCars[0].score);
    
    const newCars = [];
    
    // Elitism: Top 2 survive
    newCars.push(new Car(deadCars[0].genome));
    newCars.push(new Car(deadCars[1].genome));

    // Fill rest
    while (newCars.length < POPULATION_SIZE) {
        const p1 = pickParent();
        const p2 = pickParent();
        const childGenome = crossover(p1.genome, p2.genome);
        mutate(childGenome);
        newCars.push(new Car(childGenome));
    }

    cars = newCars;
    deadCars = [];
    generation++;
    
    // Generate new terrain every 5 gens? No, keep same to learn it.
    // Reset positions
    document.getElementById('gen-val').innerText = generation;
}

function pickParent() {
    // Tournament Selection
    const subset = [];
    for(let i=0; i<5; i++) {
        subset.push(deadCars[Math.floor(Math.random() * deadCars.length)]);
    }
    subset.sort((a, b) => b.score - a.score);
    return subset[0];
}

function crossover(g1, g2) {
    const split = Math.floor(Math.random() * g1.length);
    return g1.slice(0, split).concat(g2.slice(split));
}

function mutate(genome) {
    const rate = document.getElementById('mutation-slider').value / 100;
    for (let i = 0; i < genome.length; i++) {
        if (Math.random() < rate) {
            genome[i] += (Math.random() - 0.5) * 10;
        }
    }
}

// --- Main Loop ---

function init() {
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
    
    document.getElementById('btn-reset').addEventListener('click', () => {
        generateTerrain();
        cars = [];
        deadCars = [];
        generation = 1;
        bestDistance = 0;
        for(let i=0; i<POPULATION_SIZE; i++) cars.push(new Car());
    });

    document.getElementById('speed-slider').addEventListener('input', (e) => {
        simSpeed = parseInt(e.target.value);
        document.getElementById('speed-display').innerText = simSpeed + 'x';
    });
    
    document.getElementById('mutation-slider').addEventListener('input', (e) => {
        document.getElementById('mutation-display').innerText = e.target.value + '%';
    });

    generateTerrain();
    for(let i=0; i<POPULATION_SIZE; i++) cars.push(new Car());
    
    requestAnimationFrame(loop);
}

function resizeCanvas() {
    width = canvas.parentElement.clientWidth;
    height = canvas.parentElement.clientHeight;
    canvas.width = width;
    canvas.height = height;
}

function loop() {
    // Simulation Steps
    for (let s = 0; s < simSpeed; s++) {
        if (cars.length === 0) {
            nextGeneration();
            break;
        }

        // Update Physics
        for (let i = cars.length - 1; i >= 0; i--) {
            const car = cars[i];
            
            // Verlet Point Updates
            for (let p of car.points) p.update();
            
            // Constraints (Iterate for stiffness)
            for (let k = 0; k < ITERATIONS; k++) {
                for (let st of car.sticks) st.update();
                resolveConstraints(car);
            }

            car.update();

            if (car.isDead) {
                deadCars.push(cars.splice(i, 1)[0]);
            }
        }
    }

    // Camera Logic (Follow best car)
    let leader = cars[0];
    for(let c of cars) {
        if (!leader || c.points[4].x > leader.points[4].x) leader = c;
    }
    
    // If all dead, focus on best dead
    if (!leader && deadCars.length > 0) leader = deadCars[0];

    const targetX = leader ? leader.points[4].x - 200 : 0;
    cameraX += (targetX - cameraX) * 0.1;

    // --- Render ---
    ctx.clearRect(0, 0, width, height);
    ctx.save();
    ctx.translate(-cameraX, 0);

    // Draw Terrain
    ctx.beginPath();
    ctx.moveTo(terrain[0].x, terrain[0].y);
    for (let i = 1; i < terrain.length; i++) {
        ctx.lineTo(terrain[i].x, terrain[i].y);
    }
    // Close shape for fill
    ctx.lineTo(terrain[terrain.length-1].x, height);
    ctx.lineTo(terrain[0].x, height);
    ctx.fillStyle = '#2c3e50';
    ctx.fill();
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Draw Cars
    for (let car of cars) {
        car.draw(car === leader);
    }
    
    // Draw dead cars (ghosts)
    for (let car of deadCars) {
        // Only draw nearby
        if(car.points[4].x > cameraX && car.points[4].x < cameraX + width) {
            ctx.globalAlpha = 0.2;
            car.draw(false);
            ctx.globalAlpha = 1.0;
        }
    }

    ctx.restore();

    // UI Updates
    document.getElementById('alive-val').innerText = cars.length;
    document.getElementById('dist-val').innerText = Math.floor(leader ? leader.score : 0) + 'm';
    
    if (leader) updateInfoPanel(leader);

    requestAnimationFrame(loop);
}

function updateInfoPanel(car) {
    const viz = document.getElementById('dna-viz');
    const labels = ["Body Size", "Back Wheel", "Front Wheel", "Back Pos", "Front Pos"];
    // Normalize for display
    let html = '';
    car.genome.forEach((gene, i) => {
        let val = gene; 
        let max = 100;
        if (i > 2) { val = gene * 100; max = 100; } // Positions
        const pct = Math.min(100, Math.max(0, (val / max) * 100));
        
        html += `
            <div class="dna-row">
                <span style="width:70px">${labels[i] || 'Gene '+i}</span>
                <div class="bar-bg"><div class="bar-fill" style="width:${pct}%"></div></div>
            </div>
        `;
    });
    viz.innerHTML = html;
}

// Start
init();