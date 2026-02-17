import { Level } from './Level.js';
import { Player } from '../entities/Player.js';
import { Wall } from '../entities/Wall.js';
import { Goal } from '../entities/Goal.js';

export class Level2 extends Level {
    constructor(game) {
        super(game);
        this.canCreatePortals = true;
    }

    createLevel() {
        const w = window.innerWidth;
        const h = window.innerHeight;

        // Ground segments (gap in middle)
        this.addEntity(new Wall(w * 0.2, h - 50, w * 0.4, 100));
        this.addEntity(new Wall(w * 0.8, h - 50, w * 0.4, 100));

        // Ceiling
        this.addEntity(new Wall(w / 2, 0, w, 50));

        // Walls
        this.addEntity(new Wall(0, h / 2, 50, h));
        this.addEntity(new Wall(w, h / 2, 50, h));

        // High wall in middle blocking jump
        this.addEntity(new Wall(w / 2, h - 250, 50, 500));

        // Player start
        this.addEntity(new Player(100, h - 200));

        // Goal (unreachable by jumping due to gap/wall)
        this.addEntity(new Goal(w - 100, h - 200));

        this.game.ui.showHint("Draw a CIRCLE to create a Portal. Link two portals to cross the wall!");
    }

    update(dt) {
        super.update(dt);

        const player = this.entities.find(e => e.type === 'player');
        if (player && player.hasReachedGoal) {
            this.game.ui.showGameOver();
        }
    }
}
