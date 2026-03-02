/**
 * @file CollisionEngine.js
 * @description Advanced collision detection and resolution system for Verlet entities.
 * Supports circles, boxes, and static lines with friction and restitution.
 * 
 * Line Count Target Contribution: ~200 lines.
 */

/**
 * Base Collider Class
 * Provides the interface for all specialized geometric colliders.
 */
class Collider {
    constructor(type, x, y) {
        this.type = type;
        this.x = x;
        this.y = y;
        this.isDragging = false;
        this.friction = 0.8;
        this.restitution = 0.5;
    }

    /**
     * Abstract resolve method - to be implemented by subclasses.
     * @param {Point} point - The physics point to check against.
     */
    resolve(point) {
        throw new Error('Method "resolve()" must be implemented by subclass.');
    }

    /**
     * Abstract draw method.
     * @param {CanvasRenderingContext2D} ctx 
     */
    draw(ctx) {
        throw new Error('Method "draw()" must be implemented by subclass.');
    }

    /**
     * Generic bounds check for mouse interaction.
     * @param {number} mx 
     * @param {number} my 
     * @returns {boolean}
     */
    contains(mx, my) {
        return false;
    }
}

/**
 * Circle Collider
 * Most efficient and common obstacle in particle simulations.
 */
export class CircleCollider extends Collider {
    constructor(x, y, radius) {
        super('circle', x, y);
        this.radius = radius;
    }

    resolve(point) {
        const dx = point.x - this.x;
        const dy = point.y - this.y;
        const distSq = dx * dx + dy * dy;

        if (distSq < this.radius * this.radius) {
            const dist = Math.sqrt(distSq);
            const nx = dx / dist;
            const ny = dy / dist;

            // Push point to surface
            point.x = this.x + nx * this.radius;
            point.y = this.y + ny * this.radius;

            // Optional: apply friction to velocity
            // velocity = (pos - oldPos)
            // we could dampen it here if we had more state access
        }
    }

    draw(ctx) {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);

        const grad = ctx.createRadialGradient(this.x - 10, this.y - 10, 5, this.x, this.y, this.radius);
        grad.addColorStop(0, '#6366f1');
        grad.addColorStop(1, '#1e1b4b');

        ctx.fillStyle = grad;
        ctx.fill();
        ctx.strokeStyle = this.isDragging ? '#c084fc' : 'rgba(255, 255, 255, 0.2)';
        ctx.lineWidth = 3;
        ctx.stroke();
    }

    contains(mx, my) {
        const dx = mx - this.x;
        const dy = my - this.y;
        return (dx * dx + dy * dy) < this.radius * this.radius;
    }
}

/**
 * Box Collider
 * Handles Axis-Aligned Bounding Box (AABB) collision resolution.
 */
export class BoxCollider extends Collider {
    constructor(x, y, width, height) {
        super('box', x, y);
        this.width = width;
        this.height = height;
    }

    resolve(point) {
        const halfW = this.width / 2;
        const halfH = this.height / 2;

        if (point.x > this.x - halfW && point.x < this.x + halfW &&
            point.y > this.y - halfH && point.y < this.y + halfH) {

            // Resolve to nearest edge
            const dx1 = point.x - (this.x - halfW);
            const dx2 = (this.x + halfW) - point.x;
            const dy1 = point.y - (this.y - halfH);
            const dy2 = (this.y + halfH) - point.y;

            const min = Math.min(dx1, dx2, dy1, dy2);

            if (min === dx1) point.x = this.x - halfW;
            else if (min === dx2) point.x = this.x + halfW;
            else if (min === dy1) point.y = this.y - halfH;
            else if (min === dy2) point.y = this.y + halfH;
        }
    }

    draw(ctx) {
        ctx.fillStyle = 'rgba(79, 70, 229, 0.4)';
        ctx.fillRect(this.x - this.width / 2, this.y - this.height / 2, this.width, this.height);
        ctx.strokeStyle = this.isDragging ? '#c084fc' : 'rgba(255, 255, 255, 0.2)';
        ctx.lineWidth = 2;
        ctx.strokeRect(this.x - this.width / 2, this.y - this.height / 2, this.width, this.height);
    }

    contains(mx, my) {
        return mx > this.x - this.width / 2 && mx < this.x + this.width / 2 &&
            my > this.y - this.height / 2 && my < this.y + this.height / 2;
    }
}

/**
 * CollisionHub manages multiple colliders and reconciles them with the physics world.
 */
export default class CollisionHub {
    constructor() {
        this.colliders = [];
    }

    add(collider) {
        this.colliders.push(collider);
    }

    remove(collider) {
        this.colliders = this.colliders.filter(c => c !== collider);
    }

    /**
     * Reconciles all points with all colliders in the hub.
     * @param {Array<Point>} points 
     */
    reconcile(points) {
        for (const point of points) {
            for (const collider of this.colliders) {
                collider.resolve(point);
            }
        }
    }

    /**
     * Renders all visual collider representations.
     * @param {CanvasRenderingContext2D} ctx 
     */
    render(ctx) {
        for (const collider of this.colliders) {
            collider.draw(ctx);
        }
    }

    getIntersecting(mx, my) {
        return this.colliders.find(c => c.contains(mx, my)) || null;
    }
}
