/**
 * BreathingSpace - UI Controller (Extended)
 * 
 * CORE RESPONSIBILITIES:
 * 1. Interaction Management: Handles mouse, touch, and keyboard events.
 * 2. Visual Orchestration: Navigates panel animations and content reveals.
 * 3. State Synchronization: Bridges the gap between AppState and the DOM.
 * 4. User Feedback: Provides real-time interactive confirmation.
 * 
 * DESIGN PHILOSOPHY:
 * The UI should feel as lightweight as the layout itself. We avoid 
 * heavy frameworks in favor of direct DOM manipulation, using 
 * CSS transitions for all high-level animation work.
 */

const UI = {

    // Internal cache for frequently accessed DOM nodes.
    // This reduces the overhead of constant document lookups.
    elements: {
        container: null,
        mainContent: null,
        settingsPanel: null,
        triggerBtn: null,
        dismissBtn: null,
        resetBtn: null,
        sliders: {
            speed: null,
            depth: null
        },
        indicators: {
            status: null,
            progress: null
        },
        loader: null
    },

    /**
     * Bootstraps the UI layer.
     * Sequence: Cache -> Bind -> Sync -> Reveal.
     */
    init() {
        console.groupCollapsed("UI Initialization Path");

        try {
            this.cacheDOMReferences();
            this.establishEventBindings();
            this.initializeStateSync();
            this.applyInitialAesthetics();

            console.log("UI: DOM Nodes mapped successfully.");
            console.log("UI: Event listeners attached.");
            console.log("UI: State reconciliation complete.");
        } catch (error) {
            Utils.logError("UI-Init", error.message);
        }

        console.groupEnd();
        console.log("%c UI: Interface Ready ", "color: #6366f1; font-weight: bold;");
    },

    /**
     * Map document nodes to the internal elements cache.
     */
    cacheDOMReferences() {
        this.elements.container = document.body;
        this.elements.mainContent = Utils.$('#breathing-content');
        this.elements.settingsPanel = Utils.$('#settings-panel');
        this.elements.triggerBtn = Utils.$('#toggle-settings');
        this.elements.dismissBtn = Utils.$('#close-settings');
        this.elements.resetBtn = Utils.$('#reset-settings');

        // Input Groups
        this.elements.sliders.speed = Utils.$('#speed-range');
        this.elements.sliders.depth = Utils.$('#depth-range');

        // Visual Status
        this.elements.indicators.status = Utils.$('#cycle-state');

        this.elements.loader = Utils.$('#app-loader');

        // Validation Check
        const itemsToVerify = [
            this.elements.mainContent,
            this.elements.settingsPanel,
            this.elements.triggerBtn,
            this.elements.loader
        ];

        if (itemsToVerify.some(v => v === null)) {
            throw new Error("Critical DOM elements missing from index.html.");
        }
    },

    /**
     * Attaches all interactive listeners.
     * Includes support for keyboard shortcuts and accessibility.
     */
    establishEventBindings() {
        const { triggerBtn, dismissBtn, sliders } = this.elements;

        // --- Panel Interaction ---
        triggerBtn.addEventListener('click', (e) => {
            e.stopPropagation(); // Avoid triggering outside-click logic
            this.toggleSettingsVisibility();
        });

        dismissBtn.addEventListener('click', () => {
            this.toggleSettingsVisibility(false);
        });

        // --- Range Input Interaction ---
        // We use 'input' for real-time reactivity, not 'change'.
        sliders.speed.addEventListener('input', (e) => {
            const val = parseFloat(e.target.value);
            state.set('speedMultiplier', val);
        });

        sliders.depth.addEventListener('input', (e) => {
            const val = parseFloat(e.target.value);
            state.set('depthMultiplier', val);
        });

        // --- Resource Management ---
        if (this.elements.resetBtn) {
            this.elements.resetBtn.addEventListener('click', () => this.resetSettings());
        }

        // --- Global Document Listeners ---

        // Click-outside to close settings
        document.addEventListener('click', (event) => {
            const panel = this.elements.settingsPanel;
            const isInside = panel.contains(event.target);
            const isTrigger = this.elements.triggerBtn.contains(event.target);

            if (!isInside && !isTrigger && state.get('settingsVisible')) {
                this.toggleSettingsVisibility(false);
            }
        });

        // Keyboard Shortcuts Manager
        document.addEventListener('keydown', (e) => {
            this.handleKeyboardShortcuts(e);
        });

        // Window Resize Optimization
        // Debounced to prevent layout thrashing during drag.
        window.addEventListener('resize', Utils.debounce(() => {
            console.log("UI: Recalculating spatial constraints on resize.");
            this.recalculateLayoutBounds();
        }, 250));
    },

    /**
     * Central dispatcher for keyboard commands.
     * 
     * @param {KeyboardEvent} e 
     */
    handleKeyboardShortcuts(e) {
        switch (e.key) {
            case 'Escape':
                this.toggleSettingsVisibility(false);
                break;
            case ' ':
                // Prevent scrolling when using Space to pause
                e.preventDefault();
                const currentPause = state.get('isPaused');
                state.set('isPaused', !currentPause);
                this.showVisualHint(currentPause ? "RESUMED" : "PAUSED");
                break;
            case 's':
                // Accessibility: shortcut for settings
                this.toggleSettingsVisibility();
                break;
        }
    },

    /**
     * Subscribes to the AppState to keep UI components in sync.
     */
    initializeStateSync() {
        // Initial value population
        this.elements.sliders.speed.value = state.get('speedMultiplier');
        this.elements.sliders.depth.value = state.get('depthMultiplier');

        // Reactive Subscription
        state.subscribe((property, value) => {
            switch (property) {
                case 'settingsVisible':
                    this.elements.settingsPanel.classList.toggle('hidden', !value);
                    break;
                case 'isPaused':
                    this.updateBlurState(value);
                    break;
            }
        });
    },

    /**
     * Handles the visibility state of the settings drawer.
     * 
     * @param {boolean} force - Optional boolean to force state.
     */
    toggleSettingsVisibility(force) {
        const nextState = force !== undefined ? force : !state.get('settingsVisible');
        state.set('settingsVisible', nextState);
    },

    /**
     * Provides a subtle blur effect when the application is paused.
     * 
     * @param {boolean} isPaused 
     */
    updateBlurState(isPaused) {
        const content = this.elements.mainContent;
        if (isPaused) {
            content.style.filter = 'blur(4px)';
            content.style.opacity = '0.6';
        } else {
            content.style.filter = 'none';
            content.style.opacity = '1';
        }
    },

    /**
     * Displays a temporary overlay hint for keyboard actions.
     * 
     * @param {string} msg 
     */
    showVisualHint(msg) {
        const hint = document.createElement('div');
        hint.textContent = msg;
        hint.className = 'interaction-hint';
        document.body.appendChild(hint);

        setTimeout(() => hint.classList.add('fade-out'), 500);
        setTimeout(() => hint.remove(), 1000);
    },

    /**
     * Triggers the entry animation for the main textual content.
     */
    revealContent() {
        const content = this.elements.mainContent;

        // Initial Hidden State (JS Driven for progressive enhancement)
        content.style.opacity = '0';
        content.style.transform = 'translateY(30px) scale(0.98)';

        // Force Reflow
        void content.offsetHeight;

        // Smooth Inbound Animation
        content.style.transition = 'opacity 3s ease, transform 3s cubic-bezier(0.16, 1, 0.3, 1)';
        content.style.opacity = '1';
        content.style.transform = 'translateY(0) scale(1)';

        // Hide loader after a short delay for smooth transition
        this.dismissLoader();
    },

    /**
     * Dismisses the initial loading overlay with a fade-out effect.
     */
    dismissLoader() {
        if (!this.elements.loader) return;

        this.elements.loader.classList.add('fade-out');
        setTimeout(() => {
            this.elements.loader.style.display = 'none';
        }, 1500);
    },

    /**
     * Resets the application settings to their default values.
     */
    resetSettings() {
        state.set('speedMultiplier', 1.0);
        state.set('depthMultiplier', 1.0);

        // Update UI sliders immediately
        this.elements.sliders.speed.value = 1.0;
        this.elements.sliders.depth.value = 1.0;

        this.showVisualHint("SETTINGS RESET");
    },

    /**
     * Apply default aesthetic styles that are easier to manage in JS.
     */
    applyInitialAesthetics() {
        // Set dynamic viewport heights for mobile stability
        const vh = window.innerHeight * 0.01;
        document.documentElement.style.setProperty('--vh', `${vh}px`);
    },

    /**
     * Recalculate spatial bounds (Invoked on resize).
     */
    recalculateLayoutBounds() {
        // Future-proof: Can adjust CONFIG scalars here based on screen width.
        const width = window.innerWidth;
        if (width < 600) {
            console.log("UI: Mobile mode active.");
        }
    }
};
