/**
 * Terrain Generation System
 * Handles procedural terrain generation on a sphere using layered noise
 */

import * as THREE from 'three';
import { NoiseGenerator, SphericalUtils, ColorUtils } from './noise.js';

export class TerrainGenerator {
    constructor(params = {}) {
        this.params = {
            radius: params.radius || 10,
            segments: params.segments || 64,
            scale: params.scale || 2.0,
            octaves: params.octaves || 5,
            waterLevel: params.waterLevel || 0.0,
            seed: params.seed || Math.random() * 10000
        };

        this.noise = new NoiseGenerator(this.params.seed);
        this.heightMap = new Map();
        this.normalMap = new Map();
    }

    // Generate sphere geometry with procedural height
    generateGeometry() {
        const { radius, segments } = this.params;
        const geometry = new THREE.SphereGeometry(radius, segments, segments);
        
        this.applyHeightMap(geometry);
        this.calculateNormals(geometry);
        
        return geometry;
    }

    // Apply height displacement to sphere vertices
    applyHeightMap(geometry) {
        const positions = geometry.attributes.position;
        const terrainScale = this.params.scale;
        const octaves = this.params.octaves;

        for (let i = 0; i < positions.count; i++) {
            const x = positions.getX(i);
            const y = positions.getY(i);
            const z = positions.getZ(i);

            // Convert to spherical coordinates
            const { theta, phi } = SphericalUtils.cartesianToSpherical(x, y, z);

            // Generate layered noise
            const baseNoise = this.noise.fbm(
                x * terrainScale,
                y * terrainScale,
                z * terrainScale,
                octaves,
                0.5,
                2.0
            );

            // Add continental shelves
            const continentalNoise = this.noise.fbm(
                x * terrainScale * 0.3,
                y * terrainScale * 0.3,
                z * terrainScale * 0.3,
                3,
                0.6,
                2.5
            );

            // Add mountain ridges
            const mountainNoise = this.noise.ridgedNoise(
                x * terrainScale * 3,
                y * terrainScale * 3,
                z * terrainScale * 3,
                4
            );

            // Combine noise layers
            let height = continentalNoise * 0.6 + baseNoise * 0.3 + mountainNoise * 0.1;
            
            // Apply some variation based on latitude (more variation at mid-latitudes)
            const latitude = SphericalUtils.getLatitude(phi);
            const latitudeFactor = 1.0 - Math.abs(latitude) / 90;
            height *= 0.7 + latitudeFactor * 0.3;

            // Store height for later use
            this.heightMap.set(i, height);

            // Displace vertex
            const displacement = height * this.params.radius * 0.3;
            const length = Math.sqrt(x * x + y * y + z * z);
            const scale = (length + displacement) / length;

            positions.setXYZ(i, x * scale, y * scale, z * scale);
        }

        positions.needsUpdate = true;
        geometry.computeVertexNormals();
    }

    // Calculate normals for lighting
    calculateNormals(geometry) {
        geometry.computeVertexNormals();
        
        const normals = geometry.attributes.normal;
        for (let i = 0; i < normals.count; i++) {
            const normal = {
                x: normals.getX(i),
                y: normals.getY(i),
                z: normals.getZ(i)
            };
            this.normalMap.set(i, normal);
        }
    }

    // Get height at specific vertex
    getHeight(vertexIndex) {
        return this.heightMap.get(vertexIndex) || 0;
    }

    // Get normal at specific vertex
    getNormal(vertexIndex) {
        return this.normalMap.get(vertexIndex) || { x: 0, y: 1, z: 0 };
    }

    // Update terrain parameters
    updateParams(newParams) {
        Object.assign(this.params, newParams);
    }

    // Regenerate with new seed
    regenerate(seed) {
        this.params.seed = seed || Math.random() * 10000;
        this.noise = new NoiseGenerator(this.params.seed);
        this.heightMap.clear();
        this.normalMap.clear();
    }

    // Get vertex data for external processing
    getVertexData(geometry) {
        const positions = geometry.attributes.position;
        const vertices = [];

        for (let i = 0; i < positions.count; i++) {
            const x = positions.getX(i);
            const y = positions.getY(i);
            const z = positions.getZ(i);
            const height = this.getHeight(i);
            const { theta, phi } = SphericalUtils.cartesianToSpherical(x, y, z);

            vertices.push({
                index: i,
                x, y, z,
                theta, phi,
                height,
                latitude: SphericalUtils.getLatitude(phi),
                longitude: SphericalUtils.getLongitude(theta)
            });
        }

        return vertices;
    }

    // Apply colors based on height, climate, etc.
    applyColors(geometry, climateSystem) {
        const positions = geometry.attributes.position;
        const colors = new Float32Array(positions.count * 3);

        for (let i = 0; i < positions.count; i++) {
            const x = positions.getX(i);
            const y = positions.getY(i);
            const z = positions.getZ(i);
            
            const height = this.getHeight(i);
            const { theta, phi } = SphericalUtils.cartesianToSpherical(x, y, z);
            const latitude = SphericalUtils.getLatitude(phi);

            // Get climate data
            const temperature = climateSystem ? climateSystem.getTemperature(latitude, height) : 15;
            const moisture = climateSystem ? climateSystem.getMoisture(latitude, height) : 0.5;

            // Adjust height relative to water level
            const adjustedHeight = height - this.params.waterLevel;

            // Get terrain color
            const color = ColorUtils.getTerrainColor(adjustedHeight, latitude, temperature, moisture);

            colors[i * 3] = color.r;
            colors[i * 3 + 1] = color.g;
            colors[i * 3 + 2] = color.b;
        }

        geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    }

    // Get neighbors of a vertex
    getNeighbors(geometry, vertexIndex) {
        const index = geometry.index;
        const neighbors = new Set();

        if (index) {
            for (let i = 0; i < index.count; i += 3) {
                const a = index.getX(i);
                const b = index.getX(i + 1);
                const c = index.getX(i + 2);

                if (a === vertexIndex) {
                    neighbors.add(b);
                    neighbors.add(c);
                } else if (b === vertexIndex) {
                    neighbors.add(a);
                    neighbors.add(c);
                } else if (c === vertexIndex) {
                    neighbors.add(a);
                    neighbors.add(b);
                }
            }
        }

        return Array.from(neighbors);
    }

    // Calculate slope at vertex
    calculateSlope(geometry, vertexIndex) {
        const positions = geometry.attributes.position;
        const height = this.getHeight(vertexIndex);
        const neighbors = this.getNeighbors(geometry, vertexIndex);

        if (neighbors.length === 0) return 0;

        let maxHeightDiff = 0;
        for (const neighborIdx of neighbors) {
            const neighborHeight = this.getHeight(neighborIdx);
            const heightDiff = Math.abs(height - neighborHeight);
            maxHeightDiff = Math.max(maxHeightDiff, heightDiff);
        }

        return maxHeightDiff;
    }
}

export default TerrainGenerator;
