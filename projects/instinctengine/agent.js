// agent.js

class Agent {
    constructor(x, y, type, config, dna = null, brain = null) {
        this.pos = { x: x, y: y };
        this.vel = { x: Utils.random(-1, 1), y: Utils.random(-1, 1) };
        this.acc = { x: 0, y: 0 };

        this.type = type;
        this.config = config;

        // genetics
        if (dna) {
            this.dna = dna;
        } else {
            this.dna = {
                maxSpeed: config.MAX_SPEED,
                maxForce: config.MAX_FORCE,
                senseRadius: type === 'prey' ? config.FLEE_DISTANCE : config.CHASE_DISTANCE,
                size: config.RADIUS
            };
        }

        // Brain
        if (brain) {
            this.brain = brain.copy();
            this.brain.mutate(CONFIG.MUTATION_RATE);
        } else {
            this.brain = new NeuralNetwork(CONFIG.BRAIN.INPUTS, CONFIG.BRAIN.HIDDEN, CONFIG.BRAIN.OUTPUTS);
        }

        this.radius = this.dna.size;
        this.energy = config.MAX_ENERGY;
        this.dead = false;

        // visual pulse
        this.pulse = 0;
        this.thought = { wander: 0, flee: 0, chase: 0 };
    }

    applyForce(force) {
        this.acc.x += force.x;
        this.acc.y += force.y;
    }

    // Steering behavior: Seek target
    seek(target) {
        let desired = {
            x: target.x - this.pos.x,
            y: target.y - this.pos.y
        };

        // Normalize and scale to max speed
        const d = Math.sqrt(desired.x * desired.x + desired.y * desired.y);
        if (d > 0) {
            desired.x = (desired.x / d) * this.dna.maxSpeed;
            desired.y = (desired.y / d) * this.dna.maxSpeed;

            // Steering = Desired - Velocity
            let steer = {
                x: desired.x - this.vel.x,
                y: desired.y - this.vel.y
            };

            // Limit to max force
            const steerLen = Math.sqrt(steer.x * steer.x + steer.y * steer.y);
            if (steerLen > this.dna.maxForce) {
                steer.x = (steer.x / steerLen) * this.dna.maxForce;
                steer.y = (steer.y / steerLen) * this.dna.maxForce;
            }
            return steer;
        }
        return { x: 0, y: 0 };
    }

    // Steering behavior: Separate from nearby agents
    separate(agents) {
        let steer = { x: 0, y: 0 };
        let count = 0;
        const desiredSeparation = this.config.SEPARATION_DISTANCE;

        for (let other of agents) {
            if (other === this) continue;

            const d = Utils.distance(this.pos.x, this.pos.y, other.pos.x, other.pos.y);

            if (d > 0 && d < desiredSeparation) {
                // Vector pointing away from neighbor
                let diff = {
                    x: this.pos.x - other.pos.x,
                    y: this.pos.y - other.pos.y
                };

                // Weight by distance
                diff.x /= d;
                diff.y /= d;

                steer.x += diff.x;
                steer.y += diff.y;
                count++;
            }
        }

        if (count > 0) {
            steer.x /= count;
            steer.y /= count;

            const len = Math.sqrt(steer.x * steer.x + steer.y * steer.y);
            if (len > 0) {
                steer.x = (steer.x / len) * this.dna.maxSpeed;
                steer.y = (steer.y / len) * this.dna.maxSpeed;

                steer.x -= this.vel.x;
                steer.y -= this.vel.y;

                const steerLen = Math.sqrt(steer.x * steer.x + steer.y * steer.y);
                if (steerLen > this.dna.maxForce) {
                    steer.x = (steer.x / steerLen) * this.dna.maxForce;
                    steer.y = (steer.y / steerLen) * this.dna.maxForce;
                }
            }
        }
        return steer;
    }

