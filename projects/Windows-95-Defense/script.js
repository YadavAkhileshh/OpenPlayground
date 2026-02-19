/**
 * Win95 Defense Engine
 * Handles Grid Pathfinding (A*), Drag/Drop UI blocking, and Tower mechanics.
 */

const canvas = document.getElementById('game-canvas');
const ctx = canvas.getContext('2d');

// --- Config ---
const CELL_SIZE = 40;
let COLS, ROWS;

// --- State ---
let grid = []; // 0 = empty, 1 = obstacle, 2 = path
let enemies = [];
let towers = [];
let projectiles = [];
let windows = []; // Draggable obstacle windows
let globalPath = [];

let startNode = { c: 0, r: 0 };
let endNode = { c: 0, r: 0 };

let money = 200;
let score = 0;
let health = 100;
let isPlaying = false;
let buildMode = null; // 'antivirus' or 'firewall'

// Drag State
let draggingWindow = null;
let dragOffsetX = 0, dragOffsetY = 0;

// --- Init ---

function init() {
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
    setupInput();
    generateGrid();
    
    // Create initial draggable window (Notepad)
    windows.push({
        x: 400, y: 200, w: 200, h: 160, 
        title: "Readme.txt - Notepad", 
        color: '#fff',
        isDragging: false
    });
}

function resizeCanvas() {
    const parent = canvas.parentElement;
    canvas.width = parent.clientWidth;
    canvas.height = parent.clientHeight - 35; // Minus taskbar
    COLS = Math.floor(canvas.width / CELL_SIZE);
    ROWS = Math.floor(canvas.height / CELL_SIZE);
    generateGrid();
}

function generateGrid() {
    grid = [];
    for (let c = 0; c < COLS; c++) {
        grid[c] = [];
        for (let r = 0; r < ROWS; r++) {
            grid[c][r] = { c, r, walkable: true };
        }
    }
    startNode = grid[0][Math.floor(ROWS/2)];
    endNode = grid[COLS - 1][Math.floor(ROWS/2)];
    updateGridObstacles();
    calculatePath();
}

function startGame() {
    document.getElementById('start-menu').classList.add('hidden');
    document.getElementById('game-over').classList.add('hidden');
    money = 200;
    score = 0;
    health = 100;
    enemies = [];
    towers = [];
    projectiles = [];
    isPlaying = true;
    updateUI();
    loop();
    spawnWave();
}

// --- Pathfinding (A*) --- 

function calculatePath() {
    let openSet = [startNode];
    let closedSet = [];
    
    // Reset nodes
    for(let c=0; c<COLS; c++) {
        for(let r=0; r<ROWS; r++) {
            grid[c][r].g = 0; grid[c][r].h = 0; grid[c][r].f = 0;
            grid[c][r].parent = null;
        }
    }
    
    while(openSet.length > 0) {
        let lowestIdx = 0;
        for(let i=0; i<openSet.length; i++) {
            if(openSet[i].f < openSet[lowestIdx].f) lowestIdx = i;
        }
        
        let current = openSet[lowestIdx];
        
        if(current === endNode) {
            let temp = current;
            globalPath = [];
            while(temp.parent) {
                globalPath.push(temp);
                temp = temp.parent;
            }
            globalPath.push(startNode);
            globalPath.reverse();
            return true; // Path found
        }
        
        openSet.splice(lowestIdx, 1);
        closedSet.push(current);
        
        let neighbors = getNeighbors(current);
        for(let i=0; i<neighbors.length; i++) {
            let neighbor = neighbors[i];
            
            if(!neighbor.walkable || closedSet.includes(neighbor)) continue;
            
            let tempG = current.g + 1;
            let newPath = false;
            
            if(openSet.includes(neighbor)) {
                if(tempG < neighbor.g) {
                    neighbor.g = tempG;
                    newPath = true;
                }
            } else {
                neighbor.g = tempG;
                newPath = true;
                openSet.push(neighbor);
            }
            
            if(newPath) {
                neighbor.h = Math.abs(neighbor.c - endNode.c) + Math.abs(neighbor.r - endNode.r); // Manhattan
                neighbor.f = neighbor.g + neighbor.h;
                neighbor.parent = current;
            }
        }
    }
    return false; // No path
}

function getNeighbors(node) {
    let neighbors = [];
    let {c, r} = node;
    if(c < COLS - 1) neighbors.push(grid[c+1][r]);
    if(c > 0) neighbors.push(grid[c-1][r]);
    if(r < ROWS - 1) neighbors.push(grid[c][r+1]);
    if(r > 0) neighbors.push(grid[c][r-1]);
    return neighbors;
}

