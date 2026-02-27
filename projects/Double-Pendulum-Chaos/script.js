/**
 * Double Pendulum Chaos Engine
 * Solves equations of motion via Runge-Kutta 4th Order Integration (RK4).
 */

const canvas = document.getElementById('main-canvas');
const ctx = canvas.getContext('2d');
const trailCanvas = document.getElementById('trail-canvas');
const trailCtx = trailCanvas.getContext('2d');

// --- Physics Constants ---
let G = 1;
const DT = 0.2; // Time step (Simulation speed)
const MAX_TRAIL = 200; // Trail fade factor (not length)

// --- State ---
let width, height;
let cx, cy; // Center origin
let pendulums = []; // Array of Pendulum objects
let isDragging = false;
let dragTarget = null; // 1 or 2
let m1_val = 10, m2_val = 10;

// --- Physics Class ---

class Pendulum {
    constructor(theta1, theta2, m1, m2, l1, l2, color) {
        // State Vector: [theta1, omega1, theta2, omega2]
        this.s = [theta1, 0, theta2, 0];
        
        this.m1 = m1;
        this.m2 = m2;
        this.l1 = l1;
        this.l2 = l2;
        this.color = color;
        
        this.prevX = null;
        this.prevY = null;
    }

    // Lagrangian Equations of Motion
    // Returns derivatives [omega1, alpha1, omega2, alpha2]
    derivs(state) {
        const t1 = state[0];
        const w1 = state[1];
        const t2 = state[2];
        const w2 = state[3];
        
        const m1 = this.m1;
        const m2 = this.m2;
        const l1 = this.l1;
        const l2 = this.l2;
        const g = G;

        const delta = t1 - t2;
        const den = 2 * m1 + m2 - m2 * Math.cos(2 * t1 - 2 * t2);
        
        // Alpha 1
        const num1 = -g * (2 * m1 + m2) * Math.sin(t1) 
                     - m2 * g * Math.sin(t1 - 2 * t2) 
                     - 2 * Math.sin(delta) * m2 * (w2 * w2 * l2 + w1 * w1 * l1 * Math.cos(delta));
        const a1 = num1 / (l1 * den);

        // Alpha 2
        const num2 = 2 * Math.sin(delta) * (w1 * w1 * l1 * (m1 + m2) + g * (m1 + m2) * Math.cos(t1) + w2 * w2 * l2 * m2 * Math.cos(delta));
        const a2 = num2 / (l2 * den);

        return [w1, a1, w2, a2];
    }

    // Runge-Kutta 4 Integration
    update() {
        const state = this.s;
        
        // k1
        const k1 = this.derivs(state);
        
        // k2
        const s2 = state.map((val, i) => val + k1[i] * DT * 0.5);
        const k2 = this.derivs(s2);
        
        // k3
        const s3 = state.map((val, i) => val + k2[i] * DT * 0.5);
        const k3 = this.derivs(s3);
        
        // k4
        const s4 = state.map((val, i) => val + k3[i] * DT);
        const k4 = this.derivs(s4);
        
        // Combine
        this.s = state.map((val, i) => val + (k1[i] + 2*k2[i] + 2*k3[i] + k4[i]) * DT / 6);
        
        // Dampening (optional for stability, but chaos implies no dampening usually)
        // this.s[1] *= 0.999;
        // this.s[3] *= 0.999;
    }

    getCoords() {
        const t1 = this.s[0];
        const t2 = this.s[2];
        
        const x1 = cx + this.l1 * Math.sin(t1);
        const y1 = cy + this.l1 * Math.cos(t1);
        
        const x2 = x1 + this.l2 * Math.sin(t2);
        const y2 = y1 + this.l2 * Math.cos(t2);
        
        return { x1, y1, x2, y2 };
    }
    
    // Total Energy (KE + PE)
    getEnergy() {
        // Just for visualization relative value
        // Kinetic
        const v1sq = (this.l1 * this.s[1])**2; 
        // Approx v2 for display... physics is complex
        // Let's just sum angular kinetic energy roughly
        const KE = 0.5 * this.m1 * v1sq + 0.5 * this.m2 * (this.l2 * this.s[3])**2; 
        
        // Potential (y is down, so PE is negative of y)
        const PE = -(this.m1 * G * this.l1 * Math.cos(this.s[0]) + this.m2 * G * (this.l1 * Math.cos(this.s[0]) + this.l2 * Math.cos(this.s[2])));
        
        return KE + PE + 5000; // Offset for bar display
    }
}

