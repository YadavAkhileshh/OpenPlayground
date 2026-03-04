// NematodeSim — Verlet Solver (Top-Level Orchestrator)
// Runs one full physics step comprising:
//   1. Clear forces
//   2. Apply gravity (zero in this sim)
//   3. Integrate positions (Verlet)
//   4. Clamp velocity
//   5. Solve constraints (N iterations)
//   6. Update velocity cache

import { Integrator } from './Integrator.js';
import { ConstraintSolver } from './ConstraintSolver.js';
import Config from '../sim/Config.js';

export class VerletSolver {
    /**
     * @param {number} [subSteps]   Number of sub-steps per render frame
     * @param {number} [dt]         Timestep in seconds
     */
    constructor(subSteps = Config.SUB_STEPS, dt = Config.DT) {
        this.subSteps = subSteps;
        this.dt = dt;
        this.integrator = new Integrator(Config.DAMPING);
        this.constraintSolver = new ConstraintSolver(Config.CONSTRAINT_ITERS);
        this._subDt = dt / subSteps;   // Sub-step timestep
        this._maxDisp = Config.MAX_SPEED_LIMIT * this._subDt;
    }

    /**
     * Advance the world one full frame.
     * External forces (drag, CPG) must be set on nodes BEFORE calling this.
     * @param {World} world   The physics world for one organism
     */
    step(world) {
        const subDt = this._subDt;
        const maxDisp = this._maxDisp;

        for (let s = 0; s < this.subSteps; s++) {
            // 1. Apply gravity (nop for this sim — overridden by drag)
            world.applyGravity();

            // 2. Verlet integrate
            this.integrator.integrateAll(world.nodes, subDt);

            // 3. Clamp displacement to prevent explosion
            this.integrator.clampAll(world.nodes, maxDisp);

            // 4. Satisfy constraints
            this.constraintSolver.solve(
                world.distConstraints,
                world.angleConstraints,
                subDt
            );
        }

        // Update velocity cache after all sub-steps
        this.integrator.updateVelocities(world.nodes, this.dt);

        // Clear force accumulators for next frame
        world.clearForces();
    }

    /**
     * Change sub-step count and recompute derived quantities.
     * @param {number} n
     */
    setSubSteps(n) {
        this.subSteps = Math.max(1, Math.min(16, n));
        this._subDt = this.dt / this.subSteps;
        this._maxDisp = Config.MAX_SPEED_LIMIT * this._subDt;
    }

    /** Adjust damping (called when viscosity slider changes). */
    setDamping(d) {
        this.integrator.setDamping(d);
    }

    /** Diagnostic: total constraint error across a world. */
    constraintError(world) {
        return this.constraintSolver.totalError(
            world.distConstraints,
            world.angleConstraints
        );
    }
}

export default VerletSolver;
