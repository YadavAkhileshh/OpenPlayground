// ==========================================
// 1. ENGINE SETUP & STATE
// ==========================================
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Resize canvas to fill the window
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

const G = 0.5; // Gravitational Constant for our simulation
let gameState = 'AIMING'; // AIMING, FLIGHT, SANDBOX
let sandboxTool = 'PLANET'; // PLANET, BLACKHOLE, GOAL

// Inputs
let mouse = { x: 0, y: 0, isDown: false, startX: 0, startY: 0 };

// UI Guide Toggle
function toggleGuide() {
    document.getElementById('guide-modal').classList.toggle('hidden');
}

// ==========================================
// 2. GAME ENTITIES (Classes)
// ==========================================
class CelestialBody {
    constructor(x, y, radius, mass, color, type) {
        this.x = x;
        this.y = y;
        this.radius = radius;
        this.mass = mass;
        this.color = color;
        this.type = type; // 'PLANET' or 'BLACKHOLE'
    }

    draw() {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        
        if (this.type === 'BLACKHOLE') {
            ctx.fillStyle = '#000';
            ctx.shadowColor = '#a855f7';
            ctx.shadowBlur = 20;
            ctx.fill();
            ctx.strokeStyle = '#a855f7';
            ctx.lineWidth = 2;
            ctx.stroke();
            ctx.shadowBlur = 0; // reset
        } else {
            ctx.fillStyle = this.color;
            ctx.fill();
        }
    }
}

class Rocket {
    constructor(x, y) {
        this.startX = x;
        this.startY = y;
        this.x = x;
        this.y = y;
        this.vx = 0;
        this.vy = 0;
        this.radius = 6;
        this.trail = []; // Keep track of past positions for cool visual effect
    }

    reset() {
        this.x = this.startX;
        this.y = this.startY;
        this.vx = 0;
        this.vy = 0;
        this.trail = [];
        gameState = 'AIMING';
    }

    applyGravity(bodies) {
        bodies.forEach(body => {
            // Distance vector
            let dx = body.x - this.x;
            let dy = body.y - this.y;
            let distSq = (dx * dx) + (dy * dy);
            let dist = Math.sqrt(distSq);

            // Collision check
            if (dist < body.radius + this.radius) {
                gameState = 'CRASHED';
                return;
            }

            // Newton's Law of Gravitation (F = G * (m1*m2)/r^2)
            // Rocket mass is assumed to be 1 for simplicity of acceleration
            let force = (G * body.mass) / distSq;
            
            // Break force into x and y vectors
            let angle = Math.atan2(dy, dx);
            this.vx += Math.cos(angle) * force;
            this.vy += Math.sin(angle) * force;
        });
    }

    update() {
        if (gameState === 'FLIGHT') {
            this.trail.push({ x: this.x, y: this.y });
            if (this.trail.length > 50) this.trail.shift(); // Limit trail length

            this.x += this.vx;
            this.y += this.vy;

            // Screen bounds check (lost in space)
            if (this.x < 0 || this.x > canvas.width || this.y < 0 || this.y > canvas.height) {
                gameState = 'LOST';
            }
        }
    }

    draw() {
        // Draw Trail
        if (this.trail.length > 0) {
            ctx.beginPath();
            ctx.moveTo(this.trail[0].x, this.trail[0].y);
            for (let i = 1; i < this.trail.length; i++) {
                ctx.lineTo(this.trail[i].x, this.trail[i].y);
            }
            ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
            ctx.lineWidth = 2;
            ctx.stroke();
        }

        // Draw Rocket
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fillStyle = '#f8fafc';
        ctx.fill();
    }
}

class Goal {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.radius = 20;
    }

    draw() {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(16, 185, 129, 0.3)';
        ctx.fill();
        ctx.strokeStyle = '#10b981';
        ctx.lineWidth = 3;
        ctx.stroke();
    }

    checkWin(rocket) {
        let dx = this.x - rocket.x;
        let dy = this.y - rocket.y;
        if (Math.sqrt(dx*dx + dy*dy) < this.radius) {
            gameState = 'WON';
        }
    }
}

// ==========================================
// 3. WORLD INITIALIZATION
// ==========================================
let bodies = [];
let rocket;
let goal;

function initLevel() {
    bodies = [
        new CelestialBody(canvas.width / 2, canvas.height / 2, 40, 1500, '#3b82f6', 'PLANET'),
        new CelestialBody(canvas.width * 0.75, canvas.height * 0.3, 25, 800, '#f59e0b', 'PLANET')
    ];
    rocket = new Rocket(100, canvas.height - 100);
    goal = new Goal(canvas.width - 100, 100);
    gameState = 'AIMING';
}

