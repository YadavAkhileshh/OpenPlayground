/**
 * Ray Optics Engine
 * Handles Raycasting, Reflection, and Refraction.
 */

const canvas = document.getElementById('optics-canvas');
const ctx = canvas.getContext('2d');

// --- Config ---
const MAX_BOUNCES = 20;
const CANVAS_BG = '#101015';

// --- State ---
let width, height;
let objects = []; // Mirrors, Prisms, Glass
let emitters = []; // Laser sources
let targets = []; // Receivers
let activeObject = null;
let isDragging = false;
let dragOffset = { x: 0, y: 0 };
let level = 1;

// --- Physics Classes ---

class Vector {
    constructor(x, y) { this.x = x; this.y = y; }
    add(v) { return new Vector(this.x + v.x, this.y + v.y); }
    sub(v) { return new Vector(this.x - v.x, this.y - v.y); }
    mult(s) { return new Vector(this.x * s, this.y * s); }
    mag() { return Math.sqrt(this.x*this.x + this.y*this.y); }
    normalize() { 
        const m = this.mag(); 
        return m === 0 ? new Vector(0,0) : new Vector(this.x/m, this.y/m); 
    }
    dot(v) { return this.x*v.x + this.y*v.y; }
}

class Ray {
    constructor(pos, dir, color = '#ff0055') {
        this.pos = pos;
        this.dir = dir.normalize();
        this.color = color;
    }
}

class OpticalObject {
    constructor(x, y, type, angle = 0) {
        this.pos = new Vector(x, y);
        this.type = type; // 'mirror', 'glass', 'wall'
        this.angle = angle;
        this.width = 60;
        this.height = 10;
        if (type === 'glass') { this.height = 40; this.width = 40; }
        
        this.refractiveIndex = 1.5; // Glass
    }
    
    // Get vertices for collision
    getVertices() {
        const hw = this.width / 2;
        const hh = this.height / 2;
        // Rotate corners
        const corners = [
            {x: -hw, y: -hh}, {x: hw, y: -hh}, 
            {x: hw, y: hh}, {x: -hw, y: hh}
        ];
        
        const cos = Math.cos(this.angle);
        const sin = Math.sin(this.angle);
        
        return corners.map(p => ({
            x: this.pos.x + (p.x * cos - p.y * sin),
            y: this.pos.y + (p.x * sin + p.y * cos)
        }));
    }
}

// --- Init ---

function init() {
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
    setupInput();
    loadLevel(1);
    loop();
}

function resizeCanvas() {
    width = canvas.parentElement.clientWidth;
    height = canvas.parentElement.clientHeight;
    canvas.width = width;
    canvas.height = height;
}

function loadLevel(lvl) {
    level = lvl;
    objects = [];
    emitters = [];
    targets = [];
    document.getElementById('level-val').innerText = lvl;
    document.getElementById('win-overlay').classList.add('hidden');
    
    // Level 1: Simple Reflection
    emitters.push({ pos: new Vector(50, height/2), dir: new Vector(1, 0), color: '#ff0055' });
    targets.push({ pos: new Vector(width - 50, 100), radius: 15, hit: false });
    
    objects.push(new OpticalObject(width/2, height/2, 'mirror', Math.PI/4)); // 45 deg
}

// --- Physics Logic ---

function update() {
    // Reset targets
    targets.forEach(t => t.hit = false);
    
    // Cast Rays from emitters
    emitters.forEach(e => {
        castRay(new Ray(e.pos, e.dir, e.color), 0);
    });
    
    // Check Win
    if (targets.every(t => t.hit)) {
        document.getElementById('win-overlay').classList.remove('hidden');
    }
}

function castRay(ray, depth) {
    if (depth > MAX_BOUNCES) return;
    
    let closest = null;
    let minDst = Infinity;
    let normal = null;
    
    // 1. Intersect Scene Boundaries
    // Simple box
    // Left, Right, Top, Bottom walls...
    
    // 2. Intersect Objects
    objects.forEach(obj => {
        const verts = obj.getVertices();
        for (let i = 0; i < verts.length; i++) {
            const p1 = verts[i];
            const p2 = verts[(i + 1) % verts.length];
            
            const hit = getLineIntersection(ray.pos, ray.pos.add(ray.dir.mult(2000)), p1, p2);
            
            if (hit) {
                const dst = Math.hypot(hit.x - ray.pos.x, hit.y - ray.pos.y);
                if (dst < minDst && dst > 0.1) { // 0.1 epsilon to prevent self-intersect
                    minDst = dst;
                    closest = hit;
                    
                    // Calculate Normal
                    const dx = p2.x - p1.x;
                    const dy = p2.y - p1.y;
                    normal = new Vector(-dy, dx).normalize();
                    // Flip normal if facing away
                    // Not strictly needed for reflection formula usually handles it?
                }
            }
        }
    });
    
    // 3. Check Targets
    targets.forEach(t => {
        // Line-Circle intersection or simple distance to ray line
        // Simplify: Check if ray passes close to target within minDst
        const p1 = ray.pos;
        const p2 = ray.pos.add(ray.dir.mult(minDst)); // Segment ending at hit
        
        const dist = distToSegment(t.pos, p1, p2);
        if (dist < t.radius) {
            t.hit = true;
        }
    });
    
    // Draw Current Segment
    const endPoint = closest || ray.pos.add(ray.dir.mult(2000));
    
    ctx.beginPath();
    ctx.moveTo(ray.pos.x, ray.pos.y);
    ctx.lineTo(endPoint.x, endPoint.y);
    ctx.strokeStyle = ray.color;
    ctx.lineWidth = 2;
    ctx.shadowBlur = 10;
    ctx.shadowColor = ray.color;
    ctx.stroke();
    ctx.shadowBlur = 0;
    
    // Recurse if hit object
    if (closest && normal) {
        // Identify object type
        // Find which object owns these points (Optimization needed for many objects)
        // For now, assume perfect reflection (Mirror)
        
        // Reflection Formula: R = I - 2(N.I)N
        const dot = ray.dir.dot(normal);
        const reflectDir = ray.dir.sub(normal.mult(2 * dot));
        
        castRay(new Ray(new Vector(closest.x + reflectDir.x*0.1, closest.y + reflectDir.y*0.1), reflectDir, ray.color), depth + 1);
        
        // TODO: Refraction logic for 'glass'
    }
}

