/**
 * @fileoverview Interaction handler for PetRock.
 * Binds DOM events to state changes and animations using the EventBus.
 * 
 * @module Interaction
 * @version 1.1.0
 */

import { incrementFeeding, incrementInteractions, savePersistedData } from './state.js';
import { playAnimation, spawnFloatingText, triggerFacialExpression } from './animation.js';
import { events, EVENT_TYPES, debounce } from './events.js';

/**
 * Initializes all event listeners for the application.
 * Hooks into buttons, the rock itself, and system-level events.
 */
export function initInteractions() {
    const rockEl = document.getElementById('pet-rock');
    const feedBtn = document.getElementById('btn-feed');
    const petBtn = document.getElementById('btn-pet');
    const clearLogBtn = document.getElementById('btn-clear-log');

    // Setup primary interaction listeners
    if (rockEl) {
        rockEl.addEventListener('click', (e) => handlePetInteraction(e));

        // Comprehensive keyboard accessibility (WAI-ARIA compliance)
        rockEl.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                handlePetInteraction(e);
            }
        });
    }

    if (feedBtn) {
        feedBtn.addEventListener('click', (e) => handleFeedInteraction(e));
    }

    if (petBtn) {
        petBtn.addEventListener('click', (e) => handlePetInteraction(e));
    }

    if (clearLogBtn) {
        clearLogBtn.addEventListener('click', () => {
            events.emit(EVENT_TYPES.LOG_MESSAGE, { type: 'clear' });
        });
    }

    // Subscribe to system events
    events.on(EVENT_TYPES.LOG_MESSAGE, (data) => {
        console.log(`Interaction | Internal Message: ${data.text || data.type}`);
    });

    // Background tasks: Periodic system logs and Auto-save
    setupBackgroundTasks();
}

/**
 * Sets up timers for recurring background operations.
 * Includes random system events and debounced persistence.
 * @private
 */
function setupBackgroundTasks() {
    // Sparse system activity simulation
    setInterval(() => {
        if (Math.random() > 0.98) {
            events.emit(EVENT_TYPES.LOG_MESSAGE, { type: 'system' });
        }
    }, 15000);

    // Persist state to storage every 30 seconds
    const debouncedSave = debounce(() => savePersistedData(), 1000);
    setInterval(() => debouncedSave(), 30000);
}

/**
 * Handles the "pet" action triggered by mouse or keyboard.
 * Coordinates state update, animation, and visual feedback.
 * @param {Event|MouseEvent} e - The triggering interaction event.
 */
function handlePetInteraction(e) {
    const rockEl = document.getElementById('pet-rock');

    // Update logic via state module
    incrementInteractions();

    // Visual and logical feedback
    playAnimation(rockEl, 'jiggle', 600);
    triggerFacialExpression(rockEl, 'happy', 1000);
    events.emit(EVENT_TYPES.LOG_MESSAGE, { type: 'pet' });

    // Spatial feedback (Floating text)
    triggerFeedbackText(e, 'Aww');
}

/**
 * Handles the "feed" action.
 * Coordinates the mineral consumption logic.
 * @param {Event|MouseEvent} e - The triggering mouse event.
 */
function handleFeedInteraction(e) {
    const rockEl = document.getElementById('pet-rock');
    const feedBtn = document.getElementById('btn-feed');

    // Update logic
    incrementFeeding();

    // Visual feedback
    playAnimation(rockEl, 'eating', 400);
    triggerFacialExpression(rockEl, 'surprised', 800);
    playAnimation(feedBtn, 'pulse-click', 300);

    events.emit(EVENT_TYPES.LOG_MESSAGE, { type: 'feed' });

    triggerFeedbackText(e, '+1 Pebble');
}

/**
 * Utility to determine coordinates and spawn floating text.
 * Adapts to both mouse events and keyboard/accessibility triggers.
 * @param {Event} e - event object.
 * @param {string} text - Message to show.
 * @private
 */
function triggerFeedbackText(e, text) {
    const rockEl = document.getElementById('pet-rock');

    if (e.clientX && e.clientY) {
        // Direct mouse contact
        spawnFloatingText(text, e.clientX, e.clientY);
    } else {
        // Center of the rock for keyboard/other triggers
        const rect = rockEl.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 3;
        spawnFloatingText(text, centerX, centerY);
    }
}
