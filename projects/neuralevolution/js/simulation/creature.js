import { Particle, Constraint } from '../physics/engine.js';
import { Vector } from '../math/vector.js';

/**
 * Represents a simulated creature with a body and a brain.
 * The body is composed of particles and constraints (bones/muscles).
 * The brain is a neural network that controls the muscles.
 *
 * Network topology (must match what Population.init() is called with):
 *   Inputs  = 6 sensors + 7 muscle lengths = 13
 *   Hidden  = 8
 *   Outputs = 7 muscles
 */
export class Creature {
    /**
     * @param {number} startX - Initial X coordinate
     * @param {number} startY - Initial Y coordinate
     * @param {NeuralNetwork} brain  - Pre-built neural network
     */
    constructor(startX, startY, brain) {
        this.particles = [];
        this.constraints = [];
        this.muscles = [];
        this.brain = brain;
        this.fitness = 0;
        this.alive = true;
        this.startX = startX;
        this.species = null;

        // Genome Color — hash weights to a unique hue
        let hash = 0;
        for (let i = 0; i < brain.weightsIH.length; i++) hash += brain.weightsIH[i];
        for (let i = 0; i < brain.weightsHO.length; i++) hash += brain.weightsHO[i];
        const hue = Math.abs(Math.floor(hash * 1000)) % 360;
        this.color = `hsl(${hue}, 70%, 55%)`;

        // Build physical body
        this.buildBody(startX, startY);
    }

    /**
     * Construct the physical body topology.
     * @param {number} x
     * @param {number} y
     */
    buildBody(x, y) {
        const S = 30; // Scale factor

        // ── Particles ──────────────────────────────────────────────
        // 0: Head
        this.addParticle(x, y - S * 2);
        // 1: Torso
        this.addParticle(x, y - S);
        // 2: Hip Left
        this.addParticle(x - S, y - S * 0.5);
        // 3: Hip Right
        this.addParticle(x + S, y - S * 0.5);
        // 4: Knee Left
        this.addParticle(x - S, y + S);
        // 5: Knee Right
        this.addParticle(x + S, y + S);
        // 6: Foot Left
        this.addParticle(x - S, y + S * 2);
        // 7: Foot Right
        this.addParticle(x + S, y + S * 2);

        // ── Skeleton (rigid) ───────────────────────────────────────
        this.addBone(0, 1); // Head-Torso
        this.addBone(1, 2); // Torso-HipL
        this.addBone(1, 3); // Torso-HipR
        this.addBone(2, 3); // Hip width
        this.addBone(0, 2); // Head-HipL
        this.addBone(0, 3); // Head-HipR
        this.addBone(2, 4); // HipL-KneeL
        this.addBone(3, 5); // HipR-KneeR
        this.addBone(4, 6); // KneeL-FootL
        this.addBone(5, 7); // KneeR-FootR

        // ── Muscles (actuated) ─────────────────────────────────────
        // 7 muscles → 7 outputs from brain
        this.addMuscle(1, 4); // Torso-KneeL
        this.addMuscle(1, 5); // Torso-KneeR
        this.addMuscle(2, 6); // HipL-FootL
        this.addMuscle(3, 7); // HipR-FootR
        this.addMuscle(0, 4); // Head-KneeL
        this.addMuscle(0, 5); // Head-KneeR
        this.addMuscle(4, 5); // KneeL-KneeR (adductor)
        // Total: 7 muscles ✓
    }

    /** @param {number} x @param {number} y */
    addParticle(x, y) {
        this.particles.push(new Particle(x, y));
    }

    /**
     * Add a rigid bone between two particle indices.
     * @param {number} i1 @param {number} i2
     */
    addBone(i1, i2) {
        const p1 = this.particles[i1];
        const p2 = this.particles[i2];
        const dist = p1.pos.dist(p2.pos);
        this.constraints.push(new Constraint(p1, p2, dist, 1.0, false));
    }

