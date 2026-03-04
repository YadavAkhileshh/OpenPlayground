/**
 * Filter Component
 * Only allows specific colors to pass.
 */
import { Wall } from './wall.js';

export class Filter extends Wall {
    constructor(x, y, width, height, angle = 0, filterColor = '#ff0000') {
        super(x, y, width, height, angle);
        this.type = 'filter';
        this.filterColor = filterColor; // 'red', 'green', 'blue' or hex
        this.color = filterColor;
    }

    opticalResponse(incident, normal, intersection) {
        // Simple color matching
        // In a real system, we'd do spectrum multiplication.
        // Here, string matching or simple RGB logic.

        const rayColor = intersection.color || '#fff';

        // Allow white to pass but become filtered color
        if (rayColor === '#ffffff' || rayColor === 'white') {
            return [{
                origin: intersection.point.add(incident.mult(0.01)),
                direction: incident,
                intensity: 0.9,
                color: this.filterColor
            }];
        }

        // Check if colors match roughly
        // If ray is Red and Filter is Red -> Pass
        // If ray is Blue and Filter is Red -> Block
        if (this.colorsMatch(rayColor, this.filterColor)) {
            return [{
                origin: intersection.point.add(incident.mult(0.01)),
                direction: incident,
                intensity: 0.9,
                color: rayColor
            }];
        }

        return []; // Blocked
    }

    colorsMatch(c1, c2) {
        // Very basic check.
        if (c1 === c2) return true;
        if (c2 === '#ff0000' && (c1.includes('f00') || c1.includes('255, 0, 0'))) return true;
        if (c2 === '#00ff00' && (c1.includes('0f0') || c1.includes('0, 255, 0'))) return true;
        if (c2 === '#0000ff' && (c1.includes('00f') || c1.includes('0, 0, 255'))) return true;
        return false;
    }
}
