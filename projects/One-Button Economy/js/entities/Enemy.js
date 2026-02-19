/**
 * Enemy.js
 * 
 * Base enemy class with modular AI.
 */

import { Entity } from './Entity.js';
import { Components } from '../components/Components.js';
import { ENEMY_CONFIG } from '../core/Constants.js';
import { Utils } from '../core/Utils.js';

export class Enemy extends Entity {
    constructor(x, y, configName = 'BASIC') {
        const config = ENEMY_CONFIG[configName];
        super(x, y, config.SIZE, 'ENEMY');

        this.config = config;

        this.addComponent('physics', Components.Physics());
        this.addComponent('render', Components.Render(config.COLOR, 'square'));
        this.addComponent('health', Components.Health(config.HEALTH));
        this.addComponent('combat', Components.Combat(config.DAMAGE));
        this.addComponent('ai', Components.AI('chase'));

        // override AI params
        this.components.ai.detectionRadius = config.DETECTION_RADIUS;
    }

    update(dt, player) {
        if (!player) return;

        const ai = this.components.ai;
        const distSq = Utils.distanceSquared(this.x, this.y, player.x, player.y);

        // Simple State Machine
        switch (ai.state) {
            case 'IDLE':
                if (distSq < ai.detectionRadius * ai.detectionRadius) {
                    ai.state = 'CHASE';
                }
                break;

            case 'CHASE':
                if (distSq > ai.detectionRadius * ai.detectionRadius * 1.5) {
                    ai.state = 'IDLE';
                    // Stop moving
                    this.components.physics.vx *= 0.9;
                    this.components.physics.vy *= 0.9;
                } else {
                    this.moveTowards(player.x, player.y);
                }
                break;
        }
    }

    moveTowards(targetX, targetY) {
        const angle = Math.atan2(targetY - this.y, targetX - this.x);
        const speed = this.config.SPEED * 0.1; // Acceleration force

        this.components.physics.ax += Math.cos(angle) * speed;
        this.components.physics.ay += Math.sin(angle) * speed;

        this.rotation = angle;
    }
}
