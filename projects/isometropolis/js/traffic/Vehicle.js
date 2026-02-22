import { Vector2 } from '../math/Vector2.js';
import { Utils } from '../math/Utils.js';

/**
 * A vehicle driving along paths.
 */
export class Vehicle {
    /**
     * @param {number} x
     * @param {number} y
     */
    constructor(x, y) {
        this.id = Utils.generateID();
        // Floating point grid position for smooth rendering
        this.position = new Vector2(x, y);
        this.velocity = new Vector2(0, 0);

        this.path = [];
        this.targetNode = null;
        this.speed = 2.0; // Grid cells per simulated second

        // State
        this.state = 'idle'; // 'moving', 'idle', 'arrived'
        this.color = Utils.idToColor(Math.floor(Math.random() * 10000));
    }

    /**
     * Assigns a new path to the vehicle.
     * @param {Array<{x, y}>} path 
     */
    setPath(path) {
        if (!path || path.length === 0) {
            this.state = 'idle';
            return;
        }
        this.path = path;
        this.targetNode = this.path.shift();
        this.state = 'moving';
    }

    /**
     * Triggers logic update.
     * @param {number} dt Delta time
     */
    update(dt) {
        if (this.state !== 'moving' || !this.targetNode) return;

        const targetPos = new Vector2(this.targetNode.x, this.targetNode.y);
        const distSq = this.position.distanceToSq(targetPos);

        // If arrived at node
        if (distSq < 0.01) {
            this.position.copy(targetPos); // snap

            if (this.path.length > 0) {
                // Get next node
                this.targetNode = this.path.shift();
            } else {
                // End of path
                this.state = 'arrived';
                this.velocity.set(0, 0);
                return;
            }
        }

        // Move towards target
        const dir = new Vector2(this.targetNode.x, this.targetNode.y)
            .sub(this.position)
            .normalize();

        this.velocity.copy(dir).multiplyScalar(this.speed);

        // Apply velocity
        this.position.x += this.velocity.x * dt;
        this.position.y += this.velocity.y * dt;
    }
}
