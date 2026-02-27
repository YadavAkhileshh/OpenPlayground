/**
 * Handles zoning logic for the CityMap.
 */
export class ZoningSystem {
    /**
     * @param {CityMap} map
     */
    constructor(map) {
        this.map = map;
    }

    /**
     * Zones a single tile
     * @param {number} x
     * @param {number} y
     * @param {string} zoneType (residential, commercial, industrial)
     * @returns {boolean} True if successfully zoned
     */
    zoneTile(x, y, zoneType) {
        const t = this.map.getTile(x, y);
        if (!t) return false;

        // Cannot zone over roads
        if (t.type === 'road' || t.type === 'power_plant') return false;

        t.setZoning(zoneType);
        return true;
    }

    /**
     * Zones an area from start to end points
     */
    zoneArea(startX, startY, endX, endY, zoneType) {
        const x1 = Math.min(startX, endX);
        const x2 = Math.max(startX, endX);
        const y1 = Math.min(startY, endY);
        const y2 = Math.max(startY, endY);

        let cost = 0;

        for (let x = x1; x <= x2; x++) {
            for (let y = y1; y <= y2; y++) {
                if (this.zoneTile(x, y, zoneType)) {
                    cost += 10; // $10 per tile zoning cost
                }
            }
        }
        return cost;
    }

    /**
     * Demolishes whatever is on the tile.
     */
    bulldoze(x, y) {
        const t = this.map.getTile(x, y);
        if (!t || (t.type === 'empty' && t.zoning === 'none')) return false;

        const wasRoad = t.type === 'road';
        const wasPowerNode = t.hasPowerNode;

        t.reset();

        if (wasRoad) this.map.updateRoadNetworkAround(x, y);

        return { success: true, demolishedRoad: wasRoad, demolishedPower: wasPowerNode };
    }
}
