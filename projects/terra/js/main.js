/**
 * Terra - 3D Procedural Planet Sandbox
 * Main application entry point
 */

import * as THREE from 'three';
import TerrainGenerator from './terrain.js';
import TectonicSystem from './tectonics.js';
import ErosionSystem from './erosion.js';
import ClimateSystem from './climate.js';
import TimeSystem from './time.js';
import Renderer from './renderer.js';
import UIController from './ui.js';

class TerraSimulation {
    constructor() {
        try {
            console.log('🌍 Initializing Terra Simulation...');
            this.container = document.getElementById('canvas-container');
            
            if (!this.container) {
                throw new Error('Canvas container not found');
            }
            
            // Initialize systems
            console.log('📦 Creating renderer...');
            this.renderer = new Renderer(this.container);
        this.terrainGenerator = null;
        this.tectonicSystem = null;
        this.erosionSystem = null;
        this.climateSystem = null;
        this.timeSystem = null;
        this.ui = null;

        // Simulation state
        this.isPaused = false;
        this.lastTime = performance.now();
        this.vertexData = [];
        this.updateThrottle = 0;
        this.colorUpdateThrottle = 0;

        // Initialize UI and systems
        console.log('⚙️ Initializing systems...');
        this.initializeSystems();
        console.log('🎮 Initializing UI...');
        this.initializeUI();
        console.log('🌍 Generating planet...');
        this.regeneratePlanet();
        
        console.log('✅ Terra Simulation ready!');
        
        // Start animation loop
        this.animate();
        } catch (error) {
            console.error('❌ Failed to initialize Terra:', error);
            this.showError(error);
        }
    }

    // Initialize UI controller with callbacks
    initializeUI() {
        this.ui = new UIController({
            // Time callbacks
            onTimeSpeedChange: (value) => {
                if (this.timeSystem) this.timeSystem.updateParams({ timeSpeed: value });
            },
            onAxialTiltChange: (value) => {
                if (this.timeSystem) this.timeSystem.updateParams({ axialTilt: value });
            },
            onDayLengthChange: (value) => {
                if (this.timeSystem) this.timeSystem.updateParams({ dayLength: value });
            },

            // Terrain callbacks
            onTerrainScaleChange: (value) => {
                if (this.terrainGenerator) {
                    this.terrainGenerator.updateParams({ scale: value });
                    this.throttledRegenerateTerrain();
                }
            },
            onTerrainOctavesChange: (value) => {
                if (this.terrainGenerator) {
                    this.terrainGenerator.updateParams({ octaves: value });
                    this.throttledRegenerateTerrain();
                }
            },
            onWaterLevelChange: (value) => {
                if (this.terrainGenerator) {
                    this.terrainGenerator.updateParams({ waterLevel: value });
                    this.updateColors();
                }
            },
            onShowWaterChange: (value) => {
                this.renderer.setWaterVisible(value);
            },

            // Tectonic callbacks
            onPlateCountChange: (value) => {
                if (this.tectonicSystem) {
                    const needsReinit = this.tectonicSystem.updateParams({ plateCount: value });
                    if (needsReinit) {
                        this.tectonicSystem.initialize(this.vertexData);
                    }
                }
            },
            onTectonicSpeedChange: (value) => {
                if (this.tectonicSystem) this.tectonicSystem.updateParams({ plateSpeed: value });
            },
            onShowPlatesChange: (value) => {
                this.updateColors();
            },

            // Erosion callbacks
            onErosionRateChange: (value) => {
                if (this.erosionSystem) this.erosionSystem.updateParams({ erosionRate: value });
            },
            onRainfallChange: (value) => {
                if (this.erosionSystem) this.erosionSystem.updateParams({ rainfallLevel: value });
            },
            onEnableErosionChange: (value) => {
                if (this.erosionSystem) this.erosionSystem.updateParams({ enabled: value });
            },

            // Climate callbacks
            onGlobalTempChange: (value) => {
                if (this.climateSystem) {
                    this.climateSystem.updateParams({ globalTemp: value });
                    this.updateColors();
                }
            },
            onTempVarianceChange: (value) => {
                if (this.climateSystem) {
                    this.climateSystem.updateParams({ tempVariance: value });
                    this.updateColors();
                }
            },
            onShowClimateChange: (value) => {
                this.updateColors();
            },

            // Rendering callbacks
            onLodLevelChange: (value) => {
                if (this.terrainGenerator) {
                    const segments = [16, 24, 32, 48, 64][value - 1] || 32;
                    this.terrainGenerator.updateParams({ segments });
                    this.regeneratePlanet();
                }
            },
            onShowWireframeChange: (value) => {
                this.renderer.setWireframe(value);
            },
            onShowAtmosphereChange: (value) => {
                this.renderer.setAtmosphereVisible(value);
            },

            // Action callbacks
            onRegenerate: () => {
                this.regeneratePlanet();
            },
            onReset: () => {
                this.resetSimulation();
            },
            onPause: (paused) => {
                this.isPaused = paused;
            }
        });
    }

