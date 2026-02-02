/**
 * Laser-Optics Engine
 * Handles Raycasting, Reflection Vectors, and Level Management.
 */

const canvas = document.getElementById('game-canvas');
const ctx = canvas.getContext('2d');

// --- Config ---
const MAX_BOUNCES = 50;
const ROTATION_STEP = Math.PI / 12; // 15 degrees

// --- State ---
let width, height;
let walls = [];
let mirrors = [];
let emitter = { x: 0, y: 0, angle: 0 };
let target = { x: 0, y: 0, radius: 20, hit: false };
let selectedMirror = null;
let level = 1;
let isDragging = false;
let dragOffset = { x: 0, y: 0 };

// --- Vector Helper ---
class Vec2 {
    constructor(x, y) { this.x = x; this.y = y; }
    add(v) { return new Vec2(this.x + v.x, this.y + v.y); }
    sub(v) { return new Vec2(this.x - v.x, this.y - v.y); }
    dot(v) { return this.x * v.x + this.y * v.y; }
    mult(s) { return new Vec2(this.x * s, this.y * s); }
    mag() { return Math.sqrt(this.x*this.x + this.y*this.y); }
    normalize() { const m = this.mag(); return m === 0 ? new Vec2(0,0) : this.mult(1/m); }
    rotate(angle) {
        const cos = Math.cos(angle);
        const sin = Math.sin(angle);
        return new Vec2(this.x * cos - this.y * sin, this.x * sin + this.y * cos);
    }
}

// --- Entities ---

class Wall {
    constructor(x1, y1, x2, y2) {
        this.p1 = new Vec2(x1, y1);
        this.p2 = new Vec2(x2, y2);
        this.type = 'wall';
        // Normal vector for reflection
        const dx = x2 - x1;
        const dy = y2 - y1;
        this.normal = new Vec2(-dy, dx).normalize();
    }

    draw() {
        ctx.strokeStyle = '#444';
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.moveTo(this.p1.x, this.p1.y);
        ctx.lineTo(this.p2.x, this.p2.y);
        ctx.stroke();
    }
}

class Mirror {
    constructor(x, y, length = 60, angle = Math.PI / 4) {
        this.pos = new Vec2(x, y);
        this.length = length;
        this.angle = angle;
        this.updateEndpoints();
    }

    updateEndpoints() {
        const dir = new Vec2(Math.cos(this.angle), Math.sin(this.angle)).mult(this.length / 2);
        this.p1 = this.pos.sub(dir);
        this.p2 = this.pos.add(dir);
        // Normal is perpendicular to surface
        this.normal = new Vec2(-Math.sin(this.angle), Math.cos(this.angle));
    }

    contains(x, y) {
        // Simple circle check for interaction
        const d = Math.sqrt((x - this.pos.x)**2 + (y - this.pos.y)**2);
        return d < this.length / 1.5;
    }

    draw() {
        ctx.save();
        ctx.translate(this.pos.x, this.pos.y);
        ctx.rotate(this.angle);
        
        // Mirror Surface
        ctx.fillStyle = '#00f3ff';
        ctx.fillRect(-this.length/2, -2, this.length, 4);
        
        // Selection Glow
        if (this === selectedMirror) {
            ctx.strokeStyle = '#fff';
            ctx.lineWidth = 1;
            ctx.strokeRect(-this.length/2 - 4, -6, this.length + 8, 12);
        }
        
        ctx.restore();
    }
}

// --- Initialization ---

function init() {
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
    setupInput();
    loadLevel(1);
    requestAnimationFrame(loop);
}

function resizeCanvas() {
    width = canvas.parentElement.clientWidth;
    height = canvas.parentElement.clientHeight;
    canvas.width = width;
    canvas.height = height;
    if (level === 1) loadLevel(1); // Reload if resized on init
}

