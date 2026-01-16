const canvas = document.getElementById('simulationCanvas');
const ctx = canvas.getContext('2d', { alpha: false }); // Optimization: disable alpha if not needed for clear
const fpsDisplay = document.getElementById('fps');

// State
let width, height;
let particles = [];
let particleCount = 1000;
let typeCount = 4; // Default types
const colors = ['#fe0000', '#00fe00', '#0000fe', '#fe00fe', '#00fefe', '#fefe00']; // Red, Green, Blue, Magenta, Cyan, Yellow
let rules = []; // 2D array [typeA][typeB] = Force
let isRunning = true;

// Parameters
const friction = 0.5; // Velocity decay 0-1
const rMax = 80; // Max interaction radius
const beta = 0.3; // Repulsion force strength

// Arrays for Struct-of-Arrays (SoA) layout for better cache locality (optional optimization level 1)
// For simplicity and readability in this version, we'll use a flat Float32Array for positions/velocities
// format: [x, y, vx, vy, type, padding, padding, padding] stride = 8? No, simple arrays are Objects in JS.
// Let's stick to Objects for code clarity first, optimized later if needed. 
// Actually, let's go with TypedArrays for positions/velocities for 3000+ particles smooth.

let x = new Float32Array(particleCount);
let y = new Float32Array(particleCount);
let vx = new Float32Array(particleCount);
let vy = new Float32Array(particleCount);
let type = new Uint8Array(particleCount);

function resize() {
    width = window.innerWidth;
    height = window.innerHeight;
    canvas.width = width;
    canvas.height = height;
}

window.addEventListener('resize', resize);
resize();

function initParticles(count) {
    particleCount = count;
    x = new Float32Array(particleCount);
    y = new Float32Array(particleCount);
    vx = new Float32Array(particleCount);
    vy = new Float32Array(particleCount);
    type = new Uint8Array(particleCount);

    for (let i = 0; i < particleCount; i++) {
        x[i] = Math.random() * width;
        y[i] = Math.random() * height;
        vx[i] = 0;
        vy[i] = 0;
        type[i] = Math.floor(Math.random() * typeCount);
    }
}

function initRules(newTypeCount) {
    if (newTypeCount) typeCount = newTypeCount;
    rules = [];
    for (let i = 0; i < typeCount; i++) {
        rules[i] = [];
        for (let j = 0; j < typeCount; j++) {
            rules[i][j] = (Math.random() * 2 - 1); // -1 to 1
        }
    }
    updateMatrixUI();
}

