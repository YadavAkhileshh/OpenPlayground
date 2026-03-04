/**
 * @fileoverview State management system for PetRock.
 * Handles tracking of interaction counts, session time, and state notifications
 * using a centralized event bus for decoupling.
 * 
 * @module State
 * @version 1.1.0
 */

import { events, EVENT_TYPES } from './events.js';

/**
 * @typedef {Object} RockState
 * @property {number} feedingCount - Number of times the rock has been fed.
 * @property {number} interactionCount - Total number of times pet/interacted.
 * @property {number} startTime - Session start timestamp in milliseconds.
 * @property {string} currentStatus - Humorous status of the rock.
 * @property {number} health - Theoretical health percentage (always 100).
 * @property {number} hydration - Theoretical hydration (always 0).
 */

/**
 * Internal application state storage.
 * @type {RockState}
 * @private
 */
const state = {
    feedingCount: 0,
    interactionCount: 0,
    startTime: Date.now(),
    currentStatus: 'Satisfied',
    health: 100,
    hydration: 0
};

/**
 * Storage key for local persistence.
 * @const {string}
 */
const PERSISTENCE_KEY = 'petrock_v1_data_advanced';

/**
 * Status strings for various rock "emotions" or "states".
 * These are randomly assigned to provide personality.
 * @type {string[]}
 */
const ROCK_STATUSES = [
    'Satisfied',
    'Indifferent',
    'Stoic',
    'Unmoved',
    'Sedimentary',
    'Solid',
    'Deeply Boring',
    'Quietly judging',
    'Vaguely gray',
    'Existent',
    'Petrified',
    'Rock-solid',
    'Metamorphic',
    'Basaltic',
    'Granitic',
    'Limestoner'
];

/**
 * Increments the feeding count and updates status.
 * Automatically triggers UI update and persistence events.
 * @function
 */
export function incrementFeeding() {
    state.feedingCount++;
    updateStatus();

    // Emit events for other modules to react
    events.emit(EVENT_TYPES.ROCK_FEED, state.feedingCount);
    events.emit(EVENT_TYPES.UI_UPDATE, getState());
}

/**
 * Increments the total interaction count.
 * @function
 */
export function incrementInteractions() {
    state.interactionCount++;

    events.emit(EVENT_TYPES.ROCK_PET, state.interactionCount);
    events.emit(EVENT_TYPES.UI_UPDATE, getState());
}

/**
 * Randomly updates the rock's status text based on a weighted chance.
 * @private
 */
function updateStatus() {
    // 20% chance to change status on interaction
    if (Math.random() > 0.8) {
        state.currentStatus = ROCK_STATUSES[Math.floor(Math.random() * ROCK_STATUSES.length)];
    }
}

/**
 * Gets a read-only snapshot of the current state.
 * @returns {RockState} A clone of the current state.
 */
export function getState() {
    return Object.freeze({ ...state });
}

/**
 * Formats the session time as HH:MM:SS by calculating offset from startTime.
 * @returns {string} Formatted duration string.
 */
export function getSessionDurationFormatted() {
    const elapsed = Date.now() - state.startTime;
    const seconds = Math.floor((elapsed / 1000) % 60);
    const minutes = Math.floor((elapsed / (1000 * 60)) % 60);
    const hours = Math.floor((elapsed / (1000 * 60 * 60)) % 24);

    return [
        hours.toString().padStart(2, '0'),
        minutes.toString().padStart(2, '0'),
        seconds.toString().padStart(2, '0')
    ].join(':');
}

/**
 * Loads state from localStorage if available.
 * Gracefully handles parsing errors or missing data.
 * @async
 */
export function loadPersistedData() {
    try {
        const saved = localStorage.getItem(PERSISTENCE_KEY);
        if (saved) {
            const parsed = JSON.parse(saved);
            state.feedingCount = parsed.feedingCount || 0;
            state.interactionCount = parsed.interactionCount || 0;
            console.log("State | Successfully loaded persisted data.");
        }
    } catch (e) {
        console.warn('State | Error accessing localStorage:', e);
    }
}

/**
 * Saves relevant state fields to localStorage.
 * Only persists data that should survive a session refresh.
 */
export function savePersistedData() {
    try {
        const payload = {
            feedingCount: state.feedingCount,
            interactionCount: state.interactionCount,
            lastSaved: Date.now()
        };

        localStorage.setItem(PERSISTENCE_KEY, JSON.stringify(payload));
        console.debug("State | Progress saved to local storage.");
    } catch (e) {
        console.warn('State | Failed to save persisted rock state:', e);
    }
}

// Global hook for event-based saving
events.on(EVENT_TYPES.SAVE_STATE, () => savePersistedData());
