// simulation.js
class Simulation {
    constructor() {
        this.organisms = [];
        this.bounds = 150;
        this.births = 0;
        this.deaths = 0;
        this.maxPopulation = 200;
        this.interactionDistance = 15;
        this.init();
    }

    init() {
        for (let i = 0; i < 20; i++) {
            this.spawnOrganism();
        }
    }

    spawnOrganism(generation = 1) {
        const x = (Math.random() - 0.5) * this.bounds * 0.5;
        const y = (Math.random() - 0.5) * this.bounds * 0.5;
        const z = (Math.random() - 0.5) * this.bounds * 0.5;
        
        const organism = new Organism(x, y, z, generation);
        this.organisms.push(organism);
    }

    update(dt, speedMult) {
        this.organisms.forEach(organism => {
            organism.update(dt, this.bounds, speedMult);
        });

        for (let i = 0; i < this.organisms.length; i++) {
            for (let j = i + 1; j < this.organisms.length; j++) {
                const dist = this.organisms[i].distanceTo(this.organisms[j]);
                
                if (dist < this.interactionDistance) {
                    this.organisms[i].interactWith(this.organisms[j]);
                }
            }
        }

        const newOrganisms = [];
        this.organisms.forEach(organism => {
            if (organism.canReproduce() && this.organisms.length < this.maxPopulation) {
                const child = organism.reproduce();
                newOrganisms.push(child);
                this.births++;
            }
        });

        this.organisms = this.organisms.concat(newOrganisms);

        this.organisms = this.organisms.filter(organism => {
            if (organism.isDead()) {
                this.deaths++;
                return false;
            }
            return true;
        });
    }

    getStats() {
        const population = this.organisms.length;
        let totalEnergy = 0;
        let maxGeneration = 1;

        this.organisms.forEach(organism => {
            totalEnergy += organism.energy;
            if (organism.generation > maxGeneration) {
                maxGeneration = organism.generation;
            }
        });

        const avgEnergy = population > 0 ? (totalEnergy / population).toFixed(1) : 0;

        return {
            population,
            births: this.births,
            deaths: this.deaths,
            avgEnergy,
            generation: maxGeneration
        };
    }

    reset() {
        this.organisms = [];
        this.births = 0;
        this.deaths = 0;
        this.init();
    }
}