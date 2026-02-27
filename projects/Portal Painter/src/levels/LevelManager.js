import { Level1 } from './Level1.js';
import { Level2 } from './Level2.js';
import { Level3 } from './Level3.js';

export class LevelManager {
    constructor(game) {
        this.game = game;
        this.currentLevelIndex = 1;
        this.activeLevel = null;
        this.levels = {
            1: Level1,
            2: Level2,
            3: Level3
        };
    }

    loadLevel(index) {
        if (this.activeLevel) {
            this.activeLevel.unload();
        }

        const LevelClass = this.levels[index];
        if (LevelClass) {
            this.currentLevelIndex = index;
            this.activeLevel = new LevelClass(this.game);
            this.activeLevel.load(); // Should initialize entities in game physics
            this.game.ui.updateLevel(index);
        } else {
            console.log("Level not found, restarting or showing end");
            // Loop back to 1 for now or show completion
            this.loadLevel(1);
        }
    }

    nextLevel() {
        this.loadLevel(this.currentLevelIndex + 1);
    }
}
