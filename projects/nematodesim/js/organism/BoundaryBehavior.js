// NematodeSim — Boundary Behavior
// Handles canvas edge interactions for all body nodes.
// Implements seamless toroidal wrapping: nodes that exit one side
// re-enter from the opposite side with continuity maintained across the chain.

import Config from '../sim/Config.js';

export class BoundaryBehavior {
    /**
     * @param {number} w  Canvas width
     * @param {number} h  Canvas height
     */
    constructor(w, h) {
        this.w = w;
        this.h = h;
        this.padding = Config.WORLD_PADDING;
        this.mode = 'wrap';   // 'wrap' | 'bounce' | 'none'
    }

    /**
     * Apply boundary constraints to all body nodes.
     * @param {Node[]} nodes  Ordered body node array
     */
    apply(nodes) {
        if (this.mode === 'wrap') this._wrap(nodes);
        else if (this.mode === 'bounce') this._bounce(nodes);
    }

    /**
     * Toroidal (wrap-around) boundary for individual nodes.
     * When a node crosses a boundary, it and its prev-position are offset
     * so the velocity vector is preserved (no discontinuity).
     * @param {Node[]} nodes
     */
    _wrap(nodes) {
        const w = this.w;
        const h = this.h;
        const n = nodes.length;

        for (let i = 0; i < n; i++) {
            const nd = nodes[i];
            if (nd.x < 0) {
                const delta = -nd.x;
                nd.x += w;
                nd.px += w;
            } else if (nd.x > w) {
                const delta = nd.x - w;
                nd.x -= w;
                nd.px -= w;
            }
            if (nd.y < 0) {
                nd.y += h;
                nd.py += h;
            } else if (nd.y > h) {
                nd.y -= h;
                nd.py -= h;
            }
        }
    }

    /**
     * Bounce (elastic reflection) boundary.
     * @param {Node[]} nodes
     */
    _bounce(nodes) {
        const w = this.w;
        const h = this.h;
        const n = nodes.length;

        for (let i = 0; i < n; i++) {
            const nd = nodes[i];
            if (nd.x < 0) {
                nd.x = -nd.x;
                nd.px = nd.x + (nd.x - nd.px);   // Reflect velocity
            } else if (nd.x > w) {
                nd.x = 2 * w - nd.x;
                nd.px = nd.x + (nd.x - nd.px);
            }
            if (nd.y < 0) {
                nd.y = -nd.y;
                nd.py = nd.y + (nd.y - nd.py);
            } else if (nd.y > h) {
                nd.y = 2 * h - nd.y;
                nd.py = nd.y + (nd.y - nd.py);
            }
        }
    }

    /** Update canvas size (on resize). */
    resize(w, h) {
        this.w = w;
        this.h = h;
    }

    /** Switch boundary mode. */
    setMode(m) {
        if (['wrap', 'bounce', 'none'].includes(m)) this.mode = m;
    }
}

export default BoundaryBehavior;
