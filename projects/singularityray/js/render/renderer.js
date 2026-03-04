/**
 * SingularityRay JS - Render - Renderer
 * High-level coordinator that binds the Raymarcher, FrameBuffer, Camera 
 * and Post processing systems. Executes the nested XY loops over the screen.
 */

import { Ray } from '../physics/ray.js';
import { Vec3 } from '../math/vec3.js';
import { ColorUtils } from './color_utils.js';

export class Renderer {
    /**
     * @param {import('./frame_buffer.js').FrameBuffer} frameBuffer 
     * @param {import('./camera.js').Camera} camera 
     * @param {import('./raymarcher.js').Raymarcher} raymarcher 
     * @param {import('./post_processing.js').PostProcessor} postProcessor 
     */
    constructor(frameBuffer, camera, raymarcher, postProcessor) {
        this.frameBuffer = frameBuffer;
        this.camera = camera;
        this.raymarcher = raymarcher;
        this.postProcessor = postProcessor;

        // Single statically allocated Ray to prevent GC pauses inside loops
        this.workingRay = new Ray();
        this.pixelColor = new Vec3();

        // Progressive render options
        this.progressive = true;
        this.passScale = 4; // Start with 4x4 blocks
        this.currentScale = 4;

        this.lastFrameTime = performance.now();
        this.targetFPS = 60.0;
        this.timeBudgetMs = 1000.0 / this.targetFPS;
    }

    /**
     * Triggers a full resolution redraw directly
     * Used when the camera stops moving.
     */
    triggerFullRender() {
        this.currentScale = 1;
    }

    /**
     * Triggers a fast scaled render
     * Used interactively while camera is moving.
     */
    triggerFastRender() {
        this.currentScale = this.passScale;
    }

    /**
     * Main Render Loop execution method
     * Scans the 2D grid of pixels and fires rays into the scene.
     */
    render() {
        const width = this.frameBuffer.width;
        const height = this.frameBuffer.height;
        const pixels = this.frameBuffer.pixels;
        const scale = this.currentScale;

        // Inverse width/height for fast normalized coordinates
        const invWidth = 1.0 / width;
        const invHeight = 1.0 / height;

        // Optimization: if scaling down, we write large blocks of identical colors
        const pitch = width * 4; // bytes per row

        for (let y = 0; y < height; y += scale) {
            // Normalized Device Device Y coordinate [-1, 1]
            // We flip Y since canvas 0 is top
            const ndcY = -((y * invHeight) * 2.0 - 1.0);

            for (let x = 0; x < width; x += scale) {
                // Normalized Device Coordinate X coordinate [-1, 1]
                const ndcX = (x * invWidth) * 2.0 - 1.0;

                // Get ray from camera into the scene for this pixel
                this.camera.getRay(ndcX, ndcY, this.workingRay);

                // Perform curved CPU raymarch (heavy function)
                const rawColor = this.raymarcher.march(this.workingRay);

                // Apply tone-mapping and gamma
                this.pixelColor.copy(rawColor);
                this.postProcessor.process(this.pixelColor);

                // Pack float vector [0,1] into Uint8 [0,255]
                // and write it to our 1D pixel array
                const baseIdx = (y * width + x) * 4;
                ColorUtils.packRGBA(this.pixelColor, pixels, baseIdx);

                // If rendering progressively scaled, fill the adjacent pixels in the block
                if (scale > 1) {
                    const r = pixels[baseIdx];
                    const g = pixels[baseIdx + 1];
                    const b = pixels[baseIdx + 2];

                    for (let blockY = 0; blockY < scale; blockY++) {
                        const targetY = y + blockY;
                        if (targetY >= height) continue;

                        for (let blockX = 0; blockX < scale; blockX++) {
                            // Don't overwrite the original pixel we just calculated
                            if (blockY === 0 && blockX === 0) continue;

                            const targetX = x + blockX;
                            if (targetX >= width) continue;

                            const fillIdx = (targetY * width + targetX) * 4;
                            pixels[fillIdx] = r;
                            pixels[fillIdx + 1] = g;
                            pixels[fillIdx + 2] = b;
                            pixels[fillIdx + 3] = 255;
                        }
                    }
                }
            }
        }

        // Draw image data to actual canvas
        this.frameBuffer.present();

        // Progressive refinement system: automatically increase resolution
        // if we have finished a frame and haven't moved.
        if (this.progressive && this.currentScale > 1) {
            this.currentScale = Math.max(1, Math.floor(this.currentScale / 2));
        }
    }
}
