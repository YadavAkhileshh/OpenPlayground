import { randomRange } from './utils.js';

export class GameManager {
    constructor(core) {
        this.core = core;
        this.state = 'MENU';
        this.canvas = core.canvas;

        // Input Binding
        this.canvas.addEventListener('mousedown', (e) => this.handleInput(e));
    }

    start() {
        this.state = 'PLAYING';
        this.spawnInitialObjects();
        console.log('Game Started');
    }

    spawnInitialObjects() {
        for (let i = 0; i < 10; i++) {
            this.core.physics.addBody({
                x: randomRange(100, this.canvas.width - 100),
                y: randomRange(50, 300),
                radius: randomRange(15, 30)
            });
        }
    }

    handleInput(e) {
        if (this.state !== 'PLAYING') return;

        // Spawn object at click
        const rect = this.canvas.getBoundingClientRect();
        const mouseX = e.clientX - rect.left;
        const mouseY = e.clientY - rect.top;

        this.core.physics.addBody({
            x: mouseX,
            y: mouseY,
            radius: randomRange(10, 25),
            vx: randomRange(-20, 20),
            vy: randomRange(-20, 20)
        });
    }

    update(dt) {
        if (this.state !== 'PLAYING') return;

        // Cleanup bodies that fell out of world if any (though we have walls)
    }
}
