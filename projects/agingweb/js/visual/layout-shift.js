/**
 * layout-shift.js
 * Applies random transform matrices to major layout blocks to simulate structural failure.
 */

export class LayoutShifter {
    constructor() {
        // Elements to potentially disturb
        this.targets = Array.from(document.querySelectorAll('h1, h2, p, .card, .metric'));
        this.shiftMap = new Map(); // Stores current shift state for smooth interpolation
    }

    update(chaosLevel) {
        // Minimal threshold
        if (chaosLevel < 0.2) return;

        // Select a random subset of elements to shift based on chaos
        const shiftChance = chaosLevel * 0.05; // 5% chance per frame to change target? No, too jittery.
        // Better: We update the transforms slowly.

        this.targets.forEach(el => {
            // Retrieve or initialize state
            let state = this.shiftMap.get(el);
            if (!state) {
                state = { x: 0, y: 0, r: 0, scale: 1, targetX: 0, targetY: 0, targetR: 0 };
                this.shiftMap.set(el, state);
            }

            // Occasionally pick a new target position
            if (Math.random() < 0.01) {
                // The max displacement depends on chaos
                const range = chaosLevel * 20; // max 20px
                const rotRange = chaosLevel * 5; // max 5deg

                state.targetX = (Math.random() - 0.5) * range;
                state.targetY = (Math.random() - 0.5) * range;
                state.targetR = (Math.random() - 0.5) * rotRange;
            }

            // Interpolate (Lerp) towards target
            state.x += (state.targetX - state.x) * 0.05;
            state.y += (state.targetY - state.y) * 0.05;
            state.r += (state.targetR - state.r) * 0.05;

            // Apply style
            // We use inline styles which is efficient enough for ~50 elements
            if (Math.abs(state.x) > 0.1 || Math.abs(state.r) > 0.1) {
                el.style.transform = `translate(${state.x}px, ${state.y}px) rotate(${state.r}deg)`;
            }
        });
    }
}
