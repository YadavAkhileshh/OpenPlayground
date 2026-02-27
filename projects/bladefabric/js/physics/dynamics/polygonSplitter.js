// polygonSplitter.js
import { Vec2 } from '../../math/vec2.js';
import { PolygonMath } from '../../math/polygon.js';
import { Body } from '../body.js';
import { PolygonShape } from '../polygonShape.js';

export class PolygonSplitter {
    static split(sliceResult, world) {
        const { body, intersections, vertices } = sliceResult;

        // Build the two new polygons
        const poly1Vertices = [];
        const poly2Vertices = [];

        let index1 = intersections[0].edgeIndex;
        let index2 = intersections[1].edgeIndex;

        // Poly 1: Start -> Edge1 -> Intersect1 -> Intersect2 -> Edge2+1 -> End
        for (let i = 0; i <= index1; i++) {
            poly1Vertices.push(vertices[i].clone());
        }
        poly1Vertices.push(intersections[0].point.clone());
        poly1Vertices.push(intersections[1].point.clone());
        for (let i = index2 + 1; i < vertices.length; i++) {
            poly1Vertices.push(vertices[i].clone());
        }

        // Poly 2: Intersect1 -> Edge1+1 -> ... -> Edge2 -> Intersect2
        poly2Vertices.push(intersections[0].point.clone());
        for (let i = index1 + 1; i <= index2; i++) {
            poly2Vertices.push(vertices[i].clone());
        }
        poly2Vertices.push(intersections[1].point.clone());

        // Filter out bad vertices / collinears
        const cleanPoly1 = PolygonSplitter.cleanPoly(poly1Vertices);
        const cleanPoly2 = PolygonSplitter.cleanPoly(poly2Vertices);

        // Minimum viable area
        if (PolygonMath.computeArea(cleanPoly1) < 100 || PolygonMath.computeArea(cleanPoly2) < 100) return false;
        if (cleanPoly1.length < 3 || cleanPoly2.length < 3) return false;

        // Create new bodies
        const [body1, offset1] = PolygonSplitter.createBodyFromWorldVerts(cleanPoly1, body);
        const [body2, offset2] = PolygonSplitter.createBodyFromWorldVerts(cleanPoly2, body);

        // Transfer velocity
        // v = v0 + w cross r
        body1.velocity = body.getVelocityAtPoint(body1.transform.position);
        body1.angularVelocity = body.angularVelocity;

        body2.velocity = body.getVelocityAtPoint(body2.transform.position);
        body2.angularVelocity = body.angularVelocity;

        // Add tiny separating velocity based on cut normal
        const cutEdge = Vec2.sub(intersections[1].point, intersections[0].point);
        const cutNormal = cutEdge.perp().normalize();

        // Compare with center offets to see which side is which
        if (Vec2.dot(cutNormal, Vec2.sub(body1.transform.position, body.transform.position)) > 0) {
            body1.velocity.add(Vec2.mul(cutNormal, 50));
            body2.velocity.add(Vec2.mul(cutNormal, -50));
        } else {
            body1.velocity.add(Vec2.mul(cutNormal, -50));
            body2.velocity.add(Vec2.mul(cutNormal, 50));
        }

        // Apply to world
        world.removeBody(body);
        world.addBody(body1);
        world.addBody(body2);

        return true;
    }

    static createBodyFromWorldVerts(worldVerts, originalBody) {
        // Find centroid in world space
        const centroid = PolygonMath.computeCentroid(worldVerts);

        // Move verts to local space relative to new centroid
        const localVerts = worldVerts.map(v => Vec2.sub(v, centroid));

        const shape = new PolygonShape(localVerts);
        shape.density = originalBody.shape.density;
        shape.friction = originalBody.shape.friction;
        shape.restitution = originalBody.shape.restitution;

        const newBody = new Body(shape, centroid.x, centroid.y, originalBody.type);
        newBody.color = originalBody.color;
        newBody.isSlicable = originalBody.isSlicable;

        // The body's rotation is technically 0 since we baked the original body's rotation into the local vertices.
        // It simplifies creation heavily and avoids complex inverse-transform math here.

        return [newBody, centroid];
    }

    static cleanPoly(vertices) {
        const clean = [];
        const epsSq = 1.0;
        for (let i = 0; i < vertices.length; i++) {
            const v = vertices[i];
            if (clean.length === 0) {
                clean.push(v);
            } else {
                const last = clean[clean.length - 1];
                if (Vec2.distanceSq(v, last) > epsSq) {
                    clean.push(v);
                }
            }
        }
        // Check first vs last
        if (clean.length > 1 && Vec2.distanceSq(clean[0], clean[clean.length - 1]) < epsSq) {
            clean.pop();
        }
        return clean;
    }
}
