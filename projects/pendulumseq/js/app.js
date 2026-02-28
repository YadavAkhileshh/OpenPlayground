/**
 * app.js - Main Application Controller
 * Orchestrates all components and manages application state
 */

class PendulumSequencer {
    /**
     * Create the main application
     */
    constructor() {
        // Core components
        this.audioEngine = new AudioEngine();
        this.renderer = null;
        this.controlPanel = null;

        // Application state
        this.pendulums = [];
        this.nextPendulumId = 1;
        this.isRunning = false;
        this.animationFrameId = null;

        // Global physics parameters
        this.globalGravity = 9.8;
        this.globalDamping = 0.995;

        // Initialize the application
        this.initialize();
    }

    /**
     * Initialize the application
     */
    async initialize() {
        console.log('Initializing PendulumSeq...');

        // Get canvas element
        const canvas = document.getElementById('pendulum-canvas');
        if (!canvas) {
            console.error('Canvas element not found');
            return;
        }

        // Initialize renderer
        this.renderer = new Renderer(canvas);

        // Initialize control panel
        this.controlPanel = new ControlPanel(this);

        // Initialize audio engine on user interaction
        document.addEventListener('click', async () => {
            if (!this.audioEngine.initialized) {
                await this.audioEngine.initialize();
                await this.audioEngine.resume();
            }
        }, { once: true });

        // Start the animation loop
        this.start();

        // Add initial pendulums
        this.addPendulum({ length: 1.5, initialAngle: Math.PI / 4 });
        this.addPendulum({ length: 2.0, initialAngle: Math.PI / 3 });

        console.log('PendulumSeq initialized');
    }

    /**
     * Add a new pendulum
     * @param {Object} options - Pendulum options
     * @returns {Pendulum} - Created pendulum
     */
    addPendulum(options = {}) {
        // Limit number of pendulums
        if (this.pendulums.length >= 8) {
            console.warn('Maximum number of pendulums reached');
            return null;
        }

        // Create pendulum with global physics parameters
        const pendulum = new Pendulum(
            this.nextPendulumId.toString(),
            this.audioEngine,
            {
                ...options,
                gravity: this.globalGravity,
                damping: this.globalDamping
            }
        );

        this.pendulums.push(pendulum);
        this.nextPendulumId++;

        // Add control UI
        this.controlPanel.addPendulumControl(pendulum);

        console.log(`Added pendulum ${pendulum.id}`);
        return pendulum;
    }

    /**
     * Remove a pendulum
     * @param {string} id - Pendulum ID
     */
    removePendulum(id) {
        const index = this.pendulums.findIndex(p => p.id === id);
        if (index !== -1) {
            this.pendulums.splice(index, 1);
            this.controlPanel.removePendulumControl(id);
            this.renderer.clearTrail(id);
            console.log(`Removed pendulum ${id}`);
        }
    }

    /**
     * Reset all pendulums to initial state
     */
    resetAllPendulums() {
        this.pendulums.forEach(pendulum => {
            pendulum.reset();
        });
        this.renderer.clearAllTrails();
        console.log('Reset all pendulums');
    }

    /**
     * Clear all pendulums
     */
    clearAllPendulums() {
        this.pendulums = [];
        this.nextPendulumId = 1;
        this.controlPanel.clearAllControls();
        this.renderer.clearAllTrails();
        console.log('Cleared all pendulums');
    }

    /**
     * Set master volume
     * @param {number} volume - Volume level 0-1
     */
    setMasterVolume(volume) {
        this.audioEngine.setMasterVolume(volume);
    }

    /**
     * Set global gravity
     * @param {number} gravity - Gravity value
     */
    setGravity(gravity) {
        this.globalGravity = gravity;
        this.pendulums.forEach(pendulum => {
            pendulum.physics.setGravity(gravity);
        });
    }

    /**
     * Set global damping
     * @param {number} damping - Damping coefficient
     */
    setDamping(damping) {
        this.globalDamping = damping;
        this.pendulums.forEach(pendulum => {
            pendulum.physics.setDamping(damping);
        });
    }

    /**
     * Set waveform type
     * @param {string} waveform - Waveform type
     */
    setWaveform(waveform) {
        this.audioEngine.setWaveform(waveform);
    }

    /**
     * Set note duration
     * @param {number} duration - Duration in seconds
     */
    setNoteDuration(duration) {
        this.audioEngine.setNoteDuration(duration);
    }

    /**
     * Start the animation loop
     */
    start() {
        if (this.isRunning) return;

        this.isRunning = true;
        this.animate();
        console.log('Animation started');
    }

    /**
     * Stop the animation loop
     */
    stop() {
        if (!this.isRunning) return;

        this.isRunning = false;
        if (this.animationFrameId) {
            cancelAnimationFrame(this.animationFrameId);
            this.animationFrameId = null;
        }
        console.log('Animation stopped');
    }

    /**
     * Main animation loop
     */
    animate() {
        if (!this.isRunning) return;

        const currentTime = performance.now();

        // Clear canvas with trail effect
        this.renderer.clear(0.15);

        // Update and render pendulums
        if (this.pendulums.length === 0) {
            this.renderer.drawEmptyState();
        } else {
            this.pendulums.forEach(pendulum => {
                // Update physics and check for peaks
                const oldPeakCount = pendulum.peakCount;
                pendulum.update(currentTime);

                // Pulse rhythm indicator if peak detected
                if (pendulum.peakCount > oldPeakCount) {
                    this.controlPanel.pulseRhythmIndicator(pendulum.id);
                }

                // Render pendulum
                this.renderer.drawPendulum(pendulum);
            });
        }

        // Request next frame
        this.animationFrameId = requestAnimationFrame(() => this.animate());
    }

    /**
     * Get application state
     * @returns {Object} - State object
     */
    getState() {
        return {
            pendulumCount: this.pendulums.length,
            isRunning: this.isRunning,
            audioState: this.audioEngine.getState(),
            gravity: this.globalGravity,
            damping: this.globalDamping
        };
    }
}

// Initialize application when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    window.app = new PendulumSequencer();
});

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = PendulumSequencer;
}
