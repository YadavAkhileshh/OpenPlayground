import { State } from './state.js';
import { CONSTANTS, EVENTS } from './constants.js';
import { Generator } from './procedural-gen.js';
import { LOD } from './lod-system.js';
import { clamp } from './math-utils.js';

export class DOMRenderer {
    constructor() {
        this.stage = document.getElementById('zoom-stage');
        this.levels = new Map(); // level_index -> DOM Element
        this.currentRenderLevel = 0;
        this.isTransitioning = false;

        this.bindEvents();
        this.initWorld();

        this.loopRAF = null;
    }

    bindEvents() {
        State.subscribe(EVENTS.ZOOM_UPDATE, (scale) => {
            this.updateTransforms(scale);
            if (!this.loopRAF) {
                this.loopRAF = requestAnimationFrame(() => this.renderLoop());
            }
        });

        State.subscribe(EVENTS.LEVEL_CHANGE, (newLevel) => {
            this.handleLevelShift(newLevel);
            // Update procedural theme slightly
            Generator.setTheme(newLevel);
        });
    }

    renderLoop() {
        this.loopRAF = null;
        // Optional: Smooth interpolation of opacity or colors could happen here
        this.updateDebug();
    }

    initWorld() {
        // Initial set: -1, 0, 1
        this.createLevel(0);
        this.createLevel(1);
        this.createLevel(-1);

        // Ensure hierarchy
        this.rebuildHierarchy();
        this.updateTransforms(State.camera.scale);
    }

    createLevel(levelIndex) {
        if (this.levels.has(levelIndex)) return;

        const levelEl = document.createElement('div');
        levelEl.className = 'fractal-level';
        levelEl.dataset.level = levelIndex;
        levelEl.style.zIndex = levelIndex; // Higher levels on top? Or matters only for opacity.

        // Grid creation
        const grid = document.createElement('div');
        grid.className = 'fractal-grid';

        // Different grid layouts based on level?
        // Let's stick to 3x3 for consistency of center-recursion, 
        // but maybe vary the *content* cells.

        for (let i = 0; i < 9; i++) {
            const cell = document.createElement('div');
            cell.className = 'fractal-cell';

            // Add procedural decoration
            const deco = document.createElement('div');
            deco.className = 'cell-decoration';
            cell.appendChild(deco);

            // Add content
            const content = Generator.generateContent(levelIndex, i);
            cell.appendChild(content);

            // Center Portal
            if (i === 4) {
                cell.classList.add('center');
                cell.id = `level-portal-${levelIndex}`;
                // Clear content from center to make room for recursion?
                // Or keep it as background.
                // Let's make it semi-transparent.
                content.style.opacity = '0.2';
            } else {
                // Register for LOD only for non-center cells
                // Center cell is structural.
                LOD.register(cell);
            }

            grid.appendChild(cell);
        }

        levelEl.appendChild(grid);
        this.levels.set(levelIndex, levelEl);
    }

    rebuildHierarchy() {
        // Re-attaches all current levels in correct DOM order
        // This is safer than ad-hoc appending.

        // Sorted levels
        const indices = Array.from(this.levels.keys()).sort((a, b) => a - b);

        if (indices.length === 0) return;

        // The lowest index is the outer-most wrapper.
        // It should be attached to stage.
        const rootIndex = indices[0];
        const rootEl = this.levels.get(rootIndex);

        if (rootEl.parentElement !== this.stage) {
            this.stage.innerHTML = ''; // Clear stage
            this.stage.appendChild(rootEl);
        }

        // Now, for each subsequent level, attach it to the previous one's center.
        for (let i = 1; i < indices.length; i++) {
            const parentIdx = indices[i - 1];
            const childIdx = indices[i];

            // Note: Our logic assumes contiguous levels (e.g., -1, 0, 1). 
            // If there's a gap, this breaks. RecursionManager must ensure no gaps.
            if (childIdx !== parentIdx + 1) {
                console.warn('Gap in fractal hierarchy:', parentIdx, childIdx);
                continue;
            }

            const parentEl = this.levels.get(parentIdx);
            const childEl = this.levels.get(childIdx);

            const center = parentEl.querySelector('.center');
            if (center && childEl.parentElement !== center) {
                center.appendChild(childEl);
            }
        }
    }

    updateTransforms(scale) {
        // Apply scale to stage
        this.stage.style.transform = `scale(${scale})`;

        // Visual effects on levels based on scale
        // We want the 'active' level (0) to be fully opaque.
        // Level -1 (Parent) should fade out if scale < 1 (zooming out to it) or stays visible?
        // Actually, if we zoom IN (scale > 1), Parent becomes huge and goes offscreen.
        // If we zoom OUT (scale < 1), Parent shrinks into view.

        // Level 1 (Child) is tiny. Fade it in as we zoom IN.

        // Let's adjust opacity of the *Parent* (-1) based on scale.
        // If scale is 1.0 -> Parent is boundary.
        // If scale is 3.0 -> Parent is gone.

        this.levels.forEach((el, idx) => {
            const relIndex = idx - this.currentRenderLevel;

            // Default opacity
            let opacity = 1;

            if (relIndex === -1) {
                // Parent. 
                // As scale goes 1 -> 3, Parent fades 1 -> 0
                // As scale goes 1 -> 0.33, Parent stays 1.
                if (scale > 1) {
                    opacity = clamp(1 - (scale - 1) / 1.5, 0, 1);
                }
            } else if (relIndex === 1) {
                // Child.
                // Always visible, but maybe fade in from 0?
                // As scale goes 0.33 -> 1, Child grows.
            }

            el.style.opacity = opacity;
        });

        // Notify LOD system
        LOD.update(performance.now(), scale); // Pass scale if needed
    }

    handleLevelShift(newGlobalLevel) {
        const direction = newGlobalLevel > this.currentRenderLevel ? 1 : -1;
        this.currentRenderLevel = newGlobalLevel;

        const maxLevels = CONSTANTS.MAX_LEVELS_RENDERED;
        const neighborhood = 2; // Render range: [current-2, current+2]

        // 1. Remove distant levels
        for (const [lvl, el] of this.levels) {
            if (Math.abs(lvl - newGlobalLevel) > neighborhood) {
                if (el.parentNode) el.parentNode.removeChild(el);
                this.levels.delete(lvl);
                // Important: Unregister from LOD!
                el.querySelectorAll('.fractal-cell').forEach(c => LOD.unregister(c));
            }
        }

        // 2. Add new levels
        // If moved +1 (Zoom In), generate new deepest child
        if (direction > 0) {
            this.createLevel(newGlobalLevel + 1);
        } else {
            this.createLevel(newGlobalLevel - 1); // Generate outer parent
        }

        // 3. Rebuild DOM Tree
        this.rebuildHierarchy();
    }

    updateDebug() {
        const scale = State.camera.scale.toFixed(4);
        const level = State.world.currentLevel;
        const nodes = document.getElementsByTagName('*').length;

        if (this.debugElScale) {
            this.debugElScale.innerText = scale + 'x';
            this.debugElLevel.innerText = level;
            this.debugElNodes.innerText = nodes;
        } else {
            this.debugElScale = document.getElementById('debug-scale');
            this.debugElLevel = document.getElementById('debug-level');
            this.debugElNodes = document.getElementById('debug-nodes');
        }
    }
}
