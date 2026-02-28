/**
 * input-handler.js
 * Captures user interaction and populates the writing area.
 * 
 * This module listens for keyboard events, transforms raw input 
 * into individual character spans, and registers them with the 
 * TimerSystem for lifecycle tracking.
 */

class InputHandler {
    constructor() {
        /**
         * The contenteditable element
         * @type {HTMLElement|null}
         */
        this.target = null;

        /**
         * Flag to prevent recursive input events
         * @type {boolean}
         */
        this.isProcessing = false;
    }

    /**
     * Attaches event listeners to the editor.
     * @param {string} selector - CSS selector for the writing area.
     */
    init(selector) {
        this.target = document.querySelector(selector);

        if (!this.target) {
            console.error("InputHandler: Writing area not found.");
            return;
        }

        this.setupEventListeners();
        this.focus();
    }

    /**
     * Wire up the necessary listeners for writing and behavior.
     */
    setupEventListeners() {
        // We use 'beforeinput' or 'input' to intercept text
        this.target.addEventListener('keydown', (e) => this.handleKeyDown(e));

        // Handle paste events to ensure modular character wrapping
        this.target.addEventListener('paste', (e) => this.handlePaste(e));

        // Focus management
        this.target.addEventListener('focus', () => uiManager.onEditorFocus());
        this.target.addEventListener('blur', () => uiManager.onEditorBlur());
    }

    /**
     * Intercepts standard keystrokes.
     * @param {KeyboardEvent} event 
     */
    handleKeyDown(event) {
        // Prevent default for standard character keys so we can wrap them
        // This is a simplified approach; a more robust one might use Selections
        if (event.key.length === 1 && !event.ctrlKey && !event.altKey && !event.metaKey) {
            event.preventDefault();
            this.insertCharacter(event.key);
        }

        // Handle Enter key for line breaks
        if (event.key === 'Enter') {
            event.preventDefault();
            this.insertLineBreak();
        }
    }

    /**
     * Creates a span for the character and injects it into the DOM.
     * @param {string} char 
     */
    insertCharacter(char) {
        const span = document.createElement('span');

        // Handle specific character types
        if (char === ' ') {
            span.innerHTML = '&nbsp;';
        } else {
            span.textContent = char;
        }

        // Register with timer system
        timerSystem.register(span);

        // Insert at cursor position
        this.injectAtCursor(span);

        // Notify system of interaction via EventBus
        if (typeof eventBus !== 'undefined') {
            eventBus.emit(EVENTS.CHAR_ADDED, { char: char });
            eventBus.emit(EVENTS.USER_ACTIVITY, { timestamp: Date.now() });
        }

        // Record activity in StateController for state transitions
        if (typeof stateController !== 'undefined') {
            stateController.recordActivity();
        }

        // Record pulse in RhythmAnalyzer (Phase 2)
        if (typeof rhythmAnalyzer !== 'undefined') {
            rhythmAnalyzer.recordPulse();
        }
    }

    /**
     * Inserts a line break element.
     */
    insertLineBreak() {
        const br = document.createElement('br');
        this.injectAtCursor(br);
    }

    /**
     * Helper to insert elements at the current cursor position.
     * @param {Node} node 
     */
    injectAtCursor(node) {
        const selection = window.getSelection();
        if (!selection.rangeCount) return;

        const range = selection.getRangeAt(0);
        range.deleteContents();
        range.insertNode(node);

        // Move cursor after the new node
        range.setStartAfter(node);
        range.setEndAfter(node);
        selection.removeAllRanges();
        selection.addRange(range);

        // Ensure the editor stays scrolled to bottom if needed
        this.target.scrollTop = this.target.scrollHeight;
    }

    /**
     * Ensure paste content is also wrapped (minimal implementation).
     * @param {ClipboardEvent} event 
     */
    handlePaste(event) {
        event.preventDefault();
        const text = (event.clipboardData || window.clipboardData).getData('text');

        for (const char of text) {
            if (char === '\n') {
                this.insertLineBreak();
            } else {
                this.insertCharacter(char);
            }
        }
    }

    /**
     * Forces focus on the writing area.
     */
    focus() {
        if (this.target) this.target.focus();
    }
}

// Global instance
const inputHandler = new InputHandler();
