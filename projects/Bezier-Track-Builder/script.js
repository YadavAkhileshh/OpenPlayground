/**
 * Bezier Track Builder Engine
 * Generates procedural meshes from Cubic Bézier Splines.
 */

const canvas = document.getElementById('editor-canvas');
const ctx = canvas.getContext('2d');

// --- Config ---
let ROAD_WIDTH = 40;
let RESOLUTION = 50; // Points per curve segment
const HANDLE_RAD = 6;

// --- State ---
let width, height;
let curves = []; // Array of Curve Objects
let draggingPoint = null;
let hoveredPoint = null;

// --- Math Classes ---

class Point {
    constructor(x, y, type = 'anchor') {
        this.x = x;
        this.y = y;
        this.type = type; // 'anchor' (P0, P3) or 'control' (P1, P2)
    }
}

class Curve {
    constructor(p0, p1, p2, p3) {
        this.points = [p0, p1, p2, p3];
    }

    // Cubic Bezier Formula
    // B(t) = (1-t)^3*P0 + 3*(1-t)^2*t*P1 + 3*(1-t)*t^2*P2 + t^3*P3
    getPoint(t) {
        const mt = 1 - t;
        const mt2 = mt * mt;
        const mt3 = mt2 * mt;
        const t2 = t * t;
        const t3 = t2 * t;

        const p0 = this.points[0];
        const p1 = this.points[1];
        const p2 = this.points[2];
        const p3 = this.points[3];

        const x = mt3 * p0.x + 3 * mt2 * t * p1.x + 3 * mt * t2 * p2.x + t3 * p3.x;
        const y = mt3 * p0.y + 3 * mt2 * t * p1.y + 3 * mt * t2 * p2.y + t3 * p3.y;

        return { x, y };
    }

    // Derivative (Tangent Vector)
    // B'(t) = 3(1-t)^2(P1-P0) + 6(1-t)t(P2-P1) + 3t^2(P3-P2)
    getTangent(t) {
        const mt = 1 - t;
        const p0 = this.points[0];
        const p1 = this.points[1];
        const p2 = this.points[2];
        const p3 = this.points[3];

        const x = 3 * mt * mt * (p1.x - p0.x) + 6 * mt * t * (p2.x - p1.x) + 3 * t * t * (p3.x - p2.x);
        const y = 3 * mt * mt * (p1.y - p0.y) + 6 * mt * t * (p2.y - p1.y) + 3 * t * t * (p3.y - p2.y);
        
        // Normalize
        const len = Math.sqrt(x * x + y * y);
        return { x: x / len, y: y / len };
    }
}

// --- Initialization ---

function init() {
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
    setupInput();

    // Default Curve
    addCurve();

    // Controls
    document.getElementById('btn-add').onclick = addCurve;
    document.getElementById('btn-clear').onclick = () => { curves = []; addCurve(); draw(); };
    document.getElementById('width-slider').oninput = e => { ROAD_WIDTH = parseInt(e.target.value); draw(); };
    document.getElementById('res-slider').oninput = e => { RESOLUTION = parseInt(e.target.value); draw(); };
    
    // Toggles re-draw
    ['chk-handles', 'chk-normals', 'chk-wireframe'].forEach(id => {
        document.getElementById(id).onchange = draw;
    });

    draw();
}

function resizeCanvas() {
    width = canvas.parentElement.clientWidth;
    height = canvas.parentElement.clientHeight;
    canvas.width = width;
    canvas.height = height;
    draw();
}

function addCurve() {
    let startX = 100, startY = height / 2;
    
    // Connect to end of last curve if exists
    if (curves.length > 0) {
        const last = curves[curves.length - 1];
        const lastP = last.points[3];
        startX = lastP.x;
        startY = lastP.y;
    }

    const p0 = new Point(startX, startY, 'anchor');
    const p1 = new Point(startX + 100, startY - 100, 'control');
    const p2 = new Point(startX + 200, startY + 100, 'control');
    const p3 = new Point(startX + 300, startY, 'anchor');

    // Link logic: If connecting, p0 should be reference to last p3
    if (curves.length > 0) {
        const last = curves[curves.length - 1];
        curves.push(new Curve(last.points[3], p1, p2, p3));
    } else {
        curves.push(new Curve(p0, p1, p2, p3));
    }
    
    draw();
}

// --- Interaction ---

function setupInput() {
    canvas.addEventListener('mousedown', e => {
        if (hoveredPoint) {
            draggingPoint = hoveredPoint;
            canvas.style.cursor = 'grabbing';
        }
    });

    canvas.addEventListener('mousemove', e => {
        const rect = canvas.getBoundingClientRect();
        const mx = e.clientX - rect.left;
        const my = e.clientY - rect.top;

        if (draggingPoint) {
            draggingPoint.x = mx;
            draggingPoint.y = my;
            draw();
        } else {
            // Hit Test
            hoveredPoint = null;
            let hit = false;
            
            // Iterate all points
            // Note: Shared points appear in multiple curves, handle deduplication logic visually
            for (let c of curves) {
                for (let p of c.points) {
                    const dist = Math.sqrt((mx - p.x) ** 2 + (my - p.y) ** 2);
                    if (dist < HANDLE_RAD * 1.5) {
                        hoveredPoint = p;
                        hit = true;
                        break;
                    }
                }
                if (hit) break;
            }
            canvas.style.cursor = hit ? 'grab' : 'crosshair';
        }
    });

    window.addEventListener('mouseup', () => {
        draggingPoint = null;
        canvas.style.cursor = 'crosshair';
    });
}

