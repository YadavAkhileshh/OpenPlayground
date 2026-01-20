const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

// Configuration
let width, height;
let environment = 'stable'; // stable, calm, wind, hail
let shapes = [];
let particles = [];
let frame = 0;

// --- CORE CLASSES ---

class Shape {
    constructor(type, x, y) {
        this.type = type; // 'circle', 'triangle', 'square'
        this.x = x;
        this.y = y;
        
        // Speed depends on shape
        let speedMult = 1;
        if(type === 'triangle') speedMult = 1.8; // Fast
        if(type === 'square') speedMult = 0.6;   // Slow
        
        this.vx = (Math.random() - 0.5) * 4 * speedMult;
        this.vy = (Math.random() - 0.5) * 4 * speedMult;
        
        this.size = 15;
        this.color = this.getColor();
        this.health = 100;
        this.dead = false;
    }

    getColor() {
        if(this.type === 'circle') return '#4CAF50';
        if(this.type === 'triangle') return '#FFC107';
        if(this.type === 'square') return '#2196F3';
        return '#fff';
    }

    update() {
        // Movement
        this.x += this.vx;
        this.y += this.vy;

        // Bounce
        if(this.x < this.size || this.x > width - this.size) this.vx *= -1;
        if(this.y < this.size || this.y > height - this.size) this.vy *= -1;

        // --- SURVIVAL LOGIC ---
        let damage = 0;

        if (environment === 'wind') {
            // Wind kills non-triangles
            if (this.type !== 'triangle') damage = 5;
            this.x += 1; // Physical push
        } 
        else if (environment === 'hail') {
            // Hail kills non-squares
            if (this.type !== 'square') damage = 5;
        }
        else if (environment === 'calm') {
            // Calm energy overloads non-circles
            if (this.type !== 'circle') damage = 5;
        }

        // Apply Damage
        if (damage > 0) {
            this.health -= damage;
            // Shake effect
            this.x += (Math.random()-0.5)*4;
            this.y += (Math.random()-0.5)*4;
        } else {
            this.health = Math.min(100, this.health + 2);
        }

        // Check Death
        if (this.health <= 0) {
            this.dead = true;
            createExplosion(this.x, this.y, this.color);
        }
    }

    draw() {
        ctx.fillStyle = this.color;
        ctx.globalAlpha = this.health / 100;
        
        ctx.beginPath();
        if (this.type === 'circle') {
            ctx.arc(this.x, this.y, this.size, 0, Math.PI*2);
        } 
        else if (this.type === 'square') {
            ctx.rect(this.x - this.size, this.y - this.size, this.size*2, this.size*2);
        } 
        else if (this.type === 'triangle') {
            ctx.moveTo(this.x, this.y - this.size);
            ctx.lineTo(this.x + this.size, this.y + this.size);
            ctx.lineTo(this.x - this.size, this.y + this.size);
        }
        ctx.fill();
        
        ctx.lineWidth = 2;
        ctx.strokeStyle = 'rgba(255,255,255,0.5)';
        ctx.stroke();
        
        ctx.globalAlpha = 1.0;
    }
}

class Particle {
    constructor(x, y, color, type) {
        this.x = x;
        this.y = y;
        this.type = type;
        this.life = 1.0;
        
        if (type === 'explosion') {
            this.vx = (Math.random() - 0.5) * 10;
            this.vy = (Math.random() - 0.5) * 10;
            this.color = color;
            this.size = Math.random() * 4 + 2;
        } 
        else if (type === 'wind') {
            // High visibility settings
            this.vx = 20 + Math.random() * 10;
            this.vy = (Math.random()-0.5) * 2;
            this.color = 'rgba(220, 240, 255, 0.4)'; // Brighter
            this.size = 2; // Thicker
            this.length = 60 + Math.random() * 40; // Longer lines
        }
        else if (type === 'hail') {
            // High visibility settings
            this.vx = (Math.random() - 0.5) * 3;
            this.vy = 15 + Math.random() * 10; // Faster fall
            this.color = 'rgba(255, 255, 255, 0.9)'; // Almost solid white
            this.size = 4; // Bigger hail
        }
        else if (type === 'calm') {
            this.vx = 0;
            this.vy = -0.5;
            this.color = 'rgba(76, 175, 80, 0.15)';
            this.size = Math.random() * 50;
        }
    }

    update() {
        this.x += this.vx;
        this.y += this.vy;
        this.life -= 0.02;

        if (this.type === 'explosion') this.life -= 0.03;
        if (this.type === 'calm') this.life -= 0.005;
    }

