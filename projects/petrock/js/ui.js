/**
 * @fileoverview UI Orchestration for PetRock.
 * Handles DOM updates based on events from the central state and systems.
 * 
 * @module UI
 * @version 1.1.0
 */

import { events, EVENT_TYPES } from './events.js';
import { getSessionDurationFormatted } from './state.js';
import { checkMilestones } from './analytics.js';
import { playAnimation, triggerFacialExpression } from './animation.js';

/**
 * Global cache for frequently accessed DOM elements.
 * @type {Object<string, HTMLElement>}
 * @private
 */
let elements = {};

/**
 * Initializes the UI module.
 * Caches elements, sets up event subscriptions, and starts UI timers.
 */
export function initUI() {
    // Cache crucial elements for performance
    elements = {
        feedCount: document.getElementById('feed-count'),
        interactionCount: document.getElementById('interaction-count'),
        status: document.getElementById('rock-status'),
        sessionTime: document.getElementById('session-time'),
        rock: document.getElementById('pet-rock')
    };

    console.log("UI | Caching complete. Elements found:", Object.keys(elements).length);

    // Subscribe to state changes via EventBus
    events.on(EVENT_TYPES.UI_UPDATE, (state) => {
        updateStatDisplay(state);
        checkMilestones(state.interactionCount);
    });

    // Start UI-only maintenance timers
    setupUITimers();

    // Signal ready state
    const statusIdx = document.getElementById('system-status');
    if (statusIdx) {
        statusIdx.classList.add('ready');
        statusIdx.title = "System Status: Online";
    }
}

/**
 * Updates the statistical display values in the DOM.
 * @param {import('./state.js').RockState} state - Current application state.
 * @private
 */
function updateStatDisplay(state) {
    if (elements.feedCount) elements.feedCount.textContent = state.feedingCount;
    if (elements.interactionCount) elements.interactionCount.textContent = state.interactionCount;
    if (elements.status) elements.status.textContent = state.currentStatus;
}

/**
 * Runs recurring UI tasks such as elapsed time updates.
 * @private
 */
function setupUITimers() {
    // Update the visual clock every second (Precision: ~1Hz)
    setInterval(() => {
        if (elements.sessionTime) {
            elements.sessionTime.textContent = getSessionDurationFormatted();
        }
    }, 1000);
}

/**
 * Utility to query multiple elements and return a mapped object.
 * @param {string[]} ids - Array of element IDs to fetch.
 * @returns {Object<string, HTMLElement>} Map of IDs to elements.
 */
export function mapElements(ids) {
    return ids.reduce((acc, id) => {
        acc[id] = document.getElementById(id);
        return acc;
    }, {});
}

/**
 * Handles browser window resizing (if needed for the rock stage).
 * @param {Event} e - Resize event.
 * @private
 */
function handleResize(e) {
    // Current layout is CSS-driven, but we hook here for future canvas features
    console.debug("UI | Viewport changed.", window.innerWidth, window.innerHeight);
}

window.addEventListener('resize', handleResize);
