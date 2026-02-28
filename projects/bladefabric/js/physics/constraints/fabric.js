// fabric.js
import { Vec2 } from '../../math/vec2.js';
import { SpringConstraint } from './spring.js';
import { DistanceConstraint } from './distance.js';
import { Body, BodyType } from '../body.js';
import { CircleShape } from '../circleShape.js';

export class Fabric {
    static create(world, x, y, width, height, segmentsX, segmentsY, particleMass = 1.0) {
        const particles = [];
        const spacingX = width / segmentsX;
        const spacingY = height / segmentsY;

        const shape = new CircleShape(Math.min(spacingX, spacingY) * 0.4);
        shape.density = particleMass / (Math.PI * shape.radius * shape.radius);

        // Create particles
        for (let j = 0; j <= segmentsY; j++) {
            const row = [];
            for (let i = 0; i <= segmentsX; i++) {
                const px = x + i * spacingX;
                const py = y + j * spacingY;

                // Top row is static
                const type = (j === 0) ? BodyType.STATIC : BodyType.SOFT;

                const body = new Body(shape.clone(), px, py, type);
                // Lower restitution/friction for cloth
                body.restitution = 0.1;
                body.friction = 0.8;
                body.isSlicable = false; // Cannot slice the particles themselves, tear constraints instead
                body.color = '#3f3f46';

                world.addBody(body);
                row.push(body);
            }
            particles.push(row);
        }

        const constraints = [];

        // Create structural constraints
        for (let j = 0; j <= segmentsY; j++) {
            for (let i = 0; i <= segmentsX; i++) {
                // Structural Horizontal
                if (i < segmentsX) {
                    const c = new DistanceConstraint(particles[j][i], particles[j][i + 1]);
                    c.isTearable = true;
                    c.stiffness = 1.0;
                    world.addConstraint(c);
                    constraints.push(c);
                }

                // Structural Vertical
                if (j < segmentsY) {
                    const c = new DistanceConstraint(particles[j][i], particles[j + 1][i]);
                    c.isTearable = true;
                    c.stiffness = 1.0;
                    world.addConstraint(c);
                    constraints.push(c);
                }

                // Shear Diagonal 1
                if (i < segmentsX && j < segmentsY) {
                    const c = new DistanceConstraint(particles[j][i], particles[j + 1][i + 1]);
                    c.isTearable = true;
                    c.stiffness = 0.8;
                    world.addConstraint(c);
                    constraints.push(c);
                }

                // Shear Diagonal 2
                if (i > 0 && j < segmentsY) {
                    const c = new DistanceConstraint(particles[j][i], particles[j + 1][i - 1]);
                    c.isTearable = true;
                    c.stiffness = 0.8;
                    world.addConstraint(c);
                    constraints.push(c);
                }
            }
        }

        return {
            particles: particles,         // 2D Array
            constraints: constraints,     // 1D Array
            gridWidth: segmentsX + 1,
            gridHeight: segmentsY + 1
        };
    }
}
