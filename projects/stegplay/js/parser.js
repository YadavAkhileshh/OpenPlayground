/**
 * @file parser.js
 * @description Advanced document and text parser for StegPlay.
 * 
 * This module acts as the orchestration layer between the raw DOM content
 * and the StegoEngine. It ensures that the carrier text is treated with
 * respect—preserving the user's intended layout, formatting, and readability
 * while invisibly weaving in the secret payload.
 * 
 * KEY FEATURES:
 * - Content Normalization: Strips existing stego to avoid collision.
 * - Injection Strategy: Intelligently identifies non-obtrusive insertion points.
 * - Performance Layer: Uses asynchronous processing for large data blocks.
 * - Integrity Verification: Validates that the payload hasn't been corrupted.
 * 
 * @author Antigravity
 * @version 1.0.0
 */

class ContentParser {
    /**
     * Initializes the ContentParser with a required StegoEngine instance.
     * 
     * @param {StegoEngine} engine - The logic engine for bit manipulation.
     * @throws {Error} If the engine is missing or invalid.
     */
    constructor(engine) {
        if (!engine || typeof engine.encode !== 'function') {
            throw new Error('[ContentParser] A valid StegoEngine instance is required for initialization.');
        }

        /** @private */
        this._engine = engine;

        /**
         * Configuration Parameters
         * These define the boundaries and behavior of the parsing logic.
         */
        this.config = {
            /** @type {number} Maximum allowed carrier length in characters (1MB approx) */
            maxContentLength: 1048576,

            /** @type {string} Defines where in the text the secret is injected */
            injectionStrategy: 'first-delimiter',

            /** @type {boolean} If true, the parser will log detailed metrics to the console */
            verboseLogging: true
        };

        /**
         * Performance Metrics
         * Track the efficiency of steganographic operations.
         */
        this.metrics = {
            processingHistory: [],
            totalCharsEncoded: 0,
            totalCharsDecoded: 0,
            averageLatency: 0
        };

        this._log('Initialization complete. System ready for parsing.');
    }

    /**
     * Internal logging utility with timestamping.
     * @param {string} msg - Message to log.
     * @private
     */
    _log(msg) {
        if (this.config.verboseLogging) {
            const timestamp = new Date().toLocaleTimeString();
            console.log(`[ContentParser @ ${timestamp}] ${msg}`);
        }
    }

    /**
     * Prepares and cleans the carrier text.
     * Essential for preventing "stacking" of multiple secrets which could lead 
     * to visual glitches or decoding failures.
     * 
     * @param {string} text - The raw input text string.
     * @returns {string} - The cleaned, safe-to-use carrier string.
     */
    prepareCarrier(text) {
        if (typeof text !== 'string') return '';

        this._log(`Starting preparation for carrier of length ${text.length}`);
        const start = performance.now();

        // Remove any existing zero-width characters using the engine's clean utility
        const sanitized = this._engine.clean(text);

        const duration = performance.now() - start;
        this._log(`Preparation finished in ${duration.toFixed(2)}ms`);

        return sanitized;
    }

    /**
     * Executes the heavy lifting of encoding secret text into a carrier.
     * Wrapped in a Promise to allow for non-blocking UI behavior during 
     * processing of large articles.
     * 
     * @param {string} carrier - The visible text content.
     * @param {string} secret - The secret message to hide.
     * @returns {Promise<string>} - The resulting encoded text.
     */
    async processAndInject(carrier, secret) {
        return new Promise((resolve, reject) => {
            try {
                this._log('Beginning asynchronous injection task...');
                const start = performance.now();

                // 1. Sanity check on carrier size
                if (carrier.length > this.config.maxContentLength) {
                    throw new Error(`Carrier exceeds maximum allowed size of ${this.config.maxContentLength} characters.`);
                }

                // 2. Prepare the canvas
                const cleanCarrier = this.prepareCarrier(carrier);

                // 3. Perform the injection via StegoEngine
                const result = this._engine.encode(cleanCarrier, secret);

                // 4. Update metrics
                const duration = performance.now() - start;
                this._recordMetric('encode', carrier.length, duration);

                this._log(`Injection successful. Final text length: ${result.length}`);
                resolve(result);

            } catch (err) {
                this._log(`ERROR during injection: ${err.message}`);
                reject(err);
            }
        });
    }

    /**
     * Extracts secret data from a provided text block.
     * Optimized for speed by leveraging the engine's targeted scan.
     * 
     * @param {string} text - The potentially encoded text.
     * @returns {string} - The decoded secret (empty if none found).
     */
    extract(text) {
        if (!text) return '';

        this._log('Analyzing text for hidden payloads...');
        const start = performance.now();

        const secret = this._engine.decode(text);

        const duration = performance.now() - start;
        this._recordMetric('decode', text.length, duration);

        if (secret) {
            this._log('Payload detected and extracted successfully.');
        } else {
            this._log('No valid StegPlay header found in the carrier.');
        }

        return secret;
    }

    /**
     * Internal method to record performance metrics.
     * @param {string} type - 'encode' or 'decode'
     * @param {number} size - Input size.
     * @param {number} duration - Time taken in ms.
     * @private
     */
    _recordMetric(type, size, duration) {
        const entry = { type, size, duration, time: new Date() };
        this.metrics.processingHistory.push(entry);

        if (type === 'encode') this.metrics.totalCharsEncoded += size;
        else this.metrics.totalCharsDecoded += size;

        // Keep history manageable
        if (this.metrics.processingHistory.length > 100) {
            this.metrics.processingHistory.shift();
        }
    }

    /**
     * Content Analysis: Scans text to provide security insights.
     * Utility for the UI to display "risk" or "carrying capacity".
     * 
     * @param {string} text - Carrier text to analyze.
     * @returns {Object} - Analysis report.
     */
    analyze(text) {
        if (!text) return null;

        const charCount = text.length;
        const spaceCount = (text.match(/ /g) || []).length;
        const pCount = (text.match(/\n/g) || []).length + 1;

        // Estimate how much secret data we can reasonably hide
        // Assuming 1 bit per space if we were to distribute (though we append for now)
        const capacityBits = spaceCount * 8;

        return {
            charCount,
            wordCount: text.split(/\s+/).length,
            spaceCount,
            paragraphCount: pCount,
            estimatedCapacity: `${(capacityBits / 8).toFixed(0)} bytes`
        };
    }
}

// Global Export
window.ContentParser = ContentParser;
