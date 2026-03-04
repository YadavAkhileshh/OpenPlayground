/**
 * Gridlock Controller Engine
 * Implements Agent-based Traffic Simulation with Queue Theory metrics.
 */

const canvas = document.getElementById('sim-canvas');
const ctx = canvas.getContext('2d');

// --- Config ---
const LANE_WIDTH = 40;
const CAR_LENGTH = 30;
const CAR_WIDTH = 18;
const MAX_SPEED = 4;
const ACCEL = 0.1;
const BRAKE_DIST = 80;
const SPAWN_RATE = 100; // Frames

// --- State ---
let width, height;
let cars = [];
let lanes = []; // { start: Vec2, end: Vec2, dir: Vec2, lightId: int }
let lights = []; // { id: int, state: 'red'|'green'|'yellow', timer: 0 }
let frameCount = 0;
let score = 0;
let carsPassed = 0;
let startTime = Date.now();
let isGameOver = false;

// --- Classes ---

class TrafficLight {
    constructor(id, x, y, laneDir) {
        this.id = id;
        this.x = x;
        this.y = y;
        this.state = 'red'; // red, yellow, green
        this.timer = 0;
        
        // Determine stop line position
        this.stopLine = {
            x: x + (laneDir.x * -10),
            y: y + (laneDir.y * -10)
        };
    }

    toggle() {
        if (this.state === 'red') {
            this.state = 'green';
        } else if (this.state === 'green') {
            this.state = 'yellow';
            this.timer = 120; // 2 seconds yellow
        }
    }

    update() {
        if (this.state === 'yellow') {
            this.timer--;
            if (this.timer <= 0) this.state = 'red';
        }
    }

    draw() {
        // Box
        ctx.fillStyle = '#333';
        ctx.fillRect(this.x - 10, this.y - 10, 20, 20);
        
        // Light
        let color = '#555';
        if (this.state === 'green') color = '#2ecc71';
        if (this.state === 'yellow') color = '#f1c40f';
        if (this.state === 'red') color = '#e74c3c';
        
        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.arc(this.x, this.y, 6, 0, Math.PI*2);
        ctx.fill();
        
        // Glow
        if (this.state !== 'red') {
            ctx.shadowColor = color;
            ctx.shadowBlur = 10;
            ctx.stroke();
            ctx.shadowBlur = 0;
        }
        
        // Label
        ctx.fillStyle = '#fff';
        ctx.font = '10px monospace';
        ctx.fillText(this.id, this.x - 3, this.y - 15);
    }
}

class Car {
    constructor(lane) {
        this.lane = lane;
        this.x = lane.start.x;
        this.y = lane.start.y;
        this.speed = Math.random() * 2 + 2; // Variance
        this.maxSpeed = this.speed;
        this.dir = lane.dir;
        
        this.frustration = 0; // 0 to 100
        this.waiting = false;
        this.removed = false;
        
        // Random Color
        const colors = ['#3498db', '#e67e22', '#9b59b6', '#ecf0f1', '#1abc9c'];
        this.color = colors[Math.floor(Math.random() * colors.length)];
    }

