/**
 * 4D Maze Runner Engine
 * Implements 4D-to-3D projection and 4D Matrix Rotations.
 */

const canvas = document.getElementById('hyper-canvas');
const ctx = canvas.getContext('2d');

// --- Config ---
const PROJECTION_DISTANCE_4D = 2; // Distance from 4D camera
const PROJECTION_DISTANCE_3D = 300; // Scale for 2D screen

// --- Math Classes ---

class Vec4 {
    constructor(x, y, z, w) {
        this.x = x; this.y = y; this.z = z; this.w = w;
    }
}

class Mat4 {
    // 4D Rotation Matrices
    static rotateXY(angle) {
        const c = Math.cos(angle), s = Math.sin(angle);
        return [
            [c, -s, 0, 0],
            [s,  c, 0, 0],
            [0,  0, 1, 0],
            [0,  0, 0, 1]
        ];
    }
    
    static rotateZW(angle) { // The "Magic" 4D Rotation
        const c = Math.cos(angle), s = Math.sin(angle);
        return [
            [1, 0, 0, 0],
            [0, 1, 0, 0],
            [0, 0, c, -s],
            [0, 0, s,  c]
        ];
    }

    static rotateXW(angle) {
        const c = Math.cos(angle), s = Math.sin(angle);
        return [
            [c, 0, 0, -s],
            [0, 1, 0, 0],
            [0, 0, 1, 0],
            [s, 0, 0,  c]
        ];
    }

    static matMul(v, m) {
        const x = v.x*m[0][0] + v.y*m[0][1] + v.z*m[0][2] + v.w*m[0][3];
        const y = v.x*m[1][0] + v.y*m[1][1] + v.z*m[1][2] + v.w*m[1][3];
        const z = v.x*m[2][0] + v.y*m[2][1] + v.z*m[2][2] + v.w*m[2][3];
        const w = v.x*m[3][0] + v.y*m[3][1] + v.z*m[3][2] + v.w*m[3][3];
        return new Vec4(x, y, z, w);
    }
}

// --- State ---
let width, height;
let points = []; // Tesseract vertices
let angleZW = 0; // W-rotation
let angleXW = 0;
let angleXY = 0; // Standard rotation
let playerPos = { x: 0, y: 0, z: 0 }; // Player is 3D cursor inside 4D projection
let targetPos = { x: 0, y: 0, z: 0 };
let keys = {};

// --- Initialization ---

function init() {
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
    setupInput();
    
    initTesseract();
    document.getElementById('btn-reset').onclick = resetSim;

    loop();
}

function resizeCanvas() {
    width = canvas.parentElement.clientWidth;
    height = canvas.parentElement.clientHeight;
    canvas.width = width;
    canvas.height = height;
}

function initTesseract() {
    points = [];
    // Generate 16 vertices of a hypercube
    // (-1, -1, -1, -1) to (1, 1, 1, 1)
    for (let x = -1; x <= 1; x += 2) {
        for (let y = -1; y <= 1; y += 2) {
            for (let z = -1; z <= 1; z += 2) {
                for (let w = -1; w <= 1; w += 2) {
                    points.push(new Vec4(x, y, z, w));
                }
            }
        }
    }
    
    // Set Target random
    targetPos = { 
        x: (Math.random()-0.5)*100, 
        y: (Math.random()-0.5)*100,
        z: 0 
    };
}

function resetSim() {
    angleZW = 0;
    angleXW = 0;
    angleXY = 0;
    playerPos = { x: 0, y: 0, z: 0 };
}

// --- Projection Pipeline ---

function project(v) {
    // 1. Rotate in 4D
    let r = Mat4.matMul(v, Mat4.rotateXY(angleXY));
    r = Mat4.matMul(r, Mat4.rotateZW(angleZW));
    r = Mat4.matMul(r, Mat4.rotateXW(angleXW));

    // 2. Project 4D -> 3D (Perspective)
    // w_dist - w acts as depth for 4th dim
    let w = 1 / (PROJECTION_DISTANCE_4D - r.w);
    let p3 = {
        x: r.x * w,
        y: r.y * w,
        z: r.z * w
    };

    // 3. Project 3D -> 2D
    let z = PROJECTION_DISTANCE_3D / (2 - p3.z); // Standard 3D depth
    let p2 = {
        x: p3.x * z * 100 + width / 2, // Scale up
        y: p3.y * z * 100 + height / 2
    };

    // Store scale for visual depth (size of dot)
    p2.scale = z * w * 5;
    return p2;
}

// --- Game Loop ---

function update() {
    // Controls
    const speed = 0.02;
    if (keys['q']) angleZW -= speed;
    if (keys['e']) angleZW += speed;
    if (keys['r']) angleXW -= speed;
    if (keys['f']) angleXW += speed;
    
    // Auto slight rotation for aesthetics
    angleXY += 0.002;

    // UI Updates
    document.getElementById('val-w').innerText = angleZW.toFixed(2);
}

function draw() {
    ctx.clearRect(0, 0, width, height);

    // 1. Project all points
    const projected = points.map(p => project(p));

    // 2. Draw Edges
    // Connect points that differ by exactly 1 coordinate in 4D source
    ctx.lineWidth = 1;
    for (let i = 0; i < points.length; i++) {
        for (let j = i + 1; j < points.length; j++) {
            const p1 = points[i];
            const p2 = points[j];
            
            // Hamming distance check (coords are -1 or 1)
            let diffs = 0;
            if (p1.x !== p2.x) diffs++;
            if (p1.y !== p2.y) diffs++;
            if (p1.z !== p2.z) diffs++;
            if (p1.w !== p2.w) diffs++;

            if (diffs === 1) {
                // Determine color based on W-depth
                // If connecting "inner" vs "outer" cube (W difference)
                const isWConnection = (p1.w !== p2.w);
                
                ctx.beginPath();
                ctx.moveTo(projected[i].x, projected[i].y);
                ctx.lineTo(projected[j].x, projected[j].y);
                
                if (isWConnection) {
                    ctx.strokeStyle = 'rgba(255, 0, 85, 0.4)'; // Pink for 4D connections
                } else {
                    ctx.strokeStyle = 'rgba(0, 243, 255, 0.2)'; // Blue for 3D cubes
                }
                ctx.stroke();
            }
        }
    }

    // 3. Draw Vertices
    for (let i = 0; i < projected.length; i++) {
        const p = projected[i];
        ctx.fillStyle = '#fff';
        ctx.beginPath();
        ctx.arc(p.x, p.y, Math.abs(p.scale), 0, Math.PI * 2);
        ctx.fill();
    }
    
    // 4. Draw Player (Simple Circle in center for now, visualization demo)
    // For a full maze, we'd collision check against the projected lines
    ctx.strokeStyle = '#bc13fe';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(width/2, height/2, 10, 0, Math.PI*2);
    ctx.stroke();
}

function setupInput() {
    window.addEventListener('keydown', e => keys[e.key.toLowerCase()] = true);
    window.addEventListener('keyup', e => keys[e.key.toLowerCase()] = false);
}

function loop() {
    update();
    draw();
    requestAnimationFrame(loop);
}

// Start
init();