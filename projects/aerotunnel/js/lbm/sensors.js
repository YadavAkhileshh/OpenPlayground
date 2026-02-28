/**
 * @file sensors.js
 * @description Physics sensors for measuring Aerodynamic Force (Lift/Drag).
 * Uses the Momentum Exchange Method.
 */

import { EX, EY, OPPOSITE, WEIGHTS } from '../lbm/constants.js';

export class AeroSensors {
    /**
     * @param {LBMSolver} solver 
     */
    constructor(solver) {
        this.solver = solver;
        this.dragForce = 0;
        this.liftForce = 0;
        this.history = [];
        this.maxHistory = 200;
    }

    /**
     * Calculate forces acting on all obstacles in the domain.
     * Momentum Exchange Method:
     * F = Sum_over_boundary_nodes ( Sum_over_directions ( e_i * (f_in + f_out) ) )
     * where boundary nodes are fluid nodes next to solid nodes.
     * 
     * In Bounce-back:
     * f_in is the particle coming FROM fluid TO solid.
     * f_out is the particle bouncing BACK (which is f_in, just reversed).
     * Momentum change = 2 * f_in.
     * Force on wall = Sum( 2 * f_i(fluid_node) * e_i ) for all links crossing boundary.
     */
    computeForces() {
        let fx = 0;
        let fy = 0;

        const { width, height, obstacles, f } = this.solver;

        // Reuse EX, EY from global scope import
        // If we iterate all nodes, find fluid nodes

        for (let y = 1; y < height - 1; y++) {
            for (let x = 1; x < width - 1; x++) {
                const idx = y * width + x;

                // If this is a FLUID node
                if (!obstacles[idx]) {
                    // Check neighbors for obstacles
                    for (let i = 1; i < 9; i++) {
                        const nx = x + EX[i];
                        const ny = y + EY[i];
                        const nIdx = ny * width + nx;

                        // If neighbor is solid
                        if (obstacles[nIdx]) {
                            // Defines a boundary link i
                            // Momentum transferred to wall = 2 * f_i[x] * e_i
                            // Wait, e_i points INTO the wall.
                            // Force is in direction of e_i.

                            // Actually, f[i] at fluid node 'idx' is moving TOWARDS neighbor 'nIdx'.
                            // It hits wall and comes back.
                            // Momentum change of particle: p_initial - p_final
                            // p_in = f[i] * e[i]
                            // p_out = f[i] * e[opposite[i]] = - f[i] * e[i]
                            // Delta P (fluid) = p_out - p_in = -2 * f[i] * e[i]
                            // Force on Fluid = Delta P / dt
                            // Force on Wall = - Force on Fluid = 2 * f[i] * e[i]

                            const val = 2.0 * f[i][idx]; // This is f_post_collision actually usually?
                            // Strictly it should be post-collision distribution.
                            // Since we run this typically after streaming? Or before?
                            // Typically computed using 'f' (current distribution before stream)
                            // or 'f' (post-streaming pre-collision).
                            // Let's assume called before step, so 'f' is valid.

                            fx += val * EX[i];
                            fy += val * EY[i];
                        }
                    }
                }
            }
        }

        // Smooth output
        this.dragForce = this.dragForce * 0.9 + fx * 0.1;
        this.liftForce = this.liftForce * 0.9 + fy * 0.1;

        this.history.push({ drag: this.dragForce, lift: this.liftForce });
        if (this.history.length > this.maxHistory) this.history.shift();
    }
}
