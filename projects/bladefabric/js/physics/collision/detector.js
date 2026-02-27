// detector.js
import { ManifoldGenerator } from './manifold.js';
import { ShapeType } from '../shape.js';

export class CollisionDetector {
    evaluate(pairs) {
        const contacts = [];

        for (const pair of pairs) {
            const bodyA = pair.bodyA;
            const bodyB = pair.bodyB;

            // Optional collision filtering rules can go here
            if (bodyA.type === 0 && bodyB.type === 0) continue; // static vs static

            // Generate contact manifold
            let contact = null;
            if (bodyA.shape.type === ShapeType.POLYGON && bodyB.shape.type === ShapeType.POLYGON) {
                contact = ManifoldGenerator.generate(bodyA, bodyB);
            }

            if (contact && contact.pointCount > 0) {
                contacts.push(contact);
            }
        }

        return contacts;
    }
}