    update() {
        if (isGameOver) return;

        // 1. Look Ahead (Sensor)
        let targetSpeed = this.maxSpeed;
        
        // Check Traffic Light
        const light = lights[this.lane.lightId];
        if (light) {
            const distToStop = this.getDist(light.stopLine);
            // If facing stop line and light is red/yellow
            if (distToStop > 0 && distToStop < BRAKE_DIST && light.state !== 'green') {
                // Should stop?
                if (distToStop < 10) targetSpeed = 0; // At line
                else targetSpeed = Math.min(targetSpeed, distToStop * 0.1); // Slow down
            }
        }

        // Check Car Ahead
        let closestDist = Infinity;
        for (let other of cars) {
            if (other === this || other.lane !== this.lane) continue;
            
            // Is other car ahead?
            const d = this.getDist(other);
            if (d > 0 && d < BRAKE_DIST && d < closestDist) {
                closestDist = d;
            }
        }

        if (closestDist < BRAKE_DIST) {
            targetSpeed = Math.min(targetSpeed, (closestDist - CAR_LENGTH - 10) * 0.1);
            if (targetSpeed < 0) targetSpeed = 0;
        }

        // 2. Move
        if (this.speed < targetSpeed) this.speed += ACCEL;
        else if (this.speed > targetSpeed) this.speed -= ACCEL;
        
        this.x += this.dir.x * this.speed;
        this.y += this.dir.y * this.speed;

        // 3. Frustration Logic
        if (this.speed < 0.5) {
            this.frustration += 0.2; // Rising anger
            this.waiting = true;
        } else {
            this.frustration = Math.max(0, this.frustration - 0.1);
            this.waiting = false;
        }

        if (this.frustration >= 100) {
            triggerGameOver();
        }

        // 4. Bounds Check (Exit)
        if (this.x < -50 || this.x > width + 50 || this.y < -50 || this.y > height + 50) {
            this.removed = true;
            score += 10;
            carsPassed++;
        }
    }

    getDist(target) {
        // Project vector onto direction
        const dx = target.x - this.x;
        const dy = target.y - this.y;
        // Dot product to find distance along path
        return dx * this.dir.x + dy * this.dir.y;
    }

    draw() {
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(Math.atan2(this.dir.y, this.dir.x));
        
        // Body
        ctx.fillStyle = this.color;
        ctx.fillRect(-CAR_LENGTH/2, -CAR_WIDTH/2, CAR_LENGTH, CAR_WIDTH);
        
        // Headlights
        ctx.fillStyle = '#ffeaa7';
        ctx.fillRect(CAR_LENGTH/2 - 2, -CAR_WIDTH/2 + 2, 2, 4);
        ctx.fillRect(CAR_LENGTH/2 - 2, CAR_WIDTH/2 - 6, 2, 4);
        
        // Brake Lights
        if (this.speed < 1) {
            ctx.fillStyle = '#ff0000';
            ctx.shadowBlur = 5;
            ctx.shadowColor = 'red';
            ctx.fillRect(-CAR_LENGTH/2, -CAR_WIDTH/2 + 2, 2, 4);
            ctx.fillRect(-CAR_LENGTH/2, CAR_WIDTH/2 - 6, 2, 4);
            ctx.shadowBlur = 0;
        }

        ctx.restore();

        // Frustration Bar
        if (this.frustration > 20) {
            ctx.fillStyle = '#333';
            ctx.fillRect(this.x - 10, this.y - 15, 20, 4);
            
            let fColor = '#f1c40f';
            if (this.frustration > 50) fColor = '#e67e22';
            if (this.frustration > 80) fColor = '#e74c3c';
            
            ctx.fillStyle = fColor;
            ctx.fillRect(this.x - 10, this.y - 15, 20 * (this.frustration/100), 4);
            
            if (this.frustration > 80 && frameCount % 20 < 10) {
                // Honk visual
                ctx.fillStyle = '#fff';
                ctx.fillText("HONK!", this.x, this.y - 20);
            }
        }
    }
}

// --- Setup ---

function init() {
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
    setupInput();
    
    document.getElementById('btn-retry').onclick = resetGame;
    
    resetGame();
    loop();
}

function resizeCanvas() {
    width = canvas.parentElement.clientWidth;
    height = canvas.parentElement.clientHeight;
    canvas.width = width;
    canvas.height = height;
}

