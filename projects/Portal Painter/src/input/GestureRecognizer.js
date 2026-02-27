import { Vector2 } from '../physics/Vector2.js';

export class GestureRecognizer {
    constructor() {
        this.minPoints = 10;
        this.circleThreshold = 0.85; // 0-1, 1 is perfect circle
    }

    recognize(stroke) {
        if (stroke.length < this.minPoints) return null;

        // 1. Calculate bounding box
        let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
        let sumX = 0, sumY = 0;

        for (const p of stroke) {
            if (p.x < minX) minX = p.x;
            if (p.x > maxX) maxX = p.x;
            if (p.y < minY) minY = p.y;
            if (p.y > maxY) maxY = p.y;
            sumX += p.x;
            sumY += p.y;
        }

        const width = maxX - minX;
        const height = maxY - minY;

        // Aspect ratio check (circle should be roughly 1:1)
        const ratio = Math.min(width, height) / Math.max(width, height);
        if (ratio < 0.3) return null; // Very loose ratio check (was 0.6)

        // 2. Calculate Centroid
        const center = new Vector2(sumX / stroke.length, sumY / stroke.length);

        // 3. Check distance variance from center
        let totalDist = 0;
        const distances = [];

        for (const p of stroke) {
            const d = p.dist(center);
            distances.push(d);
            totalDist += d;
        }

        const avgRadius = totalDist / stroke.length;

        let varianceSum = 0;
        for (const d of distances) {
            varianceSum += Math.pow(d - avgRadius, 2);
        }

        const stdDev = Math.sqrt(varianceSum / stroke.length);
        const relativeError = stdDev / avgRadius;

        // lower relative error means more circular
        // typically < 0.2 is a decent hand-drawn circle
        // Relaxed from 0.25 to 0.4 to allow messier circles
        if (relativeError < 0.4) {
            return {
                type: 'circle',
                center: center,
                radius: avgRadius
            };
        }

        return null; // Not a circle
    }
}
