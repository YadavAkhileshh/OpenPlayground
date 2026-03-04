/**
 * Line Clearing Logic
 */
class LineManager {
    constructor(game) {
        this.game = game;
    }

    checkLines() {
        // Iterate over grid rows (from bottom up)
        const g = this.game.grid;
        let linesCleared = 0;

        // We need a way to check if a row is "full".
        // Since we don't snap perfect grid, we check occupancy.
        // A row is full if every cell in that row contains a particle from a 'locked' body.

        // This is tricky because particles are continuous.
        // We can map particles to grid cells first.

        const cellOccupancy = new Array(g.rows).fill(0).map(() => new Array(g.cols).fill(false));

        // Populate map
        // Note: We only check bodies that are "static" or "sleeping"? 
        // Or all bodies except the current one?
        // Ideally only settled bodies.

        for (let body of this.game.physics.bodies) {
            if (body === this.game.currentBody) continue; // Don't clear active piece

            for (let p of body.particles) {
                const { col, row } = g.toGrid(p.pos.x, p.pos.y);
                if (row >= 0 && row < g.rows && col >= 0 && col < g.cols) {
                    cellOccupancy[row][col] = true;
                }
            }
        }

        // Check for full rows
        for (let r = 0; r < g.rows; r++) {
            let full = true;
            for (let c = 0; c < g.cols; c++) {
                if (!cellOccupancy[r][c]) {
                    full = false;
                    break;
                }
            }

            if (full) {
                this.clearLine(r);
                linesCleared++;
            }
        }

        return linesCleared;
    }

    clearLine(row) {
        // Destroy particles and springs in this row
        const g = this.game.grid;
        const yMin = row * g.cellSize;
        const yMax = (row + 1) * g.cellSize;

        // Iterate all bodies
        // We use a reverse loop because we might remove bodies
        for (let i = this.game.physics.bodies.length - 1; i >= 0; i--) {
            const body = this.game.physics.bodies[i];
            if (body === this.game.currentBody) continue;

            // Find particles in range
            // We can't easily remove particles from an array while iterating springs efficiently
            // unless we mark them dead first.

            const particlesToRemove = [];

            for (let p of body.particles) {
                if (p.pos.y >= yMin && p.pos.y < yMax) {
                    particlesToRemove.push(p);
                    // Effect
                    this.game.effects.explode(p.pos.x, p.pos.y, body.color);
                }
            }

            if (particlesToRemove.length > 0) {
                // Remove springs connected to these particles
                for (let j = body.springs.length - 1; j >= 0; j--) {
                    const s = body.springs[j];
                    if (particlesToRemove.includes(s.p1) || particlesToRemove.includes(s.p2)) {
                        body.springs.splice(j, 1);
                    }
                }

                // Remove particles
                for (let p of particlesToRemove) {
                    const idx = body.particles.indexOf(p);
                    if (idx > -1) body.particles.splice(idx, 1);
                }

                // If body is empty, remove it
                if (body.particles.length === 0) {
                    this.game.physics.removeBody(body);
                }
            }
        }
    }
}
