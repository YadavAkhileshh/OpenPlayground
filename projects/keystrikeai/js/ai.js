
export default class AIController {
    constructor(game) {
        this.game = game;
        this.state = {
            mode: 'IDLE', // IDLE, EVADE, PANIC
            nextChange: 0,
            learning: {
                shotsFired: 0,
                hits: 0,
                avgReactionTime: 500
            }
        };
    }

    notifyShot(hit) {
        this.state.learning.shotsFired++;
        if (hit) this.state.learning.hits++;
        // Simple heuristic: if hit rate is high, panic more
    }

    updateTarget(target, dt) {
        // Change behavior periodically based on difficulty
        this.state.nextChange -= dt;
        if (this.state.nextChange <= 0) {
            this.pickNewMode();
            this.state.nextChange = 1 + Math.random() * 2;
        }

        // Apply movement based on mode
        const speed = 100 * (1 + (this.game.state.difficulty * 0.2));

        switch (this.state.mode) {
            case 'IDLE':
                // Drifting
                target.x += target.vx * 60 * dt;
                target.y += target.vy * 60 * dt;
                break;
            case 'EVADE':
                // Move away from center (player)
                const dx = target.x - (this.game.width / 2);
                const dy = target.y - (this.game.height / 2);
                const dist = Math.sqrt(dx * dx + dy * dy);
                if (dist > 0) {
                    target.x += (dx / dist) * speed * dt;
                    target.y += (dy / dist) * speed * dt;
                }
                // Add some tangential movement (orbit)
                target.x += -(dy / dist) * speed * 0.5 * dt;
                target.y += (dx / dist) * speed * 0.5 * dt;
                break;
            case 'PANIC':
                // Fast erratic movement
                target.x += (Math.random() - 0.5) * speed * 4 * dt;
                target.y += (Math.random() - 0.5) * speed * 4 * dt;
                break;
        }

        // Always apply base velocity a bit to keep momentum
        target.x += target.vx * 30 * dt;
        target.y += target.vy * 30 * dt;

        // Boundaries handling - Bounce
        if (target.x < target.radius) { target.x = target.radius; target.vx *= -1; }
        if (target.x > this.game.width - target.radius) { target.x = this.game.width - target.radius; target.vx *= -1; }
        if (target.y < target.radius) { target.y = target.radius; target.vy *= -1; }
        if (target.y > this.game.height - target.radius) { target.y = this.game.height - target.radius; target.vy *= -1; }
    }

    pickNewMode() {
        const difficulty = this.game.state.difficulty;
        const rand = Math.random();

        if (difficulty > 3 && rand > 0.7) {
            this.state.mode = 'PANIC';
        } else if (rand > 0.4) {
            this.state.mode = 'EVADE';
        } else {
            this.state.mode = 'IDLE';
        }
    }
}
