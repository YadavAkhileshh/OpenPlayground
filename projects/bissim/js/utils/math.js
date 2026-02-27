/**
 * @fileoverview Mathematical and statistical utility functions.
 * Provides wrappers for random number generation, array manipulation, and
 * basic statistical analysis used in the analytics engine.
 */

/**
 * Generates a random integer between min and max (inclusive).
 * @param {number} min - Minimum value
 * @param {number} max - Maximum value
 * @returns {number} Random integer
 */
export function randomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

/**
 * Selects a random element from an array.
 * @template T
 * @param {T[]} array - Source array
 * @returns {T} Random element
 */
export function randomChoice(array) {
    if (!array || array.length === 0) return null;
    return array[Math.floor(Math.random() * array.length)];
}

/**
 * Shuffles an array in place using Fisher-Yates algorithm.
 * @template T
 * @param {T[]} array - Array to shuffle
 * @returns {T[]} Shuffled array
 */
export function shuffle(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

/**
 * Calculates the mean (average) of a number array.
 * @param {number[]} numbers - Array of numbers
 * @returns {number} Mean value
 */
export function mean(numbers) {
    if (numbers.length === 0) return 0;
    const sum = numbers.reduce((a, b) => a + b, 0);
    return sum / numbers.length;
}

/**
 * Normalizes a value between 0 and 1 based on min/max range.
 * @param {number} value - Value to normalize
 * @param {number} min - Range minimum
 * @param {number} max - Range maximum
 * @returns {number} Normalized value (0-1)
 */
export function normalize(value, min, max) {
    return (value - min) / (max - min);
}

/**
 * Generates a UUID-like string for session tracking.
 * @returns {string} Random string
 */
export function generateId() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        const r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
}
