/**
 * Erosion System
 * Simulates terrain erosion based on slope, rainfall, and time
 */

export class ErosionSystem {
    constructor(params = {}) {
        this.params = {
            erosionRate: params.erosionRate || 0.5,
            rainfallLevel: params.rainfallLevel || 1.0,
            enabled: params.enabled !== undefined ? params.enabled : true
        };

        this.erosionData = new Map();
        this.totalErosion = 0;
    }

    // Initialize erosion data for all vertices
    initialize(vertexData) {
        this.erosionData.clear();
        this.totalErosion = 0;

        vertexData.forEach(vertex => {
            this.erosionData.set(vertex.index, {
                accumulated: 0,
                sediment: 0,
                waterFlow: 0
            });
        });
    }

    // Simulate one erosion step
    simulate(geometry, terrainGenerator, climateSystem, vertexData, deltaTime) {
        if (!this.params.enabled) return;

        const timeScale = this.params.erosionRate * deltaTime * 0.0001;

        // Calculate water flow and erosion (only process subset for performance)
        const step = 2; // Process every 2nd vertex for performance
        for (let i = 0; i < vertexData.length; i += step) {
            const vertex = vertexData[i];
            const erosion = this.calculateErosion(
                geometry,
                terrainGenerator,
                climateSystem,
                vertex,
                vertexData
            );

            const data = this.erosionData.get(vertex.index);
            if (data) {
                data.accumulated += erosion * timeScale;
                this.totalErosion += Math.abs(erosion * timeScale);
            }
        }

        // Apply erosion to terrain
        this.applyErosion(geometry, terrainGenerator, vertexData, timeScale);
    }

    // Calculate erosion for a single vertex
    calculateErosion(geometry, terrainGenerator, climateSystem, vertex, vertexData) {
        const height = terrainGenerator.getHeight(vertex.index);
        
        // No erosion underwater
        if (height < terrainGenerator.params.waterLevel) {
            return 0;
        }

        const slope = terrainGenerator.calculateSlope(geometry, vertex.index);
        const rainfall = this.getRainfall(vertex.latitude, height, climateSystem);
        const temperature = climateSystem.getTemperature(vertex.latitude, height);

        // Slope-based erosion (gravity)
        const slopeErosion = slope * 0.5;

        // Rainfall-based erosion (hydraulic)
        const hydraulicErosion = rainfall * 0.3 * (1 - Math.abs(height) * 0.5);

        // Temperature effects (freeze-thaw weathering in cold regions)
        const thermalErosion = temperature < 0 && temperature > -20 ? 
            0.1 * Math.abs(temperature) / 20 : 0;

        // Combine erosion types
        let totalErosion = slopeErosion + hydraulicErosion + thermalErosion;

        // Reduce erosion on flat plains
        if (slope < 0.1) {
            totalErosion *= 0.2;
        }

        // Mountain peaks erode slower (harder rock)
        if (height > 0.6) {
            totalErosion *= 0.5;
        }

        return totalErosion;
    }

    // Get rainfall at location
    getRainfall(latitude, height, climateSystem) {
        const absLat = Math.abs(latitude);
        
        // Base rainfall from climate system
        let rainfall = this.params.rainfallLevel;

        // Equatorial regions get more rain
        if (absLat < 30) {
            rainfall *= 1.5;
        }

        // Polar regions get less rain
        if (absLat > 60) {
            rainfall *= 0.5;
        }

        // Mountains capture moisture (orographic precipitation)
        if (height > 0.3) {
            rainfall *= 1.2 + (height - 0.3) * 0.5;
        }

        // Deserts (subtropical high pressure)
        if (absLat > 20 && absLat < 35) {
            rainfall *= 0.6;
        }

        return rainfall;
    }

    // Apply accumulated erosion to terrain
    applyErosion(geometry, terrainGenerator, vertexData, timeScale) {
        const positions = geometry.attributes.position;

        vertexData.forEach(vertex => {
            const data = this.erosionData.get(vertex.index);
            const currentHeight = terrainGenerator.getHeight(vertex.index);

            // Apply erosion (lowering terrain)
            const erosionAmount = data.accumulated * 0.01;
            const newHeight = currentHeight - erosionAmount;

            terrainGenerator.heightMap.set(vertex.index, newHeight);

            // Update vertex position
            const x = positions.getX(vertex.index);
            const y = positions.getY(vertex.index);
            const z = positions.getZ(vertex.index);
            
            const displacement = newHeight * terrainGenerator.params.radius * 0.3;
            const oldDisplacement = currentHeight * terrainGenerator.params.radius * 0.3;
            const length = Math.sqrt(x * x + y * y + z * z);
            const scale = (length + displacement - oldDisplacement) / length;

            positions.setXYZ(vertex.index, x * scale, y * scale, z * scale);

            // Deposit sediment in lower areas (simplified)
            const neighbors = terrainGenerator.getNeighbors(geometry, vertex.index);
            let lowerNeighbors = 0;
            
            neighbors.forEach(neighborIdx => {
                if (terrainGenerator.getHeight(neighborIdx) < newHeight) {
                    lowerNeighbors++;
                }
            });

            // If surrounded by lower terrain, deposit some sediment
            if (lowerNeighbors > neighbors.length * 0.7) {
                const deposition = erosionAmount * 0.1;
                terrainGenerator.heightMap.set(vertex.index, newHeight + deposition);
            }
        });

        positions.needsUpdate = true;
        geometry.computeVertexNormals();
    }

    // Get total erosion level as percentage
    getErosionLevel() {
        return Math.min(100, (this.totalErosion * 100).toFixed(1));
    }

    // Update parameters
    updateParams(newParams) {
        Object.assign(this.params, newParams);
    }

    // Reset erosion data
    reset() {
        this.erosionData.clear();
        this.totalErosion = 0;
    }

    // Simulate river formation (simplified)
    simulateRivers(geometry, terrainGenerator, vertexData) {
        const rivers = [];

        // Find high points
        const peaks = vertexData.filter(v => {
            const height = terrainGenerator.getHeight(v.index);
            return height > 0.4 && height < terrainGenerator.params.waterLevel;
        });

        // Trace paths downhill
        peaks.forEach(peak => {
            const river = this.traceRiver(geometry, terrainGenerator, peak, vertexData);
            if (river.length > 5) {
                rivers.push(river);
            }
        });

        return rivers;
    }

    // Trace a river path from high to low elevation
    traceRiver(geometry, terrainGenerator, startVertex, vertexData, maxSteps = 50) {
        const path = [startVertex.index];
        let currentVertex = startVertex;
        let steps = 0;

        while (steps < maxSteps) {
            const neighbors = terrainGenerator.getNeighbors(geometry, currentVertex.index);
            const currentHeight = terrainGenerator.getHeight(currentVertex.index);

            // Find lowest neighbor
            let lowestNeighbor = null;
            let lowestHeight = currentHeight;

            neighbors.forEach(neighborIdx => {
                const neighborHeight = terrainGenerator.getHeight(neighborIdx);
                if (neighborHeight < lowestHeight) {
                    lowestHeight = neighborHeight;
                    lowestNeighbor = neighborIdx;
                }
            });

            // If no lower neighbor or reached water, stop
            if (!lowestNeighbor || lowestHeight < terrainGenerator.params.waterLevel) {
                break;
            }

            path.push(lowestNeighbor);
            currentVertex = vertexData.find(v => v.index === lowestNeighbor);
            steps++;
        }

        return path;
    }
}

export default ErosionSystem;
