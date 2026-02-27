// manifold.js
import { Vec2 } from '../../math/vec2.js';
import { SAT } from './sat.js';
import { Contact, ContactPoint } from './contact.js';

export class ManifoldGenerator {
    static generate(bodyA, bodyB) {
        // Only Polygon vs Polygon implemented for this engine scope
        // Both are polygons
        const shapeA = bodyA.shape;
        const shapeB = bodyB.shape;
        const transformA = bodyA.transform;
        const transformB = bodyB.transform;

        const result = SAT.polygonVsPolygon(shapeA, transformA, shapeB, transformB);
        if (!result) return null; // No collision

        const polyA = result.polyA;
        const polyB = result.polyB;

        let refShape, incShape, refTransform, incTransform;
        let refIndex, flip;

        const k_tol = 0.01;
        // Bias towards A owning the reference face
        if (polyB.distance > polyA.distance + k_tol) {
            refShape = shapeB;
            refTransform = transformB;
            incShape = shapeA;
            incTransform = transformA;
            refIndex = polyB.index;
            flip = true;
        } else {
            refShape = shapeA;
            refTransform = transformA;
            incShape = shapeB;
            incTransform = transformB;
            refIndex = polyA.index;
            flip = false;
        }

        const contact = new Contact(bodyA, bodyB);

        // Find reference face
        const refNormal = refTransform.rotateVec2(refShape.normals[refIndex]);

        // Find incident face (most anti-parallel to refNormal)
        let incIndex = -1;
        let minDot = Number.MAX_VALUE;
        for (let i = 0; i < incShape.vertices.length; i++) {
            const incNormal = incTransform.rotateVec2(incShape.normals[i]);
            const dot = Vec2.dot(refNormal, incNormal);
            if (dot < minDot) {
                minDot = dot;
                incIndex = i;
            }
        }

        // Incident face vertices
        const v1 = incTransform.mulVec2(incShape.vertices[incIndex]);
        const v2 = incTransform.mulVec2(incShape.vertices[(incIndex + 1) % incShape.vertices.length]);

        // Just use simple 1-point contact finding for now as a baseline
        // For a full engine, we implement Sutherland-Hodgman clipping against adjacent edges.

        // Find deepest point of incident face relative to reference face
        const refV1 = refTransform.mulVec2(refShape.vertices[refIndex]);

        const d1 = Vec2.dot(refNormal, Vec2.sub(v1, refV1));
        const d2 = Vec2.dot(refNormal, Vec2.sub(v2, refV1));

        let deepestPt1 = v1;
        let deepestD = d1;

        if (d2 < d1) {
            deepestPt1 = v2;
            deepestD = d2;
        }

        // Extremely simplified manifold. Only 1 point for stability at lowest cost.
        contact.pointCount = 1;
        contact.points[0].position.copy(deepestPt1);

        // Penetration is negative distance
        contact.penetration = -deepestD;

        if (flip) {
            contact.normal = refNormal.clone().negate();
        } else {
            contact.normal = refNormal.clone();
        }

        return contact;
    }
}
