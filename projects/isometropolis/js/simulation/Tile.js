/**
 * Represents a single grid cell in the city.
 */
export class Tile {
    /**
     * @param {number} x
     * @param {number} y
     */
    constructor(x, y) {
        this.x = x;
        this.y = y;

        // Base types: 'empty', 'road', 'building', 'power_plant'
        this.type = 'empty';

        // Zoning: 'none', 'residential', 'commercial', 'industrial'
        this.zoning = 'none';

        // Building specific
        this.buildingType = 'none'; // 'R', 'C', 'I'
        this.developmentLevel = 0;   // 0=empty zone, 1-3=building size
        this.population = 0;
        this.jobs = 0;

        // Road specific
        // Bitmask for connected neighbors (1=N, 2=E, 4=S, 8=W)
        this.roadConnections = 0;

        // Power system
        this.isPowered = false;
        this.hasPowerNode = false; // true if it's a wire/plant
        this.isPowerPlant = false;

        // Economy
        this.landValue = 10;
        this.pollution = 0;
    }

    /**
     * Resets the tile completely.
     */
    reset() {
        this.type = 'empty';
        this.zoning = 'none';
        this.buildingType = 'none';
        this.developmentLevel = 0;
        this.population = 0;
        this.jobs = 0;
        this.roadConnections = 0;
        this.isPowered = false;
        this.hasPowerNode = false;
        this.isPowerPlant = false;
        this.pollution = 0;
    }

    /**
     * Sets the tile as a road.
     */
    setRoad() {
        this.reset();
        this.type = 'road';
        // Roads implicitly carry power under them in this engine
        this.hasPowerNode = true;
    }

    /**
     * Sets zoning.
     */
    setZoning(zone) {
        if (this.type !== 'empty' && this.type !== 'building') return; // Can't zone over road
        if (this.type === 'building' && this.zoning !== zone) {
            // Re-zoning destroys existing building
            this.buildingType = 'none';
            this.developmentLevel = 0;
            this.population = 0;
            this.jobs = 0;
            this.type = 'empty';
        }
        this.zoning = zone;
    }

    /**
     * Set as Power Plant
     */
    setPowerPlant() {
        this.reset();
        this.type = 'power_plant';
        this.isPowerPlant = true;
        this.hasPowerNode = true;
        this.isPowered = true;
    }
}
