/**
 * @file math.js
 * @description Mathematical utility functions for the simulation.
 */

import { CONFIG } from './constants.js';

/**
 * Normalizes a value between 0 and 1.
 * @param {number} value - The value to normalize.
 * @param {number} min - The minimum value.
 * @param {number} max - The maximum value.
 * @returns {number} The normalized value.
 */
export function normalize(value, min, max) {
    return (value - min) / (max - min);
}

/**
 * Linear interpolation between two values.
 * @param {number} start - The start value.
 * @param {number} end - The end value.
 * @param {number} t - The interpolation factor (0-1).
 * @returns {number} The interpolated value.
 */
export function lerp(start, end, t) {
    return start * (1 - t) + end * t;
}

/**
 * Calculates the distance between two positions on a circular track.
 * Account for wrap-around.
 * @param {number} pos1 - Position of the rear vehicle.
 * @param {number} pos2 - Position of the front vehicle.
 * @param {number} length - Total length of the track.
 * @returns {number} The distance.
 */
export function circularDistance(pos1, pos2, length) {
    let delta = pos2 - pos1;
    if (delta < 0) {
        delta += length;
    }
    return delta;
}

/**
 * Maps a value from one range to another.
 * @param {number} value - Input value.
 * @param {number} inMin - Input range minimum.
 * @param {number} inMax - Input range maximum.
 * @param {number} outMin - Output range minimum.
 * @param {number} outMax - Output range maximum.
 * @returns {number} Mapped value.
 */
export function mapRange(value, inMin, inMax, outMin, outMax) {
    return (value - inMin) * (outMax - outMin) / (inMax - inMin) + outMin;
}

/**
 * Generates a random number between min and max.
 * @param {number} min 
 * @param {number} max 
 * @returns {number}
 */
export function randomRange(min, max) {
    return Math.random() * (max - min) + min;
}

/**
 * Converts HSL to RGB CSS string.
 * @param {number} h - Hue (0-360)
 * @param {number} s - Saturation (0-100)
 * @param {number} l - Lightness (0-100)
 * @returns {string} CSS color string.
 */
export function hsl(h, s, l) {
    return `hsl(${h}, ${s}%, ${l}%)`;
}
