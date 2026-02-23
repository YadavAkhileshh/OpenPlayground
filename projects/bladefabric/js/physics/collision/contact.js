// contact.js
import { Vec2 } from '../../math/vec2.js';

export class ContactPoint {
    constructor() {
        this.position = new Vec2();
        this.normalImpulse = 0;
        this.tangentImpulse = 0;
        this.positionImpulse = 0;
        // Warm starting id
        this.id = { inEdge1: 0, outEdge1: 0, inEdge2: 0, outEdge2: 0 };
    }
}

export class Contact {
    constructor(bodyA, bodyB) {
        this.bodyA = bodyA;
        this.bodyB = bodyB;
        this.normal = new Vec2(); // From A to B
        this.penetration = 0;
        this.points = []; // Up to 2 points for 2D rigid bodies
        for (let i = 0; i < 2; i++) this.points.push(new ContactPoint());
        this.pointCount = 0;

        this.friction = Math.sqrt(bodyA.friction * bodyB.friction);
        this.restitution = Math.max(bodyA.restitution, bodyB.restitution);
    }
}
