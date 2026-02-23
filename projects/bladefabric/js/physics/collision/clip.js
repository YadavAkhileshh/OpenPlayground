// clip.js
import { Vec2 } from '../../math/vec2.js';

export class Clipper {
    static clipSegmentToLine(vOut, vIn, normal, offset, clipEdge) {
        let numOut = 0;

        // Distance from each point to the clipping plane
        const distance0 = Vec2.dot(normal, vIn[0].v) - offset;
        const distance1 = Vec2.dot(normal, vIn[1].v) - offset;

        // If points are behind the plane, keep them
        if (distance0 <= 0.0) { vOut[numOut++] = { v: vIn[0].v.clone(), id: vIn[0].id }; }
        if (distance1 <= 0.0) { vOut[numOut++] = { v: vIn[1].v.clone(), id: vIn[1].id }; }

        // If they are on different sides of the plane, clip
        if (distance0 * distance1 < 0.0) {
            // Interpolation point
            const interp = distance0 / (distance0 - distance1);

            const cv = new Vec2(
                vIn[0].v.x + interp * (vIn[1].v.x - vIn[0].v.x),
                vIn[0].v.y + interp * (vIn[1].v.y - vIn[0].v.y)
            );

            vOut[numOut] = { v: cv, id: { inEdge1: vIn[0].id.inEdge1, inEdge2: clipEdge } };
            numOut++;
        }

        return numOut;
    }
}
