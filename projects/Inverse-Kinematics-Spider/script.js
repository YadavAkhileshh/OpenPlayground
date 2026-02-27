/**
 * Procedural IK Spider Engine
 * Uses Inverse Kinematics to calculate leg positions.
 */

const canvas = document.getElementById('ik-canvas');
const ctx = canvas.getContext('2d');

// --- Config ---
let LEG_COUNT = 8;
const SEGMENT_LEN = 60;
const BODY_RADIUS = 40;
let STEP_HEIGHT = 40;
const SPEED = 4;

// --- State ---
let width, height;
let mouse = { x: 0, y: 0 };
let spider = {
    x: 0, y: 0,
    angle: 0,
    legs: []
};
let frameCount = 0;
let autoWander = true;

// --- Math Helpers ---

function dist(p1, p2) {
    return Math.sqrt((p1.x - p2.x)**2 + (p1.y - p2.y)**2);
}

// Simple 2-Bone IK Solver (Law of Cosines / Circle Intersection)
// Returns the joint position (knee)
function solveIK(root, target, len1, len2, flip) {
    const d = dist(root, target);
    const angleToTarget = Math.atan2(target.y - root.y, target.x - root.x);
    
    // Cannot reach
    if (d >= len1 + len2) {
        return {
            x: root.x + Math.cos(angleToTarget) * len1,
            y: root.y + Math.sin(angleToTarget) * len1
        };
    }

    // Law of Cosines
    // c^2 = a^2 + b^2 - 2ab cos(C)
    // We want angle at Root (A)
    const cosAngle = (d*d + len1*len1 - len2*len2) / (2 * d * len1);
    const angle = Math.acos(Math.max(-1, Math.min(1, cosAngle)));
    
    const kneeAngle = flip ? angleToTarget + angle : angleToTarget - angle;
    
    return {
        x: root.x + Math.cos(kneeAngle) * len1,
        y: root.y + Math.sin(kneeAngle) * len1
    };
}

class Leg {
    constructor(id, offsetAngle) {
        this.id = id;
        this.offsetAngle = offsetAngle; // Angle relative to body
        this.foot = { x: 0, y: 0 }; // Current foot pos (on ground)
        this.target = { x: 0, y: 0 }; // Where foot WANTS to be
        
        // Animation
        this.isMoving = false;
        this.startStep = { x: 0, y: 0 };
        this.stepProgress = 0;
        
        // Init
        this.foot.x = spider.x + Math.cos(spider.angle + this.offsetAngle) * 150;
        this.foot.y = spider.y + Math.sin(spider.angle + this.offsetAngle) * 150;
    }

    update() {
        // 1. Calculate Ideal Position (Home)
        // Where the foot should be if the spider was standing still
        const idealDist = 140;
        const idealX = spider.x + Math.cos(spider.angle + this.offsetAngle) * idealDist;
        const idealY = spider.y + Math.sin(spider.angle + this.offsetAngle) * idealDist;
        
        // 2. Check distance to current foot pos
        const d = dist(this.foot, {x: idealX, y: idealY});
        
        // 3. Trigger Step?
        // Only if dist is too large AND not currently moving
        // AND neighbor legs are planted (Gait logic)
        if (d > 100 && !this.isMoving) {
            // Check neighbors (simple parity check for alternating gait)
            const parity = this.id % 2;
            const globalParity = Math.floor(Date.now() / 300) % 2; // Time based gate
            
            // Allow stepping if it's my turn OR really stretched
            if (d > 180 || true) { // Simplified gait for responsiveness
                this.step(idealX, idealY);
            }
        }

        // 4. Animate Step
        if (this.isMoving) {
            this.stepProgress += 0.1; // Step speed
            
            if (this.stepProgress >= 1) {
                this.stepProgress = 1;
                this.isMoving = false;
                this.foot.x = this.target.x;
                this.foot.y = this.target.y;
            } else {
                // Lerp X, Y
                this.foot.x = this.startStep.x + (this.target.x - this.startStep.x) * this.stepProgress;
                this.foot.y = this.startStep.y + (this.target.y - this.startStep.y) * this.stepProgress;
                
                // Lift Z (Visual Y offset) is handled in draw
            }
        }
    }
    
    step(tx, ty) {
        // Add some "prediction" based on spider velocity
        // (Not implemented here for simplicity, but makes it smoother)
        this.startStep = { ...this.foot };
        this.target = { x: tx, y: ty };
        this.isMoving = true;
        this.stepProgress = 0;
    }

