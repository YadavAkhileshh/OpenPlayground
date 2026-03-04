/**
 * UI Controller
 * Handles all user interface interactions and parameter updates
 */

export class UIController {
    constructor(callbacks = {}) {
        this.callbacks = callbacks;
        this.elements = {};
        this.isPaused = false;
        
        this.initializeElements();
        this.attachEventListeners();
    }

    // Get all UI elements
    initializeElements() {
        // Info displays
        this.elements.infoTime = document.getElementById('info-time');
        this.elements.infoSeason = document.getElementById('info-season');
        this.elements.infoDaytime = document.getElementById('info-daytime');
        this.elements.infoTectonic = document.getElementById('info-tectonic');
        this.elements.infoErosion = document.getElementById('info-erosion');
        this.elements.infoTemp = document.getElementById('info-temp');

        // Time controls
        this.elements.timeSpeed = document.getElementById('time-speed');
        this.elements.axialTilt = document.getElementById('axial-tilt');
        this.elements.dayLength = document.getElementById('day-length');

        // Terrain controls
        this.elements.terrainScale = document.getElementById('terrain-scale');
        this.elements.terrainOctaves = document.getElementById('terrain-octaves');
        this.elements.waterLevel = document.getElementById('water-level');
        this.elements.showWater = document.getElementById('show-water');

        // Tectonic controls
        this.elements.plateCount = document.getElementById('plate-count');
        this.elements.tectonicSpeed = document.getElementById('tectonic-speed');
        this.elements.showPlates = document.getElementById('show-plates');

        // Erosion controls
        this.elements.erosionRate = document.getElementById('erosion-rate');
        this.elements.rainfall = document.getElementById('rainfall');
        this.elements.enableErosion = document.getElementById('enable-erosion');

        // Climate controls
        this.elements.globalTemp = document.getElementById('global-temp');
        this.elements.tempVariance = document.getElementById('temp-variance');
        this.elements.showClimate = document.getElementById('show-climate');

        // Rendering controls
        this.elements.lodLevel = document.getElementById('lod-level');
        this.elements.showWireframe = document.getElementById('show-wireframe');
        this.elements.showAtmosphere = document.getElementById('show-atmosphere');

        // Action buttons
        this.elements.btnRegenerate = document.getElementById('btn-regenerate');
        this.elements.btnReset = document.getElementById('btn-reset');
        this.elements.btnPause = document.getElementById('btn-pause');

        // Control panel toggle
        this.elements.toggleControls = document.getElementById('toggle-controls');
        this.elements.controlsContent = document.getElementById('controls-content');
    }

    // Attach event listeners to all controls
    attachEventListeners() {
        // Time controls
        this.addRangeListener('timeSpeed', 'onTimeSpeedChange');
        this.addRangeListener('axialTilt', 'onAxialTiltChange');
        this.addRangeListener('dayLength', 'onDayLengthChange');

        // Terrain controls
        this.addRangeListener('terrainScale', 'onTerrainScaleChange');
        this.addRangeListener('terrainOctaves', 'onTerrainOctavesChange');
        this.addRangeListener('waterLevel', 'onWaterLevelChange');
        this.addCheckboxListener('showWater', 'onShowWaterChange');

        // Tectonic controls
        this.addRangeListener('plateCount', 'onPlateCountChange');
        this.addRangeListener('tectonicSpeed', 'onTectonicSpeedChange');
        this.addCheckboxListener('showPlates', 'onShowPlatesChange');

        // Erosion controls
        this.addRangeListener('erosionRate', 'onErosionRateChange');
        this.addRangeListener('rainfall', 'onRainfallChange');
        this.addCheckboxListener('enableErosion', 'onEnableErosionChange');

        // Climate controls
        this.addRangeListener('globalTemp', 'onGlobalTempChange');
        this.addRangeListener('tempVariance', 'onTempVarianceChange');
        this.addCheckboxListener('showClimate', 'onShowClimateChange');

        // Rendering controls
        this.addRangeListener('lodLevel', 'onLodLevelChange');
        this.addCheckboxListener('showWireframe', 'onShowWireframeChange');
        this.addCheckboxListener('showAtmosphere', 'onShowAtmosphereChange');

        // Action buttons
        this.elements.btnRegenerate?.addEventListener('click', () => {
            this.callbacks.onRegenerate?.();
        });

        this.elements.btnReset?.addEventListener('click', () => {
            this.callbacks.onReset?.();
        });

        this.elements.btnPause?.addEventListener('click', () => {
            this.isPaused = !this.isPaused;
            this.elements.btnPause.textContent = this.isPaused ? 'Resume' : 'Pause';
            this.callbacks.onPause?.(this.isPaused);
        });

        // Toggle controls panel
        this.elements.toggleControls?.addEventListener('click', () => {
            this.elements.controlsContent.classList.toggle('collapsed');
            this.elements.toggleControls.textContent = 
                this.elements.controlsContent.classList.contains('collapsed') ? '+' : '−';
        });
    }

