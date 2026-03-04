/**
 * SlimeNet - Predator System
 * 
 * Agents that chase the slime.
 */
class PredatorSystem {
    constructor(count, width, height) {
        this.count = count;
        this.width = width;
        this.height = height;
        this.agents = [];

        for (let i = 0; i < count; i++) {
            this.agents.push({
                x: Math.random() * width,
                y: Math.random() * height,
                vx: (Math.random() - 0.5) * 2,
                vy: (Math.random() - 0.5) * 2
            });
        }
    }

    update(targetAgents, dt) {
        // Find center of mass of a random subset of agents (cpu optimization)
        // Taking 50 random agents
        let cx = 0, cy = 0;
        let c = 0;
        for (let i = 0; i < 50; i++) {
            const idx = Math.floor(Math.random() * targetAgents.count);
            cx += targetAgents.x[idx];
            cy += targetAgents.y[idx];
            c++;
        }
        cx /= c;
        cy /= c;

        const speed = Config.predators.speed;

        for (let p of this.agents) {
            // Steering force towards Center of Mass
            const dx = cx - p.x;
            const dy = cy - p.y;
            const dist = Math.sqrt(dx * dx + dy * dy);

            if (dist > 1) {
                p.vx += (dx / dist) * 0.1;
                p.vy += (dy / dist) * 0.1;
            }

            // Limit velocity
            const vMag = Math.sqrt(p.vx * p.vx + p.vy * p.vy);
            if (vMag > speed) {
                p.vx = (p.vx / vMag) * speed;
                p.vy = (p.vy / vMag) * speed;
            }

            p.x += p.vx;
            p.y += p.vy;

            // Bounce
            if (p.x < 0 || p.x > this.width) p.vx *= -1;
            if (p.y < 0 || p.y > this.height) p.vy *= -1;
        }
    }

    render(ctx) {
        ctx.fillStyle = '#ff0000';
        ctx.shadowBlur = 15;
        ctx.shadowColor = '#ff0000';
        for (let p of this.agents) {
            ctx.beginPath();
            ctx.arc(p.x, p.y, 4, 0, Math.PI * 2);
            ctx.fill();
        }
        ctx.shadowBlur = 0;
    }
}

window.PredatorSystem = PredatorSystem;
