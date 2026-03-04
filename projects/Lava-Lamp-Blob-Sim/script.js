const canvas = document.getElementById('lavaCanvas');
const ctx = canvas.getContext('2d');

// Match canvas size to CSS container
canvas.width = 200;
canvas.height = 450;

const blobs = [];
const numBlobs = 8;

class Blob {
    constructor() {
        this.radius = Math.random() * 25 + 20;
        this.x = Math.random() * (canvas.width - this.radius * 2) + this.radius;
        this.y = Math.random() * canvas.height;
        
        // Buoyancy and drift
        this.vy = (Math.random() - 0.5) * 2;
        this.vx = (Math.random() - 0.5) * 0.5;
        
        // Heat state (determines upward/downward movement)
        this.temperature = Math.random();
    }

    update() {
        // Lava lamp physics: 
        // Bottom is hot (pushes up), top is cool (pulls down)
        if (this.y > canvas.height - 80) {
            this.temperature += 0.02; // Heat up at bottom
        } else if (this.y < 80) {
            this.temperature -= 0.02; // Cool down at top
        }

        // Apply temperature to velocity
        this.vy -= (this.temperature - 0.5) * 0.05;
        
        // Add a little friction so they don't go crazy
        this.vy *= 0.98;
        
        // Update positions
        this.y += this.vy;
        this.x += this.vx;

        // Gentle bounce off the side walls of the glass
        if (this.x + this.radius > canvas.width || this.x - this.radius < 0) {
            this.vx *= -1;
        }

        // Hard boundary for top and bottom to prevent escaping
        if (this.y > canvas.height + this.radius) this.y = canvas.height + this.radius;
        if (this.y < -this.radius) this.y = -this.radius;
    }

    draw() {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        // Bright lava color
        ctx.fillStyle = '#ff7b72';
        ctx.fill();
        ctx.closePath();
    }
}

// Initialize blobs
for (let i = 0; i < numBlobs; i++) {
    blobs.push(new Blob());
}

// Giant resting blob at the base
const baseBlob = {
    x: canvas.width / 2,
    y: canvas.height,
    radius: 70
};

function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw resting base wax
    ctx.beginPath();
    ctx.arc(baseBlob.x, baseBlob.y, baseBlob.radius, 0, Math.PI * 2);
    ctx.fillStyle = '#ff7b72';
    ctx.fill();
    ctx.closePath();

    // Update and draw floating blobs
    blobs.forEach(blob => {
        blob.update();
        blob.draw();
    });

    requestAnimationFrame(animate);
}

animate();