    think(world) {
        // Collect Inputs
        // 1. Energy (normalized 0-1) - High energy = 1
        const energyInput = this.energy / this.config.MAX_ENERGY;

        // 2. Nearest Food Distance (inverted normalized)
        // 1.0 = On top of food, 0.0 = Far away (>200px)
        let nearestFoodDist = Infinity;
        let nearestFood = null;
        for (let f of world.food) {
            if (f.consumed) continue;
            const d = Utils.distance(this.pos.x, this.pos.y, f.x, f.y);
            if (d < nearestFoodDist) {
                nearestFoodDist = d;
                nearestFood = f;
            }
        }
        // Invert: Close is HIGH signal
        const foodInput = 1 - Utils.clamp(nearestFoodDist / 200, 0, 1);

        // 3. Nearest Threat/Prey Distance (inverted normalized)
        let nearestThreatDist = Infinity;
        if (this.type === 'prey') {
            for (let p of world.predators) {
                const d = Utils.distance(this.pos.x, this.pos.y, p.pos.x, p.pos.y);
                if (d < nearestThreatDist) nearestThreatDist = d;
            }
        } else {
            // For predators, this is "Nearest Prey" input
            for (let p of world.prey) {
                const d = Utils.distance(this.pos.x, this.pos.y, p.pos.x, p.pos.y);
                if (d < nearestThreatDist) nearestThreatDist = d;
            }
        }
        // Invert: Close is HIGH signal
        const threatInput = 1 - Utils.clamp(nearestThreatDist / 200, 0, 1);

        // 4. Bias
        const biasInput = 1;

        // Feed to Brain
        const inputs = [energyInput, foodInput, threatInput, biasInput];
        const outputs = this.brain.predict(inputs);

        // Interpret Outputs
        // Output 0: Wander Weight
        // Output 1: Flee/Avoid Weight
        // Output 2: Chase/Eat Weight
        return {
            wander: outputs[0],
            flee: outputs[1],
            chase: outputs[2],
            targetFood: nearestFood
        };
    }

    update(world, deltaTime) {
        // Brain Processing
        this.thought = this.think(world);

        // Behaviors
        if (this.type === 'prey') {
            this.preyBehavior(world);
        } else {
            this.predatorBehavior(world);
        }

        // Boundaries
        const boundaryObj = {
            x: Math.min(Math.max(this.pos.x, CONFIG.WORLD.BOUNDARY_MARGIN), world.width - CONFIG.WORLD.BOUNDARY_MARGIN),
            y: Math.min(Math.max(this.pos.y, CONFIG.WORLD.BOUNDARY_MARGIN), world.height - CONFIG.WORLD.BOUNDARY_MARGIN)
        };

        if (this.pos.x < CONFIG.WORLD.BOUNDARY_MARGIN || this.pos.x > world.width - CONFIG.WORLD.BOUNDARY_MARGIN ||
            this.pos.y < CONFIG.WORLD.BOUNDARY_MARGIN || this.pos.y > world.height - CONFIG.WORLD.BOUNDARY_MARGIN) {
            const desired = {
                x: boundaryObj.x - this.pos.x,
                y: boundaryObj.y - this.pos.y
            };
            const d = Math.sqrt(desired.x * desired.x + desired.y * desired.y);
            if (d > 0) {
                // Seek center roughly
                const steer = this.seek({ x: world.width / 2, y: world.height / 2 });
                this.applyForce({ x: steer.x * 2, y: steer.y * 2 });
            }
        }

        // Update physics
        this.vel.x += this.acc.x;
        this.vel.y += this.acc.y;

        // Limit speed
        const speed = Math.sqrt(this.vel.x * this.vel.x + this.vel.y * this.vel.y);
        if (speed > this.dna.maxSpeed) {
            this.vel.x = (this.vel.x / speed) * this.dna.maxSpeed;
            this.vel.y = (this.vel.y / speed) * this.dna.maxSpeed;
        }

        this.pos.x += this.vel.x;
        this.pos.y += this.vel.y;

        // Reset acceleration
        this.acc = { x: 0, y: 0 };

        // Energy
        this.energy -= this.config.ENERGY_DECAY;
        if (this.energy <= 0) this.dead = true;

        // Pulse animation
        this.pulse += 0.1;
    }

