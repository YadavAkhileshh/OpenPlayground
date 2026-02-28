// Game Constants
const TILE_SIZE = 40;
const PLAYER_SIZE = 30;
const GRAVITY = 0.5;
const JUMP_SPEED = -12;
const MOVE_SPEED = 5;
const MAX_FALL_SPEED = 15;

// Game State
let canvas, ctx;
let gameState = 'menu'; // menu, playing, levelComplete, gameOver
let currentLevel = 1;
let player;
let platforms = [];
let spikes = [];
let stars = [];
let portal;
let keys = {};
let camera = { x: 0, y: 0 };
let gameTime = 0;
let totalStars = 0;
let collectedStars = 0;
let lives = 3;

// Level Designs - Each level is a unique challenge
const LEVELS = [
    {
        name: "Tutorial",
        player: { x: 100, y: 200 },
        platforms: [
            { x: 0, y: 400, width: 800, height: 40 },
            { x: 300, y: 300, width: 200, height: 20 },
            { x: 600, y: 200, width: 200, height: 20 },
        ],
        spikes: [
            { x: 400, y: 380, width: 40, height: 20 }
        ],
        stars: [
            { x: 380, y: 250 },
            { x: 680, y: 150 }
        ],
        portal: { x: 750, y: 150 }
    },
    {
        name: "The Gap",
        player: { x: 100, y: 200 },
        platforms: [
            { x: 0, y: 400, width: 300, height: 40 },
            { x: 500, y: 400, width: 300, height: 40 },
            { x: 0, y: 0, width: 800, height: 40 },
            { x: 350, y: 200, width: 100, height: 20 }
        ],
        spikes: [
            { x: 500, y: 380, width: 80, height: 20 },
            { x: 0, y: 40, width: 80, height: 20 }
        ],
        stars: [
            { x: 150, y: 340 },
            { x: 390, y: 150 },
            { x: 650, y: 340 }
        ],
        portal: { x: 720, y: 350 }
    },
    {
        name: "Spike Maze",
        player: { x: 50, y: 350 },
        platforms: [
            { x: 0, y: 400, width: 200, height: 40 },
            { x: 300, y: 300, width: 150, height: 20 },
            { x: 550, y: 200, width: 150, height: 20 },
            { x: 300, y: 100, width: 150, height: 20 },
            { x: 0, y: 0, width: 800, height: 40 }
        ],
        spikes: [
            { x: 200, y: 380, width: 100, height: 20 },
            { x: 450, y: 280, width: 100, height: 20 },
            { x: 200, y: 80, width: 100, height: 20 },
            { x: 450, y: 180, width: 100, height: 20 }
        ],
        stars: [
            { x: 370, y: 250 },
            { x: 620, y: 150 },
            { x: 370, y: 50 },
            { x: 100, y: 50 }
        ],
        portal: { x: 50, y: 50 }
    },
    {
        name: "Gravity Master",
        player: { x: 50, y: 350 },
        platforms: [
            { x: 0, y: 400, width: 150, height: 40 },
            { x: 250, y: 350, width: 100, height: 20 },
            { x: 450, y: 300, width: 100, height: 20 },
            { x: 650, y: 250, width: 150, height: 20 },
            { x: 0, y: 0, width: 150, height: 40 },
            { x: 250, y: 50, width: 100, height: 20 },
            { x: 450, y: 100, width: 100, height: 20 },
            { x: 650, y: 150, width: 150, height: 20 }
        ],
        spikes: [
            { x: 150, y: 380, width: 100, height: 20 },
            { x: 350, y: 330, width: 100, height: 20 },
            { x: 550, y: 280, width: 100, height: 20 },
            { x: 150, y: 40, width: 100, height: 20 },
            { x: 350, y: 70, width: 100, height: 20 },
            { x: 550, y: 120, width: 100, height: 20 }
        ],
        stars: [
            { x: 300, y: 300 },
            { x: 500, y: 250 },
            { x: 300, y: 100 },
            { x: 500, y: 150 },
            { x: 720, y: 200 }
        ],
        portal: { x: 720, y: 100 }
    }
];

