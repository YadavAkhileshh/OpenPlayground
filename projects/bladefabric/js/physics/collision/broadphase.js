// broadphase.js
export class Broadphase {
    constructor() {
    }

    insert(body) {
        throw new Error("Broadphase insert must be implemented");
    }

    remove(body) {
        throw new Error("Broadphase remove must be implemented");
    }

    update(bodies) {
        throw new Error("Broadphase update must be implemented");
    }

    getPairs() {
        throw new Error("Broadphase getPairs must be implemented");
    }

    queryPoint(point) {
        throw new Error("Broadphase queryPoint must be implemented");
    }

    queryAABB(aabb) {
        throw new Error("Broadphase queryAABB must be implemented");
    }

    raycast(ray) {
        throw new Error("Broadphase raycast must be implemented");
    }

    clear() {
        throw new Error("Broadphase clear must be implemented");
    }
}
