/**
 * Player.js
 * 
 * The main character entity controlled by the user.
 * Manages its own state machine for actions.
 */

import { Entity } from './Entity.js';
import { Components } from '../components/Components.js';
import { PLAYER_CONFIG, EVENTS } from '../core/Constants.js';
import { GameEvents } from '../core/EventManager.js';
import { Utils } from '../core/Utils.js';

export class Player extends Entity {
    constructor(x, y) {
        super(x, y, PLAYER_CONFIG.SIZE, 'PLAYER');

        this.addComponent('physics', Components.Physics());
        this.addComponent('render', Components.Render(PLAYER_CONFIG.COLOR, 'circle'));
        this.addComponent('health', Components.Health(PLAYER_CONFIG.MAX_HEALTH));
        this.addComponent('combat', Components.Combat(20));

        this.state = 'IDLE';
        this.direction = 0; // Radians
        this.moveSpeed = PLAYER_CONFIG.SPEED;

        // Cooldowns handled internally or via Combat component
        this.actionTimer = 0;

        this.setupEventListeners();
    }

    setupEventListeners() {
        GameEvents.on(EVENTS.INPUT_MOVE, (data) => this.handleMove(data));
        GameEvents.on(EVENTS.INPUT_ATTACK, (data) => this.handleAttack(data));
        GameEvents.on(EVENTS.INPUT_DASH, (data) => this.handleDash(data));
    }

    update(dt, mousePos) {
        // Update rotation to look at mouse (or last movement direction)
        // Ideally we get mouse pos from InputHandler, but for now we might infer it
        // Or if it's one button, maybe we rotate automatically?
        // Let's assume we rotate continuously or towards a target if we had one.
        // For this specific prototype, let's say "Move" moves forward in current rotation,
        // and rotation usually follows mouse.

        // Handling state timers
        if (this.actionTimer > 0) {
            this.actionTimer -= dt * 1000;
            if (this.actionTimer <= 0) {
                this.returnToIdle();
            }
        }

        if (this.state === 'DASHING') {
            // Trail effect (emit particles via event?)
            if (Math.random() > 0.5) {
                // GameEvents.emit('SPAWN_PARTICLE', { x: this.x, y: this.y ... }) 
                // We'll leave particle logic to main game loop integration for now
            }
        }
    }

    handleMove(data) {
        if (this.state === 'ATTACKING') return; // Can't move while attacking

        this.state = 'MOVING';
        this.components.render.color = PLAYER_CONFIG.MOVE_COLOR;
        this.components.render.effect = null;

        // Get target from input data
        let targetX, targetY;

        if (data && data.mouse) {
            targetX = data.mouse.x;
            targetY = data.mouse.y;
        } else {
            // Fallback
            targetX = this.x + 100;
            targetY = this.y;
        }

        this.applyMovement(targetX, targetY);
    }

    applyMovement(targetX, targetY) {
        if (this.state === 'ATTACKING') return;

        const angle = Math.atan2(targetY - this.y, targetX - this.x);
        this.rotation = angle;

        const force = this.state === 'DASHING' ? PLAYER_CONFIG.DASH_SPEED : PLAYER_CONFIG.SPEED;

        this.components.physics.vx += Math.cos(angle) * force;
        this.components.physics.vy += Math.sin(angle) * force;
    }

    handleAttack() {
        if (this.state === 'DASHING') return;

        this.state = 'ATTACKING';
        this.components.render.color = PLAYER_CONFIG.ATTACK_COLOR;
        this.components.render.shape = 'square'; // Visual change
        this.actionTimer = PLAYER_CONFIG.ATTACK_DURATION;

        // AOE Attack or Projectile?
        // Let's do a simple AOE burst around player
        GameEvents.emit(EVENTS.PLAYER_ATTACKED, { x: this.x, y: this.y, range: 100 });
    }

    handleDash() {
        this.state = 'DASHING';
        this.components.render.color = PLAYER_CONFIG.DASH_COLOR;
        this.components.render.shape = 'triangle';
        this.components.combat.invulnerable = true;
        this.actionTimer = PLAYER_CONFIG.DASH_DURATION;
    }

    returnToIdle() {
        this.state = 'IDLE';
        this.components.render.color = PLAYER_CONFIG.IDLE_COLOR;
        this.components.render.shape = 'circle';
        this.components.render.effect = null;
        this.components.combat.invulnerable = false;
    }
}