    // Initialize all simulation systems
    initializeSystems() {
        // Use default parameters - UI will update them later
        const defaultParams = {
            terrainScale: 2.0,
            terrainOctaves: 4,
            waterLevel: 0.0,
            plateCount: 6,
            tectonicSpeed: 1.0,
            erosionRate: 0.3,
            rainfall: 1.0,
            enableErosion: true,
            globalTemp: 15,
            tempVariance: 1.0,
            timeSpeed: 1.0,
            axialTilt: 23.5,
            dayLength: 24
        };

        this.terrainGenerator = new TerrainGenerator({
            radius: 10,
            segments: 48,
            scale: defaultParams.terrainScale,
            octaves: defaultParams.terrainOctaves,
            waterLevel: defaultParams.waterLevel
        });

        this.tectonicSystem = new TectonicSystem({
            plateCount: defaultParams.plateCount,
            plateSpeed: defaultParams.tectonicSpeed
        });

        this.erosionSystem = new ErosionSystem({
            erosionRate: defaultParams.erosionRate,
            rainfallLevel: defaultParams.rainfall,
            enabled: defaultParams.enableErosion
        });

        this.climateSystem = new ClimateSystem({
            globalTemp: defaultParams.globalTemp,
            tempVariance: defaultParams.tempVariance
        });

        this.timeSystem = new TimeSystem({
            timeSpeed: defaultParams.timeSpeed,
            axialTilt: defaultParams.axialTilt,
            dayLength: defaultParams.dayLength
        });
    }

    // Generate or regenerate the planet
    regeneratePlanet() {
        if (this.ui) this.ui.showLoading('Generating planet...');

        // Generate new terrain
        const geometry = this.terrainGenerator.generateGeometry();
        
        // Get vertex data for all systems
        this.vertexData = this.terrainGenerator.getVertexData(geometry);

        // Initialize systems with vertex data
        this.tectonicSystem.initialize(this.vertexData);
        this.erosionSystem.initialize(this.vertexData);
        this.climateSystem.classifyClimates(this.vertexData, this.terrainGenerator);

        // Apply colors
        this.terrainGenerator.applyColors(geometry, this.climateSystem);

        // Create/update planet mesh
        const params = this.ui ? this.ui.getParameters() : { showWater: true, showAtmosphere: true };
        this.renderer.createPlanet(geometry, params.showWater, params.showAtmosphere);

        if (this.ui) this.ui.hideLoading();
        if (this.ui) this.ui.showNotification('Planet generated successfully', 'success');
    }

    // Throttled terrain regeneration
    throttledRegenerateTerrain() {
        clearTimeout(this._regenerateTimeout);
        this._regenerateTimeout = setTimeout(() => {
            const geometry = this.terrainGenerator.generateGeometry();
            this.vertexData = this.terrainGenerator.getVertexData(geometry);
            this.climateSystem.classifyClimates(this.vertexData, this.terrainGenerator);
            this.terrainGenerator.applyColors(geometry, this.climateSystem);
            this.renderer.updatePlanetGeometry(geometry);
        }, 300);
    }

    // Update terrain colors
    updateColors() {
        if (!this.renderer.planet) return;

        const geometry = this.renderer.planet.geometry;
        const params = this.ui.getParameters();

        if (params.showPlates) {
            // Show plate boundaries
            this.applyPlateColors(geometry);
        } else if (params.showClimate) {
            // Show climate-based colors
            this.terrainGenerator.applyColors(geometry, this.climateSystem);
        }

        geometry.attributes.color.needsUpdate = true;
    }