function resetLevel() {
    rocket.reset();
}

// ==========================================
// 4. EVENT LISTENERS (Mouse & UI)
// ==========================================
window.addEventListener('resize', () => {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
});

canvas.addEventListener('mousedown', (e) => {
    if (gameState === 'SANDBOX') {
        if (sandboxTool === 'PLANET') {
            bodies.push(new CelestialBody(e.clientX, e.clientY, 30, 1000, '#10b981', 'PLANET'));
        } else if (sandboxTool === 'BLACKHOLE') {
            bodies.push(new CelestialBody(e.clientX, e.clientY, 15, 3000, '#000', 'BLACKHOLE'));
        } else if (sandboxTool === 'GOAL') {
            goal.x = e.clientX;
            goal.y = e.clientY;
        }
        return;
    }

    if (gameState === 'AIMING' || gameState === 'CRASHED' || gameState === 'LOST' || gameState === 'WON') {
        rocket.reset();
        mouse.isDown = true;
        mouse.startX = e.clientX;
        mouse.startY = e.clientY;
    }
});

canvas.addEventListener('mousemove', (e) => {
    mouse.x = e.clientX;
    mouse.y = e.clientY;
});

canvas.addEventListener('mouseup', (e) => {
    if (mouse.isDown && gameState === 'AIMING') {
        mouse.isDown = false;
        // Calculate slingshot launch velocity (inverted drag vector)
        let dx = mouse.startX - e.clientX;
        let dy = mouse.startY - e.clientY;
        
        // Power multiplier
        rocket.vx = dx * 0.05; 
        rocket.vy = dy * 0.05;
        gameState = 'FLIGHT';
    }
});

// UI Buttons
function setMode(mode) {
    gameState = mode === 'PLAY' ? 'AIMING' : 'SANDBOX';
    rocket.reset();
    
    document.getElementById('btn-play').classList.toggle('active', mode === 'PLAY');
    document.getElementById('btn-sandbox').classList.toggle('active', mode === 'SANDBOX');
    document.getElementById('sandbox-tools').style.display = mode === 'SANDBOX' ? 'flex' : 'none';
    document.getElementById('instructions').innerText = mode === 'PLAY' ? 
        "Drag anywhere to aim and set power. Release to launch!" : "Click to place bodies and build your own level.";
}

function setTool(tool) {
    sandboxTool = tool;
    document.querySelectorAll('.tool-btn').forEach(btn => btn.classList.remove('active'));
    document.getElementById(`tool-${tool.toLowerCase()}`).classList.add('active');
}

// ==========================================
// 5. MAIN RENDER & PHYSICS LOOP
// ==========================================
function gameLoop() {
    // 1. Clear Canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // 2. Physics Updates
    if (gameState === 'FLIGHT') {
        rocket.applyGravity(bodies);
        rocket.update();
        goal.checkWin(rocket);
    }

    // 3. Draw Elements
    goal.draw();
    bodies.forEach(body => body.draw());
    rocket.draw();

    // 4. Draw Slingshot Aim Line
    if (mouse.isDown && gameState === 'AIMING') {
        ctx.beginPath();
        ctx.moveTo(rocket.x, rocket.y);
        // Calculate the opposite direction of the drag to show launch trajectory
        let dx = mouse.startX - mouse.x;
        let dy = mouse.startY - mouse.y;
        ctx.lineTo(rocket.x + dx, rocket.y + dy);
        ctx.strokeStyle = '#ef4444';
        ctx.lineWidth = 3;
        ctx.setLineDash([5, 5]);
        ctx.stroke();
        ctx.setLineDash([]); // Reset
    }

    // 5. Draw Game Over States
    if (gameState === 'WON' || gameState === 'CRASHED' || gameState === 'LOST') {
        ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        ctx.fillStyle = '#fff';
        ctx.font = '40px Segoe UI';
        ctx.textAlign = 'center';
        
        let msg = gameState === 'WON' ? "🎯 Target Reached!" : 
                  gameState === 'CRASHED' ? "💥 Ship Destroyed!" : "🛰️ Lost in Deep Space...";
        
        ctx.fillText(msg, canvas.width / 2, canvas.height / 2);
        ctx.font = '20px Segoe UI';
        ctx.fillText("Click anywhere to reset", canvas.width / 2, canvas.height / 2 + 40);
    }

    requestAnimationFrame(gameLoop); // Loop recursively at 60FPS
}

// Start Game
initLevel();
gameLoop();