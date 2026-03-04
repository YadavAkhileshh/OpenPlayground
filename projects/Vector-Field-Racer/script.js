/**
 * Vector Field Racer Engine
 * Grid-based flow field logic + Physics Car controller.
 */

const canvas = document.getElementById('game-canvas');
const ctx = canvas.getContext('2d');

// --- Config ---
const CELL_SIZE = 40;
const FRICTION = 0.96;
const MAX_SPEED = 8;
const TURN_FORCE = 0.5; // How strongly the field pulls

// --- State ---
let width, height;
let cols, rows;
let field = []; // 2D array of Vectors {x, y}
let car = { x: 0, y: 0, vx: 0, vy: 0, active: false };
let startPos = { x: 2, y: 2 };
let endPos = { x: 10, y: 10 };
let mode = 'edit'; // 'edit' or 'race'
let isPainting = false;
let startTime = 0;
let walls = []; // Array of rects

// --- Init ---

function init() {
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
    setupInput();
    
    // Default Track (Simple U shape)
    createWalls();
    
    // Set Start/End
    startPos = { x: CELL_SIZE * 2, y: CELL_SIZE * 2 };
    endPos = { x: width - CELL_SIZE * 3, y: height - CELL_SIZE * 3 };
    
    resetCar();
    loop();
}

function resizeCanvas() {
    width = canvas.parentElement.clientWidth;
    height = canvas.parentElement.clientHeight;
    canvas.width = width;
    canvas.height = height;
    
    cols = Math.ceil(width / CELL_SIZE);
    rows = Math.ceil(height / CELL_SIZE);
    
    // Preserve field if resizing? 
    // For simplicity, reset field on drastic resize or init empty
    if (field.length === 0) resetField();
}

function createWalls() {
    // Simple Loop Track
    walls = [
        // Borders
        {x:0, y:0, w:width, h:CELL_SIZE},
        {x:0, y:height-CELL_SIZE, w:width, h:CELL_SIZE},
        {x:0, y:0, w:CELL_SIZE, h:height},
        {x:width-CELL_SIZE, y:0, w:CELL_SIZE, h:height},
        
        // Center Obstacle
        {x: width/3, y: height/3, w: width/3, h: height/3}
    ];
}

function resetField() {
    field = [];
    for (let x = 0; x < cols; x++) {
        field[x] = [];
        for (let y = 0; y < rows; y++) {
            field[x][y] = null; // No vector initially
        }
    }
}

function resetCar() {
    car.x = startPos.x;
    car.y = startPos.y;
    car.vx = 0;
    car.vy = 0;
    car.active = false;
    car.crashed = false;
    car.finished = false;
}

window.setMode = (m) => {
    mode = m;
    document.querySelectorAll('.btn').forEach(b => b.classList.remove('active'));
    document.getElementById(m === 'edit' ? 'btn-edit' : 'btn-race').classList.add('active');
    
    // Hide Overlays
    document.getElementById('finish-screen').classList.add('hidden');
    document.getElementById('crash-screen').classList.add('hidden');

    if (m === 'race') {
        resetCar();
        car.active = true;
        startTime = Date.now();
    } else {
        car.active = false;
        resetCar();
    }
};

window.resetField = resetField;

// --- Logic ---

function update() {
    if (mode === 'race' && car.active && !car.crashed && !car.finished) {
        // 1. Get Vector from Field
        const cx = Math.floor(car.x / CELL_SIZE);
        const cy = Math.floor(car.y / CELL_SIZE);
        
        if (cx >= 0 && cx < cols && cy >= 0 && cy < rows) {
            const vec = field[cx][cy];
            if (vec) {
                // Apply Force
                // Strength slider could modify this
                const force = parseFloat(document.getElementById('force-slider').value) * TURN_FORCE;
                car.vx += vec.x * force;
                car.vy += vec.y * force;
            }
        }
        
        // 2. Physics
        car.x += car.vx;
        car.y += car.vy;
        
        // Friction
        car.vx *= FRICTION;
        car.vy *= FRICTION;
        
        // 3. Collision
        checkCollisions();
        
        // 4. Timer
        const t = ((Date.now() - startTime) / 1000).toFixed(2);
        document.getElementById('time-val').innerText = t + "s";
    }
}

function checkCollisions() {
    // Walls
    const size = 10; // Car radius
    for (let w of walls) {
        if (car.x + size > w.x && car.x - size < w.x + w.w &&
            car.y + size > w.y && car.y - size < w.y + w.h) {
            crash();
        }
    }
    
    // Finish
    const dx = car.x - endPos.x;
    const dy = car.y - endPos.y;
    if (Math.sqrt(dx*dx + dy*dy) < 30) {
        finish();
    }
}

