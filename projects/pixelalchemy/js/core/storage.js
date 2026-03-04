/**
 * Storage Manager
 * Handles saving and loading grid state to LocalStorage.
 * Compresses data using RLE (Run-Length Encoding) to save space.
 */

import { Config } from './config.js';

export class StorageManager {
    constructor(grid, renderer) {
        this.grid = grid;
        this.renderer = renderer;
    }

    save(slot = 'quicksave') {
        try {
            const data = this.serialize();
            localStorage.setItem(`pixelalchemy_${slot}`, data);
            console.log(`Game saved to slot: ${slot} (${data.length} bytes)`);
            return true;
        } catch (e) {
            console.error('Save failed:', e);
            alert('Save failed! Storage might be full.');
            return false;
        }
    }

    load(slot = 'quicksave') {
        const data = localStorage.getItem(`pixelalchemy_${slot}`);
        if (!data) {
            console.warn('No save found');
            return false;
        }
        try {
            this.deserialize(data);
            console.log('Game loaded');
            return true;
        } catch (e) {
            console.error('Load failed:', e);
            return false;
        }
    }

    serialize() {
        // Run-Length Encoding
        // Format: "ID,Count|ID,Count|..."
        // To optimize, we can use characters or Base64, but simplified RLE string is easiest for JSON

        let result = "";
        let currentId = this.grid.cells[0];
        let count = 1;

        // We only save cells, not temp or meta for now (to save space)
        // Ideally we save meta too if it's important (like Fire life)
        // Let's strictly save materials.

        for (let i = 1; i < this.grid.size; i++) {
            if (this.grid.cells[i] === currentId) {
                count++;
            } else {
                result += `${currentId},${count};`;
                currentId = this.grid.cells[i];
                count = 1;
            }
        }
        result += `${currentId},${count}`;
        return result;
    }

    deserialize(str) {
        this.grid.clear();
        const parts = str.split(';');
        let idx = 0;

        for (let part of parts) {
            const [idStr, countStr] = part.split(',');
            const id = parseInt(idStr);
            const count = parseInt(countStr);

            for (let i = 0; i < count; i++) {
                if (idx < this.grid.size) {
                    this.grid.cells[idx] = id;
                    // Reset meta/temp defaults
                    this.grid.meta[idx] = 0;
                    this.grid.temp[idx] = 20;
                    idx++;
                }
            }
        }
    }
}
