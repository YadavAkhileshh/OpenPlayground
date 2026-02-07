/**
 * state-controller.js
 * Manages the high-level application states for DecayDiary.
 * 
 * Possible states:
 * - INITIALIZING: App is loading assets and setting up engines.
 * - WRITING: User is actively inputting text.
 * - IDLE: User has stopped writing but text is still visible.
 * - DECAYING: Text is actively fading.
 * - VOID: All text has expired and the editor is empty.
 */

class StateController {
    constructor() {
        /** @type {string} */
        this.currentState = 'INITIALIZING';

        /** @type {Object} */
        this.stateHistory = [];

        /** @type {number} */
        this.lastActivityTime = Date.now();
    }

    /**
     * Transitions the application to a new state.
     * @param {string} newState 
     */
    transitionTo(newState) {
        if (this.currentState === newState) return;

        console.log(`[StateController] Transition: ${this.currentState} -> ${newState}`);

        this.stateHistory.push({
            from: this.currentState,
            to: newState,
            timestamp: Date.now()
        });

        this.currentState = newState;

        if (typeof eventBus !== 'undefined') {
            eventBus.emit('state:change', { state: newState });
        }
    }

    /**
     * Determines the next state based on current activity and timer data.
     */
    evaluate() {
        const timeSinceActivity = Date.now() - this.lastActivityTime;
        const charCount = typeof timerSystem !== 'undefined' ? timerSystem.count : 0;

        if (charCount === 0) {
            this.transitionTo('VOID');
            return;
        }

        if (timeSinceActivity < 1000) {
            this.transitionTo('WRITING');
        } else if (timeSinceActivity < CONFIG.DECAY.START_DELAY) {
            this.transitionTo('IDLE');
        } else {
            this.transitionTo('DECAYING');
        }
    }

    /**
     * Updates the last activity timestamp.
     */
    recordActivity() {
        this.lastActivityTime = Date.now();
        this.evaluate();
    }
}

// Global instance
const stateController = new StateController();
