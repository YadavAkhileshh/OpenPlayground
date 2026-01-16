// your code goes here
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// --- CONSTANTS & CONFIG ---
const CANVAS_WIDTH = 900;
const CANVAS_HEIGHT = 400; // Increased height
const GROUND_Y = 350;      // Lowered ground
const GRAVITY = 0.6;
const JUMP_FORCE = -12;    // Slightly stronger jump for larger character
const GAME_SPEED_START = 6;
const MAX_SPEED = 14;

// Set canvas resolution
canvas.width = CANVAS_WIDTH;
canvas.height = CANVAS_HEIGHT;

// Game State
let gameSpeed = GAME_SPEED_START;
let score = 0;
let frameCount = 0;
let gameOver = false;
let gameStarted = false;
let obstacles = [];
let clouds = []; // Optional
let particles = [];
let bullActive = false;
let bullTimer = 0;

// --- PIXEL ART DEFINITONS (1 = black, 0 = transparent) ---

// HORSE SPRITE (Redesigned for clarity: Upright neck, mane, tail)
// Frame 1: Galloping (Legs extended)
const SPRITE_HORSE_RUN_1 = [
    "000000000000000000001100000000", // Ears
    "000000000000000000011111110000", // Head/Snout
    "000000000000000000011111110000",
    "000000000000000000001111000000", // Neck
    "000000000000000000011111000000", // Mane
    "000000000000000000111111000000",
    "000000000001111111111111000000", // Body
    "000001110011111111111111000000", // Tail
    "000011111111111111111111000000",
    "000001111111111111111111000000",
    "000000000011111111111110000000",
    "000000000011100000011100000000", // Legs start
    "000000000111000000011100000000",
    "000000001100000000000110000000",
    "000000001000000000000010000000",
];

// Frame 2: Galloping (Legs Gathered)
const SPRITE_HORSE_RUN_2 = [
    "000000000000000000001100000000",
    "000000000000000000011111110000",
    "000000000000000000011111110000",
    "000000000000000000001111000000",
    "000000000000000000011111000000",
    "000000000000000000111111000000",
    "000000000001111111111111000000",
    "000001111011111111111111000000", // Tail waving
    "000011111111111111111111000000",
    "000000111111111111111110000000",
    "000000000011111111111100000000",
    "000000000011000000011000000000",
    "000000000011100000111000000000",
    "000000000001100000110000000000",
    "000000000000000000000000000000",
];

// BULL SPRITE (Redesigned: Massive Hump, Sharp Horns)
const SPRITE_BULL_RUN_1 = [
    "00000000000000000000000001000", // Horn Tip
    "00000000000000000000000001000",
    "00000000000000000000000011000",
    "00000000000000000000111111110", // Head
    "00000000000011111111111111111", // Massive Hump/Shoulder
    "00000000000111111111111111111",
    "00000000011111111111111110000",
    "00000000011111111111111110000",
    "00000000011111111111111110000",
    "00000000011111111111111000000",
    "00000000000110000000011000000", // Legs moved
    "00000000000110000000011000000",
];
const SPRITE_BULL_RUN_2 = [
    "00000000000000000000000001000",
    "00000000000000000000000001000",
    "00000000000000000000000011000",
    "00000000000000000000111111110",
    "00000000000000111111111111111",
    "00000000000011111111111111111",
    "00000000001111111111111110000",
    "00000000001111111111111110000",
    "00000000001111111111111110000",
    "00000000001111111111111110000",
    "00000000001100000000001110000", // Legs moved
    "00000000011000000000000110000",
];

// Existing obstacles, scaled slightly larger? Stick to old maps for now or upscale?
// The user complained about animal designs, sticking to old cactus is safe but let's make them consistent.
// I'll keep the logic but maybe pass frames as array.

// Classes
class Sprite {
    constructor(bitmaps, scale = 3) {
        // bitmaps can be a single array (static) or array of arrays (animated)
        // standardize to array of arrays
        if (!Array.isArray(bitmaps[0])) {
            // It's a single string array (one frame)
            this.frames = [bitmaps];
        } else {
            // It's already multiple frames
            this.frames = bitmaps;
        }

        this.scale = scale;
        // Assume all frames have same size
        this.height = this.frames[0].length * scale;
        this.width = this.frames[0][0].length * scale;
    }

    draw(ctx, x, y, frameIndex = 0) {
        const frame = this.frames[frameIndex % this.frames.length];

        ctx.fillStyle = '#535353';
        for (let r = 0; r < frame.length; r++) {
            for (let c = 0; c < frame[r].length; c++) {
                if (frame[r][c] === '1') {
                    ctx.fillRect(x + c * this.scale, y + r * this.scale, this.scale, this.scale);
                }
            }
        }
    }
}

// Define assets
const horseAnim = [SPRITE_HORSE_RUN_1, SPRITE_HORSE_RUN_2];
const bullAnim = [SPRITE_BULL_RUN_1, SPRITE_BULL_RUN_2];

