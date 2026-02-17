/**
 * Core Game Loop
 */
class Game {
    constructor() {
        this.canvas = document.getElementById('game-canvas');
        this.physics = new Physics();
        this.grid = new Grid(10, 20, 40);
        this.renderer = new Renderer(this.canvas, this);
        this.controller = new Controller(this);
        this.spawner = new Spawner(this);
        this.effects = new Effects();
        this.lineManager = new LineManager(this);
        this.collision = new Collision(this.grid);

        this.isRunning = false;
        this.lastTime = 0;
        this.currentBody = null;
        this.score = 0;
        this.lines = 0;
        this.level = 1;
    }

    init() {
        this.renderer.resize();
        window.addEventListener('resize', () => this.renderer.resize());

        // Show start screen
        document.getElementById('start-screen').classList.add('active');

        // Request frame but don't start loop logic until running
        requestAnimationFrame((t) => this.loop(t));
    }

    start() {
        if (this.isRunning) return;
        this.isRunning = true;
        this.physics.bodies = [];
        this.grid.clear();
        this.score = 0;
        this.lines = 0;
        this.updateUI();

        document.getElementById('start-screen').classList.remove('active');
        document.getElementById('game-over-screen').classList.remove('active');

        this.spawner.spawn();
    }

    gameOver() {
        this.isRunning = false;
        document.getElementById('game-over-screen').classList.add('active');
        document.getElementById('final-score').innerText = this.score;

        document.getElementById('restart-btn').onclick = () => {
            this.start();
        };
    }

    loop(timestamp) {
        const dt = (timestamp - this.lastTime) / 1000;
        this.lastTime = timestamp;

        if (this.isRunning) {
            this.update(Math.min(dt, 0.05)); // Cap dt
        }

        this.renderer.render();
        requestAnimationFrame((t) => this.loop(t));
    }

    update(dt) {
        // 1. Physics Step
        this.physics.update(dt);

        // 2. Collision Resolution
        // Iterate all active bodies
        // Actually physics.step handles integration.
        // We need custom collision logic here or in physics?
        // Physics class calls constrainToBounds. 
        // We need to inject our Grid collision logic.

        // Check current body vs grid/walls
        if (this.currentBody) {
            const collided = this.collision.resolve(this.currentBody);

            // If active body is essentially stopped or hitting floor heavily, locking logic?
            // Soft body locking is hard.
            // We can lock if:
            // - It's colliding with floor or another static body
            // - AND its velocity is low

            let isStable = true;
            let totalVel = 0;
            for (let p of this.currentBody.particles) {
                const v = p.pos.sub(p.prevPos).mag(); // Approx vel
                totalVel += v;
                if (v > 0.5) isStable = false; // Threshold
            }

            // Checking if we should lock
            // If it has collided and is slow?
            // Or simple timer?

        }

        // Resolve all bodies against walls (keep them in bounds)
        this.physics.constrainToBounds(400, 800); // 10 * 40, 20 * 40

        // 2.5 Resolve Body vs Body
        // Naive O(N^2) particle check or bounding box optimization
        this.resolveBodyCollisions();

        // 3. Game Logic
        // Check for lines
        // Only if we just locked a piece?
        // Let's check periodically or when things are stable.
        // For jelly tetris, real-time clearing is fun.
        if (Math.random() < 0.1) { // Throttle
            const cleared = this.lineManager.checkLines();
            if (cleared > 0) {
                this.score += cleared * 100;
                this.lines += cleared;
                this.updateUI();
                // Screen shake?
                this.canvas.classList.add('shake');
                setTimeout(() => this.canvas.classList.remove('shake'), 500);
            }
        }

        // Check if we need to spawn new piece
        // Condition: Current piece is "locked" or we forced a lock.
        // In soft body, we spawn when the user controls the current piece into a stable position.
        // Or we just give command to "drop" and then it's no longer current.
        // Let's say: if the current piece has collided with something (floor/stack) AND is below a certain speed after X seconds?
        // OR: simpler arcade rule -> User presses "Down" to smash it, then after delay spawn new?
        // Let's implement a timer. If collision detected, start locking timer.

        this.handleLocking(dt);
    }

    handleLocking(dt) {
        if (!this.currentBody) return;

        // Check if any particle is resting on something
        // We can check if `collision.resolve` returned true for floor/grid.
        // But we need to know if it's "supported".
        // Simple heuristic: bounding box velocity.

        let avgVel = 0;
        for (let p of this.currentBody.particles) {
            avgVel += p.pos.sub(p.prevPos).mag();
        }
        avgVel /= this.currentBody.particles.length;

        // If slow, increment timer
        // If slow active for > 0.5s, lock.
        if (avgVel < 0.2) {
            this.lockTimer = (this.lockTimer || 0) + dt;
        } else {
            this.lockTimer = 0;
        }

        // Also strictly spawn if Y is too high (game over)

        if (this.lockTimer > 0.5) {
            // Lock
            this.currentBody = null; // No longer controllable
            this.lockTimer = 0;

            // Check Game Over
            // If the piece locked entirely above the screen?
            // Actually, we spawn at -80 (Y < 0).
            // If it locks and max Y < 0 -> Game Over?

            this.spawner.spawn();
        }
    }

    resolveBodyCollisions() {
        const bodies = this.physics.bodies;
        for (let i = 0; i < bodies.length; i++) {
            for (let j = i + 1; j < bodies.length; j++) {
                // Check BBox
                const b1 = bodies[i].getBoundingBox();
                const b2 = bodies[j].getBoundingBox();

                if (b1.maxX < b2.minX || b1.minX > b2.maxX || b1.maxY < b2.minY || b1.minY > b2.maxY) continue;

                // Particle vs Particle repulsion (expensive but good for jelly)
                for (let p1 of bodies[i].particles) {
                    for (let p2 of bodies[j].particles) {
                        const dx = p1.pos.x - p2.pos.x;
                        const dy = p1.pos.y - p2.pos.y;
                        const d2 = dx * dx + dy * dy;
                        const minDist = p1.radius + p2.radius;

                        if (d2 < minDist * minDist && d2 > 0) {
                            const dist = Math.sqrt(d2);
                            const overlap = minDist - dist;
                            const nx = dx / dist;
                            const ny = dy / dist;

                            const force = 0.5 * overlap; // simple position correction

                            // Separate
                            p1.pos.x += nx * force;
                            p1.pos.y += ny * force;
                            p2.pos.x -= nx * force;
                            p2.pos.y -= ny * force;

                            // Friction/Damping logic could go here
                        }
                    }
                }
            }
        }
    }

    updateUI() {
        document.getElementById('score').innerText = this.score;
        document.getElementById('lines').innerText = this.lines;
        document.getElementById('level').innerText = this.level;
    }
}

// Expose to window
window.JelloTris = { Game };