    // Apply plate visualization colors
    applyPlateColors(geometry) {
        const positions = geometry.attributes.position;
        const colors = geometry.attributes.color;

        for (let i = 0; i < positions.count; i++) {
            const plateColor = this.tectonicSystem.getPlateColor(i);
            
            // Highlight boundaries
            if (this.tectonicSystem.isNearBoundary(i, this.vertexData)) {
                colors.setXYZ(i, 1, 0.2, 0.2); // Red for boundaries
            } else {
                colors.setXYZ(i, plateColor.r, plateColor.g, plateColor.b);
            }
        }
    }

    // Reset entire simulation
    resetSimulation() {
        this.timeSystem.reset();
        this.erosionSystem.reset();
        this.terrainGenerator.regenerate();
        this.regeneratePlanet();
        if (this.ui) this.ui.showNotification('Simulation reset', 'info');
    }

    // Main update loop
    update(deltaTime) {
        if (this.isPaused) return;
        if (!this.timeSystem || !this.renderer) return;

        // Update time system
        this.timeSystem.update(deltaTime);

        // Update climate based on season
        if (this.climateSystem) {
            this.climateSystem.updateSeason(this.timeSystem.seasonProgress);
        }

        // Update lighting
        const lights = this.renderer.getLights();
        if (lights) {
            this.timeSystem.updateLighting(
                this.renderer.getScene(),
                lights.directional,
                lights.ambient,
                this.renderer.getAtmosphere()
            );
        }

        // Throttle expensive updates
        this.updateThrottle += deltaTime;
        if (this.updateThrottle > 200) { // Update every 200ms for smoother performance
            this.updateThrottle = 0;

            // Update tectonic plates
            if (this.tectonicSystem) {
                this.tectonicSystem.update(deltaTime);
            }

            // Apply tectonic effects occasionally
            if (Math.random() < 0.05 && this.renderer.planet) {
                this.tectonicSystem.applyToTerrain(
                    this.renderer.planet.geometry,
                    this.terrainGenerator,
                    this.vertexData
                );
            }

            // Simulate erosion less frequently
            if (Math.random() < 0.3 && this.renderer.planet) {
                this.erosionSystem.simulate(
                    this.renderer.planet.geometry,
                    this.terrainGenerator,
                    this.climateSystem,
                    this.vertexData,
                    deltaTime
                );
            }
        }

        // Update colors less frequently
        this.colorUpdateThrottle += deltaTime;
        if (this.colorUpdateThrottle > 1000) { // Update every 1000ms
            this.colorUpdateThrottle = 0;
            
            // Reclassify climates
            this.climateSystem.classifyClimates(this.vertexData, this.terrainGenerator);
            
            // Update colors
            const params = this.ui.getParameters();
            if (!params.showPlates && params.showClimate) {
                this.terrainGenerator.applyColors(
                    this.renderer.planet.geometry,
                    this.climateSystem
                );
                this.renderer.planet.geometry.attributes.color.needsUpdate = true;
            }
        }

        // Update UI info panel
        this.updateInfoPanel();
    }

    // Update information panel
    updateInfoPanel() {
        this.ui.updateInfo({
            time: this.timeSystem.getTimeInYears(),
            season: this.timeSystem.getSeasonName(),
            daytime: this.timeSystem.getTimeOfDayString(),
            tectonicAge: this.tectonicSystem.getAge(),
            erosionLevel: this.erosionSystem.getErosionLevel(),
            avgTemp: this.climateSystem.getAverageTemperature()
        });
    }

    // Animation loop
    animate() {
        requestAnimationFrame(() => this.animate());

        const currentTime = performance.now();
        const deltaTime = currentTime - this.lastTime;
        this.lastTime = currentTime;

        // Update simulation
        this.update(deltaTime);

        // Render scene
        this.renderer.render();
    }

    // Cleanup
    dispose() {
        this.renderer.dispose();
        this.ui.dispose();
    }

    // Show error message
    showError(error) {
        const errorDiv = document.createElement('div');
        errorDiv.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: rgba(255, 0, 0, 0.9);
            color: white;
            padding: 30px;
            border-radius: 10px;
            z-index: 10000;
            max-width: 500px;
            font-family: monospace;
        `;
        errorDiv.innerHTML = `
            <h2>❌ Error Initializing Terra</h2>
            <p>${error.message}</p>
            <p style="font-size: 12px; margin-top: 10px;">Check the browser console for details.</p>
        `;
        document.body.appendChild(errorDiv);
    }
}

// Initialize application when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        window.terraSimulation = new TerraSimulation();
    });
} else {
    window.terraSimulation = new TerraSimulation();
}

export default TerraSimulation;
