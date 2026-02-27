// NematodeSim — Base Constraint
// Abstract base for all pairwise constraints in the Verlet world.
export class Constraint {
    constructor(nodeA, nodeB) {
        this.nodeA = nodeA; this.nodeB = nodeB;
        this.active = true; this.stiffness = 1.0;
        this.compliance = 0.0; this.lambda = 0.0;
        this.debugColor = '#ffffff'; this.drawDebug = false;
    }
    // Override in subclasses
    solve(dt) { }
    resetLambda() { this.lambda = 0.0; }
    setStiffness(s) { this.stiffness = Math.max(0.0, Math.min(1.0, s)); return this; }
    setCompliance(c) { this.compliance = Math.max(0.0, c); return this; }
    enable() { this.active = true; return this; }
    disable() { this.active = false; return this; }
    isActive() { return this.active; }
    error() { return 0.0; }
    distanceSq() {
        const dx = this.nodeB.x - this.nodeA.x;
        const dy = this.nodeB.y - this.nodeA.y;
        return dx * dx + dy * dy;
    }
    distance() { return Math.sqrt(this.distanceSq()); }
}
export default Constraint;
