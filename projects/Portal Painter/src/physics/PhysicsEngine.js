import { Vector2 } from './Vector2.js';

export class PhysicsEngine {
    constructor() {
        this.bodies = [];
        this.gravity = 9.8 * 50; // Scaled gravity
    }

    addBody(body) {
        this.bodies.push(body);
    }

    removeBody(body) {
        const index = this.bodies.indexOf(body);
        if (index > -1) {
            this.bodies.splice(index, 1);
        }
    }

    update(dt) {
        for (const body of this.bodies) {
            if (body.isStatic) continue;

            // Apply Gravity
            if (body.useGravity) {
                // Apply gravity as a force or direct acceleration? 
                // Body.update uses F=ma. Gravity is acceleration.
                // standard gravity force = m * g.
                // We can just add to velocity for simple Euler or add to force.
                // Let's add to velocity directly for stability or add force.
                // body.applyForce(new Vector2(0, this.gravity * body.mass)); 
                // But let's stick to velocity modification for now as it's simple
                body.velocity.y += this.gravity * dt;
            }

            // Update Body (Integration)
            body.update(dt);
        }

        this.checkCollisions();
    }

    checkCollisions() {
        for (let i = 0; i < this.bodies.length; i++) {
            for (let j = i + 1; j < this.bodies.length; j++) {
                const b1 = this.bodies[i];
                const b2 = this.bodies[j];

                if (b1.isStatic && b2.isStatic) continue; // Static bodies don't collide
                if (!b1.collider || !b2.collider) continue;

                const collision = this.resolveCollision(b1, b2);
                if (collision) {
                    this.applyResolution(b1, b2, collision);
                }
            }
        }
    }

    resolveCollision(b1, b2) {
        // Assume Box vs Box for simplifiction in this step, expand later
        // or check types
        if (b1.collider.radius && b2.collider.radius) {
            // Circle vs Circle
            return this.intersectCircleCircle(b1, b2);
        } else if (b1.collider.width && b2.collider.width) {
            // Box vs Box
            return this.intersectAABB(b1, b2);
        } else {
            // Box vs Circle
            if (b1.collider.width) return this.intersectBoxCircle(b1, b2);
            else return this.intersectBoxCircle(b2, b1);
        }
    }

    intersectAABB(b1, b2) {
        const c1 = b1.collider;
        const c2 = b2.collider;

        if (Math.abs(b1.position.x - b2.position.x) < c1.halfWidth + c2.halfWidth &&
            Math.abs(b1.position.y - b2.position.y) < c1.halfHeight + c2.halfHeight) {

            // Calculate overlap
            const overlapX = (c1.halfWidth + c2.halfWidth) - Math.abs(b1.position.x - b2.position.x);
            const overlapY = (c1.halfHeight + c2.halfHeight) - Math.abs(b1.position.y - b2.position.y);

            if (overlapX < overlapY) {
                const normal = new Vector2(b1.position.x < b2.position.x ? -1 : 1, 0);
                return { normal, depth: overlapX };
            } else {
                const normal = new Vector2(0, b1.position.y < b2.position.y ? -1 : 1);
                return { normal, depth: overlapY };
            }
        }
        return null;
    }

    intersectCircleCircle(b1, b2) {
        const dist = b1.position.dist(b2.position);
        const radiusSum = b1.collider.radius + b2.collider.radius;

        if (dist < radiusSum) {
            const normal = b1.position.clone().sub(b2.position).normalize();
            return { normal, depth: radiusSum - dist };
        }
        return null;
    }

    intersectBoxCircle(box, circle) {
        // Find closest point on box/AABB to the circle center
        const c = circle.collider;
        const b = box.collider;

        const closestX = Math.max(box.position.x - b.halfWidth, Math.min(circle.position.x, box.position.x + b.halfWidth));
        const closestY = Math.max(box.position.y - b.halfHeight, Math.min(circle.position.y, box.position.y + b.halfHeight));

        const distX = circle.position.x - closestX;
        const distY = circle.position.y - closestY;
        const distanceSquared = (distX * distX) + (distY * distY);

        if (distanceSquared < (c.radius * c.radius)) {
            const distance = Math.sqrt(distanceSquared);
            const normal = new Vector2(distX, distY).normalize();
            // If center is inside, normal needs to be flipped/handled? 
            // For now assume center is outside essentially or push out closest edge

            if (distance === 0) {
                // Circle center is inside the box
                // This requires more complex unresolved logic, handle simply for now: push up
                return { normal: new Vector2(0, -1), depth: c.radius };
            }

            return { normal, depth: c.radius - distance };
        }
        return null;
    }

    applyResolution(b1, b2, collision) {
        // If trigger, just notify (TODO)
        if (b1.collider.isTrigger || b2.collider.isTrigger) return;

        const { normal, depth } = collision;

        // Positional correction (prevent sinking)
        const totalInvMass = b1.invMass + b2.invMass;
        if (totalInvMass === 0) return;

        const correction = normal.clone().mult(depth / totalInvMass * 0.8); // 0.8 pos correction rate
        if (!b1.isStatic) b1.position.add(correction.clone().mult(b1.invMass));
        if (!b2.isStatic) b2.position.sub(correction.clone().mult(b2.invMass));

        // Velocity resolution
        const relVel = b1.velocity.clone().sub(b2.velocity);
        const velAlongNormal = relVel.dot(normal);

        if (velAlongNormal > 0) return; // Moving apart

        const e = Math.min(b1.restitution, b2.restitution);
        let j = -(1 + e) * velAlongNormal;
        j /= totalInvMass;

        const impulse = normal.clone().mult(j);
        if (!b1.isStatic) b1.velocity.add(impulse.clone().mult(b1.invMass));
        if (!b2.isStatic) b2.velocity.sub(impulse.clone().mult(b2.invMass));

        // Trigger callbacks
        if (b1.entity && b1.entity.onCollision) {
            b1.entity.onCollision(b2.entity || b2, normal.clone()); // Normal points from b2 to b1 usually, check implementation
        }
        if (b2.entity && b2.entity.onCollision) {
            // For b2, normal is inverted
            b2.entity.onCollision(b1.entity || b1, normal.clone().mult(-1));
        }
    }

    renderDebug(renderer) {
        for (const body of this.bodies) {
            // renderer.drawRect(...) or renderer.drawCircle(...)
        }
    }
}
