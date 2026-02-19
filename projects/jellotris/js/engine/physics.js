/**
 * Physics Engine
 * Handles integration and constraint solving using Verlet integration.
 */
class Physics {
    constructor() {
        this.bodies = [];
        this.gravity = new Vec2(0, 500); // Gravity
        this.drag = 0.99;
        this.groundY = 800; // Default, will be set by canvas size
        this.width = 400;
        this.substeps = 8; // Higher = more stable simulation
    }

    /**
     * Add a body to the simulation
     * @param {SoftBody} body 
     */
    addBody(body) {
        this.bodies.push(body);
    }

    /**
     * Remove a body from the simulation
     * @param {SoftBody} body 
     */
    removeBody(body) {
        const index = this.bodies.indexOf(body);
        if (index > -1) {
            this.bodies.splice(index, 1);
        }
    }

    /**
     * Main update loop
     * @param {number} dt - Delta time in seconds
     */
    update(dt) {
        const subDt = dt / this.substeps;

        for (let i = 0; i < this.substeps; i++) {
            this.step(subDt);
        }
    }

    /**
     * Perform a single physics substep
     * @param {number} dt - Sub-step delta time
     */
    step(dt) {
        // 1. Apply Forces
        for (let body of this.bodies) {
            for (let p of body.particles) {
                p.applyForce(this.gravity);
                // p.applyForce(wind?);
            }
        }

        // 2. Integrate
        for (let body of this.bodies) {
            for (let p of body.particles) {
                p.update(dt);
            }
        }

        // 3. Solve Constraints (Springs)
        for (let body of this.bodies) {
            for (let s of body.springs) {
                s.update(); // Force-based
                // s.solve(); // Projection-based (choose one)
            }
        }

        // 4. Solve Collisions (Walls, Floor)
        this.constrainToBounds(this.width, this.groundY);
    }

    /**
     * Constrain particles to the world bounds
     * @param {number} width 
     * @param {number} height 
     */
    constrainToBounds(width, height) {
        for (let body of this.bodies) {
            for (let p of body.particles) {
                if (p.pos.x < 0) {
                    p.pos.x = 0;
                    p.vel.x *= -0.5;
                }
                if (p.pos.x > width) {
                    p.pos.x = width;
                    p.vel.x *= -0.5;
                }
                // Floor is handled by the static grid usually
                // But for safety:
                if (p.pos.y > height) {
                    p.pos.y = height;
                    p.vel.y = 0; // stop
                }
            }
        }
    }
}
