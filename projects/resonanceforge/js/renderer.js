import { randomRange } from './utils.js';

export class Renderer {
    constructor(ctx) {
        this.ctx = ctx;
        this.particles = [];
    }

    clear() {
        // PERFORMANCE: Trails can be expensive. 
        // Use clearRect for maximum stability, or a very faint fill for trails.
        // Let's use a faster trail approach: only every 2nd frame? 
        // For now, doing standard clear to ensure no invalid state buildup.
        this.ctx.fillStyle = 'rgba(13, 13, 18, 1.0)'; // SOLID clear
        this.ctx.fillRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);
    }

    drawBodies(bodies) {
        this.ctx.shadowBlur = 10;
        this.ctx.shadowColor = '#00f3ff';

        for (let body of bodies) {
            this.ctx.beginPath();
            if (body.type === 'circle') {
                this.ctx.arc(body.x, body.y, body.radius, 0, Math.PI * 2);
            } else if (body.type === 'rect') {
                this.ctx.rect(body.x - body.width / 2, body.y - body.height / 2, body.width, body.height);
            }

            if (body.isStatic) {
                this.ctx.fillStyle = '#1a1a20';
                this.ctx.strokeStyle = '#333';
                this.ctx.shadowBlur = 0;
            } else {
                // Dynamic Color based on velocity
                const speed = Math.sqrt(body.vx * body.vx + body.vy * body.vy);
                const intensity = Math.min(speed / 500, 1);

                // Interpolate blue to pink based on speed
                if (intensity > 0.5) {
                    this.ctx.shadowColor = '#ff00ff';
                    this.ctx.strokeStyle = '#ff00ff';
                } else {
                    this.ctx.shadowColor = '#00f3ff';
                    this.ctx.strokeStyle = '#00f3ff';
                }

                this.ctx.fillStyle = `rgba(10, 10, 20, 0.8)`;
            }

            this.ctx.lineWidth = 2;
            this.ctx.fill();
            this.ctx.stroke();
            this.ctx.shadowBlur = 0; // Reset
        }
    }

    visualizeSound(forces) {
        const width = this.ctx.canvas.width;
        const height = this.ctx.canvas.height;
        const dt = 0.016;

        // Particle Spawners
        // Limit spawning to reduce GC pressure (e.g. only every other frame or less count)
        const spawnProbability = 0.5;

        // Bass -> Wind Particles from Left
        if (forces.bass > 0.1 && Math.random() < spawnProbability) {
            for (let i = 0; i < 2; i++) {
                this.particles.push({
                    x: 0,
                    y: randomRange(0, height),
                    vx: randomRange(200, 800),
                    vy: randomRange(-50, 50),
                    life: randomRange(0.5, 1.0),
                    color: 'rgba(255, 0, 255, 0.5)',
                    size: randomRange(2, 4)
                });
            }
        }

        // Treble -> Rising Bubbles from Bottom
        if (forces.treble > 0.1 && Math.random() < spawnProbability) {
            for (let i = 0; i < 2; i++) {
                this.particles.push({
                    x: randomRange(0, width),
                    y: height,
                    vx: randomRange(-20, 20),
                    vy: randomRange(-200, -500),
                    life: randomRange(0.5, 1.0),
                    color: 'rgba(0, 243, 255, 0.5)',
                    size: randomRange(2, 4)
                });
            }
        }

        // Update & Draw Particles (Batched)
        this.ctx.globalCompositeOperation = 'lighter';

        // Remove dead particles first to keep array clean
        for (let i = this.particles.length - 1; i >= 0; i--) {
            let p = this.particles[i];
            p.life -= dt;
            if (p.life <= 0) {
                this.particles.splice(i, 1);
                continue;
            }

            p.x += p.vx * dt;
            p.y += p.vy * dt;

            this.ctx.fillStyle = p.color;
            this.ctx.beginPath();
            this.ctx.arc(p.x, p.y, p.size * p.life, 0, Math.PI * 2);
            this.ctx.fill();
        }

        this.ctx.globalCompositeOperation = 'source-over';

        // HUD - Frequency Bars (Simple visualization)
        const barWidth = 20;
        const bassHeight = forces.bass * 200;
        const trebleHeight = forces.treble * 200;

        this.ctx.fillStyle = '#ff00ff';
        this.ctx.fillRect(20, height - bassHeight - 20, barWidth, bassHeight);

        this.ctx.fillStyle = '#00f3ff';
        this.ctx.fillRect(50, height - trebleHeight - 20, barWidth, trebleHeight);
    }
}