    draw() {
        ctx.globalAlpha = Math.max(0, this.life);
        ctx.fillStyle = this.color;

        if (this.type === 'explosion') {
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.size, 0, Math.PI*2);
            ctx.fill();
        } 
        else if (this.type === 'wind') {
            // Draw long streak
            ctx.fillRect(this.x, this.y, this.length, this.size);
        }
        else if (this.type === 'hail') {
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.size, 0, Math.PI*2);
            ctx.fill();
        }
        else if (this.type === 'calm') {
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.size, 0, Math.PI*2);
            ctx.fill();
        }
        
        ctx.globalAlpha = 1.0;
    }
}

// --- SYSTEM FUNCTIONS ---

function init() {
    window.addEventListener('resize', resizeCanvas);
    resizeCanvas();
    loop();
}

function resizeCanvas() {
    const container = document.getElementById('sim-container');
    canvas.width = width = container.clientWidth;
    canvas.height = height = container.clientHeight;
}

function createExplosion(x, y, color) {
    for(let i=0; i<15; i++) {
        particles.push(new Particle(x, y, color, 'explosion'));
    }
}

// Global functions for HTML
window.spawnShape = function(type) {
    const x = width/2 + (Math.random()-0.5)*200;
    const y = height/2 + (Math.random()-0.5)*200;
    shapes.push(new Shape(type, x, y));
}

window.setEnv = function(newEnv) {
    environment = newEnv;
    
    // UI Button Updates
    document.querySelectorAll('.env-btn').forEach(btn => btn.classList.remove('active'));
    document.getElementById(`btn-${newEnv}`).classList.add('active');

    // Overlay Text Updates
    const title = document.getElementById('status-title');
    const desc = document.getElementById('status-desc');
    const box = document.getElementById('status-overlay');

    if (newEnv === 'stable') {
        title.innerText = "Stable Mode";
        title.style.color = "#fff";
        desc.innerText = "All shapes survive. No environmental hazards.";
        box.style.borderColor = "#444";
    }
    else if (newEnv === 'calm') {
        title.innerText = "Calm Zone Active";
        title.style.color = "var(--accent-green)";
        desc.innerText = "Only CIRCLES survive. Others lose energy.";
        box.style.borderColor = "var(--accent-green)";
    }
    else if (newEnv === 'wind') {
        title.innerText = "Fast Wind Active";
        title.style.color = "var(--accent-yellow)";
        desc.innerText = "Only TRIANGLES survive. Others break apart.";
        box.style.borderColor = "var(--accent-yellow)";
    }
    else if (newEnv === 'hail') {
        title.innerText = "Hailstorm Active";
        title.style.color = "var(--accent-blue)";
        desc.innerText = "Only SQUARES survive. Others get crushed.";
        box.style.borderColor = "var(--accent-blue)";
    }
}

window.resetSim = function() {
    shapes = [];
    particles = [];
    window.setEnv('stable');
}

function spawnEnvironmentParticles() {
    if (environment === 'wind') {
        // Spawn more particles more frequently
        if (frame % 2 === 0) {
            particles.push(new Particle(-100, Math.random()*height, null, 'wind'));
            particles.push(new Particle(-100, Math.random()*height, null, 'wind')); // Double spawn
        }
    } 
    else if (environment === 'hail') {
        // Spawn frequently
        particles.push(new Particle(Math.random()*width, -20, null, 'hail'));
        if (frame % 2 === 0) {
            particles.push(new Particle(Math.random()*width, -20, null, 'hail'));
        }
    }
    else if (environment === 'calm') {
        if (frame % 10 === 0) {
            particles.push(new Particle(Math.random()*width, height+20, null, 'calm'));
        }
    }
}

function drawBackground() {
    ctx.clearRect(0, 0, width, height);

    let grad = ctx.createLinearGradient(0, 0, 0, height);
    
    if (environment === 'stable') {
        grad.addColorStop(0, '#111');
        grad.addColorStop(1, '#111');
    } else if (environment === 'calm') {
        grad.addColorStop(0, '#0a1a0a');
        grad.addColorStop(1, '#000');
    } else if (environment === 'wind') {
        grad.addColorStop(0, '#1a1a0a');
        grad.addColorStop(1, '#000');
    } else if (environment === 'hail') {
        grad.addColorStop(0, '#0a0a1a');
        grad.addColorStop(1, '#000');
    }
    
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, width, height);
}

function loop() {
    frame++;

    drawBackground();
    spawnEnvironmentParticles();

    // Manage Particles
    for (let i = particles.length - 1; i >= 0; i--) {
        let p = particles[i];
        p.update();
        p.draw();
        if (p.life <= 0 || p.x > width + 150 || p.y > height + 50) {
            particles.splice(i, 1);
        }
    }

    // Manage Shapes
    for (let i = shapes.length - 1; i >= 0; i--) {
        let s = shapes[i];
        s.update();
        s.draw();
        if (s.dead) {
            shapes.splice(i, 1);
        }
    }

    requestAnimationFrame(loop);
}

// Start
init();