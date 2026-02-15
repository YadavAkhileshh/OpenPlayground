/**
 * SlimeNet - Agent System (Physarum Polycephalum)
 * 
 * Manages thousands of independent agents using Structure of Arrays (SoA).
 * UPDATED: Multi-Species, Obstacle Avoidance, Flow influence.
 */

class AgentSystem {
    constructor(count, width, height) {
        this.count = count;
        this.width = width;
        this.height = height;

        // Structure of Arrays
        try {
            this.x = new Float32Array(count);
            this.y = new Float32Array(count);
            this.angle = new Float32Array(count); // Radians
            this.species = new Uint8Array(count); // 0 or 1
        } catch (e) {
            Logger.error('AgentSystem', 'Failed to allocate memory for agents', e);
            throw e;
        }

        this.initRandom();
        Logger.info('AgentSystem', `Initialized ${count} agents`);
    }

    /**
     * Spawns agents randomly across the screen.
     */
    initRandom() {
        for (let i = 0; i < this.count; i++) {
            this.x[i] = Math.random() * this.width;
            this.y[i] = Math.random() * this.height;
            this.angle[i] = Math.random() * Math.PI * 2;
            this.species[i] = Math.random() > 0.5 ? 1 : 0; // 50/50 split
        }
    }

    /**
     * Spawns agents in a circle (e.g. at the center).
     */
    initCircle(cx, cy, radius) {
        for (let i = 0; i < this.count; i++) {
            const pt = MathUtils.randomPointInCircle(cx, cy, radius);
            this.x[i] = pt.x;
            this.y[i] = pt.y;
            this.angle[i] = Math.random() * Math.PI * 2;
        }
    }

    /**
     * Main update loop for all agents.
     * 1. Sense environment (Left, Forward, Right)
     * 2. Rotate towards strongest signal
     * 3. Move
     * 4. Deposit trail
     * 
     * @param {Grid} grid The pheromone grid
     * @param {number} deltaTime Time step (useful for movement independent of FPS)
     */
    update(grid, deltaTime) {
        // Pre-fetch config values to avoid dictionary lookups in tight loop
        const moveSpeed = Config.agents.speed;
        const sensorDist = Config.agents.sensorDist;
        const sensorAngle = Config.agents.sensorAngle * MathUtils.DEG_TO_RAD;
        const turnSpeed = Config.agents.turnSpeed * MathUtils.DEG_TO_RAD * deltaTime * 60; // Normalize
        const depositAmount = Config.grid.pheromoneStrength;
        const w = this.width;
        const h = this.height;
        const flowX = Config.grid.flowX; // Feature 5
        const flowY = Config.grid.flowY;

        const xArr = this.x;
        const yArr = this.y;
        const aArr = this.angle;
        const sArr = this.species;

        // Iterate backwards for minor perf boost in some engines (usually negligible in V8 but safeguards against length changes)
        for (let i = this.count - 1; i >= 0; i--) {
            let x = xArr[i];
            let y = yArr[i];
            let angle = aArr[i];
            const speciesID = sArr[i];

            // Feature 1: Multi-Species Sensing
            // Agents only sense their own pheromones (or shared food)

            // --- 1. SENSING ---

            // Calculate sensor positions
            // Left Sensor
            const slX = Math.round(x + Math.cos(angle - sensorAngle) * sensorDist);
            const slY = Math.round(y + Math.sin(angle - sensorAngle) * sensorDist);
            const slVal = grid.getValue(slX, slY, speciesID); // Pass speciesID

            // Forward Sensor
            const sfX = Math.round(x + Math.cos(angle) * sensorDist);
            const sfY = Math.round(y + Math.sin(angle) * sensorDist);
            const sfVal = grid.getValue(sfX, sfY, speciesID);

            // Right Sensor
            const srX = Math.round(x + Math.cos(angle + sensorAngle) * sensorDist);
            const srY = Math.round(y + Math.sin(angle + sensorAngle) * sensorDist);
            const srVal = grid.getValue(srX, srY, speciesID);

            // --- 2. STEERING ---

            if (sfVal > slVal && sfVal > srVal) {
                // Keep moving forward (no turn)
            } else if (sfVal < slVal && sfVal < srVal) {
                // Surrounded? Random turn
                angle += (Math.random() - 0.5) * 2 * turnSpeed;
            } else if (slVal > srVal) {
                // Left is stronger
                angle -= turnSpeed;
            } else if (srVal > slVal) {
                // Right is stronger
                angle += turnSpeed;
            } else {
                // No clear signal / empty space -> Wiggle slightly to avoid straight lines forever
                // angle += (Math.random() - 0.5) * 0.1;
            }

            // Feature 5: Flow Field
            // Add slight push to angle or position? Real physarum drifts.
            // We just bias the position directly.

            // Update stored angle
            aArr[i] = angle;

            // --- 3. MOVEMENT ---
            let nextX = x + Math.cos(angle) * moveSpeed + flowX;
            let nextY = y + Math.sin(angle) * moveSpeed + flowY;

            // Feature 2: Obstacles
            // Check if next pos is obstacle
            const nextXi = Math.round(nextX);
            const nextYi = Math.round(nextY);
            let hitWall = false;

            if (grid.isObstacle(nextXi, nextYi)) {
                hitWall = true;
            }

            // Boundary Check (Bounce)
            if (nextX < 0 || nextX >= w || nextY < 0 || nextY >= h || hitWall) {
                // Simple bounce: reverse angle 180 + some noise
                aArr[i] = angle + Math.PI + (Math.random() - 0.5);

                // Don't update position if wall hit
                if (!hitWall) {
                    // Clamp position
                    xArr[i] = Math.min(Math.max(nextX, 0), w - 1);
                    yArr[i] = Math.min(Math.max(nextY, 0), h - 1);
                }
            } else {
                xArr[i] = nextX;
                yArr[i] = nextY;

                // --- 4. DEPOSIT ---
                // Only deposit if inside bounds (checked implicitly by grid.deposit or explicit check)
                // Casting to int for grid index
                grid.deposit(nextX | 0, nextY | 0, depositAmount, speciesID);
            }
        }
    }
}

window.AgentSystem = AgentSystem;
