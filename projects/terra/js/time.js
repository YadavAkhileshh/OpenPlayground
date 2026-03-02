/**
 * Time and Lighting System
 * Manages day/night cycles, seasons, and dynamic lighting
 */

import * as THREE from 'three';

export class TimeSystem {
    constructor(params = {}) {
        this.params = {
            timeSpeed: params.timeSpeed || 1.0,
            axialTilt: params.axialTilt || 23.5, // degrees
            dayLength: params.dayLength || 24, // hours
            yearLength: params.yearLength || 365 // days
        };

        this.currentTime = 0; // In simulation hours
        this.currentDay = 0;
        this.currentYear = 0;
        this.timeOfDay = 0; // 0-1, where 0=midnight, 0.5=noon
        this.seasonProgress = 0; // 0-1, where 0=spring equinox
    }

    // Update time progression
    update(deltaTime) {
        // deltaTime is in milliseconds, convert to simulation hours
        const hoursPassed = (deltaTime / 1000) * this.params.timeSpeed;
        
        this.currentTime += hoursPassed;
        
        // Update time of day
        this.timeOfDay = (this.currentTime % this.params.dayLength) / this.params.dayLength;
        
        // Update day count
        this.currentDay = Math.floor(this.currentTime / this.params.dayLength);
        
        // Update season progress
        this.seasonProgress = (this.currentDay % this.params.yearLength) / this.params.yearLength;
        
        // Update year
        this.currentYear = Math.floor(this.currentDay / this.params.yearLength);
    }

    // Get current time in years
    getTimeInYears() {
        return (this.currentTime / (this.params.dayLength * this.params.yearLength)).toFixed(2);
    }

    // Get time of day as string
    getTimeOfDayString() {
        if (this.timeOfDay >= 0.25 && this.timeOfDay < 0.75) {
            return 'Day';
        } else if (this.timeOfDay >= 0.20 && this.timeOfDay < 0.25) {
            return 'Dawn';
        } else if (this.timeOfDay >= 0.75 && this.timeOfDay < 0.80) {
            return 'Dusk';
        } else {
            return 'Night';
        }
    }

    // Get sun position for lighting
    getSunPosition() {
        // Sun rotates around Y axis
        const angle = this.timeOfDay * Math.PI * 2 - Math.PI / 2; // -90° at noon
        
        // Apply axial tilt based on season
        const tiltAngle = this.params.axialTilt * Math.PI / 180;
        const seasonalTilt = Math.sin(this.seasonProgress * Math.PI * 2) * tiltAngle;
        
        const x = Math.cos(angle) * Math.cos(seasonalTilt);
        const y = Math.sin(seasonalTilt);
        const z = Math.sin(angle) * Math.cos(seasonalTilt);
        
        const length = Math.sqrt(x * x + y * y + z * z);
        return {
            x: x / length,
            y: y / length,
            z: z / length
        };
    }

    // Get sun intensity (0-1)
    getSunIntensity() {
        // Sun is brightest at noon (timeOfDay = 0.5)
        const noonDistance = Math.abs(this.timeOfDay - 0.5);
        
        if (noonDistance > 0.25) {
            // Night time
            return 0;
        } else if (noonDistance > 0.23) {
            // Twilight
            return (0.25 - noonDistance) / 0.02;
        } else {
            // Daytime - cosine curve for realistic intensity
            return Math.cos(noonDistance * Math.PI * 2);
        }
    }

    // Get ambient light color based on time of day
    getAmbientColor() {
        const intensity = this.getSunIntensity();
        
        if (intensity === 0) {
            // Night - dark blue
            return { r: 0.05, g: 0.05, b: 0.15 };
        } else if (intensity < 0.3) {
            // Dawn/Dusk - orange/red
            const t = intensity / 0.3;
            return {
                r: 0.8 - t * 0.3,
                g: 0.4 - t * 0.1,
                b: 0.2 + t * 0.3
            };
        } else {
            // Day - white/yellow
            return {
                r: 1.0,
                g: 0.95,
                b: 0.85
            };
        }
    }

