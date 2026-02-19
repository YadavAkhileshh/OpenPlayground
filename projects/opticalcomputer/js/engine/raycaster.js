// Need to be careful with replace, but Raycaster is becoming complex.
// I will rewrite Raycaster to support Filter and Refraction.

import { Vec2, MathUtil } from './math.js';

export class Raycaster {
    constructor(scene) {
        this.scene = scene;
        this.maxBounces = 20; // Increase for prisms
        this.rays = [];
    }

    trace(emitters) {
        this.rays = [];

        // Reset sensors
        this.scene.forEach(c => {
            if (c.type === 'sensor') c.reset();
            // Reset gate states? No, done in main loop
        });

        // 1. Collect all segments
        let allSegments = [];
        this.scene.forEach(comp => {
            const segs = comp.getSegments();
            if (segs) allSegments = allSegments.concat(segs);
        });

        // 2. Process emitters
        emitters.forEach(emitter => {
            const ray = emitter.getEmissionRay();
            if (ray) {
                this.castRay(ray, allSegments, 0);
            }
        });

        return this.rays;
    }

    castRay(ray, segments, depth) {
        if (depth > this.maxBounces || ray.intensity < 0.01) return;

        let closestHit = null;
        let minDist = Infinity;

        // Find nearest intersection
        for (const seg of segments) {
            const hit = MathUtil.intersect(
                ray.origin,
                Vec2.add(ray.origin, Vec2.scale(ray.direction, 2000)),
                seg.p1,
                seg.p2
            );

            if (hit) {
                const dist = Vec2.dist(ray.origin, { x: hit.x, y: hit.y });
                if (dist < 0.1) continue; // Self-intersection check

                if (dist < minDist) {
                    minDist = dist;
                    closestHit = { point: hit, segment: seg, distance: dist };
                }
            }
        }

        const endPoint = closestHit ? closestHit.point : Vec2.add(ray.origin, Vec2.scale(ray.direction, 2000));

        this.rays.push({
            start: ray.origin,
            end: endPoint,
            intensity: ray.intensity,
            color: ray.color
        });

        if (closestHit) {
            const seg = closestHit.segment;
            const type = seg.type;
            const normal = seg.normal;

            // Handle Interactions

            if (type === 'mirror') {
                const reflection = Vec2.reflect(ray.direction, normal);
                this.castRay({
                    origin: Vec2.add(closestHit.point, Vec2.scale(reflection, 0.1)),
                    direction: reflection,
                    intensity: ray.intensity * 0.95,
                    color: ray.color
                }, segments, depth + 1);

            } else if (type === 'splitter') {
                const reflectDir = Vec2.reflect(ray.direction, normal);
                const transmitDir = ray.direction;
                const ratio = seg.ratio || 0.5;

                // Reflected
                this.castRay({
                    origin: Vec2.add(closestHit.point, Vec2.scale(reflectDir, 0.1)),
                    direction: reflectDir,
                    intensity: ray.intensity * (1 - ratio),
                    color: ray.color
                }, segments, depth + 1);

                // Transmitted
                this.castRay({
                    origin: Vec2.add(closestHit.point, Vec2.scale(transmitDir, 0.1)),
                    direction: transmitDir,
                    intensity: ray.intensity * ratio,
                    color: ray.color
                }, segments, depth + 1);

            } else if (type === 'sensor') {
                if (seg.component) {
                    seg.component.onHit(ray.intensity, seg.portId);
                }

            } else if (type === 'filter') {
                // Check color match
                const rayColor = this.hexToRgb(ray.color);
                const filterColor = this.hexToRgb(seg.color);

                // Simple dominance check
                // If filter is Red, it blocks Green/Blue
                // We'll multiply channels

                const newR = Math.min(rayColor.r, filterColor.r);
                const newG = Math.min(rayColor.g, filterColor.g);
                const newB = Math.min(rayColor.b, filterColor.b);

                const intensityFactor = (newR + newG + newB) / (rayColor.r + rayColor.g + rayColor.b + 0.1);

                if (intensityFactor > 0.1) {
                    this.castRay({
                        origin: Vec2.add(closestHit.point, Vec2.scale(ray.direction, 0.1)),
                        direction: ray.direction,
                        intensity: ray.intensity * intensityFactor,
                        color: this.rgbToHex(newR, newG, newB)
                    }, segments, depth + 1);
                }

            } else if (type === 'refractor') {
                // Snell's Law
                // n1 * sin(theta1) = n2 * sin(theta2)
                // Determine if entering or exiting
                const n1 = 1.0; // Air
                const n2 = seg.ior || 1.5;

                // Dot product of Ray and Normal
                let dot = Vec2.dot(ray.direction, normal);
                let n = normal;
                let eta; // ratio n1/n2

                if (dot < 0) {
                    // Entering
                    // Normal is pointing against ray, correct
                    eta = n1 / n2;
                } else {
                    // Exiting (inside out)
                    // Normal is pointing with ray, flip it
                    n = { x: -normal.x, y: -normal.y };
                    dot = -dot;
                    eta = n2 / n1; // Swap
                }

                // Compute refraction vector
                const k = 1.0 - eta * eta * (1.0 - dot * dot);
                if (k < 0) {
                    // Total Internal Reflection
                    const reflectDir = Vec2.reflect(ray.direction, n);
                    this.castRay({
                        origin: Vec2.add(closestHit.point, Vec2.scale(reflectDir, 0.1)),
                        direction: reflectDir,
                        intensity: ray.intensity,
                        color: ray.color
                    }, segments, depth + 1);
                } else {
                    // Refraction
                    const refractDir = {
                        x: eta * ray.direction.x + (eta * dot - Math.sqrt(k)) * n.x,
                        y: eta * ray.direction.y + (eta * dot - Math.sqrt(k)) * n.y
                    };

                    this.castRay({
                        origin: Vec2.add(closestHit.point, Vec2.scale(refractDir, 0.1)),
                        direction: refractDir,
                        intensity: ray.intensity * 0.9,
                        color: ray.color
                    }, segments, depth + 1);
                }
            }
        }
    }

    hexToRgb(hex) {
        // Expand shorthand form (e.g. "03F") to full form (e.g. "0033FF")
        const shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;
        hex = hex.replace(shorthandRegex, (m, r, g, b) => r + r + g + g + b + b);

        const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        return result ? {
            r: parseInt(result[1], 16),
            g: parseInt(result[2], 16),
            b: parseInt(result[3], 16)
        } : { r: 255, g: 255, b: 255 };
    }

    rgbToHex(r, g, b) {
        return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
    }
}
