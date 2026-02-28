/**
 * Typing-Defense Engine
 * Handles Word Matching, Enemy Spawning, and Projectiles.
 */

const canvas = document.getElementById('game-canvas');
const ctx = canvas.getContext('2d');

// --- Word Dictionary ---
const WORDS = [
    "void", "null", "int", "char", "float", "double", "struct", "class", "public",
    "static", "const", "return", "switch", "while", "break", "pixel", "vector",
    "socket", "buffer", "stream", "thread", "kernel", "linux", "python", "script",
    "canvas", "binary", "hex", "octal", "syntax", "error", "debug", "compile",
    "runtime", "object", "array", "string", "method", "async", "await", "promise",
    "import", "export", "module", "react", "angular", "vue", "node", "deno",
    "function", "variable", "boolean", "integer", "pointer", "reference", "stack",
    "memory", "allocation", "garbage", "collection", "algorithm", "recursive",
    "iteration", "polymorphism", "inheritance", "encapsulation", "abstraction"
];

// --- Config ---
let width, height;
let enemies = [];
let projectiles = [];
let particles = [];
let score = 0;
let multiplier = 1;
let wave = 1;
let spawnRate = 2000; // ms
let lastSpawn = 0;
let isPlaying = false;
let activeTarget = null; // The enemy currently being typed

// --- Entities ---

class Player {
    constructor() {
        this.x = width / 2;
        this.y = height - 50;
    }

    draw() {
        ctx.fillStyle = '#0ff';
        // Simple Ship Shape
        ctx.beginPath();
        ctx.moveTo(this.x, this.y);
        ctx.lineTo(this.x - 20, this.y + 30);
        ctx.lineTo(this.x, this.y + 20); // Engine indent
        ctx.lineTo(this.x + 20, this.y + 30);
        ctx.closePath();
        ctx.fill();
        
        // Glow
        ctx.shadowBlur = 15;
        ctx.shadowColor = '#0ff';
        ctx.fill();
        ctx.shadowBlur = 0;
    }
}

class Enemy {
    constructor(word) {
        this.word = word;
        this.matchedIndex = 0; // How many chars typed
        this.x = Math.random() * (width - 100) + 50;
        this.y = -50;
        this.speed = 0.5 + (wave * 0.1);
        this.color = '#fff';
    }

    update() {
        this.y += this.speed;
    }

    draw() {
        ctx.font = '20px "Share Tech Mono"';
        const w = ctx.measureText(this.word).width;
        
        // Draw Enemy Ship Body (above text)
        ctx.fillStyle = this === activeTarget ? '#f00' : '#aaa';
        ctx.beginPath();
        ctx.moveTo(this.x, this.y - 10);
        ctx.lineTo(this.x - 10, this.y - 30);
        ctx.lineTo(this.x + 10, this.y - 30);
        ctx.fill();

        // Draw Text
        // 1. Matched part (Green)
        const matchedStr = this.word.substring(0, this.matchedIndex);
        const remainingStr = this.word.substring(this.matchedIndex);
        
        ctx.textAlign = 'center';
        
        // We need to draw centered, so calculate offsets
        const totalW = ctx.measureText(this.word).width;
        const startX = this.x - (totalW / 2);
        
        // Draw matched
        ctx.fillStyle = '#0f0';
        ctx.textAlign = 'left';
        ctx.fillText(matchedStr, startX, this.y);
        
        // Draw remaining
        ctx.fillStyle = this === activeTarget ? '#fff' : '#888';
        const matchedW = ctx.measureText(matchedStr).width;
        ctx.fillText(remainingStr, startX + matchedW, this.y);
        
        // Target indicator
        if (this === activeTarget) {
            ctx.strokeStyle = '#f00';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.arc(this.x, this.y - 20, 25, 0, Math.PI*2);
            ctx.stroke();
        }
    }
}

class Projectile {
    constructor(target) {
        this.x = width / 2;
        this.y = height - 50;
        this.target = target;
        this.speed = 15;
        this.active = true;
    }

    update() {
        if (!this.target) { this.active = false; return; }
        
        const dx = this.target.x - this.x;
        const dy = this.target.y - this.y;
        const dist = Math.sqrt(dx*dx + dy*dy);
        
        if (dist < this.speed) {
            this.x = this.target.x;
            this.y = this.target.y;
            this.active = false;
            createExplosion(this.x, this.y - 20);
        } else {
            this.x += (dx / dist) * this.speed;
            this.y += (dy / dist) * this.speed;
        }
    }

    draw() {
        ctx.beginPath();
        ctx.arc(this.x, this.y, 4, 0, Math.PI*2);
        ctx.fillStyle = '#0f0';
        ctx.fill();
    }
}

