export class Physics {
    constructor(config, audio, particles) {
        this.config = config;
        this.audio = audio;
        this.particles = particles;
    }

    // Check and resolve collision between two emojis
    resolveCollision(p1, p2) {
        const dx = p2.x - p1.x;
        const dy = p2.y - p1.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        const minDist = p1.radius + p2.radius;

        if (distance < minDist) {
            // Audio & Particles
            const impactVelocity = Math.abs(p1.vx - p2.vx) + Math.abs(p1.vy - p2.vy);

            if (this.audio) {
                if (impactVelocity > 5) this.audio.playPop(impactVelocity);
            }

            if (this.particles) {
                if (impactVelocity > 15) {
                    this.particles.spawn((p1.x + p2.x) / 2, (p1.y + p2.y) / 2, '#FFD700', 3);
                }

                // Shockwave & Boom for Bomb
                if ((p1.char === '💣' || p2.char === '💣') && impactVelocity > 8) {
                    this.particles.spawnShockwave((p1.x + p2.x) / 2, (p1.y + p2.y) / 2);
                    this.audio.playPop(30); // Loud pop
                }
            }

            // Evolution: 🥚 -> 🐣 -> 🐥 -> 🐔
            if (p1.char === '🥚' && p2.char === '🥚') {
                p1.char = '🐣'; p2.char = '🐣';
                this.particles.spawn(p1.x, p1.y, '#FFFFFF', 10);
            } else if (p1.char === '🐣' && p2.char === '🐣') {
                p1.char = '🐥'; p2.char = '🐥';
                this.particles.spawn(p1.x, p1.y, '#FFFF00', 10);
            } else if (p1.char === '🐥' && p2.char === '🐥') {
                p1.char = '🐔'; p2.char = '🐔';
                this.particles.spawn(p1.x, p1.y, '#FF0000', 5);
            }

            // Calculate collision normal
            const nx = dx / distance;
            const ny = dy / distance;

            // Separate overlapping particles to prevent sticking
            const overlap = minDist - distance;
            const separationX = nx * overlap * 0.5;
            const separationY = ny * overlap * 0.5;

            p1.x -= separationX;
            p1.y -= separationY;
            p2.x += separationX;
            p2.y += separationY;

            // Relative velocity
            const rvx = p2.vx - p1.vx;
            const rvy = p2.vy - p1.vy;

            // Velocity along normal
            const velAlongNormal = rvx * nx + rvy * ny;

            // Do not resolve if velocities are separating
            if (velAlongNormal > 0) return;

            // Bounciness (restitution)
            const restitution = this.config.bounciness;

            // Impulse scalar
            let j = -(1 + restitution) * velAlongNormal;
            j /= (1 / p1.mass + 1 / p2.mass);

            // Apply impulse
            const impulseX = j * nx;
            const impulseY = j * ny;

            p1.vx -= impulseX / p1.mass;
            p1.vy -= impulseY / p1.mass;
            p2.vx += impulseX / p2.mass;
            p2.vy += impulseY / p2.mass;
        }
    }

    // Handle wall collisions
    resolveWallCollision(p, width, height) {
        const restitution = this.config.bounciness;
        let collided = false;

        if (p.x - p.radius < 0) {
            p.x = p.radius;
            p.vx = -p.vx * restitution;
            collided = true;
        } else if (p.x + p.radius > width) {
            p.x = width - p.radius;
            p.vx = -p.vx * restitution;
            collided = true;
        }

        if (p.y - p.radius < 0) {
            p.y = p.radius;
            p.vy = -p.vy * restitution;
            collided = true;
        } else if (p.y + p.radius > height) {
            p.y = height - p.radius;
            p.vy = -p.vy * restitution;
            collided = true;

            // Ground friction simulation to stop sliding indefinitely
            if (Math.abs(p.vy) < 0.5) p.vx *= 0.95;
        }

        if (collided && this.audio) {
            this.audio.playBounce(Math.abs(p.vx) + Math.abs(p.vy));
        }
    }

    // Line/Segment collision for drawn walls
    resolveLineCollision(p, lineStart, lineEnd) {
        // Vector from start to end
        const lx = lineEnd.x - lineStart.x;
        const ly = lineEnd.y - lineStart.y;
        const lenSq = lx * lx + ly * ly;

        if (lenSq === 0) return;

        // Project point onto line (clamped segment)
        const t = Math.max(0, Math.min(1, ((p.x - lineStart.x) * lx + (p.y - lineStart.y) * ly) / lenSq));

        // Closest point on segment
        const cx = lineStart.x + t * lx;
        const cy = lineStart.y + t * ly;

        const dx = p.x - cx;
        const dy = p.y - cy;
        const distSq = dx * dx + dy * dy;

        if (distSq < p.radius * p.radius) {
            const dist = Math.sqrt(distSq);
            // Normal
            const nx = dx / dist;
            const ny = dy / dist;

            // Push out
            const overlap = p.radius - dist;
            p.x += nx * overlap;
            p.y += ny * overlap;

            // Bounce
            // Velocity along normal
            const vn = p.vx * nx + p.vy * ny;
            if (vn < 0) { // Moving towards wall
                const restitution = this.config.bounciness;
                const j = -(1 + restitution) * vn;
                p.vx += j * nx;
                p.vy += j * ny;

                if (this.audio) this.audio.playBounce(Math.abs(vn));
            }
        }
    }
}
