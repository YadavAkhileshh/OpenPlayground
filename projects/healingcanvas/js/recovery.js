/**
 * Recovery Management Module - Version 2.0 (Expanded)
 * Advanced restoration logic for digital tissue.
 */

class Recovery {
    /**
     * Initializes the Recovery System.
     * Manages a queue of wounds awaiting restoration.
     */
    constructor() {
        /** @type {Array} queue of pending healing tasks */
        this.healingQueue = [];

        /** @type {Boolean} global state of healing activity */
        this.isActivelyHealing = false;

        this.init();
    }

    /**
     * Binds implementation triggers.
     */
    init() {
        window.addEventListener('surgery-done', (e) => {
            console.log("[RECOVERY] Trauma detected. Scheduling restoration...");
            this.handleNewWound(e.detail);
        });

        // Start processing loop
        this.processingLoop();
    }

    /**
     * Primary loop for background healing maintenance.
     */
    processingLoop() {
        setInterval(() => {
            if (this.healingQueue.length > 0 && !this.isActivelyHealing) {
                // Background maintenance task
                this.isActivelyHealing = true;
                this.processNextInQueue();
            }
        }, 500);
    }

    /**
     * Registers a new wound for healing.
     * 
     * @param {Object} woundData 
     */
    handleNewWound(woundData) {
        this.healingQueue.push(woundData);

        // Immediate visual feedback that healing is pending
        woundData.original.classList.add('restore-pulse');

        // Start healing after configured delay
        setTimeout(() => {
            this.heal(woundData);
        }, CONFIG.RECOVERY.START_DELAY);
    }

    /**
     * Executes the restoration animation.
     * Interpolates fragments back to their original transforms.
     * 
     * @param {Object} wound 
     */
    heal(wound) {
        const { id, frags, original, group } = wound;

        console.log(`[RECOVERY] Initiating heal for ${id}`);

        // Phase 1: Preparation
        frags.forEach(f => {
            f.style.transition = `
                transform ${CONFIG.RECOVERY.HEAL_DURATION}ms cubic-bezier(0.19, 1, 0.22, 1),
                clip-path ${CONFIG.RECOVERY.HEAL_DURATION}ms cubic-bezier(0.19, 1, 0.22, 1),
                box-shadow 0.5s ease
            `;

            // Add a "clamping" glow
            f.style.boxShadow = '0 0 20px rgba(255, 255, 255, 0.2)';
        });

        // Phase 2: Convergence
        requestAnimationFrame(() => {
            frags.forEach(f => {
                f.style.transform = 'translate(0, 0) rotate(0deg)';
                f.style.clipPath = 'polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)';
            });

            // Spawn stitch filaments
            this.spawnStitches(group);
        });

        // Phase 3: Finalization
        setTimeout(() => {
            this.finalize(wound);
        }, CONFIG.RECOVERY.HEAL_DURATION);
    }

    /**
     * Spawns "stitch" entities that pull the fragments together.
     * 
     * @param {HTMLElement} group - The parent container for fragments
     */
    spawnStitches(group) {
        const density = CONFIG.RECOVERY.STITCH_DENSITY;
        const rect = group.getBoundingClientRect();
        const stitchCount = Math.floor(rect.width * density);

        for (let i = 0; i < stitchCount; i++) {
            const stitch = document.createElement('div');
            stitch.className = 'stitch';

            // Randomized positioning for organic feel
            const x = 5 + Math.random() * 90;
            const angle = (Math.random() - 0.5) * 40;
            const length = 15 + Math.random() * 25;

            stitch.style.left = `${x}%`;
            stitch.style.top = '50%';
            stitch.style.width = `${length}px`;
            stitch.style.transform = `translateY(-50%) rotate(${angle}deg)`;

            group.appendChild(stitch);

            // Animated pull sequence
            this.animateStitchCycle(stitch);
        }
    }

    /**
     * Cyclic animation for stitch filaments.
     * 
     * @param {HTMLElement} el 
     */
    animateStitchCycle(el) {
        const duration = 800 + Math.random() * 1000;

        el.animate([
            { transform: el.style.transform + ' scaleX(0.5)', opacity: 0 },
            { transform: el.style.transform + ' scaleX(1.2)', opacity: 1, offset: 0.3 },
            { transform: el.style.transform + ' scaleX(1)', opacity: 0.8, offset: 0.7 },
            { transform: el.style.transform + ' scaleX(0)', opacity: 0 }
        ], {
            duration: duration,
            iterations: 2 // Perform a couple of pulls
        }).onfinish = () => el.remove();
    }

    /**
     * Resolves the wound and restores the original DOM structure.
     * 
     * @param {Object} wound 
     */
    finalize(wound) {
        const { original, group, id } = wound;

        console.log(`[RECOVERY] Wound ${id} successfully closed.`);

        // Flash original back into existence
        original.style.opacity = '1';
        original.style.pointerEvents = 'auto';
        original.classList.add('healed-scar');
        original.classList.remove('restore-pulse');

        // Cleanup the temporary wound group
        if (group && group.parentElement) {
            group.remove();
        }

        // Scarification duration
        setTimeout(() => {
            original.classList.remove('healed-scar');
            original.classList.remove('wounded');

            // Remove from queue
            this.healingQueue = this.healingQueue.filter(w => w.id !== id);
            this.isActivelyHealing = false;
        }, 8000);

        // Visual spark on completion
        VFX.spawnParticles(
            original.getBoundingClientRect().left + window.scrollX + original.offsetWidth / 2,
            original.getBoundingClientRect().top + window.scrollY + original.offsetHeight / 2,
            '#ffffff'
        );
    }

    /**
     * Sequential task processor.
     */
    processNextInQueue() {
        if (this.healingQueue.length === 0) return;
        // Logic for handling overlapping heals if needed
    }
}

// Global exposure
window.RecoverySystem = new Recovery();

/**
 * ARCHITECTURAL NOTES - RECOVERY SYSTEM
 * -------------------------------------
 * Healing is treated as an asynchronous physiological process. 
 * The system ensures that the UI remains functional even while 
 * restorations are occurring. By using CSS transitions for the 
 * bulk of the motion, we keep the main thread free for high-frequency 
 * mouse tracking and VFX spawning.
 */
