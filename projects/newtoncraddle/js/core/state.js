import { logger } from '../utils/logger.js';
import { CONFIG } from '../utils/constants.js';

/**
 * @fileoverview State Manager for the simulation.
 * Tracks energy, collision counts, and keeps the UI stats updated.
 */
export class StateManager {
    constructor() {
        this.totalCollisions = 0;
        this.peakVelocity = 0;
        this.startTime = Date.now();
        this.isStable = true;

        this.history = {
            energy: [],
            collisionsPerSec: []
        };

        this.uiElements = {
            status: document.getElementById('status-val'),
        };
    }

    /**
     * Update the global simulation state metrics.
     */
    update(balls) {
        let totalKineticEnergy = 0;
        let totalPotentialEnergy = 0;
        let maxV = 0;

        balls.forEach(ball => {
            const linearV = Math.abs(ball.angularVelocity * ball.length / CONFIG.PIXELS_PER_METER);
            totalKineticEnergy += 0.5 * ball.mass * linearV * linearV;

            const h = (ball.length / CONFIG.PIXELS_PER_METER) * (1 - Math.cos(ball.angle));
            totalPotentialEnergy += ball.mass * CONFIG.GRAVITY * h;

            if (linearV > maxV) maxV = linearV;
        });

        const totalEnergy = totalKineticEnergy + totalPotentialEnergy;

        // Update peak tracking
        if (maxV > this.peakVelocity) {
            this.peakVelocity = maxV;
        }

        // Check for stability (energy should decrease or stay constant)
        // If energy grows suddenly, something went wrong in collision resolution.
        this.checkStability(totalEnergy);
    }

    /**
     * Monitor for numerical drift or "explosions".
     * 
     * @param {number} currentEnergy - Total calculated system energy.
     */
    checkStability(currentEnergy) {
        this.history.energy.push(currentEnergy);
        if (this.history.energy.length > 100) this.history.energy.shift();

        if (this.history.energy.length > 2) {
            const prev = this.history.energy[this.history.energy.length - 2];
            // If energy increased by more than 10% in one frame (without user input)
            // we have an instability.
            if (currentEnergy > prev * 1.1 && currentEnergy > 0.1) {
                this.isStable = false;
                this.updateUIStatus('UNSTABLE');
                logger.warn("Stability warning: Energy gain detected.");
            } else if (!this.isStable && currentEnergy <= prev) {
                this.isStable = true;
                this.updateUIStatus('STABLE');
            }
        }
    }

    /**
     * Record a collision event.
     */
    recordCollision() {
        this.totalCollisions++;
    }

    /**
     * Update the UI to reflect simulation status.
     * @param {string} text 
     */
    updateUIStatus(text) {
        if (this.uiElements.status) {
            this.uiElements.status.textContent = text;
            this.uiElements.status.style.color = text === 'STABLE' ? '#38bdf8' : '#ef4444';
        }
    }

    /**
     * Get a summary of the session.
     */
    getSessionSummary() {
        const duration = (Date.now() - this.startTime) / 1000;
        return {
            durationSeconds: duration.toFixed(2),
            totalCollisions: this.totalCollisions,
            peakVelocity: this.peakVelocity.toFixed(2),
            stabilityIndex: this.isStable ? 'High' : 'Low'
        };
    }
}

export const stateManager = new StateManager();