class Particle {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.vx = (Math.random() - 0.5) * 5;
        this.vy = (Math.random() - 0.5) * 5;
        this.life = 1.0;
        this.color = Math.random() < 0.5 ? '#f00' : '#ff0';
    }
    update() {
        this.x += this.vx;
        this.y += this.vy;
        this.life -= 0.05;
    }
    draw() {
        ctx.globalAlpha = this.life;
        ctx.fillStyle = this.color;
        ctx.fillRect(this.x, this.y, 3, 3);
        ctx.globalAlpha = 1.0;
    }
}

// --- Init & Controls ---

const player = new Player();

function init() {
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
    
    window.addEventListener('keydown', handleInput);
    
    document.getElementById('btn-start').addEventListener('click', startGame);
    document.getElementById('btn-restart').addEventListener('click', startGame);
    
    requestAnimationFrame(loop);
}

function resizeCanvas() {
    width = canvas.parentElement.clientWidth;
    height = canvas.parentElement.clientHeight;
    canvas.width = width;
    canvas.height = height;
    player.x = width / 2;
    player.y = height - 50;
}

function startGame() {
    document.getElementById('start-screen').classList.add('hidden');
    document.getElementById('game-over-screen').classList.add('hidden');
    
    enemies = [];
    projectiles = [];
    particles = [];
    score = 0;
    wave = 1;
    multiplier = 1;
    activeTarget = null;
    isPlaying = true;
    spawnRate = 2000;
    
    updateHUD();
}

function handleInput(e) {
    if (!isPlaying) return;
    
    const key = e.key.toLowerCase();
    
    // Ignore non-letters
    if (key.length !== 1 || !/[a-z]/.test(key)) return;

    if (!activeTarget) {
        // Find closest enemy starting with key
        // Filter candidates
        const candidates = enemies.filter(e => e.word.startsWith(key));
        
        if (candidates.length > 0) {
            // Pick closest (highest Y)
            candidates.sort((a, b) => b.y - a.y);
            activeTarget = candidates[0];
            processHit(activeTarget);
        } else {
            // Miss
            multiplier = 1;
            updateHUD();
        }
    } else {
        // We have a locked target
        const neededChar = activeTarget.word[activeTarget.matchedIndex];
        
        if (key === neededChar) {
            processHit(activeTarget);
        } else {
            // Miss on active target
            multiplier = 1;
            updateHUD();
        }
    }
}

function processHit(enemy) {
    enemy.matchedIndex++;
    
    // Spawn Projectile
    projectiles.push(new Projectile(enemy));
    
    // Check death
    if (enemy.matchedIndex >= enemy.word.length) {
        score += 10 * multiplier * wave;
        multiplier = Math.min(multiplier + 1, 10);
        
        // Remove later in update loop to allow projectile to hit visually
        enemy.dead = true;
        activeTarget = null;
        
        // Wave logic
        if (score > wave * 500) {
            wave++;
            spawnRate = Math.max(500, spawnRate - 100);
        }
    }
    updateHUD();
}

function createExplosion(x, y) {
    for(let i=0; i<10; i++) particles.push(new Particle(x, y));
}

function spawnEnemy() {
    const word = WORDS[Math.floor(Math.random() * WORDS.length)];
    // Filter duplicates on screen if possible
    enemies.push(new Enemy(word));
}

function updateHUD() {
    document.getElementById('score-val').innerText = score;
    document.getElementById('mult-val').innerText = 'x' + multiplier;
    document.getElementById('mult-fill').style.width = (multiplier * 10) + '%';
    document.getElementById('wave-val').innerText = wave;
}

function gameOver() {
    isPlaying = false;
    document.getElementById('game-over-screen').classList.remove('hidden');
    document.getElementById('final-score').innerText = score;
}

// --- Main Loop ---

function loop(timestamp) {
    ctx.clearRect(0, 0, width, height);
    
    // Background Starfield (CSS handles static, maybe add movement here later)
    
    if (isPlaying) {
        // Spawning
        if (timestamp - lastSpawn > spawnRate) {
            spawnEnemy();
            lastSpawn = timestamp;
        }

        player.draw();

        // Update Projectiles
        for (let i = projectiles.length - 1; i >= 0; i--) {
            const p = projectiles[i];
            p.update();
            p.draw();
            if (!p.active) projectiles.splice(i, 1);
        }

        // Update Enemies
        for (let i = enemies.length - 1; i >= 0; i--) {
            const e = enemies[i];
            e.update();
            e.draw();
            
            // Check Death (delayed removal for visual hit)
            if (e.dead && projectiles.filter(p => p.target === e).length === 0) {
                 enemies.splice(i, 1);
                 createExplosion(e.x, e.y);
                 continue;
            }

            // Check Game Over
            if (e.y > height - 50) {
                gameOver();
            }
        }
        
        // Update Particles
        for (let i = particles.length - 1; i >= 0; i--) {
            particles[i].update();
            particles[i].draw();
            if (particles[i].life <= 0) particles.splice(i, 1);
        }
    }

    requestAnimationFrame(loop);
}

// Start
init();