/**
 * Prism Component
 * Disperses light into spectrum.
 */
import { Wall } from './wall.js';
import { Optics } from '../math/optics.js';
import { Vector } from '../math/vector.js';

export class Prism extends Wall {
    constructor(x, y, size = 60, angle = 0) {
        super(x, y, size, size, angle); // Size is side length
        this.type = 'prism';
        this.color = 'rgba(255, 255, 255, 0.4)';
        this.size = size;
        this.draggable = true;
        this.rotatable = true;
    }

    containsPoint(point) {
        // Barycentric technique or just check 3 half-planes.
        const vert = this.getBounds();

        // Helper for sign
        const sign = (p1, p2, p3) => {
            return (p1.x - p3.x) * (p2.y - p3.y) - (p2.x - p3.x) * (p1.y - p3.y);
        };

        const d1 = sign(point, vert[0], vert[1]);
        const d2 = sign(point, vert[1], vert[2]);
        const d3 = sign(point, vert[2], vert[0]);

        const hasNeg = (d1 < 0) || (d2 < 0) || (d3 < 0);
        const hasPos = (d1 > 0) || (d2 > 0) || (d3 > 0);

        return !(hasNeg && hasPos);
    }

    getBounds() {
        // Triangle
        const h = this.size * Math.sqrt(3) / 2;
        const pts = [
            new Vector(0, -h * 2 / 3),
            new Vector(-this.size / 2, h / 3),
            new Vector(this.size / 2, h / 3)
        ];
        return pts.map(p => p.rotate(this.angle).add(this.position));
    }

    getIntersection(rayOrigin, rayDir) {
        const bounds = this.getBounds();
        let closest = null;
        let minDist = Infinity;

        for (let i = 0; i < 3; i++) {
            const p1 = bounds[i];
            const p2 = bounds[(i + 1) % 3];
            const hit = this.raySegmentIntersect(rayOrigin, rayDir, p1, p2);
            if (hit && hit.distance < minDist) {
                minDist = hit.distance;
                closest = hit;
            }
        }
        return closest;
    }

    opticalResponse(incident, normal, intersection) {
        // Dispersion logic
        // We will return 3 rays if input is white, or 1 refracted ray if already colored?
        // Let's assume input color tells us wavelength, or we split generic 'white'

        // Simple logic: If ray is "white" (or generic laser color), split.
        // If ray is already specific R/G/B component, just refract with specific Index.

        let indices = {};

        // Indices for Glass usually: Red ~1.51, Violet ~1.53
        // Let's exaggerate for effect
        indices.red = 1.40;
        indices.green = 1.45;
        indices.blue = 1.50;

        const isWhite = true; // Assume all lasers are white for dispersion demo? Or check color string.
        // Actually, let's say:
        // Main Laser -> White (#ffffff) -> Splits
        // Red Laser -> #ff0000 -> Refracts as Red

        const color = intersection.color || '#ffffff';
        // Check if white-ish
        const rays = [];

        // Determine inside/outside (same logic as Lens)
        let entering = true;
        if (this.containsPoint(intersection.point.sub(incident.mult(2)))) {
            entering = false;
        }

        const processColor = (col, ior) => {
            let n1 = 1.0, n2 = ior;
            if (!entering) { n1 = ior; n2 = 1.0; }

            const refracted = Optics.refract(incident, normal, n1, n2);
            if (refracted) {
                rays.push({
                    origin: intersection.point.add(refracted.mult(0.01)),
                    direction: refracted,
                    intensity: entering ? 0.9 : 0.9,
                    color: col
                });
            } else {
                // TIR
                const reflected = Optics.reflect(incident, normal);
                rays.push({
                    origin: intersection.point.add(reflected.mult(0.01)),
                    direction: reflected,
                    intensity: 0.9,
                    color: col
                });
            }
        };

        if (color === '#ffffff' || color === 'white') {
            processColor('#ff0000', indices.red);
            processColor('#00ff00', indices.green);
            processColor('#0000ff', indices.blue);
        } else {
            // Estimate IOR based on color?
            let ior = 1.45;
            if (color.includes('f00') || color.includes('red')) ior = indices.red;
            if (color.includes('0f0') || color.includes('green')) ior = indices.green;
            if (color.includes('00f') || color.includes('blue')) ior = indices.blue;

            processColor(color, ior);
        }

        return rays;
    }
}
