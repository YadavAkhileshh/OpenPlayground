/**
 * @file menu.js
 * @description Handles the high-level UI transitions and terminal-style 
 * interactions for the main control window.
 * 
 * This module manages the visual state of the "Terminal" - the main
 * window where the user initiates the game session.
 */

const PongMenu = (function () {
    /**
     * Internal state for the UI manager.
     */
    const uiState = {
        booted: false,
        activePanel: 'setup',
        glitchActive: false
    };

    /**
     * Helper to show/hide panels with a simple transition.
     * @param {string} panelId - 'setup' or 'game'
     */
    function transitionTo(panelId) {
        const setup = document.getElementById('setup-controls');
        const game = document.getElementById('game-controls');
        const status = document.getElementById('status-msg');

        if (panelId === 'game') {
            setup.style.display = 'none';
            game.style.display = 'block';
            status.innerText = "SYSTEM BOUND - AWAITING START COMMAND";
        } else {
            setup.style.display = 'block';
            game.style.display = 'none';
            status.innerText = "SYSTEM STANDBY";
        }

        uiState.activePanel = panelId;
        console.log(`[Menu] Transistioned to ${panelId} panel.`);
    }

    return {
        /**
         * Simulates a "boot up" sequence for the arcade feel.
         */
        boot: async function () {
            if (uiState.booted) return;

            const status = document.getElementById('status-msg');
            const messages = [
                "INITIALIZING KERNEL...",
                "LOADING GRAPHICS DRIVER [ARCADE_v1.0.4]...",
                "ESTABLISHING BROADCAST CHANNEL...",
                "PONG ENGINE STARTED.",
                "USER AUTHORIZED. AWAITING INPUT."
            ];

            for (const msg of messages) {
                status.innerText = msg;
                await new Promise(r => setTimeout(r, 600));
            }

            uiState.booted = true;
            PongLogger.info("Boot sequence complete.");
        },

        showGameControls: function () {
            transitionTo('game');
        },

        resetUI: function () {
            transitionTo('setup');
        },

        /**
         * Triggers a momentary glitch effect on the body for visual feedback.
         */
        triggerGlitch: function () {
            if (uiState.glitchActive) return;
            uiState.glitchActive = true;
            document.body.classList.add('glitch-active');

            setTimeout(() => {
                document.body.classList.remove('glitch-active');
                uiState.glitchActive = false;
            }, 500);
        }
    };
})();
