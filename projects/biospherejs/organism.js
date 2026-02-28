// organism.js
class Organism {
    constructor(x, y, z, generation = 1) {
        this.x = x;
        this.y = y;
        this.z = z;
        this.vx = (Math.random() - 0.5) * 2;
        this.vy = (Math.random() - 0.5) * 2;
        this.vz = (Math.random() - 0.5) * 2;
        this.energy = 100;
        this.maxEnergy = 150;
        this.age = 0;
        this.maxAge = 300 + Math.random() * 200;
        this.size = 3;
        this.generation = generation;
        this.color = this.generateColor();
        this.speed = 0.8 + Math.random() * 0.4;
        this.efficiency = 0.95 + Math.random() * 0.1;
        this.trail = [];
        this.maxTrailLength = 20;
        
        // Pulsating animation properties
        this.pulsePhase = Math.random() * Math.PI * 2;
        this.pulseSpeed = 2 + Math.random() * 2;
        this.pulseAmount = 0.3;
        
        // Interaction properties
        this.interactionCooldown = 0;
        this.glowIntensity = 0;
        this.isHovered = false;
    }

    generateColor() {
        const hue = (this.generation * 30) % 360;
        const saturation = 70 + Math.random() * 30;
        const lightness = 50 + Math.random() * 20;
        return `hsl(${hue}, ${saturation}%, ${lightness}%)`;
    }

    update(dt, bounds, speedMult) {
        this.age += dt * speedMult;
        this.energy -= 0.05 * dt * speedMult * (1 / this.efficiency);
        
        // Update pulse animation
        this.pulsePhase += dt * this.pulseSpeed * speedMult * 0.1;
        
        // Update interaction cooldown and glow
        if (this.interactionCooldown > 0) {
            this.interactionCooldown -= dt * speedMult;
        }
        if (this.glowIntensity > 0) {
            this.glowIntensity -= dt * speedMult * 2;
            if (this.glowIntensity < 0) this.glowIntensity = 0;
        }

        const targetSpeed = this.speed * speedMult;
        this.vx += (Math.random() - 0.5) * 0.1 * speedMult;
        this.vy += (Math.random() - 0.5) * 0.1 * speedMult;
        this.vz += (Math.random() - 0.5) * 0.1 * speedMult;

        const avoidanceStrength = 2;
        const margin = 20;

        if (this.x < -bounds + margin) this.vx += avoidanceStrength * speedMult;
        if (this.x > bounds - margin) this.vx -= avoidanceStrength * speedMult;
        if (this.y < -bounds + margin) this.vy += avoidanceStrength * speedMult;
        if (this.y > bounds - margin) this.vy -= avoidanceStrength * speedMult;
        if (this.z < -bounds + margin) this.vz += avoidanceStrength * speedMult;
        if (this.z > bounds - margin) this.vz -= avoidanceStrength * speedMult;

        const speed = Math.sqrt(this.vx * this.vx + this.vy * this.vy + this.vz * this.vz);
        if (speed > targetSpeed) {
            this.vx = (this.vx / speed) * targetSpeed;
            this.vy = (this.vy / speed) * targetSpeed;
            this.vz = (this.vz / speed) * targetSpeed;
        }

        this.trail.push({ x: this.x, y: this.y, z: this.z });
        if (this.trail.length > this.maxTrailLength) {
            this.trail.shift();
        }

        this.x += this.vx * dt * speedMult;
        this.y += this.vy * dt * speedMult;
        this.z += this.vz * dt * speedMult;

        this.size = 3 + (this.energy / this.maxEnergy) * 4;

        if (this.energy < 0) this.energy = 0;
        if (this.energy > this.maxEnergy) this.energy = this.maxEnergy;
    }

    isDead() {
        return this.energy <= 0 || this.age >= this.maxAge;
    }

    canReproduce() {
        return this.energy > 120 && this.age > 50;
    }

    reproduce() {
        this.energy -= 50;
        const offsetX = (Math.random() - 0.5) * 10;
        const offsetY = (Math.random() - 0.5) * 10;
        const offsetZ = (Math.random() - 0.5) * 10;
        
        const child = new Organism(
            this.x + offsetX,
            this.y + offsetY,
            this.z + offsetZ,
            this.generation + 1
        );

        child.speed = this.speed * (0.9 + Math.random() * 0.2);
        child.efficiency = this.efficiency * (0.95 + Math.random() * 0.1);
        child.maxAge = this.maxAge * (0.9 + Math.random() * 0.2);
        
        return child;
    }

    distanceTo(other) {
        const dx = this.x - other.x;
        const dy = this.y - other.y;
        const dz = this.z - other.z;
        return Math.sqrt(dx * dx + dy * dy + dz * dz);
    }

    interactWith(other) {
        if (this.energy > other.energy) {
            const transfer = 5;
            this.energy += transfer;
            other.energy -= transfer;
            
            // Trigger visual feedback
            this.glowIntensity = 1;
            other.glowIntensity = 0.5;
            this.interactionCooldown = 30;
            other.interactionCooldown = 30;
        }
    }
    
    getPulseSize() {
        const basePulse = Math.sin(this.pulsePhase) * this.pulseAmount + 1;
        const energyPulse = (this.energy / this.maxEnergy) * 0.5 + 0.5;
        return this.size * basePulse * energyPulse;
    }
    
    feed(amount) {
        this.energy = Math.min(this.maxEnergy, this.energy + amount);
        this.glowIntensity = 1.5;
        this.pulseSpeed = Math.min(this.pulseSpeed * 1.5, 8);
    }
}