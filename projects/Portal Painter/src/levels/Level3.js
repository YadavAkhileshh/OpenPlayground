import { Level } from './Level.js';
import { Player } from '../entities/Player.js';
import { Wall } from '../entities/Wall.js';
import { Goal } from '../entities/Goal.js';

export class Level3 extends Level {
    constructor(game) {
        super(game);
        this.canCreatePortals = true;
    }

    createLevel() {
        const w = window.innerWidth;
        const h = window.innerHeight;

        // Reset
        this.entities = [];

        // Main floor
        this.addEntity(new Wall(w / 2, h - 20, w, 40));

        // Enclosure
        this.addEntity(new Wall(0, h / 2, 40, h)); // Left
        this.addEntity(new Wall(w, h / 2, 40, h)); // Right
        this.addEntity(new Wall(w / 2, 0, w, 40)); // Top

        // Platforms designed for momentum
        // A high platform with the goal
        this.addEntity(new Wall(w - 150, 150, 200, 20)); // Top right platform
        this.addEntity(new Goal(w - 150, 100));

        // A pit or obstacle?
        // Let's make a vertical shaft structure
        this.addEntity(new Wall(w / 2, h / 2, 40, h * 0.6)); // Central pillar

        // Player start bottom left
        this.addEntity(new Player(100, h - 100));

        // Some floating platforms to help aiming
        this.addEntity(new Wall(200, h - 250, 100, 20));

        this.game.ui.showHint("Use momentum! Fall into a portal to shoot out of another.");
    }

    update(dt) {
        super.update(dt);

        const player = this.entities.find(e => e.type === 'player');
        if (player && player.hasReachedGoal) {
            this.game.ui.showGameOver();
        }
    }
}
