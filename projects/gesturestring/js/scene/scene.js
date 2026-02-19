/**
 * Scene Class
 * Manages the hierarchy of objects.
 */
import { Node } from './node.js';

export class Scene extends Node {
    constructor() {
        super();
        this.background = '#000000';
    }

    // Scene specific logic if needed
    // e.g., finding objects by ID, simple raycasting setup
}
