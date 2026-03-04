/**
 * Zombie Type Shooter
 * A typing defense game logic engine.
 */

const canvas = document.getElementById('game-canvas');
const ctx = canvas.getContext('2d');

// --- Config ---
const WORD_LIST = [
    "run", "hide", "shot", "gun", "dead", "blood", "bite", "fear", "dark", "doom",
    "escape", "zombie", "horror", "scream", "panic", "virus", "skull", "ghost",
    "shadow", "terror", "weapon", "survival", "apocalypse", "nightmare",
    "infection", "quarantine", "headshot", "graveyard", "monster", "undead",
    "javascript", "function", "variable", "syntax", "compile", "execute"
];

// --- State ---
let width, height;
let player = { x: 50, y: 0 };
let zombies = [];
let bullets = [];
let particles = [];
let score = 0;
let streak = 0;
let startTime = 0;
let keysTyped = 0;
let spawnRate = 2000;
let lastSpawn = 0;
let activeTarget = null; // The zombie currently being typed
let isPlaying = false;

// --- Classes ---

class Zombie {
    constructor(y, speed) {
        this.x = width + 50;
        this.y = y;
        this.speed = speed;
        this.word = WORD_LIST[Math.floor(Math.random() * WORD_LIST.length)];
        this.typedIndex = 0; // How many chars typed
        this.dead = false;
        
        // Visual
        this.color = '#556b2f'; // Olive green
        this.scale = 1;
    }

    update() {
        this.x -= this.speed;
        
        // Game Over check
        if (this.x < 100) {
            gameOver();
        }
    }

    draw() {
        // Draw Zombie Body
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(this.x, this.y, 20, 0, Math.PI * 2);
        ctx.fill();
        
        // Eyes
        ctx.fillStyle = '#ff0000';
        ctx.beginPath();
        ctx.arc(this.x - 8, this.y - 5, 3, 0, Math.PI*2);
        ctx.arc(this.x + 2, this.y - 5, 3, 0, Math.PI*2);
        ctx.fill();

        // Draw Word
        ctx.font = 'bold 20px Roboto Mono';
        const txt = this.word;
        const typed = txt.substring(0, this.typedIndex);
        const remain = txt.substring(this.typedIndex);
        
        // Text Position above head
        const tx = this.x - (ctx.measureText(txt).width / 2);
        const ty = this.y - 35;
        
        // Background for text
        ctx.fillStyle = 'rgba(0,0,0,0.6)';
        ctx.fillRect(tx - 5, ty - 20, ctx.measureText(txt).width + 10, 24);

        // Typed part (Green or Yellow)
        ctx.fillStyle = (this === activeTarget) ? '#ffd700' : '#888'; 
        ctx.fillText(typed, tx, ty);
        
        // Remaining part (White)
        ctx.fillStyle = '#fff';
        ctx.fillText(remain, tx + ctx.measureText(typed).width, ty);
        
        // Target Indicator
        if (this === activeTarget) {
            ctx.strokeStyle = '#ffd700';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.arc(this.x, this.y, 25, 0, Math.PI*2);
            ctx.stroke();
        }
    }
}

class Bullet {
    constructor(tx, ty) {
        this.x = player.x;
        this.y = player.y;
        this.tx = tx;
        this.ty = ty;
        this.speed = 20;
        this.active = true;
        
        const angle = Math.atan2(ty - this.y, tx - this.x);
        this.vx = Math.cos(angle) * this.speed;
        this.vy = Math.sin(angle) * this.speed;
    }
    
    update() {
        this.x += this.vx;
        this.y += this.vy;
        
        // Hit logic (approx)
        if (Math.abs(this.x - this.tx) < 20 && Math.abs(this.y - this.ty) < 20) {
            this.active = false;
        }
    }
    
    draw() {
        ctx.fillStyle = '#ffd700';
        ctx.beginPath();
        ctx.arc(this.x, this.y, 3, 0, Math.PI*2);
        ctx.fill();
    }
}

class Particle {
    constructor(x, y, color) {
        this.x = x; this.y = y;
        this.vx = (Math.random() - 0.5) * 5;
        this.vy = (Math.random() - 0.5) * 5;
        this.life = 1.0;
        this.color = color;
    }
    update() {
        this.x += this.vx;
        this.y += this.vy;
        this.life -= 0.05;
    }
    draw() {
        ctx.globalAlpha = Math.max(0, this.life);
        ctx.fillStyle = this.color;
        ctx.fillRect(this.x, this.y, 3, 3);
        ctx.globalAlpha = 1.0;
    }
}

// --- Init ---

