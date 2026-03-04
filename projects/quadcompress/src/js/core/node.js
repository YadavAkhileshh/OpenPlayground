/**
 * QuadCompress QuadNode Class
 * 
 * Represents a single rectangular region in the Quadtree algorithm.
 * Each node stores its bounds, its average color, its error score,
 * and references to its 4 children (NW, NE, SW, SE).
 * 
 * @module Node
 */

import { CONFIG } from '../config.js';
import { VarianceCalculator } from './variance.js';
import { rgbToCss } from '../utils/colorUtils.js';

export class QuadNode {
    /**
     * @param {number} x - Top left X
     * @param {number} y - Top left Y
     * @param {number} w - Width
     * @param {number} h - Height
     * @param {QuadNode} parent - Parent node (null for root)
     * @param {number} depth - Current recursion depth
     */
    constructor(x, y, w, h, parent = null, depth = 0) {
        this.x = x;
        this.y = y;
        this.width = w;
        this.height = h;
        this.parent = parent;
        this.depth = depth;

        // Leaf status
        this.children = []; // [NW, NE, SW, SE]
        this.isLeaf = true;

        // Visual Data
        this.color = { r: 0, g: 0, b: 0 };
        this.colorString = 'rgba(0,0,0,1)';
        this.variance = 0;

        // State
        this.isSplittable = true;
    }

    /**
     * Calculates the color and error for this node based on image data.
     * @param {ImageData} imageData 
     */
    analyze(imageData) {
        const result = VarianceCalculator.calculate(
            imageData,
            this.x,
            this.y,
            this.width,
            this.height
        );

        this.color = result.avgColor;
        this.variance = result.score;
        this.colorString = rgbToCss(this.color.r, this.color.g, this.color.b);
    }

    /**
     * Splits this node into 4 quadrants.
     * Does NOT analyze the children immediately - allows for progressive loading.
     * @returns {Array<QuadNode>} The 4 new children
     */
    split() {
        if (!this.isLeaf) return [];

        const subW = Math.floor(this.width / 2);
        const subH = Math.floor(this.height / 2);

        // If too small, stop
        if (subW < CONFIG.QUADTREE.MIN_NODE_SIZE || subH < CONFIG.QUADTREE.MIN_NODE_SIZE) {
            this.isSplittable = false;
            return [];
        }

        // Create 4 children
        // NW, NE, SW, SE
        const nw = new QuadNode(this.x, this.y, subW, subH, this, this.depth + 1);
        const ne = new QuadNode(this.x + subW, this.y, this.width - subW, subH, this, this.depth + 1);
        const sw = new QuadNode(this.x, this.y + subH, subW, this.height - subH, this, this.depth + 1);
        const se = new QuadNode(this.x + subW, this.y + subH, this.width - subW, this.height - subH, this, this.depth + 1);

        this.children = [nw, ne, sw, se];
        this.isLeaf = false;

        return this.children;
    }

    /**
     * Returns true if this node's variance exceeds the threshold
     * @param {number} threshold 
     */
    shouldSplit(threshold) {
        return this.isSplittable &&
            this.variance > threshold &&
            this.depth < CONFIG.QUADTREE.MAX_DEPTH_HARD_LIMIT;
    }
}
