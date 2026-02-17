import Level1 from './Level1.js';
import Level2 from './Level2.js';
import { EVENTS } from '../utils/Constants.js';

export default class LevelManager {
    constructor(game) {
        this.game = game;
        this.levels = [Level1, Level2];
        this.currentLevelIndex = 0;
        this.isLoading = false;

        this.game.events.on(EVENTS.LEVEL_COMPLETED, () => this.nextLevel());
    }

    loadInitialLevel() {
        this.loadLevel(this.currentLevelIndex);
    }

    nextLevel() {
        if (this.isLoading) return;
        this.isLoading = true;

        console.log('Level Completed! Loading next...');

        // Small delay for effect
        setTimeout(() => {
            this.currentLevelIndex++;
            if (this.currentLevelIndex < this.levels.length) {
                this.loadLevel(this.currentLevelIndex);
            } else {
                console.log('All Levels Completed!');
                // Reset or show End Screen
                alert('You Win! Game Over.');
                this.currentLevelIndex = 0;
                this.loadLevel(0);
            }
            this.isLoading = false;
        }, 1000);
    }

    loadLevel(index) {
        const levelData = this.levels[index];
        // Clear World
        this.game.world.clear();

        // Load new entities
        this.game.levelLoader.loadLevel(levelData);

        // Update UI
        const scoreEl = document.getElementById('score');
        if (scoreEl) scoreEl.innerText = `Level: ${index + 1}`;
    }
}
