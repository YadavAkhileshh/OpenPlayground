// --- Custom 2D Vector Math Class ---
class Vector {
    constructor(x, y) { this.x = x; this.y = y; }
    add(v) { this.x += v.x; this.y += v.y; return this; }
    sub(v) { this.x -= v.x; this.y -= v.y; return this; }
    mult(n) { this.x *= n; this.y *= n; return this; }
    div(n) { this.x /= n; this.y /= n; return this; }
    mag() { return Math.sqrt(this.x * this.x + this.y * this.y); }
    normalize() {
        const m = this.mag();
        if (m !== 0) this.div(m);
        return this;
    }
    limit(max) {
        if (this.mag() > max) {
            this.normalize();
            this.mult(max);
        }
        return this;
    }
    heading() { return Math.atan2(this.y, this.x); }
    static sub(v1, v2) { return new Vector(v1.x - v2.x, v1.y - v2.y); }
    static dist(v1, v2) {
        const dx = v1.x - v2.x;
        const dy = v1.y - v2.y;
        return Math.sqrt(dx * dx + dy * dy);
    }
}

// --- DOM Elements & Config ---
const canvas = document.getElementById('boidsCanvas');
const ctx = canvas.getContext('2d');
const fpsCount = document.getElementById('fpsCount');

const sepSlider = document.getElementById('separationSlider');
const aliSlider = document.getElementById('alignmentSlider');
const cohSlider = document.getElementById('cohesionSlider');
const radSlider = document.getElementById('radiusSlider');

const sepVal = document.getElementById('sepVal');
const aliVal = document.getElementById('aliVal');
const cohVal = document.getElementById('cohVal');
const radVal = document.getElementById('radVal');

document.getElementById('btnScatter').addEventListener('click', scatterFlock);

// Slider Listeners
[sepSlider, aliSlider, cohSlider, radSlider].forEach(slider => {
    slider.addEventListener('input', updateValues);
});

function updateValues() {
    sepVal.innerText = parseFloat(sepSlider.value).toFixed(1);
    aliVal.innerText = parseFloat(aliSlider.value).toFixed(1);
    cohVal.innerText = parseFloat(cohSlider.value).toFixed(1);
    radVal.innerText = `${radSlider.value}px`;
}

// Canvas Resize
let width, height;
function resize() {
    width = window.innerWidth;
    height = window.innerHeight;
    canvas.width = width;
    canvas.height = height;
}
window.addEventListener('resize', resize);
resize();

// --- Boid Class ---
class Boid {
    constructor() {
        this.position = new Vector(Math.random() * width, Math.random() * height);
        this.velocity = new Vector((Math.random() - 0.5) * 4, (Math.random() - 0.5) * 4);
        this.acceleration = new Vector(0, 0);
        this.maxForce = 0.1; // Steering capability
        this.maxSpeed = 4;   // Max velocity
    }

    edges() {
        // Screen wrap-around
        if (this.position.x > width + 10) this.position.x = -10;
        else if (this.position.x < -10) this.position.x = width + 10;

        if (this.position.y > height + 10) this.position.y = -10;
        else if (this.position.y < -10) this.position.y = height + 10;
    }

    // Emergent Rules
    flock(boids) {
        let perceptionRadius = parseFloat(radSlider.value);
        let separation = new Vector(0, 0);
        let alignment = new Vector(0, 0);
        let cohesion = new Vector(0, 0);
        let total = 0;

        for (let other of boids) {
            let d = Vector.dist(this.position, other.position);
            if (other !== this && d < perceptionRadius) {
                // Separation logic
                let diff = Vector.sub(this.position, other.position);
                diff.div(d * d); // Weight by distance
                separation.add(diff);

                // Alignment logic
                alignment.add(other.velocity);

                // Cohesion logic
                cohesion.add(other.position);

                total++;
            }
        }

        if (total > 0) {
            // Finalize Separation
            separation.div(total);
            if (separation.mag() > 0) {
                separation.normalize().mult(this.maxSpeed).sub(this.velocity).limit(this.maxForce);
            }

            // Finalize Alignment
            alignment.div(total).normalize().mult(this.maxSpeed).sub(this.velocity).limit(this.maxForce);

            // Finalize Cohesion
            cohesion.div(total).sub(this.position).normalize().mult(this.maxSpeed).sub(this.velocity).limit(this.maxForce);
        }

        // Apply UI Weights
        separation.mult(parseFloat(sepSlider.value));
        alignment.mult(parseFloat(aliSlider.value));
        cohesion.mult(parseFloat(cohSlider.value));

        this.acceleration.add(separation);
        this.acceleration.add(alignment);
        this.acceleration.add(cohesion);
    }

    update() {
        this.position.add(this.velocity);
        this.velocity.add(this.acceleration);
        this.velocity.limit(this.maxSpeed);
        this.acceleration.mult(0); // Reset acceleration each frame
    }

    draw() {
        const theta = this.velocity.heading() + Math.PI / 2;

        ctx.save();
        ctx.translate(this.position.x, this.position.y);
        ctx.rotate(theta);

        // Draw neon triangle
        ctx.beginPath();
        ctx.moveTo(0, -8);
        ctx.lineTo(-5, 8);
        ctx.lineTo(5, 8);
        ctx.closePath();

        ctx.fillStyle = '#00f3ff';
        ctx.shadowBlur = 10;
        ctx.shadowColor = '#00f3ff';
        ctx.fill();

        ctx.restore();
    }
}

// --- Engine ---
const flock = [];
for (let i = 0; i < 150; i++) {
    flock.push(new Boid());
}

function scatterFlock() {
    for (let boid of flock) {
        boid.velocity = new Vector((Math.random() - 0.5) * 20, (Math.random() - 0.5) * 20);
    }
}

let lastTime = performance.now();
let frames = 0;

function animate() {
    // Fading trail effect
    ctx.fillStyle = 'rgba(2, 2, 5, 0.3)';
    ctx.fillRect(0, 0, width, height);

    for (let boid of flock) {
        boid.edges();
        boid.flock(flock);
        boid.update();
        boid.draw();
    }

    // FPS Calculation
    const now = performance.now();
    frames++;
    if (now - lastTime >= 1000) {
        fpsCount.innerText = frames;
        frames = 0;
        lastTime = now;
    }

    requestAnimationFrame(animate);
}

// Boot
animate();