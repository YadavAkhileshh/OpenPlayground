// body.js
import { Transform } from '../math/transform.js';
import { Vec2 } from '../math/vec2.js';
import { MassData } from './massData.js';

export const BodyType = {
    STATIC: 0,
    KINEMATIC: 1,
    DYNAMIC: 2,
    SOFT: 3     // Part of a cloth/fabric mesh
};

// Generate unique IDs
let bodyIdCounter = 0;

export class Body {
    constructor(shape, x = 0, y = 0, type = BodyType.DYNAMIC) {
        this.id = ++bodyIdCounter;
        this.shape = shape;
        this.type = type;

        this.transform = new Transform(new Vec2(x, y), 0);

        this.velocity = new Vec2(0, 0);
        this.angularVelocity = 0;

        this.force = new Vec2(0, 0);
        this.torque = 0;

        this.massData = new MassData();

        this.restitution = shape.restitution;
        this.friction = shape.friction;

        // Custom properties for game mechanics
        this.color = '#fff';
        this.isBlade = false;
        this.isSlicable = true;
        this.canSlice = false;

        // Caching
        this.aabb = null;
        this.needsAABBUpdate = true;

        this.updateMass();
    }

    get position() { return this.transform.position; }
    get angle() { return this.transform.angle; }

    setPosition(p) {
        this.transform.position.copy(p);
        this.needsAABBUpdate = true;
    }

    setAngle(angle) {
        this.transform.setAngle(angle);
        this.needsAABBUpdate = true;
    }

    updateMass() {
        if (this.type === BodyType.STATIC || this.type === BodyType.KINEMATIC) {
            this.massData.set(0, 0);
        } else {
            this.massData = this.shape.computeMass(this.shape.density);
        }
    }

    applyForce(f, p = null) {
        this.force.add(f);
        if (p) {
            const r = Vec2.sub(p, this.transform.position);
            this.torque += Vec2.cross(r, f);
        }
    }

    applyImpulse(impulse, p) {
        if (this.type === BodyType.STATIC) return;

        this.velocity.x += this.massData.invMass * impulse.x;
        this.velocity.y += this.massData.invMass * impulse.y;

        const r = Vec2.sub(p, this.transform.position);
        this.angularVelocity += this.massData.invInertia * Vec2.cross(r, impulse);
    }

    getVelocityAtPoint(p) {
        const r = Vec2.sub(p, this.transform.position);
        // v + w x r
        return new Vec2(
            this.velocity.x - this.angularVelocity * r.y,
            this.velocity.y + this.angularVelocity * r.x
        );
    }

    getAABB() {
        if (this.needsAABBUpdate || !this.aabb) {
            this.aabb = this.shape.computeAABB(this.transform);
            this.needsAABBUpdate = false;
        }
        return this.aabb;
    }

    synchronize() {
        this.needsAABBUpdate = true;
    }
}
