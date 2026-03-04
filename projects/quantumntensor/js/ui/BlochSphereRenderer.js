/**
 * js/ui/BlochSphereRenderer.js
 * Calculates 3D to 2D projections of a sphere wireframe
 * and plots a vector (Theta, Phi) inside it, maintaining
 * canvas resizing logic dynamically.
 */

class BlochSphereRenderer {
    /**
     * @param {HTMLElement} parentContainer Where the 3D scene sits
     * @param {number} pQubitIndex Label identifying the sphere
     */
    constructor(parentContainer, pQubitIndex) {
        this.parent = parentContainer;
        this.qubitIndex = pQubitIndex;

        this.wrapper = document.createElement('div');
        this.wrapper.className = 'bloch-wrapper';

        this.title = document.createElement('div');
        this.title.className = 'bloch-title';
        this.title.innerHTML = `Qubit ${this.qubitIndex}`;

        this.canvas = document.createElement('canvas');
        this.canvas.className = 'bloch-canvas';

        this.wrapper.appendChild(this.title);
        this.wrapper.appendChild(this.canvas);
        this.parent.appendChild(this.wrapper);

        this.ctx = null;
        this.radius = window.MathConstants.BLOCH_SPHERE_RADIUS;

        // State
        this.theta = 0; // Initial |0>
        this.phi = 0;
        this.vectorRadius = 1.0;

        // 3D View Angles (Pitch/Yaw) to make it look "cool"
        this.cameraRotX = Math.PI / 8; // Tilt down looking at equator slightly
        this.cameraRotY = -Math.PI / 8; // Rotate laterally

        this.initCanvas();
    }

    initCanvas() {
        this.ctx = window.CanvasUtils.setupHighDPI(this.canvas);
        this.render();
    }

    /**
     * Receives math updates from UIManager
     * @param {number} theta 
     * @param {number} phi 
     * @param {number} vectorRadius Purity length (0 to 1)
     */
    updateCoordinates(theta, phi, vectorRadius) {
        this.theta = theta;
        this.phi = phi;
        this.vectorRadius = vectorRadius;
        this.render();
    }

    /**
     * 3D Rotation Matrix applying Camera view onto local point
     * @returns {Object} {x, y, z}
     */
    projectToCamera(x, y, z) {
        // Rotate Y (Yaw)
        let x1 = x * Math.cos(this.cameraRotY) - z * Math.sin(this.cameraRotY);
        let z1 = x * Math.sin(this.cameraRotY) + z * Math.cos(this.cameraRotY);
        let y1 = y;

        // Rotate X (Pitch)
        let y2 = y1 * Math.cos(this.cameraRotX) - z1 * Math.sin(this.cameraRotX);
        let z2 = y1 * Math.sin(this.cameraRotX) + z1 * Math.cos(this.cameraRotX);
        let x2 = x1;

        // Flatten Z (Orthographic projection roughly)
        return { x: x2, y: y2, z: z2 };
    }

    render() {
        let w = this.canvas.clientWidth;
        let h = this.canvas.clientHeight;

        this.ctx.clearRect(0, 0, w, h);

        let cx = w / 2;
        let cy = h / 2 + 10;
        let R = Math.min(cx, cy) - 20; // Dynamic sphere size bounded by container

        const { drawLine, drawCircle, drawText } = window.CanvasUtils;

        // Draw main sphere outline
        drawCircle(this.ctx, cx, cy, R, '#334455', false, 1);

        // Draw Equator (X-Z plane ellipse)
        const steps = 36;
        let points = [];
        for (let i = 0; i <= steps; i++) {
            let angle = (i / steps) * Math.PI * 2;
            let sx = Math.cos(angle);
            let sy = 0;
            let sz = Math.sin(angle);
            let p = this.projectToCamera(sx, sy, sz);
            points.push(p);
        }

        this.ctx.beginPath();
        this.ctx.strokeStyle = 'rgba(50, 80, 100, 0.4)';
        for (let i = 0; i < points.length; i++) {
            let p = points[i];
            if (i === 0) this.ctx.moveTo(cx + p.x * R, cy - p.y * R); // Note Y is inverted visually
            else this.ctx.lineTo(cx + p.x * R, cy - p.y * R);
        }
        this.ctx.stroke();

        // Axes projections
        let origin = this.projectToCamera(0, 0, 0);
        let zTop = this.projectToCamera(0, 1, 0);
        let zBot = this.projectToCamera(0, -1, 0);
        let xTop = this.projectToCamera(1, 0, 0);
        let yTop = this.projectToCamera(0, 0, 1);

        // Coordinate Axes (dashed)
        drawLine(this.ctx, cx + origin.x * R, cy - origin.y * R, cx + zTop.x * R, cy - zTop.y * R, '#555', 1, true); // +Z (up)
        drawLine(this.ctx, cx + origin.x * R, cy - origin.y * R, cx + zBot.x * R, cy - zBot.y * R, '#333', 1, true); // -Z (down)
        drawLine(this.ctx, cx + origin.x * R, cy - origin.y * R, cx + xTop.x * R, cy - xTop.y * R, '#555', 1, true); // +X (rightish)
        drawLine(this.ctx, cx + origin.x * R, cy - origin.y * R, cx + yTop.x * R, cy - yTop.y * R, '#555', 1, true); // +Y (depth)

        // State Vector Computation
        // x = sin(theta) * cos(phi)
        // y = sin(theta) * sin(phi)
        // z = cos(theta)
        // Warning: standard physics convention: Z is up/down. Our local 3d engine: Y is up/down locally, Z is depth.
        // So we map quantum Z to local Y. Quantum X to local X. Quantum Y to local Z.

        let stateLength = this.vectorRadius;

        let qX = stateLength * Math.sin(this.theta) * Math.cos(this.phi);
        let qY = stateLength * Math.sin(this.theta) * Math.sin(this.phi);
        let qZ = stateLength * Math.cos(this.theta);

        // Map to 3D Viewport coords
        let vX = qX;
        let vY = qZ;
        let vZ = -qY;

        let pState = this.projectToCamera(vX, vY, vZ);

        let stateColor = '#ff3366';
        if (this.vectorRadius < 0.95) {
            stateColor = '#9900ff'; // entangled visual
        }

        let finalX = cx + pState.x * R;
        let finalY = cy - pState.y * R;

        // Draw the State Arrow
        window.CanvasUtils.drawArrow(this.ctx, cx + origin.x * R, cy - origin.y * R, finalX, finalY, stateColor, 8);
        drawCircle(this.ctx, finalX, finalY, 3, '#fff', true);

        // Labels
        drawText(this.ctx, '|0⟩', cx + zTop.x * R, cy - zTop.y * R - 10, '#fff');
        drawText(this.ctx, '|1⟩', cx + zBot.x * R, cy - zBot.y * R + 10, '#fff');
        drawText(this.ctx, '+x', cx + xTop.x * R + 10, cy - xTop.y * R, '#888');
        drawText(this.ctx, '+y', cx + yTop.x * R, cy - yTop.y * R + 10, '#888');
    }
}

window.BlochSphereRenderer = BlochSphereRenderer;
