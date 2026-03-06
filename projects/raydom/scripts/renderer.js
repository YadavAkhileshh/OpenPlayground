/**
 * @fileoverview Renderer and MiniMap components for RayDOM.
 * Responsible for converting raycasting data and world state into visual elements.
 * Uses optimized DOM pooling for wall strips and canvas for the mini-map.
 */

/**
 * @class Renderer
 * @description Manages the 3D viewport using a pool of vertical DIV strips.
 */
export class Renderer {
    /**
     * @constructor
     * @param {number} numRays - The resolution of the renderer (number of strips).
     */
    constructor(numRays) {
        this.container = document.getElementById('strips-container');
        this.strips = [];
        this.numRays = numRays;
        this.initStrips();

        // Console simulation
        this.consoleLines = [];
        this.maxConsoleLines = 5;
    }

    /**
     * Creates or updates the strip pool based on current resolution.
     */
    initStrips() {
        this.container.innerHTML = '';
        this.strips = [];
        for (let i = 0; i < this.numRays; i++) {
            const strip = document.createElement('div');
            strip.className = 'strip';
            strip.style.width = `${100 / this.numRays}%`;
            this.container.appendChild(strip);
            this.strips.push(strip);
        }
    }

    /**
     * The main draw call for the 3D view.
     * @param {Array<Object>} rays - Array of ray data from the raycaster.
     * @param {Object} player - The player instance for eyeLevel and bobbing information.
     */
    render(rays, player) {
        const viewHeight = window.innerHeight;

        // Apply perspective shift (Jumping/Crouching/Bobbing)
        this.container.style.transform = `translateY(${player.eyeLevel}px)`;

        for (let i = 0; i < rays.length; i++) {
            const ray = rays[i];
            const strip = this.strips[i];
            if (!strip) continue;

            const wallHeight = (viewHeight / ray.distance) * 50;
            const scaleY = wallHeight / viewHeight;

            let brightness = 200 / (1 + ray.distance * 0.004);
            if (ray.side === 1) brightness *= 0.85;

            // Pattern Logic based on cell type
            let bgStyle = '';
            switch (ray.wallType) {
                case 1: // Tech-Wall
                    bgStyle = `linear-gradient(rgba(0,0,0,${1 - brightness / 255}), rgba(0,0,0,${1 - brightness / 255})), 
                               repeating-linear-gradient(0deg, #333 0px, #333 1px, transparent 1px, transparent 4px)`;
                    break;
                case 2: // Door-Wall
                    bgStyle = `repeating-linear-gradient(90deg, #555 0px, #555 5px, #444 5px, #444 10px)`;
                    brightness *= 1.2;
                    break;
                case 3: // Window-Wall
                    bgStyle = `linear-gradient(45deg, rgba(80,180,255,0.4), rgba(200,240,255,0.1))`;
                    break;
                case 4: // Reactor Glow
                    bgStyle = `linear-gradient(to bottom, #7000ff, #00f2ff)`;
                    brightness = 200 + Math.sin(Date.now() * 0.01) * 55;
                    strip.setAttribute('data-glow', 'true');
                    break;
                default:
                    bgStyle = 'none';
            }

            // High-performance style updates
            strip.style.transform = `scaleY(${scaleY})`;
            strip.style.backgroundColor = `rgb(${brightness}, ${brightness * 1.05}, ${brightness * 1.15})`;
            strip.style.backgroundImage = bgStyle;

            // Fog effect
            const opacity = Math.max(0.1, 1 - ray.distance / 2000);
            strip.style.opacity = opacity;
        }

        this.updateViewmodel(player);
        this.updateCompass(player);
    }

    /**
     * Updates the first-person viewmodel (weapon) with procedural bobbing.
     * @param {Object} player - The player instance.
     */
    updateViewmodel(player) {
        const weapon = document.getElementById('weapon');
        if (!weapon) return;

        const bobX = Math.cos(player.bob * 0.5) * 8;
        const bobY = Math.abs(Math.sin(player.bob)) * 12;
        const jumpY = player.z * 0.5;

        weapon.style.transform = `translate3d(${bobX}px, ${bobY + jumpY}px, 0)`;

        // Recoil effect (placeholder)
        if (player.isFiring) {
            weapon.style.filter = 'brightness(2) contrast(1.5)';
        } else {
            weapon.style.filter = 'none';
        }
    }

    /**
     * Updates the directional compass UI.
     * @param {Object} player - The player instance.
     */
    updateCompass(player) {
        const compass = document.getElementById('compass-indicator');
        if (!compass) return;

        const rotationDegrees = (player.angle * 180 / Math.PI) % 360;
        // The compass strip is a repeating NxExSxWxN...
        compass.style.transform = `translateX(${-rotationDegrees}px)`;
    }

    /**
     * Adds a line to the simulated diagnostic console.
     * @param {string} text - Message to display.
     */
    log(text) {
        this.consoleLines.push(`> ${text.toUpperCase()}`);
        if (this.consoleLines.length > this.maxConsoleLines) {
            this.consoleLines.shift();
        }
        this.updateConsoleUI();
    }

    /**
     * Refreshes the console DIV with current lines.
     */
    updateConsoleUI() {
        const consoleEl = document.getElementById('engine-console');
        if (consoleEl) {
            consoleEl.innerHTML = this.consoleLines.join('<br>');
        }
    }
}

/**
 * @class MiniMap
 * @description Renders a 2D top-down view of the world for navigation.
 */
export class MiniMap {
    /**
     * @constructor
     * @param {string} canvasId - DOM ID of the canvas element.
     * @param {Object} map - The MAP instance.
     * @param {Object} player - The player instance.
     */
    constructor(canvasId, map, player) {
        this.canvas = document.getElementById(canvasId);
        if (!this.canvas) return;
        this.ctx = this.canvas.getContext('2d');
        this.map = map;
        this.player = player;
        this.scale = 150 / (map.cols * map.size);
    }

    /**
     * Redraws the mini-map based on current world state.
     */
    draw() {
        if (!this.ctx) return;
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        // Render World Grid
        for (let y = 0; y < this.map.rows; y++) {
            for (let x = 0; x < this.map.cols; x++) {
                const cell = this.map.data[y * this.map.cols + x];
                if (cell > 0) {
                    this.ctx.fillStyle = this.getMapColor(cell);
                    this.ctx.fillRect(
                        x * this.map.size * this.scale,
                        y * this.map.size * this.scale,
                        this.map.size * this.scale - 1,
                        this.map.size * this.scale - 1
                    );
                }
            }
        }

        // Render Player
        this.ctx.fillStyle = '#00f2ff';
        this.ctx.beginPath();
        this.ctx.arc(this.player.x * this.scale, this.player.y * this.scale, 4, 0, Math.PI * 2);
        this.ctx.fill();

        // Direction Vector
        this.ctx.strokeStyle = '#00f2ff';
        this.ctx.lineWidth = 2;
        this.ctx.beginPath();
        this.ctx.moveTo(this.player.x * this.scale, this.player.y * this.scale);
        this.ctx.lineTo(
            (this.player.x + Math.cos(this.player.angle) * 30) * this.scale,
            (this.player.y + Math.sin(this.player.angle) * 30) * this.scale
        );
        this.ctx.stroke();
    }

    /**
     * Determines the color of a map cell based on its type.
     * @param {number} type - The cell type ID.
     * @returns {string} Hex or RGBA color.
     */
    getMapColor(type) {
        switch (type) {
            case 1: return '#333';
            case 2: return '#555';
            case 3: return '#00aaff44';
            case 4: return '#7000ff';
            default: return '#111';
        }
    }
}
