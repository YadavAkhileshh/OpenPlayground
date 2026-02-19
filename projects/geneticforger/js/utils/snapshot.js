import { Genome } from '../engine/genome.js';

/**
 * Manages snapshots of the evolution process.
 * Allows saving the state at specific generations to review progress or restore previous states.
 * This is useful for creating time-lapse data or backtracking.
 */
export class SnapshotManager {
    /**
     * Creates a new SnapshotManager.
     * @property {Array} snapshots - The history of saved states.
     * @property {number} maxSnapshots - Maximum number of snapshots to keep to manage memory.
     */
    constructor() {
        /**
         * @type {Array<{generation: number, genome: Genome, fitness: number}>}
         */
        this.snapshots = [];
        this.maxSnapshots = 10;
    }

    /**
     * Captures a snapshot of the current state.
     * Clones the genome to ensure the snapshot remains immutable as evolution continues.
     * 
     * @param {number} generation - Current generation number.
     * @param {Genome} genome - Current genome (will be cloned).
     * @param {number} fitness - Current fitness score.
     */
    capture(generation, genome, fitness) {
        // Clone the genome to avoid reference issues
        // If we didn't clone, the snapshot would evolve along with the main loop!
        const storedGenome = genome.clone();

        this.snapshots.push({
            generation,
            genome: storedGenome,
            fitness
        });

        // Keep only the best/last N snapshots?
        // simple strategy: keep last N to avoid memory leaks
        if (this.snapshots.length > this.maxSnapshots) {
            this.snapshots.shift();
        }

        console.log(`Snapshot taken at Gen ${generation}`);
    }

    /**
     * Returns the list of all stored snapshots.
     * @returns {Array} List of snapshot objects.
     */
    getAll() {
        return this.snapshots;
    }

    /**
     * Clears all stored snapshots.
     * Should be called when resetting the application.
     */
    clear() {
        this.snapshots = [];
    }
}
