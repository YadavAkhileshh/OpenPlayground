/**
 * LindenArboretum - Main L-System Engine
 * Ties together the parser, generator, and cache.
 * Exposes a clean API for the rest of the application to request plants.
 * 
 * =========================================================================
 * ENGINE ARCHITECTURE:
 * 
 * The LSystemEngine serves as a protective Facade over the complex and 
 * potentially dangerous text-parsing and generation operations.
 * 
 * Because L-Systems scale exponentially O(k^n), a user requesting a depth 
 * of 15 on a rule like `X -> F[+X][-X]FX` will crash the browser tab, running out of heap memory.
 * 
 * This class mitigates disaster by:
 * 1. Sanitizing inputs via the Parser.
 * 2. Caching expensive fractal strings via the Cache.
 * 3. Enforcing hard limits on depth variables.
 * 4. Capturing diagnostic metrics (generationTime, string length) 
 *    so the UI can warn the user if performance is tanking.
 * 
 * =========================================================================
 */

import { lsystemParser } from './parser.js';
import { lsystemGenerator } from './generator.js';
import { systemCache } from './cache.js';

export class LSystemEngine {
    constructor() {
        // Internal configuration state
        this.axiom = '';
        this.rules = [];

        // Constrained iterations variable. Defaults safely to 1.
        this.depth = 1;

        // Performance metrics used by the perfMonitor module
        this.lastGenerationTime = 0;
        this.lastCommandCount = 0;
    }

    /**
     * Loads rules and axiom from raw text strings (e.g., from UI).
     * Defers to the Parser to instantiate actual Rule objects.
     * 
     * @param {string} axiomText - E.g. "X"
     * @param {string} rulesText - E.g. "F -> FF \n X -> F[+X]F[-X]"
     */
    loadConfiguration(axiomText, rulesText) {
        this.axiom = lsystemParser.parseAxiom(axiomText);
        this.rules = lsystemParser.parseRules(rulesText);
    }

    /**
     * Sets the target iteration depth.
     * Contains a hard-coded security clamp to ensure we never
     * attempt a depth greater than 12, regardless of UI bypasses.
     * (Depths near 12 with simple rules generate ~10-50M chars)
     * 
     * @param {number} depth 
     */
    setDepth(depth) {
        this.depth = Math.max(0, Math.min(12, depth));
    }

    /**
     * Generates the command string. Uses cache if available.
     * This is a blocking, synchronous operation that will freeze the main thread.
     * For future optimization, this could be offloaded to a WebWorker.
     * 
     * @returns {string} The final L-System macro string.
     */
    generate() {
        // Start diagnostic timer
        const t0 = performance.now();

        // Create a simple string representation of rules for the cache key.
        // E.g. "X -> F+X;F -> FF"
        const rulesStr = this.rules.map(r => r.toString()).join(';');

        // Query the Memory Cache before execution
        // Cache hits resolve instantly in ~1ms instead of ~400ms for heavy plants.
        let result = systemCache.get(this.axiom, rulesStr, this.depth);

        if (!result) {
            // Not in cache, compute it via the stringBuilder engine.
            result = lsystemGenerator.generate(this.axiom, this.rules, this.depth);

            // Save to LRU cache.
            systemCache.set(this.axiom, rulesStr, this.depth, result);
        }

        // End diagnostic timer
        const t1 = performance.now();

        // Save metrics for UI
        this.lastGenerationTime = t1 - t0;
        this.lastCommandCount = result.length;

        return result;
    }

    /**
     * Returns performance data from the last generation cycle.
     * Used by the HUD overhead.
     * @returns {Object} {generationTimeMs: number, commandCount: number}
     */
    getMetrics() {
        return {
            generationTimeMs: this.lastGenerationTime,
            commandCount: this.lastCommandCount
        };
    }
}
