/**
 * @file state.js
 * @description Manages the logical game state, scoring system, and round flow.
 * 
 * CORE STATE VARIABLES:
 * - scoreP1: Hits by Player 1 that went past Player 2.
 * - scoreP2: Hits by Player 2 that went past Player 1.
 * - phase: The current game operation (SETUP, PLAYING, ROUND_OVER, GAME_OVER).
 * 
 * PERSISTENCE:
 * This state exists in the memory of the main terminal window only. 
 * Clients (paddles/ball) are stateless views.
 */

const PongState = (function () {
    /**
     * Initial configuration and default state.
     */
    const initialState = {
        scoreP1: 0,
        scoreP2: 0,
        winScore: 5,
        phase: 'SETUP',
        connectedPaddles: new Set(),
        roundNumber: 0
    };

    /**
     * The active state object.
     */
    const state = { ...initialState };

    return {
        /**
         * Increments the score for a player and checks for victory.
         * @param {number} player - 1 or 2
         * @returns {object} The updated score object.
         */
        updateScore: function (player) {
            if (player === 1) {
                state.scoreP1++;
            } else if (player === 2) {
                state.scoreP2++;
            }

            state.roundNumber++;
            return {
                p1: state.scoreP1,
                p2: state.scoreP2,
                total: state.roundNumber
            };
        },

        /**
         * Switches the game phase.
         * @param {string} p - The new phase identifier.
         */
        setPhase: function (p) {
            console.log(`[State] Phase transition: ${state.phase} -> ${p}`);
            state.phase = p;
        },

        /**
         * Returns the current game phase.
         */
        getPhase: () => state.phase,

        /**
         * Records a paddle window connection.
         * @param {string} side - '1' or '2'
         * @returns {number} The total count of active paddles.
         */
        addPaddle: function (side) {
            state.connectedPaddles.add(side);
            return state.connectedPaddles.size;
        },

        /**
         * Resets the game to the initial state.
         */
        reset: function () {
            state.scoreP1 = initialState.scoreP1;
            state.scoreP2 = initialState.scoreP2;
            state.phase = initialState.phase;
            state.roundNumber = initialState.roundNumber;
            // Note: We don't reset connectedPaddles as they persist across rounds
            console.log("[State] Game scores reset.");
        },

        /**
         * Reads the current competitive status.
         */
        getScores: () => ({ p1: state.scoreP1, p2: state.scoreP2 }),

        /**
         * Evaluates if a victory condition has been met.
         */
        checkVictory: function () {
            if (state.scoreP1 >= state.winScore) return 1;
            if (state.scoreP2 >= state.winScore) return 2;
            return null;
        }
    };
})();
