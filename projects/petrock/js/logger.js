/**
 * @fileoverview Humorous interaction logger for PetRock.
 * Receives messages via the EventBus and displays them in the UI.
 * 
 * @module Logger
 * @version 1.1.0
 */

import { events, EVENT_TYPES } from './events.js';

/**
 * Collection of humorous messages for feeding.
 * @const {string[]}
 */
const FEED_MESSAGES = [
    "You offered a pebble. The rock did not move.",
    "Nutritious silt has been provided. No digestion observed.",
    "A fine mineral snack. The rock remains indifferent.",
    "The rock is now 0.00001% larger in theory.",
    "Feeding successful. The floor is now slightly messier.",
    "Gravel breakfast served with style.",
    "The rock 'ignored' the meal with great intensity.",
    "A serving of high-quality dust. Delightful.",
    "The rock is considering eating. Give it a billion years."
];

/**
 * Collection of humorous messages for petting.
 * @const {string[]}
 */
const PET_MESSAGES = [
    "A gentle pat. The rock is emotionally stable.",
    "Affection delivered. Still no heartbeat. Good.",
    "You pet the rock. It felt like... a rock.",
    "A moment of bonding. Silence followed.",
    "The rock appreciated that, probably.",
    "Touch detected. Geological response: Null.",
    "A tactile exchange occurred. Nothing changed.",
    "Soft hands, hard rock. The duality of man.",
    "The rock is soaking up the attention. Meter: 0.00."
];

/**
 * Collection of humorous messages for system/environmental changes.
 * @const {string[]}
 */
const SYSTEM_MESSAGES = [
    "Geological survey indicates zero movement.",
    "The rock is pondering the meaning of weight.",
    "Atmospheric pressure stable. Rock is pleased.",
    "A nearby dust mite has moved. The rock did not.",
    "Gravity is still working. The rock confirms.",
    "The sun has moved 0.000001 degrees. Rock is aware.",
    "Ambient temperature rises. The rock expands slightly.",
    "Status Check: Still gray. Still hard. Still here."
];

/**
 * Initializes the logger by subscribing to EventBus messages.
 * Maps event types to message selection logic.
 */
export function initLogger() {
    events.on(EVENT_TYPES.LOG_MESSAGE, (data) => {
        if (data.type === 'clear') {
            clearLog();
            return;
        }

        const text = data.text || selectMessage(data.type);
        addLogEntry(data.type, text);
    });
}

/**
 * Selects a random message based on the event type.
 * @param {string} type - 'feed', 'pet', or 'system'.
 * @returns {string} Random message string.
 * @private
 */
function selectMessage(type) {
    switch (type) {
        case 'feed': return FEED_MESSAGES[Math.floor(Math.random() * FEED_MESSAGES.length)];
        case 'pet': return PET_MESSAGES[Math.floor(Math.random() * PET_MESSAGES.length)];
        default: return SYSTEM_MESSAGES[Math.floor(Math.random() * SYSTEM_MESSAGES.length)];
    }
}

/**
 * Adds a new entry to the interaction log DOM element.
 * Handles styling and list management (maximum entries).
 * @param {string} type - Category of the log.
 * @param {string} message - Content to display.
 */
export function addLogEntry(type = 'system', message = "Atmospheric stability maintained.") {
    const logContainer = document.getElementById('interaction-log');
    if (!logContainer) return;

    let className = "log-entry";
    if (type === 'feed' || type === 'pet') {
        className += " action";
    } else {
        className += " system";
    }

    const entry = document.createElement('div');
    entry.className = className + " log-entry-new";

    // Prepend timestamp for professional geological feel
    const time = new Date().toLocaleTimeString('en-US', { hour12: false });
    entry.textContent = `[${time}] ${message}`;

    logContainer.prepend(entry);

    // Limit log size to prevent DOM bloat (Max 50 entries)
    if (logContainer.children.length > 50) {
        logContainer.lastElementChild.remove();
    }

    // Visual highlight fade-out
    setTimeout(() => {
        entry.classList.remove('log-entry-new');
    }, 2000);
}

/**
 * Wipes the interaction log UI.
 */
export function clearLog() {
    const logContainer = document.getElementById('interaction-log');
    if (logContainer) {
        logContainer.innerHTML = '<div class="log-entry system">Interaction history wiped. The rock already forgot.</div>';
    }
}
