import { State } from './state.js';
import { CONSTANTS } from './constants.js';

/**
 * Level of Detail System
 * Handles visibility of nodes based on their screen size.
 * Prevents rendering thousands of tiny DOM elements.
 */
export class LODSystem {
    constructor() {
        this.managedNodes = new Set();
        this.lastUpdate = 0;
        this.updateInterval = 100; // ms

        this.observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.remove('off-screen');
                } else {
                    entry.target.classList.add('off-screen');
                }
            });
        }, {
            root: null, // viewport
            rootMargin: '50px', // Pre-load slightly outside
            threshold: 0.1
        });
    }

    register(node) {
        if (!node) return;
        this.managedNodes.add(node);
        this.observer.observe(node);
    }

    unregister(node) {
        if (!node) return;
        this.managedNodes.delete(node);
        this.observer.unobserve(node);
    }

    update(timestamp, globalScale) {
        // We don't need to run this every frame, maybe every 100ms
        if (timestamp - this.lastUpdate < this.updateInterval) return;
        this.lastUpdate = timestamp;

        // Culling based on size (Screen Space)
        // A node's screen size = WorldSize * GlobalScale
        // Note: This is tricky because nodes are nested.
        // A child node at level N has size relative to level N-1.

        // Easier approach: purely CSS class toggling based on bounding client rect
        // But getBoundingClientRect is expensive to call on many nodes.

        // Hybrid approach:
        // Use IntersectionObserver (handled above) for off-screen.
        // Use depth-based logic for "too small".

        // Current Level = 0.
        // Level 1 is small. Level 2 is tiny.
        // Level -1 is big.

        // We already limit `MAX_LEVELS_RENDERED` in Renderer.
        // This class might focus on *content* visibility inside cells.

        this.managedNodes.forEach(node => {
            // Check if node has a "too-small" class
            // We can check the computed global scale of the level it belongs to.
            // But checking DOM attributes is fast.

            const levelIndex = parseInt(node.dataset.level || '0');
            const relativeLevel = levelIndex - State.world.currentLevel;

            // If relative level is +2 (child of child), it might be very small depending on zoom.
            // Scale factor is ~3.
            // Level +1 is 1/3 size.
            // Level +2 is 1/9 size.

            // If Global Scale is 1.0:
            // Lvl 0 = 100%
            // Lvl 1 = 33%
            // Lvl 2 = 11%

            // If Global Scale is 0.1 (Zoomed out):
            // Lvl 0 = 10%
            // Lvl 1 = 3.3% -> Hide content

            // Effective Scale of Level L = GlobalScale * (1 / FACTOR ^ (L - CurrentL))
            // Actually, since we normalize scale, GlobalScale is always between 1/3 and 3 (roughly).

            // Let's rely on the Renderer's logic for whole levels, 
            // and use LODSystem for *decorations*.
        });
    }

    // Provide a utility to check if something should be detailed
    shouldShowDetail(levelIndex) {
        const relative = levelIndex - State.world.currentLevel;
        // If it's the current level or 1 deeper, show detail.
        // If it's 2 deeper, maybe show rough detail.
        return relative <= 1;
    }
}

export const LOD = new LODSystem();