    draw() {
        const root = {
            x: spider.x + Math.cos(spider.angle + this.offsetAngle) * BODY_RADIUS,
            y: spider.y + Math.sin(spider.angle + this.offsetAngle) * BODY_RADIUS
        };

        // Current visual foot pos (apply Z lift)
        let vizFoot = { ...this.foot };
        if (this.isMoving) {
            // Parabola height for step
            const h = Math.sin(this.stepProgress * Math.PI) * STEP_HEIGHT;
            // Shift Y visually to look like "Up" in top-down (y-axis is ambiguous, usually we scale shadow)
            // But let's just shift Y up (negative) to look like a jump
            vizFoot.y -= h; 
        }

        // IK Solve for Knee
        // Flip knee direction based on side
        const flip = this.offsetAngle > 0 && this.offsetAngle < Math.PI;
        const knee = solveIK(root, vizFoot, SEGMENT_LEN, SEGMENT_LEN + 20, flip);

        const debug = document.getElementById('chk-debug').checked;
        
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';

        // Draw Leg Segments
        ctx.strokeStyle = '#94a3b8';
        ctx.lineWidth = 6;
        ctx.beginPath();
        ctx.moveTo(root.x, root.y);
        ctx.lineTo(knee.x, knee.y);
        ctx.lineTo(vizFoot.x, vizFoot.y);
        ctx.stroke();

        // Draw Joints
        if (debug) {
            ctx.fillStyle = '#38bdf8';
            [root, knee, vizFoot].forEach(p => {
                ctx.beginPath(); ctx.arc(p.x, p.y, 4, 0, Math.PI*2); ctx.fill();
            });
        }
        
        // Draw Foot Tip
        ctx.fillStyle = '#fff';
        ctx.beginPath(); 
        ctx.arc(vizFoot.x, vizFoot.y, 3, 0, Math.PI*2); 
        ctx.fill();
    }
}

// --- Init ---

function init() {
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
    setupInput();
    
    resetSpider();
    
    // UI Listeners
    document.getElementById('leg-slider').oninput = (e) => {
        LEG_COUNT = parseInt(e.target.value);
        document.getElementById('leg-val').innerText = LEG_COUNT;
        resetSpider();
    };
    document.getElementById('step-slider').oninput = (e) => STEP_HEIGHT = parseInt(e.target.value);
    document.getElementById('chk-auto').onchange = (e) => autoWander = e.target.checked;
    
    loop();
}

function resizeCanvas() {
    width = canvas.parentElement.clientWidth;
    height = canvas.parentElement.clientHeight;
    canvas.width = width;
    canvas.height = height;
    mouse.x = width / 2;
    mouse.y = height / 2;
}

function resetSpider() {
    spider.x = width / 2;
    spider.y = height / 2;
    spider.legs = [];
    
    // Generate Legs
    for (let i = 0; i < LEG_COUNT; i++) {
        // Distribute angles around body
        // Gap in front?
        let angle = (i / LEG_COUNT) * Math.PI * 2;
        spider.legs.push(new Leg(i, angle));
    }
}

// --- Loop ---

function update() {
    frameCount++;

    // 1. Move Body
    let targetX = mouse.x;
    let targetY = mouse.y;

    if (autoWander) {
        targetX = width/2 + Math.cos(frameCount * 0.01) * 300;
        targetY = height/2 + Math.sin(frameCount * 0.013) * 200;
    }

    const dx = targetX - spider.x;
    const dy = targetY - spider.y;
    const distToTarget = Math.sqrt(dx*dx + dy*dy);
    
    if (distToTarget > 5) {
        const moveX = (dx / distToTarget) * SPEED;
        const moveY = (dy / distToTarget) * SPEED;
        spider.x += moveX;
        spider.y += moveY;
        
        // Rotate body towards movement
        const targetAngle = Math.atan2(dy, dx);
        // Lerp angle
        let angleDiff = targetAngle - spider.angle;
        // Normalize -PI to PI
        while (angleDiff > Math.PI) angleDiff -= Math.PI*2;
        while (angleDiff < -Math.PI) angleDiff += Math.PI*2;
        
        spider.angle += angleDiff * 0.05;
    }

    // 2. Update Legs
    spider.legs.forEach(leg => leg.update());
}

function draw() {
    ctx.clearRect(0, 0, width, height);

    // Draw Legs (Order by Y to fake depth?)
    // No, just draw all.
    spider.legs.forEach(leg => leg.draw());

    // Draw Body
    ctx.save();
    ctx.translate(spider.x, spider.y);
    ctx.rotate(spider.angle);
    
    ctx.fillStyle = '#1e293b';
    ctx.strokeStyle = '#38bdf8';
    ctx.lineWidth = 3;
    
    // Main Hull
    ctx.beginPath();
    ctx.ellipse(0, 0, BODY_RADIUS + 10, BODY_RADIUS, 0, 0, Math.PI*2);
    ctx.fill();
    ctx.stroke();
    
    // Head / Eyes
    ctx.fillStyle = '#38bdf8';
    ctx.beginPath();
    ctx.arc(BODY_RADIUS, -10, 5, 0, Math.PI*2);
    ctx.arc(BODY_RADIUS, 10, 5, 0, Math.PI*2);
    ctx.fill();
    
    ctx.restore();
    
    // Target Cursor
    if (!autoWander) {
        ctx.strokeStyle = 'rgba(56, 189, 248, 0.5)';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(mouse.x, mouse.y, 20, 0, Math.PI*2);
        ctx.stroke();
    }
}

function setupInput() {
    window.addEventListener('mousemove', e => {
        const rect = canvas.getBoundingClientRect();
        mouse.x = e.clientX - rect.left;
        mouse.y = e.clientY - rect.top;
        if(autoWander) {
            document.getElementById('chk-auto').checked = false;
            autoWander = false;
        }
    });
    
    window.addEventListener('mousedown', () => {
        // Stomp effect (reset legs)
        spider.legs.forEach(l => {
            l.target.x += (Math.random()-0.5)*50;
            l.target.y += (Math.random()-0.5)*50;
            l.isMoving = true;
        });
    });
}

function loop() {
    update();
    draw();
    requestAnimationFrame(loop);
}

// Start
init();