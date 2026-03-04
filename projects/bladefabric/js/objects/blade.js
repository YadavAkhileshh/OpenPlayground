// blade.js
import { Body, BodyType } from '../physics/body.js';
import { PolygonMath } from '../math/polygon.js';
import { PolygonShape } from '../physics/polygonShape.js';
import { Vec2 } from '../math/vec2.js';

export class Blade {
    static create(world, x, y, radius, sides, rpm) {
        const vertices = PolygonMath.createRegularPolygon(sides, radius);
        // Turn it into a star shape
        for (let i = 0; i < vertices.length; i += 2) {
            vertices[i].mul(0.4);
        }

        const shape = new PolygonShape(vertices);
        shape.density = 5.0; // heavy
        shape.friction = 0.8;
        shape.restitution = 0.4;

        const body = new Body(shape, x, y, BodyType.KINEMATIC);
        body.isSlicable = false;
        body.isBlade = true;
        body.color = '#38bdf8'; // bright blue

        // rpm to rad/s : RPM * 2*PI / 60
        body.angularVelocity = (rpm * Math.PI * 2) / 60;

        world.addBody(body);
        return body;
    }
}
