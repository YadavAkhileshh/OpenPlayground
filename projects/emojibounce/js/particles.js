export class ParticleSystem {
    constructor() {
        this.particles = [];
        this.shockwaves = [];
    }

    spawnShockwave(x, y) {
        this.shockwaves.push({ x, y, radius: 10, alpha: 1.0 });
    }

    spawn(x, y, color, count = 5) {
        for (let i = 0; i < count; i++) {
            const angle = Math.random() * Math.PI * 2;
            const speed = Math.random() * 4 + 2;
            this.particles.push({
                x, y,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed,
                life: 1.0,
                color: color || '#FF6B6B',
                size: Math.random() * 4 + 2
            });
        }
    }

    update(dt) {
        for (let i = this.particles.length - 1; i >= 0; i--) {
            const p = this.particles[i];
            p.x += p.vx;
            p.y += p.vy;
            p.life -= dt * 2; // Fade out speed
            p.vy += 0.2; // Gravity for particles

            if (p.life <= 0) {
                this.particles.splice(i, 1);
            }
        }

        // Update shockwaves
        for (let i = this.shockwaves.length - 1; i >= 0; i--) {
            const s = this.shockwaves[i];
            s.radius += 10; // Expand fast
            s.alpha -= 0.05;
            if (s.alpha <= 0) this.shockwaves.splice(i, 1);
        }
    }

    draw(ctx) {
        // Draw Shockwaves (Distortion-ish)
        ctx.save();
        ctx.lineWidth = 5;
        for (const s of this.shockwaves) {
            ctx.beginPath();
            ctx.arc(s.x, s.y, s.radius, 0, Math.PI * 2);
            ctx.strokeStyle = `rgba(255, 255, 255, ${s.alpha * 0.5})`;
            ctx.stroke();
        }
        ctx.restore();

        for (const p of this.particles) {
            ctx.globalAlpha = p.life;
            ctx.fillStyle = p.color;
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
            ctx.fill();
        }
        ctx.globalAlpha = 1.0;
    }
}
