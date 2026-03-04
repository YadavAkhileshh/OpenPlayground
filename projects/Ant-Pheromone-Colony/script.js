/**
 * Swarm Intelligence Engine
 * Uses an off-screen grid for pheromone decay and agent-based steering.
 */

const canvas = document.getElementById('sim-canvas');
const ctx = canvas.getContext('2d');

// --- Config & Engine Constants ---
const NUM_ANTS = 500;
const SENSOR_ANGLE = Math.PI / 4; // 45 degrees
const SENSOR_DIST = 15;
const ANT_SPEED = 2.0;
const TURN_SPEED = 0.2;
const WANDER_STRENGTH = 0.2;
const EVAPORATION_RATE = 0.99; // Grid decay per frame
const CELL_SIZE = 4; // Physics grid resolution

// --- State ---
let width, height;
let cols, rows;
let ants = [];
let homePheromones = []; // Grid
let foodPheromones = []; // Grid
let obstacles = [];      // Grid
let foodSources = [];    // Grid
let nest = { x: 0, y: 0, radius: 20 };

let currentTool = 'food'; // 'food', 'wall', 'erase'
let isDrawing = false;
let mouse = { x: 0, y: 0 };
let score = 0;

// --- Entity Classes ---

class Ant {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.angle = Math.random() * Math.PI * 2;
        this.hasFood = false;
    }

    update() {
        // 1. Sense environment
        // 
        let targetPheromone = this.hasFood ? homePheromones : foodPheromones;
        let avoidPheromone = this.hasFood ? foodPheromones : homePheromones;

        let leftSensor = this.sense(this.angle - SENSOR_ANGLE, targetPheromone);
        let centerSensor = this.sense(this.angle, targetPheromone);
        let rightSensor = this.sense(this.angle + SENSOR_ANGLE, targetPheromone);

        // 2. Steer
        if (centerSensor > leftSensor && centerSensor > rightSensor) {
            // Keep going straight
            this.angle += (Math.random() - 0.5) * WANDER_STRENGTH;
        } else if (leftSensor > rightSensor) {
            this.angle -= TURN_SPEED;
        } else if (rightSensor > leftSensor) {
            this.angle += TURN_SPEED;
        } else {
            // Wander
            this.angle += (Math.random() - 0.5) * WANDER_STRENGTH * 2;
        }

        // 3. Move
        let nextX = this.x + Math.cos(this.angle) * ANT_SPEED;
        let nextY = this.y + Math.sin(this.angle) * ANT_SPEED;

        // Collision & Bounds
        if (this.checkCollision(nextX, nextY)) {
            this.angle += Math.PI + (Math.random()-0.5); // Bounce back
        } else {
            this.x = nextX;
            this.y = nextY;
        }
        
        // Wrap edges (Toroidal space) or Bounce
        if (this.x < 0) { this.x = 0; this.angle += Math.PI; }
        if (this.x > width) { this.x = width; this.angle += Math.PI; }
        if (this.y < 0) { this.y = 0; this.angle += Math.PI; }
        if (this.y > height) { this.y = height; this.angle += Math.PI; }

        // 4. Drop Pheromones
        let col = Math.floor(this.x / CELL_SIZE);
        let row = Math.floor(this.y / CELL_SIZE);
        
        if (col >= 0 && col < cols && row >= 0 && row < rows) {
            const idx = col + row * cols;
            if (this.hasFood) {
                foodPheromones[idx] = Math.min(foodPheromones[idx] + 100, 255);
            } else {
                homePheromones[idx] = Math.min(homePheromones[idx] + 100, 255);
            }
        }

        // 5. Interact with Nest/Food
        let dNest = Math.hypot(this.x - nest.x, this.y - nest.y);
        
        if (this.hasFood && dNest < nest.radius) {
            this.hasFood = false;
            this.angle += Math.PI; // Turn around
            score++;
            document.getElementById('food-val').innerText = score;
        } 
        else if (!this.hasFood) {
            // Check food grid
            if (col >= 0 && col < cols && row >= 0 && row < rows) {
                if (foodSources[col + row * cols] > 0) {
                    this.hasFood = true;
                    this.angle += Math.PI;
                    // Consume a bit of food
                    foodSources[col + row * cols] -= 10;
                }
            }
        }
    }

    sense(angle, gridData) {
        let sx = this.x + Math.cos(angle) * SENSOR_DIST;
        let sy = this.y + Math.sin(angle) * SENSOR_DIST;
        let col = Math.floor(sx / CELL_SIZE);
        let row = Math.floor(sy / CELL_SIZE);
        
        if (col >= 0 && col < cols && row >= 0 && row < rows) {
            const idx = col + row * cols;
            // Obstacles repel heavily
            if (obstacles[idx] > 0) return -1000;
            // Food sources attract heavily if looking for food
            if (!this.hasFood && foodSources[idx] > 0) return 1000;
            return gridData[idx];
        }
        return -1; // Out of bounds
    }

    checkCollision(x, y) {
        let col = Math.floor(x / CELL_SIZE);
        let row = Math.floor(y / CELL_SIZE);
        if (col >= 0 && col < cols && row >= 0 && row < rows) {
            return obstacles[col + row * cols] > 0;
        }
        return true;
    }

    draw() {
        ctx.fillStyle = this.hasFood ? '#8bc34a' : '#fff';
        ctx.fillRect(this.x - 1, this.y - 1, 3, 3);
    }
}

// --- Init ---

function init() {
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
    setupInput();
    resetWorld();
    loop();
}

