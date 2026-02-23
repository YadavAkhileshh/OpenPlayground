/**
 * js/simulation/resource.js
 * Represents a source (gives payload) or sink (takes payload).
 */

import { Utils } from '../core/utils.js';

export class Resource {
    constructor(type, x, y, radius) {
        this.id = Utils.generateId();
        this.type = type; // 'source' or 'sink'
        this.x = x;
        this.y = y;
        this.radius = radius;
        this.capacity = Infinity; // Infinite for pure logistical visualization
    }
}
