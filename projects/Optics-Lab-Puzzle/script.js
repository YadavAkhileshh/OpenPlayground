/**
 * Optics Lab Engine
 * Simulates Vector Raycasting, Reflection, and Refraction (Snell's Law).
 */

const canvas = document.getElementById('sim-canvas');
const ctx = canvas.getContext('2d');

// --- Config ---
const MAX_BOUNCES = 10;
const REFRACTIVE_INDICES = {
    air: 1.00,
    water: 1.33,
    glass: 1.50,
    diamond: 2.42
};

// --- State ---
let width, height;
let components = [];
let sources = [];
let targets = [];
let rays = [];
let dragging = null;
let dragOffset = {x: 0, y: 0};
let level = 1;

// --- Physics Classes ---

class Vec2 {
    constructor(x, y) { this.x = x; this.y = y; }
    add(v) { return new Vec2(this.x + v.x, this.y + v.y); }
    sub(v) { return new Vec2(this.x - v.x, this.y - v.y); }
    mult(n) { return new Vec2(this.x * n, this.y * n); }
    mag() { return Math.sqrt(this.x*this.x + this.y*this.y); }
    normalize() { const m = this.mag(); return m === 0 ? new Vec2(0,0) : this.mult(1/m); }
    dot(v) { return this.x * v.x + this.y * v.y; }
    cross(v) { return this.x * v.y - this.y * v.x; }
}

class Component {
    constructor(type, x, y, w, h, props = {}) {
        this.type = type; // mirror, glass, filter
        this.x = x;
        this.y = y;
        this.w = w;
        this.h = h;
        this.props = props; // rotation, index (n), color
        this.rotation = props.rotation || 0;
    }
    
    // Get transformed segments (lines) for collision
    getSegments() {
        const cx = this.x + this.w/2;
        const cy = this.y + this.h/2;
        
        // Helper to rotate point around center
        const rot = (px, py) => {
            const dx = px - cx;
            const dy = py - cy;
            const cos = Math.cos(this.rotation);
            const sin = Math.sin(this.rotation);
            return new Vec2(
                cx + dx*cos - dy*sin,
                cy + dx*sin + dy*cos
            );
        };

        const p1 = rot(this.x, this.y);
        const p2 = rot(this.x + this.w, this.y);
        const p3 = rot(this.x + this.w, this.y + this.h);
        const p4 = rot(this.x, this.y + this.h);

        return [
            {a: p1, b: p2, norm: new Vec2(0, -1)},
            {a: p2, b: p3, norm: new Vec2(1, 0)},
            {a: p3, b: p4, norm: new Vec2(0, 1)},
            {a: p4, b: p1, norm: new Vec2(-1, 0)}
        ];
    }
}

// --- Ray Casting Logic ---

function castRays() {
    rays = []; // Clear old rays
    
    sources.forEach(src => {
        traceRay(new Vec2(src.x, src.y), new Vec2(Math.cos(src.angle), Math.sin(src.angle)), src.color, 0);
    });

    checkWin();
}

