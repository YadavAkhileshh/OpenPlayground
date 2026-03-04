class Renderer {
    constructor(canvasId) {
        this.canvas = document.getElementById(canvasId);
        this.ctx = this.canvas.getContext('2d');
        this.width = this.canvas.width;
        this.height = this.canvas.height;
        this.backgroundColor = '#111';
        this.drawWireframe = false;

        this.light = new Light(0.5, 1, 0.8, 1.0);

        window.addEventListener('resize', () => this.resize());
        this.resize();
    }

    resize() {
        this.canvas.width = this.canvas.clientWidth;
        this.canvas.height = this.canvas.clientHeight;
        this.width = this.canvas.width;
        this.height = this.canvas.height;
    }

    project(v, transformMatrix) {
        const pos = v.pos.applyMatrix4(transformMatrix);
        const x = (pos.x + 1) * 0.5 * this.width;
        const y = (1 - (pos.y + 1) * 0.5) * this.height;
        return { x: x, y: y, z: pos.z };
    }

    render(scene, camera) {
        this.ctx.fillStyle = this.backgroundColor;
        this.ctx.fillRect(0, 0, this.width, this.height);

        const vpMatrix = new Matrix4().multiplyMatrices(camera.projectionMatrix, camera.viewMatrix);

        let renderList = [];

        scene.meshes.forEach(mesh => {
            const polys = mesh.getTransformedPolygons();
            const material = mesh.material || Material.default();

            polys.forEach(poly => {
                let cx = 0, cy = 0, cz = 0;
                poly.vertices.forEach(v => { cx += v.pos.x; cy += v.pos.y; cz += v.pos.z; });
                const invLen = 1.0 / poly.vertices.length;
                const center = new Vector3(cx * invLen, cy * invLen, cz * invLen);

                const viewDir = camera.position.sub(center).normalize();

                if (!poly.plane) {
                    poly.plane = Plane.fromPoints(poly.vertices[0].pos, poly.vertices[1].pos, poly.vertices[2].pos);
                }
                const normal = poly.plane.normal;

                if (normal.dot(viewDir) <= 0) {
                    if (!material.wireframe) return; // Simple culling
                }

                const projectedVerts = poly.vertices.map(v => this.project(v, vpMatrix));

                // Z-sort center
                let avgZ = 0;
                projectedVerts.forEach(pv => avgZ += pv.z);
                avgZ /= projectedVerts.length;

                // Lighting
                const lightDir = this.light.direction;
                const diffuse = Math.max(0, normal.dot(lightDir));

                const reflectDir = normal.multiply(2 * diffuse).sub(lightDir).normalize();
                const specBase = Math.max(0, viewDir.dot(reflectDir));
                const specular = material.specular * Math.pow(specBase, material.shininess || 32);

                const ambient = 0.2 + (material.emissive || 0);
                const brightness = Math.min(1, Math.max(0, ambient + diffuse * this.light.intensity));

                const r = material.color.r * brightness + specular * 255;
                const g = material.color.g * brightness + specular * 255;
                const b = material.color.b * brightness + specular * 255;

                const color = `rgba(${Math.min(255, Math.floor(r))}, ${Math.min(255, Math.floor(g))}, ${Math.min(255, Math.floor(b))}, ${material.opacity || 1})`;

                renderList.push({
                    verts: projectedVerts,
                    z: avgZ, // Use projected Z which is pseudo-depth
                    color: color,
                    mesh: mesh,
                    wireframe: this.drawWireframe || material.wireframe
                });
            });
        });

        renderList.sort((a, b) => b.z - a.z);

        renderList.forEach(poly => {
            this.ctx.beginPath();
            this.ctx.moveTo(poly.verts[0].x, poly.verts[0].y);
            for (let i = 1; i < poly.verts.length; i++) {
                this.ctx.lineTo(poly.verts[i].x, poly.verts[i].y);
            }
            this.ctx.closePath();

            if (!poly.wireframe || poly.mesh === scene.activeMesh) {
                this.ctx.fillStyle = poly.color;
                this.ctx.fill();
            }

            // Draw active mesh wireframe overlay or just generic wireframe
            if (this.drawWireframe || poly.mesh === scene.activeMesh) {
                this.ctx.strokeStyle = (poly.mesh === scene.activeMesh) ? '#ffee00' : '#444';
                this.ctx.lineWidth = (poly.mesh === scene.activeMesh) ? 1.5 : 0.5;
                this.ctx.stroke();
            }
        });
    }
}
