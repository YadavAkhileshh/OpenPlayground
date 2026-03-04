/**
 * ui-manager.js
 * Controls the visual state and feedback of the DecayDiary interface.
 * 
 * Manages counters, status indicators, and subtle visual transitions
 * based on application activity and engine updates.
 */

class UIManager {
    constructor() {
        // Cache DOM elements
        this.charCountEl = null;
        this.statusIndicator = null;
        this.writingArea = null;

        // Activity tracking for visual effects
        this.isUserWriting = false;
        this.activityTimeout = null;
    }

    /**
     * Initializes the UI references and states.
     */
    init() {
        this.charCountEl = document.querySelector(CONFIG.SELECTORS.CHAR_COUNT_DISPLAY);
        this.statusIndicator = document.querySelector(CONFIG.SELECTORS.STATUS_INDICATOR);
        this.writingArea = document.querySelector(CONFIG.SELECTORS.WRITING_AREA);

        this.setupSubscriptions();
        console.log("UIManager: Initialized visual state.");
    }

    /**
     * Wire up listeners to the EventBus.
     */
    setupSubscriptions() {
        if (typeof eventBus === 'undefined') return;

        eventBus.on(EVENTS.USER_ACTIVITY, () => this.onActivity());
        eventBus.on(EVENTS.CHAR_EXPIRED, (data) => this.onDecayEvent(data));
        eventBus.on('state:change', (data) => this.handleStateChange(data));
    }

    /**
     * Responds to system state transitions.
     * @param {Object} data 
     */
    handleStateChange(data) {
        const { state } = data;

        // Update status indicator color based on state
        switch (state) {
            case 'WRITING':
                this.statusIndicator.style.backgroundColor = 'var(--color-accent)';
                break;
            case 'IDLE':
                this.statusIndicator.style.backgroundColor = 'var(--color-text-dim)';
                break;
            case 'DECAYING':
                this.statusIndicator.style.backgroundColor = 'var(--color-danger)';
                break;
            default:
                this.statusIndicator.style.backgroundColor = 'var(--color-text-dim)';
        }
    }

    /**
     * Updates the character count display.
     * @param {number} count 
     */
    updateStats(count) {
        if (this.charCountEl) {
            this.charCountEl.textContent = count.toLocaleString();
        }

        // Toggle activity pulse based on whether characters exist
        if (count > 0) {
            this.statusIndicator.classList.add('active');
        } else {
            this.statusIndicator.classList.remove('active');
        }
    }

    /**
     * Triggered when a character is expired and removed.
     */
    onDecayEvent() {
        // Potential for subtle sound effect or visual ripple
    }

    /**
     * Triggered on every keystroke.
     */
    onActivity() {
        this.isUserWriting = true;
        this.statusIndicator.style.opacity = '1';

        // Reset activity cooldown
        clearTimeout(this.activityTimeout);
        this.activityTimeout = setTimeout(() => {
            this.isUserWriting = false;
            this.statusIndicator.style.opacity = '0.5';
        }, 3000);
    }

    /**
     * Visual response to focus.
     */
    onEditorFocus() {
        this.statusIndicator.style.backgroundColor = 'var(--color-accent)';
        this.statusIndicator.style.boxShadow = '0 0 10px var(--color-accent)';
    }

    /**
     * Visual response to blur.
     */
    onEditorBlur() {
        this.statusIndicator.style.backgroundColor = 'var(--color-text-dim)';
        this.statusIndicator.style.boxShadow = 'none';
    }

    /**
     * Displays a system notification or ephemeral message (optional).
     * @param {string} msg 
     */
    notify(msg) {
        console.log(`[DecayDiary] ${msg}`);
    }
}

// Global instance
const uiManager = new UIManager();
