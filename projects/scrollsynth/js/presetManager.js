// ============================================
// PRESET MANAGER
// ============================================

/**
 * PresetManager handles saving and loading synth presets
 */
class PresetManager {
    constructor(audioEngine) {
        this.audio = audioEngine;
        this.presets = [];
        this.listElement = document.getElementById('presetList');

        // Load presets from storage
        this.loadFromStorage();

        // Load default presets if none exist
        if (this.presets.length === 0) {
            this.loadDefaults();
        }

        // Render preset list
        this.render();
    }

    /**
     * Save current settings as preset
     * @param {string} name - Preset name
     */
    save(name) {
        if (!name || name.trim() === '') {
            console.error('Preset name cannot be empty');
            return false;
        }

        // Check max presets
        if (this.presets.length >= CONFIG.PRESET.MAX_PRESETS) {
            console.error('Maximum presets reached');
            return false;
        }

        // Get current settings
        const settings = this.audio.getSettings();

        // Create preset object
        const preset = {
            id: Date.now(),
            name: name.trim(),
            waveform: settings.waveform,
            volume: Math.round(this.audio.params.gainToPercentage(settings.volume)),
            filterType: settings.filterType,
            filterQ: Math.round(MATH.normalize(settings.filterQ, CONFIG.AUDIO.MIN_FILTER_Q, CONFIG.AUDIO.MAX_FILTER_Q) * 100),
            distortion: settings.distortion,
            created: new Date().toISOString()
        };

        // Add to presets
        this.presets.push(preset);

        // Save to storage
        this.saveToStorage();

        // Re-render
        this.render();

        return true;
    }

    /**
     * Load a preset
     * @param {number} id - Preset ID
     */
    load(id) {
        const preset = this.presets.find(p => p.id === id);
        if (!preset) {
            console.error('Preset not found');
            return false;
        }

        // Load settings into audio engine
        this.audio.loadSettings(preset);

        // Update UI controls (will be handled by UIController)
        window.dispatchEvent(new CustomEvent('presetLoaded', { detail: preset }));

        return true;
    }

    /**
     * Delete a preset
     * @param {number} id - Preset ID
     */
    delete(id) {
        const index = this.presets.findIndex(p => p.id === id);
        if (index === -1) {
            console.error('Preset not found');
            return false;
        }

        // Remove from array
        this.presets.splice(index, 1);

        // Save to storage
        this.saveToStorage();

        // Re-render
        this.render();

        return true;
    }

    /**
     * Load default presets
     */
    loadDefaults() {
        CONFIG.PRESET.DEFAULTS.forEach(preset => {
            this.presets.push({
                id: Date.now() + Math.random(),
                ...preset,
                created: new Date().toISOString()
            });
        });

        this.saveToStorage();
    }

    /**
     * Save presets to localStorage
     */
    saveToStorage() {
        try {
            localStorage.setItem(CONFIG.PRESET.STORAGE_KEY, JSON.stringify(this.presets));
        } catch (error) {
            console.error('Failed to save presets:', error);
        }
    }

    /**
     * Load presets from localStorage
     */
    loadFromStorage() {
        try {
            const data = localStorage.getItem(CONFIG.PRESET.STORAGE_KEY);
            if (data) {
                this.presets = JSON.parse(data);
            }
        } catch (error) {
            console.error('Failed to load presets:', error);
            this.presets = [];
        }
    }

    /**
     * Render preset list
     */
    render() {
        if (!this.listElement) return;

        // Clear list
        this.listElement.innerHTML = '';

        // Render each preset
        this.presets.forEach(preset => {
            const card = document.createElement('div');
            card.className = 'preset-card';

            card.innerHTML = `
                <div class="preset-card-name">${preset.name}</div>
                <div class="preset-card-info">
                    ${preset.waveform} • ${preset.filterType}
                </div>
                <div class="preset-card-actions">
                    <button class="preset-card-btn load" data-id="${preset.id}">Load</button>
                    <button class="preset-card-btn delete" data-id="${preset.id}">Delete</button>
                </div>
            `;

            // Add event listeners
            const loadBtn = card.querySelector('.load');
            const deleteBtn = card.querySelector('.delete');

            loadBtn.addEventListener('click', () => this.load(preset.id));
            deleteBtn.addEventListener('click', () => {
                if (confirm(`Delete preset "${preset.name}"?`)) {
                    this.delete(preset.id);
                }
            });

            this.listElement.appendChild(card);
        });

        // Show message if no presets
        if (this.presets.length === 0) {
            this.listElement.innerHTML = '<p style="color: var(--color-text-muted); text-align: center; padding: var(--spacing-lg);">No presets saved</p>';
        }
    }

    /**
     * Export presets as JSON
     * @returns {string}
     */
    export() {
        return JSON.stringify(this.presets, null, 2);
    }

    /**
     * Import presets from JSON
     * @param {string} json - JSON string
     */
    import(json) {
        try {
            const imported = JSON.parse(json);
            if (Array.isArray(imported)) {
                this.presets = imported;
                this.saveToStorage();
                this.render();
                return true;
            }
        } catch (error) {
            console.error('Failed to import presets:', error);
        }
        return false;
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = PresetManager;
}