function updateGridObstacles() {
    // Reset Walkability
    for(let c=0; c<COLS; c++) {
        for(let r=0; r<ROWS; r++) {
            grid[c][r].walkable = true;
        }
    }
    // Windows block cells
    windows.forEach(w => {
        let startC = Math.max(0, Math.floor(w.x / CELL_SIZE));
        let endC = Math.min(COLS-1, Math.floor((w.x + w.w) / CELL_SIZE));
        let startR = Math.max(0, Math.floor(w.y / CELL_SIZE));
        let endR = Math.min(ROWS-1, Math.floor((w.y + w.h) / CELL_SIZE));
        
        for(let c=startC; c<=endC; c++) {
            for(let r=startR; r<=endR; r++) {
                grid[c][r].walkable = false;
            }
        }
    });
    // Towers block cells
    towers.forEach(t => {
        grid[t.c][t.r].walkable = false;
    });
    
    // Keep start and end clear
    startNode.walkable = true;
    endNode.walkable = true;
}

// --- Entities ---

class Enemy {
    constructor() {
        this.c = startNode.c;
        this.r = startNode.r;
        this.x = this.c * CELL_SIZE + CELL_SIZE/2;
        this.y = this.r * CELL_SIZE + CELL_SIZE/2;
        this.pathIndex = 0;
        this.speed = 1.5;
        this.hp = 30 + (score / 10); // Scale health
        this.maxHp = this.hp;
    }
    
    update() {
        if(this.pathIndex < globalPath.length) {
            let targetNode = globalPath[this.pathIndex];
            let tx = targetNode.c * CELL_SIZE + CELL_SIZE/2;
            let ty = targetNode.r * CELL_SIZE + CELL_SIZE/2;
            
            let dx = tx - this.x;
            let dy = ty - this.y;
            let dist = Math.hypot(dx, dy);
            
            if(dist < this.speed) {
                this.x = tx; this.y = ty;
                this.pathIndex++;
            } else {
                this.x += (dx/dist) * this.speed;
                this.y += (dy/dist) * this.speed;
            }
        } else {
            // Reached End
            health -= 10;
            updateUI();
            this.hp = 0;
            if(health <= 0) gameOver();
        }
    }
    
    draw() {
        ctx.fillStyle = '#00ff00'; // Bug color
        ctx.fillRect(this.x - 8, this.y - 8, 16, 16);
        // Eyes
        ctx.fillStyle = '#000';
        ctx.fillRect(this.x - 4, this.y - 4, 3, 3);
        ctx.fillRect(this.x + 2, this.y - 4, 3, 3);
    }
}

// --- Game Logic ---

function spawnWave() {
    if(!isPlaying) return;
    enemies.push(new Enemy());
    setTimeout(spawnWave, Math.max(800, 2000 - score * 5));
}

function update() {
    if(!isPlaying) return;
    
    enemies.forEach(e => e.update());
    enemies = enemies.filter(e => e.hp > 0);
    
    // Tower Shooting
    towers.forEach(t => {
        t.cooldown--;
        if(t.cooldown <= 0) {
            // Find target
            let target = enemies.find(e => Math.hypot(e.x - (t.c*CELL_SIZE+CELL_SIZE/2), e.y - (t.r*CELL_SIZE+CELL_SIZE/2)) < t.range);
            if(target) {
                projectiles.push({
                    x: t.c*CELL_SIZE+CELL_SIZE/2, y: t.r*CELL_SIZE+CELL_SIZE/2,
                    target: target, speed: 5, dmg: 15
                });
                t.cooldown = 30;
            }
        }
    });
    
    // Projectiles
    for(let i=projectiles.length-1; i>=0; i--) {
        let p = projectiles[i];
        if(p.target.hp <= 0) { projectiles.splice(i,1); continue; }
        
        let dx = p.target.x - p.x;
        let dy = p.target.y - p.y;
        let dist = Math.hypot(dx, dy);
        
        if(dist < p.speed) {
            p.target.hp -= p.dmg;
            if(p.target.hp <= 0) {
                score += 10;
                money += 5;
                updateUI();
            }
            projectiles.splice(i,1);
        } else {
            p.x += (dx/dist) * p.speed;
            p.y += (dy/dist) * p.speed;
        }
    }
}

function gameOver() {
    isPlaying = false;
    document.getElementById('final-score').innerText = score;
    document.getElementById('game-over').classList.remove('hidden');
}

// --- UI & Rendering ---

function toggleMenu() {
    document.getElementById('start-menu').classList.toggle('hidden');
}

function buyTower(type) {
    if(type === 'antivirus' && money >= 50) { buildMode = 'antivirus'; }
    toggleMenu();
}