// Reusing old cactus data but maybe bumping scale
const cactusSmallData = [
    "00011000",
    "11011000",
    "11011000",
    "11111011",
    "00111111",
    "00111000",
    "00111000",
    "00111000",
]; // slightly shorter
const cactusLargeData = [
    "00011000",
    "00011000",
    "00111011",
    "00111011",
    "10111011",
    "10111011",
    "11111111",
    "00111000",
    "00111000",
    "00111000",
];
const vultureData = [
    "000000001100",
    "001100011100",
    "011111111100",
    "111111111000",
    "000111100000",
    "000011000000",
];

// Instantiate Sprites
const horseSprite = new Sprite(horseAnim, 3); // Scale 3 for clearer pixel look
const bullSprite = new Sprite(bullAnim, 3);
const cactusSmallSprite = new Sprite(cactusSmallData, 4); // Scale 4 to match size better
const cactusLargeSprite = new Sprite(cactusLargeData, 4);
const vultureSprite = new Sprite(vultureData, 4);

class Player {
    constructor() {
        this.x = 50;
        this.y = GROUND_Y - horseSprite.height;
        this.vy = 0;
        this.grounded = true;
        this.jumpTimer = 0;
        this.width = horseSprite.width;
        this.normalHeight = horseSprite.height;
        this.duckHeight = Math.floor(this.normalHeight * 0.6);
        this.height = this.normalHeight;
        this.ducking = false;
        this.animTimer = 0;
    }

    update() {
        if (!this.grounded) {
            this.vy += GRAVITY;
        }

        this.y += this.vy;

        if (this.y >= GROUND_Y - this.normalHeight) {
            this.y = GROUND_Y - this.normalHeight;
            this.vy = 0;
            this.grounded = true;
        } else {
            this.grounded = false;
        }

        const isDown = keys['ArrowDown'];
        this.ducking = isDown && this.grounded;

        if (this.grounded) {
            if (this.ducking) {
                this.height = this.duckHeight;
                this.y = GROUND_Y - this.duckHeight;
            } else {
                this.height = this.normalHeight;
                this.y = GROUND_Y - this.normalHeight;
            }
        } else {
            this.height = this.normalHeight;
        }

        // Animation
        this.animTimer++;
    }

    jump() {
        if (this.grounded && !this.ducking) {
            this.vy = JUMP_FORCE;
            this.grounded = false;
        }
    }

    draw() {
        // Frame logic: toggle every 10 frames if grounded
        let fIndex = 0;
        if (this.ducking) {
            fIndex = 1;
        } else if (this.grounded) {
            fIndex = Math.floor(this.animTimer / 8) % 2;
        } else {
            fIndex = 0; // Jump pose (Frame 1 looks mostly okay for jump)
        }
        horseSprite.draw(ctx, this.x, this.y, fIndex);
    }
}

class Obstacle {
    constructor(type) {
        this.type = type;
        this.markedForDeletion = false;

        if (type === 'cactus_small') {
            this.sprite = cactusSmallSprite;
            this.y = GROUND_Y - this.sprite.height;
        } else if (type === 'cactus_large') {
            this.sprite = cactusLargeSprite;
            this.y = GROUND_Y - this.sprite.height;
        } else if (type === 'vulture') {
            this.sprite = vultureSprite;
            const heights = [GROUND_Y - 60, GROUND_Y - 100, GROUND_Y - 30];
            this.y = heights[Math.floor(Math.random() * heights.length)];
        }

        this.x = CANVAS_WIDTH + Math.random() * 200;
        this.width = this.sprite.width;
        this.height = this.sprite.height;
        this.animTimer = 0;
    }

    update() {
        this.x -= gameSpeed;
        if (this.x + this.sprite.width < 0) {
            this.markedForDeletion = true;
        }
        this.animTimer++;
    }

    draw() {
        // Vulture could flap wings? currently Vulture is 1 frame
        // If we wanted vulture anim, we'd pass array.
        // Current vultureData implies single frame since it's just strings.
        // check Sprite constructor logic:

        let fIndex = 0;
        if (this.type === 'vulture') {
            // Simulate flapping by bouncing Y slightly or just toggle if we had frames
            // For now static
        }
        this.sprite.draw(ctx, this.x, this.y, fIndex);
    }
}

class Bull {
    constructor() {
        this.x = -150;
        this.y = GROUND_Y - bullSprite.height;
        this.active = false;
        this.width = bullSprite.width;
        this.height = bullSprite.height;
        this.animTimer = 0;
    }

    activate() {
        this.active = true;
        this.x = -150;
    }

    update() {
        if (!this.active) return;
        this.x += 4; // Faster than player

        if (this.x > 250) { // Stay ahead
            this.x = 250;
        }

        this.animTimer++;

        obstacles.forEach(obs => {
            if (checkCollision(this, obs)) {
                obs.markedForDeletion = true;
                // createParticles(obs.x, obs.y);
            }
        });
    }

    draw() {
        if (!this.active) return;
        // Fast running
        let fIndex = Math.floor(this.animTimer / 5) % 2;
        bullSprite.draw(ctx, this.x, this.y, fIndex);
    }
}

// Global Objects
let player = new Player();
let bull = new Bull();

