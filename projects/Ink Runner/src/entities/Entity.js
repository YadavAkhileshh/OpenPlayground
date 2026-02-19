/**
 * Entity.js
 * Base class for all game objects.
 */

export class Entity {
    constructor(x, y, width, height) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;

        this.vx = 0; // Velocity X
        this.vy = 0; // Velocity Y

        this.physicsEnabled = true;
        this.isAlive = true;
        this.type = 'Entity';
    }

    update(dt) {
        // Base update logic
    }

    getBounds() {
        return {
            x: this.x,
            y: this.y,
            width: this.width,
            height: this.height
        };
    }

    collidesWith(other) {
        return (
            this.x < other.x + other.width &&
            this.x + this.width > other.x &&
            this.y < other.y + other.height &&
            this.y + this.height > other.y
        );
    }
}
