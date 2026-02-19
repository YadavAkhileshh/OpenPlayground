import { CONFIG, ALIASES } from '../Config/Constants.js';

/**
 * Input System
 * 
 * Handles user input, maps keys to actions, and manages the random
 * control swapping mechanic.
 */
export class InputSystem {
    constructor() {
        this.activeKeys = new Set();
        this.currentMapping = {};
        this.lastSwapTime = 0;

        // Define available keys for mapping
        this.availableKeys = ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Space', 'Shift'];

        // Bind event listeners
        window.addEventListener('keydown', (e) => this.handleKeyDown(e));
        window.addEventListener('keyup', (e) => this.handleKeyUp(e));

        // Initial setup
        this.swapControls();
    }

    /**
     * Handle key down events.
     * @param {KeyboardEvent} e 
     */
    handleKeyDown(e) {
        // Prevent default scrolling for game keys
        if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', ' '].includes(e.key)) {
            e.preventDefault();
        }
        this.activeKeys.add(e.key);
    }

    /**
     * Handle key up events.
     * @param {KeyboardEvent} e 
     */
    handleKeyUp(e) {
        this.activeKeys.delete(e.key);
    }

    /**
     * Randomly swaps the control mappings.
     */
    swapControls() {
        const actions = Object.values(CONFIG.CONTROLS.ACTIONS);
        const keys = [...this.availableKeys];

        // Fisher-Yates shuffle for keys
        for (let i = keys.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [keys[i], keys[j]] = [keys[j], keys[i]];
        }

        // Map shuffled keys to actions
        this.currentMapping = {};
        actions.forEach((action, index) => {
            if (index < keys.length) {
                this.currentMapping[keys[index]] = action;
            }
        });

        this.lastSwapTime = Date.now();
        this.updateUI();

        // Return the new mapping for other systems to use (e.g., UI notification)
        return this.currentMapping;
    }

    /**
     * Get the current action for a pressed key.
     * @param {string} key 
     * @returns {string|null} The action or null if no mapping
     */
    getAction(key) {
        return this.currentMapping[key] || null;
    }

    /**
     * Check if a specific action is currently triggered.
     * @param {string} actionName 
     * @returns {boolean}
     */
    isActionActive(actionName) {
        for (const key of this.activeKeys) {
            if (this.currentMapping[key] === actionName) {
                return true;
            }
        }
        return false;
    }

    /**
     * Update the HTML UI to show current controls.
     */
    updateUI() {
        const display = document.getElementById('controls-display');
        if (!display) return;

        display.innerHTML = '';

        // Create a sorted list of actions for consistent display
        const sortedKeys = Object.keys(this.currentMapping).sort();

        sortedKeys.forEach(key => {
            const action = this.currentMapping[key];
            const div = document.createElement('div');
            div.className = 'control-item';

            // Format key name for display
            let keyName = key;
            if (ALIASES[key]) keyName = ALIASES[key];
            if (key === ' ') keyName = 'Space';

            div.innerHTML = `
                <span class="key-badge">${keyName}</span>
                <span class="action-label">${action}</span>
            `;
            display.appendChild(div);
        });

        // Trigger visual effect on UI
        const container = document.getElementById('game-container');
        if (container) {
            container.style.boxShadow = `0 0 40px ${CONFIG.COLORS.SECONDARY}`;
            setTimeout(() => {
                container.style.boxShadow = `0 0 20px ${CONFIG.COLORS.PRIMARY}`;
            }, 500);
        }
    }

    /**
     * Update loop to check for swap timing.
     * @param {number} timestamp 
     */
    update(timestamp) {
        const timeSinceSwap = timestamp - this.lastSwapTime;

        // Update timer UI
        const timerElement = document.getElementById('swap-timer');
        if (timerElement) {
            const timeLeft = Math.max(0, Math.ceil((CONFIG.CONTROLS.SWAP_INTERVAL - timeSinceSwap) / 1000));
            timerElement.textContent = timeLeft;

            // Visual warning when close to swap
            if (timeSinceSwap > CONFIG.CONTROLS.SWAP_INTERVAL - CONFIG.CONTROLS.WARNING_TIME) {
                timerElement.style.color = CONFIG.COLORS.DANGER;
                if (Math.floor(timestamp / 200) % 2 === 0) {
                    timerElement.style.opacity = '0.5';
                } else {
                    timerElement.style.opacity = '1';
                }
            } else {
                timerElement.style.color = CONFIG.COLORS.ACCENT;
                timerElement.style.opacity = '1';
            }
        }

        if (timeSinceSwap >= CONFIG.CONTROLS.SWAP_INTERVAL) {
            this.swapControls();
        }
    }
}
