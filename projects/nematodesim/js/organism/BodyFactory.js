// NematodeSim — Body Factory
// Constructs fully initialized NematodeOrganism bodies at random canvas positions.
// Encapsulates all spawn logic: position, orientation, color, and body parameters.

import { Body } from './Body.js';
import Config from '../sim/Config.js';

export class BodyFactory {
    /**
     * @param {number} canvasW  Canvas width
     * @param {number} canvasH  Canvas height
     */
    constructor(canvasW, canvasH) {
        this.canvasW = canvasW;
        this.canvasH = canvasH;
        this._counter = 0;   // Auto-increment for organism IDs
    }

    /**
     * Build and return a Body placed at a random position.
     * Avoids the canvas margin to prevent immediate boundary issues.
     * @param {Object} [opts]  Optional overrides for segments/length
     * @returns {Body}
     */
    create(opts = {}) {
        const margin = Config.WORLD_PADDING + Config.SEGMENT_COUNT * Config.SEGMENT_LENGTH + 20;
        const maxX = this.canvasW - margin;
        const maxY = this.canvasH - margin;

        // Random head position, safely inside canvas
        const x0 = margin + Math.random() * Math.max(0, maxX - margin);
        const y0 = margin + Math.random() * Math.max(0, maxY - margin);
        const angle = Math.random() * 2 * Math.PI;

        const segs = opts.segmentCount || Config.SEGMENT_COUNT;
        const len = opts.segmentLength || Config.SEGMENT_LENGTH;

        const body = new Body(segs, len);
        body.build(x0, y0, angle);
        body.id = this._counter++;
        body.color = Config.ORGANISM_COLORS[body.id % Config.ORGANISM_COLORS.length];
        return body;
    }

    /**
     * Build a body at an exact position with explicit orientation.
     * @param {number} x0
     * @param {number} y0
     * @param {number} angle  Radians
     * @returns {Body}
     */
    createAt(x0, y0, angle = 0) {
        const body = new Body(Config.SEGMENT_COUNT, Config.SEGMENT_LENGTH);
        body.build(x0, y0, angle);
        body.id = this._counter++;
        body.color = Config.ORGANISM_COLORS[body.id % Config.ORGANISM_COLORS.length];
        return body;
    }

    /**
     * Respawn a body at a new random location (reuses same object).
     * All nodes are repositioned and velocities zeroed.
     * @param {Body} body
     */
    respawn(body) {
        const margin = Config.WORLD_PADDING + 40;
        const x0 = margin + Math.random() * (this.canvasW - margin * 2);
        const y0 = margin + Math.random() * (this.canvasH - margin * 2);
        const angle = Math.random() * 2 * Math.PI;

        const dx = Math.cos(angle) * body.segmentLength;
        const dy = Math.sin(angle) * body.segmentLength;

        // Reposition each node
        body.nodes.forEach((node, i) => {
            node.x = x0 + dx * i;
            node.y = y0 + dy * i;
            node.px = node.x;
            node.py = node.y;
            node.fx = 0; node.fy = 0;
        });
    }

    /** Update canvas dimensions (e.g. on window resize). */
    resize(w, h) {
        this.canvasW = w;
        this.canvasH = h;
    }
}

export default BodyFactory;
