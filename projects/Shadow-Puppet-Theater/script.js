/**
 * Shadow Puppet Theater Engine
 * Uses an off-screen canvas to cut out light gradients and cast exact polygonal shadows.
 */

const canvas = document.getElementById('theater-canvas');
const ctx = canvas.getContext('2d');

// Off-screen canvas for lighting mask calculation
const lightCanvas = document.createElement('canvas');
const lightCtx = lightCanvas.getContext('2d');

// --- Config & State ---
let width, height;
const AMBIENT_DARKNESS = 'rgba(10, 8, 5, 0.9)'; // The color of the unlit room
let lightRadius = 350;

let lightSource = { x: 0, y: 0, isDragging: false };
let puppets = [];
let draggedPuppet = null;
let dragOffset = { x: 0, y: 0 };

// --- Entity Classes ---

class Puppet {
    constructor(x, y, shapeType) {
        this.x = x;
        this.y = y;
        this.shapeType = shapeType;
        this.vertices = this.generateShape(shapeType);
        this.scale = 1.0;
        this.angle = (Math.random() - 0.5) * 0.5; // Slight random rotation
    }

    generateShape(type) {
        if (type === 'cube') {
            return [
                {x: -30, y: -30}, {x: 30, y: -30},
                {x: 30, y: 30}, {x: -30, y: 30}
            ];
        } else if (type === 'bird') {
            return [
                {x: 40, y: 0}, {x: 10, y: -10}, {x: -30, y: -40}, 
                {x: -10, y: 0}, {x: -40, y: 10}, {x: -10, y: 20}, 
                {x: 20, y: 30}
            ];
        }
        return [];
    }

    // Returns world-space vertices for shadow casting
    getVertices() {
        const cos = Math.cos(this.angle);
        const sin = Math.sin(this.angle);
        return this.vertices.map(v => ({
            x: this.x + (v.x * cos - v.y * sin) * this.scale,
            y: this.y + (v.x * sin + v.y * cos) * this.scale
        }));
    }
}

// --- Init ---

function init() {
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
    setupInput();

    // Setup initial scene
    lightSource.x = width / 2;
    lightSource.y = height / 2 + 100;
    
    puppets.push(new Puppet(width / 2 - 100, height / 2 - 50, 'bird'));
    puppets.push(new Puppet(width / 2 + 150, height / 2 + 50, 'cube'));

    loop();
}

function resizeCanvas() {
    width = canvas.parentElement.clientWidth;
    height = canvas.parentElement.clientHeight;
    
    canvas.width = width;
    canvas.height = height;
    
    lightCanvas.width = width;
    lightCanvas.height = height;
}

// --- Logic & Rendering ---

// Exposed to UI Button
window.addPuppet = function(type) {
    const x = width / 2 + (Math.random() - 0.5) * 200;
    const y = height / 2 + (Math.random() - 0.5) * 200;
    puppets.push(new Puppet(x, y, type));
};

