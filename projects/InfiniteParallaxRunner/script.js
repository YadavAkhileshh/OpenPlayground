const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
let width, height;

const resize = () => {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
};

const handleResize = () => resize();
window.addEventListener('resize', handleResize);
resize();

let gameSpeed = 500;
let score = 0;
let isGameOver = false;
let highscore = localStorage.getItem('ipr_highscore') || 0;
let milestoneText = '';
let milestoneTimer = 0;

const keys = {};

const handleKeyDown = e => keys[e.code] = true;
const handleKeyUp = e => keys[e.code] = false;
const handleTouchStart = () => keys['Space'] = true;
const handleTouchEnd = () => keys['Space'] = false;

window.addEventListener('keydown', handleKeyDown);
window.addEventListener('keyup', handleKeyUp);
window.addEventListener('touchstart', handleTouchStart);
window.addEventListener('touchend', handleTouchEnd);

const assets = {};

function createAsset(w, h, drawFn) {
    const c = document.createElement('canvas');
    c.width = w;
    c.height = h;
    const cx = c.getContext('2d');
    drawFn(cx, w, h);
    return c;
}

function initAssets() {
    assets.playerRun1 = createAsset(40, 60, (c, w, h) => {
        c.fillStyle = '#0ff';
        c.fillRect(10, 20, 20, 30);
        c.fillStyle = '#fff';
        c.beginPath(); c.arc(20, 15, 8, 0, Math.PI*2); c.fill();
        c.strokeStyle = '#0ff';
        c.lineWidth = 4;
        c.beginPath(); c.moveTo(20, 50); c.lineTo(10, 60); c.stroke();
        c.beginPath(); c.moveTo(20, 50); c.lineTo(30, 55); c.stroke();
    });
    assets.playerRun2 = createAsset(40, 60, (c, w, h) => {
        c.fillStyle = '#0ff';
        c.fillRect(10, 20, 20, 30);
        c.fillStyle = '#fff';
        c.beginPath(); c.arc(20, 15, 8, 0, Math.PI*2); c.fill();
        c.strokeStyle = '#0ff';
        c.lineWidth = 4;
        c.beginPath(); c.moveTo(20, 50); c.lineTo(30, 60); c.stroke();
        c.beginPath(); c.moveTo(20, 50); c.lineTo(10, 55); c.stroke();
    });
    assets.playerJump = createAsset(40, 60, (c, w, h) => {
        c.fillStyle = '#0ff';
        c.shadowBlur = 10; c.shadowColor = '#0ff';
        c.fillRect(10, 20, 20, 30);
        c.shadowBlur = 0;
        c.fillStyle = '#fff';
        c.beginPath(); c.arc(20, 15, 8, 0, Math.PI*2); c.fill();
        c.strokeStyle = '#0ff';
        c.lineWidth = 4;
        c.beginPath(); c.moveTo(20, 50); c.lineTo(5, 55); c.stroke();
        c.beginPath(); c.moveTo(20, 50); c.lineTo(35, 55); c.stroke();
    });
    assets.playerDuck = createAsset(40, 40, (c, w, h) => {
        c.fillStyle = '#0ff';
        c.fillRect(10, 15, 20, 20);
        c.fillStyle = '#fff';
        c.beginPath(); c.arc(20, 10, 8, 0, Math.PI*2); c.fill();
        c.strokeStyle = '#0ff';
        c.lineWidth = 4;
        c.beginPath(); c.moveTo(20, 35); c.lineTo(5, 40); c.stroke();
        c.beginPath(); c.moveTo(20, 35); c.lineTo(35, 40); c.stroke();
    });
    assets.enemyGround = createAsset(40, 40, (c, w, h) => {
        c.fillStyle = '#f0f';
        c.shadowBlur = 10; c.shadowColor = '#f0f';
        c.beginPath(); c.moveTo(20, 0); c.lineTo(40, 40); c.lineTo(0, 40); c.fill();
        c.shadowBlur = 0;
        c.fillStyle = '#000'; c.fillRect(15, 10, 5, 20); c.fillRect(20, 10, 5, 20);
    });
    assets.enemyAir = createAsset(50, 40, (c, w, h) => {
        c.fillStyle = '#ff0';
        c.beginPath(); c.moveTo(0, 10); c.lineTo(25, 20); c.lineTo(0, 30); c.fill();
        c.beginPath(); c.moveTo(50, 10); c.lineTo(25, 20); c.lineTo(50, 30); c.fill();
        c.fillStyle = '#f00';
        c.beginPath(); c.arc(25, 20, 8, 0, Math.PI*2); c.fill();
    });
    assets.bgFar = createAsset(800, 600, (c, w, h) => {
        const g = c.createLinearGradient(0,0,0,h);
        g.addColorStop(0, '#000'); g.addColorStop(1, '#102');
        c.fillStyle = g; c.fillRect(0,0,w,h);
        c.fillStyle = '#223';
        for(let i=0; i<30; i++) {
            c.beginPath(); c.moveTo(Math.random()*w, h);
            c.lineTo(Math.random()*w, h - 50 - Math.random()*100);
            c.lineTo(Math.random()*w, h); c.fill();
        }
        c.fillStyle = '#fff';
        for(let i=0; i<50; i++) c.fillRect(Math.random()*w, Math.random()*h/2, 2, 2);
    });
    assets.bgMid = createAsset(800, 600, (c, w, h) => {
        c.clearRect(0,0,w,h);
        c.fillStyle = '#304';
        for(let i=0; i<15; i++) {
            const H = 80 + Math.random() * 80;
            c.fillRect(i * 60, h - H, 40, H);
        }
    });
    assets.bgNear = createAsset(800, 600, (c, w, h) => {
        c.clearRect(0,0,w,h);
        c.fillStyle = '#000';
        for(let i=0; i<10; i++) {
            const H = 40 + Math.random() * 50;
            c.fillRect(i * 100, h - H, 120, H);
            c.fillStyle = '#222'; c.fillRect(i*100, h-H, 120, 5); c.fillStyle = '#000';
        }
    });
}
initAssets();

