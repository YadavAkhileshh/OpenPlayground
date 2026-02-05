/**
 * 4D Hypercube Engine
 * Handles 4D Rotation Matrices and Stereographic Projection.
 */

const canvas = document.getElementById('viz-canvas');
const ctx = canvas.getContext('2d');

// --- State ---
let width, height;
let angleZW = 0; // The "Inside-Out" rotation
let angleXW = 0;
let angleXYZ = 0; // Standard 3D spin
let isAuto = true;
let points = [];

// --- Math Helpers (Matrices) ---

class Vec4 {
    constructor(x, y, z, w) {
        this.x = x; this.y = y; this.z = z; this.w = w;
    }
}

function matMul(v, m) {
    const x = v.x*m[0][0] + v.y*m[1][0] + v.z*m[2][0] + v.w*m[3][0];
    const y = v.x*m[0][1] + v.y*m[1][1] + v.z*m[2][1] + v.w*m[3][1];
    const z = v.x*m[0][2] + v.y*m[1][2] + v.z*m[2][2] + v.w*m[3][2];
    const w = v.x*m[0][3] + v.y*m[1][3] + v.z*m[2][3] + v.w*m[3][3];
    return new Vec4(x, y, z, w);
}

// --- Initialization ---

function init() {
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
    
    // Generate Tesseract Vertices (+/- 1)
    // 16 points: (x, y, z, w)
    points = [];
    for (let i = 0; i < 16; i++) {
        // Binary representation of 0-15 gives us combinations
        const x = (i & 1) ? 1 : -1;
        const y = (i & 2) ? 1 : -1;
        const z = (i & 4) ? 1 : -1;
        const w = (i & 8) ? 1 : -1;
        points.push(new Vec4(x, y, z, w));
    }

    // Controls
    const sZW = document.getElementById('angle-zw');
    const sXW = document.getElementById('angle-xw');
    const sXYZ = document.getElementById('angle-xyz');
    
    const updateAngles = () => {
        isAuto = false;
        document.getElementById('btn-auto').classList.remove('active');
        angleZW = parseFloat(sZW.value);
        angleXW = parseFloat(sXW.value);
        angleXYZ = parseFloat(sXYZ.value);
    };

    sZW.addEventListener('input', updateAngles);
    sXW.addEventListener('input', updateAngles);
    sXYZ.addEventListener('input', updateAngles);

    document.getElementById('btn-auto').onclick = () => {
        isAuto = !isAuto;
        document.getElementById('btn-auto').classList.toggle('active', isAuto);
    };

    document.getElementById('btn-reset').onclick = () => {
        angleZW = 0; angleXW = 0; angleXYZ = 0;
        sZW.value = 0; sXW.value = 0; sXYZ.value = 0;
        isAuto = false;
        document.getElementById('btn-auto').classList.remove('active');
    };

    requestAnimationFrame(loop);
}

function resizeCanvas() {
    width = canvas.parentElement.clientWidth;
    height = canvas.parentElement.clientHeight;
    canvas.width = width;
    canvas.height = height;
}

// --- Render Loop ---

function loop() {
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, width, height);

    if (isAuto) {
        angleZW += 0.01;
        angleXW += 0.005;
        angleXYZ += 0.008;
        
        // Update UI sliders purely for visual feedback (optional)
        document.getElementById('angle-zw').value = angleZW % 6.28;
    }

    const projectedPoints = [];

    // Pre-calculate rotation matrices
    
    // 1. Rotate in 4D (ZW Plane)
    const zwCos = Math.cos(angleZW);
    const zwSin = Math.sin(angleZW);
    const matZW = [
        [1, 0, 0, 0],
        [0, 1, 0, 0],
        [0, 0, zwCos, -zwSin],
        [0, 0, zwSin, zwCos]
    ];

    // 2. Rotate in 4D (XW Plane)
    const xwCos = Math.cos(angleXW);
    const xwSin = Math.sin(angleXW);
    const matXW = [
        [xwCos, 0, 0, -xwSin],
        [0, 1, 0, 0],
        [0, 0, 1, 0],
        [xwSin, 0, 0, xwCos]
    ];

    // 3. Rotate in 3D (XY/XZ composite for simple spin)
    const rotCos = Math.cos(angleXYZ);
    const rotSin = Math.sin(angleXYZ);
    // Simple XZ rotation matrix
    const matXZ = [
        [rotCos, 0, -rotSin, 0],
        [0, 1, 0, 0],
        [rotSin, 0, rotCos, 0],
        [0, 0, 0, 1]
    ];

    // Process Points
    for (let p of points) {
        let v = p;
        
        // Apply 4D Rotations
        v = matMul(v, matZW);
        v = matMul(v, matXW);
        
        // 4D -> 3D Projection
        // w is the 4th dimension "distance"
        let distance = 3; // Camera distance from 4D object
        let w = 1 / (distance - v.w);
        
        const matProj4 = [
            [w, 0, 0, 0],
            [0, w, 0, 0],
            [0, 0, w, 0],
            [0, 0, 0, 0] // Flatten w
        ];
        
        v = matMul(v, matProj4); // Now v.w is 0, effective 3D

        // Apply 3D Rotation
        v = matMul(v, matXZ);

        // 3D -> 2D Projection (Stereographic)
        let z = 1 / (2 - v.z); // Standard 3D perspective z-divide
        const matProj3 = [
            [z, 0, 0, 0],
            [0, z, 0, 0],
            [0, 0, 0, 0],
            [0, 0, 0, 0]
        ];

        v = matMul(v, matProj3);
        
        // Scale to screen
        const scale = 300;
        projectedPoints.push({
            x: v.x * scale + width / 2,
            y: v.y * scale + height / 2,
            scale: w // Keep w scale factor for dot sizing
        });
    }

    // Connect Lines
    // In a hypercube, each vertex connects to 4 others (one per dimension)
    // We iterate points and connect if their index binary Hamming distance is 1
    ctx.strokeStyle = '#00ffcc';
    ctx.lineWidth = 1;

    for (let i = 0; i < 16; i++) {
        for (let j = i + 1; j < 16; j++) {
            // Check hamming distance (XOR and count bits)
            // If XOR result is power of 2, distance is 1
            const diff = i ^ j;
            if ((diff & (diff - 1)) === 0) { 
                const p1 = projectedPoints[i];
                const p2 = projectedPoints[j];
                
                // Opacity based on depth? Optional polish.
                ctx.beginPath();
                ctx.moveTo(p1.x, p1.y);
                ctx.lineTo(p2.x, p2.y);
                ctx.stroke();
            }
        }
    }

    // Draw Points
    for (let i = 0; i < projectedPoints.length; i++) {
        const p = projectedPoints[i];
        const r = 3 * p.scale + 2; // Size based on 4D depth 
        
        ctx.fillStyle = i < 8 ? '#ff0055' : '#00ffcc'; // Color inner vs outer set (initially)
        ctx.beginPath();
        ctx.arc(p.x, p.y, r, 0, Math.PI * 2);
        ctx.fill();
    }

    requestAnimationFrame(loop);
}

// Start
init();