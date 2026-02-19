/**
 * Projection Module
 * Handles converting 3D world coordinates to 2D screen coordinates.
 */
import { Matrix4 } from './matrix.js';

export class Projector {
    constructor(width, height) {
        this.width = width;
        this.height = height;
        this.cameraZ = 1000;
        this.projectionMatrix = new Matrix4();
        this.updateAspect(width, height);
    }

    /**
     * Updates the aspect ratio and recalculates projection matrix.
     * @param {number} width 
     * @param {number} height 
     */
    updateAspect(width, height) {
        this.width = width;
        this.height = height;
        const aspect = width / height;
        this.projectionMatrix.makePerspective(60, aspect, 0.1, 2000);
    }

    /**
     * Projects a 3D point to 2D screen space.
     * @param {Vector3} v - World position.
     * @returns {object} {x, y, scale} Screen coordinates and generic scale factor for size.
     */
    project(v) {
        // Simple manual projection if we assume camera is at (0,0,cameraZ) looking at (0,0,0)
        // or use the matrix.
        // Using matrix allows for more complex camera movement later if desired.

        // We'll treat the camera as being at (0,0,1000) for now.
        // We need to transform the point relative to camera before projecting.
        // Let's assume world space is centered at 0,0,0.
        // So camera view matrix would translate by -1000 Z.

        // For simplicity and "elastic matter suspending in space", straightforward perspective divide is often cleaner visually.
        // screenX = x * (focalLength / (z + cameraDistance)) + cx
        // screenY = y * (focalLength / (z + cameraDistance)) + cy

        const fov = 1000;
        const viewerDistance = 800;

        // Invert Y for canvas coordinate system if needed, but usually 3D y-up vs 2D y-down.
        // Let's keep it simple: 

        const scale = fov / (fov + v.z + viewerDistance);

        const x2d = v.x * scale + this.width / 2;
        const y2d = v.y * scale + this.height / 2; // Invert Y here if physical Y is up.

        return {
            x: x2d,
            y: y2d,
            scale: scale,
            visible: scale > 0
        };
    }

    // Matrix version if we want strict correctness
    projectWithMatrix(v) {
        // Move point into view space (camera at 0,0,1000 looking -Z)
        // This means we just sub 1000 from Z? 
        // Or we keep camera at 0,0,0 and move objects.
        // Let's stick to the manual projection above for the "Ribbon" aesthetic 
        // as it gives easier control over the "flow" feel without setting up a full camera rig.
        return this.project(v);
    }
}
