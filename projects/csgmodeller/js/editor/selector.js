class Selector {
    constructor(camera, renderer) {
        this.camera = camera;
        this.renderer = renderer;
    }

    getRay(x, y) {
        const ndcX = (x / this.renderer.width) * 2 - 1;
        const ndcY = -(y / this.renderer.height) * 2 + 1;

        const tanFov = Math.tan((this.camera.fov * Math.PI) / 360);
        const aspect = this.camera.aspect;

        const vy = tanFov * this.camera.near * ndcY;
        const vx = tanFov * aspect * this.camera.near * ndcX;
        const vz = -this.camera.near;

        const viewDir = new Vector3(vx, vy, vz).normalize();

        const vm = this.camera.viewMatrix.elements;
        const right = new Vector3(vm[0], vm[4], vm[8]);
        const up = new Vector3(vm[1], vm[5], vm[9]);
        const forward = new Vector3(vm[2], vm[6], vm[10]);

        const worldDir = right.multiply(viewDir.x)
            .add(up.multiply(viewDir.y))
            .add(forward.multiply(viewDir.z))
            .normalize();

        return new Ray(this.camera.position.clone(), worldDir);
    }

    pick(x, y, meshes) {
        const ray = this.getRay(x, y);
        let closestMesh = null;
        let minDist = Infinity;

        // Bounding box optimization would go here

        for (const mesh of meshes) {
            // We use transformed polys for picking in world space
            const polys = mesh.getTransformedPolygons();

            for (const poly of polys) {
                // Optimization: Dot product of normal and ray. If back facing, ignore?
                const hit = ray.intersectPolygon(poly);
                if (hit && hit.distance < minDist) {
                    minDist = hit.distance;
                    closestMesh = mesh;
                }
            }
        }
        return closestMesh;
    }
}
