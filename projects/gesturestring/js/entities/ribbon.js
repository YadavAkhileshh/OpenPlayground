/**
 * Ribbon Class
 * Represents a single continuous gesture stroke.
 * Consists of particles connected by springs.
 * Updates: Uses Camera and ViewProjection Matrix for rendering.
 */
import { Particle } from '../physics/particle.js';
import { Spring } from '../physics/spring.js';
import { Vector3 } from '../math/vector3.js';
import { map, randomRange } from '../math/utils.js';

export class Ribbon {
    constructor(solver, color) {
        this.solver = solver;
        this.particles = [];
        this.springs = [];

        // Aesthetic properties
        this.color = color || { h: 180, s: 100, l: 50 };
        this.baseWidth = randomRange(4, 15);

        this.isFinished = false;

        // Physics params
        this.stiffness = 0.2;
        this.damping = 0.1;
    }

    addPoint(position) {
        // Create new particle
        const p = new Particle(position.x, position.y, position.z);
        // Add velocity based on position difference from last particle
        if (this.particles.length > 0) {
            const last = this.particles[this.particles.length - 1];
            const dir = Vector3.subVectors(position, last.position);
            p.velocity.copy(dir.multiplyScalar(0.1));
        } else {
            p.velocity.set(
                randomRange(-2, 2),
                randomRange(-2, 2),
                randomRange(-2, 2)
            );
        }

        this.solver.addParticle(p);
        this.particles.push(p);

        // Connect to previous particle
        if (this.particles.length > 1) {
            const prev = this.particles[this.particles.length - 2];
            const dist = p.position.distanceTo(prev.position);

            // Structural spring
            const s = new Spring(prev, p, dist * 0.8, this.stiffness, this.damping);
            this.solver.addSpring(s);
            this.springs.push(s);

            // Cross-links for stability (connect to prev-prev)
            if (this.particles.length > 2) {
                const prev2 = this.particles[this.particles.length - 3];
                const dist2 = p.position.distanceTo(prev2.position);
                const s2 = new Spring(prev2, p, dist2 * 0.9, this.stiffness * 0.5, this.damping);
                this.solver.addSpring(s2);
                this.springs.push(s2);
            }
        }
    }

    finish() {
        this.isFinished = true;
    }

    update(dt) {
        // Check for dead particles (life < 0)
        let aliveCount = 0;
        for (const p of this.particles) {
            if (p.life > 0) aliveCount++;
        }
        return aliveCount > 0;
    }

    /**
     * Draws the ribbon as a smooth strip.
     * Uses Camera projection.
     * @param {Renderer} renderer
     * @param {Camera} camera
     * @param {Matrix4} viewProjMatrix
     */
    draw(renderer, camera, viewProjMatrix) {
        if (this.particles.length < 3) return;

        const ctx = renderer.ctx;
        const width = renderer.width;
        const height = renderer.height;

        // 1. Project all points
        const points = [];
        for (let i = 0; i < this.particles.length; i++) {
            const p = this.particles[i];

            // Use camera project helper
            const proj = camera.project(p.position, viewProjMatrix, width, height);

            if (proj.visible) {
                points.push({
                    x: proj.x,
                    y: proj.y,
                    scale: proj.scale,
                    life: p.life,
                    vec: p.position
                });
            }
        }

        if (points.length < 3) return;

        // 2. Generate smooth spine and normals (Screen Space Billboarding)
        const spine = [];
        const normals = [];

        for (let i = 0; i < points.length; i++) {
            const curr = points[i];

            // Calculate tangent
            let tanX = 0;
            let tanY = 0;

            if (i === 0) {
                const next = points[i + 1];
                tanX = next.x - curr.x;
                tanY = next.y - curr.y;
            } else if (i === points.length - 1) {
                const prev = points[i - 1];
                tanX = curr.x - prev.x;
                tanY = curr.y - prev.y;
            } else {
                const prev = points[i - 1];
                const next = points[i + 1];
                tanX = next.x - prev.x;
                tanY = next.y - prev.y;
            }

            // Normalize tangent
            const len = Math.sqrt(tanX * tanX + tanY * tanY);
            if (len > 0) {
                tanX /= len;
                tanY /= len;
            }

            // Normal is perpendicular to tangent (-y, x)
            normals.push({ x: -tanY, y: tanX });
            spine.push(curr);
        }

        // 3. Draw Quad Strip
        for (let i = 0; i < spine.length - 1; i++) {
            const p1 = spine[i];
            const p2 = spine[i + 1];
            const n1 = normals[i];
            const n2 = normals[i + 1];

            // Width affected by life and scale (perspective)
            const w1 = this.baseWidth * p1.scale * p1.life;
            const w2 = this.baseWidth * p2.scale * p2.life;

            // Vertices
            const x1_top = p1.x + n1.x * w1;
            const y1_top = p1.y + n1.y * w1;
            const x1_bot = p1.x - n1.x * w1;
            const y1_bot = p1.y - n1.y * w1;

            const x2_top = p2.x + n2.x * w2;
            const y2_top = p2.y + n2.y * w2;
            const x2_bot = p2.x - n2.x * w2;
            const y2_bot = p2.y - n2.y * w2;

            // Draw Quad
            ctx.beginPath();
            ctx.moveTo(x1_top, y1_top);
            ctx.lineTo(x2_top, y2_top);
            ctx.lineTo(x2_bot, y2_bot);
            ctx.lineTo(x1_bot, y1_bot);
            ctx.closePath();

            // Color with alpha fade
            const lightness = this.color.l * ((p1.scale + p2.scale) * 0.5); // darker if further
            const alpha = (p1.life + p2.life) / 2;
            const rgb = this.getRGB(this.color.h, this.color.s, lightness);

            ctx.fillStyle = `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${alpha})`;

            // Occasional glow for bright spots
            if (p1.scale > 1.2) {
                ctx.shadowColor = `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${alpha})`;
                ctx.shadowBlur = w1 * 2;
            } else {
                ctx.shadowBlur = 0;
            }

            ctx.fill();
            ctx.shadowBlur = 0;
        }
    }

    getRGB(h, s, l) {
        l /= 100;
        const a = s * Math.min(l, 1 - l) / 100;
        const f = n => {
            const k = (n + h / 30) % 12;
            const color = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
            return Math.round(255 * color);
        };
        return { r: f(0), g: f(8), b: f(4) };
    }
}