function traceRay(start, dir, color, depth) {
    if (depth > MAX_BOUNCES) return;

    let closest = null;
    let minT = Infinity;
    let hitNormal = null;
    let hitComponent = null;

    // Check Wall Intersections (Canvas Bounds)
    // Simplified: Just stop at bounds
    const bounds = [
        {a: new Vec2(0,0), b: new Vec2(width,0), n: new Vec2(0,1)},
        {a: new Vec2(width,0), b: new Vec2(width,height), n: new Vec2(-1,0)},
        {a: new Vec2(width,height), b: new Vec2(0,height), n: new Vec2(0,-1)},
        {a: new Vec2(0,height), b: new Vec2(0,0), n: new Vec2(1,0)}
    ];

    // Check Components
    const allSegs = [];
    components.forEach(c => {
        const segs = c.getSegments();
        segs.forEach(s => { s.parent = c; allSegs.push(s); });
    });
    
    // Check Targets (as absorbers)
    targets.forEach(t => {
        // Treat target like a small box
        const hw = 15;
        allSegs.push({
            a: new Vec2(t.x-hw, t.y-hw), b: new Vec2(t.x+hw, t.y-hw), parent: t, isTarget: true
        });
        // ... add other sides if needed, simplified to 1 line for hit test
    });

    [...bounds, ...allSegs].forEach(seg => {
        const intersect = getIntersection(start, dir, seg.a, seg.b);
        if (intersect && intersect.t < minT && intersect.t > 0.001) {
            minT = intersect.t;
            closest = intersect.pt;
            hitNormal = seg.n || getNormal(seg.a, seg.b); // Bounds have hardcoded normal
            hitComponent = seg.parent;
            
            // If normal component provided (for rotated shapes)
            // we need to rotate the normal too if calculating dynamically
            // For now, simplify box normals logic
        }
    });

    // If no hit, cast to infinity (screen edge)
    if (!closest) return;

    // Store Segment
    rays.push({ a: start, b: closest, color: color });

    // Handle Interaction
    if (hitComponent) {
        if (hitComponent.isTarget) {
            hitComponent.hitColor = color; // Register hit
            return; // Absorb
        }

        if (hitComponent.type === 'mirror') {
            // Reflect: R = I - 2(N.I)N
            const dot = dir.dot(hitNormal); // Assuming simple axis aligned for now
            // Correct reflection vector math:
            // Need accurate normal at point of impact for rotated shapes
            // Simplified:
            
            // Calculate reflection vector
            // r = d - 2(d . n)n
            // We need correct normal from the segment logic
            let n = getSegmentNormal(closest, hitComponent); 
            
            const d_dot_n = dir.dot(n);
            const r = dir.sub(n.mult(2 * d_dot_n));
            
            traceRay(closest, r, color, depth + 1);

        } else if (hitComponent.type === 'glass' || hitComponent.type === 'water') {
            // Refract: Snell's Law
            // n1 sin(t1) = n2 sin(t2)
            
            let n = getSegmentNormal(closest, hitComponent);
            let n1 = REFRACTIVE_INDICES.air;
            let n2 = hitComponent.props.n || 1.5;
            
            // Check if entering or exiting
            // If dot(dir, normal) < 0, we are entering. Normal opposes ray.
            let entering = dir.dot(n) < 0;
            
            if (!entering) {
                // Exiting
                [n1, n2] = [n2, n1]; // Swap indices
                n = n.mult(-1); // Flip normal to point inward (towards air)
            }

            const ratio = n1 / n2;
            const cosI = -n.dot(dir);
            const sinT2 = ratio * ratio * (1.0 - cosI * cosI);
            
            if (sinT2 > 1.0) {
                // Total Internal Reflection (TIR)
                const r = dir.add(n.mult(2 * cosI));
                traceRay(closest, r, color, depth + 1);
            } else {
                const cosT = Math.sqrt(1.0 - sinT2);
                const r = dir.mult(ratio).add(n.mult(ratio * cosI - cosT));
                traceRay(closest, r, color, depth + 1);
            }
        } else if (hitComponent.type === 'filter') {
            // Pass through but change color
            // If color matches filter, pass. If white, filter it.
            traceRay(closest.add(dir.mult(2)), dir, 'red', depth + 1); // Simplification
        }
    }
}

// Ray-Line Intersection
function getIntersection(rayOrigin, rayDir, p1, p2) {
    const v1 = rayOrigin;
    const v2 = rayOrigin.add(rayDir);
    const v3 = p1;
    const v4 = p2;

    const den = (v1.x - v2.x) * (v3.y - v4.y) - (v1.y - v2.y) * (v3.x - v4.x);
    if (den === 0) return null;

    const t = ((v1.x - v3.x) * (v3.y - v4.y) - (v1.y - v3.y) * (v3.x - v4.x)) / den;
    const u = -((v1.x - v2.x) * (v1.y - v3.y) - (v1.y - v2.y) * (v1.x - v3.x)) / den;

    if (t > 0 && u >= 0 && u <= 1) {
        return {
            t: t,
            pt: new Vec2(v1.x + t * (v2.x - v1.x), v1.y + t * (v2.y - v1.y))
        };
    }
    return null;
}

