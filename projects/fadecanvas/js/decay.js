// ============================================
// FadeCanvas - Decay System
// Time-based deterioration algorithms and effects
// ============================================

class DecaySystem {
    constructor(drawingEngine) {
        this.drawingEngine = drawingEngine;
        this.decayMode = 'fade';
        this.baseDecayRate = 0.00015; // Base decay per millisecond
        this.decaySpeedMultiplier = 1.0;
        this.inactivityMultiplier = 1.0;
        this.isPaused = false;

        // Decay thresholds
        this.fadeThreshold = 0.05; // Remove strokes below this opacity
        this.maxBlur = 10; // Maximum blur radius
        this.maxDistortion = 20; // Maximum distortion offset

        // Fragment settings
        this.fragmentCount = 8;
        this.fragmentSpread = 30;

        // Performance
        this.lastDecayUpdate = Date.now();
        this.decayInterval = 16; // ~60fps
    }

    update(currentTime) {
        if (this.isPaused) return;

        // Throttle updates for performance
        if (currentTime - this.lastDecayUpdate < this.decayInterval) return;
        this.lastDecayUpdate = currentTime;

        const strokes = this.drawingEngine.getStrokes();
        const strokesToRemove = [];

        strokes.forEach(stroke => {
            const age = currentTime - stroke.timestamp;
            const decayAmount = this.calculateDecayAmount(age);

            // Apply decay based on mode
            switch (this.decayMode) {
                case 'fade':
                    this.applyFadeDecay(stroke, decayAmount);
                    break;
                case 'blur':
                    this.applyBlurDecay(stroke, decayAmount);
                    break;
                case 'fragment':
                    this.applyFragmentDecay(stroke, decayAmount);
                    break;
                case 'distort':
                    this.applyDistortDecay(stroke, decayAmount);
                    break;
            }

            // Mark for removal if fully decayed
            if (this.isFullyDecayed(stroke)) {
                strokesToRemove.push(stroke.id);
            }
        });

        // Remove fully decayed strokes
        strokesToRemove.forEach(id => {
            this.drawingEngine.removeStroke(id);
        });

        // Redraw if any decay occurred
        if (strokes.length > 0) {
            this.drawingEngine.redrawAll();
        }

        // Dispatch event if strokes were removed
        if (strokesToRemove.length > 0) {
            const event = new CustomEvent('strokesDecayed', {
                detail: { count: strokesToRemove.length }
            });
            this.drawingEngine.canvas.dispatchEvent(event);
        }
    }

    calculateDecayAmount(age) {
        return age * this.baseDecayRate * this.decaySpeedMultiplier * this.inactivityMultiplier;
    }

    applyFadeDecay(stroke, decayAmount) {
        // Gradual opacity reduction
        stroke.opacity = Math.max(0, 1 - decayAmount);
    }

    applyBlurDecay(stroke, decayAmount) {
        // Progressive blur increase
        stroke.blur = Math.min(this.maxBlur, decayAmount * 10);

        // Also fade slightly
        stroke.opacity = Math.max(0.3, 1 - decayAmount * 0.5);
    }

    applyFragmentDecay(stroke, decayAmount) {
        // Create fragments if not already created
        if (stroke.fragments.length === 0 && decayAmount > 0.3) {
            this.createFragments(stroke);
        }

        // Update fragment positions and opacity
        if (stroke.fragments.length > 0) {
            stroke.fragments.forEach(fragment => {
                // Move fragments outward
                fragment.x += fragment.vx * 0.5;
                fragment.y += fragment.vy * 0.5;

                // Fade fragments
                fragment.opacity = Math.max(0, 1 - decayAmount);
            });

            // Fade original stroke
            stroke.opacity = Math.max(0, 1 - decayAmount * 1.5);
        }
    }

