// js/ui/DOMManager.js

/**
 * Handles non-physics UI bridging like updating stats, binding controls, etc.
 */
export class DOMManager {
    constructor(engine, elementSync, inputHandler) {
        this.engine = engine;
        this.elementSync = elementSync;
        this.inputHandler = inputHandler;

        // Cache stat elements
        this.elBodyCount = document.getElementById('body-count-display');
        this.elFps = document.getElementById('fps-display');
        this.elEnergy = document.getElementById('energy-display');

        this.initControls();
        this.bindActionButtons();
    }

    initControls() {
        // Find sliders manually by order since no specific IDs were given in HTML 
        // 1: Gravity, 2: Repulsion, 3: Friction
        const tracks = document.querySelectorAll('.slider-track');
        if (tracks.length >= 3) {
            this.setupSlider(tracks[0], 0, 2, 1, (val) => {
                // Gravity multiplier (0 to 2)
                this.engine.setModifiers(val, this.engine.frictionCoefficient);
            });

            this.setupSlider(tracks[1], 0, 3, 1, (val) => {
                // Repulsion multiplier
                this.inputHandler.setStrength(val);
            });

            this.setupSlider(tracks[2], 0.8, 1.0, 0.98, (val) => {
                // Friction multiplier (val goes towards 1 for less friction, less for more)
                // mapped 0-100% on slider to 0.8 to 1.0 damping modifier
                this.engine.setModifiers(this.engine.gravityCoefficient, val);
            });
        }
    }

    setupSlider(trackEl, min, max, initial, onChange) {
        const thumb = trackEl.querySelector('.slider-thumb');
        if (!thumb) return;

        let isDragging = false;

        // Initial pos
        const initialPercent = (initial - min) / (max - min);
        thumb.style.left = `${initialPercent * 100}%`;

        const updateVal = (clientX) => {
            const rect = trackEl.getBoundingClientRect();
            let rawX = clientX - rect.left;
            let percent = rawX / rect.width;
            percent = Math.max(0, Math.min(1, percent));

            thumb.style.left = `${percent * 100}%`;

            const realVal = min + percent * (max - min);
            onChange(realVal);
        };

        trackEl.addEventListener('mousedown', (e) => {
            isDragging = true;
            updateVal(e.clientX);
        });

        window.addEventListener('mousemove', (e) => {
            if (isDragging) updateVal(e.clientX);
        });

        window.addEventListener('mouseup', () => {
            isDragging = false;
        });

        // Basic touch
        trackEl.addEventListener('touchstart', (e) => {
            isDragging = true;
            updateVal(e.touches[0].clientX);
        }, { passive: true });

        window.addEventListener('touchmove', (e) => {
            if (isDragging) updateVal(e.touches[0].clientX);
        }, { passive: false });

        window.addEventListener('touchend', () => {
            isDragging = false;
        });
    }

    bindActionButtons() {
        const addBtn = document.querySelector('.fab.primary');
        const resetBtn = document.querySelector('.fab.secondary');

        if (addBtn) {
            addBtn.addEventListener('click', () => {
                // Add a new random element
                alert("Action not implemented yet: Create new dynamic elements.");
            });
        }

        if (resetBtn) {
            resetBtn.addEventListener('click', () => {
                // Reset positions
                this.elementSync.elementMap.forEach((body) => {
                    body.setPosition(
                        Math.random() * window.innerWidth,
                        window.innerHeight - 100
                    );
                    body.velocity.set(0, 0);
                });
            });
        }
    }

    updateStats(fps) {
        if (this.elBodyCount) {
            this.elBodyCount.textContent = this.engine.bodies.length;
        }
        if (this.elFps) {
            this.elFps.textContent = Math.round(fps);
        }
        if (this.elEnergy) {
            const energy = this.engine.getTotalKineticEnergy();
            // scale down for display
            this.elEnergy.textContent = `${(energy * 0.01).toFixed(1)} KJ`;
        }
    }
}
