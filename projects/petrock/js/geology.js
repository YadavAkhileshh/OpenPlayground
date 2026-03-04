/**
 * @fileoverview Geological Report Generator for PetRock.
 * Generates highly detailed, scientific-sounding reports about a rock
 * that is doing absolutely nothing.
 * @module Geology
 */

/**
 * @typedef {Object} GeologicalData
 * @property {string} composition - Mineral makeup.
 * @property {number} density - Weight per volume.
 * @property {string} era - Geological time period.
 * @property {number} vibrationLevel - Seismic activity.
 */

const DATA_POINTS = {
    minerals: ['Quartz', 'Feldspar', 'Mica', 'Boredomite', 'Silica'],
    eras: ['Precambrian', 'Paleozoic', 'Mesozoic', 'Cenozoic', 'The Last Tuesday'],
    densityRange: [2.5, 3.8] // g/cm³
};

/**
 * Generates a random geological profile for the rock.
 * @returns {GeologicalData}
 */
export function generateProfile() {
    const mineralCount = Math.floor(Math.random() * 3) + 1;
    const selectedMinerals = [];

    for (let i = 0; i < mineralCount; i++) {
        const m = DATA_POINTS.minerals[Math.floor(Math.random() * DATA_POINTS.minerals.length)];
        if (!selectedMinerals.includes(m)) selectedMinerals.push(m);
    }

    return {
        composition: selectedMinerals.join(', '),
        density: (Math.random() * (DATA_POINTS.densityRange[1] - DATA_POINTS.densityRange[0]) + DATA_POINTS.densityRange[0]).toFixed(2),
        era: DATA_POINTS.eras[Math.floor(Math.random() * DATA_POINTS.eras.length)],
        vibrationLevel: 0.000001
    };
}

/**
 * Logs a detailed report to the browser console.
 * (Humorous meta-feature)
 */
export function logDetailedReport() {
    const profile = generateProfile();

    console.group("Geological Report - ID: #ROCK-001");
    console.log(`Primary Composition: ${profile.composition}`);
    console.log(`Relative Density: ${profile.density} g/cm³`);
    console.log(`Estimated Era: ${profile.era}`);
    console.log(`Current Seismic Activity: ${profile.vibrationLevel} Hz`);
    console.log("Stress Level: 0.0 (Immutable)");
    console.log("Movement Probability: < 10^-12");
    console.groupEnd();
}

/**
 * Displays a summary of the report in the interaction log.
 * @param {Function} logCallback - The addLogEntry function from logger.js.
 */
export function reportToUI(logCallback) {
    const profile = generateProfile();
    const summary = `Geological Scan: ${profile.density} g/cm³ density detected in ${profile.era} layer. Stability confirmed.`;

    // Custom log entry manually to avoid circular dependency if needed
    const logContainer = document.getElementById('interaction-log');
    if (logContainer) {
        const entry = document.createElement('div');
        entry.className = 'log-entry system';
        entry.textContent = `[SCAN] ${summary}`;
        logContainer.prepend(entry);
    }
}

// Automatically log a report on module load for flavor
logDetailedReport();
