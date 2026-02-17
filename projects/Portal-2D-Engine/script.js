/**
 * Portal 2D Engine
 * Physics engine with portal logic: Momentum redirection & seamless teleportation.
 */

const canvas = document.getElementById('game-canvas');
const ctx = canvas.getContext('2d');

// --- Config ---
const GRAVITY = 0.5;
const TERMINAL_VEL = 15;
const FRICTION = 0.9;
const MOVE_SPEED = 0.8;
const JUMP_FORCE = 12;

// --- State ---
let width = 800, height = 600;
let keys = {};
let player = {
    x: 100, y: 100, w: 20, h: 40,
    vx: 0, vy: 0,
    grounded: false
};

// Portals: { x, y, nx, ny, active, color }
// nx, ny is the normal vector (direction portal faces)
let portals = [
    { id: 0, x: 0, y: 0, nx: 0, ny: 0, active: false, color: '#00a8ff' }, // Blue
    { id: 1, x: 0, y: 0, nx: 0, ny: 0, active: false, color: '#ff7f00' }  // Orange
];

let walls = []; // Rects {x, y, w, h}

// --- Init ---

function init() {
    resizeCanvas();
    // Pre-build level
    walls = [
        {x: 0, y: height-20, w: width, h: 20}, // Floor
        {x: 0, y: 0, w: 20, h: height},        // Left
        {x: width-20, y: 0, w: 20, h: height}, // Right
        {x: 0, y: 0, w: width, h: 20},         // Ceiling
        // Platforms
        {x: 200, y: 400, w: 400, h: 20},
        {x: 600, y: 200, w: 20, h: 200}
    ];

    setupInput();
    document.getElementById('btn-start').onclick = () => {
        document.getElementById('msg-overlay').classList.add('hidden');
        loop();
    };
}

function resizeCanvas() {
    canvas.width = width;
    canvas.height = height;
}

// --- Physics Logic ---

function update() {
    // 1. Controls
    if (keys['a']) player.vx -= MOVE_SPEED;
    if (keys['d']) player.vx += MOVE_SPEED;
    if (keys[' '] && player.grounded) {
        player.vy = -JUMP_FORCE;
        player.grounded = false;
    }

    // 2. Gravity & Friction
    player.vy += GRAVITY;
    player.vx *= FRICTION;
    
    // Clamp
    player.vy = Math.min(player.vy, TERMINAL_VEL);

    // 3. Movement & Collision
    movePlayer();
    
    // 4. Portal Logic (Check intersection)
    checkPortals();
}

function movePlayer() {
    // X Axis
    player.x += player.vx;
    checkWallCollision('x');

    // Y Axis
    player.y += player.vy;
    player.grounded = false;
    checkWallCollision('y');
}

function checkWallCollision(axis) {
    for (let w of walls) {
        if (checkRectCollide(player, w)) {
            if (axis === 'x') {
                // Resolve X
                if (player.vx > 0) player.x = w.x - player.w;
                else if (player.vx < 0) player.x = w.x + w.w;
                player.vx = 0;
            } else {
                // Resolve Y
                if (player.vy > 0) { // Falling
                    player.y = w.y - player.h;
                    player.grounded = true;
                }
                else if (player.vy < 0) { // Jumping up
                    player.y = w.y + w.h;
                }
                player.vy = 0;
            }
        }
    }
}

function checkRectCollide(a, b) {
    return a.x < b.x + b.w && a.x + a.w > b.x &&
           a.y < b.y + b.h && a.y + a.h > b.y;
}

// --- Portal Mechanics ---

function checkPortals() {
    if (!portals[0].active || !portals[1].active) return;

    // Check distance to center of each portal
    // Simplified: Portals are lines approx 40px long
    
    for (let i = 0; i < 2; i++) {
        const pIn = portals[i];
        const pOut = portals[1 - i]; // The other one

        // Distance from player center to portal center
        const dx = (player.x + player.w/2) - pIn.x;
        const dy = (player.y + player.h/2) - pIn.y;
        const dist = Math.sqrt(dx*dx + dy*dy);

        // Teleport range
        if (dist < 20) {
            teleport(pIn, pOut);
            break; // Only one teleport per frame
        }
    }
}

