/**
 * MarchingCubes — Converts the ScalarField into a triangle mesh.
 * Uses pre-allocated reusable buffers to minimize garbage collection.
 */
class MarchingCubes {
    constructor(field) {
        this.field = field;
        this.isoLevel = 0.3;   // threshold

        // Output
        this.vertices = [];   // flat: [x,y,z, x,y,z, ...]
        this.normals = [];   // flat: [nx,ny,nz, ...]

        // Reusable scratch buffers — no allocations inside hot loops
        this._cval = new Float32Array(8);
        this._cpos = new Float32Array(24);   // 8 corners * 3
        this._vlist = new Float32Array(36);   // 12 edges * 3
    }

    /** Regenerate the mesh from the current field state. */
    generate(isoLevel) {
        this.isoLevel = isoLevel;
        this.vertices.length = 0;
        this.normals.length = 0;

        const N = this.field.N;
        for (let zi = 0; zi < N - 1; zi++) {
            for (let yi = 0; yi < N - 1; yi++) {
                for (let xi = 0; xi < N - 1; xi++) {
                    this._processCube(xi, yi, zi);
                }
            }
        }
    }

    // ------------------------------------------------------------------
    //  Cube processing
    // ------------------------------------------------------------------

    _processCube(xi, yi, zi) {
        const f = this.field;
        const cv = this._cval;
        const cp = this._cpos;

        // Sample 8 corners (standard ordering)
        cv[0] = f.getValue(xi, yi, zi);
        cv[1] = f.getValue(xi + 1, yi, zi);
        cv[2] = f.getValue(xi + 1, yi, zi + 1);
        cv[3] = f.getValue(xi, yi, zi + 1);
        cv[4] = f.getValue(xi, yi + 1, zi);
        cv[5] = f.getValue(xi + 1, yi + 1, zi);
        cv[6] = f.getValue(xi + 1, yi + 1, zi + 1);
        cv[7] = f.getValue(xi, yi + 1, zi + 1);

        // Build edge table index
        const iso = this.isoLevel;
        let cubeIndex = 0;
        if (cv[0] > iso) cubeIndex |= 1;
        if (cv[1] > iso) cubeIndex |= 2;
        if (cv[2] > iso) cubeIndex |= 4;
        if (cv[3] > iso) cubeIndex |= 8;
        if (cv[4] > iso) cubeIndex |= 16;
        if (cv[5] > iso) cubeIndex |= 32;
        if (cv[6] > iso) cubeIndex |= 64;
        if (cv[7] > iso) cubeIndex |= 128;

        // Early out — cube entirely inside or outside
        const edges = edgeTable[cubeIndex];
        if (edges === 0) return;

        // Get corner world positions
        this._setCP(cp, 0, xi, yi, zi);
        this._setCP(cp, 1, xi + 1, yi, zi);
        this._setCP(cp, 2, xi + 1, yi, zi + 1);
        this._setCP(cp, 3, xi, yi, zi + 1);
        this._setCP(cp, 4, xi, yi + 1, zi);
        this._setCP(cp, 5, xi + 1, yi + 1, zi);
        this._setCP(cp, 6, xi + 1, yi + 1, zi + 1);
        this._setCP(cp, 7, xi, yi + 1, zi + 1);

        // Interpolate edge vertices
        const vl = this._vlist;
        if (edges & 1) this._interp(cp, cv, 0, 1, vl, 0);
        if (edges & 2) this._interp(cp, cv, 1, 2, vl, 1);
        if (edges & 4) this._interp(cp, cv, 2, 3, vl, 2);
        if (edges & 8) this._interp(cp, cv, 3, 0, vl, 3);
        if (edges & 16) this._interp(cp, cv, 4, 5, vl, 4);
        if (edges & 32) this._interp(cp, cv, 5, 6, vl, 5);
        if (edges & 64) this._interp(cp, cv, 6, 7, vl, 6);
        if (edges & 128) this._interp(cp, cv, 7, 4, vl, 7);
        if (edges & 256) this._interp(cp, cv, 0, 4, vl, 8);
        if (edges & 512) this._interp(cp, cv, 1, 5, vl, 9);
        if (edges & 1024) this._interp(cp, cv, 2, 6, vl, 10);
        if (edges & 2048) this._interp(cp, cv, 3, 7, vl, 11);

        // Emit triangles
        const tt = triTable[cubeIndex];
        for (let i = 0; tt[i] !== -1; i += 3) {
            const e1 = tt[i], e2 = tt[i + 1], e3 = tt[i + 2];

            const x1 = vl[e1 * 3], y1 = vl[e1 * 3 + 1], z1 = vl[e1 * 3 + 2];
            const x2 = vl[e2 * 3], y2 = vl[e2 * 3 + 1], z2 = vl[e2 * 3 + 2];
            const x3 = vl[e3 * 3], y3 = vl[e3 * 3 + 1], z3 = vl[e3 * 3 + 2];

            this.vertices.push(x1, y1, z1, x2, y2, z2, x3, y3, z3);

            // Analytical normals from scalar field gradient
            const n1 = f.getNormal(x1, y1, z1);
            const n2 = f.getNormal(x2, y2, z2);
            const n3 = f.getNormal(x3, y3, z3);

            this.normals.push(n1.x, n1.y, n1.z, n2.x, n2.y, n2.z, n3.x, n3.y, n3.z);
        }
    }

    // ------------------------------------------------------------------
    //  Helpers
    // ------------------------------------------------------------------

    _setCP(arr, idx, xi, yi, zi) {
        const p = this.field.getWorldPos(xi, yi, zi);
        arr[idx * 3] = p.x;
        arr[idx * 3 + 1] = p.y;
        arr[idx * 3 + 2] = p.z;
    }

    _interp(cp, cv, aIdx, bIdx, vl, edgeIdx) {
        const va = cv[aIdx], vb = cv[bIdx];
        const iso = this.isoLevel;

        let mu;
        const dv = vb - va;
        if (Math.abs(dv) < 1e-8) {
            mu = 0.5;
        } else {
            mu = (iso - va) / dv;
        }
        mu = Math.max(0, Math.min(1, mu));

        const ax = cp[aIdx * 3], ay = cp[aIdx * 3 + 1], az = cp[aIdx * 3 + 2];
        const bx = cp[bIdx * 3], by = cp[bIdx * 3 + 1], bz = cp[bIdx * 3 + 2];

        vl[edgeIdx * 3] = ax + mu * (bx - ax);
        vl[edgeIdx * 3 + 1] = ay + mu * (by - ay);
        vl[edgeIdx * 3 + 2] = az + mu * (bz - az);
    }

    /** Count active triangles */
    get triangleCount() {
        return this.vertices.length / 9;
    }
}