function loadLevel(lvl) {
    level = lvl;
    document.getElementById('level-num').innerText = lvl;
    document.getElementById('win-screen').classList.add('hidden');
    target.hit = false;
    walls = [];
    mirrors = [];

    // Screen Bounds
    walls.push(new Wall(0, 0, width, 0));
    walls.push(new Wall(width, 0, width, height));
    walls.push(new Wall(width, height, 0, height));
    walls.push(new Wall(0, height, 0, 0));

    if (lvl === 1) {
        emitter = { x: 100, y: height/2, angle: 0 };
        target = { x: width - 100, y: 100, radius: 25, hit: false };
        
        // Obstacle
        walls.push(new Wall(width/2, 0, width/2, height/2 + 50));
        
        // Mirrors
        mirrors.push(new Mirror(200, height/2, 70));
        mirrors.push(new Mirror(width - 200, height/2, 70));
    }
    // Logic for other levels would go here
}

function setupInput() {
    canvas.addEventListener('mousedown', e => {
        const rect = canvas.getBoundingClientRect();
        const mx = e.clientX - rect.left;
        const my = e.clientY - rect.top;

        selectedMirror = null;
        mirrors.forEach(m => {
            if (m.contains(mx, my)) {
                selectedMirror = m;
                isDragging = true;
                dragOffset = { x: mx - m.pos.x, y: my - m.pos.y };
            }
        });
    });

    window.addEventListener('mousemove', e => {
        if (isDragging && selectedMirror) {
            const rect = canvas.getBoundingClientRect();
            const mx = e.clientX - rect.left;
            const my = e.clientY - rect.top;
            
            selectedMirror.pos.x = mx - dragOffset.x;
            selectedMirror.pos.y = my - dragOffset.y;
            selectedMirror.updateEndpoints();
        }
    });

    window.addEventListener('mouseup', () => isDragging = false);

    // Keyboard Rotation
    window.addEventListener('keydown', e => {
        if (!selectedMirror) return;
        if (e.key === 'q' || e.key === 'Q') {
            selectedMirror.angle -= ROTATION_STEP;
            selectedMirror.updateEndpoints();
        }
        if (e.key === 'e' || e.key === 'E') {
            selectedMirror.angle += ROTATION_STEP;
            selectedMirror.updateEndpoints();
        }
    });

    // UI Buttons
    document.getElementById('btn-rotate-left').onclick = () => {
        if(selectedMirror) { selectedMirror.angle -= ROTATION_STEP; selectedMirror.updateEndpoints(); }
    };
    document.getElementById('btn-rotate-right').onclick = () => {
        if(selectedMirror) { selectedMirror.angle += ROTATION_STEP; selectedMirror.updateEndpoints(); }
    };
    document.getElementById('btn-reset').onclick = () => loadLevel(level);
    document.getElementById('btn-next').onclick = () => loadLevel(1); // Loop level 1 for demo
}

// --- Raycasting Math ---