function teleport(pIn, pOut) {
    // 1. Calculate relative velocity
    // Project velocity onto entry normal to see if we are entering
    // Dot product: v . n
    const dot = player.vx * pIn.nx + player.vy * pIn.ny;
    
    // Only enter if moving INTO the wall (dot < 0)
    // Actually, our normals point OUT of wall. So we move against normal.
    // If dot < 0, we are moving towards wall.
    
    // Actually, let's just do magnitude conservation + rotation
    const speed = Math.sqrt(player.vx**2 + player.vy**2);
    
    // 2. Set Position to Exit
    // Pop out slightly away from wall to avoid instant re-trigger
    player.x = pOut.x + pOut.nx * (player.w + 5) - player.w/2;
    player.y = pOut.y + pOut.ny * (player.h + 5) - player.h/2;
    
    // 3. Rotate Velocity 
    // Outgoing velocity should align with Outgoing Normal
    // If we enter straight in, we exit straight out.
    // Exit Velocity = Normal_Out * Magnitude
    
    // Advanced: conserve entry angle relative to normal
    // But for "Speedy thing goes in", simple magnitude redirection works well for 2D platformers
    
    player.vx = pOut.nx * Math.max(speed, 10); // Boost min speed slightly
    player.vy = pOut.ny * Math.max(speed, 10);
    
    // Reset jump check just in case
    player.grounded = false;
}

// --- Interaction ---

function setupInput() {
    window.addEventListener('keydown', e => keys[e.key.toLowerCase()] = true);
    window.addEventListener('keyup', e => keys[e.key.toLowerCase()] = false);
    
    canvas.addEventListener('mousedown', e => {
        shootPortal(e.button === 0 ? 0 : 1, e);
    });
    
    canvas.addEventListener('contextmenu', e => e.preventDefault());
}

function shootPortal(id, e) {
    const rect = canvas.getBoundingClientRect();
    const mx = e.clientX - rect.left;
    const my = e.clientY - rect.top;
    
    // Raycast from player to mouse to find wall
    // Simplified: Just iterate walls and find closest intersection
    let bestDist = Infinity;
    let hit = null;
    
    // Center of player
    const px = player.x + player.w/2;
    const py = player.y + player.h/2;
    
    // Ray vector
    const dirX = mx - px;
    const dirY = my - py;
    const len = Math.sqrt(dirX*dirX + dirY*dirY);
    const ndx = dirX/len;
    const ndy = dirY/len;
    
    // Ray-AABB intersection logic
    // ... (For demo simplicity, we will just snap to clicked wall if clicked ON wall)
    // Or just simple ray march
    
    for (let t = 0; t < 800; t+=10) {
        const tx = px + ndx * t;
        const ty = py + ndy * t;
        
        for(let w of walls) {
            if (tx > w.x && tx < w.x+w.w && ty > w.y && ty < w.y+w.h) {
                // Hit! Determine Normal
                let nx = 0, ny = 0;
                // Simple logic: determine which face based on previous point
                const prevX = tx - ndx * 10;
                const prevY = ty - ndy * 10;
                
                if (prevX <= w.x) nx = -1; // Left face
                else if (prevX >= w.x+w.w) nx = 1; // Right face
                else if (prevY <= w.y) ny = -1; // Top face
                else ny = 1; // Bottom face
                
                portals[id] = {
                    id: id,
                    x: tx, y: ty,
                    nx: nx, ny: ny,
                    active: true,
                    color: portals[id].color
                };
                return;
            }
        }
    }
}

// --- Rendering ---

function draw() {
    ctx.clearRect(0, 0, width, height);

    // 1. Draw Walls
    ctx.fillStyle = '#8d959e';
    for (let w of walls) {
        ctx.fillRect(w.x, w.y, w.w, w.h);
        ctx.strokeStyle = '#666';
        ctx.strokeRect(w.x, w.y, w.w, w.h);
    }

    // 2. Draw Portals
    for (let p of portals) {
        if (!p.active) continue;
        
        ctx.save();
        ctx.translate(p.x, p.y);
        // Rotate to align with wall
        let angle = 0;
        if (p.nx === 1) angle = Math.PI/2;
        if (p.nx === -1) angle = -Math.PI/2;
        if (p.ny === 1) angle = Math.PI;
        ctx.rotate(angle);
        
        // Draw Ellipse
        ctx.fillStyle = '#000'; // Hole
        ctx.beginPath();
        ctx.ellipse(0, 0, 25, 5, 0, 0, Math.PI*2);
        ctx.fill();
        
        ctx.strokeStyle = p.color;
        ctx.lineWidth = 3;
        ctx.stroke();
        
        // Glow
        ctx.shadowColor = p.color;
        ctx.shadowBlur = 15;
        ctx.stroke();
        ctx.shadowBlur = 0;
        
        ctx.restore();
    }

    // 3. Draw Player
    ctx.fillStyle = '#333';
    ctx.fillRect(player.x, player.y, player.w, player.h);
    
    // Draw Velocity Arrow (Debug visual for momentum)
    /*
    ctx.strokeStyle = 'red';
    ctx.beginPath();
    ctx.moveTo(player.x+10, player.y+20);
    ctx.lineTo(player.x+10 + player.vx*5, player.y+20 + player.vy*5);
    ctx.stroke();
    */
}

function loop() {
    update();
    draw();
    requestAnimationFrame(loop);
}

// Start
init();