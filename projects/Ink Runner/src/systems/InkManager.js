/**
 * InkManager.js
 * Manages the ink resources and visual style of the strokes.
 */

import { Settings } from '../core/Settings.js';

export class InkManager {
    constructor() {
        this.inkLevel = 100;
    }

    // This class could handle the dynamic drawing effect logic
    // For now, it might just be a utility for the WorldGenerator

    getPath(stroke) {
        const path = new Path2D();
        path.moveTo(stroke.x, stroke.y);
        path.lineTo(stroke.x + stroke.width, stroke.y);
        // Add thickness box
        path.lineTo(stroke.x + stroke.width, stroke.y + Settings.INK_THICKNESS);
        path.lineTo(stroke.x, stroke.y + Settings.INK_THICKNESS);
        path.closePath();
        return path;
    }
}
