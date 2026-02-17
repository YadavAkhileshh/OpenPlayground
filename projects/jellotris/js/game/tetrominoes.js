/**
 * Tetromino Factory
 * Generates SoftBody representations of Tetris shapes.
 */
class TetrominoFactory {
    static get SHAPES() {
        return {
            'I': { color: '#00f0f0', map: [[0, 0, 0, 0], [1, 1, 1, 1], [0, 0, 0, 0], [0, 0, 0, 0]] },
            'O': { color: '#f0f000', map: [[0, 1, 1, 0], [0, 1, 1, 0], [0, 0, 0, 0]] },
            'T': { color: '#a000f0', map: [[0, 1, 0], [1, 1, 1], [0, 0, 0]] },
            'S': { color: '#00f000', map: [[0, 1, 1], [1, 1, 0], [0, 0, 0]] },
            'Z': { color: '#f00000', map: [[1, 1, 0], [0, 1, 1], [0, 0, 0]] },
            'J': { color: '#0000f0', map: [[1, 0, 0], [1, 1, 1], [0, 0, 0]] },
            'L': { color: '#f0a000', map: [[0, 0, 1], [1, 1, 1], [0, 0, 0]] }
        };
    }

    static create(type, startX, startY, cellSize = 40) {
        const def = this.SHAPES[type];
        const body = new SoftBody();
        body.color = def.color;
        body.type = type;

        // Map shape definition to particle grid
        // We need vertices. A w x h grid of blocks needs (w+1) x (h+1) potential vertices.
        // But we only create vertices that are corners of active blocks.

        const map = def.map;
        const rows = map.length;
        const cols = map[0].length;

        // Store created particles by coordinate key "r,c" to avoid duplicates (shared vertices)
        const particles = {};

        const getParticle = (r, c) => {
            const key = `${r},${c}`;
            if (!particles[key]) {
                const px = startX + c * cellSize;
                const py = startY + r * cellSize;
                const p = new Particle(px, py, 1.0); // Mass 1.0
                p.radius = cellSize / 10; // Small radius for collision
                particles[key] = p;
                body.addParticle(p);
            }
            return particles[key];
        };

        // Create particles and springs
        for (let r = 0; r < rows; r++) {
            for (let c = 0; c < cols; c++) {
                if (map[r][c] === 1) {
                    // This creates a block at row r, col c
                    // Vertices: (r,c), (r,c+1), (r+1,c), (r+1,c+1)

                    const tl = getParticle(r, c);
                    const tr = getParticle(r, c + 1);
                    const bl = getParticle(r + 1, c);
                    const br = getParticle(r + 1, c + 1);

                    // Add Structural Springs (edges)
                    // We need to check if springs already exist to avoid doubling up?
                    // The SoftBody handles array of springs. We can just add them and potential duplicates needed?
                    // No, duplicates are bad for stability (double force).
                    // We'll track spring keys.
                }
            }
        }

        // Simpler pass: Create all necessary particles first, then connect neighbors.
        // Step 1: define which vertices exist
        // A vertex (r, c) exists if any block [r-1,c-1], [r-1,c], [r,c-1], [r,c] is active?
        // Actually, vertex (r,c) is the Top-Left of block (r,c).
        // It is also TR of (r, c-1), BL of (r-1, c), BR of (r-1, c-1).

        return this.constructBodyFromMap(map, body, startX, startY, cellSize);
    }

    static constructBodyFromMap(map, body, startX, startY, cellSize) {
        const rows = map.length;
        const cols = map[0].length;
        const particleMap = {};

        // Helper to add spring if not exists
        const springKeys = new Set();
        const addSpring = (p1, p2, k, damp) => {
            // Sort by ID or position to make key unique
            const id1 = body.particles.indexOf(p1);
            const id2 = body.particles.indexOf(p2);
            const key = id1 < id2 ? `${id1}-${id2}` : `${id2}-${id1}`;

            if (!springKeys.has(key)) {
                springKeys.add(key);
                const dist = p1.pos.dist(p2.pos);
                body.addSpring(new Spring(p1, p2, dist, k, damp));
            }
        };

        // 1. Create Particles
        for (let r = 0; r < rows; r++) {
            for (let c = 0; c < cols; c++) {
                if (map[r][c] === 1) {
                    // Activate 4 corners
                    const corners = [
                        { r: r, c: c },     // TL
                        { r: r, c: c + 1 },   // TR
                        { r: r + 1, c: c },   // BL
                        { r: r + 1, c: c + 1 }  // BR
                    ];

                    corners.forEach(coord => {
                        const key = `${coord.r},${coord.c}`;
                        if (!particleMap[key]) {
                            const p = new Particle(
                                startX + coord.c * cellSize,
                                startY + coord.r * cellSize
                            );
                            particleMap[key] = p;
                            body.addParticle(p);
                        }
                    });
                }
            }
        }

        // 2. Connect Springs
        // Iterate blocks again to connect their corners
        const stiffness = 800;
        const damping = 15;
        const shearStiffness = 500;

        for (let r = 0; r < rows; r++) {
            for (let c = 0; c < cols; c++) {
                if (map[r][c] === 1) {
                    const tl = particleMap[`${r},${c}`];
                    const tr = particleMap[`${r},${c + 1}`];
                    const bl = particleMap[`${r + 1},${c}`];
                    const br = particleMap[`${r + 1},${c + 1}`];

                    // Structural (Edges)
                    addSpring(tl, tr, stiffness, damping);
                    addSpring(tr, br, stiffness, damping);
                    addSpring(br, bl, stiffness, damping);
                    addSpring(bl, tl, stiffness, damping);

                    // Cross-bracing (Shear)
                    addSpring(tl, br, shearStiffness, damping);
                    addSpring(tr, bl, shearStiffness, damping);
                }
            }
        }

        body.updateCenter();
        return body;
    }
}
