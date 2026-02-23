// slicingAlgorithm.js
import { Vec2 } from '../../math/vec2.js';
import { Segment } from '../../math/segment.js';
import { ShapeType } from '../shape.js';

export class SlicingAlgorithm {
    static sliceBody(body, raySegment) {
        if (!body.isSlicable) return null;
        if (body.shape.type !== ShapeType.POLYGON) return null;

        // Ray is in world space, we need polygon in world space
        const vertices = [];
        for (const v of body.shape.vertices) {
            vertices.push(body.transform.mulVec2(v));
        }

        const intersections = [];

        for (let i = 0; i < vertices.length; i++) {
            const p1 = vertices[i];
            const p2 = vertices[(i + 1) % vertices.length];
            const edge = new Segment(p1, p2);

            const intersect = raySegment.intersectSegment(edge);
            if (intersect) {
                intersections.push({
                    point: intersect,
                    edgeIndex: i
                });
            }
        }

        // A valid slice through a convex polygon needs exactly 2 intersections
        if (intersections.length === 2) {
            // Sort by edge index to make splitting deterministic
            intersections.sort((a, b) => a.edgeIndex - b.edgeIndex);

            return {
                body: body,
                intersections: intersections,
                vertices: vertices
            };
        }

        return null; // Ray didn't cross body perfectly
    }
}
