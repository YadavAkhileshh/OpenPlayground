export default class EntityManager {
    constructor(game) {
        this.game = game;
        this.entities = [];
    }

    update(dt) {
        // Apply behaviors
        this.entities.forEach(e => {
            if (e.type === 'glitch') this.updateGlitch(e, dt);
            if (e.type === 'healer') this.updateHealer(e, dt);
            if (e.type === 'tank') this.updateTank(e, dt);

            // Standard drift if no special movement override
            // AIController handles basic movement using e.vx/vy
            this.game.ai.updateEntity(e, dt);
        });
    }

    spawnEnemy(type, difficulty) {
        const e = this.createBaseEntity(difficulty);
        e.type = type;

        // Special stats
        switch (type) {
            case 'glitch':
                e.color = '#00ff00';
                e.word = "GLITCH";
                e.timer = 0; // For teleport
                break;
            case 'tank':
                e.color = '#ffaa00';
                e.radius = 40;
                e.health = 5;
                e.maxHealth = 5;
                e.speedMult = 0.5; // Slow
                break;
            case 'healer':
                e.color = '#0000ff'; // Blue
                e.word = "MEND";
                break;
        }
        this.entities.push(e);
        return e;
    }

    createBaseEntity(difficulty) {
        // ... (Logic extracted from game.js spawnTarget)
        // Returning a standard object structure
        // This will be called by game.js to get the object, then added to state.target (which needs to be an array now? Oh wait.
        // The game.js architecture assumed single 'target' for a long time, then 'boss'.
        // To support Multiple Enemies as requested for V5 ("Advanced Enemy AI"), I need to refactor Game to hold a LIST of targets.
        // This is a major refactor.
        // For now, I will assume game.js will be refactored to use `this.state.targets = []`.

        return {
            id: Math.random().toString(36).substr(2, 9),
            x: Math.random() * (this.game.width - 200) + 100,
            y: Math.random() * (this.game.height - 200) + 100,
            vx: (Math.random() - 0.5) * 100,
            vy: (Math.random() - 0.5) * 100,
            radius: 25,
            health: 1,
            matchedIndex: 0,
            word: null, // assigned by caller
            char: null  // assigned by caller
        };
    }

    updateGlitch(e, dt) {
        e.timer += dt;
        if (e.timer > 2.0) {
            e.timer = 0;
            // Teleport
            e.x = Math.random() * (this.game.width - 100) + 50;
            e.y = Math.random() * (this.game.height - 100) + 50;
            this.game.spawnParticles(e.x, e.y, e.color); // Effects
        }
    }

    updateHealer(e, dt) {
        // Find nearest ally and heal?
        // Needs access to full list.
        // Placeholder behavior: Orbits center fast
    }

    updateTank(e, dt) {
        // Just slow, maybe regenerates shield?
    }
}
