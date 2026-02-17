import { Vector3, clamp } from '../utils/math.js';
import { CONFIG } from '../utils/constants.js';

export class Camera {
    constructor(x, y, z) {
        this.position = new Vector3(x, y, z);
        this.direction = new Vector3(0, 0, 1);
        this.plane = new Vector3(0.66, 0, 0); // Camera plane for FOV

        this.yaw = 0;   // Horizontal rotation (radians)
        this.pitch = 0; // Vertical rotation (radians) (looking up/down)
    }

    updateVectors() {
        // Calculate direction vector based on yaw and pitch
        // Note: For a raycaster, pitch is often simulated by shifting the horizon (y-shearing) 
        // rather than true vector rotation, but for 3D DDA we might use 3D vectors.
        // Let's stick to standard 3D vectors for direction.

        const cosYaw = Math.cos(this.yaw);
        const sinYaw = Math.sin(this.yaw);
        const cosPitch = Math.cos(this.pitch);
        const sinPitch = Math.sin(this.pitch);

        this.direction.x = sinYaw * cosPitch;
        this.direction.y = sinPitch;
        this.direction.z = cosYaw * cosPitch;
        this.direction.normalize();

        // Re-calculate camera plane (perpendicular to direction, on logic XZ plane)
        // This is a simplification for the raycasting loop
        this.plane.x = cosYaw;
        this.plane.z = -sinYaw;

        // Scale plane for FOV (approx)
        const fovScale = Math.tan(CONFIG.FOV / 2);
        this.plane.x *= fovScale;
        this.plane.z *= fovScale;
    }

    rotate(dx, dy) {
        this.yaw += dx * CONFIG.ROTATION_SPEED * 0.002;
        this.pitch -= dy * CONFIG.ROTATION_SPEED * 0.002;

        // Clamp pitch to avoid flipping upside down
        this.pitch = clamp(this.pitch, -Math.PI / 2 + 0.1, Math.PI / 2 - 0.1);

        this.updateVectors();
    }
}