function getNormal(p1, p2) {
    const dx = p2.x - p1.x;
    const dy = p2.y - p1.y;
    return new Vec2(-dy, dx).normalize();
}

function getSegmentNormal(pt, comp) {
    // Determine which face we hit based on proximity to rotated segments
    // For this demo, let's assume axis-aligned behavior for simplicity inside block logic
    // But for correct physics, we iterate comp.getSegments() and find the one containing pt
    
    let bestDist = Infinity;
    let bestNorm = new Vec2(0, -1);
    
    comp.getSegments().forEach(seg => {
        // Distance from point to line segment... 
        // Since we know pt is ON the line (from intersection), just take that segment's normal
        // Just need to identify WHICH segment
        // Check collinearity
        const d = distToSegment(pt, seg.a, seg.b);
        if (d < bestDist) {
            bestDist = d;
            bestNorm = seg.norm;
        }
    });
    return bestNorm;
}

function distToSegment(p, v, w) {
    const l2 = (v.x-w.x)**2 + (v.y-w.y)**2;
    if (l2 == 0) return (p.x-v.x)**2 + (p.y-v.y)**2;
    let t = ((p.x-v.x)*(w.x-v.x) + (p.y-v.y)*(w.y-v.y)) / l2;
    t = Math.max(0, Math.min(1, t));
    return Math.sqrt( (p.x - (v.x + t*(w.x-v.x)))**2 + (p.y - (v.y + t*(w.y-v.y)))**2 );
}

// --- Game Logic ---

function init() {
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
    setupInteractions();
    
    document.getElementById('btn-clear').onclick = () => { components = []; };
    document.getElementById('btn-next').onclick = nextLevel;

    loadLevel(0);
    loop();
}

function resizeCanvas() {
    width = canvas.parentElement.clientWidth;
    height = canvas.parentElement.clientHeight;
    canvas.width = width;
    canvas.height = height;
}

function loadLevel(idx) {
    document.getElementById('win-modal').classList.add('hidden');
    components = [];
    sources = [];
    targets = [];
    
    // Level 1: Simple Mirror
    if (idx === 0) {
        sources.push({x: 100, y: height/2, angle: 0, color: '#ff3333'});
        targets.push({x: width-100, y: height/2 - 200, w: 30, h: 30, color: 'red', hitColor: null});
        // User needs to place mirror
    }
    // Level 2: Refraction
    else if (idx === 1) {
        sources.push({x: 100, y: height/2 + 100, angle: -0.5, color: '#33ff33'});
        targets.push({x: width-100, y: height/2 + 100, w: 30, h: 30, color: 'green', hitColor: null});
        // User needs to use glass to bend it down/up
    }
    
    document.getElementById('level-val').innerText = idx + 1;
}

function nextLevel() {
    level++;
    loadLevel(level-1);
}

function checkWin() {
    let allHit = true;
    targets.forEach(t => {
        if (!t.hitColor) allHit = false;
        // Strict color check logic could go here
    });

    if (allHit && targets.length > 0) {
        document.getElementById('win-modal').classList.remove('hidden');
    }
    
    // Reset hit status for next frame
    targets.forEach(t => t.hitColor = null);
}

// --- Rendering ---

