/**
 * Manages the statistics display on the UI.
 * Updates generation count, fitness score, polygon count, and FPS.
 */
export class StatsManager {
    /**
     * Creates a new StatsManager.
     * Caches DOM elements for performance.
     */
    constructor() {
        this.elGeneration = document.getElementById('stat-generation');
        this.elFitness = document.getElementById('stat-fitness');
        this.elPolygons = document.getElementById('stat-polygons');
        this.elFps = document.getElementById('stat-fps');

        this.lastFrameTime = performance.now();
        this.frameCount = 0;
        this.lastFpsUpdate = 0;
    }

    /**
     * Updates the displayed statistics.
     * Throttles DOM updates to avoid layout trashing, although requestAnimationFrame
     * usually handles this well.
     * 
     * @param {number} generation - Current generation number.
     * @param {number} fitness - Current fitness score (lower is better).
     * @param {number} polygonCount - Number of polygons in the genome.
     */
    update(generation, fitness, polygonCount) {
        // Update basic stats
        // We update text content directly.
        if (generation % 10 === 0) {
            this.elGeneration.textContent = generation.toLocaleString();
            this.elFitness.textContent = Math.floor(fitness).toLocaleString();
            this.elPolygons.textContent = polygonCount;
        }

        // Calculate and update FPS every second
        this.frameCount++;
        const now = performance.now();
        if (now - this.lastFpsUpdate >= 1000) {
            const fps = Math.round((this.frameCount * 1000) / (now - this.lastFpsUpdate));
            this.elFps.textContent = fps;
            this.frameCount = 0;
            this.lastFpsUpdate = now;
        }
    }

    /**
     * Resets the stats display to initial values.
     */
    reset() {
        this.elGeneration.textContent = '0';
        this.elFitness.textContent = 'Infinity';
        this.elPolygons.textContent = '50';
        this.elFps.textContent = '0';
        this.frameCount = 0;
    }
}