    preyBehavior(world) {
        // 1. Separate (Always active physics enforcement)
        const sep = this.separate(world.prey);
        this.applyForce({ x: sep.x * this.config.SEPARATION_STRENGTH, y: sep.y * this.config.SEPARATION_STRENGTH });

        // 2. AI Driven Behaviors with INSTINCT BASE
        // We add a base value (e.g. 0.2) so even 'dumb' agents still do something useful.
        // As they evolve, the brain (0.0-1.0) will take over fine-tuning.

        // Wander
        const wander = {
            x: (Math.random() - 0.5) * 0.5,
            y: (Math.random() - 0.5) * 0.5
        };
        // Base wander + Brain decision
        const wanderWt = 0.2 + (this.thought.wander * 0.8);
        this.applyForce({ x: wander.x * wanderWt * 2, y: wander.y * wanderWt * 2 });

        // Flee Predators
        let flee = { x: 0, y: 0 };
        let closest = null;
        let record = Infinity;

        for (let p of world.predators) {
            const d = Utils.distance(this.pos.x, this.pos.y, p.pos.x, p.pos.y);
            if (d < record && d < this.dna.senseRadius) {
                record = d;
                closest = p;
            }
        }
        if (closest) {
            let desired = {
                x: this.pos.x - closest.pos.x,
                y: this.pos.y - closest.pos.y
            };
            const d = Math.sqrt(desired.x * desired.x + desired.y * desired.y);
            if (d > 0) {
                desired.x = (desired.x / d) * this.dna.maxSpeed;
                desired.y = (desired.y / d) * this.dna.maxSpeed;
                flee = {
                    x: desired.x - this.vel.x,
                    y: desired.y - this.vel.y
                };
            }
        }
        // Base Fleet instinct (0.5) + Brain decision. High survival priority.
        const fleeWt = 0.6 + (this.thought.flee * 1.5);
        this.applyForce({ x: flee.x * fleeWt * this.config.FLEE_STRENGTH, y: flee.y * fleeWt * this.config.FLEE_STRENGTH });

        // Eat Food
        if (this.thought.targetFood) {
            let eat = this.seek({ x: this.thought.targetFood.x, y: this.thought.targetFood.y });
            // Base Hunger (0.3) + Brain decision
            const chaseWt = 0.3 + (this.thought.chase * 1.2);
            this.applyForce({ x: eat.x * chaseWt * this.config.FOOD_ATTRACTION, y: eat.y * chaseWt * this.config.FOOD_ATTRACTION });
        }
    }

    predatorBehavior(world) {
        // 1. Separate
        const sep = this.separate(world.predators);
        this.applyForce({ x: sep.x * this.config.SEPARATION_STRENGTH, y: sep.y * this.config.SEPARATION_STRENGTH });

        // 2. AI Behaviors w/ Instincts

        // Wander
        const wander = {
            x: (Math.random() - 0.5) * 1,
            y: (Math.random() - 0.5) * 1
        };
        const wanderWt = 0.2 + (this.thought.wander * 0.8);
        this.applyForce({ x: wander.x * wanderWt * 2, y: wander.y * wanderWt * 2 });

        // Chase Prey
        let chase = { x: 0, y: 0 };
        let closest = null;
        let record = Infinity;

        for (let p of world.prey) {
            const d = Utils.distance(this.pos.x, this.pos.y, p.pos.x, p.pos.y);
            if (d < record && d < this.dna.senseRadius) {
                record = d;
                closest = p;
            }
        }
        if (closest) {
            chase = this.seek(closest.pos);
        }
        // Base Chase instinct (0.4) + Brain
        const chaseWt = 0.4 + (this.thought.chase * 1.5);
        this.applyForce({ x: chase.x * chaseWt * this.config.CHASE_STRENGTH, y: chase.y * chaseWt * this.config.CHASE_STRENGTH });
    }