function drawScene() {
    ctx.clearRect(0, 0, width, height);

    // 1. Calculate and Draw the Lighting Mask 
    
    // Fill mask with darkness
    lightCtx.globalCompositeOperation = 'source-over';
    lightCtx.fillStyle = AMBIENT_DARKNESS;
    lightCtx.fillRect(0, 0, width, height);

    // "Punch out" the light hole
    lightCtx.globalCompositeOperation = 'destination-out';
    const gradient = lightCtx.createRadialGradient(
        lightSource.x, lightSource.y, 0,
        lightSource.x, lightSource.y, lightRadius
    );
    gradient.addColorStop(0, 'rgba(255, 255, 255, 1)');
    gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
    
    lightCtx.fillStyle = gradient;
    lightCtx.beginPath();
    lightCtx.arc(lightSource.x, lightSource.y, lightRadius, 0, Math.PI * 2);
    lightCtx.fill();

    // Draw Shadows (Cover up the light hole where geometry blocks it)
    // 
    lightCtx.globalCompositeOperation = 'source-over';
    lightCtx.fillStyle = AMBIENT_DARKNESS;

    puppets.forEach(puppet => {
        const verts = puppet.getVertices();
        for (let i = 0; i < verts.length; i++) {
            const p1 = verts[i];
            const p2 = verts[(i + 1) % verts.length];

            // Calculate projection vectors away from the light
            const dx1 = p1.x - lightSource.x;
            const dy1 = p1.y - lightSource.y;
            const dx2 = p2.x - lightSource.x;
            const dy2 = p2.y - lightSource.y;

            // Project endpoints far outside the screen bounds
            const ext = 100; // Multiplier for projection distance
            const far1 = { x: p1.x + dx1 * ext, y: p1.y + dy1 * ext };
            const far2 = { x: p2.x + dx2 * ext, y: p2.y + dy2 * ext };

            // Draw the shadow quadrilateral
            lightCtx.beginPath();
            lightCtx.moveTo(p1.x, p1.y);
            lightCtx.lineTo(far1.x, far1.y);
            lightCtx.lineTo(far2.x, far2.y);
            lightCtx.lineTo(p2.x, p2.y);
            lightCtx.closePath();
            lightCtx.fill();
        }
    });

    // 2. Composite the mask onto the main canvas
    ctx.drawImage(lightCanvas, 0, 0);

    // 3. Draw the actual physical Puppets (Silhouettes)
    ctx.fillStyle = '#0a0a0a'; // Solid blackish
    ctx.strokeStyle = '#1a1a1a';
    ctx.lineWidth = 2;
    
    puppets.forEach(puppet => {
        const verts = puppet.getVertices();
        ctx.beginPath();
        ctx.moveTo(verts[0].x, verts[0].y);
        for (let i = 1; i < verts.length; i++) {
            ctx.lineTo(verts[i].x, verts[i].y);
        }
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
    });

    // 4. Draw the Light Bulb / Source
    ctx.beginPath();
    ctx.arc(lightSource.x, lightSource.y, 10, 0, Math.PI * 2);
    ctx.fillStyle = '#ffb300';
    ctx.fill();
    ctx.shadowBlur = 20;
    ctx.shadowColor = '#ffb300';
    ctx.fillStyle = '#fff';
    ctx.beginPath();
    ctx.arc(lightSource.x, lightSource.y, 5, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0; // Reset
}

// --- Input Handling ---

function setupInput() {
    const getPos = (e) => {
        const rect = canvas.getBoundingClientRect();
        return {
            x: e.clientX ? e.clientX - rect.left : e.touches[0].clientX - rect.left,
            y: e.clientY ? e.clientY - rect.top : e.touches[0].clientY - rect.top
        };
    };

    const handleDown = (e) => {
        const pos = getPos(e);

        // Check Light Source
        if (Math.hypot(lightSource.x - pos.x, lightSource.y - pos.y) < 30) {
            lightSource.isDragging = true;
            return;
        }

        // Check Puppets
        // Simple bounding circle check for ease of dragging
        for (let i = puppets.length - 1; i >= 0; i--) {
            const p = puppets[i];
            if (Math.hypot(p.x - pos.x, p.y - pos.y) < 40) {
                draggedPuppet = p;
                dragOffset.x = p.x - pos.x;
                dragOffset.y = p.y - pos.y;
                return;
            }
        }
    };

    const handleMove = (e) => {
        const pos = getPos(e);

        if (lightSource.isDragging) {
            lightSource.x = pos.x;
            lightSource.y = pos.y;
        } else if (draggedPuppet) {
            draggedPuppet.x = pos.x + dragOffset.x;
            draggedPuppet.y = pos.y + dragOffset.y;
        }
    };

    const handleUp = () => {
        lightSource.isDragging = false;
        draggedPuppet = null;
    };

    // Mouse
    canvas.addEventListener('mousedown', handleDown);
    window.addEventListener('mousemove', handleMove);
    window.addEventListener('mouseup', handleUp);

    // Touch
    canvas.addEventListener('touchstart', e => { e.preventDefault(); handleDown(e); });
    window.addEventListener('touchmove', e => { e.preventDefault(); handleMove(e); });
    window.addEventListener('touchend', handleUp);
    
    // UI
    document.getElementById('light-intensity').addEventListener('input', (e) => {
        lightRadius = parseInt(e.target.value);
    });
}

function loop() {
    drawScene();
    requestAnimationFrame(loop);
}

// Start
init();