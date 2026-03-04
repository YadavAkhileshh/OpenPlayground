import System from '../ecs/System.js';
import { rectIntersect } from '../utils/MathUtils.js';
import { EVENTS } from '../utils/Constants.js';

export default class PhysicsSystem extends System {
    update(dt) {
        const entities = this.world.getEntitiesWith(['Transform', 'Collider']);
        const obstacles = entities.filter(e => e.getComponent('Collider').tag === 'wall');
        const players = entities.filter(e => e.getComponent('Collider').tag === 'player');
        const exits = entities.filter(e => e.getComponent('Collider').tag === 'exit');

        let playersInExit = 0;

        players.forEach(player => {
            const pTransform = player.getComponent('Transform');
            const pCollider = player.getComponent('Collider');
            const pBox = this.getBounds(pTransform, pCollider);

            let inExit = false;

            // Wall Collisions
            obstacles.forEach(obstacle => {
                // Simple physics (stop movement) handled by checking overlap and resolving
                const oTransform = obstacle.getComponent('Transform');
                const oCollider = obstacle.getComponent('Collider');

                // Skip if not in same world layer (if we enforce layer collision)
                const pLayer = player.getComponent('WorldLayer');
                const oLayer = obstacle.getComponent('WorldLayer');
                if (pLayer && oLayer && pLayer.layer !== oLayer.layer) return;

                const oBox = this.getBounds(oTransform, oCollider);

                if (rectIntersect(pBox, oBox)) {
                    this.resolveCollision(player, pBox, oBox);
                }
            });

            // Exit Collision
            exits.forEach(exit => {
                const pLayer = player.getComponent('WorldLayer');
                const eLayer = exit.getComponent('WorldLayer');
                if (pLayer && eLayer && pLayer.layer !== eLayer.layer) return;

                const eBox = this.getBounds(exit.getComponent('Transform'), exit.getComponent('Collider'));
                if (rectIntersect(pBox, eBox)) {
                    inExit = true;
                }
            });

            if (inExit) playersInExit++;
        });

        // Check if ALL players are in exit
        if (players.length > 0 && playersInExit === players.length) {
            // Debounce or check state to prevent multiple emits
            // For now, simple emit specific logic in Game.js handles state
            this.world.game.events.emit(EVENTS.LEVEL_COMPLETED);
        }
    }

    getBounds(transform, collider) {
        return {
            left: transform.position.x,
            right: transform.position.x + collider.width,
            top: transform.position.y,
            bottom: transform.position.y + collider.height,
            centerX: transform.position.x + collider.width / 2,
            centerY: transform.position.y + collider.height / 2
        };
    }

    resolveCollision(player, pBox, oBox) {
        // Very basic resolution - push back
        const pVel = player.getComponent('Velocity');
        const transform = player.getComponent('Transform');

        // This is a naive resolution, for a puzzle game we might want AABB sweep or simple "undo move"
        // For now, just stop velocity and nudge back?
        // Better: undo the movement step from this frame. 
        // But we don't store previous pos. 
        // Let's just zero velocity and assume standard tile movement might be better later.

        // Simple separation logic
        const dx = (pBox.left + pBox.right) / 2 - (oBox.left + oBox.right) / 2;
        const dy = (pBox.centerY) - (oBox.centerY);

        // Calculate overlap
        const overlapX = (pBox.right - pBox.left) / 2 + (oBox.right - oBox.left) / 2 - Math.abs(dx);
        const overlapY = (pBox.bottom - pBox.top) / 2 + (oBox.bottom - oBox.top) / 2 - Math.abs(dy);

        if (overlapX < overlapY) {
            if (dx > 0) transform.position.x += overlapX;
            else transform.position.x -= overlapX;
        } else {
            if (dy > 0) transform.position.y += overlapY;
            else transform.position.y -= overlapY;
        }
    }
}