function resizeCanvas() {
    width = canvas.parentElement.clientWidth;
    height = canvas.parentElement.clientHeight;
    canvas.width = width;
    canvas.height = height;
    
    cols = Math.ceil(width / CELL_SIZE);
    rows = Math.ceil(height / CELL_SIZE);
    
    nest.x = width / 2;
    nest.y = height / 2;
    
    initGrids();
}

function initGrids() {
    const size = cols * rows;
    homePheromones = new Float32Array(size);
    foodPheromones = new Float32Array(size);
    obstacles = new Uint8Array(size);
    foodSources = new Int16Array(size);
}

function resetWorld() {
    initGrids();
    score = 0;
    document.getElementById('food-val').innerText = score;
    
    ants = [];
    for (let i = 0; i < NUM_ANTS; i++) {
        ants.push(new Ant(nest.x, nest.y));
    }
}

// Exposed to UI
window.setTool = function(tool) {
    currentTool = tool;
    document.querySelectorAll('.tool-btn').forEach(btn => btn.classList.remove('active'));
    document.querySelector(`[data-tool="${tool}"]`).classList.add('active');
};
window.clearEnvironment = resetWorld;

// --- Logic & Render ---

function updateGrids() {
    // Evaporate Pheromones
    for (let i = 0; i < homePheromones.length; i++) {
        homePheromones[i] *= EVAPORATION_RATE;
        foodPheromones[i] *= EVAPORATION_RATE;
        
        // Culling tiny values for performance
        if (homePheromones[i] < 1) homePheromones[i] = 0;
        if (foodPheromones[i] < 1) foodPheromones[i] = 0;
    }
}

function applyBrush() {
    if (!isDrawing) return;
    
    let centerCol = Math.floor(mouse.x / CELL_SIZE);
    let centerRow = Math.floor(mouse.y / CELL_SIZE);
    let brushRadius = currentTool === 'food' ? 3 : 5;
    
    for (let c = centerCol - brushRadius; c <= centerCol + brushRadius; c++) {
        for (let r = centerRow - brushRadius; r <= centerRow + brushRadius; r++) {
            if (c >= 0 && c < cols && r >= 0 && r < rows) {
                // Circle brush
                if (Math.hypot(c - centerCol, r - centerRow) <= brushRadius) {
                    const idx = c + r * cols;
                    if (currentTool === 'food') {
                        foodSources[idx] = 1000;
                        obstacles[idx] = 0;
                    } else if (currentTool === 'wall') {
                        obstacles[idx] = 1;
                        foodSources[idx] = 0;
                    } else if (currentTool === 'erase') {
                        obstacles[idx] = 0;
                        foodSources[idx] = 0;
                        homePheromones[idx] = 0;
                        foodPheromones[idx] = 0;
                    }
                }
            }
        }
    }
}

function drawGrids() {
    // Using simple fillRects for prototyping. 
    // In a heavy production version, manipulate an ImageData Uint8ClampedArray directly.
    for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
            const idx = c + r * cols;
            const x = c * CELL_SIZE;
            const y = r * CELL_SIZE;

            if (obstacles[idx] > 0) {
                ctx.fillStyle = '#555';
                ctx.fillRect(x, y, CELL_SIZE, CELL_SIZE);
            } else if (foodSources[idx] > 0) {
                ctx.fillStyle = `rgba(139, 195, 74, ${foodSources[idx]/1000})`; // #8bc34a
                ctx.fillRect(x, y, CELL_SIZE, CELL_SIZE);
            } else {
                const homeIntensity = Math.min(homePheromones[idx] / 255, 1);
                const foodIntensity = Math.min(foodPheromones[idx] / 255, 1);
                
                if (homeIntensity > 0 || foodIntensity > 0) {
                    // Blend colors: Home = Blue, Food = Green
                    // Simple additive blend
                    const rCol = 0;
                    const gCol = Math.floor(foodIntensity * 255);
                    const bCol = Math.floor(homeIntensity * 255);
                    
                    if (gCol > 10 || bCol > 10) {
                        ctx.fillStyle = `rgb(${rCol}, ${gCol}, ${bCol})`;
                        ctx.fillRect(x, y, CELL_SIZE, CELL_SIZE);
                    }
                }
            }
        }
    }
}

// --- Input ---

function setupInput() {
    const updateMouse = (e) => {
        const rect = canvas.getBoundingClientRect();
        mouse.x = e.clientX ? e.clientX - rect.left : e.touches[0].clientX - rect.left;
        mouse.y = e.clientY ? e.clientY - rect.top : e.touches[0].clientY - rect.top;
    };

    canvas.addEventListener('mousedown', e => { isDrawing = true; updateMouse(e); });
    window.addEventListener('mousemove', e => { if (isDrawing) updateMouse(e); });
    window.addEventListener('mouseup', () => isDrawing = false);

    canvas.addEventListener('touchstart', e => { e.preventDefault(); isDrawing = true; updateMouse(e); });
    window.addEventListener('touchmove', e => { e.preventDefault(); if (isDrawing) updateMouse(e); });
    window.addEventListener('touchend', () => isDrawing = false);
}

// --- Main Loop ---

function loop() {
    ctx.clearRect(0, 0, width, height);
    
    applyBrush();
    updateGrids();
    drawGrids();

    // Draw Nest
    ctx.fillStyle = 'rgba(33, 150, 243, 0.5)';
    ctx.beginPath();
    ctx.arc(nest.x, nest.y, nest.radius, 0, Math.PI * 2);
    ctx.fill();

    // Update & Draw Ants
    ants.forEach(ant => {
        ant.update();
        ant.draw();
    });

    requestAnimationFrame(loop);
}

// Start
init();