function castRay(start, dir) {
    let currentPos = start;
    let currentDir = dir;
    let points = [start];
    
    target.hit = false; // Reset frame status

    for (let bounce = 0; bounce < MAX_BOUNCES; bounce++) {
        let closest = null;
        let minDist = Infinity;
        let hitType = null; // 'mirror', 'wall', 'target'

        // 1. Check Intersection with Mirrors & Walls
        [...walls, ...mirrors].forEach(obj => {
            const intersect = getIntersection(currentPos, currentDir, obj.p1, obj.p2);
            if (intersect) {
                const dist = Math.sqrt((intersect.x - currentPos.x)**2 + (intersect.y - currentPos.y)**2);
                if (dist < minDist && dist > 0.1) { // Avoid self-collision
                    minDist = dist;
                    closest = { pt: intersect, obj: obj };
                    hitType = obj instanceof Mirror ? 'mirror' : 'wall';
                }
            }
        });

        // 2. Check Intersection with Target (Circle)
        // Simplification: Check distance to circle center closest point on ray
        // Ray: P = O + tD
        // Project target center onto ray
        const toTarget = new Vec2(target.x, target.y).sub(currentPos);
        const t = toTarget.dot(currentDir);
        if (t > 0) {
            const closestPtOnRay = currentPos.add(currentDir.mult(t));
            const distToCenter = closestPtOnRay.sub(new Vec2(target.x, target.y)).mag();
            
            // Is this point closer than the wall we hit?
            const distFromStart = t;
            if (distToCenter < target.radius && distFromStart < minDist) {
                points.push(closestPtOnRay);
                target.hit = true;
                break; // Stop ray
            }
        }

        if (closest) {
            points.push(closest.pt);
            currentPos = closest.pt;

            if (hitType === 'mirror') {
                // Reflect: R = I - 2(N.I)N
                // I = currentDir, N = closest.obj.normal
                const N = closest.obj.normal;
                const dot = currentDir.dot(N);
                currentDir = currentDir.sub(N.mult(2 * dot));
            } else {
                break; // Wall absorbs
            }
        } else {
            // Ray goes to infinity (off screen)
            points.push(currentPos.add(currentDir.mult(2000)));
            break;
        }
    }
    return points;
}

// Ray-Line Segment Intersection
function getIntersection(rayStart, rayDir, segA, segB) {
    const x1 = rayStart.x;
    const y1 = rayStart.y;
    const x2 = rayStart.x + rayDir.x;
    const y2 = rayStart.y + rayDir.y;
    const x3 = segA.x;
    const y3 = segA.y;
    const x4 = segB.x;
    const y4 = segB.y;

    const den = (x1 - x2) * (y3 - y4) - (y1 - y2) * (x3 - x4);
    if (den === 0) return null;

    const t = ((x1 - x3) * (y3 - y4) - (y1 - y3) * (x3 - x4)) / den;
    const u = -((x1 - x2) * (y1 - y3) - (y1 - y2) * (x1 - x3)) / den;

    if (t > 0 && u >= 0 && u <= 1) {
        return new Vec2(x1 + t * (x2 - x1), y1 + t * (y2 - y1));
    }
    return null;
}

// --- Main Loop ---

function loop() {
    ctx.clearRect(0, 0, width, height);

    // 1. Draw Emitter
    ctx.fillStyle = '#ff0055';
    ctx.beginPath();
    ctx.arc(emitter.x, emitter.y, 10, 0, Math.PI*2);
    ctx.fill();

    // 2. Draw Objects
    walls.forEach(w => w.draw());
    mirrors.forEach(m => m.draw());

    // 3. Draw Target
    ctx.beginPath();
    ctx.arc(target.x, target.y, target.radius, 0, Math.PI*2);
    ctx.fillStyle = target.hit ? '#fff' : '#222'; // Flash white if hit
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 2;
    ctx.fill();
    ctx.stroke();
    
    // Target Glow
    if (target.hit) {
        ctx.shadowBlur = 20;
        ctx.shadowColor = '#fff';
        ctx.stroke();
        ctx.shadowBlur = 0;
        
        if (document.getElementById('win-screen').classList.contains('hidden')) {
            document.getElementById('win-screen').classList.remove('hidden');
        }
    }

    // 4. Calculate & Draw Ray
    const startDir = new Vec2(Math.cos(emitter.angle), Math.sin(emitter.angle));
    const points = castRay(new Vec2(emitter.x, emitter.y), startDir);

    ctx.strokeStyle = '#ff0055';
    ctx.lineWidth = 2;
    ctx.shadowBlur = 10;
    ctx.shadowColor = '#ff0055';
    ctx.beginPath();
    ctx.moveTo(points[0].x, points[0].y);
    for (let i = 1; i < points.length; i++) {
        ctx.lineTo(points[i].x, points[i].y);
    }
    ctx.stroke();
    ctx.shadowBlur = 0;

    requestAnimationFrame(loop);
}

// Start
init();