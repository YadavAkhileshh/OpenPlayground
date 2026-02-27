/**
 * Marching Squares Engine
 * Generates scalar field using Perlin Noise and contours it.
 */

const canvas = document.getElementById('map-canvas');
const ctx = canvas.getContext('2d');

// --- Config ---
let RES = 20; // Grid Resolution
let NOISE_SCALE = 40;
let THRESHOLD = 0.5;

// --- State ---
let width, height;
let cols, rows;
let field = []; // 2D array of noise values (0-1)
let noiseOffset = {x: 0, y: 0};

// --- Perlin Noise Implementation (Simplified) ---
// Based on standard implementation
const perm = [];
for(let i=0; i<256; i++) perm.push(i);
for(let i=0; i<256; i++) {
    const r = Math.floor(Math.random()*256);
    [perm[i], perm[r]] = [perm[r], perm[i]];
}
const p = new Array(512);
for(let i=0; i<512; i++) p[i] = perm[i & 255];

function fade(t) { return t * t * t * (t * (t * 6 - 15) + 10); }
function lerp(t, a, b) { return a + t * (b - a); }
function grad(hash, x, y, z) {
    const h = hash & 15;
    const u = h < 8 ? x : y;
    const v = h < 4 ? y : h === 12 || h === 14 ? x : z;
    return ((h & 1) === 0 ? u : -u) + ((h & 2) === 0 ? v : -v);
}

function noise(x, y, z) {
    const X = Math.floor(x) & 255;
    const Y = Math.floor(y) & 255;
    const Z = Math.floor(z) & 255;
    x -= Math.floor(x);
    y -= Math.floor(y);
    z -= Math.floor(z);
    const u = fade(x);
    const v = fade(y);
    const w = fade(z);
    const A = p[X]+Y, AA = p[A]+Z, AB = p[A+1]+Z;
    const B = p[X+1]+Y, BA = p[B]+Z, BB = p[B+1]+Z;

    return lerp(w, lerp(v, lerp(u, grad(p[AA], x, y, z), grad(p[BA], x-1, y, z)),
                           lerp(u, grad(p[AB], x, y-1, z), grad(p[BB], x-1, y-1, z))),
                   lerp(v, lerp(u, grad(p[AA+1], x, y, z-1), grad(p[BA+1], x-1, y, z-1)),
                           lerp(u, grad(p[AB+1], x, y-1, z-1), grad(p[BB+1], x-1, y-1, z-1))));
}

// --- Terrain Generation ---

function init() {
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
    
    // Controls
    document.getElementById('btn-regen').onclick = generateMap;
    document.getElementById('threshold-slider').oninput = e => {
        THRESHOLD = parseFloat(e.target.value);
        document.getElementById('threshold-val').innerText = THRESHOLD.toFixed(2);
        draw();
    };
    document.getElementById('scale-slider').oninput = e => {
        NOISE_SCALE = parseInt(e.target.value);
        generateMap();
    };
    document.getElementById('res-select').onchange = e => {
        RES = parseInt(e.target.value);
        resizeCanvas();
    };
    
    ['chk-lerp', 'chk-grid', 'chk-fill'].forEach(id => {
        document.getElementById(id).onchange = draw;
    });

    generateMap();
}

function resizeCanvas() {
    width = canvas.parentElement.clientWidth;
    height = canvas.parentElement.clientHeight;
    canvas.width = width;
    canvas.height = height;
    
    cols = Math.ceil(width / RES) + 1;
    rows = Math.ceil(height / RES) + 1;
    
    generateMap();
}

function generateMap() {
    field = [];
    noiseOffset.x = Math.random() * 1000;
    noiseOffset.y = Math.random() * 1000;

    for (let i = 0; i < cols; i++) {
        field[i] = [];
        for (let j = 0; j < rows; j++) {
            // Normalize inputs
            const nVal = noise(
                (i + noiseOffset.x) / (NOISE_SCALE/2), 
                (j + noiseOffset.y) / (NOISE_SCALE/2), 
                0
            );
            // Map -1..1 to 0..1
            field[i][j] = (nVal + 1) / 2;
        }
    }
    draw();
}

// --- Marching Squares Logic ---

function getState(val1, val2, val3, val4) {
    // Binary conversion: Is value above threshold?
    // TL (8), TR (4), BR (2), BL (1)
    return (val1 > THRESHOLD ? 8 : 0) + 
           (val2 > THRESHOLD ? 4 : 0) + 
           (val3 > THRESHOLD ? 2 : 0) + 
           (val4 > THRESHOLD ? 1 : 0);
}