// Input
let keys = {};
let konamiCode = ['b']; // Simplified: Just press 'B'
let konamiIndex = 0;

window.addEventListener('keydown', (e) => {
    // Prevent default scrolling
    if (['ArrowUp', 'ArrowDown', 'Space'].includes(e.code)) {
        e.preventDefault();
    }

    // Start Game from Menu
    if (!gameStarted && (e.code === 'Space' || e.code === 'Enter')) {
        startGame();
        return;
    }

    keys[e.code] = true;

    // Jump
    if ((e.code === 'Space' || e.code === 'ArrowUp') && !gameOver && gameStarted) {
        player.jump();
    }

    // Restart
    if (e.code === 'Space' && gameOver && gameStarted) {
        resetGame();
        animate();
    }

    // Konami Code Logic
    if (e.key === konamiCode[konamiIndex] || e.key.toLowerCase() === konamiCode[konamiIndex].toLowerCase()) {
        konamiIndex++;
        if (konamiIndex === konamiCode.length) {
            activateBullCheat();
            konamiIndex = 0;
        }
    } else {
        konamiIndex = 0;
    }
});

window.addEventListener('keyup', (e) => {
    keys[e.code] = false;
});

function activateBullCheat() {
    console.log("CHEAT ACTIVATED!");
    bullActive = true;
    bullTimer = 1000;
    bull.activate();

    const scoreEl = document.getElementById('score');
    scoreEl.style.color = '#535353';
    scoreEl.innerText = "CHEAT ON";
}

function spawnObstacle() {
    if (obstacles.length > 0) {
        let lastObs = obstacles[obstacles.length - 1];
        if (CANVAS_WIDTH - lastObs.x < 350 + Math.random() * 250) {
            return;
        }
    }

    const r = Math.random();
    let type = 'cactus_small';
    if (score > 500 && r > 0.7) type = 'vulture';
    else if (r > 0.45) type = 'cactus_large';

    obstacles.push(new Obstacle(type));
}

function checkCollision(rect1, rect2) {
    let r1w = rect1.width;
    let r1h = rect1.height;
    let r2w = rect2.width;
    let r2h = rect2.height;

    let padding = 12; // Increased padding for larger sprites to be forgiving

    return (
        rect1.x < rect2.x + r2w - padding &&
        rect1.x + r1w - padding > rect2.x &&
        rect1.y < rect2.y + r2h - padding &&
        rect1.y + r1h - padding > rect2.y
    );
}

function update() {
    if (gameOver) return;

    if (frameCount % 1000 === 0 && gameSpeed < MAX_SPEED) {
        gameSpeed += 0.5;
    }

    player.update();

    if (bullActive) {
        bullTimer--;
        bull.update();
        if (bullTimer <= 0) {
            bullActive = false;
            bull.active = false;
        }
    }

    spawnObstacle();
    obstacles.forEach(obs => obs.update());
    obstacles = obstacles.filter(obs => !obs.markedForDeletion);

    for (let obs of obstacles) {
        if (checkCollision(player, obs)) {
            if (!bullActive) {
                gameOver = true;
                document.getElementById('game-over').classList.remove('hidden');
            }
        }
    }

    score++;
    document.getElementById('score').innerText = Math.floor(score / 10).toString().padStart(5, '0');
    frameCount++;
}

function draw() {
    ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT); // Clear canvas

    // Draw Ground
    ctx.beginPath();
    ctx.moveTo(0, GROUND_Y);
    ctx.lineTo(CANVAS_WIDTH, GROUND_Y);
    ctx.strokeStyle = '#535353';
    ctx.lineWidth = 2;
    ctx.stroke();

    player.draw();
    obstacles.forEach(obs => obs.draw());
    if (bullActive) bull.draw();
}

function resetGame() {
    gameOver = false;
    obstacles = [];
    score = 0;
    gameSpeed = GAME_SPEED_START;
    player = new Player();

    if (bullTimer > 0) {
        bullActive = true;
        bull.activate();
    } else {
        bullActive = false;
        bull.active = false;
        bullTimer = 0;
    }

    document.getElementById('game-over').classList.add('hidden');
    document.getElementById('score').classList.remove('hidden');
    document.getElementById('score').style.color = '';
}

function startGame() {
    if (gameStarted) return;
    gameStarted = true;
    document.getElementById('start-menu').classList.add('hidden');
    document.getElementById('instructions').classList.remove('hidden');
    document.getElementById('score').classList.remove('hidden');
    resetGame();
    animate();
}

function animate() {
    if (!gameStarted) return;
    update();
    draw();
    if (!gameOver) {
        requestAnimationFrame(animate);
    }
}

document.getElementById('start-btn').addEventListener('click', startGame);

function init() {
    document.getElementById('score').classList.add('hidden');
    ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    ctx.beginPath();
    ctx.moveTo(0, GROUND_Y);
    ctx.lineTo(CANVAS_WIDTH, GROUND_Y);
    ctx.strokeStyle = '#535353';
    ctx.lineWidth = 2;
    ctx.stroke();
    player.draw();
}

init();
