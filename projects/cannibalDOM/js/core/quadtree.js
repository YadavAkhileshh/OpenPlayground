/* js/core/quadtree.js */
export class Quadtree {
    constructor(boundary, capacity) {
        this.boundary = boundary; // {x, y, w, h}
        this.capacity = capacity;
        this.points = [];
        this.divided = false;
    }

    // Insert a point (object with {x, y, data})
    // For rectangles, we can store center point or use an AABB Quadtree. 
    // Let's use a Point Quadtree for simplicity, storing the center of the edible.
    insert(point) {
        if (!this.contains(point)) {
            return false;
        }

        if (this.points.length < this.capacity) {
            this.points.push(point);
            return true;
        }

        if (!this.divided) {
            this.subdivide();
        }

        return (
            this.northeast.insert(point) ||
            this.northwest.insert(point) ||
            this.southeast.insert(point) ||
            this.southwest.insert(point)
        );
    }

    subdivide() {
        const x = this.boundary.x;
        const y = this.boundary.y;
        const w = this.boundary.w / 2;
        const h = this.boundary.h / 2;

        const ne = { x: x + w, y: y, w: w, h: h };
        const nw = { x: x, y: y, w: w, h: h };
        const se = { x: x + w, y: y + h, w: w, h: h };
        const sw = { x: x, y: y + h, w: w, h: h };

        this.northeast = new Quadtree(ne, this.capacity);
        this.northwest = new Quadtree(nw, this.capacity);
        this.southeast = new Quadtree(se, this.capacity);
        this.southwest = new Quadtree(sw, this.capacity);

        this.divided = true;
    }

    contains(point) {
        return (
            point.x >= this.boundary.x &&
            point.x <= this.boundary.x + this.boundary.w &&
            point.y >= this.boundary.y &&
            point.y <= this.boundary.y + this.boundary.h
        );
    }

    query(range, found) {
        if (!found) found = [];

        if (!this.intersects(range, this.boundary)) {
            return found;
        }

        for (let p of this.points) {
            if (this.intersectsPoint(range, p)) {
                found.push(p);
            }
        }

        if (this.divided) {
            this.northeast.query(range, found);
            this.northwest.query(range, found);
            this.southeast.query(range, found);
            this.southwest.query(range, found);
        }

        return found;
    }

    intersects(range, boundary) {
        return !(
            range.x > boundary.x + boundary.w ||
            range.x + range.w < boundary.x ||
            range.y > boundary.y + boundary.h ||
            range.y + range.h < boundary.y
        );
    }

    intersectsPoint(range, point) {
        return (
            point.x >= range.x &&
            point.x <= range.x + range.w &&
            point.y >= range.y &&
            point.y <= range.y + range.h
        );
    }

    clear() {
        this.points = [];
        this.divided = false;
        this.northeast = null;
        this.northwest = null;
        this.southeast = null;
        this.southwest = null;
    }
}
