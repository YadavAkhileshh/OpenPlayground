/**
 * entropy.js
 * Calculates the level of chaos (0.0 - 1.0) and determines the current Phase.
 */

export const PHASES = {
    PRISTINE: 0,
    WEATHERED: 1,
    AGED: 2,
    DECAYING: 3,
    BREAKDOWN: 4,
    COLLAPSE: 5
};

// Thresholds in Milliseconds (Default scale)
// In debug mode, these will be crossed quickly.
const PHASE_THRESHOLDS = {
    [PHASES.WEATHERED]: 60 * 1000,         // 1 minute
    [PHASES.AGED]: 5 * 60 * 1000,          // 5 minutes
    [PHASES.DECAYING]: 15 * 60 * 1000,     // 15 minutes
    [PHASES.BREAKDOWN]: 30 * 60 * 1000,    // 30 minutes
    [PHASES.COLLAPSE]: 60 * 60 * 1000      // 1 hour
};

export class EntropySystem {
    constructor() {
        this.currentPhase = PHASES.PRISTINE;
        this.chaosLevel = 0.0;
    }

    update(elapsedMs) {
        // Determine phase
        this.currentPhase = PHASES.PRISTINE;

        if (elapsedMs > PHASE_THRESHOLDS[PHASES.COLLAPSE]) {
            this.currentPhase = PHASES.COLLAPSE;
        } else if (elapsedMs > PHASE_THRESHOLDS[PHASES.BREAKDOWN]) {
            this.currentPhase = PHASES.BREAKDOWN;
        } else if (elapsedMs > PHASE_THRESHOLDS[PHASES.DECAYING]) {
            this.currentPhase = PHASES.DECAYING;
        } else if (elapsedMs > PHASE_THRESHOLDS[PHASES.AGED]) {
            this.currentPhase = PHASES.AGED;
        } else if (elapsedMs > PHASE_THRESHOLDS[PHASES.WEATHERED]) {
            this.currentPhase = PHASES.WEATHERED;
        }

        // Calculate continuous chaos level (0.0 to 1.0)
        // We map the elapsed time to a sigmoid-like or linear curve up to the max time
        const maxTime = PHASE_THRESHOLDS[PHASES.COLLAPSE] * 1.5; // Cap at 1.5 hours for max chaos
        this.chaosLevel = Math.min(elapsedMs / maxTime, 1.0);
    }

    getPhaseName() {
        return Object.keys(PHASES).find(key => PHASES[key] === this.currentPhase);
    }
}
