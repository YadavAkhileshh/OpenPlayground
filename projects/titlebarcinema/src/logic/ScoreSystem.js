/**
 * TitleBarCinema - ScoreSystem.js
 * 
 * ============================================================================
 * ARCHITECTURAL OVERVIEW
 * ============================================================================
 * The ScoreSystem module is responsible for quantifying the player's performance 
 * and persistent progress. It calculates score based on distance traveled 
 * (cumulative scroll velocity over time) and monitors for performance milestones.
 * 
 * It coordinates closely with the LevelManager to signal difficulty spikes 
 * when the player reaches specific point thresholds.
 * 
 * ============================================================================
 * MODULE METADATA
 * ============================================================================
 * @project TitleBarCinema
 * @module Logic.ScoreSystem
 * @version 1.0.0
 * @author Antigravity
 */

/**
 * @class ScoreSystem
 * @description Tracks distance, current score, and high scores.
 */
export class ScoreSystem {
    /**
     * @constructor
     * Initializes score and distance metrics.
     */
    constructor() {
        /** @public @type {number} Current running total score */
        this.score = 0;

        /** @public @type {number} Total distance traveled in engine units */
        this.distance = 0;

        /** @public @type {number} Record score across sessions (currently volatile) */
        this.highScore = 0;

        /** @private @type {number} Track the most recently hit point milestone */
        this.lastMilestone = 0;
    }

    /**
     * Increments distance and recalculates score every game tick.
     * @param {number} delta - The movement increment (usually CONFIG.SCROLL_SPEED).
     * @returns {void}
     */
    update(delta) {
        // Distance is a direct sum of delta movement
        this.distance += delta;

        // Score is derived from distance (10 points per unit)
        // We floor the value for display purposes
        this.score = Math.floor(this.distance * 10);

        // Check for major point milestones (every 1000 points)
        // This is used to signal LevelManager for difficulty increases
        if (Math.floor(this.score / 1000) > this.lastMilestone) {
            this.handleMilestone();
        }
    }

    /**
     * Compares the current score with the high score.
     * Should be called during the Game Over sequence.
     * @returns {void}
     */
    checkHighScore() {
        if (this.score > this.highScore) {
            this.highScore = this.score;
            // Persistent storage (localStorage) could be added here
        }
    }

    /**
     * Internal logic for handling a state-change milestone.
     * Primarily used for debug logging and state signaling.
     * @private
     */
    handleMilestone() {
        this.lastMilestone = Math.floor(this.score / 1000);
        // Note: The actual parameter handling is managed by LevelManager
    }

    /**
     * Resets all current session metrics to zero.
     * Does not reset the High Score.
     * @returns {void}
     */
    reset() {
        this.score = 0;
        this.distance = 0;
        this.lastMilestone = 0;
    }

    /**
     * Formats the numeric score into a zero-padded string for the UI.
     * Example: 450 -> "000450"
     * @returns {string}
     */
    getFormattedScore() {
        return this.score.toString().padStart(6, '0');
    }

    /**
     * Calculate the current rank based on score.
     * @returns {string} Rank label (Novice, Expert, etc.)
     */
    getRank() {
        if (this.score < 1000) return "Novice";
        if (this.score < 5000) return "Experienced";
        if (this.score < 10000) return "Expert";
        return "Cinema Legend";
    }
}