function updateUI() {
    document.getElementById('score-disp').innerText = `Score: ${score}`;
    document.getElementById('money-disp').innerText = `$ ${money}`;
    document.getElementById('lives-disp').innerText = `Health: ${health}%`;
}

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Draw Icons (Start/End)
    ctx.fillStyle = '#fff';
    ctx.font = '12px Tahoma';
    ctx.fillText("Internet", startNode.c*CELL_SIZE + 2, startNode.r*CELL_SIZE + 20);
    ctx.fillText("My PC", endNode.c*CELL_SIZE + 5, endNode.r*CELL_SIZE + 20);

    // Draw Path Line (Debug/Visual)
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
    ctx.beginPath();
    for(let i=0; i<globalPath.length; i++) {
        let x = globalPath[i].c*CELL_SIZE + CELL_SIZE/2;
        let y = globalPath[i].r*CELL_SIZE + CELL_SIZE/2;
        if(i===0) ctx.moveTo(x,y); else ctx.lineTo(x,y);
    }
    ctx.stroke();

    // Draw Towers
    towers.forEach(t => {
        ctx.fillStyle = '#c0c0c0';
        ctx.fillRect(t.c*CELL_SIZE, t.r*CELL_SIZE, CELL_SIZE, CELL_SIZE);
        ctx.fillStyle = '#000080';
        ctx.fillRect(t.c*CELL_SIZE+5, t.r*CELL_SIZE+5, CELL_SIZE-10, CELL_SIZE-10);
    });
    
    enemies.forEach(e => e.draw());
    
    // Draw Projectiles (Pixels)
    ctx.fillStyle = '#ffff00';
    projectiles.forEach(p => {
        ctx.fillRect(p.x-2, p.y-2, 4, 4);
    });

    // Draw Win95 Windows
    windows.forEach(w => {
        // Shadow
        ctx.fillStyle = '#000';
        ctx.fillRect(w.x + 2, w.y + 2, w.w, w.h);
        
        // Window Frame
        ctx.fillStyle = '#c0c0c0';
        ctx.fillRect(w.x, w.y, w.w, w.h);
        
        // Borders (Bevel)
        ctx.strokeStyle = '#fff'; ctx.beginPath(); ctx.moveTo(w.x, w.y+w.h); ctx.lineTo(w.x, w.y); ctx.lineTo(w.x+w.w, w.y); ctx.stroke();
        ctx.strokeStyle = '#808080'; ctx.beginPath(); ctx.moveTo(w.x, w.y+w.h); ctx.lineTo(w.x+w.w, w.y+w.h); ctx.lineTo(w.x+w.w, w.y); ctx.stroke();
        
        // Title Bar
        ctx.fillStyle = '#000080';
        ctx.fillRect(w.x + 2, w.y + 2, w.w - 4, 18);
        ctx.fillStyle = '#fff';
        ctx.font = 'bold 12px Tahoma';
        ctx.fillText(w.title, w.x + 6, w.y + 15);
        
        // Content area
        ctx.fillStyle = w.color;
        ctx.fillRect(w.x + 4, w.y + 22, w.w - 8, w.h - 26);
    });

    // Build Mode Preview
    if(buildMode) {
        let rect = canvas.getBoundingClientRect();
        let c = Math.floor(mouseX / CELL_SIZE);
        let r = Math.floor(mouseY / CELL_SIZE);
        ctx.fillStyle = 'rgba(0, 0, 128, 0.5)';
        ctx.fillRect(c*CELL_SIZE, r*CELL_SIZE, CELL_SIZE, CELL_SIZE);
    }
}

// --- Input Handling ---

let mouseX = 0, mouseY = 0;

function setupInput() {
    canvas.addEventListener('mousemove', e => {
        let rect = canvas.getBoundingClientRect();
        mouseX = e.clientX - rect.left;
        mouseY = e.clientY - rect.top;
        
        if(draggingWindow) {
            draggingWindow.x = mouseX - dragOffsetX;
            draggingWindow.y = mouseY - dragOffsetY;
            
            // Recalculate Path in real time
            updateGridObstacles();
            if(!calculatePath()) {
                // If path blocked, turn window red or don't allow drop. 
                // A* handles it (enemies will stop or we prevent drop).
            }
        }
    });
    
    canvas.addEventListener('mousedown', e => {
        // Check Windows Title Bars (Top 20px)
        for(let i=windows.length-1; i>=0; i--) {
            let w = windows[i];
            if(mouseX >= w.x && mouseX <= w.x+w.w && mouseY >= w.y && mouseY <= w.y+20) {
                draggingWindow = w;
                dragOffsetX = mouseX - w.x;
                dragOffsetY = mouseY - w.y;
                return; // Grabbed window
            }
        }
        
        // Check Build Mode
        if(buildMode) {
            let c = Math.floor(mouseX / CELL_SIZE);
            let r = Math.floor(mouseY / CELL_SIZE);
            
            // Check if placeable
            if(grid[c][r].walkable) {
                towers.push({ c, r, type: buildMode, cooldown: 0, range: 100 });
                money -= 50;
                buildMode = null;
                updateGridObstacles();
                calculatePath();
                updateUI();
            }
        }
    });
    
    window.addEventListener('mouseup', () => {
        if(draggingWindow) {
            draggingWindow = null;
            updateGridObstacles();
            calculatePath();
        }
    });
}

function loop() {
    update();
    draw();
    requestAnimationFrame(loop);
}

// Start
init();