import { State } from './state.js';
import { CONSTANTS } from './constants.js';
import { lerp } from './math-utils.js';

export class ZoomEngine {
    constructor() {
        this.running = false;
        this.lastTime = 0;
    }

    start() {
        this.running = true;
        this.lastTime = performance.now();
        requestAnimationFrame((t) => this.loop(t));
    }

    stop() {
        this.running = false;
    }

    loop(timestamp) {
        if (!this.running) return;

        const dt = timestamp - this.lastTime; // Time delta could be used for frame-independent physics
        this.lastTime = timestamp;

        this.updatePhysics();

        requestAnimationFrame((t) => this.loop(t));
    }

    updatePhysics() {
        // Apply friction to target velocity
        State.physics.targetVelocity *= CONSTANTS.ZOOM_FRICTION;

        // Snap to 0 if very small
        if (Math.abs(State.physics.targetVelocity) < CONSTANTS.MIN_VELOCITY) {
            State.physics.targetVelocity = 0;
        }

        // Interpolate actual velocity towards target (smoothing)
        State.physics.velocity = lerp(
            State.physics.velocity,
            State.physics.targetVelocity,
            0.1
        );

        if (Math.abs(State.physics.velocity) > 0) {
            // Apply zoom
            // Note: Exponential zooming feels more natural. 
            // scale = scale * (1 + velocity)
            State.updateScale(State.physics.velocity);
        }
    }
}
