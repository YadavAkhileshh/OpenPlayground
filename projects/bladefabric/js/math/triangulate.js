// triangulate.js
export class Triangulator {
    static triangulate(vertices) {
        const indices = [];
        const n = vertices.length;
        if (n < 3) return indices;

        const V = new Array(n);

        // Compute area to determine if points are CCW
        let area = 0;
        for (let p = n - 1, q = 0; q < n; p = q++) {
            area += vertices[p].x * vertices[q].y - vertices[q].x * vertices[p].y;
        }

        if (area > 0) {
            for (let v = 0; v < n; v++) V[v] = v;
        } else {
            for (let v = 0; v < n; v++) V[v] = (n - 1) - v;
        }

        let nv = n;
        let count = 2 * nv; // escape condition for infinite loop

        for (let m = 0, v = nv - 1; nv > 2;) {
            if ((count--) <= 0) {
                // Return what we have so far instead of freezing
                return indices;
            }

            let u = v; if (nv <= u) u = 0;
            v = u + 1; if (nv <= v) v = 0;
            let w = v + 1; if (nv <= w) w = 0;

            if (Triangulator.snip(vertices, u, v, w, nv, V)) {
                let a, b, c, s, t;

                a = V[u]; b = V[v]; c = V[w];
                indices.push(a);
                indices.push(b);
                indices.push(c);

                m++;

                for (s = v, t = v + 1; t < nv; s++, t++) {
                    V[s] = V[t];
                }
                nv--;

                count = 2 * nv;
            }
        }
        return indices;
    }

    static snip(vertices, u, v, w, n, V) {
        const p = vertices[V[u]];
        const p1 = vertices[V[v]];
        const p2 = vertices[V[w]];

        if (((p1.x - p.x) * (p2.y - p.y) - (p1.y - p.y) * (p2.x - p.x)) <= 1e-6) {
            return false;
        }

        let px, py, p1x, p1y, p2x, p2y;
        px = p.x; py = p.y;
        p1x = p1.x; p1y = p1.y;
        p2x = p2.x; p2y = p2.y;

        for (let p_idx = 0; p_idx < n; p_idx++) {
            if ((p_idx === u) || (p_idx === v) || (p_idx === w)) continue;

            const pt = vertices[V[p_idx]];
            if (Triangulator.insideTriangle(px, py, p1x, p1y, p2x, p2y, pt.x, pt.y)) {
                return false;
            }
        }
        return true;
    }

    static insideTriangle(ax, ay, bx, by, cx, cy, px, py) {
        const ax_ = cx - bx; const ay_ = cy - by;
        const bx_ = ax - cx; const by_ = ay - cy;
        const cx_ = bx - ax; const cy_ = by - ay;

        const apx = px - ax; const apy = py - ay;
        const bpx = px - bx; const bpy = py - by;
        const cpx = px - cx; const cpy = py - cy;

        const aCROSSbp = ax_ * bpy - ay_ * bpx;
        const cCROSSap = cx_ * apy - cy_ * apx;
        const bCROSScp = bx_ * cpy - by_ * cpx;

        return ((aCROSSbp >= 0.0) && (bCROSScp >= 0.0) && (cCROSSap >= 0.0));
    }
}
