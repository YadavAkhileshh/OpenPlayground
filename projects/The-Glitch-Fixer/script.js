/**
 * The Glitch Fixer Engine
 * Meta-game logic: Allows editing of object properties during runtime.
 */

const canvas = document.getElementById('game-canvas');
const ctx = canvas.getContext('2d');

// --- Config ---
const GRAVITY = 0.5;
const FRICTION = 0.8;
const MOVE_SPEED = 5;
const JUMP_FORCE = 12;

// --- State ---
let width, height;
let objects = [];
let player;
let gameStatus = 'play'; // play, debug, win
let selectedObj = null;
let mouse = { x: 0, y: 0 };
let frameCount = 0;

// --- Classes ---

class GameObject {
    constructor(x, y, w, h, type, props = {}) {
        this.x = x;
        this.y = y;
        this.w = w;
        this.h = h;
        this.type = type; // 'platform', 'enemy', 'player', 'wall', 'goal'
        
        // Default Physics Props
        this.solid = true;
        this.gravity = 0;
        this.vx = 0;
        this.vy = 0;
        this.color = '#fff';
        this.isGlitched = false;
        this.id = type + '_' + Math.floor(Math.random()*1000);

        // Merge custom props
        Object.assign(this, props);
        
        // Track editable properties for the Debugger
        this.editable = ['x', 'y', 'w', 'h', 'solid', 'gravity', 'vx', 'color'];
    }

    update() {
        if (this.type === 'static') return;

        // Apply Physics
        this.vy += this.gravity;
        this.x += this.vx;
        this.y += this.vy;

        // Bounds
        if (this.y > height) {
            this.y = height;
            this.vy = 0;
        }
    }

    draw() {
        ctx.save();
        
        // Glitch Effect (Visual only)
        if (this.isGlitched) {
            if (frameCount % 10 === 0) ctx.translate((Math.random()-0.5)*4, 0);
            ctx.fillStyle = (frameCount % 4 === 0) ? '#ff00ff' : this.color;
        } else {
            ctx.fillStyle = this.color;
        }

        if (this.type === 'goal') {
            ctx.fillStyle = '#00ff41'; // Green goal
            // Pulse
            ctx.shadowBlur = 10;
            ctx.shadowColor = '#00ff41';
        }

        // Draw Rect
        ctx.fillRect(this.x, this.y, this.w, this.h);
        
        // Label for debug
        if (gameStatus === 'debug') {
            ctx.strokeStyle = '#00ff41';
            ctx.lineWidth = 1;
            ctx.strokeRect(this.x, this.y, this.w, this.h);
        }

        ctx.restore();
    }

    contains(mx, my) {
        return mx >= this.x && mx <= this.x + this.w && my >= this.y && my <= this.y + this.h;
    }
}

class Player extends GameObject {
    constructor(x, y) {
        super(x, y, 30, 30, 'player', { color: '#00ccff', gravity: GRAVITY });
        this.grounded = false;
        this.keys = {};
    }

    update() {
        // Controls
        if (this.keys['a'] || this.keys['arrowleft']) this.vx = -MOVE_SPEED;
        else if (this.keys['d'] || this.keys['arrowright']) this.vx = MOVE_SPEED;
        else this.vx = 0;

        if ((this.keys['w'] || this.keys['arrowup'] || this.keys[' ']) && this.grounded) {
            this.vy = -JUMP_FORCE;
            this.grounded = false;
        }

        // Apply Physics
        this.vy += this.gravity;
        this.x += this.vx;
        this.y += this.vy;

        // Collision
        this.grounded = false;
        for (let obj of objects) {
            if (obj === this) continue;
            
            // Goal check
            if (obj.type === 'goal' && this.checkCol(obj)) {
                gameStatus = 'win';
                document.getElementById('win-screen').classList.remove('hidden');
                return;
            }

            // Solid check
            if (obj.solid && this.checkCol(obj)) {
                this.resolveCol(obj);
            }
        }
        
        // Floor safety
        if (this.y + this.h > height) {
            this.y = height - this.h;
            this.vy = 0;
            this.grounded = true;
        }
    }

    checkCol(b) {
        return this.x < b.x + b.w && this.x + this.w > b.x &&
               this.y < b.y + b.h && this.y + this.h > b.y;
    }

    resolveCol(b) {
        // Simple AABB resolution
        const dx = (this.x + this.w/2) - (b.x + b.w/2);
        const dy = (this.y + this.h/2) - (b.y + b.h/2);
        const width = (this.w + b.w) / 2;
        const height = (this.h + b.h) / 2;
        const crossWidth = width * dy;
        const crossHeight = height * dx;

        if (Math.abs(dx) <= width && Math.abs(dy) <= height) {
            if (crossWidth > crossHeight) {
                if (crossWidth > -crossHeight) { // Bottom collision
                    this.y = b.y + b.h;
                    this.vy = 0;
                } else { // Left collision
                    this.x = b.x - this.w;
                    this.vx = 0;
                }
            } else {
                if (crossWidth > -crossHeight) { // Right collision
                    this.x = b.x + b.w;
                    this.vx = 0;
                } else { // Top collision
                    this.y = b.y - this.h;
                    this.vy = 0;
                    this.grounded = true;
                }
            }
        }
    }
}

// --- Init & Level ---

