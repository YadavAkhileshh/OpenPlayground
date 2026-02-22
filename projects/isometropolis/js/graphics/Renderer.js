import { Camera } from './Camera.js';
import { SpriteSheet } from './SpriteSheet.js';
import { TileRenderer } from './TileRenderer.js';
import { OverlayRenderer } from './OverlayRenderer.js';
import { VehicleRenderer } from './VehicleRenderer.js';

/**
 * Main rendering coordinator.
 */
export class Renderer {
    /**
     * @param {HTMLCanvasElement} gameCanvas
     * @param {HTMLCanvasElement} overlayCanvas
     * @param {Camera} camera
     * @param {IsometricMath} isoMath
     */
    constructor(gameCanvas, overlayCanvas, camera, isoMath) {
        this.gameCanvas = gameCanvas;
        this.overlayCanvas = overlayCanvas;
        this.ctx = gameCanvas.getContext('2d', { alpha: false }); // Optimize
        this.overlayCtx = overlayCanvas.getContext('2d');

        this.camera = camera;
        this.isoMath = isoMath;

        this.sprites = new SpriteSheet(128, 64); // Tile sizing

        // Sub-renderers
        this.tileRenderer = new TileRenderer(this.isoMath, this.sprites);
        this.overlayRenderer = new OverlayRenderer(this.isoMath);
        this.vehicleRenderer = new VehicleRenderer(this.isoMath);
    }

    /**
     * Called every frame after simulation tick.
     * @param {CityMap} map
     * @param {VehicleManager} vehicleManager
     * @param {Object} uiState - current hovering and tool data
     */
    render(map, vehicleManager, uiState) {
        // --- GAME CANVAS ---
        // Clear background
        this.ctx.save();
        this.ctx.setTransform(1, 0, 0, 1, 0, 0);
        this.ctx.fillStyle = '#0b0f19'; // Deep dark background
        this.ctx.fillRect(0, 0, this.gameCanvas.width, this.gameCanvas.height);
        this.ctx.restore();

        // Apply Camera Transform
        this.ctx.save();
        this.camera.applyTo(this.ctx);

        // 1. Draw Map Tiles & Buildings (Painter's Algorithm inside)
        this.tileRenderer.render(this.ctx, map, this.camera.bounds);

        // 2. Draw Vehicles
        this.vehicleRenderer.render(this.ctx, vehicleManager, this.camera.bounds);

        this.ctx.restore();

        // --- OVERLAY CANVAS ---
        // Clear overlay completely (it's transparent)
        this.overlayCtx.clearRect(0, 0, this.overlayCanvas.width, this.overlayCanvas.height);

        this.overlayCtx.save();
        this.camera.applyTo(this.overlayCtx);

        // 3. Draw Grid, Selection, Interactions
        this.overlayRenderer.render(this.overlayCtx, map, uiState);

        this.overlayCtx.restore();
    }
}