    // Helper to add range input listener with value display
    addRangeListener(elementName, callbackName) {
        const element = this.elements[elementName];
        if (!element) return;

        const updateValue = () => {
            const value = parseFloat(element.value);
            const valueDisplay = element.nextElementSibling;
            
            if (valueDisplay && valueDisplay.classList.contains('value-display')) {
                // Format based on the control
                let displayValue = value;
                if (elementName.includes('temp')) {
                    displayValue = value + '°C';
                } else if (elementName === 'axialTilt') {
                    displayValue = value + '°';
                } else if (elementName === 'dayLength') {
                    displayValue = value + 'h';
                } else if (elementName === 'timeSpeed') {
                    displayValue = value.toFixed(1) + 'x';
                } else {
                    displayValue = value.toFixed(elementName.includes('Level') ? 2 : 1);
                }
                
                valueDisplay.textContent = displayValue;
            }

            this.callbacks[callbackName]?.(value);
        };

        element.addEventListener('input', updateValue);
        updateValue(); // Initialize display
    }

    // Helper to add checkbox listener
    addCheckboxListener(elementName, callbackName) {
        const element = this.elements[elementName];
        if (!element) return;

        element.addEventListener('change', () => {
            this.callbacks[callbackName]?.(element.checked);
        });
    }

    // Update info panel
    updateInfo(data) {
        if (data.time !== undefined && this.elements.infoTime) {
            this.elements.infoTime.textContent = data.time + ' years';
        }

        if (data.season !== undefined && this.elements.infoSeason) {
            this.elements.infoSeason.textContent = data.season;
        }

        if (data.daytime !== undefined && this.elements.infoDaytime) {
            this.elements.infoDaytime.textContent = data.daytime;
        }

        if (data.tectonicAge !== undefined && this.elements.infoTectonic) {
            this.elements.infoTectonic.textContent = data.tectonicAge + ' My';
        }

        if (data.erosionLevel !== undefined && this.elements.infoErosion) {
            this.elements.infoErosion.textContent = data.erosionLevel + '%';
        }

        if (data.avgTemp !== undefined && this.elements.infoTemp) {
            this.elements.infoTemp.textContent = data.avgTemp + '°C';
        }
    }

    // Get current parameter values
    getParameters() {
        return {
            // Time
            timeSpeed: parseFloat(this.elements.timeSpeed?.value || 1),
            axialTilt: parseFloat(this.elements.axialTilt?.value || 23.5),
            dayLength: parseFloat(this.elements.dayLength?.value || 24),

            // Terrain
            terrainScale: parseFloat(this.elements.terrainScale?.value || 2),
            terrainOctaves: parseInt(this.elements.terrainOctaves?.value || 5),
            waterLevel: parseFloat(this.elements.waterLevel?.value || 0),
            showWater: this.elements.showWater?.checked ?? true,

            // Tectonics
            plateCount: parseInt(this.elements.plateCount?.value || 8),
            tectonicSpeed: parseFloat(this.elements.tectonicSpeed?.value || 1),
            showPlates: this.elements.showPlates?.checked ?? true,

            // Erosion
            erosionRate: parseFloat(this.elements.erosionRate?.value || 0.5),
            rainfall: parseFloat(this.elements.rainfall?.value || 1),
            enableErosion: this.elements.enableErosion?.checked ?? true,

            // Climate
            globalTemp: parseFloat(this.elements.globalTemp?.value || 15),
            tempVariance: parseFloat(this.elements.tempVariance?.value || 1),
            showClimate: this.elements.showClimate?.checked ?? true,

            // Rendering
            lodLevel: parseInt(this.elements.lodLevel?.value || 3),
            showWireframe: this.elements.showWireframe?.checked ?? false,
            showAtmosphere: this.elements.showAtmosphere?.checked ?? true
        };
    }

    // Set parameter values programmatically
    setParameters(params) {
        Object.keys(params).forEach(key => {
            const element = this.elements[key];
            if (element) {
                if (element.type === 'checkbox') {
                    element.checked = params[key];
                } else {
                    element.value = params[key];
                }
                // Trigger input event to update displays
                element.dispatchEvent(new Event('input'));
            }
        });
    }

    // Show loading state
    showLoading(message = 'Processing...') {
        // Could add a loading overlay here
        console.log(message);
    }

    // Hide loading state
    hideLoading() {
        // Hide loading overlay
    }

    // Show notification
    showNotification(message, type = 'info') {
        // Could implement toast notifications
        console.log(`[${type}] ${message}`);
    }

    // Dispose
    dispose() {
        // Remove event listeners if needed
    }
}

export default UIController;