    canReproduce() {
        return this.energy > this.config.REPRODUCE_THRESHOLD;
    }

    reproduce() {
        this.energy -= this.config.REPRODUCE_COST;

        // Mutate DNA
        const newDna = { ...this.dna };
        if (Math.random() < CONFIG.MUTATION_RATE) {
            const factor = 1 + (Math.random() * 2 - 1) * CONFIG.MUTATION_AMOUNT;
            newDna.maxSpeed *= factor;
        }
        if (Math.random() < CONFIG.MUTATION_RATE) {
            const factor = 1 + (Math.random() * 2 - 1) * CONFIG.MUTATION_AMOUNT;
            newDna.senseRadius *= factor;
        }

        return new Agent(
            this.pos.x + Utils.random(-10, 10),
            this.pos.y + Utils.random(-10, 10),
            this.type,
            this.config,
            newDna,
            this.brain // Pass parent brain to be copied in constructor
        );
    }

    draw(ctx) {
        // Draw agent as directed triangle
        ctx.save();
        ctx.translate(this.pos.x, this.pos.y);

        // Rotate to face velocity
        const theta = Math.atan2(this.vel.y, this.vel.x);
        ctx.rotate(theta);

        // Body shape details
        const size = this.dna.size;

        // 1. Outer Glow (Soft)
        ctx.shadowBlur = 20;
        ctx.shadowColor = this.config.COLOR;
        ctx.fillStyle = this.config.COLOR; // Base color

        ctx.beginPath();
        if (this.type === 'predator') {
            ctx.moveTo(size, 0);
            ctx.lineTo(-size, -size / 2);
            ctx.lineTo(-size, size / 2);
        } else {
            ctx.moveTo(size, 0);
            ctx.lineTo(-size / 2, -size / 2);
            ctx.lineTo(-size / 2, size / 2);
        }
        ctx.closePath();
        ctx.fill();

        // 2. Inner Core (Bright)
        ctx.shadowBlur = 0; // No shadow for core
        ctx.fillStyle = '#ffffff'; // White hot center
        ctx.globalAlpha = 0.5;

        ctx.beginPath();
        // Smaller shape for core
        if (this.type === 'predator') {
            ctx.moveTo(size * 0.5, 0);
            ctx.lineTo(-size * 0.5, -size / 4);
            ctx.lineTo(-size * 0.5, size / 4);
        } else {
            ctx.moveTo(size * 0.5, 0);
            ctx.lineTo(-size / 4, -size / 4);
            ctx.lineTo(-size / 4, size / 4);
        }
        ctx.closePath();
        ctx.fill();

        // Energy Indicator (Pulse Overlay)
        ctx.globalAlpha = 1.0;
        const energyRatio = this.energy / this.config.MAX_ENERGY;
        // Pulse gets faster when hungry
        const pulseSpeed = energyRatio < 0.3 ? 0.3 : 0.1;
        this.pulse += pulseSpeed;

        if (energyRatio < 0.3) {
            // Red warning pulse overlay
            ctx.fillStyle = `rgba(255, 0, 0, ${0.1 + Math.sin(this.pulse) * 0.2})`;
            ctx.fill();
        }

        ctx.restore();
    }
}

class Food {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.radius = CONFIG.FOOD.RADIUS;
        this.consumed = false;
        this.pulse = Math.random() * Math.PI;
    }

    draw(ctx) {
        ctx.save();
        this.pulse += 0.05;

        // Glow
        ctx.shadowBlur = 15;
        ctx.shadowColor = CONFIG.FOOD.COLOR;

        // Outer halo
        ctx.fillStyle = CONFIG.FOOD.COLOR;
        ctx.globalAlpha = 0.6 + Math.sin(this.pulse) * 0.2;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius * 1.5, 0, Math.PI * 2);
        ctx.fill();

        // Bright Core
        ctx.globalAlpha = 1.0;
        ctx.fillStyle = "#ffffff";
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius * 0.8, 0, Math.PI * 2);
        ctx.fill();

        ctx.restore();
    }
}