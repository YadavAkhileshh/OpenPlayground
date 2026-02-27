/**
 * HUD Class
 * Manages the overlay user interface.
 */
export class HUD {
    constructor() {
        this.fpsElem = document.getElementById('fps');
        this.ribbonsElem = document.getElementById('ribbons');
        this.particlesElem = document.getElementById('particles');
        this.container = document.getElementById('ui-container');
    }

    updateStats(fps, ribbonCount, particleCount) {
        if (this.fpsElem) this.fpsElem.textContent = `FPS: ${fps}`;
        if (this.ribbonsElem) this.ribbonsElem.textContent = `RIBBONS: ${ribbonCount}`;
        if (this.particlesElem) this.particlesElem.textContent = `PARTICLES: ${particleCount}`;
    }

    toggleVisibility(visible) {
        this.container.style.display = visible ? 'block' : 'none';
    }
}
