/**
 * Kinetic Typography Engine
 * Scans text pixels and creates a physics-based particle system.
 */

const canvas = document.getElementById('particle-canvas');
const ctx = canvas.getContext('2d');

// --- Config ---
let particleGap = 3; // Pixel gap for scanning (Performance vs Quality)
let mouseRadius = 60;
let particleSize = 2;

// --- State ---
let width, height;
let particles = [];
let mouse = { x: 0, y: 0, isActive: false };

class Particle {
    constructor(x, y) {
        this.x = Math.random() * width; // Start random
        this.y = Math.random() * height;
        this.originX = x; // Target home
        this.originY = y;
        this.vx = 0;
        this.vy = 0;
        this.color = '#fff';
        this.size = particleSize;
    }

    update() {
        // 1. Mouse Interaction (Repulsion)
        const dx = mouse.x - this.x;
        const dy = mouse.y - this.y;
        const distance = Math.sqrt(dx*dx + dy*dy);
        
        // Force Vector
        let forceDirectionX = dx / distance;
        let forceDirectionY = dy / distance;
        
        let force = 0;
        
        // If mouse is close, push away
        if (distance < mouseRadius) {
            force = (mouseRadius - distance) / mouseRadius; // 0 to 1 strength
            // Strong push
            this.vx -= forceDirectionX * force * 5; // Strength multiplier
            this.vy -= forceDirectionY * force * 5;
        }

        // 2. Return to Origin (Spring Physics)
        if (this.x !== this.originX || this.y !== this.originY) {
            let dxHome = this.x - this.originX;
            let dyHome = this.y - this.originY;
            // Pull back
            this.vx -= dxHome * 0.05; // Spring stiffness
            this.vy -= dyHome * 0.05;
        }
        
        // 3. Friction (Damping)
        this.vx *= 0.85; // Air resistance
        this.vy *= 0.85;

        // Apply Velocity
        this.x += this.vx;
        this.y += this.vy;
    }

    draw() {
        ctx.fillStyle = this.color;
        ctx.fillRect(this.x, this.y, this.size, this.size);
    }
}

// --- Init ---

function init() {
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
    setupInput();
    
    // Initial Render
    updateText();
    loop();
}

function resizeCanvas() {
    width = canvas.parentElement.clientWidth;
    height = canvas.parentElement.clientHeight;
    canvas.width = width;
    canvas.height = height;
    updateText();
}

// --- Text Processing ---

function updateText() {
    const text = document.getElementById('text-input').value.toUpperCase();
    particleSize = parseInt(document.getElementById('size-slider').value);
    mouseRadius = parseInt(document.getElementById('radius-slider').value);
    
    // Clear
    particles = [];
    ctx.clearRect(0, 0, width, height);
    
    // Draw Text to Canvas (Invisible/Temporary)
    // We render standard text, scan it, then clear it
    const fontSize = Math.min(width / (text.length * 0.8), 200);
    ctx.font = `900 ${fontSize}px Montserrat`;
    ctx.fillStyle = 'white';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(text, width/2, height/2);
    
    // Scan Pixels
    const textCoordinates = ctx.getImageData(0, 0, width, height);
    
    // We don't need to clearRect yet if we just overwrite with animation loop immediately
    // But good practice to not leave static text
    ctx.clearRect(0, 0, width, height);

    // Analyze Pixel Data
    // Data is array [R, G, B, A, R, G, B, A...]
    // We scan grid points based on particleGap
    for (let y = 0; y < height; y += particleGap) {
        for (let x = 0; x < width; x += particleGap) {
            // Index logic: (y * width + x) * 4 channels
            const index = (y * width + x) * 4;
            const alpha = textCoordinates.data[index + 3];
            
            // If pixel is visible (alpha > 128)
            if (alpha > 128) {
                particles.push(new Particle(x, y));
            }
        }
    }
    
    document.getElementById('particle-count').innerText = particles.length;
}

// --- Animation Loop ---

function animate() {
    ctx.clearRect(0, 0, width, height);
    
    for (let i = 0; i < particles.length; i++) {
        particles[i].update();
        particles[i].draw();
    }
    requestAnimationFrame(animate);
}

// --- Input ---

function setupInput() {
    window.addEventListener('mousemove', e => {
        const rect = canvas.getBoundingClientRect();
        mouse.x = e.clientX - rect.left;
        mouse.y = e.clientY - rect.top;
    });
    
    // Slider listeners
    document.getElementById('size-slider').addEventListener('input', updateText);
    document.getElementById('radius-slider').addEventListener('input', (e) => {
        mouseRadius = parseInt(e.target.value);
    });
}

function loop() {
    animate();
}

// Start
init();