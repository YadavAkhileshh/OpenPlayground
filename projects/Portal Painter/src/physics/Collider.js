import { Vector2 } from './Vector2.js';

export class Collider {
    constructor(body) {
        this.body = body;
        this.isTrigger = false;
        this.tags = [];
    }
}

export class BoxCollider extends Collider {
    constructor(body, width, height) {
        super(body);
        this.width = width;
        this.height = height;
        this.halfWidth = width / 2;
        this.halfHeight = height / 2;
    }

    get left() { return this.body.position.x - this.halfWidth; }
    get right() { return this.body.position.x + this.halfWidth; }
    get top() { return this.body.position.y - this.halfHeight; }
    get bottom() { return this.body.position.y + this.halfHeight; }
}

export class CircleCollider extends Collider {
    constructor(body, radius) {
        super(body);
        this.radius = radius;
    }
}
