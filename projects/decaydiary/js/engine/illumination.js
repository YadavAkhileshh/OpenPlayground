/**
 * illumination.js
 * Provides the "Glimpse" mechanic for DecayDiary.
 * 
 * Holding the 'Shift' key illuminates decaying text, slowing 
 * the decay process and enhancing visibility temporarily.
 */

class IlluminationSystem {
    constructor() {
        this.isIlluminated = false;
        this.slowdownFactor = 0.1; // 10% decay speed when illuminated
    }

    /**
     * Initializes the system and binds keyboard listeners.
     */
    init() {
        console.log("IlluminationSystem: Initializing Glimpse mechanic.");
        this.setupListeners();
    }

    /**
     * Listen for Shift key state changes.
     */
    setupListeners() {
        window.addEventListener('keydown', (e) => {
            if (e.key === 'Shift' && !this.isIlluminated) {
                this.activate();
            }
        });

        window.addEventListener('keyup', (e) => {
            if (e.key === 'Shift' && this.isIlluminated) {
                this.deactivate();
            }
        });
    }

    /**
     * Activates the illumination state.
     */
    activate() {
        this.isIlluminated = true;
        document.documentElement.classList.add('illuminated');

        if (typeof eventBus !== 'undefined') {
            eventBus.emit('illumination:start');
        }

        console.log("IlluminationSystem: Glimpse active.");
    }

    /**
     * Deactivates the illumination state.
     */
    deactivate() {
        this.isIlluminated = false;
        document.documentElement.classList.remove('illuminated');

        if (typeof eventBus !== 'undefined') {
            eventBus.emit('illumination:stop');
        }

        console.log("IlluminationSystem: Glimpse ended.");
    }

    /**
     * Returns the current time multiplier for the decay engine.
     */
    getTimeMultiplier() {
        return this.isIlluminated ? this.slowdownFactor : 1.0;
    }
}

// Global instance
const illuminationSystem = new IlluminationSystem();
