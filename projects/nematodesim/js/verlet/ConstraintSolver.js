// NematodeSim — Constraint Solver
// Runs iterative Jacobi relaxation over all world constraints.
// Called multiple times per sub-step to progressively satisfy constraints.

import Config from '../sim/Config.js';

export class ConstraintSolver {
    /**
     * @param {number} iterations  Jacobi iterations per solve() call
     */
    constructor(iterations = Config.CONSTRAINT_ITERS) {
        this.iterations = iterations;
    }

    /**
     * Solve all active constraints for the given number of iterations.
     * Mixes distance and angle constraints together in one pass for stability.
     * @param {Array} distConstraints  Array of DistanceConstraint
     * @param {Array} angleConstraints Array of AngleConstraint
     * @param {number} dt             Sub-step timestep
     */
    solve(distConstraints, angleConstraints, dt) {
        const dLen = distConstraints.length;
        const aLen = angleConstraints.length;

        for (let iter = 0; iter < this.iterations; iter++) {
            // Distance constraints first (structural integrity)
            for (let i = 0; i < dLen; i++) {
                if (distConstraints[i].active) {
                    distConstraints[i].solve(dt);
                }
            }
            // Angle constraints (bending resistance)
            for (let i = 0; i < aLen; i++) {
                if (angleConstraints[i].active) {
                    angleConstraints[i].solve(dt);
                }
            }
        }
    }

    /**
     * Solve only distance constraints. Useful during warm-up.
     * @param {Array}  dc  Array of DistanceConstraint
     * @param {number} dt
     */
    solveDistance(dc, dt) {
        const n = dc.length;
        for (let iter = 0; iter < this.iterations; iter++) {
            for (let i = 0; i < n; i++) {
                if (dc[i].active) dc[i].solve(dt);
            }
        }
    }

    /**
     * Compute total constraint error (sum of per-constraint errors).
     * Useful for diagnostics and stability monitoring.
     * @param {Array} dc  Distance constraints
     * @param {Array} ac  Angle constraints
     * @returns {number}  Total error
     */
    totalError(dc, ac) {
        let err = 0;
        for (let i = 0; i < dc.length; i++) err += dc[i].error();
        for (let i = 0; i < ac.length; i++) err += ac[i].error();
        return err;
    }

    /** Change iteration count at runtime (e.g. from quality slider). */
    setIterations(n) {
        this.iterations = Math.max(1, Math.min(32, Math.round(n)));
    }
}

export default ConstraintSolver;
