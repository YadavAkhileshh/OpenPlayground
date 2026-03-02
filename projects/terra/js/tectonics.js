/**
 * Tectonic Plate Simulation
 * Simulates moving tectonic plates that affect terrain elevation
 */

import { NoiseGenerator, SphericalUtils } from './noise.js';

export class TectonicSystem {
    constructor(params = {}) {
        this.params = {
            plateCount: params.plateCount || 8,
            plateSpeed: params.plateSpeed || 1.0,
            seed: params.seed || Math.random() * 10000
        };

        this.noise = new NoiseGenerator(this.params.seed);
        this.plates = [];
        this.plateAssignments = new Map();
        this.age = 0; // Millions of years
    }

    // Initialize tectonic plates
    initialize(vertexData) {
        this.plates = [];
        this.plateAssignments.clear();

        // Generate random plate centers on sphere
        for (let i = 0; i < this.params.plateCount; i++) {
            const theta = Math.random() * Math.PI * 2;
            const phi = Math.acos(2 * Math.random() - 1);

            this.plates.push({
                id: i,
                theta,
                phi,
                velocityTheta: (Math.random() - 0.5) * 0.001,
                velocityPhi: (Math.random() - 0.5) * 0.001,
                type: Math.random() > 0.3 ? 'continental' : 'oceanic', // 70% continental
                density: Math.random() > 0.3 ? 0.7 : 1.0, // Continental = less dense
                color: this.generatePlateColor()
            });
        }

        // Assign each vertex to nearest plate
        vertexData.forEach(vertex => {
            let nearestPlate = 0;
            let minDistance = Infinity;

            this.plates.forEach((plate, plateIdx) => {
                const distance = SphericalUtils.sphericalDistance(
                    vertex.theta, vertex.phi,
                    plate.theta, plate.phi
                );

                if (distance < minDistance) {
                    minDistance = distance;
                    nearestPlate = plateIdx;
                }
            });

            this.plateAssignments.set(vertex.index, nearestPlate);
        });
    }

    // Update plate positions
    update(deltaTime) {
        const timeScale = this.params.plateSpeed * deltaTime * 0.001;
        this.age += timeScale;

        this.plates.forEach(plate => {
            // Move plate
            plate.theta += plate.velocityTheta * timeScale;
            plate.phi += plate.velocityPhi * timeScale;

            // Keep phi in valid range
            plate.phi = Math.max(0.01, Math.min(Math.PI - 0.01, plate.phi));

            // Wrap theta
            if (plate.theta > Math.PI * 2) plate.theta -= Math.PI * 2;
            if (plate.theta < 0) plate.theta += Math.PI * 2;
        });
    }

    // Check if vertex is near plate boundary
    isNearBoundary(vertexIndex, vertexData, threshold = 0.15) {
        const vertex = vertexData.find(v => v.index === vertexIndex);
        if (!vertex) return false;

        const plateId = this.plateAssignments.get(vertexIndex);
        const plate = this.plates[plateId];

        const distanceToCenter = SphericalUtils.sphericalDistance(
            vertex.theta, vertex.phi,
            plate.theta, plate.phi
        );

        // Check if near edge of plate influence
        let nearestOtherPlateDistance = Infinity;
        this.plates.forEach((otherPlate, idx) => {
            if (idx !== plateId) {
                const dist = SphericalUtils.sphericalDistance(
                    vertex.theta, vertex.phi,
                    otherPlate.theta, otherPlate.phi
                );
                nearestOtherPlateDistance = Math.min(nearestOtherPlateDistance, dist);
            }
        });

        return Math.abs(distanceToCenter - nearestOtherPlateDistance) < threshold;
    }

    // Get tectonic influence on elevation
    getTectonicElevation(vertexIndex, vertexData) {
        const vertex = vertexData.find(v => v.index === vertexIndex);
        if (!vertex) return 0;

        const plateId = this.plateAssignments.get(vertexIndex);
        const plate = this.plates[plateId];

        // Mountains form at convergent boundaries
        if (this.isNearBoundary(vertexIndex, vertexData)) {
            // Check collision type
            const nearbyPlates = this.getNearbyPlates(vertex, 0.2);
            
            if (nearbyPlates.length > 1) {
                // Continental-continental collision = high mountains
                if (nearbyPlates.every(p => p.type === 'continental')) {
                    return 0.3 + this.noise.simplexNoise(vertex.x * 5, vertex.y * 5, vertex.z * 5) * 0.2;
                }
                
                // Oceanic-continental = volcanic arc
                if (nearbyPlates.some(p => p.type === 'oceanic')) {
                    return 0.15 + this.noise.simplexNoise(vertex.x * 8, vertex.y * 8, vertex.z * 8) * 0.15;
                }
            }

            // Mid-ocean ridge (divergent boundary)
            if (plate.type === 'oceanic') {
                return -0.1 + this.noise.simplexNoise(vertex.x * 10, vertex.y * 10, vertex.z * 10) * 0.05;
            }
        }

        // Plate interior (stable)
        return plate.type === 'oceanic' ? -0.05 : 0.05;
    }

    // Get plates near a vertex
    getNearbyPlates(vertex, radius) {
        const nearby = [];

        this.plates.forEach(plate => {
            const distance = SphericalUtils.sphericalDistance(
                vertex.theta, vertex.phi,
                plate.theta, plate.phi
            );

            if (distance < radius) {
                nearby.push(plate);
            }
        });

        return nearby;
    }

    // Generate distinct color for plate visualization
    generatePlateColor() {
        return {
            r: Math.random() * 0.5 + 0.5,
            g: Math.random() * 0.5 + 0.5,
            b: Math.random() * 0.5 + 0.5
        };
    }

    // Get plate color for visualization
    getPlateColor(vertexIndex) {
        const plateId = this.plateAssignments.get(vertexIndex);
        return this.plates[plateId]?.color || { r: 1, g: 1, b: 1 };
    }

    // Apply tectonic effects to terrain
    applyToTerrain(geometry, terrainGenerator, vertexData) {
        const positions = geometry.attributes.position;
        
        // Only update every 3rd vertex for performance
        for (let i = 0; i < positions.count; i += 3) {
            const tectonicEffect = this.getTectonicElevation(i, vertexData);
            const currentHeight = terrainGenerator.getHeight(i);
            const newHeight = currentHeight + tectonicEffect * 0.1; // Gradual effect
            
            terrainGenerator.heightMap.set(i, newHeight);

            // Update vertex position
            const x = positions.getX(i);
            const y = positions.getY(i);
            const z = positions.getZ(i);
            
            const displacement = newHeight * terrainGenerator.params.radius * 0.3;
            const length = Math.sqrt(x * x + y * y + z * z);
            const scale = (length + displacement - currentHeight * terrainGenerator.params.radius * 0.3) / length;

            positions.setXYZ(i, x * scale, y * scale, z * scale);
        }

        positions.needsUpdate = true;
        geometry.computeVertexNormals();
    }

    // Update parameters
    updateParams(newParams) {
        const needsReinit = newParams.plateCount && newParams.plateCount !== this.params.plateCount;
        Object.assign(this.params, newParams);
        return needsReinit;
    }

    // Get age in millions of years
    getAge() {
        return this.age.toFixed(1);
    }
}

export default TectonicSystem;