function crash() {
    car.crashed = true;
    document.getElementById('crash-screen').classList.remove('hidden');
}

function finish() {
    car.finished = true;
    const t = document.getElementById('time-val').innerText;
    document.getElementById('final-time').innerText = t;
    document.getElementById('finish-screen').classList.remove('hidden');
}

// --- Input ---

function setupInput() {
    let lastMouse = { x: 0, y: 0 };
    
    const paint = (e) => {
        if (mode !== 'edit') return;
        
        const rect = canvas.getBoundingClientRect();
        const mx = e.clientX - rect.left;
        const my = e.clientY - rect.top;
        
        const cx = Math.floor(mx / CELL_SIZE);
        const cy = Math.floor(my / CELL_SIZE);
        
        if (cx >= 0 && cx < cols && cy >= 0 && cy < rows) {
            // Calculate Vector based on mouse movement direction
            // Or drag from center of cell?
            // Simple approach: Current mouse - Last mouse = direction
            
            const dx = mx - lastMouse.x;
            const dy = my - lastMouse.y;
            
            if (Math.abs(dx) > 1 || Math.abs(dy) > 1) {
                // Normalize
                const len = Math.sqrt(dx*dx + dy*dy);
                field[cx][cy] = { x: dx/len, y: dy/len };
            }
        }
        lastMouse = { x: mx, y: my };
    };
    
    canvas.addEventListener('mousedown', e => {
        isPainting = true;
        const rect = canvas.getBoundingClientRect();
        lastMouse = { x: e.clientX - rect.left, y: e.clientY - rect.top };
    });
    
    window.addEventListener('mouseup', () => isPainting = false);
    
    canvas.addEventListener('mousemove', e => {
        if (isPainting) paint(e);
        else {
            // Just track for "lastMouse" to be valid on first click?
            const rect = canvas.getBoundingClientRect();
            lastMouse = { x: e.clientX - rect.left, y: e.clientY - rect.top };
        }
    });
}

// --- Draw ---

function draw() {
    ctx.clearRect(0, 0, width, height);
    
    // 1. Draw Walls 
    ctx.fillStyle = '#1e272e';
    for(let w of walls) {
        ctx.fillRect(w.x, w.y, w.w, w.h);
        ctx.strokeStyle = '#555';
        ctx.strokeRect(w.x, w.y, w.w, w.h);
    }
    
    // 2. Draw Start/Finish
    ctx.fillStyle = 'rgba(0, 255, 0, 0.3)';
    ctx.beginPath(); ctx.arc(startPos.x, startPos.y, 20, 0, Math.PI*2); ctx.fill();
    ctx.fillStyle = 'rgba(255, 0, 0, 0.3)';
    ctx.beginPath(); ctx.arc(endPos.x, endPos.y, 20, 0, Math.PI*2); ctx.fill();

    // 3. Draw Vector Field
    ctx.strokeStyle = '#444'; // Grid lines
    ctx.lineWidth = 1;
    
    for (let x = 0; x < cols; x++) {
        for (let y = 0; y < rows; y++) {
            const px = x * CELL_SIZE;
            const py = y * CELL_SIZE;
            
            // Grid box
            ctx.strokeRect(px, py, CELL_SIZE, CELL_SIZE);
            
            const vec = field[x][y];
            if (vec) {
                // Draw Arrow
                const cx = px + CELL_SIZE/2;
                const cy = py + CELL_SIZE/2;
                
                ctx.beginPath();
                ctx.moveTo(cx, cy);
                ctx.lineTo(cx + vec.x * 15, cy + vec.y * 15);
                ctx.strokeStyle = '#00cec9';
                ctx.lineWidth = 2;
                ctx.stroke();
                
                // Arrowhead
                // (Simplified dot for performance/visual clarity)
                ctx.beginPath();
                ctx.arc(cx + vec.x * 15, cy + vec.y * 15, 2, 0, Math.PI*2);
                ctx.fillStyle = '#00cec9';
                ctx.fill();
            }
        }
    }
    
    // 4. Draw Car
    if (mode === 'race' || true) {
        ctx.save();
        ctx.translate(car.x, car.y);
        ctx.rotate(Math.atan2(car.vy, car.vx));
        
        ctx.fillStyle = '#ff7675';
        ctx.beginPath();
        ctx.moveTo(10, 0);
        ctx.lineTo(-5, 5);
        ctx.lineTo(-5, -5);
        ctx.fill();
        
        ctx.restore();
    }
}

function loop() {
    update();
    draw();
    requestAnimationFrame(loop);
}

// Start
init();