    applyDistortDecay(stroke, decayAmount) {
        // Apply distortion to stroke points
        if (!stroke.originalPoints) {
            // Store original points on first distortion
            stroke.originalPoints = stroke.points.map(p => ({ ...p }));
        }

        const distortionAmount = Math.min(this.maxDistortion, decayAmount * 50);

        stroke.points = stroke.originalPoints.map((point, index) => {
            // Use pseudo-random offset based on point index and time
            const offsetX = Math.sin(index * 0.5 + decayAmount * 2) * distortionAmount;
            const offsetY = Math.cos(index * 0.5 + decayAmount * 2) * distortionAmount;

            return {
                x: point.x + offsetX,
                y: point.y + offsetY
            };
        });

        // Also fade slightly
        stroke.opacity = Math.max(0.4, 1 - decayAmount * 0.3);
    }

    createFragments(stroke) {
        // Sample points from the stroke to create fragments
        const sampleRate = Math.max(1, Math.floor(stroke.points.length / this.fragmentCount));

        for (let i = 0; i < stroke.points.length; i += sampleRate) {
            const point = stroke.points[i];

            // Random direction for fragment movement
            const angle = Math.random() * Math.PI * 2;
            const speed = 0.5 + Math.random() * 1.5;

            stroke.fragments.push({
                x: point.x,
                y: point.y,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed,
                size: stroke.size * 0.3,
                opacity: 1.0
            });
        }
    }

    isFullyDecayed(stroke) {
        // Check if stroke should be removed
        if (stroke.opacity <= this.fadeThreshold) {
            return true;
        }

        // For fragment mode, check if all fragments are faded
        if (this.decayMode === 'fragment' && stroke.fragments.length > 0) {
            const allFragmentsFaded = stroke.fragments.every(f => f.opacity <= this.fadeThreshold);
            return allFragmentsFaded && stroke.opacity <= this.fadeThreshold;
        }

        return false;
    }

    setDecayMode(mode) {
        const validModes = ['fade', 'blur', 'fragment', 'distort'];
        if (validModes.includes(mode)) {
            this.decayMode = mode;

            // Reset stroke effects when changing modes
            const strokes = this.drawingEngine.getStrokes();
            const currentTime = Date.now();

            strokes.forEach(stroke => {
                // Reset visual effects
                stroke.opacity = 1.0;
                stroke.blur = 0;
                stroke.fragments = [];

                // Restore original points if distorted
                if (stroke.originalPoints) {
                    stroke.points = stroke.originalPoints.map(p => ({ ...p }));
                    delete stroke.originalPoints;
                }

                // Reset timestamp to give strokes fresh start in new mode
                stroke.timestamp = currentTime;
            });

            this.drawingEngine.redrawAll();
        }
    }

    setDecaySpeed(speed) {
        this.decaySpeedMultiplier = Math.max(0.1, Math.min(3.0, speed));
    }

    setInactivityMultiplier(multiplier) {
        this.inactivityMultiplier = Math.max(1.0, Math.min(5.0, multiplier));
    }

    togglePause() {
        this.isPaused = !this.isPaused;
        return this.isPaused;
    }

    setPaused(paused) {
        this.isPaused = paused;
    }

    getDecayMode() {
        return this.decayMode;
    }

    getDecaySpeed() {
        return this.decaySpeedMultiplier;
    }

    isPausedState() {
        return this.isPaused;
    }

    getCurrentDecayRate() {
        return this.decaySpeedMultiplier * this.inactivityMultiplier;
    }

    applyRecovery(strokeId, recoveryAmount) {
        const strokes = this.drawingEngine.getStrokes();
        const stroke = strokes.find(s => s.id === strokeId);

        if (stroke) {
            // Restore opacity slightly
            stroke.opacity = Math.min(1.0, stroke.opacity + recoveryAmount);

            // Reduce blur
            if (stroke.blur > 0) {
                stroke.blur = Math.max(0, stroke.blur - recoveryAmount * 5);
            }

            // Restore distorted points
            if (stroke.originalPoints && this.decayMode === 'distort') {
                const restoreAmount = recoveryAmount * 0.5;
                stroke.points = stroke.points.map((point, index) => {
                    const original = stroke.originalPoints[index];
                    return {
                        x: point.x + (original.x - point.x) * restoreAmount,
                        y: point.y + (original.y - point.y) * restoreAmount
                    };
                });
            }
        }
    }
}

// Export for use in main.js
if (typeof module !== 'undefined' && module.exports) {
    module.exports = DecaySystem;
}
