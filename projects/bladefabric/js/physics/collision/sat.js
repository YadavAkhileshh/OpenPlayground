// sat.js
import { Vec2 } from '../../math/vec2.js';

export class SAT {
    static findAxisMinPenetration(shapeA, transformA, shapeB, transformB) {
        let bestDistance = -Number.MAX_VALUE;
        let bestIndex = -1;

        for (let i = 0; i < shapeA.vertices.length; ++i) {
            // Get normal of edge in world space
            const n = transformA.rotateVec2(shapeA.normals[i]);

            // Get support point from B along -n
            const support = shapeB.getSupport(n.clone().negate());

            // Transform to world space
            const v = transformB.mulVec2(support.vertex);

            // Get point on A's face in world space
            const p = transformA.mulVec2(shapeA.vertices[i]);

            // Distance = (v - p) dot n
            const d = Vec2.dot(Vec2.sub(v, p), n);

            if (d > bestDistance) {
                bestDistance = d;
                bestIndex = i;
            }
        }

        return { distance: bestDistance, index: bestIndex };
    }

    static polygonVsPolygon(shapeA, transformA, shapeB, transformB) {
        const polyA = SAT.findAxisMinPenetration(shapeA, transformA, shapeB, transformB);
        if (polyA.distance >= 0.0) return null; // Separating axis found

        const polyB = SAT.findAxisMinPenetration(shapeB, transformB, shapeA, transformA);
        if (polyB.distance >= 0.0) return null; // Separating axis found

        return {
            polyA: polyA,
            polyB: polyB
        };
    }
}
