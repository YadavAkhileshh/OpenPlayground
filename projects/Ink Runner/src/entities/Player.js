/**
 * Player.js
 * The main character.
 */

import { Entity } from './Entity.js';
import { Settings, Events } from '../core/Settings.js';
import { eventManager } from '../core/EventManager.js';

export class Player extends Entity {
    constructor(x, y) {
        super(x, y, Settings.PLAYER_WIDTH, Settings.PLAYER_HEIGHT);
        this.type = 'Player';
        this.grounded = false;

        // Listen for jump
        this.jumpListener = eventManager.on(Events.PLAYER_JUMP, () => this.tryJump());
    }

    tryJump() {
        if (this.grounded) {
            this.vy = Settings.PLAYER_JUMP_FORCE;
            this.grounded = false;
            // Play sound? Emit event?
            eventManager.emit('PLAY_SOUND', 'jump');
        } else if (this.canDoubleJump) {
            // Optional double jump mechanic
        }
    }

    update(dt) {
        // Horizontal movement - auto run
        // We might want to accelerate over time
        this.vx = Settings.PLAYER_RUN_SPEED; // Constant for now

        super.update(dt);

        // Check if fallen off world
        if (this.y > Settings.CANVAS_HEIGHT * 2) { // Generous limit
            eventManager.emit(Events.GAME_OVER, { reason: 'fallen' });
        }
    }

    destroy() {
        if (this.jumpListener) this.jumpListener();
    }
}
