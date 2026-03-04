import Point from './Point.js';
import Stick from './Stick.js';

/**
 * @class Cloth
 * @description Manager class for a grid-based particle mesh.
 * Handles procedural generation of points and sticks, global physics updates,
 * and high-level rendering strategies (Wireframe vs. Mesh Fill).
 */
export default class Cloth {
    /**
     * @param {number} width - Number of points horizontally.
     * @param {number} height - Number of points vertically.
     * @param {number} spacing - Distance between points.
     * @param {number} startX - Offset X.
     * @param {number} startY - Offset Y.
     */
    constructor(width, height, spacing, startX, startY) {
        this.points = [];
        this.sticks = [];
        this.width = width;
        this.height = height;
        this.spacing = spacing;

        this.generate(startX, startY, spacing);
    }

    /**
     * Procedural grid generation pipeline.
     */
    generate(startX, startY, spacing) {
        this.points = [];
        this.sticks = [];

        // 1. Generation of mass points
        for (let y = 0; y <= this.height; y++) {
            for (let x = 0; x <= this.width; x++) {
                const point = new Point(startX + x * spacing, startY + y * spacing);

                // Pinned constraint: top row is static by default
                if (y === 0) point.togglePin();

                this.points.push(point);
            }
        }

        // 2. Generation of linear constraints (Sticks)
        for (let y = 0; y <= this.height; y++) {
            for (let x = 0; x <= this.width; x++) {
                // Horizontal spans
                if (x < this.width) {
                    this.sticks.push(new Stick(
                        this.points[y * (this.width + 1) + x],
                        this.points[y * (this.width + 1) + x + 1],
                        spacing
                    ));
                }
                // Vertical spans
                if (y < this.height) {
                    this.sticks.push(new Stick(
                        this.points[y * (this.width + 1) + x],
                        this.points[(y + 1) * (this.width + 1) + x],
                        spacing
                    ));
                }
            }
        }
    }

    /**
     * Core simulation step.
     * Coordinates force application, point integration, and constraint relaxation.
     * 
     * @param {number} dt - Timestep.
     * @param {Object} properties - Global physics config.
     * @param {CollisionHub} collisionHub - Optional collider registry.
     */
    update(dt, properties, collisionHub = null) {
        const { friction, gravity, stiffness, wind, breakingLimit } = properties;

        // Step 1: Accumulate external forces and integrate positions
        for (const point of this.points) {
            // Apply a turbulent wind force field
            point.applyForce(wind, 0);

            // Execute Euler/Verlet integration
            point.update(dt, friction, gravity);
        }

        // Step 2: Global Collision Resolution
        // Points are resolved against solid geometry before constraints are solved
        if (collisionHub) {
            collisionHub.reconcile(this.points);
        }

        /**
         * Step 3: Constraint Satisfaction Loop (Relaxation)
         * Multiple iterations are required to propagate forces across the mesh.
         * Increasing 'stiffness' increases simulation precision at the cost of CPU.
         */
        for (let i = 0; i < stiffness; i++) {
            for (const stick of this.sticks) {
                stick.update(breakingLimit);
            }
        }

        /**
         * Step 4: Maintenance
         * Prune broken constraints to optimize memory and rendering.
         */
        if (breakingLimit > 0) {
            const initialCount = this.sticks.length;
            this.sticks = this.sticks.filter(s => s.isActive);

            // Return true if any sticks were broken this frame for event triggers
            return this.sticks.length < initialCount;
        }

        return false;
    }

    /**
     * Dispatches rendering commands for the mesh.
     * 
     * @param {CanvasRenderingContext2D} ctx 
     * @param {Object} renderOptions - Visualization flags.
     */
    render(ctx, renderOptions) {
        const { tensionAware, fillMesh, materialColor } = renderOptions;

        if (fillMesh) {
            this.renderMesh(ctx, materialColor);
        }

        // Default: Render the skeleton of sticks
        for (const stick of this.sticks) {
            stick.render(ctx, tensionAware, materialColor);
        }
    }

