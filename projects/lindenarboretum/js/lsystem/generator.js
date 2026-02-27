/**
 * LindenArboretum - L-System Generator Module
 * Actually executes the string rewriting iteratively.
 * Uses StringBuilder for high performance.
 * 
 * =========================================================================
 * STRING REWRITING THEORY:
 * 
 * L-Systems (Lindenmayer Systems) were conceived by Aristid Lindenmayer 
 * in 1968 to model the growth processes of plants. They are a type of 
 * formal grammar consisting of:
 * 
 * V (Variables): Symbols that can be replaced (e.g., F, X)
 * S (Constants): Symbols that don't get replaced (e.g., +, -, [, ])
 * w (Axiom): The starting state of the system
 * P (Production Rules): Rules mapping a predecessor to successors
 * 
 * The system works by starting with the axiom, and simultaneously replacing
 * all instances of predecessors with their successors in parallel.
 * This happens over a series of "iterations" or "depths".
 * 
 * For example, Algae:
 * Variables: A, B
 * Axiom: A
 * Rules: (A -> AB), (B -> A)
 * 
 * n=0: A
 * n=1: AB
 * n=2: ABA
 * n=3: ABAAB
 * n=4: ABAABABA
 * 
 * Notice that the length of the string grows according to the Fibonacci sequence.
 * In more complex botanical trees with multiple branching successors 
 * (like F -> FF+[+F-F-F]-[-F+F+F]), the string length can grow exponentially:
 * O(k^n) where k is the average length of the successor strings, and n is depth.
 * 
 * Therefore, strings can easily reach tens of millions of characters by depth 7.
 * Standard JavaScript string concatenation (`str += newChunk`) involves massive
 * memory re-allocation under the hood and causes extreme Garbage Collection stalls.
 * 
 * This module uses a custom `StringBuilder` array-join strategy which creates
 * significantly fewer garbage objects and runs exponentially faster in V8.
 * =========================================================================
 */

import { StringBuilder } from './stringBuilder.js';

export const lsystemGenerator = {
    /**
     * Generates the final L-System string given an axiom and rules over N iterations.
     * Handles recursive string explosion seamlessly.
     * 
     * @param {string} axiom - The starting seed.
     * @param {import('./rule.js').Rule[]} rules - The array of production rules.
     * @param {number} iterations - How many times to execute the replacements.
     * @returns {string} The deeply nested generated string.
     */
    generate(axiom, rules, iterations) {
        if (iterations === 0) return axiom;

        let currentString = axiom;

        // Start with a small buffer, the StringBuilder handles automatic scaling.
        // Sizing it aggressively initially prevents early reallocations.
        const sb = new StringBuilder(axiom.length * 5);

        // For fully deterministic generation, substitute this with the Mulberry32
        // instance from Randomizer. For now, Math.random works for basic usage.
        const seedRand = Math.random;

        // Main iteration loop representing time/growth
        for (let n = 0; n < iterations; n++) {
            // Clear the buffer to reuse the massive allocated memory block
            // rather than instantiating arrays repeatedly.
            sb.clear();
            const len = currentString.length;

            // Character replacement loop. In L-Systems, ALL rules are applied 
            // simultaneously. We simulate this by reading from currentString
            // and exclusively writing to the stringBuilder.
            for (let i = 0; i < len; i++) {
                const char = currentString[i];
                let matched = false;

                // Find matching rule. Since rule arrays are usually small (< 5),
                // linear search is perfectly fine.
                for (let j = 0; j < rules.length; j++) {
                    if (rules[j].predecessor === char) {
                        // getSuccessor parses stochastic probabilities if present
                        const replacement = rules[j].getSuccessor(seedRand());
                        sb.append(replacement);
                        matched = true;
                        break; // Important: only one rule can apply per character
                    }
                }

                // If no rule matches (Constants like '[' or ']'), keep the character
                if (!matched) {
                    sb.appendChar(char);
                }
            }

            // Finalize the iteration
            // This .join() call is the only place native strings are built in bulk.
            currentString = sb.build();
        }

        return currentString;
    }
};
