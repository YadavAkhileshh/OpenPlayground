// NematodeSim — Physics World
// Container for nodes and constraints; stepped by VerletSolver.
export class World {
    constructor() {
        this.nodes = [];
        this.distConstraints = [];
        this.angleConstraints = [];
        this.gravity = { x: 0, y: 0 };
    }
    addNode(n) { this.nodes.push(n); return n; }
    addDistanceConstraint(c) { this.distConstraints.push(c); return c; }
    addAngleConstraint(c) { this.angleConstraints.push(c); return c; }
    clearForces() {
        const nd = this.nodes;
        for (let i = 0; i < nd.length; i++) nd[i].clearForces();
    }
    applyGravity() {
        if (!this.gravity.x && !this.gravity.y) return;
        const nd = this.nodes;
        for (let i = 0; i < nd.length; i++) {
            if (!nd[i].pinned) {
                nd[i].addForce(this.gravity.x * nd[i].mass, this.gravity.y * nd[i].mass);
            }
        }
    }
    hasInvalidNodes() {
        const nd = this.nodes;
        for (let i = 0; i < nd.length; i++) if (!nd[i].isValid()) return true;
        return false;
    }
    resetVelocities() {
        const nd = this.nodes;
        for (let i = 0; i < nd.length; i++) { nd[i].px = nd[i].x; nd[i].py = nd[i].y; }
    }
    kineticEnergy() {
        let ke = 0;
        const nd = this.nodes;
        for (let i = 0; i < nd.length; i++) {
            const dx = nd[i].x - nd[i].px; const dy = nd[i].y - nd[i].py;
            ke += dx * dx + dy * dy;
        }
        return ke;
    }
    countViolations(thresh = 1.0) {
        let c = 0;
        const dc = this.distConstraints;
        for (let i = 0; i < dc.length; i++) if (dc[i].error() > thresh) c++;
        return c;
    }
}
export default World;
