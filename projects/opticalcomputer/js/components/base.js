import { Vec2 } from '../engine/math.js';

/**
 * Base class for all optical components
 */
export class Component {
    constructor(x, y, type) {
        this.position = Vec2.create(x, y);
        this.rotation = 0; // Radians
        this.type = type;
        this.id = crypto.randomUUID();
        this.selected = false;

        // Dimensions for hit testing
        this.width = 40;
        this.height = 40;

        // State
        this.active = false;
    }

    /**
     * Move component to new position
     */
    moveTo(x, y) {
        this.position = Vec2.create(x, y);
    }

    /**
     * Rotate component
     */
    rotate(angle) {
        this.rotation = angle;
    }

    /**
     * Get bounding box for rendering and selection
     */
    getBounds() {
        return {
            x: this.position.x - this.width / 2,
            y: this.position.y - this.height / 2,
            w: this.width,
            h: this.height
        };
    }

    /**
     * Check if point is inside component
     */
    hitTest(x, y) {
        const b = this.getBounds();
        return x >= b.x && x <= b.x + b.w && y >= b.y && y <= b.y + b.h;
    }

    /**
     * Get geometric segments for ray intersection
     * Must be implemented by subclasses
     * Returns array of { p1, p2, type }
     */
    getSegments() {
        return [];
    }
}