class Layer {
    constructor(image, speedMod) {
        this.image = image;
        this.speedMod = speedMod;
        this.x = 0;
    }
    
    update(dt) {
        this.x -= gameSpeed * this.speedMod * dt;
        if (this.x <= -width) this.x += width;
        if (this.x < -width * 10) {
            this.x += width * 10;
        }
    }
    
    draw(ctx) {
        let x = Math.floor(this.x);
        if(x > 0) x -= width;
        while (x < width) {
            ctx.drawImage(this.image, x, 0, width, height);
            x += width;
        }
    }
}

const layers = [
    new Layer(assets.bgFar, 0.1),
    new Layer(assets.bgMid, 0.3),
    new Layer(assets.bgNear, 0.6)
];

class Player {
    constructor() {
        this.baseW = 40; this.baseH = 60;
        this.duckH = 40;
        this.x = 100; this.y = 0;
        this.dy = 0;
        this.jumpForce = 1300;
        this.gravity = 4000;
        this.isGrounded = false;
        this.state = 'run';
        this.frameTimer = 0;
    }
    
    update(dt, groundY) {
        const isDuck = (keys['ArrowDown'] || keys['KeyS']);
        
        if ((keys['Space'] || keys['ArrowUp'] || keys['KeyW']) && this.isGrounded) {
            this.dy = -this.jumpForce;
            this.isGrounded = false;
            this.state = 'jump';
        }
        
        this.dy += this.gravity * dt;
        this.y += this.dy * dt;
        
        let currentH = (isDuck && this.isGrounded) ? this.duckH : this.baseH;
        
        if (this.y + currentH > groundY) {
            this.y = groundY - currentH;
            this.dy = 0;
            this.isGrounded = true;
            this.state = isDuck ? 'duck' : 'run';
        } else {
            if (isDuck) this.dy += 1000 * dt;
            this.state = 'jump';
        }
        
        if (this.state === 'run') {
            this.frameTimer += dt;
            if (this.frameTimer > 100) this.frameTimer = 0; 
        } else {
            this.frameTimer = 0;
        }
        
        this.h = currentH;
        this.w = this.baseW;
    }
    draw(ctx) {
        let sprite = assets.playerJump;
        if (this.state === 'duck') {
            sprite = assets.playerDuck;
        } else if (this.state === 'run') {
            const frame = Math.floor(this.frameTimer / 0.1) % 2;
            sprite = frame === 0 ? assets.playerRun1 : assets.playerRun2;
        }
        ctx.drawImage(sprite, this.x, this.y, this.w, this.h);
    }
}
const player = new Player();
class Enemy {
    constructor() { 
        this.active = false;
        this.type = '';
        this.w = 0;
        this.h = 0;
        this.x = 0;
        this.y = 0;
        this.img = null;
    }
    
