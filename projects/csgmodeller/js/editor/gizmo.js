class Gizmo {
    constructor(renderer, selector) {
        this.renderer = renderer;
        this.selector = selector;
        this.activeMesh = null;
        this.mode = 'translate'; // translate, rotate, scale
        this.selectedAxis = null; // 'x', 'y', 'z'
        this.hoverAxis = null;

        // Gizmo geometry (simple lines/cones)
        this.axisLength = 2.0;
        this.axisRadius = 0.1;
    }

    update(activeMesh) {
        this.activeMesh = activeMesh;
    }

    // Render gizmo on top of everything
    render(camera) {
        if (!this.activeMesh) return;

        const pos = this.activeMesh.position;
        const ctx = this.renderer.ctx;

        // Project center
        const pCenter = this.renderer.project(new Vertex(pos, new Vector3()), new Matrix4().multiplyMatrices(camera.projectionMatrix, camera.viewMatrix));

        // We need to draw lines in 3D.
        // X Axis (Red)
        this.drawAxis(camera, pos, new Vector3(1, 0, 0), '#ff0000', 'x');
        // Y Axis (Green)
        this.drawAxis(camera, pos, new Vector3(0, 1, 0), '#00ff00', 'y');
        // Z Axis (Blue)
        this.drawAxis(camera, pos, new Vector3(0, 0, 1), '#0000ff', 'z');
    }

    drawAxis(camera, center, dir, color, axisName) {
        const end = center.add(dir.multiply(this.axisLength));
        const vp = new Matrix4().multiplyMatrices(camera.projectionMatrix, camera.viewMatrix);

        const p1 = this.renderer.project(new Vertex(center, new Vector3()), vp);
        const p2 = this.renderer.project(new Vertex(end, new Vector3()), vp);

        const ctx = this.renderer.ctx;
        ctx.beginPath();
        ctx.moveTo(p1.x, p1.y);
        ctx.lineTo(p2.x, p2.y);
        ctx.strokeStyle = (this.hoverAxis === axisName) ? '#ffff00' : color;
        ctx.lineWidth = 3;
        ctx.stroke();

        // Draw Cone/Arrowhead (Screen space approximation for simplicity)
        // ...
        // Keeping it simple with lines for now.
    }

    // Check intersection with gizmo axes
    checkHit(x, y) {
        if (!this.activeMesh) return null;

        // Simplified 2D distance check to projected lines
        // A proper 3D ray-cylinder check would be better but requires more math.
        // We'll trust the Selector's getRay but do a distance check to axis segments.

        // TODO: Implement cleaner screen-space distance check
        this.hoverAxis = null;
        return null; // Placeholder
    }
}
