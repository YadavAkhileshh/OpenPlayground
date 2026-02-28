/**
 * @fileoverview Analytics and History tracking for PetRock.
 * Tracks session duration, interaction density, and historical milestones.
 * @module Analytics
 */

import { events, EVENT_TYPES } from './events.js';
import { getRandomHistory } from './database.js';

/**
 * @typedef {Object} SessionAnalytics
 * @property {number} startTime - When the session began.
 * @property {number} peaks - Highest interaction per minute.
 * @property {Array<string>} milestones - Achievements unlocked (humorous).
 */

const session = {
    startTime: Date.now(),
    interactionLog: [],
    milestones: [],
};

/**
 * Checks for and records "Milestones" based on interaction counts.
 * @param {number} count - Current interaction total.
 */
export function checkMilestones(count) {
    if (count === 1 && !session.milestones.includes('First Touch')) {
        recordMilestone('First Touch', 'The rock acknowledges your existence. Silently.');
    } else if (count === 10 && !session.milestones.includes('Gentle Soul')) {
        recordMilestone('Gentle Soul', 'You have pet the rock 10 times. It is still a rock.');
    } else if (count === 50 && !session.milestones.includes('Obsessive Caretaker')) {
        recordMilestone('Obsessive Caretaker', '50 interactions? The rock is starting to feel crowded.');
    }
}

/**
 * Records a milestone and emits an event.
 * @param {string} title - Milestone name.
 * @param {string} desc - Description.
 */
function recordMilestone(title, desc) {
    session.milestones.push(title);
    console.info(`Milestone Unlocked: ${title} - ${desc}`);

    events.emit(EVENT_TYPES.LOG_MESSAGE, {
        type: 'system',
        text: `Achievement: [${title}] unlocked. ${desc}`
    });
}

/**
 * Generates a "Historical Resume" for the rock.
 * @returns {string} A long, detailed string of the rock's life.
 */
export function generateResume() {
    let resume = "PET ROCK #001 - RESUME\n";
    resume += "-----------------------\n";
    resume += "Objective: To remain exactly where I am.\n\n";
    resume += "Experience:\n";
    resume += "- Professional Paperweight (2026-Present)\n";
    resume += "- Geological Wonder (Millions of years)\n";
    resume += "- Silent Listener (Always)\n\n";
    resume += "Skills:\n";
    resume += "- Hardness: 7.0/10.0\n";
    resume += "- Mobility: 0.0/10.0\n";
    resume += "- Reliability: 10.0/10.0\n\n";
    resume += "Recent History:\n";
    resume += getRandomHistory() + "\n";

    return resume;
}

/**
 * Initializes analytics listeners.
 */
export function initAnalytics() {
    events.on(EVENT_TYPES.ROCK_PET, () => {
        session.interactionLog.push(Date.now());
    });

    events.on(EVENT_TYPES.ROCK_FEED, () => {
        session.interactionLog.push(Date.now());
    });
}

/**
 * Calculates interactions per minute for the current session.
 * @returns {number}
 */
export function getInteractionsPerMinute() {
    const elapsedMinutes = (Date.now() - session.startTime) / 60000;
    if (elapsedMinutes < 0.1) return 0;

    return (session.interactionLog.length / elapsedMinutes).toFixed(2);
}
