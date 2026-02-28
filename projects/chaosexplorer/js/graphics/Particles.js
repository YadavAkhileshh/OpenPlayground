/**
 * Particles.js
 * Manages a cloud of particles that follow the attractor field.
 * Unlike the main trail, these are individual points that fade and respawn.
 */

import { Vector3 } from '../math/Vector3.js';
import { Integrator } from '../math/Integrator.js';
import { Projection } from './Projection.js';
import { MathUtils } from '../math/MathUtils.js';

export class ParticleSystem {
    constructor(count = 500) {
        this.count = count;
        this.particles = [];
        this.integrator = new Integrator();
        this.init();
    }

    init() {
        this.particles = [];
        for (let i = 0; i < this.count; i++) {
            this.particles.push(this.createParticle());
        }
    }

    createParticle() {
        // Respawn in a random sphere around origin
        const u = Math.random();
        const v = Math.random();
        const theta = 2 * Math.PI * u;
        const phi = Math.acos(2 * v - 1);
        const r = 10 * Math.cbrt(Math.random());

        const x = r * Math.sin(phi) * Math.cos(theta);
        const y = r * Math.sin(phi) * Math.sin(theta);
        const z = r * Math.cos(phi);

        return {
            pos: new Vector3(x, y, z),
            life: Math.random() * 100 + 50,
            maxLife: 150,
            colorOffset: Math.random() * 60
        };
    }

    update(attractor, dt) {
        for (const p of this.particles) {
            // Update Position
            let next = this.integrator.step(attractor, p.pos, dt);
            p.pos = next;
            p.life--;

            if (p.life <= 0 || p.pos.lengthSq() > 50000) {
                // Respawn
                const newP = this.createParticle();
                p.pos = newP.pos;
                p.life = newP.life;
                // Move it to attractor start for variety? 
                // Nay, kept it random cloud.
                // Or maybe near the current "head" of the trail?
                // Let's spawn near attractor start point + noise
                p.pos.copy(attractor.startPoint).add(
                    new Vector3(
                        MathUtils.randomRange(-1, 1),
                        MathUtils.randomRange(-1, 1),
                        MathUtils.randomRange(-1, 1)
                    )
                );
            }
        }
    }

    render(renderer, camera, scaleFactor) {
        const ctx = renderer.ctx;
        const width = renderer.width;
        const height = renderer.height;

        ctx.globalCompositeOperation = 'lighter';

        for (const p of this.particles) {
            const projected = Projection.project(p.pos, camera, width, height, scaleFactor);
            if (!projected) continue;

            const lifeRatio = p.life / p.maxLife;
            const alpha = lifeRatio;
            const size = projected.w * 3;

            // Color based on particle life + base hue
            const hue = (renderer.baseHue + p.colorOffset) % 360;

            ctx.fillStyle = `hsla(${hue}, 100%, 70%, ${alpha})`;
            ctx.beginPath();
            ctx.arc(projected.x, projected.y, size, 0, Math.PI * 2);
            ctx.fill();
        }

        ctx.globalCompositeOperation = 'source-over';
    }
}