// Player Class
class Player {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.width = PLAYER_SIZE;
        this.height = PLAYER_SIZE;
        this.vx = 0;
        this.vy = 0;
        this.onGround = false;
        this.gravityFlipped = false;
        this.color = '#00ff88';
        this.trail = [];
    }

    update() {
        // Movement
        if (keys['ArrowLeft'] || keys['a'] || keys['A']) {
            this.vx = -MOVE_SPEED;
        } else if (keys['ArrowRight'] || keys['d'] || keys['D']) {
            this.vx = MOVE_SPEED;
        } else {
            this.vx *= 0.8;
        }

        // Apply gravity
        const gravity = this.gravityFlipped ? -GRAVITY : GRAVITY;
        this.vy += gravity;

        // Limit fall speed
        if (Math.abs(this.vy) > MAX_FALL_SPEED) {
            this.vy = this.gravityFlipped ? -MAX_FALL_SPEED : MAX_FALL_SPEED;
        }

        // Update position
        this.x += this.vx;
        this.y += this.vy;

        // Add to trail
        this.trail.push({ x: this.x, y: this.y, alpha: 1 });
        if (this.trail.length > 10) {
            this.trail.shift();
        }

        // Check collisions
        this.checkPlatformCollisions();
        this.checkSpikeCollisions();
        this.checkStarCollisions();
        this.checkPortalCollision();

        // Check boundaries
        if (this.x < 0) this.x = 0;
        if (this.x + this.width > canvas.width) this.x = canvas.width - this.width;
        
        // Fall off screen
        if (this.y > canvas.height + 50 || this.y < -50) {
            this.die();
        }
    }

    checkPlatformCollisions() {
        this.onGround = false;

        for (let platform of platforms) {
            if (this.x < platform.x + platform.width &&
                this.x + this.width > platform.x &&
                this.y < platform.y + platform.height &&
                this.y + this.height > platform.y) {

                if (this.gravityFlipped) {
                    // Collision from top when gravity is flipped
                    if (this.vy < 0) {
                        this.y = platform.y + platform.height;
                        this.vy = 0;
                        this.onGround = true;
                    }
                } else {
                    // Normal collision from bottom
                    if (this.vy > 0) {
                        this.y = platform.y - this.height;
                        this.vy = 0;
                        this.onGround = true;
                    }
                }
            }
        }
    }

    checkSpikeCollisions() {
        for (let spike of spikes) {
            if (this.x < spike.x + spike.width &&
                this.x + this.width > spike.x &&
                this.y < spike.y + spike.height &&
                this.y + this.height > spike.y) {
                this.die();
                break;
            }
        }
    }

    checkStarCollisions() {
        stars = stars.filter(star => {
            const dx = (this.x + this.width / 2) - star.x;
            const dy = (this.y + this.height / 2) - star.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            if (distance < 20) {
                collectedStars++;
                this.createParticles(star.x, star.y, '#ffd60a');
                updateHUD();
                return false;
            }
            return true;
        });
    }

    checkPortalCollision() {
        if (!portal) return;
        
        const dx = (this.x + this.width / 2) - portal.x;
        const dy = (this.y + this.height / 2) - portal.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance < 30) {
            levelComplete();
        }
    }

    createParticles(x, y, color) {
        for (let i = 0; i < 10; i++) {
            const angle = (Math.PI * 2 * i) / 10;
            const particle = document.createElement('div');
            particle.className = 'particle';
            particle.style.cssText = `
                left: ${x}px;
                top: ${y}px;
                width: 5px;
                height: 5px;
                background: ${color};
                border-radius: 50%;
            `;
            document.body.appendChild(particle);
            setTimeout(() => particle.remove(), 1000);
        }
    }

    flipGravity() {
        this.gravityFlipped = !this.gravityFlipped;
        this.vy = 0;
        
        const indicator = document.getElementById('gravityIndicator');
        if (this.gravityFlipped) {
            indicator.classList.add('flipped');
            indicator.querySelector('span').textContent = 'INVERTED';
        } else {
            indicator.classList.remove('flipped');
            indicator.querySelector('span').textContent = 'NORMAL';
        }
    }

    die() {
        lives--;
        updateHUD();
        
        if (lives <= 0) {
            gameOver();
        } else {
            // Respawn
            const levelData = LEVELS[currentLevel - 1];
            this.x = levelData.player.x;
            this.y = levelData.player.y;
            this.vx = 0;
            this.vy = 0;
            this.gravityFlipped = false;
            
            const indicator = document.getElementById('gravityIndicator');
            indicator.classList.remove('flipped');
            indicator.querySelector('span').textContent = 'NORMAL';
        }
    }

    draw() {
        // Draw trail
        this.trail.forEach((point, index) => {
            const alpha = (index / this.trail.length) * 0.5;
            ctx.fillStyle = `rgba(0, 255, 136, ${alpha})`;
            ctx.fillRect(point.x, point.y, this.width, this.height);
        });

        // Draw player
        ctx.fillStyle = this.color;
        ctx.fillRect(this.x, this.y, this.width, this.height);
        
        // Draw face
        ctx.fillStyle = '#000';
        const eyeY = this.gravityFlipped ? this.y + this.height - 10 : this.y + 8;
        ctx.fillRect(this.x + 8, eyeY, 4, 4);
        ctx.fillRect(this.x + 18, eyeY, 4, 4);
        
        // Draw glow
        ctx.shadowBlur = 10;
        ctx.shadowColor = this.color;
        ctx.strokeStyle = this.color;
        ctx.lineWidth = 2;
        ctx.strokeRect(this.x, this.y, this.width, this.height);
        ctx.shadowBlur = 0;
    }
}

