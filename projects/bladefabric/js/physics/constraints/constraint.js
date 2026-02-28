// constraint.js
export class Constraint {
    constructor(bodyA, bodyB) {
        this.bodyA = bodyA;
        this.bodyB = bodyB;
        this.isTearable = false;
        this.currentForce = 0;
    }

    preStep(dt) { }
    solveVelocity(dt) { }
    solvePosition() { }
}
