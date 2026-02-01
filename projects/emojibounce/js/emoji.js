export class Emoji {
    constructor(x, y, char, size) {
        this.x = x;
        this.y = y;
        this.char = char;
        this.originalChar = char;
        this.radius = size / 2;
        this.mass = this.radius; // Mass proportional to size

        // Special types
        if (char === '🎈') this.mass = -this.mass * 0.5; // Anti-gravity
        if (char === '🗿') this.mass = this.mass * 5; // Heavy
        if (char === '💣') this.isBomb = true;

        // Random initial velocity
        this.vx = (Math.random() - 0.5) * 10;
        this.vy = (Math.random() - 0.5) * 10;

        this.rotation = Math.random() * Math.PI * 2;
        this.angularVelocity = (Math.random() - 0.5) * 0.2;

        this.trail = [];
        this.maxTrail = 10;

        this.teleportCooldown = 0;
    }

    tick(dt) {
        if (this.teleportCooldown > 0) this.teleportCooldown -= dt * 60;
    }

    update(dt, gravity) {
        this.tick(dt);

        // Apply gravity
        // Balloons go up (negative mass logic handled by physics? no, gravity is external force)
        // If mass is negative, gravity pushes it up? F=ma -> a = F/m. If m<0, a is negative?
        // Let's just manually invert gravity for balloons.
        if (this.char === '🎈') {
            this.vy -= (gravity * 0.5) * dt * 60;
        } else {
            this.vy += gravity * dt * 60;
        }

        // Update position
        this.x += this.vx * dt * 60;
        this.y += this.vy * dt * 60;

        // Apply rotation
        this.rotation += this.angularVelocity * dt * 60;

        // Damping (air resistance)
        this.vx *= 0.999;
        this.vy *= 0.999;

        // Trail Logic
        const speed = Math.sqrt(this.vx * this.vx + this.vy * this.vy);
        if (speed > 10) {
            this.trail.push({ x: this.x, y: this.y, alpha: 0.5 });
            if (this.trail.length > this.maxTrail) this.trail.shift();
        } else if (this.trail.length > 0) {
            this.trail.shift();
        }

        // Dynamic Expressions
        if (this.char !== '💣' && this.char !== '🎈' && this.char !== '🗿') {
            if (speed > 25) this.char = '😱';
            else if (Math.abs(this.angularVelocity) > 0.5) this.char = '💫';
            else this.char = this.originalChar;
        }
    }

    draw(ctx) {
        // Draw Trail
        if (this.trail.length > 0) {
            ctx.save();
            ctx.beginPath();
            for (let i = 0; i < this.trail.length; i++) {
                const p = this.trail[i];
                if (i === 0) ctx.moveTo(p.x, p.y);
                else ctx.lineTo(p.x, p.y);
            }
            ctx.lineWidth = this.radius;
            ctx.lineCap = 'round';
            ctx.strokeStyle = `rgba(100,100,100,0.2)`;
            ctx.stroke();
            ctx.restore();
        }

        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(this.rotation);

        ctx.font = `${this.radius * 2}px "Outfit", sans-serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';

        // Draw the emoji
        ctx.fillText(this.char, 0, 4);

        ctx.restore();
    }
}
