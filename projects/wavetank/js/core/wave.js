/**
 * wave.js — Discrete 2D Wave Equation Stepper (FDTD)
 *
 * The wave equation in discrete form:
 *   u_next[x,y] = (2 - 4·k) · u[x,y]
 *                 - u_prev[x,y]
 *                 + k · (u[x+1,y] + u[x-1,y] + u[x,y+1] + u[x,y-1])
 *
 * where k = c²·dt²/dx²  (Courant number, per cell based on depth)
 *
 * Stability criterion: k ≤ 0.5 (enforced by clamping c).
 * Absorbing edges via a 4-cell damped border zone.
 */

const BORDER_DEPTH = 4; // cells for absorbing boundary

export class WaveStepper {
    /**
     * @param {Grid} grid
     * @param {object} params
     * @param {number} params.damping  - global energy loss per step (0.99–0.9999)
     * @param {number} params.maxSpeed - max wave speed (c) for deep water cells
     */
    constructor(grid, params = {}) {
        this.grid = grid;
        this.damping = params.damping ?? 0.997;
        this.maxSpeed = params.maxSpeed ?? 0.48; // must satisfy k ≤ 0.5 with dx=1,dt=1
    }

    /**
     * Advance the simulation by one time step.
     * Writes new values into grid.curr, then swaps buffers.
     */
    step() {
        const { width, height, curr, prev, depth, barrier } = this.grid;
        const damping = this.damping;
        const maxC = this.maxSpeed;

        // Temporary output buffer (reuse a local array from a pool if needed)
        // For simplicity we compute in-place using the prev buffer as scratch.
        // We need a true next buffer to avoid read/write hazard.
        // Allocate once and reuse:
        if (!this._next || this._next.length !== this.grid.size) {
            this._next = new Float32Array(this.grid.size);
        }
        const next = this._next;

        for (let y = 0; y < height; y++) {
            for (let x = 0; x < width; x++) {
                const i = y * width + x;

                // Barriers are hard reflectors — always 0
                if (barrier[i]) {
                    next[i] = 0;
                    continue;
                }

                // Wave speed from depth map: depth 0 → min speed, 255 → maxC
                const d = depth[i] / 255;
                const c = 0.05 + d * (maxC - 0.05); // range [0.05, maxC]
                const k = c * c; // k = c²·dt²/dx² (dt=dx=1)

                // Neighbour values (clamped to border reflection / absorption)
                const left = x > 0 ? curr[i - 1] : 0;
                const right = x < width - 1 ? curr[i + 1] : 0;
                const up = y > 0 ? curr[i - width] : 0;
                const down = y < height - 1 ? curr[i + width] : 0;

                // FDTD update
                let val = (2 - 4 * k) * curr[i]
                    - prev[i]
                    + k * (left + right + up + down);

                // Apply global damping
                val *= damping;

                // Absorbing boundary: linear ramp attenuation near edges
                const bx = Math.min(x, width - 1 - x, BORDER_DEPTH);
                const by = Math.min(y, height - 1 - y, BORDER_DEPTH);
                const border = Math.min(bx, by);
                if (border < BORDER_DEPTH) {
                    const fade = border / BORDER_DEPTH;
                    val *= fade * fade; // quadratic fade at edges
                }

                next[i] = val;
            }
        }

        // Copy next → curr, curr → prev
        const tmpPrev = this.grid.prev;
        this.grid.prev = this.grid.curr;
        this.grid.curr = this._next;
        this._next = tmpPrev; // recycle old prev as next _next buffer
    }
}
