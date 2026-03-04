// shape.js
import { AABB } from '../math/bounds.js';
import { MassData } from './massData.js';

export const ShapeType = {
    CIRCLE: 0,
    POLYGON: 1
};

export class Shape {
    constructor(type) {
        this.type = type;
        this.density = 1.0;
        this.friction = 0.5;
        this.restitution = 0.2;
    }

    computeMass(density) {
        return new MassData();
    }

    computeAABB(transform) {
        return new AABB();
    }

    clone() {
        return new Shape(this.type);
    }
}