function resetGame() {
    isGameOver = false;
    document.getElementById('game-over').classList.add('hidden');
    cars = [];
    lights = [];
    score = 0;
    carsPassed = 0;
    
    // Define Intersection (Center)
    const cx = width / 2;
    const cy = height / 2;
    const offset = 60; // Road spacing

    // Create 4 Lights 


    // 1: Top (Southbound)
    lights.push(new TrafficLight(1, cx - offset - 20, cy - offset, {x:0, y:1}));
    // 2: Right (Westbound)
    lights.push(new TrafficLight(2, cx + offset, cy - offset - 20, {x:-1, y:0}));
    // 3: Bottom (Northbound)
    lights.push(new TrafficLight(3, cx + offset + 20, cy + offset, {x:0, y:-1}));
    // 4: Left (Eastbound)
    lights.push(new TrafficLight(4, cx - offset, cy + offset + 20, {x:1, y:0}));

    // Create Lanes associated with lights
    lanes = [
        // Top -> Down
        { start: {x: cx - 20, y: -50}, dir: {x: 0, y: 1}, lightId: 0 },
        // Right -> Left
        { start: {x: width + 50, y: cy - 20}, dir: {x: -1, y: 0}, lightId: 1 },
        // Bottom -> Up
        { start: {x: cx + 20, y: height + 50}, dir: {x: 0, y: -1}, lightId: 2 },
        // Left -> Right
        { start: {x: -50, y: cy + 20}, dir: {x: 1, y: 0}, lightId: 3 }
    ];
}

function setupInput() {
    window.addEventListener('keydown', e => {
        if (isGameOver) return;
        if (e.key >= '1' && e.key <= '4') {
            const idx = parseInt(e.key) - 1;
            if (lights[idx]) lights[idx].toggle();
        }
    });

    canvas.addEventListener('mousedown', e => {
        const rect = canvas.getBoundingClientRect();
        const mx = e.clientX - rect.left;
        const my = e.clientY - rect.top;
        
        for (let l of lights) {
            const dist = Math.sqrt((mx - l.x)**2 + (my - l.y)**2);
            if (dist < 20) l.toggle();
        }
    });
}

function triggerGameOver() {
    isGameOver = true;
    document.getElementById('final-score').innerText = score;
    document.getElementById('game-over').classList.remove('hidden');
    document.getElementById('game-status').innerText = "GRIDLOCK";
    document.getElementById('game-status').className = "bad";
}

// --- Loop ---

function loop() {
    ctx.clearRect(0, 0, width, height);

    // 1. Draw Roads
    ctx.fillStyle = '#333';
    const roadW = 120;
    // Vert
    ctx.fillRect(width/2 - roadW/2, 0, roadW, height);
    // Horiz
    ctx.fillRect(0, height/2 - roadW/2, width, roadW);
    
    // Dashed lines
    ctx.strokeStyle = '#fff';
    ctx.setLineDash([20, 20]);
    ctx.lineWidth = 2;
    
    ctx.beginPath();
    ctx.moveTo(width/2, 0); ctx.lineTo(width/2, height); // V Center
    ctx.moveTo(0, height/2); ctx.lineTo(width, height/2); // H Center
    ctx.stroke();
    ctx.setLineDash([]);

    // 2. Update logic
    if (!isGameOver) {
        frameCount++;
        
        // Spawn Cars
        if (frameCount % SPAWN_RATE === 0) {
            // Pick random lane
            const lane = lanes[Math.floor(Math.random() * lanes.length)];
            
            // Don't spawn if spawn point blocked
            let blocked = false;
            for(let c of cars) {
                const d = Math.sqrt((c.x - lane.start.x)**2 + (c.y - lane.start.y)**2);
                if (d < 60) blocked = true;
            }
            
            if (!blocked) cars.push(new Car(lane));
        }

        // Update Lights
        lights.forEach(l => l.update());

        // Update Cars
        cars.forEach(c => c.update());
        cars = cars.filter(c => !c.removed);
    }

    // 3. Draw Entities
    lights.forEach(l => l.draw());
    cars.forEach(c => c.draw());

    // 4. Update UI
    if (frameCount % 30 === 0) {
        document.getElementById('score-val').innerText = score;
        
        // Calc Avg Stress
        let totalStress = 0;
        cars.forEach(c => totalStress += c.frustration);
        const avg = cars.length ? Math.floor(totalStress / cars.length) : 0;
        document.getElementById('stress-val').innerText = avg + '%';
        
        // Flow
        const minutes = (Date.now() - startTime) / 60000;
        const rate = minutes > 0 ? Math.floor(carsPassed / minutes) : 0;
        document.getElementById('flow-val').innerText = rate;
    }

    requestAnimationFrame(loop);
}

// Start
init();