/**
 * Time Dilation Engine
 * Controls game loop delta based on player movement velocity.
 */

const canvas = document.getElementById('game-canvas');
const ctx = canvas.getContext('2d');

// --- Config ---
const PLAYER_SPEED = 5;
const ENEMY_SPEED = 3;
const BULLET_SPEED = 15;
const TIME_SMOOTHING = 0.1; // Lerp factor for time transition

// --- State ---
let width, height;
let player = { x: 0, y: 0, hp: 100 };
let mouse = { x: 0, y: 0 };
let bullets = [];
let enemies = [];
let particles = [];
let keys = {};
let score = 0;
let isPlaying = false;

// Time Variables
let timeScale = 0; // 0 = Frozen, 1 = Normal
let targetTimeScale = 0;

// --- Init ---

function init() {
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
    setupInput();
}

function resizeCanvas() {
    width = canvas.parentElement.clientWidth;
    height = canvas.parentElement.clientHeight;
    canvas.width = width;
    canvas.height = height;
    
    // Start Center
    player.x = width / 2;
    player.y = height / 2;
}

function startGame() {
    document.getElementById('start-screen').classList.add('hidden');
    document.getElementById('game-over').classList.add('hidden');
    
    // Reset
    player = { x: width/2, y: height/2, hp: 100 };
    bullets = [];
    enemies = [];
    particles = [];
    score = 0;
    timeScale = 0;
    isPlaying = true;
    updateUI();
    
    loop();
}

// --- Logic ---

function update() {
    if (!isPlaying) return;

    // 1. Calculate Player Movement & Time Scale
    let dx = 0;
    let dy = 0;
    if (keys['w']) dy -= 1;
    if (keys['s']) dy += 1;
    if (keys['a']) dx -= 1;
    if (keys['d']) dx += 1;

    // Normalize
    if (dx !== 0 || dy !== 0) {
        const len = Math.sqrt(dx*dx + dy*dy);
        dx /= len;
        dy /= len;
        targetTimeScale = 1.0; // Moving = Time flows
    } else {
        targetTimeScale = 0.05; // Still = Slow motion (almost frozen, keeps it cinematic)
    }

    // Smooth Time Transition
    timeScale += (targetTimeScale - timeScale) * TIME_SMOOTHING;
    
    // Update UI Time Bar
    document.getElementById('time-fill').style.width = (timeScale * 100) + '%';
    document.getElementById('time-val').innerText = Math.floor(timeScale * 100) + '%';
    
    // Apply Filter effect when slow
    canvas.style.filter = timeScale < 0.5 ? 'grayscale(100%) contrast(1.2)' : 'none';

    // 2. Move Player (Player always moves at full speed relative to inputs)
    // BUT physics world moves relative to timeScale?
    // In Superhot, YOU move normal, WORLD moves when you move.
    
    player.x += dx * PLAYER_SPEED;
    player.y += dy * PLAYER_SPEED;
    
    // Bounds
    player.x = Math.max(20, Math.min(width-20, player.x));
    player.y = Math.max(20, Math.min(height-20, player.y));

    // 3. Spawner (Spawn rate affected by time?)
    // Yes, enemies should spawn based on "Game Time" not real time
    if (Math.random() < 0.02 * timeScale) {
        spawnEnemy();
    }

    // 4. Update Game Objects (Scaled by Time)
    updateEntities();
}

function updateEntities() {
    // Bullets
    for (let i = bullets.length - 1; i >= 0; i--) {
        let b = bullets[i];
        
        // Player bullets move full speed? Or scaled?
        // Usually player bullets move fast, enemy bullets slow.
        // Let's scale EVERYTHING.
        const speed = b.isPlayer ? BULLET_SPEED : BULLET_SPEED * 0.5;
        
        // If it's a player bullet, does it stop when time stops?
        // In Superhot, yes.
        const step = speed * timeScale;
        
        b.x += b.vx * step;
        b.y += b.vy * step;
        
        // Collisions
        if (b.isPlayer) {
            // Hit Enemy
            for (let j = enemies.length - 1; j >= 0; j--) {
                let e = enemies[j];
                if (dist(b, e) < 20) {
                    killEnemy(e, j);
                    bullets.splice(i, 1);
                    break;
                }
            }
        } else {
            // Hit Player
            if (dist(b, player) < 15) {
                player.hp -= 20;
                bullets.splice(i, 1);
                createParticles(player.x, player.y, '#ff0000');
                updateUI();
                if (player.hp <= 0) gameOver();
            }
        }
        
        // Remove OOB
        if (b.x < 0 || b.x > width || b.y < 0 || b.y > height) {
            bullets.splice(i, 1);
        }
    }

    // Enemies
    for (let e of enemies) {
        // Look at player
        const angle = Math.atan2(player.y - e.y, player.x - e.x);
        
        // Move
        e.x += Math.cos(angle) * ENEMY_SPEED * timeScale;
        e.y += Math.sin(angle) * ENEMY_SPEED * timeScale;
        
        // Shoot Logic (Cooldown based on Game Time)
        e.cooldown -= timeScale;
        if (e.cooldown <= 0) {
            shoot(e, player.x, player.y, false);
            e.cooldown = 100 + Math.random() * 50;
        }
    }

    // Particles
    for (let i = particles.length - 1; i >= 0; i--) {
        let p = particles[i];
        p.x += p.vx * timeScale;
        p.y += p.vy * timeScale;
        p.life -= 0.05 * timeScale; // Life drains only when time moves
        if (p.life <= 0) particles.splice(i, 1);
    }
}

