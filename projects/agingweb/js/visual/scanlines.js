/**
 * scanlines.js
 * Manages the scanline overlay specifically.
 */

export class ScanlineRenderer {
    constructor() {
        this.el = document.getElementById('scanline-overlay');
        this.active = false;
    }

    update(chaosLevel) {
        // Scanlines appear later in the decay
        if (chaosLevel < 0.3) {
            if (this.active) {
                this.el.style.opacity = 0;
                this.active = false;
            }
            return;
        }

        this.active = true;

        // Opacity ramps up
        const opacity = (chaosLevel - 0.3) * 0.5; // Max 0.35
        this.el.style.opacity = opacity;

        // At high levels, scanlines move or flicker
        if (chaosLevel > 0.7) {
            // We can adjust background-size or position via style to simulate roll
            const roll = Math.random() * 10;
            this.el.style.backgroundPositionY = `${roll}px`;
        }
    }
}
