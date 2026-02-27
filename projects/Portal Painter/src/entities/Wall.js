import { Entity } from './Entity.js';
import { BoxCollider } from '../physics/Collider.js';

export class Wall extends Entity {
    constructor(x, y, width, height) {
        super(x, y, 'wall');
        this.width = width;
        this.height = height;

        this.body.mass = 0; // Static
        this.body.invMass = 0;
        this.body.isStatic = true;
        this.body.restitution = 0; // No bounce
        this.body.collider = new BoxCollider(this.body, width, height);

        this.color = '#764ba2';
    }

    render(renderer) {
        renderer.drawRect(
            this.body.position.x - this.width / 2,
            this.body.position.y - this.height / 2,
            this.width,
            this.height,
            this.color
        );
    }
}
