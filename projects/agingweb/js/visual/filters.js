/**
 * filters.js
 * Manages fine-grained CSS filters on specific elements that require
 * more dynamic updates than simple class switching.
 */

export class FilterManager {
    constructor() {
        this.body = document.body;
        this.hero = document.querySelector('.hero-visual');
    }

    update(chaosLevel) {
        // Apply dynamic hue rotation based on chaos
        // A slight color drift that feels sickly
        const hueRotate = Math.floor(chaosLevel * 30); // 0 to 30deg
        const invert = chaosLevel > 0.95 ? (Math.random() > 0.5 ? 100 : 0) : 0;

        // We act on the variable defined in CSS
        document.documentElement.style.setProperty('--filter-sepia', `${chaosLevel * 80}%`);
        document.documentElement.style.setProperty('--filter-contrast', `${100 + chaosLevel * 50}%`);

        // Random intense blur spikes
        if (chaosLevel > 0.8 && Math.random() > 0.9) {
            document.documentElement.style.setProperty('--filter-blur', '2px');
        } else {
            document.documentElement.style.setProperty('--filter-blur', '0px');
        }

        // Glitch the hero image background
        if (this.hero && chaosLevel > 0.4) {
            this.hero.style.filter = `hue-rotate(${hueRotate}deg)`;
        }
    }
}
