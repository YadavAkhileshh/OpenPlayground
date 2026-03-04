/**
 * SingularityRay JS - Core - State Manager
 * Centralized store for physics parameters syncing between UI and Renderer.
 */

export class StateManager {
    /**
     * @param {import('./event_bus.js').CoreEventBus} coreBus 
     */
    constructor(coreBus) {
        this.coreBus = coreBus;

        // Internal state
        this.state = {
            blackHoleMass: 1.0,
            accretionDiskIntensity: 1.0,
            raySteps: 150,

            showDebugRays: false,
            showSdfBounds: false,
            progressiveRender: true,

            isPaused: false
        };

        this._bindEvents();
    }

    _bindEvents() {
        // Listen to events coming from the UI boundary
        this.coreBus.on('ui.massChanged', (val) => {
            this.state.blackHoleMass = val;
            this.coreBus.emit('state.physicsChanged', this.state);
        });

        this.coreBus.on('ui.diskIntensityChanged', (val) => {
            this.state.accretionDiskIntensity = val;
            this.coreBus.emit('state.physicsChanged', this.state);
        });

        this.coreBus.on('ui.rayStepsChanged', (val) => {
            this.state.raySteps = val;
            this.coreBus.emit('state.renderingChanged', this.state);
        });

        this.coreBus.on('ui.debugRaysChanged', (val) => {
            this.state.showDebugRays = val;
            this.coreBus.emit('state.renderingChanged', this.state);
        });

        this.coreBus.on('ui.sdfBoundsChanged', (val) => {
            this.state.showSdfBounds = val;
            this.coreBus.emit('state.renderingChanged', this.state);
        });

        this.coreBus.on('ui.progressiveChanged', (val) => {
            this.state.progressiveRender = val;
            this.coreBus.emit('state.renderingChanged', this.state);
        });

        this.coreBus.on('ui.pauseToggled', (isPaused) => {
            this.state.isPaused = isPaused;
            this.coreBus.emit('state.pauseChanged', this.state.isPaused);
        });
    }

    /**
     * Get a guaranteed snapshot of the current state
     */
    getSnapshot() {
        return Object.assign({}, this.state);
    }
}