    /**
     * Add an actuated muscle between two particle indices.
     * @param {number} i1 @param {number} i2
     */
    addMuscle(i1, i2) {
        const p1 = this.particles[i1];
        const p2 = this.particles[i2];
        const dist = p1.pos.dist(p2.pos);
        const muscle = new Constraint(p1, p2, dist, 0.5, true);
        this.constraints.push(muscle);
        this.muscles.push(muscle);
    }

    /**
     * Process sensory inputs and activate muscles via the brain.
     * Input layout (13 total):
     *   [0] body height (normalized)
     *   [1] vertical velocity
     *   [2] horizontal velocity
     *   [3] oscillation (CPG)
     *   [4] left foot ground contact
     *   [5] right foot ground contact
     *   [6-12] muscle length ratios (7 muscles)
     *
     * @param {number} time - Current simulation frame
     */
    think(time) {
        const inputs = [];

        // Sensor 0: Body height
        inputs.push(this.particles[1].pos.y / 600);

        // Sensor 1: Vertical velocity
        const vy = this.particles[1].pos.y - this.particles[1].oldPos.y;
        inputs.push(vy * 0.1);

        // Sensor 2: Horizontal velocity
        const vx = this.particles[1].pos.x - this.particles[1].oldPos.x;
        inputs.push(vx * 0.1);

        // Sensor 3: Central Pattern Generator (oscillation)
        inputs.push(Math.sin(time * 0.1));

        // Sensor 4: Left foot ground contact
        inputs.push(this.particles[6].pos.y > 590 ? 1 : 0);

        // Sensor 5: Right foot ground contact
        inputs.push(this.particles[7].pos.y > 590 ? 1 : 0);

        // Sensors 6-12: Proprioception (muscle length ratios)
        for (const m of this.muscles) {
            inputs.push(m.currentLength / m.restLength);
        }
        // inputs.length === 6 + 7 = 13 ✓

        const outputs = this.brain.predict(inputs);
        if (!outputs) return; // Safety guard

        for (let i = 0; i < this.muscles.length; i++) {
            this.muscles[i].contract(outputs[i]);
        }
    }

    /**
     * Update fitness score based on horizontal distance traveled.
     */
    updateFitness() {
        const cx = this.particles[1].pos.x;
        this.fitness = Math.max(0, cx - this.startX);
    }

    /**
     * Render the creature onto a canvas context.
     * @param {CanvasRenderingContext2D} ctx
     */
    draw(ctx) {
        // Draw constraints
        for (const c of this.constraints) {
            ctx.beginPath();
            ctx.moveTo(c.p1.pos.x, c.p1.pos.y);
            ctx.lineTo(c.p2.pos.x, c.p2.pos.y);

            if (c.isMuscle) {
                // Tension: negative = contracted (red), positive = expanded (blue)
                const tension = (c.currentLength - c.baseLength) / (c.baseLength + 0.001);
                const r = tension < 0 ? 255 : 50;
                const b = tension > 0 ? 255 : 50;
                const alpha = Math.min(1, 0.5 + Math.abs(tension) * 2);
                ctx.strokeStyle = `rgba(${r}, 80, ${b}, ${alpha})`;
                ctx.lineWidth = 3 + Math.abs(tension) * 4;
            } else {
                ctx.strokeStyle = 'rgba(220, 220, 220, 0.7)';
                ctx.lineWidth = 1.5;
            }
            ctx.stroke();
        }

        // Draw particles (joints)
        for (const p of this.particles) {
            ctx.beginPath();
            ctx.arc(p.pos.x, p.pos.y, p.radius, 0, Math.PI * 2);
            ctx.fillStyle = this.color;
            ctx.strokeStyle = 'rgba(255,255,255,0.4)';
            ctx.lineWidth = 1;
            ctx.fill();
            ctx.stroke();
        }
    }
}
