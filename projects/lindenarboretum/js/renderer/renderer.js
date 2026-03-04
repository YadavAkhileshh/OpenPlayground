/**
 * LindenArboretum - Main Renderer Module
 * Interprets the generated L-System string into drawing commands.
 * Handles the immediate-mode canvas drawing loop.
 * 
 * =========================================================================
 * RENDERING PERFORMANCE ARCHITECTURE:
 * 
 * Drawing fractals with hundreds of thousands of lines in real-time at 60FPS 
 * requires strict optimization in HTML5 Canvas.
 * 
 * 1. Immediate Mode execution: We do not save an array of Vec2 lines to loop
 * over later. The L-System string IS the data structure. We loop over the 
 * string characters and execute turtle movement dynamically.
 * 
 * 2. Canvas Path Batching (`beginPath()` -> `moveTo/lineTo` -> `stroke()`):
 * Calling `ctx.stroke()` for every single branch segment is devastating to
 * GPU performance. The browser has to rasterize individual tiny paths over 
 * and over.
 * Instead, we "batch" all continuous lines into a single path. We only call 
 * `stroke()` and start a new path when something breaks the line flow, such as:
 *   - Pushing/Popping state (branching means line stops, or jumps).
 *   - Changing colors (you cannot change strokeStyle mid-path).
 *   - Changing thickness (you cannot change lineWidth mid-path).
 * 
 * 3. Preallocated Stack:
 * When encountering `[`, we push the turtle state. When encountering `]`,
 * we pop it. Creating new `Turtle` objects 50,000 times a frame causes 
 * severe garbage collection stutters. `SaveStack` pre-allocates an array
 * of empty Turtles and re-uses them via indexed pointers.
 * 
 * 4. Device Pixel Ratio (DPR):
 * High DPI screens (MacBook Retina, 4k Monitors) look blurry if rendered
 * at CSS resolution. We scale the internal buffer up, but render using
 * CSS coordinate dimensions. `context.scale(dpr, dpr)` handles this.
 * =========================================================================
 */

import { canvasManager } from './canvas.js';
import { contextManager } from './context.js';
import { camera } from './camera.js';
import { Turtle } from './turtle.js';
import { SaveStack } from './stack.js';
import { colorProfile } from './colorProfile.js';
import { glowManager } from './glow.js';
import { MathUtils } from '../math/utils.js';

export class Renderer {
    constructor() {
        this.turtle = new Turtle();

        // Intialized with a deep memory pool for the branches
        this.saveStack = new SaveStack(150000);

        // Setup conversion config
        // The angle dictates how sharply branches turn upon '+' or '-'
        this.angleRadians = MathUtils.degToRad(25);

        // Cache drawing state to eliminate redundant context state shifts
        this.currentColor = '';
        this.currentThickness = 0;
    }