function init() {
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
    
    // Inputs
    window.addEventListener('keydown', e => { if(player) player.keys[e.key.toLowerCase()] = true; });
    window.addEventListener('keyup', e => { if(player) player.keys[e.key.toLowerCase()] = false; });
    
    // Mouse for Debugging
    canvas.addEventListener('mousemove', e => {
        const r = canvas.getBoundingClientRect();
        mouse.x = e.clientX - r.left;
        mouse.y = e.clientY - r.top;
        canvas.style.cursor = gameStatus === 'play' ? 'crosshair' : 'default';
    });

    canvas.addEventListener('mousedown', handleClick);

    // UI Buttons
    document.getElementById('btn-close-term').onclick = closeDebugger;
    document.getElementById('btn-inject').onclick = injectCode;
    document.getElementById('btn-reset').onclick = resetLevel;

    resetLevel();
    loop();
}

function resizeCanvas() {
    width = canvas.parentElement.clientWidth;
    height = canvas.parentElement.clientHeight;
    canvas.width = width;
    canvas.height = height;
}

function resetLevel() {
    gameStatus = 'play';
    document.querySelectorAll('.overlay').forEach(el => el.classList.add('hidden'));
    
    objects = [];
    
    // Level Design: A clearly broken level
    
    // 1. Floor (Working)
    objects.push(new GameObject(0, height - 50, width, 50, 'platform', { color: '#444' }));
    
    // 2. High Wall (The Glitch: Too tall to jump)
    objects.push(new GameObject(400, height - 350, 50, 300, 'wall', { 
        color: '#ff0055', 
        isGlitched: true,
        id: 'firewall_01'
    }));

    // 3. Floating Platform (The Glitch: Has negative gravity / floats away)
    // We want the player to fix this to cross a gap
    const floatPlat = new GameObject(600, height - 200, 100, 20, 'platform', {
        color: '#ffff00',
        gravity: -0.2, // BUG: floats up
        isGlitched: true,
        id: 'elevator_service'
    });
    objects.push(floatPlat);

    // 4. Enemy (The Glitch: Speed is NaN or super fast?)
    // Let's make it super fast blocking the path
    const enemy = new GameObject(250, height - 80, 30, 30, 'enemy', {
        color: '#ff0000',
        vx: 20, // BUG: Too fast
        isGlitched: true,
        id: 'daemon_proc'
    });
    // Add simple patrol logic injection
    enemy.update = function() {
        this.x += this.vx;
        if(this.x > 350 || this.x < 100) this.vx *= -1;
    };
    objects.push(enemy);

    // 5. Goal
    objects.push(new GameObject(width - 80, height - 150, 40, 60, 'goal'));

    player = new Player(50, height - 100);
    objects.push(player);
}

// --- Debugger Logic ---

function handleClick() {
    if (gameStatus === 'win') return;

    // Find clicked object
    const targets = objects.filter(o => o.contains(mouse.x, mouse.y));
    if (targets.length > 0) {
        // Prioritize non-player
        const target = targets.find(t => t !== player) || targets[0];
        openDebugger(target);
    }
}

function openDebugger(obj) {
    gameStatus = 'debug';
    selectedObj = obj;
    document.getElementById('debug-overlay').classList.remove('hidden');
    document.getElementById('target-id').innerText = obj.id;
    document.getElementById('mode-val').innerText = "DEBUG";
    document.getElementById('mode-val').style.color = '#00ff41';

    const container = document.getElementById('props-container');
    container.innerHTML = '';

    // Generate Inputs
    obj.editable.forEach(prop => {
        const val = obj[prop];
        const row = document.createElement('div');
        row.className = 'prop-row';
        row.innerHTML = `
            <label>${prop}</label>
            <input type="text" data-prop="${prop}" value="${val}">
        `;
        container.appendChild(row);
    });
}

function injectCode() {
    if (!selectedObj) return;

    const inputs = document.querySelectorAll('#props-container input');
    inputs.forEach(input => {
        const prop = input.getAttribute('data-prop');
        let val = input.value;

        // Type inference
        if (!isNaN(val)) val = parseFloat(val);
        else if (val === 'true') val = true;
        else if (val === 'false') val = false;

        selectedObj[prop] = val;
    });

    // Fix visual glitch if fixed?
    selectedObj.isGlitched = false; // Assume user fixed it
    
    closeDebugger();
}

function closeDebugger() {
    gameStatus = 'play';
    selectedObj = null;
    document.getElementById('debug-overlay').classList.add('hidden');
    document.getElementById('mode-val').innerText = "PLAY";
    document.getElementById('mode-val').style.color = '#fff';
}

// --- Main Loop ---

function loop() {
    if (gameStatus !== 'debug') {
        frameCount++;
        ctx.clearRect(0, 0, width, height);
        
        // Update & Draw
        for (let obj of objects) {
            obj.update();
            obj.draw();
        }
    } else {
        // Paused state visual
        ctx.fillStyle = 'rgba(0,0,0,0.1)';
        ctx.fillRect(0, 0, width, height);
        
        // Highlight selection
        if (selectedObj) {
            ctx.strokeStyle = '#00ff41';
            ctx.lineWidth = 2;
            ctx.strokeRect(selectedObj.x - 5, selectedObj.y - 5, selectedObj.w + 10, selectedObj.h + 10);
            
            // Draw connecting line to terminal
            ctx.beginPath();
            ctx.moveTo(selectedObj.x + selectedObj.w/2, selectedObj.y);
            ctx.lineTo(width/2, height/2); // Approximate center of screen
            ctx.stroke();
        }
    }

    requestAnimationFrame(loop);
}

// Start
init();