function spawnEnemy() {
    // Spawn edge
    let x, y;
    if (Math.random() < 0.5) {
        x = Math.random() < 0.5 ? 0 : width;
        y = Math.random() * height;
    } else {
        x = Math.random() * width;
        y = Math.random() < 0.5 ? 0 : height;
    }
    
    enemies.push({
        x: x, y: y,
        cooldown: 50
    });
}

function killEnemy(e, idx) {
    enemies.splice(idx, 1);
    score++;
    createParticles(e.x, e.y, '#ff7675'); // Red shatter
    updateUI();
}

function shoot(origin, tx, ty, isPlayer) {
    const angle = Math.atan2(ty - origin.y, tx - origin.x);
    bullets.push({
        x: origin.x, y: origin.y,
        vx: Math.cos(angle),
        vy: Math.sin(angle),
        isPlayer: isPlayer
    });
}

function createParticles(x, y, color) {
    for(let i=0; i<8; i++) {
        particles.push({
            x: x, y: y,
            vx: (Math.random()-0.5)*10,
            vy: (Math.random()-0.5)*10,
            life: 1.0,
            color: color
        });
    }
}

// --- Render ---

function draw() {
    ctx.clearRect(0, 0, width, height);
    
    // Grid Lines (to show motion/time)
    ctx.strokeStyle = '#ddd';
    ctx.lineWidth = 1;
    const offset = (Date.now() / 1000) * 20 * timeScale; // Grid moves with time
    // ... skipping complex grid anim for simplicity
    
    // Particles
    particles.forEach(p => {
        ctx.fillStyle = p.color;
        ctx.globalAlpha = p.life;
        ctx.fillRect(p.x, p.y, 4, 4);
    });
    ctx.globalAlpha = 1.0;

    // Enemies (Red Crystal shapes)
    ctx.fillStyle = '#ff7675';
    for (let e of enemies) {
        ctx.save();
        ctx.translate(e.x, e.y);
        ctx.rotate(Math.atan2(player.y - e.y, player.x - e.x));
        ctx.beginPath();
        ctx.moveTo(10, 0);
        ctx.lineTo(-10, 8);
        ctx.lineTo(-6, 0);
        ctx.lineTo(-10, -8);
        ctx.fill();
        ctx.restore();
    }

    // Bullets (Trails)
    for (let b of bullets) {
        ctx.fillStyle = b.isPlayer ? '#000' : '#ff0000';
        ctx.beginPath();
        ctx.arc(b.x, b.y, 4, 0, Math.PI*2);
        ctx.fill();
        
        // Trail
        ctx.strokeStyle = ctx.fillStyle;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(b.x, b.y);
        ctx.lineTo(b.x - b.vx*10, b.y - b.vy*10); // Simple trail
        ctx.stroke();
    }

    // Player (Black Circle/Arrow)
    ctx.fillStyle = '#111';
    ctx.beginPath();
    ctx.arc(player.x, player.y, 10, 0, Math.PI*2);
    ctx.fill();
    
    // Aim line
    ctx.strokeStyle = 'rgba(0,0,0,0.1)';
    ctx.beginPath();
    ctx.moveTo(player.x, player.y);
    ctx.lineTo(mouse.x, mouse.y);
    ctx.stroke();
}

function updateUI() {
    document.getElementById('score-val').innerText = score;
    document.getElementById('hp-fill').style.width = player.hp + '%';
}

function gameOver() {
    isPlaying = false;
    document.getElementById('final-score').innerText = score;
    document.getElementById('game-over').classList.remove('hidden');
}

// --- Input ---

function setupInput() {
    window.addEventListener('keydown', e => keys[e.key.toLowerCase()] = true);
    window.addEventListener('keyup', e => keys[e.key.toLowerCase()] = false);
    
    window.addEventListener('mousemove', e => {
        const rect = canvas.getBoundingClientRect();
        mouse.x = e.clientX - rect.left;
        mouse.y = e.clientY - rect.top;
    });
    
    window.addEventListener('mousedown', () => {
        if (isPlaying) {
            shoot(player, mouse.x, mouse.y, true);
            // Shooting adds a tiny bit of time?
            // timeScale = 0.5; // Recoil time burst
        }
    });
}

function dist(a, b) {
    return Math.sqrt((a.x-b.x)**2 + (a.y-b.y)**2);
}

function loop() {
    update();
    draw();
    requestAnimationFrame(loop);
}

// Start
init();