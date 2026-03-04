/**
 * @fileoverview Personality Engine for PetRock.
 * This module adds "depth" to the rock by simulating complex decision-making
 * that ultimately results in the rock doing nothing, but in a very detailed way.
 * @module Personality
 */

import { addLogEntry } from './logger.js';
import { playAnimation } from './animation.js';

/**
 * @typedef {Object} PersonalityTraits
 * @property {number} stubbornness - How likely the rock is to ignore input.
 * @property {number} patience - Affects the frequency of idle comments.
 * @property {string} alignment - Ethical alignment (always Neutral).
 */

const traits = {
    stubbornness: 0.95,
    patience: 1.0,
    alignment: 'True Neutral'
};

const RARE_THOUGHTS = [
    "The rock is considering becoming a pebble for a day.",
    "A distant memory of being a mountain surface.",
    "The rock wonders why humans move so much.",
    "Contemplating the hardness scale. Still a solid 7.",
    "The rock is practicing its 'not-moving' technique.",
    "Internal monologue: '.................'",
    "The rock has detected a slight change in humidity. It remains unimpressed."
];

/**
 * Analyzes the current environmental stability.
 * (Returns stability: 100% always)
 * @returns {number} Stability percentage.
 */
export function analyzeStability() {
    console.log("PersonalityEngine | Analyzing geological stability...");
    // Complex calculation that always yields 100
    const basis = Math.PI * Math.E;
    const stability = Math.min(100, Math.floor(basis * 35.123));
    return stability;
}

/**
 * Triggers a rare "Deep Thought" from the rock.
 */
export function triggerDeepThought() {
    if (Math.random() > 0.9) {
        const thought = RARE_THOUGHTS[Math.floor(Math.random() * RARE_THOUGHTS.length)];
        addLogEntry('system', thought);
        console.info(`Rock Thought: ${thought}`);
    }
}

/**
 * Simulates a "Heavy" state where the rock becomes even more rock-like.
 */
export function simulateGravitationalPull() {
    const rockEl = document.getElementById('pet-rock');
    if (!rockEl) return;

    console.log("PersonalityEngine | Simulating local gravity increase...");
    playAnimation(rockEl, 'pulse-click', 1000);

    // Add a temporary heavy class if we had one, otherwise just log
    addLogEntry('system', "Local gravity increased by 0.00001%. The rock held its ground.");
}

/**
 * The Personality Engine Loop.
 * Runs periodically to process "thoughts".
 */
export function startEngine() {
    console.log("PersonalityEngine | Starting cognitive simulation loop...");

    setInterval(() => {
        const roll = Math.random();

        if (roll > 0.98) {
            triggerDeepThought();
        } else if (roll < 0.02) {
            simulateGravitationalPull();
        }

    }, 5000);
}

// Initial analysis
const currentStability = analyzeStability();
console.log(`PersonalityEngine | Initial stability: ${currentStability}%`);
