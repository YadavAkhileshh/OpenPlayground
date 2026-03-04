class Mesh {
    constructor(csg) {
        this.csg = csg || new CSG();
        this.position = new Vector3();
        this.rotation = new Vector3();
        this.scale = new Vector3(1, 1, 1);
        this.modelMatrix = new Matrix4();
        this.updateMatrix();
    }

    static fromCSG(csg) {
        return new Mesh(csg);
    }

    updateMatrix() {
        const t = new Matrix4().makeTranslation(this.position.x, this.position.y, this.position.z);
        const rX = new Matrix4().makeRotationX(this.rotation.x);
        const rY = new Matrix4().makeRotationY(this.rotation.y);

        // Model = T * Ry * Rx (simple Euler rotation order)
        this.modelMatrix.identity().multiply(t).multiply(rY).multiply(rX);
    }

    // Get polygons with transformations applied (expensive, used for CSG ops)
    getTransformedPolygons() {
        this.updateMatrix();
        const polys = this.csg.polygons;
        const newPolys = [];

        for (let i = 0; i < polys.length; i++) {
            const p = polys[i];
            const newVerts = [];
            for (let j = 0; j < p.vertices.length; j++) {
                const v = p.vertices[j];
                const pos = v.pos.applyMatrix4(this.modelMatrix);
                // Transform normal: for rigid body (rot/trans), standard matrix works.
                // For scaling, we need inverse transpose. 
                // Since we don't support non-uniform scaling in matrix yet effectively, 
                // we'll stick to rotation/translation for normals.
                const norm = v.normal.applyMatrix4(this.modelMatrix).sub(
                    new Vector3(0, 0, 0).applyMatrix4(this.modelMatrix)
                ).normalize();
                newVerts.push(new Vertex(pos, norm));
            }
            newPolys.push(new Polygon(newVerts, p.shared));
        }
        return newPolys;
    }
}
