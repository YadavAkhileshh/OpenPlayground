import System from '../ecs/System.js';
import { KEYS } from '../utils/Constants.js';

export default class InputSystem extends System {
    constructor(input) {
        super();
        this.input = input;
    }

    update(dt) {
        const entities = this.world.getEntitiesWith(['PlayerControl', 'Velocity']);

        entities.forEach(entity => {
            const velocity = entity.getComponent('Velocity');
            const control = entity.getComponent('PlayerControl');
            const mirror = entity.getComponent('MirrorMovement');

            velocity.velocity.x = 0;
            velocity.velocity.y = 0;

            let speed = control.speed;
            let dx = 0;
            let dy = 0;

            if (this.input.isKeyPressed(KEYS.LEFT)) dx -= 1;
            if (this.input.isKeyPressed(KEYS.RIGHT)) dx += 1;
            if (this.input.isKeyPressed(KEYS.UP)) dy -= 1;
            if (this.input.isKeyPressed(KEYS.DOWN)) dy += 1;

            if (mirror) {
                if (mirror.invertX) dx *= -1;
                if (mirror.invertY) dy *= -1;
            }

            velocity.velocity.x = dx * speed;
            velocity.velocity.y = dy * speed;
        });
    }
}
