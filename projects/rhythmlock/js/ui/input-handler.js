/**
 * RhythmLock - Input Handler
 * --------------------------
 * Bridges DOM input events with the KeystrokeTracker.
 */

export class InputHandler {
    constructor(tracker, onAttemptComplete, onTypingStart) {
        this.tracker = tracker;
        this.input = document.getElementById('password-input');
        this.onAttemptComplete = onAttemptComplete;
        this.onTypingStart = onTypingStart;

        this.input.addEventListener('keydown', this.handleKeyDown.bind(this));
        this.input.addEventListener('keyup', this.handleKeyUp.bind(this));
        this.input.addEventListener('blur', () => this.reset()); // Reset if user leaves

        this.typingTimer = null;
        this.isTyping = false;

        // Time to wait after last keystroke to consider the attempt "finished"
        // For a rhythm system, we often rely on the 'Enter' key OR a timeout.
        // Let's use Enter for explicit submission, or a long pause.
        this.typingTimeoutMs = 1500;
    }

    handleKeyDown(e) {
        if (e.key === 'Enter') {
            this.finishAttempt();
            return;
        }

        if (!this.isTyping) {
            this.isTyping = true;
            this.tracker.reset(); // clear old data
            if (this.onTypingStart) this.onTypingStart();
        }

        this.tracker.handleKeyDown(e);
        this.restartTypingTimer();
    }

    handleKeyUp(e) {
        if (e.key === 'Enter') return;
        this.tracker.handleKeyUp(e);
    }

    restartTypingTimer() {
        if (this.typingTimer) clearTimeout(this.typingTimer);
        this.typingTimer = setTimeout(() => {
            // Optional: Auto-submit on timeout? 
            // Usually annoying for passwords. Better to just reset visualizer or hint.
            // For now, we'll require Enter.
        }, this.typingTimeoutMs);
    }

    finishAttempt() {
        if (!this.isTyping) return;

        const text = this.input.value;
        const vector = this.tracker.getBiometricVector();

        if (this.onAttemptComplete) {
            this.onAttemptComplete(text, vector);
        }

        this.isTyping = false;
        this.input.value = ''; // Clear for security
        this.input.blur(); // Remove focus prevents accidental double typing
    }

    reset() {
        this.isTyping = false;
        this.input.value = '';
    }

    focus() {
        this.input.focus();
    }
}
