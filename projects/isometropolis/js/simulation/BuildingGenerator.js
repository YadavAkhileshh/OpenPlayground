import { Utils } from '../math/Utils.js';

/**
 * Handles the spawning and upgrading of buildings on zoned tiles.
 */
export class BuildingGenerator {
    /**
     * @param {CityMap} map
     * @param {DemandSimulator} demand
     */
    constructor(map, demand) {
        this.map = map;
        this.demand = demand;
    }

    /**
     * Runs periodically to develop zones based on Demand.
     */
    tickGeneration() {
        // Find all zoned empty or under-developed tiles
        const potentialTiles = [];

        for (let x = 0; x < this.map.width; x++) {
            for (let y = 0; y < this.map.height; y++) {
                const t = this.map.getTile(x, y);
                // Must be zoned and powered to develop!
                if (t.zoning !== 'none' && t.isPowered) {
                    // It must be adjacent to a road.
                    const neighbors = this.map.getNeighbors(x, y);
                    const hasRoad = neighbors.some(n => n.type === 'road');

                    if (hasRoad) {
                        potentialTiles.push(t);
                    }
                }
            }
        }

        // Shuffle for randomness
        potentialTiles.sort(() => Math.random() - 0.5);

        // Try to build/upgrade a few per tick to avoid sudden bursts
        let built = 0;
        for (const t of potentialTiles) {
            if (built >= 5) break; // Max 5 changes per tick

            this._tryDevelopTile(t);
            built++;
        }
    }

    _tryDevelopTile(tile) {
        // Needs demand for specific zone
        let reqDemand = 0;
        let btype = 'R';
        if (tile.zoning === 'residential') { reqDemand = this.demand.res; btype = 'R'; }
        if (tile.zoning === 'commercial') { reqDemand = this.demand.com; btype = 'C'; }
        if (tile.zoning === 'industrial') { reqDemand = this.demand.ind; btype = 'I'; }

        if (reqDemand > 10) {
            // High demand => build or upgrade
            if (tile.type === 'empty') {
                tile.type = 'building';
                tile.buildingType = btype;
                tile.developmentLevel = 1;
                this._populateStats(tile);
            } else if (tile.developmentLevel < 3) {
                // Upgrade chance depends on Land Value
                if (Math.random() * 100 < tile.landValue) {
                    tile.developmentLevel++;
                    this._populateStats(tile);
                }
            }
        } else if (reqDemand < -20 && tile.type === 'building' && tile.developmentLevel > 1) {
            // Negative demand => degrade
            if (Math.random() < 0.1) {
                tile.developmentLevel--;
                this._populateStats(tile);
            }
        }
    }

    _populateStats(tile) {
        if (tile.type !== 'building') return;

        const base = tile.developmentLevel * 10;
        if (tile.buildingType === 'R') {
            tile.population = base + Utils.randomInt(0, 5);
            tile.jobs = 0;
            tile.pollution = 0;
        } else if (tile.buildingType === 'C') {
            tile.population = 0;
            tile.jobs = base;
            tile.pollution = 5;
        } else if (tile.buildingType === 'I') {
            tile.population = 0;
            tile.jobs = base * 2;
            tile.pollution = base * 3;
        }
    }
}