    /**
     * High-fidelity mesh rendering.
     * Fills the quads between points with semi-transparent color.
     */
    renderMesh(ctx, color) {
        ctx.fillStyle = color || 'rgba(79, 70, 229, 0.1)';

        for (let y = 0; y < this.height; y++) {
            for (let x = 0; x < this.width; x++) {
                // Determine the 4 point indices for the current quad
                const p1 = this.points[y * (this.width + 1) + x];
                const p2 = this.points[y * (this.width + 1) + x + 1];
                const p3 = this.points[(y + 1) * (this.width + 1) + x + 1];
                const p4 = this.points[(y + 1) * (this.width + 1) + x];

                // Check if all sticks forming this quad are active
                // (Simplified: check if points are reasonably close)
                ctx.beginPath();
                ctx.moveTo(p1.x, p1.y);
                ctx.lineTo(p2.x, p2.y);
                ctx.lineTo(p3.x, p3.y);
                ctx.lineTo(p4.x, p4.y);
                ctx.closePath();
                ctx.fill();
            }
        }
    }

    /**
     * Localized interaction: Tears the cloth.
     * 
     * @param {number} mouseX 
     * @param {number} mouseY 
     * @param {number} radius - Tearing influence brush size.
     * @returns {Array<Stick>} The sticks that were just broken.
     */
    tear(mouseX, mouseY, radius) {
        const radiusSq = radius * radius;
        const broken = [];

        for (const stick of this.sticks) {
            if (!stick.isActive) continue;

            const centerX = (stick.p1.x + stick.p2.x) / 2;
            const centerY = (stick.p1.y + stick.p2.y) / 2;
            const dx = mouseX - centerX;
            const dy = mouseY - centerY;

            if (dx * dx + dy * dy < radiusSq) {
                stick.isActive = false;
                broken.push(stick);
            }
        }

        return broken;
    }

    /**
     * Spatial Query: Find the closest Point to a coordinate.
     * 
     * @param {number} mouseX 
     * @param {number} mouseY 
     * @param {number} radius - Search radius limit.
     */
    getNearestPoint(mouseX, mouseY, radius) {
        let nearest = null;
        let minDistSq = radius * radius;

        for (const point of this.points) {
            const dx = mouseX - point.x;
            const dy = mouseY - point.y;
            const distSq = dx * dx + dy * dy;

            if (distSq < minDistSq) {
                minDistSq = distSq;
                nearest = point;
            }
        }
        return nearest;
    }

    /**
     * Special Event: Shockwave force application.
     */
    applyExplosion(mouseX, mouseY, radius, strength) {
        for (const point of this.points) {
            const dx = point.x - mouseX;
            const dy = point.y - mouseY;
            const distSq = dx * dx + dy * dy;
            const dist = Math.sqrt(distSq);

            if (dist < radius) {
                const force = (1 - dist / radius) * strength;
                point.applyForce(dx / dist * force, dy / dist * force);
            }
        }
    }

    /**
     * Special Event: Attractor force application.
     */
    applyGravitationalWell(mouseX, mouseY, radius, strength) {
        for (const point of this.points) {
            const dx = mouseX - point.x;
            const dy = mouseY - point.y;
            const distSq = dx * dx + dy * dy;
            const dist = Math.sqrt(distSq);

            if (dist < radius) {
                const force = (1 - dist / radius) * strength;
                point.applyForce(dx / dist * force, dy / dist * force);
            }
        }
    }

    /**
     * Calculates the aggregate tension across the entire cloth.
     * Useful for audio synthesis parameters.
     */
    getGlobalTension() {
        if (this.sticks.length === 0) return 0;
        let total = 0;
        for (const stick of this.sticks) {
            total += stick.tension;
        }
        return total / this.sticks.length;
    }
}
