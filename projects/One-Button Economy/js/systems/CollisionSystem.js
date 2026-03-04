/**
 * CollisionSystem.js
 * 
 * Detects and resolves collisions between entities.
 * Supports Entity vs Entity (specifically Player vs Enemy).
 */

import { Utils } from '../core/Utils.js';
import { GameEvents } from '../core/EventManager.js';
import { EVENTS } from '../core/Constants.js';

export class CollisionSystem {
    constructor() {
    }

    update(entities) {
        // Find player
        const player = entities.find(e => e.type === 'PLAYER');
        if (!player) return; // Game Over or not spawned yet

        // Filter enemies
        const enemies = entities.filter(e => e.type === 'ENEMY');

        // Check Player <-> Enemy collisions
        enemies.forEach(enemy => {
            if (this.checkCollision(player, enemy)) {
                this.resolveCollision(player, enemy);
            }
        });
    }

    checkCollision(a, b) {
        // Use circle collision for smoother gameplay
        const dist = Utils.distance(a.x, a.y, b.x, b.y);
        const minDist = (a.size / 2) + (b.size / 2);
        return dist < minDist;
    }

    resolveCollision(player, enemy) {
        // Check if player is attacking
        if (player.state === 'ATTACKING') {
            // Enemy takes damage
            this.damageEntity(enemy, player.components.combat.damage);

            // Knockback enemy
            const angle = Math.atan2(enemy.y - player.y, enemy.x - player.x);
            const force = 10;
            enemy.components.physics.vx += Math.cos(angle) * force;
            enemy.components.physics.vy += Math.sin(angle) * force;

            GameEvents.emit(EVENTS.MESSAGE_LOGGED, "Enemy Hit!");

        } else if (player.state === 'DASHING') {
            // Dash might pass through or stun? Let's stun/knockback without damage
            const angle = Math.atan2(enemy.y - player.y, enemy.x - player.x);
            const force = 15;
            enemy.components.physics.vx += Math.cos(angle) * force;
            enemy.components.physics.vy += Math.sin(angle) * force;
        } else {
            // Player takes damage
            if (!player.components.combat.invulnerable) {
                this.damageEntity(player, enemy.components.combat.damage);

                // Knockback player
                const angle = Math.atan2(player.y - enemy.y, player.x - enemy.x);
                const force = 8;
                player.components.physics.vx += Math.cos(angle) * force;
                player.components.physics.vy += Math.sin(angle) * force;
            }
        }
    }

    damageEntity(entity, amount) {
        if (!entity.components.health) return;

        entity.components.health.current -= amount;
        GameEvents.emit(EVENTS.ENTITY_DAMAGED, { entityId: entity.id, amount });

        if (entity.components.health.current <= 0) {
            entity.components.health.current = 0;
            GameEvents.emit(EVENTS.ENTITY_DESTROYED, entity);
        }
    }
}