function updatePhysics() {
    for (let i = 0; i < particleCount; i++) {
        let fx = 0;
        let fy = 0;
        const typeA = type[i];

        // This O(N^2) loop is the bottleneck. 
        // Logic: Force = defined by rule table based on types.
        for (let j = 0; j < particleCount; j++) {
            if (i === j) continue;
            
            const typeB = type[j];
            const g = rules[typeA][typeB];
            
            let dx = x[j] - x[i];
            let dy = y[j] - y[i];
            
            // Wrap around distance (toroidal topology)
            if (dx > width * 0.5) dx -= width;
            if (dx < -width * 0.5) dx += width;
            if (dy > height * 0.5) dy -= height;
            if (dy < -height * 0.5) dy += height;
            
            const d2 = dx * dx + dy * dy;
            
            if (d2 > 0 && d2 < rMax * rMax) {
                const d = Math.sqrt(d2);
                const q = 1.0 / d;
                const force = g * q; 
                // Simple attraction/repulsion. 
                // Improvements: using the "Particle Life" standard formula
                // F = 0 if d < minR? No, F = repulsive if too close.
                
                // Classic Particle Life Formula logic usually:
                // If dist < range:
                //   F = force factor * (1 - dist/range)
                // We want: 
                // 1. Repulsion if very close (prevent clumping into singular points)
                // 2. Attraction/Repulsion based on G rule at medium distance.
                
                // Let's implement the standard specialized formula:
                // F = G * 1/d   <-- too simple, explodes at d=0.
                
                // Better formula:
                // Normalise dist: r = d / rMax
                // if r < beta (too close): F = r/beta - 1  (repulsive, goes to -1 at r=0)
                // if beta < r < 1: F = G * (1 - abs(2*r - 1 - beta) / (1 - beta)) <-- Smooth peak?
                // Simpler linear version often used:
                // if r < beta: F = r/beta - 1
                // if r > beta: F = rules[a][b] * (1 - abs(2*r - 1 - beta)/(1-beta))
                
                // Let's use a robust approximation:
                // Force based on inverse distance but capped?
                
                // Let's try the CodeParade/Jeffrey Ventrella style "Clusters" formula:
                // It requires calculating relation between particles.
                // Let's stick to a simpler inverse-square-like with cap for now to ensure cool visuals quickly.
                
                // Force = (G * maxR - d) / maxR  ? No.
                
                // Let's use the actual standard Particle Life integration:
                // vx = (vx + fx) * 0.5
                // fx += dx/d * F
                
                // Defining F(r):
                // r = d/rMax
                // if (r < beta) { F = r/beta - 1; }  <-- Repulsion (-1 at 0, 0 at beta)
                // else if (beta < r < 1) { F = rules * (1 - abs(2*r - 1 - beta)/(1-beta)); }
                
                const r = d / rMax;
                let f = 0;
                
                if (r < beta) {
                    f = r / beta - 1; // Repulsion
                } else if (beta < r && r < 1) {
                    f = rules[typeA][typeB] * (1 - Math.abs(2 * r - 1 - beta) / (1 - beta));
                }
                
                fx += (dx / d) * f;
                fy += (dy / d) * f;
            }
        }
        
        vx[i] = (vx[i] + fx) * friction;
        vy[i] = (vy[i] + fy) * friction;
        
        x[i] += vx[i];
        y[i] += vy[i];
        
        // Screen wrap
        if (x[i] <= 0) x[i] += width;
        if (x[i] >= width) x[i] -= width;
        if (y[i] <= 0) y[i] += height;
        if (y[i] >= height) y[i] -= height;
    }
}

function draw() {
    // Clear with trail effect
    // ctx.fillStyle = 'rgba(0, 0, 0, 0.2)'; // Trail
    // ctx.fillRect(0, 0, width, height); -- Trail is expensive on filling huge canvas? 
    // Just clear for clear dots usually looks sharper for this simulation
    ctx.fillStyle = '#050505';
    ctx.fillRect(0, 0, width, height);

    for (let i = 0; i < particleCount; i++) {
        const cx = x[i];
        const cy = y[i];
        
        ctx.fillStyle = colors[type[i]];
        // Draw square for speed? Circle is better quality.
        // ctx.fillRect(cx, cy, 2, 2); 
        
        ctx.beginPath();
        ctx.arc(cx, cy, 1.5, 0, Math.PI * 2);
        ctx.fill();
    }
}

// Stats
let lastTime = 0;
function loop(timestamp) {
    if (!isRunning) return;
    
    const dt = timestamp - lastTime;
    lastTime = timestamp;
    
    updatePhysics();
    draw();
    
    fpsDisplay.innerText = `FPS: ${Math.round(1000/dt)}`;
    
    requestAnimationFrame(loop);
}

// UI & Logic
const slider = document.getElementById('particle-count');
const valDisplay = document.getElementById('particle-count-val');
const restartBtn = document.getElementById('restart-btn');
const randomizeBtn = document.getElementById('randomize-btn');
const matrixContainer = document.getElementById('matrix-container');

slider.addEventListener('input', (e) => {
    valDisplay.innerText = e.target.value;
});

slider.addEventListener('change', (e) => {
    initParticles(parseInt(e.target.value));
});

restartBtn.addEventListener('click', () => {
    x.fill(0).map(() => Math.random() * width); // This won't work on TypedArray this way
    // Re-init positions
    for(let i=0; i<particleCount; i++){
        x[i] = Math.random() * width;
        y[i] = Math.random() * height;
        vx[i] = 0; vy[i] = 0;
    }
});

randomizeBtn.addEventListener('click', () => {
    initRules();
});

