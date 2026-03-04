import { CONFIG, PALETTE } from '../utils/constants.js';
import { Vector3 } from '../utils/math.js';

export class Renderer {
    constructor(canvas, camera, raycaster) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d', { alpha: false });
        this.camera = camera;
        this.raycaster = raycaster;

        this.width = 0;
        this.height = 0;
        this.imageData = null;
        this.pixels = null;

        // Reusable vectors for the loop
        this.rayDir = new Vector3();
        this.forward = new Vector3();
        this.right = new Vector3();
        this.up = new Vector3();
        this.rightScale = new Vector3();
        this.upScale = new Vector3();
        this.rowBase = new Vector3();

        // Reusable hit result
        this.hitResult = {
            hit: false,
            block: 0,
            distance: 0,
            side: 0,
            face: 0,
            mapPos: new Vector3(),
            hitPos: new Vector3()
        };

        this.resize();
        window.addEventListener('resize', () => this.resize());
    }

    resize() {
        const resolution = CONFIG.RESOLUTION || 0.5; // Default to half res for perf
        const realWidth = window.innerWidth;
        const realHeight = window.innerHeight;

        this.width = Math.floor(realWidth * resolution);
        this.height = Math.floor(realHeight * resolution);

        this.canvas.width = this.width;
        this.canvas.height = this.height;

        this.imageData = this.ctx.createImageData(this.width, this.height);
        this.pixels = new Uint32Array(this.imageData.data.buffer);

        CONFIG.WIDTH = this.width;
        CONFIG.HEIGHT = this.height;
    }

    render() {
        // Clear buffer (Sky color: #87CEEB -> ABGR: FF EB CE 87)
        this.pixels.fill(0xFFEBCE87);

        const w = this.width;
        const h = this.height;
        const aspect = w / h;

        const camPos = this.camera.position;
        const camDir = this.camera.direction;

        // Calculate basis vectors
        this.forward.copy(camDir).normalize();

        // Right = Cross(Forward, WorldUp)
        // Assume world up is Y (0,1,0)
        // If forward is straight up/down, handle singularity
        if (Math.abs(this.forward.y) > 0.99) {
            this.right.set(1, 0, 0);
        } else {
            this.right.set(this.forward.z, 0, -this.forward.x).normalize();
        }

        // Up = Cross(Right, Forward)
        this.up.x = this.right.y * this.forward.z - this.right.z * this.forward.y;
        this.up.y = this.right.z * this.forward.x - this.right.x * this.forward.z;
        this.up.z = this.right.x * this.forward.y - this.right.y * this.forward.x;
        this.up.normalize(); // Should be normalized already

        // Apply FOV scaling
        const fovScale = Math.tan(CONFIG.FOV / 2);

        // rightScale = right * aspect * fovScale
        this.rightScale.copy(this.right).multiplyScalar(aspect * fovScale);

        // upScale = up * fovScale (negate y if needed for screen coords, usually screen y goes down)
        // In 3D cam code, y usually goes up. Screen y goes down.
        // So we map screen y (0..h) to viewport (+1..-1).
        this.upScale.copy(this.up).multiplyScalar(fovScale);

        const maxDist = CONFIG.RENDER_DISTANCE * CONFIG.CHUNK_SIZE;

        // Render loop
        for (let y = 0; y < h; y++) {
            // v from 1 to -1
            const v = 1 - 2 * (y / h);

            // rowBase = forward + upScale * v
            this.rowBase.x = this.forward.x + this.upScale.x * v;
            this.rowBase.y = this.forward.y + this.upScale.y * v;
            this.rowBase.z = this.forward.z + this.upScale.z * v;

            for (let x = 0; x < w; x++) {
                // u from -1 to 1
                const u = 2 * (x / w) - 1;

                // rayDir = rowBase + rightScale * u
                this.rayDir.x = this.rowBase.x + this.rightScale.x * u;
                this.rayDir.y = this.rowBase.y + this.rightScale.y * u;
                this.rayDir.z = this.rowBase.z + this.rightScale.z * u;
                // Raycaster normalizes, but let's do it if needed?
                // DDA requires normalized direction for delta calcs? 
                // Actually my DDA implementation uses 1/dx so normalization scales the t values.
                // If I don't normalize, 'dist' will be in units of direction vector length.
                // So yes, normalization is needed for correct distance.
                // Doing 1/sqrt per pixel is expensive.
                // BUT: logic above constructs a direction vector on the view plane.
                // It is NOT unit length.
                // If I skip normalization, the distance returned is "multiples of view plane vector".
                // That might be fine for hit testing, but for lighting/fog we need real distance.
                // Let's normalize. optimizing sqrt is hard in JS.
                this.rayDir.normalize();

                this.raycaster.cast(camPos, this.rayDir, maxDist, this.hitResult);

                if (this.hitResult.hit) {
                    const blockId = this.hitResult.block;
                    const color = PALETTE[blockId];
                    if (color) {
                        // Face shading
                        let r = color[0];
                        let g = color[1];
                        let b = color[2];

                        const side = this.hitResult.side;
                        if (side === 1) { // Y (Top/Bottom)
                            r *= 1.0; g *= 1.0; b *= 1.0;
                        } else if (side === 0) { // X
                            r *= 0.75; g *= 0.75; b *= 0.75;
                        } else { // Z
                            r *= 0.6; g *= 0.6; b *= 0.6;
                        }

                        // Distance Fog
                        const d = this.hitResult.distance;
                        const fogFactor = 1.0 - (d / maxDist);
                        // Simple linear fog
                        if (fogFactor < 0) continue; // Should catch maxDist

                        r = Math.floor(r * fogFactor);
                        g = Math.floor(g * fogFactor);
                        b = Math.floor(b * fogFactor);

                        // ABGR
                        const idx = y * w + x;
                        this.pixels[idx] = (255 << 24) | (b << 16) | (g << 8) | r;
                    }
                }
            }
        }

        this.ctx.putImageData(this.imageData, 0, 0);
    }
}