    spawn(x, groundY) {
        this.active = true;
        this.x = x;
        const rand = Math.random();
        
        if (rand < 0.33) {
            this.type = 'bird';
            this.w = 50; this.h = 40;
            this.y = groundY - 65;
            this.img = assets.enemyAir;
        } else if (rand < 0.66) {
            this.type = 'high_bird';
            this.w = 50; this.h = 40;
            this.y = groundY - 100;
            this.img = assets.enemyAir;
        } else {
            this.type = 'ground';
            this.w = 40; this.h = 40;
            this.y = groundY - 40;
            this.img = assets.enemyGround;
        }
    } 
    update(dt) {
        if (!this.active) return;
        this.x -= gameSpeed * dt;
        if (this.x + this.w < 0) this.active = false;
    }
    draw(ctx) {
        if (!this.active) return;
        ctx.drawImage(this.img, this.x, this.y, this.w, this.h);
    }
}
const enemyPool = Array(10).fill().map(() => new Enemy());
let spawnTimer = 0;
function checkMilestone() {
    [100, 500, 1000, 2000, 5000].forEach(m => {
        if (score >= m && score < m + 10) {
            milestoneText = `AWARD ${m}!`;
            milestoneTimer = 2;
        }
    });
}
function update(dt) {
    if (isGameOver) {
        if (keys['Enter']) resetGame();
        return;
    }
    const groundY = height - 50;
    
    gameSpeed += 2 * dt;
    if (gameSpeed > 2000) gameSpeed = 2000; 
    
    score += Math.floor(gameSpeed * dt * 10) / 10;
    
    checkMilestone();
    
    if (milestoneTimer > 0) milestoneTimer -= dt;
    
    layers.forEach(l => l.update(dt));
    player.update(dt, groundY);
    
    spawnTimer -= dt;
    if (spawnTimer <= 0) {
        const e = enemyPool.find(e => !e.active);
        if (e) {
            e.spawn(width + Math.random() * 100, groundY);
            spawnTimer = 1.2 - Math.min(0.8, gameSpeed / 2000); 
        }
    }
    enemyPool.forEach(e => {
        e.update(dt);
        if (e.active) {
            const px = player.x + 5;
            const pw = player.w - 10;
            const py = player.y + 5;
            const ph = player.h - 10;
            const ex = e.x + 5;
            const ew = e.w - 10;
            const ey = e.y + 5;
            const eh = e.h - 10;
            
            if (px < ex + ew && px + pw > ex && py < ey + eh && py + ph > ey) {
                isGameOver = true;
                if(score > highscore) {
                    highscore = Math.floor(score);
                    localStorage.setItem('ipr_highscore', highscore);
                }
            }
        }
    });
}
function draw() {
    ctx.clearRect(0, 0, width, height);
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, width, height);
    layers.forEach(l => l.draw(ctx));
    ctx.shadowBlur = 20;
    ctx.shadowColor = '#0ff';
    ctx.fillStyle = '#222';
    ctx.fillRect(0, height - 50, width, 50);
    ctx.shadowBlur = 0;
    ctx.shadowColor = 'transparent';
    player.draw(ctx);
    enemyPool.forEach(e => e.draw(ctx));
    ctx.fillStyle = '#fff';
    ctx.font = '24px monospace';
    ctx.textAlign = 'left';
    ctx.fillText(`SCORE: ${Math.floor(score)}`, 20, 40);
    ctx.fillText(`HI: ${highscore}`, 20, 70);
    if (milestoneTimer > 0) {
        ctx.save(); 
        ctx.font = '60px monospace';
        ctx.textAlign = 'center';
        ctx.fillStyle = `hsl(${Date.now() % 360}, 100%, 50%)`;
        ctx.fillText(milestoneText, width / 2, height / 3);
        ctx.restore(); 
    }
    if (isGameOver) {
        ctx.fillStyle = 'rgba(0,0,0,0.8)';
        ctx.fillRect(0, 0, width, height);
        ctx.fillStyle = '#f00';
        ctx.font = '50px monospace';
        ctx.textAlign = 'center';
        ctx.fillText('GAME OVER', width / 2, height / 2 - 20);
        ctx.fillStyle = '#fff';
        ctx.font = '24px monospace';
        ctx.fillText(`Final Score: ${Math.floor(score)}`, width / 2, height / 2 + 30);
        ctx.fillText('Press ENTER to Retry', width / 2, height / 2 + 70);
    }
}

let lastTime = 0;
let animationId = null;

function loop(timestamp) {
    if (!lastTime) lastTime = timestamp;
    const dt = Math.min((timestamp - lastTime) / 1000, 0.1);
    lastTime = timestamp;
    
    update(dt);
    draw();
    
    animationId = requestAnimationFrame(loop);
}

function resetGame() {
    isGameOver = false;
    score = 0;
    gameSpeed = 500;
    enemyPool.forEach(e => e.active = false);
    player.y = 0;
    player.dy = 0;
    player.state = 'run';
    player.frameTimer = 0;
    spawnTimer = 0;
    layers.forEach(l => l.x = 0); 
}

function cleanup() {
    if (animationId) {
        cancelAnimationFrame(animationId);
        animationId = null;
    }
    
    window.removeEventListener('resize', handleResize);
    window.removeEventListener('keydown', handleKeyDown);
    window.removeEventListener('keyup', handleKeyUp);
    window.removeEventListener('touchstart', handleTouchStart);
    window.removeEventListener('touchend', handleTouchEnd);
    
    ctx.clearRect(0, 0, width, height);
    
    for (const key in assets) {
        delete assets[key];
    }
}

animationId = requestAnimationFrame(loop);

window.addEventListener('beforeunload', cleanup);