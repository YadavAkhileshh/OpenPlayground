const canvas = document.getElementById('canvas1');
const ctx = canvas.getContext('2d', { willReadFrequently: true });

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

// Controls
const textInput = document.getElementById('textInput');
const resolutionInput = document.getElementById('resolution');
const radiusInput = document.getElementById('radius');
const color1Input = document.getElementById('color1');
const color2Input = document.getElementById('color2');
const resetBtn = document.getElementById('resetBtn');
const explodeBtn = document.getElementById('explodeBtn');

let gradient;

class Particle {
    constructor(effect, x, y, color) {
        this.effect = effect;
        // Start from random positions for "assembly" effect
        this.x = Math.random() * this.effect.canvasWidth;
        this.y = Math.random() * this.effect.canvasHeight;
        this.originX = x;
        this.originY = y;

        // VISUALS: Random size variation for organic look
        this.size = this.effect.gap * (0.4 + Math.random() * 0.4);
        this.color = color;

        // PHYSICS: Velocity and Spring constants
        this.dx = 0;
        this.dy = 0;
        this.vx = 0;
        this.vy = 0;
        this.force = 0;
        this.angle = 0;
        this.distance = 0;
        this.friction = 0.90; // Damping
        this.ease = 0.2;      // Spring stiffness (higher = stiffer)
    }

    draw() {
        this.effect.context.fillStyle = this.color;
        this.effect.context.beginPath();
        this.effect.context.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        this.effect.context.fill();
    }

    update() {
        // INTERACTIVE PHYSICS: Mouse Repulsion
        this.dx = this.effect.mouse.x - this.x;
        this.dy = this.effect.mouse.y - this.y;
        this.distance = this.dx * this.dx + this.dy * this.dy;
        this.force = (-this.effect.mouse.radius / this.distance) * 8; // Stronger local force

        if (this.distance < this.effect.mouse.radius) {
            this.angle = Math.atan2(this.dy, this.dx);
            this.vx += this.force * Math.cos(this.angle);
            this.vy += this.force * Math.sin(this.angle);
        }

        // SPRING PHYSICS: Return to origin
        // Hooke's Law approx: acceleration proportional to distance from target
        // We use a simplified spring-like ease for stability
        this.x += (this.vx *= this.friction) + (this.originX - this.x) * this.ease;
        this.y += (this.vy *= this.friction) + (this.originY - this.y) * this.ease;
    }

    explode() {
        this.x = Math.random() * this.effect.canvasWidth;
        this.y = Math.random() * this.effect.canvasHeight;
        this.vx = (Math.random() - 0.5) * 100; // More explosive
        this.vy = (Math.random() - 0.5) * 100;
    }
}

class Effect {
    constructor(context, canvasWidth, canvasHeight) {
        this.context = context;
        this.canvasWidth = canvasWidth;
        this.canvasHeight = canvasHeight;
        this.textX = this.canvasWidth / 2;
        this.textY = this.canvasHeight / 2;
        this.fontSize = 120;
        this.lineHeight = this.fontSize * 0.9;
        this.maxTextWidth = this.canvasWidth * 0.8;

        // Particle settings
        this.particles = [];
        this.gap = parseInt(resolutionInput.value); // Use control value
        this.mouse = {
            radius: 20000,
            x: 0,
            y: 0
        }

        window.addEventListener('mousemove', e => {
            this.mouse.x = e.x;
            this.mouse.y = e.y;
        });

        // Initial Wrap
        this.wrapText(textInput.value);
    }

    wrapText(text) {
        // Gradient logic
        gradient = this.context.createLinearGradient(0, 0, this.canvasWidth, this.canvasHeight);
        gradient.addColorStop(0.3, color1Input.value);
        gradient.addColorStop(0.7, color2Input.value);

        this.context.fillStyle = gradient;
        this.context.textAlign = 'center';
        this.context.textBaseline = 'middle';
        this.context.lineWidth = 3;
        this.context.strokeStyle = 'white';
        this.context.font = `800 ${this.fontSize}px Outfit`;

        // Break text into lines
        const linesArray = [];
        let words = text.split(' ');
        let lineCounter = 0;
        let line = '';

        for (let i = 0; i < words.length; i++) {
            let testLine = line + words[i] + ' ';
            if (this.context.measureText(testLine).width > this.maxTextWidth) {
                line = words[i] + ' ';
                lineCounter++;
            } else {
                line = testLine;
            }
            linesArray[lineCounter] = line;
        }

        const textHeight = this.lineHeight * lineCounter;
        this.textY = this.canvasHeight / 2 - textHeight / 2;

        linesArray.forEach((el, index) => {
            this.context.fillText(el, this.textX, this.textY + (index * this.lineHeight));
            this.context.strokeText(el, this.textX, this.textY + (index * this.lineHeight));
        });

        this.convertToParticles();
    }

    convertToParticles() {
        this.particles = [];
        const pixels = this.context.getImageData(0, 0, this.canvasWidth, this.canvasHeight).data;
        this.context.clearRect(0, 0, this.canvasWidth, this.canvasHeight);

        for (let y = 0; y < this.canvasHeight; y += this.gap) {
            for (let x = 0; x < this.canvasWidth; x += this.gap) {
                const index = (y * this.canvasWidth + x) * 4;
                const alpha = pixels[index + 3];
                if (alpha > 0) {
                    const red = pixels[index];
                    const green = pixels[index + 1];
                    const blue = pixels[index + 2];
                    const color = `rgb(${red}, ${green}, ${blue})`;
                    this.particles.push(new Particle(this, x, y, color));
                }
            }
        }
    }

    render() {
        this.particles.forEach(particle => {
            particle.update();
            particle.draw();
        });
    }

    resize(width, height) {
        this.canvasWidth = width;
        this.canvasHeight = height;
        this.textX = this.canvasWidth / 2;
        this.textY = this.canvasHeight / 2; // Center offset handled in wrapText
        this.maxTextWidth = this.canvasWidth * 0.8;

        // Re-process text
        this.context.clearRect(0, 0, this.canvasWidth, this.canvasHeight);
        this.wrapText(textInput.value);
    }
}

let effect = new Effect(ctx, canvas.width, canvas.height);

function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    effect.render();
    requestAnimationFrame(animate);
}
animate();

// Event Listeners for Controls
textInput.addEventListener('keyup', (e) => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    effect.wrapText(e.target.value);
});

resolutionInput.addEventListener('change', (e) => {
    effect.gap = parseInt(e.target.value);
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    effect.wrapText(textInput.value);
});

radiusInput.addEventListener('input', (e) => {
    const val = parseFloat(e.target.value);
    effect.particles.forEach(p => p.size = val);
});

[color1Input, color2Input].forEach(input => {
    input.addEventListener('input', () => {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        effect.wrapText(textInput.value);
    });
});

resetBtn.addEventListener('click', () => {
    textInput.value = 'Sample text';
    resolutionInput.value = 3;
    radiusInput.value = 1.6;
    color1Input.value = '#EF5B3E';
    color2Input.value = '#12C2E5';

    effect.gap = 3;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    effect.wrapText('Sample text');
});

explodeBtn.addEventListener('click', () => {
    effect.particles.forEach(p => p.explode());
});

window.addEventListener('resize', () => {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    effect.resize(canvas.width, canvas.height);
});