function draw() {
    ctx.clearRect(0, 0, width, height);

    const useLerp = document.getElementById('chk-lerp').checked;
    const showGrid = document.getElementById('chk-grid').checked;
    const fillTerrain = document.getElementById('chk-fill').checked;

    // 1. Draw Grid Points (Optional)
    if (showGrid) {
        ctx.fillStyle = '#aaa';
        for (let i = 0; i < cols; i++) {
            for (let j = 0; j < rows; j++) {
                const val = field[i][j];
                ctx.globalAlpha = val > THRESHOLD ? 1.0 : 0.2;
                ctx.fillStyle = val > THRESHOLD ? '#22c55e' : '#334155';
                ctx.beginPath();
                ctx.arc(i * RES, j * RES, 2, 0, Math.PI * 2);
                ctx.fill();
            }
        }
        ctx.globalAlpha = 1.0;
    }

    // 2. Marching Squares Loop
    for (let i = 0; i < cols - 1; i++) {
        for (let j = 0; j < rows - 1; j++) {
            const x = i * RES;
            const y = j * RES;
            
            // Corner Values
            const v1 = field[i][j];     // TL
            const v2 = field[i+1][j];   // TR
            const v3 = field[i+1][j+1]; // BR
            const v4 = field[i][j+1];   // BL
            
            const state = getState(v1, v2, v3, v4);
            
            // Calculate edge points (Linear Interpolation)
            // Midpoints (0.5) if lerp is off
            
            // Top Edge (between TL & TR)
            const a = new Point(
                x + RES * (useLerp ? (THRESHOLD - v1) / (v2 - v1) : 0.5), 
                y
            );
            // Right Edge (between TR & BR)
            const b = new Point(
                x + RES, 
                y + RES * (useLerp ? (THRESHOLD - v2) / (v3 - v2) : 0.5)
            );
            // Bottom Edge (between BR & BL)
            const c = new Point(
                x + RES * (useLerp ? (THRESHOLD - v4) / (v3 - v4) : 0.5), // v4 to v3 interp
                y + RES
            );
            // Left Edge (between BL & TL)
            const d = new Point(
                x, 
                y + RES * (useLerp ? (THRESHOLD - v1) / (v4 - v1) : 0.5)
            );

            // Draw Lines
            ctx.strokeStyle = '#38bdf8'; // Coastline color
            ctx.lineWidth = 2;
            ctx.beginPath();
            
            switch (state) {
                case 1:  drawLine(c, d); break;
                case 2:  drawLine(b, c); break;
                case 3:  drawLine(b, d); break;
                case 4:  drawLine(a, b); break;
                case 5:  drawLine(a, d); drawLine(b, c); break;
                case 6:  drawLine(a, c); break;
                case 7:  drawLine(a, d); break;
                case 8:  drawLine(a, d); break;
                case 9:  drawLine(a, c); break;
                case 10: drawLine(a, b); drawLine(c, d); break;
                case 11: drawLine(a, b); break;
                case 12: drawLine(b, d); break;
                case 13: drawLine(b, c); break;
                case 14: drawLine(c, d); break;
            }
            ctx.stroke();

            // Fill (Approximation using polygons)
            if (fillTerrain) {
                ctx.fillStyle = '#22c55e'; // Land
                ctx.beginPath();
                // To fill correctly, we need to connect corner points to the intersection points
                // TL=8, TR=4, BR=2, BL=1
                // Corners: (x,y), (x+res, y), (x+res, y+res), (x, y+res)
                const tl = {x:x, y:y};
                const tr = {x:x+RES, y:y};
                const br = {x:x+RES, y:y+RES};
                const bl = {x:x, y:y+RES};

                switch (state) {
                    case 1: drawPoly([c, d, bl]); break;
                    case 2: drawPoly([b, c, br]); break;
                    case 3: drawPoly([b, d, bl, br]); break;
                    case 4: drawPoly([a, b, tr]); break;
                    case 5: drawPoly([a, d, bl, tl]); drawPoly([b, c, br]); break; // Saddle
                    case 6: drawPoly([a, c, br, tr]); break;
                    case 7: drawPoly([a, d, bl, br, tr]); break;
                    case 8: drawPoly([a, d, tl]); break;
                    case 9: drawPoly([a, c, bl, tl]); break;
                    case 10: drawPoly([a, b, tr, tl]); drawPoly([c, d, bl, br]); break; // Saddle
                    case 11: drawPoly([a, b, tr, br, bl]); break;
                    case 12: drawPoly([b, d, tl, tr]); break; // Except BR
                    case 13: drawPoly([b, c, bl, tl, tr]); break; // Except BL
                    case 14: drawPoly([c, d, tl, tr, br]); break; // Except TL
                    case 15: ctx.fillRect(x, y, RES+1, RES+1); break; // All Land
                }
                ctx.fill();
            }
        }
    }
}

function drawLine(p1, p2) {
    ctx.moveTo(p1.x, p1.y);
    ctx.lineTo(p2.x, p2.y);
}

function drawPoly(points) {
    if (points.length < 3) return;
    ctx.moveTo(points[0].x, points[0].y);
    for (let i = 1; i < points.length; i++) {
        ctx.lineTo(points[i].x, points[i].y);
    }
    ctx.closePath();
}

class Point {
    constructor(x, y) { this.x = x; this.y = y; }
}

// Start
init();