    /**
     * Executes the main render pass.
     * Called every single frame by loop.js when animating.
     * 
     * @param {string} commandString - The full L-Sys generated string
     * @param {import('../physics/physicsEngine.js').PhysicsEngine} physicsEngine - Physics state
     * @param {number} initialLength - Starting branch length for root
     */
    render(commandString, physicsEngine, initialLength = 20) {
        const ctx = contextManager.ctx;
        if (!ctx) return;

        // Estimiate max tree depth by analyzing the string.
        // This is crucial for applying appropriate color gradients based
        // on branch relative depth, and knowing how stiff wind physics should be.
        // Easiest heuristic is counting consecutive `[` braces.
        let currentDepth = 0;
        let maxDepth = 1;
        for (let i = 0; i < commandString.length; i++) {
            if (commandString[i] === '[') currentDepth++;
            else if (commandString[i] === ']') currentDepth--;
            if (currentDepth > maxDepth) maxDepth = currentDepth;
        }

        // Clear previous frame
        contextManager.clearScreen();

        // Start clean transform
        ctx.save();

        // HDPI scaling
        contextManager.applyDPRScale();

        // Apply user panning/zooming
        camera.applyTo(ctx);

        // Retrieve the anchor point (bottom center usually)
        const rootStr = canvasManager.getRootPosition();

        // Reset turtle and memory stack to start position
        this.turtle.reset(rootStr.x, rootStr.y);
        this.turtle.length = initialLength;
        this.saveStack.clear();

        // Enable composite luminous glow for alien branches.
        // The root gets the darkest, simplest glow.
        glowManager.setGlow(ctx, colorProfile.getGlowColor(1, 1), 10);

        // Force first style update immediately
        this._updateStyle(ctx, maxDepth);

        // Start path builder 
        ctx.beginPath();
        ctx.moveTo(this.turtle.position.x, this.turtle.position.y);

        // Interpret the string
        const len = commandString.length;

        // V8 engine optimizes this tight for-loop extremely well
        for (let i = 0; i < len; i++) {
            const char = commandString[i];

            switch (char) {
                case 'F':
                    // Draw forward
                    // Apply wind physics to this segment. The deeper into the tree,
                    // the stronger the offset. This requires recalculating angle
                    // continuously, making the tree look "alive".
                    if (physicsEngine) {
                        this.turtle.windOffset = physicsEngine.getWindOffset(this.turtle.depth, maxDepth);
                    }

                    // Save last pos before moving
                    const oldX = this.turtle.position.x;
                    const oldY = this.turtle.position.y;

                    // Triggers internal translation vector logic
                    this.turtle.forward();

                    // We add the line geometry to the current path batch
                    ctx.moveTo(oldX, oldY);
                    ctx.lineTo(this.turtle.position.x, this.turtle.position.y);
                    break;

                case 'f':
                    // Move forward without drawing (invisible branches/spores)
                    this.turtle.forward();
                    // We must jump the path cursor Without adding geometry
                    ctx.moveTo(this.turtle.position.x, this.turtle.position.y);
                    break;

                case '+':
                    // Turn right (rotate turtle state)
                    this.turtle.turnRight(this.angleRadians);
                    break;

                case '-':
                    // Turn left (rotate turtle state)
                    this.turtle.turnLeft(this.angleRadians);
                    break;

                case '[':
                    // PUSH: Start a new sub-branch
                    // Save exactly where we are, what angle, how thick
                    this.saveStack.push(this.turtle);
                    this.turtle.depth++;

                    // Taper branch thickness based on generation config
                    this.turtle.scaleThickness(0.75);

                    // Because thickness defines line styles, we MUST flush
                    // the batched geometry to canvas now before changing style.
                    ctx.stroke();

                    // Apply new thickness and color for deeper branches
                    this._updateStyle(ctx, maxDepth);

                    // Restart new path builder at current coordinates
                    ctx.beginPath();
                    ctx.moveTo(this.turtle.position.x, this.turtle.position.y);
                    break;

                case ']':
                    // POP: Return to previous branching junction

                    // Flush pending lines of the branch we just finished
                    ctx.stroke();

                    // Recover state (teleports turtle back)
                    this.saveStack.pop(this.turtle);

                    // Restore the style data (thicker, darker colors)
                    this._updateStyle(ctx, maxDepth);

                    // Restart path at the junction
                    ctx.beginPath();
                    ctx.moveTo(this.turtle.position.x, this.turtle.position.y);
                    break;

                default:
                    // Non-drawing characters like 'X' or 'Y' used only in rewrite logic. 
                    // Just pass over them.
                    break;
            }
        }

        // Final flush to catch whatever lines were queued up at the very end
        ctx.stroke();

        // Cleanup glow state so it doesn't bleed into UI or background
        glowManager.resetGlow(ctx);

        // Restore canonical transform Matrix
        ctx.restore();
    }

    /**
     * Modifies the graphics context pipeline to switch colors and line-widths.
     * This forces a GPU state change, which is why we batch.
     * @private
     */
    _updateStyle(ctx, maxDepth) {
        // Query color profile based on relative depth of current turtle
        const newColor = colorProfile.getColorForDepth(this.turtle.depth, maxDepth);
        const newGlow = colorProfile.getGlowColor(this.turtle.depth, maxDepth);

        ctx.strokeStyle = newColor;
        ctx.lineWidth = this.turtle.thickness;

        // Using rounded caps looks dramatically better for organic structures,
        // eliminating sharp angular overlaps at junctions.
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';

        // Modify the bloom effect. The base of the trunk glows less 
        // intensely than the tips to give a flowering effect.
        glowManager.setGlow(ctx, newGlow, this.turtle.depth < maxDepth / 2 ? 5 : 15);
    }
}