function init() {
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
    window.addEventListener('keydown', handleInput);
    
    // Initial Render
    ctx.fillStyle = '#000';
    ctx.fillRect(0,0,width,height);
}

function resizeCanvas() {
    width = canvas.parentElement.clientWidth;
    height = canvas.parentElement.clientHeight;
    canvas.width = width;
    canvas.height = height;
    player.y = height / 2;
}

function startGame() {
    document.getElementById('start-screen').classList.add('hidden');
    document.getElementById('game-over').classList.add('hidden');
    resetGame();
    isPlaying = true;
    lastSpawn = Date.now();
    startTime = Date.now();
    loop();
}

function resetGame() {
    zombies = [];
    bullets = [];
    particles = [];
    score = 0;
    streak = 0;
    keysTyped = 0;
    activeTarget = null;
    spawnRate = 2000;
    updateUI();
}

// --- Game Logic ---

function handleInput(e) {
    if (!isPlaying) return;
    
    const key = e.key;
    if (key.length !== 1) return; // Ignore Shift, Ctrl, etc.

    // 1. If we have a target, check against it
    if (activeTarget) {
        const nextChar = activeTarget.word[activeTarget.typedIndex];
        if (key === nextChar) {
            hitZombie(activeTarget);
        } else {
            // Miss
            streak = 0;
            // Maybe play error sound
        }
    } 
    // 2. No target? Find one that starts with key
    else {
        // Find closest zombie matching key
        let candidates = zombies.filter(z => z.word[0] === key);
        if (candidates.length > 0) {
            // Sort by x (closest to player first)
            candidates.sort((a, b) => a.x - b.x);
            activeTarget = candidates[0];
            hitZombie(activeTarget);
        } else {
            streak = 0;
        }
    }
    updateUI();
}

function hitZombie(zombie) {
    zombie.typedIndex++;
    keysTyped++;
    streak++;
    
    // Shoot visual
    bullets.push(new Bullet(zombie.x, zombie.y));
    
    // Check death
    if (zombie.typedIndex >= zombie.word.length) {
        killZombie(zombie);
    }
}

function killZombie(zombie) {
    zombie.dead = true;
    activeTarget = null;
    score += zombie.word.length * 10;
    
    // Particles
    for(let i=0; i<10; i++) {
        particles.push(new Particle(zombie.x, zombie.y, '#ff3333')); // Blood
    }
    
    // Ramp up difficulty
    if (spawnRate > 500) spawnRate -= 50;
    updateUI();
}

function spawnZombie() {
    const y = 50 + Math.random() * (height - 100);
    const speed = 0.5 + (score / 5000); // Speed up over time
    zombies.push(new Zombie(y, speed));
}

function updateUI() {
    document.getElementById('score-val').innerText = score;
    document.getElementById('streak-val').innerText = streak;
    
    const mins = (Date.now() - startTime) / 60000;
    const wpm = mins > 0 ? Math.floor((keysTyped / 5) / mins) : 0;
    document.getElementById('wpm-val').innerText = wpm + " WPM";
}

function gameOver() {
    isPlaying = false;
    document.getElementById('damage-flash').classList.add('active');
    setTimeout(() => document.getElementById('damage-flash').classList.remove('active'), 200);
    
    document.getElementById('final-score').innerText = score;
    document.getElementById('final-wpm').innerText = document.getElementById('wpm-val').innerText;
    document.getElementById('game-over').classList.remove('hidden');
}

// --- Loop ---

function loop() {
    if (!isPlaying) return;

    ctx.clearRect(0, 0, width, height);

    // Spawning
    if (Date.now() - lastSpawn > spawnRate) {
        spawnZombie();
        lastSpawn = Date.now();
    }

    // Update & Draw Zombies
    // Sort so lower zombies are drawn on top (pseudo-depth)
    zombies.sort((a,b) => a.y - b.y);
    
    zombies.forEach(z => {
        z.update();
        z.draw();
    });
    
    // Cleanup dead zombies
    zombies = zombies.filter(z => !z.dead);
    if (activeTarget && activeTarget.dead) activeTarget = null; // Safety

    // Bullets
    bullets.forEach(b => {
        b.update();
        b.draw();
    });
    bullets = bullets.filter(b => b.active);

    // Particles
    particles.forEach(p => {
        p.update();
        p.draw();
    });
    particles = particles.filter(p => p.life > 0);

    // Draw Player
    ctx.fillStyle = '#fff';
    ctx.beginPath();
    ctx.moveTo(player.x, player.y);
    ctx.lineTo(player.x - 20, player.y - 10);
    ctx.lineTo(player.x - 20, player.y + 10);
    ctx.fill();

    requestAnimationFrame(loop);
}

// Start
init();