// Initialize Game
function init() {
    canvas = document.getElementById('canvas');
    ctx = canvas.getContext('2d');
    
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
    
    // Event Listeners
    document.addEventListener('keydown', (e) => {
        keys[e.key] = true;
        
        if (gameState === 'playing' && e.key === ' ') {
            e.preventDefault();
            player.flipGravity();
        }
    });
    
    document.addEventListener('keyup', (e) => {
        keys[e.key] = false;
    });
    
    // Button listeners
    document.getElementById('playBtn').addEventListener('click', startGame);
    document.getElementById('howToBtn').addEventListener('click', toggleInstructions);
    document.getElementById('nextLevelBtn').addEventListener('click', nextLevel);
    document.getElementById('retryBtn').addEventListener('click', () => {
        currentLevel = 1;
        lives = 3;
        startGame();
    });
    document.getElementById('menuBtn').addEventListener('click', showMenu);
    
    gameLoop();
}

function resizeCanvas() {
    canvas.width = 800;
    canvas.height = 450;
}

function toggleInstructions() {
    const instructions = document.getElementById('instructions');
    instructions.classList.toggle('hidden');
}

function showMenu() {
    gameState = 'menu';
    document.getElementById('menuScreen').classList.add('active');
    document.getElementById('gameScreen').classList.remove('active');
    document.getElementById('gameOverScreen').classList.remove('active');
}

function startGame() {
    gameState = 'playing';
    gameTime = 0;
    totalStars = 0;
    collectedStars = 0;
    
    document.getElementById('menuScreen').classList.remove('active');
    document.getElementById('gameScreen').classList.add('active');
    document.getElementById('gameOverScreen').classList.remove('active');
    
    loadLevel(currentLevel);
}

function loadLevel(levelNum) {
    if (levelNum > LEVELS.length) {
        // Game completed!
        alert('🎉 Congratulations! You completed all levels!');
        currentLevel = 1;
        showMenu();
        return;
    }
    
    const levelData = LEVELS[levelNum - 1];
    
    player = new Player(levelData.player.x, levelData.player.y);
    platforms = levelData.platforms;
    spikes = levelData.spikes;
    stars = levelData.stars.map(s => ({...s}));
    portal = {...levelData.portal};
    
    totalStars = stars.length;
    collectedStars = 0;
    
    updateHUD();
}

function updateHUD() {
    document.getElementById('stars').textContent = collectedStars;
    document.getElementById('totalStars').textContent = totalStars;
    document.getElementById('level').textContent = currentLevel;
    document.getElementById('lives').textContent = lives;
    
    const minutes = Math.floor(gameTime / 3600);
    const seconds = Math.floor((gameTime % 3600) / 60);
    document.getElementById('timer').textContent = 
        `${minutes}:${seconds.toString().padStart(2, '0')}`;
}

