/**
 * Lens Component
 * Refracts light rays.
 */
import { Wall } from './wall.js';
import { Optics } from '../math/optics.js';

export class Lens extends Wall {
    constructor(x, y, width, height, refractiveIndex = 1.5) {
        super(x, y, width, height, 0); // Rectangular block for now
        this.type = 'lens';
        this.refractiveIndex = refractiveIndex;
        this.color = 'rgba(200, 240, 255, 0.3)';
        this.draggable = true;
        this.rotatable = true;
    }

    opticalResponse(incident, normal, intersection) {
        const dot = incident.dot(normal);

        let n1 = 1.00; // Air
        let n2 = this.refractiveIndex;
        let surfaceNormal = normal;

        // Determine entering or exiting
        if (dot > 0) {
            // Exiting: Normal points same general direction as incident
            // Wait, intersection normal usually points OUT of shape.
            // If dot > 0, we are inside hitting the other side?
            // raySegmentIntersect calculates normal. 
            // In my Wall class, I ensure normal points *against* ray.
            // So dot is always negative for entrance.
            // If I am inside, the normal calculation in Wall might be tricky if it assumes outside.
            // ... Actually, `Wall` raySegmentIntersect logic:
            // "Ensure normal points against ray" -> `if (normal.dot(dir) > 0) normal = normal.mult(-1);`
            // So normal always opposes ray.
            // This is BAD for refraction context because we lose "side" information.
            // We need to know if we are hitting from outside or inside.

            // Let's rely on `pointInPolygon` test or similar?
            // Or remove the normal flip in `Wall` and handle it here.

            // BUT, `Wall` logic is generic. 
            // Let's assume for `Lens` we might need to override intersection or re-check side.
            // The simplest check: Are we currently "inside" the bounding box?
            // Actually, just check direction vs original geometric normal.
            // Let's re-derive geometric normal:
            // It's just perpendicular to the side.

            // Hack for now: Wall normal is always pointing against ray.
            // But we need to know if we are transitioning Air->Glass or Glass->Air.
            // Use the fact that if we are "inside" the previous ray end point was inside?
            // No, the origin is outside.
            // Let's use `containsPoint` on the ray origin!

            if (this.containsPoint(intersection.point.sub(incident.mult(0.1)))) {
                // We were inside. Exiting.
                n1 = this.refractiveIndex;
                n2 = 1.00;
                // Normal currently points against ray (so into the object).
                // For Snell's law, we want normal pointing into n1 usually?
                // Standard convention: Incident and Normal.
                // Optics.refract assumes normal allows `cosI = -normal.dot(incident)`.
                // So normal should oppose incident.
                // Wall gives us exactly that.
            } else {
                // Entering.
                n1 = 1.00;
                n2 = this.refractiveIndex;
            }
        } else {
            // Wall normal points against ray.
            // If we check `containsPoint` of ray origin:
            if (this.containsPoint(intersection.point.sub(incident.mult(2)))) {
                // Inside -> Outside
                n1 = this.refractiveIndex;
                n2 = 1.00;
            }
        }

        const refracted = Optics.refract(incident, surfaceNormal, n1, n2);

        if (!refracted) {
            // Total Internal Reflection
            const reflected = Optics.reflect(incident, surfaceNormal);
            return [{
                origin: intersection.point.add(reflected.mult(0.01)),
                direction: reflected,
                intensity: 0.9,
                color: intersection.color // Keep color
            }];
        }

        return [{
            origin: intersection.point.add(refracted.mult(0.01)),
            direction: refracted,
            intensity: 0.95, // Transmission loss
            color: intersection.color
        }];
    }
}
