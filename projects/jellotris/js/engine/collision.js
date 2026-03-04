/**
 * Collision Handler
 * Manages interactions between dynamic soft bodies and the static environment.
 */
class Collision {
    /**
     * Create a Collision handler
     * @param {Grid} grid - The game grid reference
     */
    constructor(grid) {
        this.grid = grid;
    }

    /**
     * Resolve collisions between a SoftBody and the Grid (Walls/Floor/StaticBlocks)
     * @param {SoftBody} body - The body to test
     * @returns {boolean} True if any collision occurred
     */
    resolve(body) {
        let hasCollision = false;

        for (let p of body.particles) {
            // 1. Wall Collisions
            if (p.pos.x - p.radius < 0) {
                p.pos.x = p.radius;
                p.vel.x *= -0.5;
                p.prevPos.x = p.pos.x + p.vel.x; // approximate reflection
                hasCollision = true;
            }
            const width = this.grid.cols * this.grid.cellSize;
            if (p.pos.x + p.radius > width) {
                p.pos.x = width - p.radius;
                p.vel.x *= -0.5;
                p.prevPos.x = p.pos.x + p.vel.x;
                hasCollision = true;
            }

            // 2. Floor Collision
            const height = this.grid.rows * this.grid.cellSize;
            if (p.pos.y + p.radius > height) {
                p.pos.y = height - p.radius;
                p.vel.y = 0;
                p.prevPos.y = p.pos.y; // Stop dead on floor
                hasCollision = true;
            }

            // 3. Grid Cell Collisions (Static Blocks)
            // We check the grid cell the particle is in.
            // If it's occupied, we push the particle out.
            // A simple way is to check 4 corners or just center.
            this.resolveParticleGrid(p);
        }
        return hasCollision;
    }

    /**
     * Resolve single particle vs grid cell collision
     * @param {Particle} p
     */
    resolveParticleGrid(p) {
        // Simple AABB check against grid cells
        // Determine which cell the particle is in
        const cx = Math.floor(p.pos.x / this.grid.cellSize);
        const cy = Math.floor(p.pos.y / this.grid.cellSize);

        // Check neighbors for collision
        // We only check "solid" cells
        // Simplification: treating cells as AABBs

        const cellRadius = this.grid.cellSize / 2;

        for (let dy = -1; dy <= 1; dy++) {
            for (let dx = -1; dx <= 1; dx++) {
                const nx = cx + dx;
                const ny = cy + dy;

                if (this.grid.get(nx, ny)) {
                    // Cell is occupied. Collide against it.
                    // Cell center
                    const cellX = nx * this.grid.cellSize + cellRadius;
                    const cellY = ny * this.grid.cellSize + cellRadius;

                    // Closest point on AABB to sphere
                    const closestX = Math.max(nx * this.grid.cellSize, Math.min(p.pos.x, (nx + 1) * this.grid.cellSize));
                    const closestY = Math.max(ny * this.grid.cellSize, Math.min(p.pos.y, (ny + 1) * this.grid.cellSize));

                    const distX = p.pos.x - closestX;
                    const distY = p.pos.y - closestY;
                    const distSq = distX * distX + distY * distY;

                    if (distSq < p.radius * p.radius) {
                        const dist = Math.sqrt(distSq);
                        const overlap = p.radius - dist;

                        // Normal
                        let normalX = distX / dist;
                        let normalY = distY / dist;

                        if (dist === 0) {
                            // Degenerate case, push up
                            normalX = 0;
                            normalY = -1;
                        }

                        // Push out
                        p.pos.x += normalX * overlap;
                        p.pos.y += normalY * overlap;

                        // Apply friction
                        const tangentX = -normalY;
                        const tangentY = normalX;
                        const vDotT = (p.pos.x - p.prevPos.x) * tangentX + (p.pos.y - p.prevPos.y) * tangentY;

                        // Simple friction
                        // p.prevPos.x += tangentX * vDotT * 0.1;
                        // p.prevPos.y += tangentY * vDotT * 0.1;
                    }
                }
            }
        }
    }
}
