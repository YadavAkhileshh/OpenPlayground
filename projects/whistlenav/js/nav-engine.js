/**
 * NAVIGATION ENGINE
 * Translates pitch frequencies into navigation commands.
 */

class NavEngine {
    constructor() {
        this.currentIndex = 0;
        this.numItems = 5;
        this.lastTriggerTime = 0;
        this.triggerCooldown = 600; // ms

        // Calibration
        this.lowRange = [600, 1100];  // Hz for LEFT
        this.highRange = [1400, 2200]; // Hz for RIGHT

        // Sustain Logic
        this.sustainThreshold = 1200; // ms to trigger sustain
        this.sustainStart = 0;
        this.currentSustainedZone = null;
        this.isSustainedTriggered = false;

        this.onMove = null; // Callback for when a move occurs
        this.onSustain = null; // Callback for sustained pitch
    }

    processPitch(pitch) {
        const now = Date.now();

        let targetZone = null;
        if (pitch > this.lowRange[0] && pitch < this.lowRange[1]) targetZone = 'LOW';
        if (pitch > this.highRange[0] && pitch < this.highRange[1]) targetZone = 'HIGH';

        // Handle Sustain
        if (targetZone && targetZone === this.currentSustainedZone) {
            if (!this.isSustainedTriggered && (now - this.sustainStart > this.sustainThreshold)) {
                this.isSustainedTriggered = true;
                if (this.onSustain) this.onSustain(targetZone);
            }
        } else {
            this.currentSustainedZone = targetZone;
            this.sustainStart = now;
            this.isSustainedTriggered = false;
        }

        // Handle Movement (standard cooldown)
        if (now - this.lastTriggerTime < this.triggerCooldown) return;

        if (targetZone === 'LOW') {
            this.moveLeft();
            this.lastTriggerTime = now;
        } else if (targetZone === 'HIGH') {
            this.moveRight();
            this.lastTriggerTime = now;
        }
    }

    setRanges(low, high) {
        this.lowRange = low;
        this.highRange = high;
    }

    moveLeft() {
        if (this.currentIndex > 0) {
            this.currentIndex--;
            this.notify();
        }
    }

    moveRight() {
        if (this.currentIndex < this.numItems - 1) {
            this.currentIndex++;
            this.notify();
        }
    }

    notify() {
        if (this.onMove) {
            this.onMove(this.currentIndex);
        }
    }

    setIndex(index) {
        this.currentIndex = Math.max(0, Math.min(index, this.numItems - 1));
        this.notify();
    }
}

window.NavEngine = NavEngine;
