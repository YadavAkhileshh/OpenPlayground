// NematodeSim — NematodeOrganism
// Top-level entity that binds body physics, CPG oscillation, drag, and thrust.
// One NematodeOrganism = one worm on screen. The Population manages multiple.

import { Body } from './Body.js';
import { CPG } from '../oscillator/CPG.js';
import { ContractionEngine } from '../oscillator/ContractionEngine.js';
import { AnisotropicDrag } from '../drag/AnisotropicDrag.js';
import { ThrustCalculator } from '../drag/ThrustCalculator.js';
import { VerletSolver } from '../verlet/VerletSolver.js';
import { BoundaryBehavior } from './BoundaryBehavior.js';
import Config from '../sim/Config.js';

export class NematodeOrganism {
    /**
     * @param {Body}          body
     * @param {FluidMedium}   fluid
     * @param {number}        canvasW
     * @param {number}        canvasH
     */
    constructor(body, fluid, canvasW, canvasH) {
        this.body = body;
        this.fluid = fluid;
        this.canvasW = canvasW;
        this.canvasH = canvasH;
        this.id = body.id;
        this.color = body.color;

        // Physics engine
        this.solver = new VerletSolver(Config.SUB_STEPS, Config.DT);

        // Neuromuscular oscillator
        this.cpg = new CPG(body.segmentCount, Config.FREQUENCY_DEFAULT);

        // Muscle force application
        this.contraction = new ContractionEngine(this.cpg);

        // Drag physics
        this.drag = new AnisotropicDrag(fluid.viscosity);

        // Thrust estimation
        this.thrust = new ThrustCalculator();

        // Boundary handling
        this.boundary = new BoundaryBehavior(canvasW, canvasH);

        // State
        this.alive = true;
        this.age = 0;   // Frames since spawn
    }

    /**
     * Advance organism by one simulation frame.
     * @param {number} dt  Timestep in seconds
     */
    update(dt) {
        if (!this.alive) return;

        // 1. Advance CPG clock → compute per-segment activations
        this.cpg.update(dt);

        // 2. Apply muscle contraction forces to body nodes
        this.contraction.apply(this.body.nodes, dt);

        // 3. Apply anisotropic drag to all body segments
        this.drag.applyToChain(this.body.nodes, dt);

        // 4. Verlet integrate + solve constraints
        this.solver.step(this.body.world);

        // 5. Wrap/bounce at canvas boundary
        this.boundary.apply(this.body.nodes);

        // 6. Update thrust tracking
        this.thrust.update(this.body.nodes, dt);

        this.age++;
    }

    /** Set oscillation frequency for this organism's CPG. */
    setFrequency(hz) {
        this.cpg.setFrequency(hz);
    }

    /** Update viscosity (propagates to drag model). */
    setViscosity(v) {
        this.drag.setViscosity(v);
        this.solver.setDamping(0.9985 - v * 0.059);
    }

    /** Resize canvas bounds. */
    resize(w, h) {
        this.canvasW = w;
        this.canvasH = h;
        this.boundary.resize(w, h);
    }

    /** Current forward speed estimate. */
    get speed() { return this.thrust.forwardSpeed(); }
}

export default NematodeOrganism;
