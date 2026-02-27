/**
 * js/ui/TimelineRenderer.js
 * Controls the slider logic to step forward and backwards in time
 * and updates the text DOM indicating current progression.
 */

class TimelineRenderer {
    constructor() {
        this.scrubber = document.getElementById('timeline-scrubber');
        this.ticksContainer = document.getElementById('timeline-ticks');
        this.stepText = document.getElementById('current-step');
        this.totalText = document.getElementById('total-steps');

        this.lastMaxSteps = 0;

        // The UIManager hooks into this via its own event listener to sync state changes.
    }

    /**
     * Resets max boundaries for the scrubber when circuit grows.
     * @param {number} maxSteps 
     */
    updateBounds(maxSteps) {
        let needsTickRebuild = (this.lastMaxSteps !== maxSteps);

        this.scrubber.max = maxSteps;
        this.totalText.innerText = maxSteps;
        this.lastMaxSteps = maxSteps;

        if (needsTickRebuild) {
            this._buildTicks(maxSteps);
        }
    }

    /**
     * UI feedback only
     * @param {number} currentStep 
     */
    updateUI(currentStep) {
        this.scrubber.value = currentStep;
        this.stepText.innerText = currentStep;

        // Highlight active tick
        const ticks = this.ticksContainer.children;
        for (let i = 0; i < ticks.length; i++) {
            if (i <= currentStep) {
                ticks[i].classList.add('active');
            } else {
                ticks[i].classList.remove('active');
            }
        }
    }

    _buildTicks(count) {
        this.ticksContainer.innerHTML = '';
        if (count === 0) return;

        // Add ticks for 0 to N
        for (let i = 0; i <= count; i++) {
            let tick = document.createElement('div');
            tick.className = 'tick-mark';
            this.ticksContainer.appendChild(tick);
        }
    }

    /**
     * Hook to attach UIManager callback
     * @param {Function} callback 
     */
    onScrub(callback) {
        this.scrubber.addEventListener('input', (e) => {
            let val = parseInt(e.target.value, 10);
            callback(val);
        });
    }
}

window.TimelineRenderer = TimelineRenderer;
