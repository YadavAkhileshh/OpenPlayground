import { Level } from './Level.js';
import { Player } from '../entities/Player.js';
import { Wall } from '../entities/Wall.js';
import { Goal } from '../entities/Goal.js';

export class Level1 extends Level {
    constructor(game) {
        super(game);
        this.canCreatePortals = true; // Enable for fun/testing immediately
    }

    createLevel() {
        // Floor
        this.addEntity(new Wall(window.innerWidth / 2, window.innerHeight - 50, window.innerWidth, 100));

        // Walls
        this.addEntity(new Wall(0, window.innerHeight / 2, 50, window.innerHeight));
        this.addEntity(new Wall(window.innerWidth, window.innerHeight / 2, 50, window.innerHeight));

        // Platforms
        this.addEntity(new Wall(300, window.innerHeight - 200, 200, 40));
        this.addEntity(new Wall(600, window.innerHeight - 350, 200, 40));

        // Player
        this.addEntity(new Player(100, window.innerHeight - 200));

        // Goal
        this.addEntity(new Goal(800, window.innerHeight - 500)); // Should be reachable by jumping

        this.game.ui.showHint("Use Arrow Keys or WASD to move and Jump. Reach the Green Goal!");
    }

    update(dt) {
        super.update(dt);

        // check win condition
        const player = this.entities.find(e => e.type === 'player');
        if (player && player.hasReachedGoal) {
            this.game.ui.showGameOver();
        }
    }
}
