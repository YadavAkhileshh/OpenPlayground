// aabbTree.js
import { Broadphase } from './broadphase.js';
import { AABB } from '../../math/bounds.js';

class Node {
    constructor() {
        this.aabb = new AABB();
        this.parent = null;
        this.left = null;
        this.right = null;
        this.body = null;
        this.height = 0;
    }

    isLeaf() {
        return this.left === null;
    }
}

// Simple dynamic AABB tree implementation
export class AABBTree extends Broadphase {
    constructor() {
        super();
        this.root = null;
        this.margin = 0.1;
    }

    insert(body) {
        const node = new Node();
        node.body = body;
        node.aabb = body.getAABB().clone().expand(this.margin);

        body.treeNode = node;

        this.insertLeaf(node);
    }

    remove(body) {
        if (!body.treeNode) return;
        this.removeLeaf(body.treeNode);
        body.treeNode = null;
    }

    update(bodies) {
        for (const body of bodies) {
            if (!body.treeNode) continue;

            const node = body.treeNode;
            const newAABB = body.getAABB();

            if (!node.aabb.contains(newAABB)) {
                this.removeLeaf(node);
                node.aabb = newAABB.clone().expand(this.margin);
                this.insertLeaf(node);
            }
        }
    }

    getPairs() {
        const pairs = [];
        if (!this.root) return pairs;

        // Simple O(N log N) query approach: query each leaf against the tree
        // In a more opt approach, we'd do a tree VS tree traversal to avoid duplicates
        const leaves = [];
        this.collectLeaves(this.root, leaves);

        for (let i = 0; i < leaves.length; i++) {
            const leaf = leaves[i];
            const result = this.queryAABB(leaf.aabb);

            for (const otherBody of result) {
                if (leaf.body.id < otherBody.id) {
                    pairs.push({ bodyA: leaf.body, bodyB: otherBody });
                }
            }
        }

        return pairs;
    }

    collectLeaves(node, results) {
        if (!node) return;
        if (node.isLeaf()) {
            results.push(node);
        } else {
            this.collectLeaves(node.left, results);
            this.collectLeaves(node.right, results);
        }
    }

    queryAABB(aabb) {
        const results = [];
        if (!this.root) return results;

        const stack = [this.root];
        while (stack.length > 0) {
            const node = stack.pop();

            if (node.aabb.overlaps(aabb)) {
                if (node.isLeaf()) {
                    results.push(node.body);
                } else {
                    stack.push(node.left);
                    stack.push(node.right);
                }
            }
        }
        return results;
    }

    queryPoint(point) {
        const results = [];
        if (!this.root) return results;

        const stack = [this.root];
        while (stack.length > 0) {
            const node = stack.pop();

            if (node.aabb.containsPoint(point)) {
                if (node.isLeaf()) {
                    results.push(node.body);
                } else {
                    stack.push(node.left);
                    stack.push(node.right);
                }
            }
        }
        return results;
    }

    // Simplistic raycast: queries broadphase AABB, exact test must be done later
    raycast(ray, segmentLength = Infinity) {
        const results = [];
        // Just return all bodies for now, unless AABB ray test is implemented
        // Optimization: implement exact AABB ray intersection here
        const stack = [this.root];
        // TODO wrapper for ray vs AABB
        if (this.root) {
            const leaves = [];
            this.collectLeaves(this.root, leaves);
            for (let l of leaves) results.push(l.body);
        }
        return results;
    }

    clear() {
        this.root = null;
    }

    insertLeaf(leaf) {
        if (!this.root) {
            this.root = leaf;
            return;
        }

        let sibling = this.root;
        while (!sibling.isLeaf()) {
            const leftArea = sibling.left.aabb.getPerimeter();
            const rightArea = sibling.right.aabb.getPerimeter();

            const combinedLeft = new AABB().combineTwo(sibling.left.aabb, leaf.aabb).getPerimeter();
            const combinedRight = new AABB().combineTwo(sibling.right.aabb, leaf.aabb).getPerimeter();

            const costLeft = combinedLeft - leftArea;
            const costRight = combinedRight - rightArea;

            if (costLeft < costRight) {
                sibling = sibling.left;
            } else {
                sibling = sibling.right;
            }
        }

        const oldParent = sibling.parent;
        const newParent = new Node();
        newParent.parent = oldParent;
        newParent.aabb.combineTwo(leaf.aabb, sibling.aabb);

        if (oldParent) {
            if (oldParent.left === sibling) oldParent.left = newParent;
            else oldParent.right = newParent;

            newParent.left = sibling;
            newParent.right = leaf;
            sibling.parent = newParent;
            leaf.parent = newParent;
        } else {
            newParent.left = sibling;
            newParent.right = leaf;
            sibling.parent = newParent;
            leaf.parent = newParent;
            this.root = newParent;
        }

        leaf.parent = newParent;
        this.syncHierarchy(leaf.parent);
    }

    removeLeaf(leaf) {
        if (leaf === this.root) {
            this.root = null;
            return;
        }

        const parent = leaf.parent;
        const grandParent = parent.parent;
        const sibling = parent.left === leaf ? parent.right : parent.left;

        if (grandParent) {
            if (grandParent.left === parent) grandParent.left = sibling;
            else grandParent.right = sibling;

            sibling.parent = grandParent;
            this.syncHierarchy(grandParent);
        } else {
            this.root = sibling;
            sibling.parent = null;
        }
    }

    syncHierarchy(node) {
        while (node) {
            const height1 = node.left.height;
            const height2 = node.right.height;

            node.height = 1 + Math.max(height1, height2);
            node.aabb.combineTwo(node.left.aabb, node.right.aabb);

            node = node.parent;
        }
    }
}
