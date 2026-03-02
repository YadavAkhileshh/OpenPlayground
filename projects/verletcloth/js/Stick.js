/**
 * @class Stick
 * @description Represents a distance constraint between two Point objects.
 * Uses an iterative relaxation method to maintain the rest length of the stick.
 * This is the "structural" component of the Verlet Cloth.
 */
export default class Stick {
    /**
     * @param {Point} p1 - First mass point.
     * @param {Point} p2 - Second mass point.
     * @param {number} length - Target rest length.
     * @param {Object} properties - Optional physical properties like damping.
     */
    constructor(p1, p2, length, properties = {}) {
        this.p1 = p1;
        this.p2 = p2;
        this.length = length;
        this.isActive = true;

        // Simulation state
        this.tension = 0;
        this.damping = properties.damping || 1.0;
        this.stiffness = properties.stiffness || 1.0;
    }

    /**
     * Corrects point positions to satisfy the distance constraint.
     * Optimization: Calculates offset vectors and applies them proportional 
     * to the delta from target rest length.
     * 
     * @param {number} breakingLimit - Multiplier of rest length at which the stick snaps.
     */
    update(breakingLimit = 0) {
        if (!this.isActive) return;

        // Calculate current spatial relationship
        const dx = this.p2.x - this.p1.x;
        const dy = this.p2.y - this.p1.y;

        // Avoid Math.sqrt optimization candidate but needed for precision here
        const distance = Math.sqrt(dx * dx + dy * dy);

        /**
         * AUTO-BREAKING LOGIC
         * Structural failure occurs if the material is stretched beyond its elastic limit.
         */
        if (breakingLimit > 0 && distance > this.length * breakingLimit) {
            this.isActive = false;
            return;
        }

        // Calculate the difference from the intended rest length
        const difference = this.length - distance;

        /**
         * TENSION TRACKING
         * We store a normalized tension value for rendering (e.g., heat maps)
         * and audio feedback interaction.
         */
        this.tension = Math.abs(difference) / this.length;

        // Derived correction percentage (half for each point)
        // If one point is pinned, the other moves the full distance.
        const percent = (difference / distance) / 2 * this.stiffness;

        const offsetX = dx * percent;
        const offsetY = dy * percent;

        // Apply positional corrections
        if (!this.p1.isPinned) {
            this.p1.x -= offsetX;
            this.p1.y -= offsetY;
        }

        if (!this.p2.isPinned) {
            this.p2.x += offsetX;
            this.p2.y += offsetY;
        }
    }

    /**
     * Visualizes the constraint as a line segment.
     * 
     * @param {CanvasRenderingContext2D} ctx 
     * @param {boolean} tensionAware - If true, colors the line based on tension (Heat Map).
     * @param {string} baseColor - Default color for inactive/unstressed sticks.
     */
    render(ctx, tensionAware = false, baseColor = 'rgba(129, 140, 248, 0.4)') {
        if (!this.isActive) return;

        ctx.beginPath();
        ctx.moveTo(this.p1.x, this.p1.y);
        ctx.lineTo(this.p2.x, this.p2.y);

        if (tensionAware) {
            /**
             * HEAT MAP CALCULATION
             * Gradually shifts from Indigo -> Pink -> Red as tension increases.
             */
            const r = Math.min(255, 129 + this.tension * 1000);
            const g = Math.max(0, 140 - this.tension * 500);
            const b = Math.max(0, 248 - this.tension * 1000);

            ctx.strokeStyle = `rgb(${r}, ${g}, ${b})`;
            ctx.lineWidth = 1 + this.tension * 8; // Thicker lines for higher tension
        } else {
            ctx.strokeStyle = baseColor;
            ctx.lineWidth = 1;
        }

        ctx.stroke();
    }

    /**
     * Deactivates the stick. Used for user-triggered tearing.
     */
    destroy() {
        this.isActive = false;
    }
}
