/**
 * Laser Component
 * Emits light rays.
 */
import { Entity } from './entity.js'; // Base entity
import { Vector } from '../math/vector.js';

// Laser handles its own intersection like a Wall (housing blocks light)
import { Wall } from './wall.js';

export class Laser extends Wall {
    constructor(x, y, angle = 0, color = '#ff0000') {
        super(x, y, 40, 20, angle);
        this.type = 'laser';
        this.active = true;
        this.color = color;
        this.intensity = 1.0;
        this.draggable = true;
        this.rotatable = true;
    }

    getEmissionPoint() {
        // Emit from the "front" face
        // Local front is (width/2, 0)
        const offset = new Vector(this.width / 2, 0).rotate(this.angle);
        return this.position.add(offset);
    }

    getEmissionDirection() {
        return Vector.fromAngle(this.angle);
    }
}