function levelComplete() {
    gameState = 'levelComplete';
    
    document.getElementById('levelStars').textContent = 
        `${collectedStars}/${totalStars}`;
    
    const minutes = Math.floor(gameTime / 3600);
    const seconds = Math.floor((gameTime % 3600) / 60);
    document.getElementById('levelTime').textContent = 
        `${minutes}:${seconds.toString().padStart(2, '0')}`;
    
    document.getElementById('levelComplete').classList.remove('hidden');
}

function nextLevel() {
    document.getElementById('levelComplete').classList.add('hidden');
    currentLevel++;
    gameTime = 0;
    gameState = 'playing';
    loadLevel(currentLevel);
}

function gameOver() {
    gameState = 'gameOver';
    
    document.getElementById('finalLevel').textContent = currentLevel;
    document.getElementById('finalStars').textContent = collectedStars;
    
    const minutes = Math.floor(gameTime / 3600);
    const seconds = Math.floor((gameTime % 3600) / 60);
    document.getElementById('finalTime').textContent = 
        `${minutes}:${seconds.toString().padStart(2, '0')}`;
    
    document.getElementById('gameScreen').classList.remove('active');
    document.getElementById('gameOverScreen').classList.add('active');
}

function gameLoop() {
    if (gameState === 'playing') {
        gameTime++;
        
        // Clear canvas
        ctx.fillStyle = '#1a1a2e';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        // Update and draw
        player.update();
        
        // Draw platforms
        platforms.forEach(platform => {
            ctx.fillStyle = '#4a5568';
            ctx.fillRect(platform.x, platform.y, platform.width, platform.height);
            ctx.strokeStyle = '#718096';
            ctx.lineWidth = 2;
            ctx.strokeRect(platform.x, platform.y, platform.width, platform.height);
        });
        
        // Draw spikes
        spikes.forEach(spike => {
            ctx.fillStyle = '#ff006e';
            ctx.beginPath();
            for (let i = 0; i < spike.width; i += 20) {
                ctx.moveTo(spike.x + i, spike.y + spike.height);
                ctx.lineTo(spike.x + i + 10, spike.y);
                ctx.lineTo(spike.x + i + 20, spike.y + spike.height);
            }
            ctx.fill();
            
            ctx.shadowBlur = 10;
            ctx.shadowColor = '#ff006e';
            ctx.fill();
            ctx.shadowBlur = 0;
        });
        
        // Draw stars
        stars.forEach(star => {
            ctx.save();
            ctx.translate(star.x, star.y);
            ctx.rotate(gameTime * 0.02);
            
            ctx.fillStyle = '#ffd60a';
            ctx.shadowBlur = 15;
            ctx.shadowColor = '#ffd60a';
            
            ctx.beginPath();
            for (let i = 0; i < 5; i++) {
                const angle = (Math.PI * 2 * i) / 5 - Math.PI / 2;
                const x = Math.cos(angle) * 15;
                const y = Math.sin(angle) * 15;
                if (i === 0) ctx.moveTo(x, y);
                else ctx.lineTo(x, y);
                
                const angle2 = (Math.PI * 2 * (i + 0.5)) / 5 - Math.PI / 2;
                const x2 = Math.cos(angle2) * 7;
                const y2 = Math.sin(angle2) * 7;
                ctx.lineTo(x2, y2);
            }
            ctx.closePath();
            ctx.fill();
            
            ctx.shadowBlur = 0;
            ctx.restore();
        });
        
        // Draw portal
        if (portal) {
            ctx.save();
            ctx.translate(portal.x, portal.y);
            ctx.rotate(gameTime * 0.05);
            
            // Outer ring
            ctx.strokeStyle = '#8338ec';
            ctx.lineWidth = 5;
            ctx.shadowBlur = 20;
            ctx.shadowColor = '#8338ec';
            ctx.beginPath();
            ctx.arc(0, 0, 25, 0, Math.PI * 2);
            ctx.stroke();
            
            // Inner ring
            ctx.strokeStyle = '#3a86ff';
            ctx.lineWidth = 3;
            ctx.beginPath();
            ctx.arc(0, 0, 15, 0, Math.PI * 2);
            ctx.stroke();
            
            ctx.shadowBlur = 0;
            ctx.restore();
        }
        
        player.draw();
        
        if (gameTime % 60 === 0) {
            updateHUD();
        }
    }
    
    requestAnimationFrame(gameLoop);
}

// Start the game
init();
