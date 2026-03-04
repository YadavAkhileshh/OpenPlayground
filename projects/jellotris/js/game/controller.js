class Controller {
    constructor(game) {
        this.game = game;
        this.keys = {};

        window.addEventListener('keydown', (e) => {
            this.keys[e.code] = true;
            this.handleInput(e.code);
        });

        window.addEventListener('keyup', (e) => {
            this.keys[e.code] = false;
        });
    }

    handleInput(code) {
        const body = this.game.currentBody;
        if (!body) return;

        // Start Game
        if (code === 'Space' && !this.game.isRunning) {
            this.game.start();
            return;
        }

        if (!this.game.isRunning) return;

        switch (code) {
            case 'ArrowLeft':
                // Impulse Left
                this.applyImpulse(body, new Vec2(-150, 0));
                break;
            case 'ArrowRight':
                // Impulse Right
                this.applyImpulse(body, new Vec2(150, 0));
                break;
            case 'ArrowUp':
                // Rotate
                // Rotate 90 degrees around center
                // Since it's physics based, maybe just kinematic rotation?
                // Or apply torque? Kinematic is safer for Tetris.
                body.rotate(Math.PI / 2);
                break;
            case 'ArrowDown':
                // Soft Drop (Push down)
                this.applyImpulse(body, new Vec2(0, 300));
                break;
            case 'Space':
                // Hard Drop - temporary high gravity?
                // Or just a strong push
                this.applyImpulse(body, new Vec2(0, 1000));
                break;
        }
    }

    applyImpulse(body, force) {
        for (let p of body.particles) {
            p.applyForce(force);
        }
    }
}
