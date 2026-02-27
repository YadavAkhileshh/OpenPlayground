/* js/systems/ai.js */
export class AISystem {
    constructor(player) {
        this.player = player;
        this.enemies = [];
        this.spawnTimer = 0;
    }

    spawnEnemy() {
        // Import dynamically to avoid circular dependency if needed, but standard import is fine if structure allows.
        // We will pass Factory or just assume global/import.
        // Let's rely on Main passing the class or factory? 
        // Or just import locally.
    }

    // We'll manage enemies list here
    add(enemy) {
        this.enemies.push(enemy);
    }

    update(deltaTime) {
        // Spawn Logic
        this.spawnTimer += deltaTime;
        if (this.spawnTimer > 5) { // Spawn every 5 seconds
            this.spawnTimer = 0;
            // Signal main to spawn? Or do it here.
        }

        // Behavior Logic
        const playerX = this.player.x;
        const playerY = this.player.y;

        this.enemies.forEach(enemy => {
            const dx = playerX - enemy.x;
            const dy = playerY - enemy.y;
            const dist = Math.sqrt(dx * dx + dy * dy);

            if (dist > 10) { // Don't jitter
                const vx = (dx / dist) * enemy.speed;
                const vy = (dy / dist) * enemy.speed;

                enemy.x += vx * deltaTime;
                enemy.y += vy * deltaTime;
                enemy.updateTransform();
            }
        });
    }

    getEnemies() {
        return this.enemies;
    }
}
