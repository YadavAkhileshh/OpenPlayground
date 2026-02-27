/**
 * QuadCompress QuadTree Manager
 * 
 * Manages the overall state of the compression, including the root node,
 * the list of active leaf nodes, and the "frontier" of nodes capable of splitting.
 * 
 * @module QuadTree
 */

import { QuadNode } from './node.js';
import { Logger } from '../utils/logger.js';
import { CONFIG } from '../config.js';

export class QuadTree {
    constructor() {
        this.root = null;
        this.leaves = []; // Flat list of renderable nodes
        this.splitQueue = []; // Priority queue for processing (highest error first)

        // Stats
        this.nodeCount = 0;
        this.maxDepthReached = 0;
    }

    /**
     * Initializes the tree with an image
     * @param {number} width 
     * @param {number} height 
     * @param {ImageData} imageData 
     */
    initialize(width, height, imageData) {
        this.root = new QuadNode(0, 0, width, height, null, 0);
        this.root.analyze(imageData);

        this.leaves = [this.root];
        this.splitQueue = [this.root];
        this.nodeCount = 1;
        this.maxDepthReached = 0;

        Logger.info('QuadTree', `Initialized with ${width}x${height} root.`);
    }

    /**
     * Processes one "step" of the recursion.
     * Finds the node with the highest error in the queue and splits it.
     * @param {ImageData} imageData - Needed to analyze new children
     * @param {number} threshold - Variance threshold
     * @param {number} currentLimit - User defined depth limit
     * @returns {boolean} True if a split happened, False if done
     */
    step(imageData, threshold, currentLimit) {
        if (this.splitQueue.length === 0) return false;

        // Sort queue to always split the "worst" node first (highest variance)
        // This creates a much more pleasing visual effect than BFS/DFS
        this.splitQueue.sort((a, b) => b.variance - a.variance);

        // Get candidate
        const candidate = this.splitQueue.shift();

        // Check constraints
        if (candidate.variance <= threshold || candidate.depth >= currentLimit) {
            // This node is done, it remains a leaf forever (unless settings change)
            // We don't need to do anything, it's already in this.leaves
            return this.step(imageData, threshold, currentLimit); // Try next one
        }

        // Perform Split
        const children = candidate.split();
        if (children.length === 0) return this.step(imageData, threshold, currentLimit); // Failed to split (too small)

        // Remove parent from leaves, add children
        const leafIndex = this.leaves.indexOf(candidate);
        if (leafIndex > -1) {
            this.leaves.splice(leafIndex, 1);
        }

        // Process new children
        children.forEach(child => {
            child.analyze(imageData);
            this.leaves.push(child);

            if (child.variance > threshold) {
                this.splitQueue.push(child);
            }

            // Stats
            this.maxDepthReached = Math.max(this.maxDepthReached, child.depth);
        });

        this.nodeCount += 3; // +4 children -1 parent
        return true;
    }

    /**
     * Get all renderable nodes
     */
    getRenderableNodes() {
        return this.leaves;
    }

    /**
     * Reset the tree
     */
    reset() {
        this.root = null;
        this.leaves = [];
        this.splitQueue = [];
        this.nodeCount = 0;
    }
}
