import { Chaser, Shooter, Dasher } from '../Entities/Enemy.js';
import { CONFIG } from '../Config/Constants.js';
import { MathUtils } from '../Utils/MathUtils.js';

export class WaveSystem {
    constructor(enemyContainer) {
        this.enemies = enemyContainer;
        this.wave = 1;
        this.spawnRate = CONFIG.ENEMY.SPAWN_rate_INITIAL;
        this.lastSpawn = 0;
        this.difficulty = 1;
    }

    update(dt, now) {
        if (now - this.lastSpawn > this.spawnRate) {
            this.spawnEnemy();
            this.lastSpawn = now;

            // Ramp up difficulty over time
            this.difficulty += 0.05;
            this.spawnRate = Math.max(CONFIG.ENEMY.SPAWN_RATE_MIN, CONFIG.ENEMY.SPAWN_rate_INITIAL - (this.difficulty * 100));
        }
    }

    spawnEnemy() {
        // Spawn logic: Random edge of screen
        const side = MathUtils.randomInt(0, 3);
        let x, y;
        const margin = 50;

        switch (side) {
            case 0: // Top
                x = MathUtils.randomRange(0, CONFIG.CANVAS_WIDTH);
                y = -margin;
                break;
            case 1: // Right
                x = CONFIG.CANVAS_WIDTH + margin;
                y = MathUtils.randomRange(0, CONFIG.CANVAS_HEIGHT);
                break;
            case 2: // Bottom
                x = MathUtils.randomRange(0, CONFIG.CANVAS_WIDTH);
                y = CONFIG.CANVAS_HEIGHT + margin;
                break;
            case 3: // Left
                x = -margin;
                y = MathUtils.randomRange(0, CONFIG.CANVAS_HEIGHT);
                break;
        }

        // Difficulty based selection
        let enemyType;
        const rand = Math.random();

        if (this.difficulty > 5 && rand > 0.8) {
            enemyType = new Dasher(x, y);
        } else if (this.difficulty > 3 && rand > 0.6) {
            enemyType = new Shooter(x, y);
        } else {
            enemyType = new Chaser(x, y);
        }

        this.enemies.push(enemyType);
    }
}
