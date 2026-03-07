// world.js

class World {
    constructor(width, height) {
        this.width = width;
        this.height = height;
        this.prey = [];
        this.predators = [];
        this.food = [];
        this.particles = []; // VFX
        this.time = 0;
        this.dayTime = 0; // 0 to CONFIG.WORLD.DAY_NIGHT_CYCLE_LENGTH
        this.lightLevel = 1; // 1 = Day, 0 = Night
        this.lastFoodSpawn = 0;

        this.initialize();
    }

    initialize() {
        // Create initial prey
        for (let i = 0; i < CONFIG.INITIAL_PREY; i++) {
            this.prey.push(new Agent(
                Utils.random(50, this.width - 50),
                Utils.random(50, this.height - 50),
                'prey',
                CONFIG.PREY
            ));
        }

        // Create initial predators
        for (let i = 0; i < CONFIG.INITIAL_PREDATORS; i++) {
            this.predators.push(new Agent(
                Utils.random(50, this.width - 50),
                Utils.random(50, this.height - 50),
                'predator',
                CONFIG.PREDATOR
            ));
        }

        // Create initial food
        for (let i = 0; i < CONFIG.INITIAL_FOOD; i++) {
            this.spawnFood();
        }
    }

    createExplosion(x, y, color, count = 10) {
        for (let i = 0; i < count; i++) {
            this.particles.push(new Particle(x, y, color));
        }
    }

    update(deltaTime) {
        this.time += deltaTime;

        // Update Day/Night Cycle
        this.dayTime = (this.time / 1000) % CONFIG.WORLD.DAY_NIGHT_CYCLE_LENGTH;
        const cycleProgress = this.dayTime / CONFIG.WORLD.DAY_NIGHT_CYCLE_LENGTH; // 0 to 1
        // Simple Sine wave for light: 0.5 + 0.5*sin(...)
        // Let's make it: Day (start) -> Night (middle) -> Day (end)
        this.lightLevel = 0.5 + 0.5 * Math.cos(cycleProgress * Math.PI * 2);

        // Update particles
        for (let i = this.particles.length - 1; i >= 0; i--) {
            this.particles[i].update();
            if (this.particles[i].life <= 0) {
                this.particles.splice(i, 1);
            }
        }

        // Update all prey
        for (let agent of this.prey) {
            agent.update(this, deltaTime);
        }

        // Update all predators
        for (let agent of this.predators) {
            agent.update(this, deltaTime);
        }

        // Check prey eating food
        for (let agent of this.prey) {
            for (let food of this.food) {
                if (!food.consumed) {
                    const dist = Utils.distance(agent.pos.x, agent.pos.y, food.x, food.y);
                    if (dist < agent.radius + food.radius) {
                        agent.energy = Math.min(
                            agent.energy + CONFIG.PREY.ENERGY_FROM_FOOD,
                            CONFIG.PREY.MAX_ENERGY
                        );
                        food.consumed = true;
                        this.createExplosion(food.x, food.y, CONFIG.FOOD.COLOR, 5); // Food burst
                    }
                }
            }
        }

        // Check predators catching prey
        for (let predator of this.predators) {
            for (let prey of this.prey) {
                if (!prey.dead) {
                    const dist = Utils.distance(predator.pos.x, predator.pos.y, prey.pos.x, prey.pos.y);
                    if (dist < CONFIG.PREDATOR.CATCH_DISTANCE + predator.radius) {
                        predator.energy = Math.min(
                            predator.energy + CONFIG.PREDATOR.ENERGY_FROM_PREY,
                            CONFIG.PREDATOR.MAX_ENERGY
                        );
                        prey.dead = true;
                        this.createExplosion(prey.pos.x, prey.pos.y, CONFIG.PREY.COLOR, 15); // Blood/Energy burst
                        this.createExplosion(prey.pos.x, prey.pos.y, '#ffffff', 5); // Flash
                    }
                }
            }
        }

        // Reproduction (with rate limits)
        const newPrey = [];
        for (let agent of this.prey) {
            if (agent.canReproduce() && this.prey.length < 150) {
                if (Math.random() < 0.01) {
                    newPrey.push(agent.reproduce());
                    this.createExplosion(agent.pos.x, agent.pos.y, '#ffffff', 5); // Birth flash
                }
            }
        }
        this.prey.push(...newPrey);

        const newPredators = [];
        for (let agent of this.predators) {
            if (agent.canReproduce() && this.predators.length < 50) {
                if (Math.random() < 0.005) {
                    newPredators.push(agent.reproduce());
                    this.createExplosion(agent.pos.x, agent.pos.y, '#ff8888', 8); // Predator birth
                }
            }
        }
        this.predators.push(...newPredators);

        // Remove dead agents
        this.prey = this.prey.filter(agent => !agent.dead);
        this.predators = this.predators.filter(agent => !agent.dead);

        // Remove consumed food
        this.food = this.food.filter(food => !food.consumed);

        // Spawn new food
        if (this.time - this.lastFoodSpawn > CONFIG.FOOD.SPAWN_INTERVAL) {
            if (this.food.length < CONFIG.FOOD.MAX_FOOD) {
                this.spawnFood();
            }
            this.lastFoodSpawn = this.time;
        }
    }

    spawnFood() {
        this.food.push(new Food(
            Utils.random(30, this.width - 30),
            Utils.random(30, this.height - 30)
        ));
    }

    draw(ctx) {
        // Clear background with nice fade for trails
        ctx.fillStyle = `rgba(2, 6, 23, ${CONFIG.WORLD.TRAIL_OPACITY || 0.3})`;
        ctx.fillRect(0, 0, this.width, this.height);

        // Draw Cyber Grid
        this.drawGrid(ctx);

        // Draw particles (below agents)
        for (let p of this.particles) {
            p.draw(ctx);
        }

        // Draw food
        for (let food of this.food) {
            food.draw(ctx);
        }

        // Draw prey
        for (let agent of this.prey) {
            agent.draw(ctx);
        }

        // Draw predators
        for (let agent of this.predators) {
            agent.draw(ctx);
        }

        // Day/Night Cycle Overlay
        const nightAlpha = (1 - this.lightLevel) * (CONFIG.WORLD.NIGHT_DARKNESS || 0.8);
        if (nightAlpha > 0.05) {
            ctx.fillStyle = `rgba(0, 0, 10, ${nightAlpha})`;
            ctx.fillRect(0, 0, this.width, this.height);

            // Draw "Day" label or icon could be added here
        }
    }

    drawGrid(ctx) {
        ctx.save();
        ctx.strokeStyle = `rgba(50, 60, 100, 0.15)`;
        ctx.lineWidth = 1;
        const gridSize = 40;

        // Offset grid slightly based on time to make it feel alive
        const offset = (this.time / 50) % gridSize;

        ctx.beginPath();
        for (let x = offset; x < this.width; x += gridSize) {
            ctx.moveTo(x, 0);
            ctx.lineTo(x, this.height);
        }
        for (let y = offset; y < this.height; y += gridSize) {
            ctx.moveTo(0, y);
            ctx.lineTo(this.width, y);
        }
        ctx.stroke();
        ctx.restore();
    }

    reset() {
        this.prey = [];
        this.predators = [];
        this.food = [];
        this.particles = [];
        this.time = 0;
        this.dayTime = 0;
        this.lightLevel = 1;
        this.lastFoodSpawn = 0;
        this.initialize();
    }

    getStats() {
        return {
            preyCount: this.prey.length,
            predatorCount: this.predators.length,
            foodCount: this.food.length,
            time: this.time,
            isNight: this.lightLevel < 0.3 ? "Yes" : "No"
        };
    }
}