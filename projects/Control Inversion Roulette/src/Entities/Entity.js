/**
 * Base Entity Class
 * 
 * Represents a generic object in the game world. All moving objects
 * (Player, Enemies, Bullets, Particles) inherit from this class.
 * handling basic properties like position, velocity, and size.
 */
export class Entity {
    constructor(x, y, radius, color) {
        this.x = x;
        this.y = y;
        this.radius = radius;
        this.color = color;

        this.vx = 0;
        this.vy = 0;
        this.rotation = 0;

        this.isMarkedForDeletion = false;
        this.tags = []; // e.g., 'player', 'enemy', 'projectile'
    }

    /**
     * Update the entity state.
     * @param {number} dt Delta time in seconds
     */
    update(dt) {
        this.x += this.vx * dt;
        this.y += this.vy * dt;
    }

    /**
     * Render the entity to the canvas.
     * @param {CanvasRenderingContext2D} ctx 
     */
    draw(ctx) {
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(this.rotation);

        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(0, 0, this.radius, 0, Math.PI * 2);
        ctx.fill();

        ctx.restore();
    }

    /**
     * Mark this entity for removal from the game.
     */
    destroy() {
        this.isMarkedForDeletion = true;
    }

    /**
     * Check if this entity has a specific tag.
     * @param {string} tag 
     * @returns {boolean}
     */
    hasTag(tag) {
        return this.tags.includes(tag);
    }

    /**
     * Add a tag to the entity.
     * @param {string} tag 
     */
    addTag(tag) {
        if (!this.tags.includes(tag)) {
            this.tags.push(tag);
        }
    }
}
