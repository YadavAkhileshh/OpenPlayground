
export default class InputHandler {
    constructor(game) {
        this.game = game;
        this.buffer = '';

        window.addEventListener('keydown', (e) => this.handleKey(e));
    }

    handleKey(e) {
        // Filter mainly for single characters
        if (e.key.length === 1 && !e.ctrlKey && !e.altKey && !e.metaKey) {
            // Spacebar handling
            if (e.key === ' ') {
                e.preventDefault(); // Prevent scrolling
                this.game.activatePowerUp();
                return;
            }
            this.game.shoot(e.key);
        }
    }
}
