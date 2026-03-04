/**
 * Climate System
 * Manages temperature, climate zones, and weather patterns
 */

import { SphericalUtils } from './noise.js';

export class ClimateSystem {
    constructor(params = {}) {
        this.params = {
            globalTemp: params.globalTemp || 15, // Celsius
            tempVariance: params.tempVariance || 1.0,
            season: params.season || 0 // 0-1 representing position in year
        };

        this.climateZones = new Map();
    }

    // Calculate temperature at a location
    getTemperature(latitude, elevation, season = this.params.season) {
        const absLat = Math.abs(latitude);
        
        // Base temperature decreases with latitude
        let temp = this.params.globalTemp - (absLat / 90) * 40 * this.params.tempVariance;

        // Elevation effect (lapse rate: ~6.5°C per km)
        // Assuming elevation 0-1 maps to 0-8km
        temp -= elevation * 52 * this.params.tempVariance;

        // Seasonal variation (more at higher latitudes)
        const seasonalEffect = Math.sin(season * Math.PI * 2) * (absLat / 90) * 20 * this.params.tempVariance;
        temp += seasonalEffect;

        return temp;
    }

    // Calculate moisture/precipitation
    getMoisture(latitude, elevation) {
        const absLat = Math.abs(latitude);
        
        // High moisture at equator (ITCZ)
        let moisture = 1.0 - (absLat / 90) * 0.5;

        // Low moisture in subtropical zones (20-35°)
        if (absLat > 20 && absLat < 35) {
            moisture *= 0.4;
        }

        // High moisture in mid-latitudes (35-60°)
        if (absLat > 35 && absLat < 60) {
            moisture *= 1.2;
        }

        // Mountains capture moisture
        if (elevation > 0.3) {
            moisture *= 1.0 + (elevation - 0.3) * 0.8;
        }

        // Clamp moisture
        return Math.max(0, Math.min(2, moisture));
    }

    // Get climate zone classification
    getClimateZone(latitude, elevation, temperature, moisture) {
        const absLat = Math.abs(latitude);

        // Polar
        if (absLat > 66.5 || temperature < -10) {
            return 'polar';
        }

        // Tundra
        if (absLat > 60 || (temperature < 0 && temperature >= -10)) {
            return 'tundra';
        }

        // Alpine (high elevation)
        if (elevation > 0.5) {
            return 'alpine';
        }

        // Desert (low moisture)
        if (moisture < 0.4) {
            return 'desert';
        }

        // Tropical (low latitude, high moisture)
        if (absLat < 23.5 && moisture > 0.8) {
            return 'tropical';
        }

        // Temperate
        return 'temperate';
    }

    // Get wind patterns (simplified)
    getWindDirection(latitude) {
        const absLat = Math.abs(latitude);

        // Polar easterlies
        if (absLat > 60) {
            return { u: 1, v: 0 }; // Eastward
        }

        // Westerlies
        if (absLat > 30 && absLat <= 60) {
            return { u: -1, v: 0 }; // Westward
        }

        // Trade winds
        if (absLat <= 30) {
            return { u: 1, v: latitude > 0 ? -0.5 : 0.5 }; // Eastward with meridional component
        }

        return { u: 0, v: 0 };
    }

    // Calculate air pressure (simplified)
    getAirPressure(latitude, elevation) {
        const absLat = Math.abs(latitude);
        
        // Standard pressure at sea level
        let pressure = 1013.25; // hPa

        // Elevation effect (exponential decrease)
        pressure *= Math.exp(-elevation * 0.8);

        // Subtropical highs (25-35°)
        if (absLat > 25 && absLat < 35) {
            pressure *= 1.02;
        }

        // Equatorial low
        if (absLat < 10) {
            pressure *= 0.98;
        }

        // Polar highs
        if (absLat > 70) {
            pressure *= 1.01;
        }

        return pressure;
    }

    // Classify climate for all vertices
    classifyClimates(vertexData, terrainGenerator) {
        this.climateZones.clear();

        vertexData.forEach(vertex => {
            const height = terrainGenerator.getHeight(vertex.index);
            const temp = this.getTemperature(vertex.latitude, height);
            const moisture = this.getMoisture(vertex.latitude, height);
            const zone = this.getClimateZone(vertex.latitude, height, temp, moisture);

            this.climateZones.set(vertex.index, {
                zone,
                temperature: temp,
                moisture,
                pressure: this.getAirPressure(vertex.latitude, height)
            });
        });
    }

    // Get climate data for vertex
    getClimateData(vertexIndex) {
        return this.climateZones.get(vertexIndex) || {
            zone: 'temperate',
            temperature: 15,
            moisture: 0.5,
            pressure: 1013
        };
    }

    // Get average global temperature
    getAverageTemperature() {
        if (this.climateZones.size === 0) return this.params.globalTemp;

        let sum = 0;
        this.climateZones.forEach(data => {
            sum += data.temperature;
        });

        return (sum / this.climateZones.size).toFixed(1);
    }

    // Update season (0 to 1)
    updateSeason(newSeason) {
        this.params.season = newSeason % 1;
    }

    // Get season name
    getSeasonName(hemisphere = 'north') {
        const season = this.params.season;
        const seasons = hemisphere === 'north' 
            ? ['Spring', 'Summer', 'Fall', 'Winter']
            : ['Fall', 'Winter', 'Spring', 'Summer'];

        const idx = Math.floor(season * 4);
        return seasons[idx];
    }

    // Update parameters
    updateParams(newParams) {
        Object.assign(this.params, newParams);
    }

    // Simulate weather patterns (simplified)
    simulateWeather(vertexData, terrainGenerator, deltaTime) {
        // This would handle dynamic weather systems
        // For now, just update seasonal position
        this.params.season = (this.params.season + deltaTime * 0.0001) % 1;
    }

    // Get cloud cover based on moisture and temperature
    getCloudCover(latitude, elevation) {
        const moisture = this.getMoisture(latitude, elevation);
        const temp = this.getTemperature(latitude, elevation);

        // More clouds in wet regions
        let cloudCover = moisture * 0.7;

        // More clouds where temperature is moderate
        if (temp > 0 && temp < 25) {
            cloudCover *= 1.2;
        }

        return Math.min(1, cloudCover);
    }
}

export default ClimateSystem;
