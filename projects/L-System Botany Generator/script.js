/**
 * L-System Engine
 * Handles string expansion and Turtle Graphics rendering.
 */

const canvas = document.getElementById('gen-canvas');
const ctx = canvas.getContext('2d');

// --- State ---
let width, height;
let lString = "";
let transform = { x: 0, y: 0, scale: 1, isDragging: false, lastX: 0, lastY: 0 };

// Presets
const PRESETS = {
    tree: {
        axiom: "X",
        rules: "X->F+[[X]-X]-F[-FX]+X\nF->FF",
        angle: 25,
        iter: 4,
        len: 10
    },
    fern: {
        axiom: "X",
        rules: "X->F+[[X]-X]-F[-FX]+X\nF->FF", // Basic variation
        angle: 25,
        iter: 5,
        len: 5
    },
    dragon: {
        axiom: "FX",
        rules: "X->X+YF+\nY->-FX-Y",
        angle: 90,
        iter: 10,
        len: 10
    },
    plant: {
        axiom: "X",
        rules: "X->F-[[X]+X]+F[+FX]-X\nF->FF",
        angle: 22.5,
        iter: 5,
        len: 6
    },
    sierpinski: {
        axiom: "F-G-G",
        rules: "F->F-G+F+G-F\nG->GG",
        angle: 120,
        iter: 5,
        len: 8
    }
};

// --- Init ---

function init() {
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
    setupInput();
    loadPreset(); // Load default
}

function resizeCanvas() {
    width = canvas.parentElement.clientWidth;
    height = canvas.parentElement.clientHeight;
    canvas.width = width;
    canvas.height = height;
    
    // Center initially
    transform.x = width / 2;
    transform.y = height * 0.9;
    
    if(lString) draw();
}

function loadPreset() {
    const key = document.getElementById('preset-select').value;
    const p = PRESETS[key];
    
    document.getElementById('axiom-input').value = p.axiom;
    document.getElementById('rules-input').value = p.rules;
    document.getElementById('iter-slider').value = p.iter;
    document.getElementById('angle-slider').value = p.angle;
    document.getElementById('len-slider').value = p.len;
    
    updateLabels();
    generate();
}

function updateLabels() {
    document.getElementById('iter-val').innerText = document.getElementById('iter-slider').value;
    document.getElementById('angle-val').innerText = document.getElementById('angle-slider').value + "°";
}

// --- L-System Logic ---

function generate() {
    const axiom = document.getElementById('axiom-input').value;
    const rulesText = document.getElementById('rules-input').value;
    const iterations = parseInt(document.getElementById('iter-slider').value);
    
    // Parse Rules
    const rules = {};
    rulesText.split('\n').forEach(line => {
        const parts = line.split('->');
        if (parts.length === 2) {
            rules[parts[0].trim()] = parts[1].trim();
        }
    });
    
    // Expand String
    let current = axiom;
    for (let i = 0; i < iterations; i++) {
        let next = "";
        for (let char of current) {
            next += rules[char] || char;
        }
        current = next;
    }
    
    lString = current;
    document.getElementById('str-len').innerText = lString.length.toLocaleString();
    
    // Auto-center?
    // transform.x = width/2;
    // transform.y = height;
    
    draw();
}

// --- Rendering (Turtle Graphics) ---

function draw() {
    ctx.clearRect(0, 0, width, height);
    
    ctx.save();
    ctx.translate(transform.x, transform.y);
    ctx.scale(transform.scale, transform.scale);
    
    // Default Turtle State
    // In Canvas, Y is down. Standard L-Systems assume Y is up.
    // We rotate -90 deg to point Up.
    ctx.rotate(-Math.PI); 
    
    const angleDeg = parseFloat(document.getElementById('angle-slider').value);
    const angleRad = (angleDeg * Math.PI) / 180;
    const len = parseFloat(document.getElementById('len-slider').value);
    
    ctx.beginPath();
    ctx.strokeStyle = '#4caf50';
    ctx.lineWidth = 1;
    ctx.lineCap = 'round';
    
    // If we stroke every line, it's slow. Batch paths.
    // Stack for branching
    // We can't use ctx.save()/restore() for EVERY bracket because stack depth limits.
    // We maintain our own simple coordinate stack.
    
    /* Actually, standard recursive L-system can be implemented iteratively.
       We need to track: X, Y, Angle.
    */
    
    const stack = [];
    
    // Since we are inside a path, we can't easily jump around without moveTo.
    // Better strategy: Use ctx transform for position? No, too many calls.
    // Best: Calculate coords manually.
    
    let x = 0;
    let y = 0;
    let dir = 0; // Pointing "Up" (which is actually down in our rotated context, wait...)
    // We rotated PI (180). So 0,0 is origin.
    // Let's just say 0 rad is "Forward".
    
    ctx.moveTo(0, 0);
    
    for (let char of lString) {
        if (char === 'F' || char === 'G') {
            // Move Forward
            const nx = x + Math.sin(dir) * len; // Trig might depend on orientation
            const ny = y + Math.cos(dir) * len;
            ctx.lineTo(nx, ny);
            x = nx;
            y = ny;
        } else if (char === '+') {
            dir -= angleRad; // Turn Right
        } else if (char === '-') {
            dir += angleRad; // Turn Left
        } else if (char === '[') {
            stack.push({ x, y, dir });
        } else if (char === ']') {
            if (stack.length > 0) {
                const state = stack.pop();
                x = state.x;
                y = state.y;
                dir = state.dir;
                ctx.moveTo(x, y); // Lift pen
            }
        }
    }
    
    ctx.stroke();
    ctx.restore();
}

// --- Inputs / Interaction ---

function setupInput() {
    ['iter-slider', 'angle-slider', 'len-slider'].forEach(id => {
        document.getElementById(id).addEventListener('input', () => {
            updateLabels();
            draw(); // Realtime update for sliders (except iter if heavy)
        });
        // For iter, update only on change to prevent lag
        if(id === 'iter-slider') {
            document.getElementById(id).addEventListener('change', generate);
        }
    });

    // Pan/Zoom
    canvas.addEventListener('mousedown', e => {
        transform.isDragging = true;
        transform.lastX = e.clientX;
        transform.lastY = e.clientY;
    });
    
    window.addEventListener('mousemove', e => {
        if (transform.isDragging) {
            const dx = e.clientX - transform.lastX;
            const dy = e.clientY - transform.lastY;
            transform.x += dx;
            transform.y += dy;
            transform.lastX = e.clientX;
            transform.lastY = e.clientY;
            draw();
        }
    });
    
    window.addEventListener('mouseup', () => transform.isDragging = false);
    
    canvas.addEventListener('wheel', e => {
        e.preventDefault();
        const zoom = e.deltaY < 0 ? 1.1 : 0.9;
        transform.scale *= zoom;
        draw();
    });
}

// Start
init();