/**
 * GridCell.js – A single cell in the spatial hash grid.
 * Stores references to particles resident in this cell.
 */

const GridCell = (() => {
    'use strict';

    const INITIAL_CAP = 4;

    /**
     * Create a new GridCell with an initial particle index array.
     */
    function create() {
        return {
            indices: new Int32Array(INITIAL_CAP),
            count: 0,
            cap: INITIAL_CAP,
        };
    }

    /**
     * Add a particle index to the cell, growing the array if needed.
     */
    function add(cell, index) {
        if (cell.count >= cell.cap) {
            const newCap = cell.cap * 2;
            const next = new Int32Array(newCap);
            next.set(cell.indices.subarray(0, cell.count));
            cell.indices = next;
            cell.cap = newCap;
        }
        cell.indices[cell.count++] = index;
    }

    /**
     * Clear the cell's contents without releasing memory.
     */
    function clear(cell) {
        cell.count = 0;
    }

    /**
     * Iterate over all particle indices in the cell.
     */
    function each(cell, callback) {
        for (let i = 0; i < cell.count; i++) {
            callback(cell.indices[i]);
        }
    }

    return { create, add, clear, each };
})();

window.SDFChisel = window.SDFChisel || {};
window.SDFChisel.GridCell = GridCell;
