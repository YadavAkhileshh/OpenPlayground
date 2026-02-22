import { Vehicle } from './Vehicle.js';

/**
 * Manages pooling, spawning and updating of all active vehicles.
 */
export class VehicleManager {
    /**
     * @param {RoadNetwork} network
     * @param {Pathfinder} pathfinder
     * @param {CityMap} map
     */
    constructor(network, pathfinder, map) {
        this.network = network;
        this.pathfinder = pathfinder;
        this.map = map;

        this.vehicles = [];
        this.maxVehicles = 500; // soft cap
    }

    /**
     * System tick
     * @param {number} dt Delta time
     */
    update(dt) {
        // Clear invalid vehicles if map changes underneath them
        for (let i = this.vehicles.length - 1; i >= 0; i--) {
            const v = this.vehicles[i];
            v.update(dt);

            // If arrived, remove it. (In a real game, it parking or turning around)
            if (v.state === 'arrived') {
                this.vehicles.splice(i, 1);
                continue;
            }

            // Check if target node is still a road
            if (v.targetNode) {
                const t = this.map.getTile(v.targetNode.x, v.targetNode.y);
                if (!t || t.type !== 'road') {
                    // Road was bulldozed, kill vehicle
                    this.vehicles.splice(i, 1);
                }
            }
        }

        // Spawn occasionally depending on road availability
        if (this.vehicles.length < this.maxVehicles && Math.random() < 0.2) {
            this.spawnRandomCommuter();
        }
    }

    /**
     * Attempts to spawn a vehicle between two random road nodes.
     */
    spawnRandomCommuter() {
        if (this.network.graph.size < 2) return;

        const start = this.network.getRandomNode();
        let end = this.network.getRandomNode();

        // Ensure different points
        let tries = 5;
        while (start.x === end.x && start.y === end.y && tries > 0) {
            end = this.network.getRandomNode();
            tries--;
        }

        if (start.x === end.x && start.y === end.y) return;

        const path = this.pathfinder.findPath(start.x, start.y, end.x, end.y);

        if (path && path.length > 0) {
            const v = new Vehicle(start.x, start.y);
            v.setPath(path);
            this.vehicles.push(v);
        }
    }
}
