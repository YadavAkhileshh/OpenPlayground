/**
 * Mirror Component
 * Reflects light rays.
 */
import { Wall } from './wall.js'; // Inherit intersection logic
import { Optics } from '../math/optics.js';

export class Mirror extends Wall {
    constructor(x, y, width, height, angle = 0) {
        super(x, y, width, height || 10, angle); // Thin by default if not specified
        this.type = 'mirror';
        this.color = '#aaf';
        this.rotatable = true; // Mirrors usually rotate
        this.draggable = true;
    }

    opticalResponse(incident, normal, intersection) {
        const reflected = Optics.reflect(incident, normal);
        return [{
            origin: intersection.point.add(reflected.mult(0.01)), // Offset to avoid self-intersection
            direction: reflected,
            intensity: 0.95, // Slight loss
            color: intersection.entity ? intersection.entity.color : '#fff' // Maintain color (or modify)
            // Ideally we need to pass the ray's incoming color here.
            // The method signature in entity.js for opticalResponse only takes geometry.
            // We should probably pass the incoming ray object itself to opticalResponse
        }];
    }

    // Override opticalResponse to handle color passing if we change the signature
    // For now, let's assume we maintain the color in the loop or pass it.
    // Let's update `opticalResponse` in Entity to take `incomingRay` property if needed.
    // But wait, the Raycaster calls `opticalResponse`.

    // Let's modify the signature in Raycaster usage to be safer:
    // entity.opticalResponse(ray, intersection)

    // For now, adhering to the current signature (incident, normal, intersection).
    // Mirror doesn't change color usually. The Raycaster loop has the current color.
    // The Raycaster loop will use the returned ray properties.
    // If I return undefined color, Raycaster should reuse old color.
}
