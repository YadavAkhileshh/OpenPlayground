/**
 * NumericalGradient.js – Finite-difference gradient computation over the SDF field.
 * Computes ∇SDF(x,y) = (∂SDF/∂x, ∂SDF/∂y) numerically using central differences.
 */

const NumericalGradient = (() => {
    'use strict';

    const { SDFSampler, Config, MathUtils } = window.SDFChisel;
    const H = Config.GRADIENT.H;

    /**
     * Compute the gradient of SDF at canvas-space position (cx, cy).
     * Uses central finite differences with step h.
     * @param {number} cx – canvas x
     * @param {number} cy – canvas y
     * @param {number} [h] – finite difference step (canvas px)
     * @returns {{ gx: number, gy: number, magnitude: number }}
     */
    function gradient(cx, cy, h = H) {
        const gx = (SDFSampler.sample(cx + h, cy) - SDFSampler.sample(cx - h, cy)) / (2 * h);
        const gy = (SDFSampler.sample(cx, cy + h) - SDFSampler.sample(cx, cy - h)) / (2 * h);
        const magnitude = Math.sqrt(gx * gx + gy * gy);
        return { gx, gy, magnitude };
    }

    /**
     * Compute gradient and return a normalized direction vector.
     * Returns { nx, ny, magnitude } where (nx,ny) is a unit vector.
     */
    function normalizedGradient(cx, cy, h = H) {
        const { gx, gy, magnitude } = gradient(cx, cy, h);
        if (magnitude < MathUtils.EPSILON) return { nx: 0, ny: 0, magnitude: 0 };
        return { nx: gx / magnitude, ny: gy / magnitude, magnitude };
    }

    /**
     * Compute the gradient force for a particle to move it toward the glyph.
     * The force points in the -∇SDF direction (toward decreasing SDF = inside glyph).
     * @param {number} cx
     * @param {number} cy
     * @param {number} speed – scale factor from UI
     * @param {number} h
     * @returns {{ fx: number, fy: number, sdfVal: number }}
     */
    function descentForce(cx, cy, speed, h = H) {
        const sdfVal = SDFSampler.sample(cx, cy);
        const { gx, gy, magnitude } = gradient(cx, cy, h);

        // If magnitude is near-zero, no gradient info available
        if (magnitude < MathUtils.EPSILON) return { fx: 0, fy: 0, sdfVal };

        // Force is toward negative SDF (inside glyph = edge at SDF=0)
        // We want particles to converge to the zero-crossing of the SDF
        const target = -sdfVal; // how much to move along gradient
        const scale = speed * MathUtils.clamp(Math.abs(target) / magnitude, 0, 5.0);

        const nx = gx / magnitude;
        const ny = gy / magnitude;

        return {
            fx: nx * scale * Math.sign(target),
            fy: ny * scale * Math.sign(target),
            sdfVal
        };
    }

    /**
     * Compute the second-order derivative (Laplacian) at (cx,cy).
     * Useful for curvature-based adaptive step sizing.
     */
    function laplacian(cx, cy, h = H) {
        const f00 = SDFSampler.sample(cx, cy);
        const fxp = SDFSampler.sample(cx + h, cy);
        const fxm = SDFSampler.sample(cx - h, cy);
        const fyp = SDFSampler.sample(cx, cy + h);
        const fym = SDFSampler.sample(cx, cy - h);
        return (fxp + fxm + fyp + fym - 4 * f00) / (h * h);
    }

    /**
     * Higher-accuracy 5-point stencil gradient (4th order).
     */
    function gradient5pt(cx, cy, h = H) {
        const fxpp = SDFSampler.sample(cx + 2 * h, cy);
        const fxp = SDFSampler.sample(cx + h, cy);
        const fxm = SDFSampler.sample(cx - h, cy);
        const fxmm = SDFSampler.sample(cx - 2 * h, cy);
        const fypp = SDFSampler.sample(cx, cy + 2 * h);
        const fyp = SDFSampler.sample(cx, cy + h);
        const fym = SDFSampler.sample(cx, cy - h);
        const fymm = SDFSampler.sample(cx, cy - 2 * h);
        const gx = (-fxpp + 8 * fxp - 8 * fxm + fxmm) / (12 * h);
        const gy = (-fypp + 8 * fyp - 8 * fym + fymm) / (12 * h);
        const magnitude = Math.sqrt(gx * gx + gy * gy);
        return { gx, gy, magnitude };
    }

    return {
        gradient,
        normalizedGradient,
        descentForce,
        laplacian,
        gradient5pt,
    };
})();

window.SDFChisel = window.SDFChisel || {};
window.SDFChisel.NumericalGradient = NumericalGradient;