    // Get sun color
    getSunColor() {
        const intensity = this.getSunIntensity();
        
        if (intensity > 0.7) {
            // Midday - bright white
            return { r: 1.0, g: 1.0, b: 0.95 };
        } else if (intensity > 0.3) {
            // Morning/afternoon - warm yellow
            return { r: 1.0, g: 0.95, b: 0.8 };
        } else if (intensity > 0) {
            // Sunrise/sunset - orange/red
            return { r: 1.0, g: 0.6, b: 0.3 };
        } else {
            // Night - no sun
            return { r: 0, g: 0, b: 0 };
        }
    }

    // Get sky color
    getSkyColor() {
        const intensity = this.getSunIntensity();
        
        if (intensity === 0) {
            // Night sky - dark blue/black
            return { r: 0.01, g: 0.01, b: 0.05 };
        } else if (intensity < 0.3) {
            // Dawn/Dusk - gradient
            const t = intensity / 0.3;
            return {
                r: 0.4 + t * 0.2,
                g: 0.2 + t * 0.5,
                b: 0.5 + t * 0.3
            };
        } else {
            // Day - blue sky
            return { r: 0.53, g: 0.81, b: 0.92 };
        }
    }

    // Get moon position (opposite to sun)
    getMoonPosition() {
        const sunPos = this.getSunPosition();
        return {
            x: -sunPos.x,
            y: -sunPos.y,
            z: -sunPos.z
        };
    }

    // Get moon intensity
    getMoonIntensity() {
        const sunIntensity = this.getSunIntensity();
        // Moon is visible when sun is not
        return Math.max(0, 0.2 - sunIntensity * 0.2);
    }

    // Check if it's currently day
    isDay() {
        return this.getSunIntensity() > 0.1;
    }

    // Get season name based on progress
    getSeasonName(hemisphere = 'north') {
        const progress = this.seasonProgress;
        
        if (hemisphere === 'north') {
            if (progress < 0.25) return 'Spring';
            if (progress < 0.5) return 'Summer';
            if (progress < 0.75) return 'Fall';
            return 'Winter';
        } else {
            if (progress < 0.25) return 'Fall';
            if (progress < 0.5) return 'Winter';
            if (progress < 0.75) return 'Spring';
            return 'Summer';
        }
    }

    // Update lighting in Three.js scene
    updateLighting(scene, directionalLight, ambientLight, atmosphere) {
        if (!directionalLight || !ambientLight || !scene) return;
        
        const sunPos = this.getSunPosition();
        const sunIntensity = this.getSunIntensity();
        const sunColor = this.getSunColor();
        const ambientColor = this.getAmbientColor();
        
        // Update directional light (sun)
        directionalLight.position.set(sunPos.x * 100, sunPos.y * 100, sunPos.z * 100);
        directionalLight.intensity = sunIntensity * 1.5;
        if (directionalLight.color) {
            directionalLight.color.setRGB(sunColor.r, sunColor.g, sunColor.b);
        }
        
        // Update ambient light
        ambientLight.intensity = 0.3 + sunIntensity * 0.2;
        if (ambientLight.color) {
            ambientLight.color.setRGB(ambientColor.r, ambientColor.g, ambientColor.b);
        }
        
        // Update background color
        const skyColor = this.getSkyColor();
        if (scene.background) {
            scene.background.setRGB(skyColor.r, skyColor.g, skyColor.b);
        }
        
        // Update atmosphere glow if it exists
        if (atmosphere && atmosphere.material) {
            atmosphere.material.opacity = 0.3 + sunIntensity * 0.2;
            if (atmosphere.material.emissive) {
                atmosphere.material.emissive.setRGB(
                    ambientColor.r * 0.5,
                    ambientColor.g * 0.5,
                    ambientColor.b * 0.5
                );
            }
        }
    }

    // Update parameters
    updateParams(newParams) {
        Object.assign(this.params, newParams);
    }

    // Reset time
    reset() {
        this.currentTime = 0;
        this.currentDay = 0;
        this.currentYear = 0;
        this.timeOfDay = 0;
        this.seasonProgress = 0;
    }

    // Get formatted time string
    getFormattedTime() {
        const hours = Math.floor(this.timeOfDay * 24);
        const minutes = Math.floor((this.timeOfDay * 24 - hours) * 60);
        return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
    }

    // Calculate shadow length based on sun angle
    getShadowLength() {
        const sunPos = this.getSunPosition();
        const sunHeight = sunPos.y;
        
        if (sunHeight <= 0) return Infinity; // Night
        
        // Shadow length is inversely proportional to sun height
        return 1 / sunHeight;
    }
}

export default TimeSystem;
