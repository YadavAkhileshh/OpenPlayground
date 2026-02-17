/**
 * Beam Splitter Component
 * Reflects 50%, Transmits 50%.
 */
import { Mirror } from './mirror.js';
import { Optics } from '../math/optics.js';

export class Splitter extends Mirror {
    constructor(x, y, width, height, angle = 0) {
        super(x, y, width, height, angle);
        this.type = 'splitter';
        this.color = 'rgba(200, 200, 255, 0.5)';
        this.transmission = 0.5;
    }

    opticalResponse(incident, normal, intersection) {
        const reflectedDir = Optics.reflect(incident, normal);

        // Transmitted ray (continues straight, maybe slightly refracted if we wanted realism, but idealized splitter goes straight)
        // Actually, a thin splitter just passes it through.
        const transmittedDir = incident;

        return [
            {
                origin: intersection.point.add(reflectedDir.mult(0.01)),
                direction: reflectedDir,
                intensity: 0.5, // Split intensity
                color: intersection.color
            },
            {
                origin: intersection.point.add(transmittedDir.mult(0.01)), // Continue through
                direction: transmittedDir,
                intensity: 0.5,
                color: intersection.color
            }
        ];
    }
}
