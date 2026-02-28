/**
 * js/ui/AnimationEngine.js
 * Handles lightweight procedural cinematic effects like
 * hovering particles, pulsing glows, and execution highlights.
 */

class AnimationEngine {
    constructor() {
        this.running = false;
        this.lastTime = 0;
        this.glowIntensity = 1.0;
        this.glowDir = 1;

        this._loop = this.loop.bind(this);
    }

    start() {
        if (this.running) return;
        this.running = true;
        this.lastTime = performance.now();
        requestAnimationFrame(this._loop);
    }

    stop() {
        this.running = false;
    }

    loop(currentTime) {
        if (!this.running) return;
        let dt = currentTime - this.lastTime;
        this.lastTime = currentTime;

        // Pulse the main UI cinematic glow
        this.glowIntensity += (this.glowDir * 0.001 * dt);
        if (this.glowIntensity > 1.2) this.glowDir = -1;
        if (this.glowIntensity < 0.8) this.glowDir = 1;

        document.documentElement.style.setProperty('--cinematic-pulse', this.glowIntensity);

        requestAnimationFrame(this._loop);
    }

    /**
     * Triggers a specific DOM element to flash brightly
     * @param {HTMLElement} el 
     */
    flashElement(el, color = '#ffffff') {
        const origColor = el.style.backgroundColor;
        el.style.transition = 'none';
        el.style.backgroundColor = color;
        el.style.boxShadow = `0 0 20px ${color}`;

        // Force reflow
        void el.offsetWidth;

        el.style.transition = 'all 0.5s ease-out';
        el.style.backgroundColor = origColor || '';
        el.style.boxShadow = '';
    }
}

window.AnimationEngine = AnimationEngine;
