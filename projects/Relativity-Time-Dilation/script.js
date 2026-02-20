const canvas = document.getElementById('spaceCanvas');
const ctx = canvas.getContext('2d');
const velocitySlider = document.getElementById('velocitySlider');
const velocityReadout = document.getElementById('velocityReadout');
const gammaReadout = document.getElementById('gammaReadout');
const earthClockElement = document.getElementById('earthClock');
const shipClockElement = document.getElementById('shipClock');

// Resize canvas
function resize() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}
window.addEventListener('resize', resize);
resize();

// Physics Variables
let earthTime = 0;
let shipTime = 0;
let lastFrameTime = performance.now();
const SPEED_OF_LIGHT = 1; // Normalized to 1 for calculation simplicity

// Starfield Setup
const numStars = 800;
const stars = [];

class Star {
    constructor() {
        this.reset();
    }
    reset() {
        this.x = (Math.random() - 0.5) * canvas.width * 2;
        this.y = (Math.random() - 0.5) * canvas.height * 2;
        this.z = Math.random() * canvas.width;
        this.pz = this.z;
    }
    update(speed) {
        this.pz = this.z;
        this.z -= speed;
        if (this.z < 1) {
            this.reset();
            this.pz = this.z;
        }
    }
    draw(ctx, v) {
        let sx = (this.x / this.z) * (canvas.width / 2) + canvas.width / 2;
        let sy = (this.y / this.z) * (canvas.height / 2) + canvas.height / 2;
        let px = (this.x / this.pz) * (canvas.width / 2) + canvas.width / 2;
        let py = (this.y / this.pz) * (canvas.height / 2) + canvas.height / 2;

        // Relativistic Doppler Effect Simulation (Blueshift as v -> c)
        let blueShift = Math.floor(v * 255);
        let redShift = Math.floor((1 - v) * 255);
        ctx.strokeStyle = `rgba(${redShift}, 200, 255, ${1 - this.z/canvas.width})`;
        
        // Length contraction / streaking effect
        ctx.lineWidth = Math.max(1, (1 - this.z/canvas.width) * 3);
        ctx.beginPath();
        ctx.moveTo(px, py);
        ctx.lineTo(sx, sy);
        ctx.stroke();
    }
}

for (let i = 0; i < numStars; i++) {
    stars.push(new Star());
}

function animate(currentTime) {
    // Delta time in seconds
    const dt = (currentTime - lastFrameTime) / 1000;
    lastFrameTime = currentTime;

    // Get current velocity fraction (v)
    const v = parseFloat(velocitySlider.value);
    
    // Calculate Lorentz Factor (Gamma)
    // gamma = 1 / sqrt(1 - v^2/c^2)
    const gamma = 1 / Math.sqrt(1 - Math.pow(v, 2));

    // Update Clocks
    earthTime += dt;
    // Time Dilation: Ship time runs slower by the gamma factor
    shipTime += dt / gamma;

    // Update UI
    velocityReadout.textContent = v.toFixed(3);
    gammaReadout.textContent = gamma.toFixed(4);
    earthClockElement.textContent = earthTime.toFixed(2) + ' s';
    shipClockElement.textContent = shipTime.toFixed(2) + ' s';

    // Render Starfield 
    ctx.fillStyle = 'rgba(5, 5, 5, 0.4)'; // Trail effect
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Visual speed multiplier based on gamma
    const visualSpeed = 2 + (gamma * 15); 

    stars.forEach(star => {
        star.update(visualSpeed);
        star.draw(ctx, v);
    });

    requestAnimationFrame(animate);
}

requestAnimationFrame(animate);