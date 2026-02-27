/**
 * QuadCompress Animator
 * 
 * Orchestrates the "Game Loop" of the application.
 * Manages the recursion steps of the Quadtree spreading them out over time
 * to create the progressive visualization effect.
 * 
 * @module Animator
 */

import { CONFIG } from '../config.js';
import { Logger } from '../utils/logger.js';

export class Animator {
    constructor(quadTree, renderer, statsUI) {
        this.tree = quadTree;
        this.renderer = renderer;
        this.stats = statsUI;

        this.isRunning = false;
        this.animationId = null;

        // Runtime Config
        this.varianceThreshold = CONFIG.QUADTREE.DEFAULT_VARIANCE_THRESHOLD;
        this.maxDepth = CONFIG.QUADTREE.DEFAULT_MAX_DEPTH;
        this.speedMultiplier = 1;
        this.imageData = null; // Reference to source data
    }

    start(imageData, width, height) {
        if (this.isRunning) this.stop();

        this.imageData = imageData;
        this.renderer.resize(width, height);
        this.tree.initialize(width, height, imageData);

        this.isRunning = true;
        this.loop();

        Logger.info('Animator', 'Animation started.');
    }

    stop() {
        this.isRunning = false;
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
            this.animationId = null;
        }
    }

    loop() {
        if (!this.isRunning) return;

        // Process a batch of splits per frame
        // This is what gives the "thinking" animation speed
        const splitsPerFrame = Math.floor(CONFIG.ANIMATION.MAX_SPLITS_PER_FRAME * this.speedMultiplier);

        let changed = false;
        const startTime = performance.now();

        // Perform N splits
        for (let i = 0; i < splitsPerFrame; i++) {
            // Check limits first to avoid unnecessary calls
            if (this.tree.nodeCount >= CONFIG.SYSTEM.MAX_NODES) {
                Logger.warn('Animator', 'Max node limit reached. Stopping.');
                this.isRunning = false;
                break;
            }

            const didSplit = this.tree.step(
                this.imageData,
                this.varianceThreshold,
                this.maxDepth
            );

            if (didSplit) {
                changed = true;
            } else {
                // If the tree returns false, it means no more nodes CAN split
                // (queue is empty or all nodes are below threshold/max depth)
                if (this.tree.splitQueue.length === 0) {
                    this.isRunning = false;
                    Logger.success('Animator', 'Compression Complete.');
                }
                break;
            }
        }

        const processTime = performance.now() - startTime;

        // Render
        if (changed) {
            // Only re-render if the tree changed
            // Optimization: In a real app we might only draw dirty rects, 
            // but for this visual simpler to redraw all leaves or use a dirty flag
            this.renderer.draw(this.tree.getRenderableNodes());

            // Update UI
            if (this.stats) {
                this.stats.update(
                    this.tree.nodeCount,
                    this.tree.maxDepthReached,
                    processTime
                );
            }
        }

        if (this.isRunning) {
            this.animationId = requestAnimationFrame(() => this.loop());
        }
    }

    setThreshold(val) {
        this.varianceThreshold = val;
        // If we lower the threshold, we might need to restart/continue splitting
        if (!this.isRunning && this.tree.root) {
            this.isRunning = true;
            this.loop();
        }
    }

    setMaxDepth(val) {
        this.maxDepth = val;
        if (!this.isRunning && this.tree.root) {
            this.isRunning = true;
            this.loop();
        }
    }
}
