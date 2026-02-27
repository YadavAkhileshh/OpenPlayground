class Primitives {
    static cube(options = {}) {
        const center = options.center || new Vector3(0, 0, 0);
        const radius = options.radius || 1;
        const r = Array.isArray(radius) ? radius : [radius, radius, radius];

        const output = [];
        // Faces: +x, -x, +y, -y, +z, -z
        const data = [
            [[0, 4, 6, 2], [-1, 0, 0]],
            [[1, 3, 7, 5], [+1, 0, 0]],
            [[0, 1, 5, 4], [0, -1, 0]],
            [[2, 6, 7, 3], [0, +1, 0]],
            [[0, 2, 3, 1], [0, 0, -1]],
            [[4, 5, 7, 6], [0, 0, +1]]
        ];

        for (let i = 0; i < data.length; i++) {
            const indices = data[i][0];
            const n = data[i][1];
            const normal = new Vector3(n[0], n[1], n[2]);

            const verts = [];
            for (let j = 0; j < indices.length; j++) {
                const idx = indices[j];
                const x = center.x + (idx & 1 ? r[0] : -r[0]);
                const y = center.y + (idx & 2 ? r[1] : -r[1]);
                const z = center.z + (idx & 4 ? r[2] : -r[2]);
                verts.push(new Vertex(new Vector3(x, y, z), normal));
            }
            output.push(new Polygon(verts));
        }
        return CSG.fromPolygons(output);
    }

    static sphere(options = {}) {
        const center = options.center || new Vector3(0, 0, 0);
        const radius = options.radius || 1;
        const slices = options.slices || 16;
        const stacks = options.stacks || 12;
        const polygons = [];

        for (let i = 0; i < slices; i++) {
            for (let j = 0; j < stacks; j++) {
                const getVert = (u, v) => {
                    const theta = u * Math.PI * 2 / slices;
                    const phi = v * Math.PI / stacks;
                    const dir = new Vector3(
                        Math.sin(phi) * Math.cos(theta),
                        Math.cos(phi),
                        Math.sin(phi) * Math.sin(theta)
                    );
                    return new Vertex(center.add(dir.multiply(radius)), dir);
                };

                const v0 = getVert(i, j);
                const v1 = getVert(i + 1, j);
                const v2 = getVert(i + 1, j + 1);
                const v3 = getVert(i, j + 1);

                if (j > 0) polygons.push(new Polygon([v0.clone(), v1.clone(), v2.clone()]));
                if (j < stacks - 1) polygons.push(new Polygon([v0.clone(), v2.clone(), v3.clone()]));
            }
        }
        return CSG.fromPolygons(polygons);
    }

    static cylinder(options = {}) {
        const center = options.center || new Vector3(0, 0, 0);
        const radius = options.radius || 1;
        const height = options.height || 2;
        const slices = options.slices || 16;
        const polygons = [];

        const start = new Vector3(0, -height / 2, 0).add(center);
        const end = new Vector3(0, height / 2, 0).add(center);

        for (let i = 0; i < slices; i++) {
            const t0 = i / slices;
            const t1 = (i + 1) / slices;
            const a0 = t0 * Math.PI * 2;
            const a1 = t1 * Math.PI * 2;

            const n0 = new Vector3(Math.cos(a0), 0, Math.sin(a0));
            const n1 = new Vector3(Math.cos(a1), 0, Math.sin(a1));

            const v0 = new Vertex(start.add(n0.multiply(radius)), n0);
            const v1 = new Vertex(start.add(n1.multiply(radius)), n1);
            const v2 = new Vertex(end.add(n1.multiply(radius)), n1);
            const v3 = new Vertex(end.add(n0.multiply(radius)), n0);

            polygons.push(new Polygon([v0, v1, v2, v3]));

            polygons.push(new Polygon([
                new Vertex(end, new Vector3(0, 1, 0)),
                new Vertex(end.add(n0.multiply(radius)), new Vector3(0, 1, 0)),
                new Vertex(end.add(n1.multiply(radius)), new Vector3(0, 1, 0))
            ]));

            polygons.push(new Polygon([
                new Vertex(start, new Vector3(0, -1, 0)),
                new Vertex(start.add(n1.multiply(radius)), new Vector3(0, -1, 0)),
                new Vertex(start.add(n0.multiply(radius)), new Vector3(0, -1, 0))
            ]));
        }

        return CSG.fromPolygons(polygons);
    }

    static cone(options = {}) {
        const center = options.center || new Vector3(0, 0, 0);
        const radius = options.radius || 1;
        const height = options.height || 2;
        const slices = options.slices || 16;
        const polygons = [];

        const start = new Vector3(0, -height / 2, 0).add(center);
        const end = new Vector3(0, height / 2, 0).add(center);

        for (let i = 0; i < slices; i++) {
            const t0 = i / slices;
            const t1 = (i + 1) / slices;
            const a0 = t0 * Math.PI * 2;
            const a1 = t1 * Math.PI * 2;

            const n0 = new Vector3(Math.cos(a0), 0, Math.sin(a0));
            const n1 = new Vector3(Math.cos(a1), 0, Math.sin(a1));

            const slope = height / radius;
            const nm0 = new Vector3(n0.x, 1 / slope, n0.z).normalize();
            const nm1 = new Vector3(n1.x, 1 / slope, n1.z).normalize();

            const v0 = new Vertex(start.add(n0.multiply(radius)), nm0);
            const v1 = new Vertex(start.add(n1.multiply(radius)), nm1);
            const vTop = new Vertex(end, new Vector3(0, 1, 0)); // Tip vertex

            // Side triangle
            polygons.push(new Polygon([v0, v1, vTop]));

            // Bottom Cap
            polygons.push(new Polygon([
                new Vertex(start, new Vector3(0, -1, 0)),
                new Vertex(start.add(n1.multiply(radius)), new Vector3(0, -1, 0)),
                new Vertex(start.add(n0.multiply(radius)), new Vector3(0, -1, 0))
            ]));
        }

        return CSG.fromPolygons(polygons);
    }

    static torus(options = {}) {
        const center = options.center || new Vector3(0, 0, 0);
        const radius = options.radius || 1;
        const tube = options.tube || 0.4;
        const radialSegments = options.radialSegments || 16;
        const tubularSegments = options.tubularSegments || 12;
        const polygons = [];

        for (let j = 0; j < radialSegments; j++) {
            for (let i = 0; i < tubularSegments; i++) {
                const u = i / tubularSegments * Math.PI * 2;
                const v = j / radialSegments * Math.PI * 2;

                const uNext = (i + 1) / tubularSegments * Math.PI * 2;
                const vNext = (j + 1) / radialSegments * Math.PI * 2;

                const vertex = (u, v) => {
                    const cx = Math.cos(u);
                    const cy = Math.sin(u);
                    const r = radius + tube * Math.cos(v);

                    const x = r * cx;
                    const y = r * cy;
                    const z = tube * Math.sin(v);

                    // Rotate 90 deg x to lie on XZ
                    const pos = new Vector3(x, z, -y).add(center);

                    const centerTube = new Vector3(radius * cx, 0, -radius * cy).add(center);
                    const normal = pos.sub(centerTube).normalize();

                    return new Vertex(pos, normal);
                };

                const v0 = vertex(u, v);
                const v1 = vertex(uNext, v);
                const v2 = vertex(uNext, vNext);
                const v3 = vertex(u, vNext);

                polygons.push(new Polygon([v0, v1, v2, v3]));
            }
        }
        return CSG.fromPolygons(polygons);
    }
}
