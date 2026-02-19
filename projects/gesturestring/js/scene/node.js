/**
 * Scene Node Class
 * Base class for objects in the 3D scene.
 */
import { Vector3 } from '../math/vector3.js';
import { Quaternion } from '../math/quaternion.js';
import { Matrix4 } from '../math/matrix.js';

export class Node {
    constructor() {
        this.position = new Vector3();
        this.rotation = new Quaternion();
        this.scale = new Vector3(1, 1, 1);

        this.parent = null;
        this.children = [];

        this.matrix = new Matrix4();
        this.worldMatrix = new Matrix4();

        this.visible = true;
    }

    add(child) {
        if (child.parent) {
            child.parent.remove(child);
        }
        child.parent = this;
        this.children.push(child);
    }

    remove(child) {
        const index = this.children.indexOf(child);
        if (index !== -1) {
            this.children.splice(index, 1);
            child.parent = null;
        }
    }

    updateMatrix() {
        // Compose translation, rotation, scale into this.matrix
        // For simplicity in this project, we might mostly use world positions directly from physics
        // But this structure allows hierarchical animation
    }

    update(dt) {
        for (const child of this.children) {
            child.update(dt);
        }
    }
}
