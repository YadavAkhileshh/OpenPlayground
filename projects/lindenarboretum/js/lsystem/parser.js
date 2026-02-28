/**
 * LindenArboretum - L-System Parser Module
 * Responsible for parsing raw text strings into structured Rule objects.
 * Handles the `A -> B` format from the UI editor.
 */

import { Rule } from './rule.js';
import { lsystemValidator } from './validator.js';

export const lsystemParser = {
    /**
     * Parses a rule string into an array of Rule objects.
     * @param {string} rulesText - Multiline string of rules
     * @returns {Rule[]} Array of Rule objects
     */
    parseRules(rulesText) {
        const lines = rulesText.split('\n');
        const parsedRules = [];

        for (let i = 0; i < lines.length; i++) {
            let line = lines[i].trim();

            // Ignore comments and empty lines
            if (line.length === 0 || line.startsWith('//') || line.startsWith('#')) {
                continue;
            }

            // Split by commonly used arrows: ->, =>, =, :
            let parts = null;
            if (line.includes('->')) parts = line.split('->');
            else if (line.includes('=>')) parts = line.split('=>');
            else if (line.includes('=')) parts = line.split('=');
            else if (line.includes(':')) parts = line.split(':');

            if (!parts || parts.length < 2) {
                console.warn(`[L-System Parser] Invalid rule format on line ${i + 1}: ${line}`);
                continue;
            }

            const predecessor = parts[0].trim();
            const successor = parts[1].trim();

            // Validate syntax
            if (lsystemValidator.isValidPredecessor(predecessor) &&
                lsystemValidator.isValidSuccessor(successor)) {

                // Support stochastic rules if there are probabilities
                // Format: A -> 0.5:B, 0.5:C (Not fully implemented, assuming 1.0 prob)
                let probability = 1.0;
                let parsedSuccessor = successor;

                // Simple probability extension could go here

                const rule = new Rule(predecessor, parsedSuccessor, probability);
                parsedRules.push(rule);
            } else {
                throw new Error(`Invalid rule syntax: ${line}`);
            }
        }

        return parsedRules;
    },

    /**
     * Parses an axiom to ensure it only contains valid characters.
     * @param {string} axiomText 
     * @returns {string} Cleaned axiom
     */
    parseAxiom(axiomText) {
        let clean = axiomText.trim().replace(/\s+/g, '');
        if (!lsystemValidator.isValidAxiom(clean)) {
            throw new Error(`Invalid axiom: ${axiomText}`);
        }
        return clean;
    }
};
