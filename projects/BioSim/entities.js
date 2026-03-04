/**
 * BIOSIM ENTITIES
 * Defines the behavior of Creatures and Food.
 * Creatures connect the Neural Network output to Physics movement.
 * @author saiusesgithub
 */

const CONSTANTS = {
    MAX_SPEED: 4,
    MAX_FORCE: 0.2,
    ENERGY_LOSS_MOVE: 0.05,
    ENERGY_LOSS_IDLE: 0.01,
    ENERGY_GAIN_FOOD: 40,
    SENSOR_LENGTH: 100,
    SENSOR_FOV: Math.PI / 2
};

class Food {
    constructor(x, y) {
        this.pos = new Vec2(x, y);
        this.r = 4;
        this.active = true;
    }

    draw(ctx) {
        if (!this.active) return;
        ctx.fillStyle = '#4caf50';
        ctx.beginPath();
        ctx.arc(this.pos.x, this.pos.y, this.r, 0, Math.PI * 2);
        ctx.fill();
    }
}

class Creature {
    constructor(x, y, brain) {
        // Physics
        this.pos = new Vec2(x, y);
        this.vel = new Vec2(0, 0);
        this.acc = new Vec2(0, 0);
        this.r = 8;
        
        // Genetics & Brain
        if (brain) {
            this.brain = brain.copy();
        } else {
            // 5 Inputs, 8 Hidden, 2 Outputs
            this.brain = new NeuralNetwork(5, 8, 2); 
        }

        // Metabolism
        this.energy = 100;
        this.health = 1; // 0-1
        this.maxHealth = 1;
        this.age = 0;
        this.fitness = 0;
        this.alive = true;

        // Visuals
        this.color = `hsl(${Math.random() * 360}, 70%, 60%)`;
        this.id = Math.floor(Math.random() * 99999).toString(16);
        
        // Performance cache
        this._spatialIndices = null;
    }

    /**
     * SENSORY INPUT
     * 1. Distance to nearest food
     * 2. Angle to nearest food
     * 3. Distance to nearest wall
     * 4. Current Energy
     * 5. Bias (Always 1)
     */
    think(foodList, boundaries) {
        if (!this.alive) return;

        // Find nearest food
        let closest = null;
        let recordDist = Infinity;
        
        // O(N) scan of food (Can be optimized with SpatialHash, simplified here for logic clarity)
        // In simulation.js we will pass only LOCAL food from grid query
        for (let i = 0; i < foodList.length; i++) {
            if (!foodList[i].active) continue;
            let d = this.pos.dist(foodList[i].pos);
            if (d < recordDist && d < CONSTANTS.SENSOR_LENGTH) {
                recordDist = d;
                closest = foodList[i];
            }
        }

        let inputs = [];
        
        // Input 1 & 2: Food Vectors
        if (closest) {
            inputs[0] = recordDist / CONSTANTS.SENSOR_LENGTH; // Normalized Dist
            
            // Angle to food relative to heading
            let angleToFood = Math.atan2(closest.pos.y - this.pos.y, closest.pos.x - this.pos.x);
            let angleDiff = angleToFood - this.vel.heading();
            // Normalize angle -PI to PI
            if (angleDiff > Math.PI) angleDiff -= Math.PI*2;
            if (angleDiff < -Math.PI) angleDiff += Math.PI*2;
            
            inputs[1] = angleDiff / Math.PI;
        } else {
            inputs[0] = 1; // Max dist
            inputs[1] = 0;
        }

        // Input 3: Wall Detection (Simplified Raycast forward)
        let heading = this.vel.copy().normalize().mult(CONSTANTS.SENSOR_LENGTH);
        let distToWall = Physics.raycast(this.pos, this.vel.copy().normalize(), CONSTANTS.SENSOR_LENGTH, boundaries);
        inputs[2] = distToWall / CONSTANTS.SENSOR_LENGTH;

        // Input 4: Internal State
        inputs[3] = this.energy / 100;

        // Input 5: Bias
        inputs[4] = 1;

        // --- BRAIN EXECUTION ---
        let outputs = this.brain.predict(inputs);
        // Output 0: Thrust (-1 to 1) -> mapped to speed
        // Output 1: Turn (-1 to 1) -> mapped to angle change

        this.act(outputs);
    }

    act(outputs) {
        // Turning
        let turnAngle = outputs[1] * 0.2; // Max turn rate 0.2 rad/frame
        
        // We can't just rotate velocity vector if it's 0
        // So we track heading separately or ensure min velocity
        if (this.vel.mag() === 0) this.vel = Vec2.random();
        
        let heading = this.vel.heading() + turnAngle;
        
        // Thrust
        let speed = (outputs[0] + 1) * 0.5; // Map -1:1 to 0:1
        speed = speed * CONSTANTS.MAX_SPEED;

        // Create new velocity vector
        let newVel = Vec2.fromAngle(heading);
        newVel.mult(speed);
        
        // Steering Force (Reynolds)
        let steer = newVel.sub(this.vel);
        steer.limit(CONSTANTS.MAX_FORCE);
        this.applyForce(steer);

        // Energy Cost
        this.energy -= (CONSTANTS.ENERGY_LOSS_IDLE + speed * CONSTANTS.ENERGY_LOSS_MOVE);
    }

    applyForce(force) {
        this.acc.add(force);
    }

    update(boundaries) {
        if (!this.alive) return;

        this.vel.add(this.acc);
        this.vel.limit(CONSTANTS.MAX_SPEED);
        this.pos.add(this.vel);
        this.acc.mult(0); // Reset acc

        this.age++;
        
        // Boundaries (Wrap around or Bounce) - Here we Bounce
        if (this.pos.x < 0) { this.pos.x = 0; this.vel.x *= -1; }
        if (this.pos.x > boundaries.width) { this.pos.x = boundaries.width; this.vel.x *= -1; }
        if (this.pos.y < 0) { this.pos.y = 0; this.vel.y *= -1; }
        if (this.pos.y > boundaries.height) { this.pos.y = boundaries.height; this.vel.y *= -1; }

        // Death Check
        if (this.energy <= 0) {
            this.alive = false;
        }
    }

    eat(food) {
        this.energy += CONSTANTS.ENERGY_GAIN_FOOD;
        if (this.energy > 150) this.energy = 150; // Cap energy
        this.fitness += 1; // Reward for eating
    }

    draw(ctx, isSelected) {
        if (!this.alive) {
            // Draw corpse
            ctx.fillStyle = 'rgba(100,100,100,0.3)';
            ctx.beginPath();
            ctx.arc(this.pos.x, this.pos.y, this.r, 0, Math.PI * 2);
            ctx.fill();
            return;
        }

        ctx.save();
        ctx.translate(this.pos.x, this.pos.y);
        ctx.rotate(this.vel.heading());

        // Body
        ctx.fillStyle = this.color;
        if (isSelected) {
            ctx.shadowBlur = 15;
            ctx.shadowColor = '#fff';
            ctx.strokeStyle = '#fff';
            ctx.lineWidth = 2;
        }
        
        // Triangle shape
        ctx.beginPath();
        ctx.moveTo(this.r, 0);
        ctx.lineTo(-this.r, -this.r/1.5);
        ctx.lineTo(-this.r, this.r/1.5);
        ctx.closePath();
        ctx.fill();
        if (isSelected) ctx.stroke();

        ctx.restore();
    }
}