// Math Helpers
function getLineIntersection(p1, p2, p3, p4) {
    const d = (p1.x - p2.x) * (p3.y - p4.y) - (p1.y - p2.y) * (p3.x - p4.x);
    if (d === 0) return null;
    
    const t = ((p1.x - p3.x) * (p3.y - p4.y) - (p1.y - p3.y) * (p3.x - p4.x)) / d;
    const u = -((p1.x - p2.x) * (p1.y - p3.y) - (p1.y - p2.y) * (p1.x - p3.x)) / d;
    
    if (t >= 0 && t <= 1 && u >= 0 && u <= 1) {
        return {
            x: p1.x + t * (p2.x - p1.x),
            y: p1.y + t * (p2.y - p1.y)
        };
    }
    return null;
}

function distToSegment(p, v, w) {
    const l2 = (w.x - v.x)**2 + (w.y - v.y)**2;
    if (l2 == 0) return Math.hypot(p.x - v.x, p.y - v.y);
    let t = ((p.x - v.x) * (w.x - v.x) + (p.y - v.y) * (w.y - v.y)) / l2;
    t = Math.max(0, Math.min(1, t));
    const x = v.x + t * (w.x - v.x);
    const y = v.y + t * (w.y - v.y);
    return Math.hypot(p.x - x, p.y - y);
}

// --- Input & Rendering ---

function setupInput() {
    canvas.addEventListener('mousedown', e => {
        const pos = getMousePos(e);
        // Check objects
        activeObject = objects.find(o => Math.hypot(o.pos.x - pos.x, o.pos.y - pos.y) < 30);
        if (activeObject) {
            isDragging = true;
            dragOffset = { x: activeObject.pos.x - pos.x, y: activeObject.pos.y - pos.y };
        }
    });
    
    window.addEventListener('mousemove', e => {
        if (isDragging && activeObject) {
            const pos = getMousePos(e);
            activeObject.pos.x = pos.x + dragOffset.x;
            activeObject.pos.y = pos.y + dragOffset.y;
        }
    });
    
    window.addEventListener('mouseup', () => {
        isDragging = false;
        activeObject = null;
    });
    
    canvas.addEventListener('dblclick', e => {
        const pos = getMousePos(e);
        const obj = objects.find(o => Math.hypot(o.pos.x - pos.x, o.pos.y - pos.y) < 30);
        if (obj) {
            obj.angle += Math.PI / 4; // Rotate 45 deg
        }
    });
}

function getMousePos(e) {
    const rect = canvas.getBoundingClientRect();
    return { x: e.clientX - rect.left, y: e.clientY - rect.top };
}

function draw() {
    ctx.clearRect(0, 0, width, height);
    
    // Draw Emitters
    emitters.forEach(e => {
        ctx.fillStyle = '#444';
        ctx.fillRect(e.pos.x - 10, e.pos.y - 10, 20, 20);
        ctx.fillStyle = e.color;
        ctx.beginPath(); ctx.arc(e.pos.x, e.pos.y, 5, 0, Math.PI*2); ctx.fill();
    });
    
    // Draw Targets
    targets.forEach(t => {
        ctx.beginPath();
        ctx.arc(t.pos.x, t.pos.y, t.radius, 0, Math.PI*2);
        ctx.fillStyle = t.hit ? '#00ffaa' : '#333';
        ctx.fill();
        ctx.strokeStyle = '#fff';
        ctx.stroke();
    });
    
    // Draw Objects
    objects.forEach(obj => {
        ctx.save();
        ctx.translate(obj.pos.x, obj.pos.y);
        ctx.rotate(obj.angle);
        
        if (obj.type === 'mirror') {
            ctx.fillStyle = '#e0e0e0';
            ctx.fillRect(-obj.width/2, -obj.height/2, obj.width, obj.height);
            // Reflective side
            ctx.fillStyle = '#fff';
            ctx.fillRect(-obj.width/2, -obj.height/2, obj.width, 2);
        } else if (obj.type === 'glass') {
            ctx.fillStyle = 'rgba(100, 200, 255, 0.3)';
            ctx.fillRect(-obj.width/2, -obj.height/2, obj.width, obj.height);
            ctx.strokeStyle = '#88ccff';
            ctx.strokeRect(-obj.width/2, -obj.height/2, obj.width, obj.height);
        }
        
        ctx.restore();
    });
}

function loop() {
    update(); // Calc Rays
    draw();   // Render
    requestAnimationFrame(loop);
}

// Start
init();