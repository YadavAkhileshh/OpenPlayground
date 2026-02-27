// NematodeSim — Body
// The physical body of a nematode: an ordered chain of Nodes connected by
// DistanceConstraints (structural) and AngleConstraints (bending resistance).
// Lives inside a World and is stepped by VerletSolver.

import { Node } from '../verlet/Node.js';
import { DistanceConstraint } from '../verlet/DistanceConstraint.js';
import { AngleConstraint } from '../verlet/AngleConstraint.js';
import { World } from '../verlet/World.js';
import Config from '../sim/Config.js';

export class Body {
    /**
     * @param {number} segmentCount  Number of nodes in the chain
     * @param {number} segmentLength Rest length per segment
     */
    constructor(segmentCount = Config.SEGMENT_COUNT, segmentLength = Config.SEGMENT_LENGTH) {
        this.nodes = [];
        this.distConstraints = [];
        this.angleConstraints = [];
        this.world = new World();
        this.segmentLength = segmentLength;
        this.segmentCount = segmentCount;
        this._built = false;
    }

    /**
     * Lay out the chain at a given starting position and orientation angle.
     * @param {number} x0     Head X
     * @param {number} y0     Head Y
     * @param {number} angle  Body orientation (radians from +X axis)
     */
    build(x0, y0, angle = 0) {
        const dx = Math.cos(angle) * this.segmentLength;
        const dy = Math.sin(angle) * this.segmentLength;

        for (let i = 0; i < this.segmentCount; i++) {
            const nx = x0 + dx * i + (Math.random() - 0.5) * 0.5;
            const ny = y0 + dy * i + (Math.random() - 0.5) * 0.5;
            const node = new Node(nx, ny, Config.NODE_MASS);
            node.index = i;
            node.radius = this._radiusAt(i);
            this.nodes.push(node);
            this.world.addNode(node);
        }

        // Distance constraints between adjacent nodes
        for (let i = 0; i < this.segmentCount - 1; i++) {
            const dc = new DistanceConstraint(this.nodes[i], this.nodes[i + 1], this.segmentLength);
            dc.setStiffness(Config.DIST_STIFFNESS);
            this.distConstraints.push(dc);
            this.world.addDistanceConstraint(dc);
        }

        // Angle constraints on triplets for bending resistance
        for (let i = 1; i < this.segmentCount - 1; i++) {
            const ac = new AngleConstraint(
                this.nodes[i - 1], this.nodes[i], this.nodes[i + 1],
                Math.PI   // Rest at straight
            );
            this.angleConstraints.push(ac);
            this.world.addAngleConstraint(ac);
        }

        this._built = true;
    }

    /** Interpolated radius at node index i. */
    _radiusAt(i) {
        const t = i / (this.segmentCount - 1);
        const h = Config.RADIUS_HEAD;
        const m = Config.RADIUS_MID;
        const tl = Config.RADIUS_TAIL;
        if (t < 0.5) return h + (m - h) * (t * 2);
        return m + (tl - m) * ((t - 0.5) * 2);
    }

    /** Centre of mass (average position of all nodes). */
    centreOfMass() {
        let cx = 0, cy = 0;
        const n = this.nodes.length;
        for (let i = 0; i < n; i++) { cx += this.nodes[i].x; cy += this.nodes[i].y; }
        return { x: cx / n, y: cy / n };
    }

    /** Head node (index 0). */
    get head() { return this.nodes[0]; }

    /** Tail node (last index). */
    get tail() { return this.nodes[this.nodes.length - 1]; }

    /** Total body length (sum of actual segment distances). */
    totalLength() {
        let len = 0;
        const n = this.nodes.length;
        for (let i = 1; i < n; i++) len += this.nodes[i - 1].distanceTo(this.nodes[i]);
        return len;
    }
}

export default Body;
