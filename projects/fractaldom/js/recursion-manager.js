import { State } from './state.js';
import { CONSTANTS, EVENTS } from './constants.js';

export class RecursionManager {
    constructor() {
        State.subscribe(EVENTS.ZOOM_UPDATE, (scale) => this.checkThresholds(scale));
    }

    checkThresholds(scale) {
        // Thresholds
        const ZOOM_IN_LIMIT = CONSTANTS.SCALE_FACTOR; // e.g. 3
        const ZOOM_OUT_LIMIT = 1 / CONSTANTS.SCALE_FACTOR; // e.g. 0.333

        if (scale >= ZOOM_IN_LIMIT) {
            this.shiftLevel(1);
        } else if (scale <= ZOOM_OUT_LIMIT) {
            this.shiftLevel(-1);
        }
    }

    shiftLevel(direction) {
        // 1. Reset Scale
        // If we zoom IN (scale grows to 3), we want to reset to 1. 
        // But physically, we are now looking at the child which is 1/3 the size.
        // So scale 3 on Parent = Scale 1 on Child.
        // We DIVIDE scale by Factor.

        if (direction === 1) {
            // Zooming IN
            State.resetScale(CONSTANTS.SCALE_FACTOR);
        } else {
            // Zooming OUT
            State.resetScale(1 / CONSTANTS.SCALE_FACTOR);
        }

        // 2. Notify World
        State.incrementLevel(direction);

        // Note: The DOM Renderer listens to LEVEL_CHANGE and will handle the DOM swapping.
        // The State.resetScale modifies the value but doesn't necessarily trigger the loop depending on implementation,
        // but here our loop in ZoomEngine calls updateScale every frame.
        // We need to make sure the physics engine knows about the sudden jump? 
        // Actually, just changing the property on State is enough because the Renderer reads it next frame.
    }
}