function draw() {
    ctx.clearRect(0, 0, width, height);

    // 1. Draw Components
    components.forEach(c => {
        ctx.save();
        ctx.translate(c.x + c.w/2, c.y + c.h/2);
        ctx.rotate(c.rotation);
        
        if (c.type === 'mirror') {
            ctx.fillStyle = '#aaa';
            ctx.fillRect(-c.w/2, -c.h/2, c.w, c.h);
            ctx.fillStyle = '#eee'; // Reflective side
            ctx.fillRect(-c.w/2, -c.h/2, c.w, 5); 
        } else if (c.type === 'glass') {
            ctx.fillStyle = 'rgba(200, 240, 255, 0.3)';
            ctx.strokeStyle = 'rgba(200, 240, 255, 0.8)';
            ctx.fillRect(-c.w/2, -c.h/2, c.w, c.h);
            ctx.strokeRect(-c.w/2, -c.h/2, c.w, c.h);
        } else if (c.type === 'water') {
            ctx.fillStyle = 'rgba(0, 100, 255, 0.3)';
            ctx.fillRect(-c.w/2, -c.h/2, c.w, c.h);
        }
        ctx.restore();
    });

    // 2. Draw Targets
    targets.forEach(t => {
        ctx.fillStyle = t.hitColor || '#333';
        ctx.strokeStyle = t.color;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(t.x, t.y, 15, 0, Math.PI*2);
        ctx.fill();
        ctx.stroke();
    });

    // 3. Draw Sources
    sources.forEach(s => {
        ctx.fillStyle = '#444';
        ctx.fillRect(s.x-10, s.y-10, 20, 20);
        ctx.beginPath();
        ctx.arc(s.x, s.y, 5, 0, Math.PI*2);
        ctx.fillStyle = s.color;
        ctx.fill();
    });

    // 4. Draw Rays
    ctx.globalCompositeOperation = 'screen';
    rays.forEach(r => {
        ctx.strokeStyle = r.color;
        ctx.lineWidth = 2;
        ctx.shadowBlur = 10;
        ctx.shadowColor = r.color;
        ctx.beginPath();
        ctx.moveTo(r.a.x, r.a.y);
        ctx.lineTo(r.b.x, r.b.y);
        ctx.stroke();
    });
    ctx.shadowBlur = 0;
    ctx.globalCompositeOperation = 'source-over';
}

function loop() {
    castRays();
    draw();
    requestAnimationFrame(loop);
}

// --- Interaction (Drag & Drop) ---

function setupInteractions() {
    // HTML5 Drag API for toolbox
    const tools = document.querySelectorAll('.tool-item');
    tools.forEach(t => {
        t.addEventListener('dragstart', e => {
            e.dataTransfer.setData('type', t.dataset.type);
        });
    });

    canvas.addEventListener('dragover', e => e.preventDefault());
    canvas.addEventListener('drop', e => {
        e.preventDefault();
        const type = e.dataTransfer.getData('type');
        const rect = canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        let w=100, h=10, props={};
        if (type === 'glass') { w=80; h=80; props={n:1.5}; }
        if (type === 'water') { w=80; h=80; props={n:1.33}; }
        
        components.push(new Component(type, x-w/2, y-h/2, w, h, props));
    });

    // Canvas Mouse Events for moving existing
    canvas.addEventListener('mousedown', e => {
        const rect = canvas.getBoundingClientRect();
        const mx = e.clientX - rect.left;
        const my = e.clientY - rect.top;
        
        // Find component
        for(let c of components) {
            if (mx > c.x && mx < c.x + c.w && my > c.y && my < c.y + c.h) {
                dragging = c;
                dragOffset.x = mx - c.x;
                dragOffset.y = my - c.y;
                // Double click rotate logic could go here
                if (e.detail === 2) {
                    c.rotation += Math.PI/4;
                }
                break;
            }
        }
    });

    canvas.addEventListener('mousemove', e => {
        if (dragging) {
            const rect = canvas.getBoundingClientRect();
            dragging.x = (e.clientX - rect.left) - dragOffset.x;
            dragging.y = (e.clientY - rect.top) - dragOffset.y;
        }
    });

    canvas.addEventListener('mouseup', () => dragging = null);
}

// Start
init();