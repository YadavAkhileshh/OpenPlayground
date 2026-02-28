/**
 * GlyphCache.js – Caches built SDF data per unique text string.
 * Avoids redundant SDF recomputation on repeated queries.
 */

const GlyphCache = (() => {
    'use strict';

    // cache: Map<string, SDFData>
    // SDFData = { sdf, grid, gridW, gridH, beziers, canvasW, canvasH }
    const _cache = new Map();
    const MAX_ENTRIES = 16;

    // LRU tracking
    const _lruOrder = [];

    function _evictOldest() {
        if (_lruOrder.length >= MAX_ENTRIES) {
            const oldest = _lruOrder.shift();
            _cache.delete(oldest);
        }
    }

    /**
     * Check if a given text key is cached.
     * @param {string} key
     */
    function has(key) {
        return _cache.has(key);
    }

    /**
     * Retrieve cached SDF data.
     * @param {string} key
     * @returns {object|null}
     */
    function get(key) {
        if (!_cache.has(key)) return null;
        const idx = _lruOrder.indexOf(key);
        if (idx !== -1) _lruOrder.splice(idx, 1);
        _lruOrder.push(key);
        return _cache.get(key);
    }

    /**
     * Store SDF data in cache.
     * @param {string} key
     * @param {object} data
     */
    function set(key, data) {
        if (_cache.has(key)) {
            const idx = _lruOrder.indexOf(key);
            if (idx !== -1) _lruOrder.splice(idx, 1);
        } else {
            _evictOldest();
        }
        _cache.set(key, data);
        _lruOrder.push(key);
    }

    /**
     * Build a cache key from text and canvas dimensions.
     */
    function makeKey(text, canvasW, canvasH) {
        return `${text}|${canvasW}|${canvasH}`;
    }

    /**
     * Remove a specific entry.
     */
    function invalidate(key) {
        _cache.delete(key);
        const idx = _lruOrder.indexOf(key);
        if (idx !== -1) _lruOrder.splice(idx, 1);
    }

    /**
     * Clear all cached data.
     */
    function clear() {
        _cache.clear();
        _lruOrder.length = 0;
    }

    /**
     * Return count of cached entries.
     */
    function size() {
        return _cache.size;
    }

    /**
     * Get list of all keys (for debug).
     */
    function keys() {
        return [..._cache.keys()];
    }

    return {
        has, get, set, makeKey,
        invalidate, clear, size, keys,
    };
})();

window.SDFChisel = window.SDFChisel || {};
window.SDFChisel.GlyphCache = GlyphCache;
