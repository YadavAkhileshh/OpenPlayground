/* js/logic/evolution.js */
// We would ideally wire this into Player or Main.
// For now, let's just make it a static helper or a class.
export class EvolutionManager {
    static checkEvolution(player) {
        if (player.mass > 50 && !player.element.classList.contains('evo-stage-1')) {
            player.element.classList.add('evo-stage-1');
            // Add effects
        }
        // ... more logic
    }
}
// This file is a bit small. I initially wanted to put logic here.
// Let's make it a proper system that monitors player.

export class EvolutionSystem {
    constructor(player, particleSystem) {
        this.player = player;
        this.particles = particleSystem;
        this.currentStage = 0;
    }

    update() {
        const mass = this.player.mass;

        if (this.currentStage === 0 && mass > 50) {
            this.evolve(1, 'player-circle');
        } else if (this.currentStage === 1 && mass > 100) {
            this.evolve(2, 'player-spiky');
        } else if (this.currentStage === 2 && mass > 200) {
            this.evolve(3, 'player-neon');
        }
    }

    evolve(stage, className) {
        this.currentStage = stage;
        this.player.element.classList.add(className);

        // Burst effect
        this.particles.emit(this.player.x + this.player.size / 2, this.player.y + this.player.size / 2, '#ffffff', 50);

        // Sound? we could inject audio too.
        console.log("Player Evolved to Stage " + stage);
    }
}
