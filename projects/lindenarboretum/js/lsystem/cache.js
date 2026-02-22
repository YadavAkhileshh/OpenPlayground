/**
 * LindenArboretum - Cache Module
 * Memoizes generated strings for specific rule configurations
 * to avoid recalculating the same fractal on subsequent renders
 * if only wind or colors are changing.
 */

export class LSystemCache {
    constructor(maxEntries = 5) {
        this.cache = new Map();
        this.maxEntries = maxEntries;
    }

    /**
     * Generates a unique key based on axiom, rules, and depth.
     */
    _generateKey(axiom, rulesStr, depth) {
        return `${axiom}|${rulesStr}|${depth}`;
    }

    get(axiom, rulesStr, depth) {
        const key = this._generateKey(axiom, rulesStr, depth);
        return this.cache.get(key);
    }

    set(axiom, rulesStr, depth, generatedString) {
        const key = this._generateKey(axiom, rulesStr, depth);

        // LRU-style eviction if cache gets too large
        if (this.cache.size >= this.maxEntries) {
            const firstKey = this.cache.keys().next().value;
            this.cache.delete(firstKey);
        }

        this.cache.set(key, generatedString);
    }

    clear() {
        this.cache.clear();
    }
}

// Global singleton cache
export const systemCache = new LSystemCache();
