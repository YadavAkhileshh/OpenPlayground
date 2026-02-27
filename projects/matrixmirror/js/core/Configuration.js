/**
 * @file Configuration.js
 * @description Manages application settings, persistence, and state.
 */

export class Configuration {
    constructor(eventBus) {
        this.bus = eventBus;

        // Default settings
        this.defaults = {
            video: {
                facingMode: 'user',
                width: 640,
                height: 480,
                mirror: true
            },
            ascii: {
                density: 12,
                charSet: 'custom',
                invert: false,
                brightness: 1.0,
                contrast: 1.2
            },
            render: {
                fps: 30,
                colorMode: 'matrix', // matrix, truecolor, heatmap
                phosphorFade: 0.3,
                scanlines: true,
                glow: true
            },
            effects: {
                digitalRain: true,
                rainSpeed: 1.0,
                rainDensity: 0.1
            }
        };

        this.state = this.load();

        // Listen for changes requests
        this.bus.on('config:update', (update) => this.update(update));
        this.bus.on('config:reset', () => this.reset());
    }

    /**
     * Load settings from localStorage or use defaults.
     */
    load() {
        try {
            const saved = localStorage.getItem('matrix_mirror_config');
            if (saved) {
                const parsed = JSON.parse(saved);
                return this.merge(this.defaults, parsed);
            }
        } catch (e) {
            console.warn('Failed to load config, using defaults');
        }
        return JSON.parse(JSON.stringify(this.defaults));
    }

    /**
     * Save current state to localStorage.
     */
    save() {
        try {
            localStorage.setItem('matrix_mirror_config', JSON.stringify(this.state));
        } catch (e) {
            console.error('Failed to save config', e);
        }
    }

    /**
     * Deep merge helper.
     */
    merge(target, source) {
        for (const key in source) {
            if (source[key] instanceof Object && key in target) {
                Object.assign(source[key], this.merge(target[key], source[key]));
            }
        }
        Object.assign(target || {}, source);
        return target;
    }

    /**
     * Update configuration and emit change events.
     * @param {Object} updates - Partial config object.
     */
    update(updates) {
        // Apply updates
        // Note: usage might be config.video.width, so we need to handle nested updates carefully
        // For simplicity in this version, we assume flat path updates or full object replacements for sections

        // Let's implement path-based updates if needed, or just simple merge
        // Assuming updates is { section: { key: value } }

        this.state = this.merge(this.state, updates);
        this.save();

        this.bus.emit('config:changed', this.state);

        // Emit specific section changes
        Object.keys(updates).forEach(section => {
            this.bus.emit(\`config:changed:\${section}\`, this.state[section]);
        });
    }

    /**
     * Get a value by path (e.g., 'video.width')
     */
    get(path) {
        return path.split('.').reduce((obj, key) => obj && obj[key], this.state);
    }

    reset() {
        this.state = JSON.parse(JSON.stringify(this.defaults));
        this.save();
        this.bus.emit('config:changed', this.state);
    }
}
