/**
 * Game Settings
 * Allows runtime configuration of physics parameters.
 */
class Settings {
    constructor() {
        this.physics = {
            gravity: 500,
            drag: 0.99,
            stiffness: 800,
            damping: 15,
            shearStiffness: 500,
            pressure: 5000,
            substeps: 8
        };

        this.game = {
            spawnX: 160,
            spawnY: -80,
            cellSize: 40,
            lockDelay: 0.5,
            lockThreshold: 0.2
        };

        this.visuals = {
            particlesEnabled: true,
            shakeEnabled: true,
            glow: true
        };
    }

    // Singleton instance
    static get instance() {
        if (!this._instance) {
            this._instance = new Settings();
        }
        return this._instance;
    }
}
