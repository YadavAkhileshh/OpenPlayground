// ============================================
// FadeCanvas - Interaction Tracker
// Monitors user activity and modulates decay rates
// ============================================

class InteractionTracker {
    constructor(canvas, decaySystem) {
        this.canvas = canvas;
        this.decaySystem = decaySystem;

        // Activity tracking
        this.lastInteractionTime = Date.now();
        this.inactivityThreshold = 3000; // 3 seconds
        this.isInactive = false;

        // Inactivity multiplier settings
        this.minMultiplier = 1.0;
        this.maxMultiplier = 5.0;
        this.multiplierIncreaseRate = 0.5; // Per second of inactivity

        // Recovery settings
        this.recoveryRadius = 100; // Pixels
        this.recoveryAmount = 0.05;

        // UI elements
        this.inactivityIndicator = document.getElementById('inactivityIndicator');
        this.inactivityTimeDisplay = document.getElementById('inactivityTime');
        this.decayRateDisplay = document.getElementById('decayRate');

        this.bindEvents();
        this.startTracking();
    }

    bindEvents() {
        // Track all interaction events
        const interactionEvents = [
            'mousedown', 'mousemove', 'mouseup',
            'touchstart', 'touchmove', 'touchend',
            'keydown'
        ];

        interactionEvents.forEach(eventType => {
            this.canvas.addEventListener(eventType, () => this.recordInteraction());
        });

        // Listen to stroke events for recovery
        this.canvas.addEventListener('strokeStart', (e) => {
            this.applyRecoveryToNearbyStrokes(e.detail);
        });

        this.canvas.addEventListener('strokeMove', (e) => {
            this.applyRecoveryToNearbyStrokes(e.detail);
        });
    }

    recordInteraction() {
        this.lastInteractionTime = Date.now();

        // Reset inactivity state
        if (this.isInactive) {
            this.isInactive = false;
            this.updateInactivityUI(false);
        }

        // Reset multiplier to minimum
        this.decaySystem.setInactivityMultiplier(this.minMultiplier);
    }

    startTracking() {
        // Update tracking every 100ms
        setInterval(() => this.update(), 100);
    }

    update() {
        const currentTime = Date.now();
        const timeSinceInteraction = currentTime - this.lastInteractionTime;

        // Check if user is inactive
        if (timeSinceInteraction > this.inactivityThreshold) {
            if (!this.isInactive) {
                this.isInactive = true;
                this.updateInactivityUI(true);
            }

            // Calculate inactivity multiplier
            const inactivitySeconds = timeSinceInteraction / 1000;
            const multiplier = Math.min(
                this.maxMultiplier,
                this.minMultiplier + (inactivitySeconds - 3) * this.multiplierIncreaseRate
            );

            this.decaySystem.setInactivityMultiplier(multiplier);
        }

        // Update UI displays
        this.updateStatsDisplay(timeSinceInteraction);
    }

    updateInactivityUI(isInactive) {
        if (this.inactivityIndicator) {
            if (isInactive) {
                this.inactivityIndicator.classList.add('active');
            } else {
                this.inactivityIndicator.classList.remove('active');
            }
        }
    }

    updateStatsDisplay(timeSinceInteraction) {
        // Update inactivity time
        if (this.inactivityTimeDisplay) {
            const seconds = Math.floor(timeSinceInteraction / 1000);
            this.inactivityTimeDisplay.textContent = `${seconds}s`;
        }

        // Update decay rate
        if (this.decayRateDisplay) {
            const rate = this.decaySystem.getCurrentDecayRate();
            this.decayRateDisplay.textContent = `${rate.toFixed(1)}x`;
        }
    }

    applyRecoveryToNearbyStrokes(currentStroke) {
        if (!currentStroke || !currentStroke.points || currentStroke.points.length === 0) {
            return;
        }

        const drawingEngine = this.decaySystem.drawingEngine;
        const strokes = drawingEngine.getStrokes();

        // Get current drawing position
        const currentPoint = currentStroke.points[currentStroke.points.length - 1];

        // Find nearby strokes and apply recovery
        strokes.forEach(stroke => {
            if (stroke.id === currentStroke.id) return; // Skip current stroke

            // Check if any point in the stroke is within recovery radius
            const hasNearbyPoint = stroke.points.some(point => {
                const distance = this.getDistance(currentPoint, point);
                return distance < this.recoveryRadius;
            });

            if (hasNearbyPoint) {
                this.decaySystem.applyRecovery(stroke.id, this.recoveryAmount);
            }
        });
    }

    getDistance(p1, p2) {
        const dx = p2.x - p1.x;
        const dy = p2.y - p1.y;
        return Math.sqrt(dx * dx + dy * dy);
    }

    getInactivityTime() {
        return Date.now() - this.lastInteractionTime;
    }

    isUserInactive() {
        return this.isInactive;
    }

    setInactivityThreshold(threshold) {
        this.inactivityThreshold = Math.max(1000, threshold);
    }

    setRecoveryRadius(radius) {
        this.recoveryRadius = Math.max(10, Math.min(200, radius));
    }

    setRecoveryAmount(amount) {
        this.recoveryAmount = Math.max(0.01, Math.min(0.2, amount));
    }

    reset() {
        this.lastInteractionTime = Date.now();
        this.isInactive = false;
        this.updateInactivityUI(false);
        this.decaySystem.setInactivityMultiplier(this.minMultiplier);
    }
}

// Export for use in main.js
if (typeof module !== 'undefined' && module.exports) {
    module.exports = InteractionTracker;
}
