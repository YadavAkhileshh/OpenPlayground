class Node {
    constructor(polygons) {
        this.plane = null;
        this.front = null;
        this.back = null;
        this.polygons = [];
        if (polygons) this.build(polygons);
    }

    clone() {
        const node = new Node();
        node.plane = this.plane && this.plane.clone();
        node.front = this.front && this.front.clone();
        node.back = this.back && this.back.clone();
        node.polygons = this.polygons.map(p => p.clone());
        return node;
    }

    // Convert solid space to empty space and empty space to solid space.
    invert() {
        for (let i = 0; i < this.polygons.length; i++) {
            this.polygons[i].flip();
        }
        this.plane.flip();
        if (this.front) this.front.invert();
        if (this.back) this.back.invert();
        const temp = this.front;
        this.front = this.back;
        this.back = temp;
    }

    // Recursively remove all polygons in `polygons` that are inside this BSP tree.
    clipPolygons(polygons) {
        if (!this.plane) return polygons.slice();
        let front = [], back = [];
        for (let i = 0; i < polygons.length; i++) {
            this.plane.splitPolygon(polygons[i], front, back, front, back);
        }
        if (this.front) front = this.front.clipPolygons(front);
        if (this.back) back = this.back.clipPolygons(back);
        else back = []; // If there's no back child, everything behind is outside (solid)? Wait, no.
        // Clarification: In CSG, 'back' is usually defining the "inside" of the solid.
        // If back is null, it means it's a leaf node.
        // Standard CSG logic:
        // if front/back exists, recurse.
        // if not, 

        // Re-implementing standard BSP clip logic more carefully
        return front.concat(back);
    }

    // Remove all polygons in this BSP tree that are inside the other BSP tree `bsp`.
    clipTo(bsp) {
        this.polygons = bsp.clipPolygons(this.polygons);
        if (this.front) this.front.clipTo(bsp);
        if (this.back) this.back.clipTo(bsp);
    }

    // Return a list of all polygons in this BSP tree.
    allPolygons() {
        let polygons = this.polygons.slice();
        if (this.front) polygons = polygons.concat(this.front.allPolygons());
        if (this.back) polygons = polygons.concat(this.back.allPolygons());
        return polygons;
    }

    // Build a BSP tree out of `polygons`.
    build(polygons) {
        if (!polygons.length) return;
        if (!this.plane) this.plane = polygons[0].plane.clone();

        const front = [], back = [];
        for (let i = 0; i < polygons.length; i++) {
            this.plane.splitPolygon(polygons[i], this.polygons, this.polygons, front, back);
        }

        if (front.length) {
            if (!this.front) this.front = new Node();
            this.front.build(front);
        }
        if (back.length) {
            if (!this.back) this.back = new Node();
            this.back.build(back);
        }
    }
}
