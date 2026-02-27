/**
 * RhythmLock - Feedback Manager
 * -----------------------------
 * Controls the lock UI state, status messages, and CSS animations.
 */

export class FeedbackManager {
    constructor() {
        this.lockIcon = document.getElementById('lock-icon');
        this.statusText = document.getElementById('status-indicator');
        this.message = document.getElementById('feedback-message');
        this.input = document.getElementById('password-input');

        this.statsPanel = document.getElementById('stats-panel');
        this.scoreVal = document.getElementById('score-val');
        this.devVal = document.getElementById('deviation-val');
    }

    setMode(mode) {
        document.getElementById('current-mode').textContent = mode;
        this.updateStatus(mode === 'ENROLLMENT' ? 'RECORDING PATTERN' : 'SYSTEM SECURE', mode === 'ENROLLMENT' ? 'warning' : 'success');
    }

    updateStatus(text, type = 'normal') {
        this.statusText.textContent = text;
        this.statusText.className = 'status-indicator'; // reset
        if (type === 'error') {
            this.statusText.style.borderColor = 'var(--error-color)';
            this.statusText.style.color = 'var(--error-color)';
            this.statusText.style.background = 'rgba(248, 81, 73, 0.1)';
        } else if (type === 'success') {
            this.statusText.style.borderColor = 'var(--success-color)';
            this.statusText.style.color = 'var(--success-color)';
            this.statusText.style.background = 'rgba(63, 185, 80, 0.1)';
        } else if (type === 'warning') {
            this.statusText.style.borderColor = '#e3b341';
            this.statusText.style.color = '#e3b341';
            this.statusText.style.background = 'rgba(227, 179, 65, 0.1)';
        }
    }

    showMessage(msg) {
        this.message.textContent = msg;
        this.message.style.opacity = '1';

        // Auto-fade after a few seconds if it's a transient message
        // setTimeout(() => { this.message.style.opacity = '0.7'; }, 2000);
    }

    unlock() {
        this.lockIcon.classList.remove('error');
        this.lockIcon.classList.add('unlocked');
        this.updateStatus('ACCESS GRANTED', 'success');
        this.showMessage('Identity Verified.');

        // Flash screen
        const flash = document.createElement('div');
        flash.className = 'flash-success';
        flash.style.position = 'absolute';
        flash.style.top = '0';
        flash.style.left = '0';
        flash.style.width = '100%';
        flash.style.height = '100%';
        flash.style.pointerEvents = 'none';
        document.body.appendChild(flash);

        setTimeout(() => flash.remove(), 500);
    }

    deny() {
        this.lockIcon.classList.remove('unlocked');
        this.lockIcon.classList.add('error');

        // Trigger shake
        this.lockIcon.classList.remove('shake');
        void this.lockIcon.offsetWidth; // trigger reflow
        this.lockIcon.classList.add('shake');

        this.updateStatus('ACCESS DENIED', 'error');
        this.showMessage('Rhythm Mismatch. Try again.');

        // Reset icon after animation
        setTimeout(() => {
            this.lockIcon.classList.remove('error');
        }, 1000);
    }

    reset() {
        this.lockIcon.classList.remove('unlocked', 'error', 'shake');
        this.updateStatus('SYSTEM SECURE', 'success');
        this.showMessage('Awaiting biometric input...');
        this.hideStats();
    }

    showStats(score, deviation) {
        this.statsPanel.classList.remove('hidden');
        this.scoreVal.textContent = score + '%';
        this.devVal.textContent = Math.round(deviation) + 'ms';
    }

    hideStats() {
        this.statsPanel.classList.add('hidden');
    }
}
