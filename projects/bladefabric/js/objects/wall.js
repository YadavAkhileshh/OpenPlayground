// wall.js
import { Body, BodyType } from '../physics/body.js';
import { PolygonMath } from '../math/polygon.js';
import { PolygonShape } from '../physics/polygonShape.js';

export class Wall {
    static create(world, x, y, width, height) {
        const shape = new PolygonShape(PolygonMath.createBox(width, height));
        shape.friction = 0.5;
        shape.restitution = 0.5;

        const body = new Body(shape, x, y, BodyType.STATIC);
        body.isSlicable = false;
        body.color = '#27272a'; // dark zinc color

        world.addBody(body);
        return body;
    }
}