// --- Rendering ---

function draw() {
    ctx.clearRect(0, 0, width, height);

    const showHandles = document.getElementById('chk-handles').checked;
    const showNormals = document.getElementById('chk-normals').checked;
    const wireframe = document.getElementById('chk-wireframe').checked;

    // 1. Draw Road Mesh
    curves.forEach(curve => {
        const leftEdge = [];
        const rightEdge = [];

        for (let i = 0; i <= RESOLUTION; i++) {
            const t = i / RESOLUTION;
            const p = curve.getPoint(t);
            const tan = curve.getTangent(t);
            
            // Normal Vector (-y, x)
            const nx = -tan.y;
            const ny = tan.x;

            // Extrude vertices
            leftEdge.push({ x: p.x + nx * (ROAD_WIDTH / 2), y: p.y + ny * (ROAD_WIDTH / 2) });
            rightEdge.push({ x: p.x - nx * (ROAD_WIDTH / 2), y: p.y - ny * (ROAD_WIDTH / 2) });

            // Visual Debug: Normals
            if (showNormals && i % 5 === 0) {
                ctx.strokeStyle = '#00ff00';
                ctx.beginPath();
                ctx.moveTo(p.x, p.y);
                ctx.lineTo(p.x + nx * 20, p.y + ny * 20);
                ctx.stroke();
            }
        }

        // Fill Road
        if (!wireframe) {
            ctx.fillStyle = '#333';
            ctx.strokeStyle = '#fff';
            ctx.beginPath();
            ctx.moveTo(leftEdge[0].x, leftEdge[0].y);
            // Draw forward along left edge
            for (let p of leftEdge) ctx.lineTo(p.x, p.y);
            // Draw backward along right edge
            for (let i = rightEdge.length - 1; i >= 0; i--) ctx.lineTo(rightEdge[i].x, rightEdge[i].y);
            ctx.closePath();
            ctx.fill();
            
            // Dashed Center Line
            ctx.beginPath();
            ctx.strokeStyle = '#fff';
            ctx.setLineDash([10, 10]);
            ctx.lineWidth = 2;
            const pStart = curve.getPoint(0);
            ctx.moveTo(pStart.x, pStart.y);
            for(let i=1; i<=RESOLUTION; i++) {
                const p = curve.getPoint(i/RESOLUTION);
                ctx.lineTo(p.x, p.y);
            }
            ctx.stroke();
            ctx.setLineDash([]);
        } else {
            // Wireframe
            ctx.strokeStyle = '#ff0055';
            ctx.lineWidth = 1;
            ctx.beginPath();
            // Connect left/right pairs (Triangle strip style visual)
            for(let i=0; i<leftEdge.length; i++) {
                ctx.moveTo(leftEdge[i].x, leftEdge[i].y);
                ctx.lineTo(rightEdge[i].x, rightEdge[i].y);
            }
            ctx.stroke();
            
            // Borders
            ctx.strokeStyle = '#fff';
            ctx.beginPath();
            ctx.moveTo(leftEdge[0].x, leftEdge[0].y);
            for(let p of leftEdge) ctx.lineTo(p.x, p.y);
            ctx.stroke();
            
            ctx.beginPath();
            ctx.moveTo(rightEdge[0].x, rightEdge[0].y);
            for(let p of rightEdge) ctx.lineTo(p.x, p.y);
            ctx.stroke();
        }
    });

    // 2. Draw Handles
    if (showHandles) {
        ctx.lineWidth = 1;
        curves.forEach(c => {
            // Lines P0-P1 and P2-P3
            ctx.strokeStyle = '#666';
            ctx.setLineDash([5, 5]);
            ctx.beginPath();
            ctx.moveTo(c.points[0].x, c.points[0].y);
            ctx.lineTo(c.points[1].x, c.points[1].y);
            ctx.stroke();
            
            ctx.beginPath();
            ctx.moveTo(c.points[2].x, c.points[2].y);
            ctx.lineTo(c.points[3].x, c.points[3].y);
            ctx.stroke();
            ctx.setLineDash([]);

            // Points 
            c.points.forEach(p => {
                ctx.beginPath();
                ctx.arc(p.x, p.y, HANDLE_RAD, 0, Math.PI * 2);
                if (p.type === 'anchor') {
                    ctx.fillStyle = '#fff';
                    ctx.strokeStyle = '#000';
                    ctx.fill(); ctx.stroke();
                } else {
                    ctx.fillStyle = '#ff0055';
                    ctx.fill();
                }
            });
        });
    }
}

// Start
init();