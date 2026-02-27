/* js/systems/collision.js */
import { Quadtree } from '../core/quadtree.js';

export class CollisionSystem {
    constructor() {
        this.tree = null;
    }

    // Is called when world generates
    buildTree(width, height, edibles) {
        // Boundary is the world size
        const boundary = { x: 0, y: 0, w: width, h: height };
        this.tree = new Quadtree(boundary, 4);

        edibles.forEach(e => {
            // Insert center point with data
            const cx = e.rect.left + e.rect.width / 2;
            const cy = e.rect.top + e.rect.height / 2;
            this.tree.insert({ x: cx, y: cy, data: e });
        });
    }

    // AABB Collision Check
    isColliding(rect1, rect2) {
        return (
            rect1.left < rect2.right &&
            rect1.right > rect2.left &&
            rect1.top < rect2.bottom &&
            rect1.bottom > rect2.top
        );
    }

    check(player, edibles) {
        if (!edibles || edibles.length === 0) return null;

        const playerRect = player.getRect();

        // If tree exists, query it.
        // Optimization: querying the tree is faster than checking 1000 items.
        // We query a range slightly larger than the player to be safe.

        let potentialCollisions = edibles;

        if (this.tree) {
            const range = {
                x: playerRect.left - playerRect.width, // Broad phase padding
                y: playerRect.top - playerRect.height,
                w: playerRect.width * 3,
                h: playerRect.height * 3
            };
            const points = this.tree.query(range);
            potentialCollisions = points.map(p => p.data);
        }

        // Narrow phase
        for (let i = 0; i < potentialCollisions.length; i++) {
            const edible = potentialCollisions[i];

            // Validate if element is still in DOM (it might have been eaten but still in tree/array)
            if (document.body.contains(edible.element)) {
                if (this.isColliding(playerRect, edible.rect)) {
                    return edible;
                }
            }
        }
        return null;
    }
}