// Matrix UI
function updateMatrixUI() {
    matrixContainer.innerHTML = '';
    matrixContainer.style.gridTemplateColumns = `20px repeat(${typeCount}, 1fr)`; // +1 for label col
    
    // Header Row
    matrixContainer.appendChild(document.createElement('div')); // Empty corner
    for(let i=0; i<typeCount; i++) {
        const label = document.createElement('div');
        label.style.color = colors[i];
        label.innerText = 'T'+(i+1);
        label.style.textAlign = 'center';
        label.style.fontSize = '0.7rem';
        matrixContainer.appendChild(label);
    }

    for (let i = 0; i < typeCount; i++) {
        // Row Label
        const label = document.createElement('div');
        label.style.color = colors[i];
        label.innerText = 'T'+(i+1);
        label.style.fontSize = '0.7rem';
        label.style.display = 'flex';
        label.style.alignItems = 'center';
        matrixContainer.appendChild(label);

        for (let j = 0; j < typeCount; j++) {
            const input = document.createElement('input');
            input.type = 'number';
            input.className = `matrix-cell color-${i}`;
            input.step = 0.1;
            input.min = -1;
            input.max = 1;
            input.value = rules[i][j].toFixed(2);
            input.dataset.i = i;
            input.dataset.j = j;
            
            input.addEventListener('change', (e) => {
                let val = parseFloat(e.target.value);
                if (isNaN(val)) val = 0;
                val = Math.max(-1, Math.min(1, val)); // Clamp
                rules[parseInt(e.target.dataset.i)][parseInt(e.target.dataset.j)] = val;
            });
            
            matrixContainer.appendChild(input);
        }
    }
}

// Presets
const presets = {
    'cells': {
        types: 4,
        // High attraction/repulsion balance
        seed: () => {
             // Hardcoded cool matrix or algorithmic generation?
             // Let's create a specific nice one manually for demonstration or use randomized search.
             // Actually, fixed presets are better.
             return [
                 [1, 0.5, -0.2, 0.5],
                 [0.1, 1, 0.1, -0.5],
                 [-0.5, 0.1, 1, 0.1],
                 [0.1, -0.5, 0.1, 1]
             ];
             // This is just a placeholder, "Cells" usually implies specific settings. 
             // We'll trust the randomization for "Chaos" and fine-tune later if needed.
             // For now, let's implement the button to just trigger a known good config.
        }
    },
    'snake': {
        types: 3,
        matrix: [ 
            [0.2, 0.5, 0], 
            [0, 0.2, 0.5], 
            [0.5, 0, 0.2] 
        ]
    }
};

document.querySelectorAll('.preset-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
        const pName = e.target.dataset.preset;
        if(pName === 'swarm') {
            typeCount = 4;
            initRules(4);
            // manually set some cool values
            rules = [[0.1, 0.2, -0.3, 0.5],[-0.1, 0.5, -0.2, 0.1],[0.5, -0.5, 0.3, 0.2],[-0.2, 0.3, 0.3, 0.2]]; 
            updateMatrixUI();
        } else if (pName === 'snake') {
            typeCount = 3;
            initRules(3);
            const m = [[0, 0.6, -0.4], [-0.4, 0, 0.6], [0.6, -0.4, 0]];
             // Cyclic rock-paper-scissors relation
            for(let i=0; i<3; i++) for(let j=0; j<3; j++) rules[i][j] = m[i][j];
            updateMatrixUI();
        } else if (pName === 'cells') {
             typeCount = 6;
             initRules(6);
             // random usually finds 'cells' eventually
             initRules(); // Random re-roll
        } else {
             // Logic for Chaos
             initRules(); 
        }
        
        // Reset positions
        restartBtn.click();
    });
});

// Settings Toggle
const toggleBtn = document.getElementById('toggle-settings');
const controls = document.getElementById('controls');
toggleBtn.addEventListener('click', () => {
    if(controls.style.display === 'none') {
        controls.style.display = 'block';
    } else {
        controls.style.display = 'none';
    }
});


// Start
initParticles(1000);
initRules();
requestAnimationFrame(loop);
