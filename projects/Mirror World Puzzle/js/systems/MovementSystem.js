import System from '../ecs/System.js';

export default class MovementSystem extends System {
    update(dt) {
        const entities = this.world.getEntitiesWith(['Transform', 'Velocity']);

        entities.forEach(entity => {
            const transform = entity.getComponent('Transform');
            const velocity = entity.getComponent('Velocity');

            transform.position.x += velocity.velocity.x * dt;
            transform.position.y += velocity.velocity.y * dt;
        });
    }
}