// --- Initialization ---

function init() {
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
    
    // Controls
    document.getElementById('m1-slider').oninput = e => updateMasses(e.target.value, null);
    document.getElementById('m2-slider').oninput = e => updateMasses(null, e.target.value);
    document.getElementById('g-slider').oninput = e => G = parseFloat(e.target.value);
    
    document.getElementById('btn-reset').onclick = resetSim;
    document.getElementById('btn-butterfly').onclick = triggerButterfly;
    
    resetSim();
    loop();
}

function resizeCanvas() {
    width = canvas.parentElement.clientWidth;
    height = canvas.parentElement.clientHeight;
    
    canvas.width = width;
    canvas.height = height;
    trailCanvas.width = width;
    trailCanvas.height = height;
    
    cx = width / 2;
    cy = height / 3;
    
    // Clear trail on resize
    trailCtx.fillStyle = '#050505';
    trailCtx.fillRect(0,0,width,height);
}

function updateMasses(m1, m2) {
    if(m1) m1_val = parseInt(m1);
    if(m2) m2_val = parseInt(m2);
    pendulums.forEach(p => {
        p.m1 = m1_val;
        p.m2 = m2_val;
    });
}

function resetSim() {
    pendulums = [];
    trailCtx.clearRect(0, 0, width, height);
    
    // Initial State: Almost straight up (unstable equilibrium)
    const p = new Pendulum(Math.PI - 0.1, Math.PI - 0.1, m1_val, m2_val, 150, 150, '#00d2ff');
    pendulums.push(p);
}

function triggerButterfly() {
    pendulums = [];
    trailCtx.clearRect(0, 0, width, height);
    
    // Standard
    const p1 = new Pendulum(Math.PI / 2, Math.PI / 2, m1_val, m2_val, 150, 150, '#00d2ff');
    
    // Perturbed (0.01 radian difference)
    const p2 = new Pendulum(Math.PI / 2 + 0.001, Math.PI / 2, m1_val, m2_val, 150, 150, '#ff0055');
    
    pendulums.push(p1);
    pendulums.push(p2);
}

// --- Loop ---

function loop() {
    ctx.clearRect(0, 0, width, height);
    
    // Fade trail slightly
    if (document.getElementById('chk-trace').checked) {
        trailCtx.fillStyle = 'rgba(5, 5, 5, 0.05)';
        trailCtx.fillRect(0, 0, width, height);
    } else {
        trailCtx.clearRect(0, 0, width, height);
    }

    let totalEnergy = 0;

    pendulums.forEach((p, index) => {
        // Physics Steps (Sub-stepping for smoothness)
        for(let i=0; i<5; i++) p.update();
        
        // Draw
        const c = p.getCoords();
        
        // Arms
        ctx.strokeStyle = p.color; // 'rgba(255,255,255,0.5)';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(cx, cy);
        ctx.lineTo(c.x1, c.y1);
        ctx.lineTo(c.x2, c.y2);
        ctx.stroke();
        
        // Masses
        ctx.fillStyle = '#fff';
        ctx.beginPath();
        ctx.arc(c.x1, c.y1, p.m1/2, 0, Math.PI*2); // Scale radius by mass
        ctx.arc(c.x2, c.y2, p.m2/2, 0, Math.PI*2);
        ctx.fill();
        
        // Trace on Trail Canvas
        if (p.prevX !== null) {
            trailCtx.beginPath();
            trailCtx.moveTo(p.prevX, p.prevY);
            trailCtx.lineTo(c.x2, c.y2);
            trailCtx.strokeStyle = p.color;
            trailCtx.lineWidth = 1;
            trailCtx.stroke();
        }
        
        p.prevX = c.x2;
        p.prevY = c.y2;
        
        if (index === 0) totalEnergy = p.getEnergy();
    });

    // Update Energy UI
    // Normalize roughly for visual
    const barWidth = Math.min(100, Math.max(0, totalEnergy / 100));
    document.getElementById('energy-bar').style.width = barWidth + '%';

    requestAnimationFrame(loop);
}

// Start
init();