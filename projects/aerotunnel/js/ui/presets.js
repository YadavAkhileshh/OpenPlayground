/**
 * @file presets.js
 * @description Generates preset obstacle shapes (Airfoils, Cylinders, Plates).
 */

import { naca4 } from '../utils/math.js';

export class ObstaclePresets {
    /**
     * @param {LBMSolver} solver 
     */
    constructor(solver) {
        this.solver = solver;
        this.width = solver.width;
        this.height = solver.height;
    }

    /**
     * Place a Cylinder in the flow.
     * @param {number} cx - Center X (relative 0-1)
     * @param {number} cy - Center Y (relative 0-1)
     * @param {number} radius - Radius (relative to height)
     */
    drawCylinder(cx = 0.3, cy = 0.5, radius = 0.1) {
        const r = radius * this.height;
        const x0 = Math.floor(cx * this.width);
        const y0 = Math.floor(cy * this.height);

        // Use the existing setObstacle method which loops efficiently
        this.solver.setObstacle(x0, y0, r, true);
    }

    /**
     * Place a symmetrical NACA airfoil.
     * @param {number} cx - Leading edge X (relative)
     * @param {number} cy - Center Y (relative)
     * @param {number} chord - Chord length (relative to width)
     * @param {number} thickness - Max thickness (e.g. 0.12)
     * @param {number} angle - Angle of attack in degrees
     */
    drawAirfoil(cx = 0.2, cy = 0.5, chord = 0.4, thickness = 0.15, angle = 0) {
        const chordLen = chord * this.width;
        const startX = Math.floor(cx * this.width);
        const startY = Math.floor(cy * this.height);

        const rad = angle * Math.PI / 180;
        const cos = Math.cos(rad);
        const sin = Math.sin(rad);

        // Scan a bounding box
        // To be safe, scan standard box relative to chord
        // This is a rasterization problem.
        // Simple way: iterate over x along chord, calculate thickness, rotate points.

        // Better: Iterate grid points in bounding box and check if inside.
        // Rotate point BACK to airfoil frame and check.

        const padding = chordLen * 0.2;
        const minX = startX - padding;
        const maxX = startX + chordLen + padding;
        const minY = startY - chordLen / 2;
        const maxY = startY + chordLen / 2;

        for (let j = Math.floor(minY); j < Math.ceil(maxY); j++) {
            for (let i = Math.floor(minX); i < Math.ceil(maxX); i++) {
                if (i < 0 || i >= this.width || j < 0 || j >= this.height) continue;

                // Translate to leading edge
                const dx = i - startX;
                const dy = j - startY;

                // Rotate back to horizontal
                const lx = dx * cos + dy * sin;
                const ly = -dx * sin + dy * cos;

                // Normalize to chord
                const xNorm = lx / chordLen;

                if (xNorm >= 0 && xNorm <= 1) {
                    const halfThick = naca4(xNorm, thickness) * chordLen;
                    if (Math.abs(ly) <= halfThick) {
                        const idx = j * this.width + i;
                        this.solver.obstacles[idx] = 1;
                        this.solver.ux[idx] = 0;
                        this.solver.uy[idx] = 0;
                    }
                }
            }
        }
    }
}
