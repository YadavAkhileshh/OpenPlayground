/**
 * Represents the road network.
 * Supports static defined roads (via lane count/width) and dynamic user-drawn paths.
 */
class Road {
    /**
     * @param {number} x - Center X coordinate of road
     * @param {number} width - Total width of road
     * @param {number} laneCount - Number of lanes
     */
    constructor(x, width, laneCount = 3) {
        this.x = x;
        this.width = width;
        this.laneCount = laneCount;

        this.points = [];
        this.borders = [];

        this.left = x - width / 2;
        this.right = x + width / 2;

        const infinity = 1000000;
        this.top = -infinity;
        this.bottom = infinity;

        const topLeft = { x: this.left, y: this.top };
        const topRight = { x: this.right, y: this.top };
        const bottomLeft = { x: this.left, y: this.bottom };
        const bottomRight = { x: this.right, y: this.bottom };

        // Default straight road borders
        this.borders = [
            [topLeft, bottomLeft],
            [topRight, bottomRight]
        ];
    }

    /**
     * Adds a point to the custom path in Editor mode.
     * Regenerates borders based on new segment.
     * @param {Object} point - {x, y}
     */
    addPoint(point) {
        this.points.push(point);
        this.#generateBorders();
    }

    /**
     * Resets the road to empty (for Editor mode start).
     */
    clear() {
        this.points = [];
        this.borders = [];
    }

    /**
     * Generates left and right borders based on the central path points.
     * Uses perpendicular vectors to extrude width.
     */
    #generateBorders() {
        if (this.points.length < 2) {
            this.borders = [];
            return;
        }

        this.borders = [];
        for (let i = 0; i < this.points.length - 1; i++) {
            const p0 = this.points[i];
            const p1 = this.points[i + 1];

            const dx = p1.x - p0.x;
            const dy = p1.y - p0.y;
            const angle = Math.atan2(dy, dx);
            const perp = angle + Math.PI / 2;

            const halfWidth = this.width / 2;

            const p0_L = {
                x: p0.x - Math.cos(perp) * halfWidth,
                y: p0.y - Math.sin(perp) * halfWidth
            };
            const p0_R = {
                x: p0.x + Math.cos(perp) * halfWidth,
                y: p0.y + Math.sin(perp) * halfWidth
            };
            const p1_L = {
                x: p1.x - Math.cos(perp) * halfWidth,
                y: p1.y - Math.sin(perp) * halfWidth
            };
            const p1_R = {
                x: p1.x + Math.cos(perp) * halfWidth,
                y: p1.y + Math.sin(perp) * halfWidth
            };

            this.borders.push([p0_L, p1_L]);
            this.borders.push([p0_R, p1_R]);
        }
    }

    /**
     * Returns the X coordinate of a specific lane's center.
     * Used for spawning traffic or cars.
     * @param {number} laneIndex - 0-indexed lane number
     * @returns {number} X coordinate
     */
    getLaneCenter(laneIndex) {
        // If we have points, find the starting point's center
        // For simplicity in this version, if points exist, use first segment
        if (this.points.length > 1) {
            const p0 = this.points[0];
            // Approx
            return p0.x;
        }

        const laneWidth = this.width / this.laneCount;
        return this.left + laneWidth / 2 +
            Math.min(laneIndex, this.laneCount - 1) * laneWidth;
    }

    /**
     * Draws the road and its borders.
     * Handles both default straight road and custom curved roads.
     * @param {CanvasRenderingContext2D} ctx 
     */
    draw(ctx) {
        ctx.lineWidth = 5;
        ctx.strokeStyle = "white";

        if (this.points.length > 1) {
            for (let i = 0; i < this.points.length - 1; i++) {
                const p0 = this.points[i];
                const p1 = this.points[i + 1];

                // Draw Dashed line for center
                ctx.beginPath();
                ctx.setLineDash([20, 20]);
                ctx.moveTo(p0.x, p0.y);
                ctx.lineTo(p1.x, p1.y);
                ctx.stroke();
            }
        } else if (this.points.length === 0) {
            // Infinite road fallback
            for (let i = 1; i <= this.laneCount - 1; i++) {
                const x = Utils.lerp(
                    this.left,
                    this.right,
                    i / this.laneCount
                );

                ctx.setLineDash([20, 20]);
                ctx.beginPath();
                ctx.moveTo(x, this.top);
                ctx.lineTo(x, this.bottom);
                ctx.stroke();
            }
        }

        ctx.setLineDash([]);
        this.borders.forEach(border => {
            ctx.beginPath();
            ctx.strokeStyle = "white";
            ctx.lineWidth = 5;
            ctx.moveTo(border[0].x, border[0].y);
            ctx.lineTo(border[1].x, border[1].y);
            ctx.stroke();
        });

        // Draw points (Editor helper)
        if (this.points.length > 0) {
            ctx.fillStyle = "blue";
            this.points.forEach(p => {
                ctx.beginPath();
                ctx.arc(p.x, p.y, 8, 0, Math.PI * 2);
                ctx.fill();
            });
        }
    }
}
