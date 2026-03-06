/**
 * @fileoverview High-performance raycasting engine for RayDOM.
 * Implements the DDA (Digital Differential Analyzer) algorithm to map 2D rays to 3D vertical spans.
 * This module is the mathematical core of the engine.
 */

import { MAP } from './map.js';

/**
 * @class Raycaster
 * @description Handles the projection of rays from the player's camera through the grid map.
 */
export class Raycaster {
    /**
     * @constructor
     * @param {Object} player - Reference to the player state.
     * @param {number} numRays - Number of horizontal rays to cast (resolution).
     */
    constructor(player, numRays) {
        this.player = player;
        this.numRays = numRays;
        this.fov = Math.PI / 3; // 60-degree field of view
    }

    /**
     * Casts a full set of rays across the player's field of view.
     * @returns {Array<Object>} Collection of intersection results for each ray.
     */
    castRays() {
        const rays = [];
        // Calculate the starting angle from the left edge of the FOV
        const startAngle = this.player.angle - this.fov / 2;

        for (let i = 0; i < this.numRays; i++) {
            // Distribute angles linearly across the FOV
            const rayAngle = startAngle + (i / this.numRays) * this.fov;
            const ray = this.castRay(rayAngle);
            rays.push(ray);
        }

        return rays;
    }

    /**
     * Casts a single ray into the grid and finds the nearest wall intersection.
     * Uses the DDA algorithm for O(N) complexity where N is the number of grid crossings.
     * @param {number} angle - The angle of the ray in radians.
     * @returns {Object} Intersection data (distance, side, wallType).
     */
    castRay(angle) {
        // Compute direction unit vectors
        const rayDirX = Math.cos(angle);
        const rayDirY = Math.sin(angle);

        // Determine which grid cell the player is currently in
        let mapX = Math.floor(this.player.x / MAP.size);
        let mapY = Math.floor(this.player.y / MAP.size);

        // Distance the ray has to travel to cross one grid square boundary
        const deltaDistX = Math.abs(1 / rayDirX);
        const deltaDistY = Math.abs(1 / rayDirY);

        /** @type {number} Current total distance to next boundary */
        let sideDistX;
        let sideDistY;

        /** @type {number} Direction of grid step (1 or -1) */
        let stepX;
        let stepY;

        let hit = 0; // State flag: 0 = searching, 1 = wall hit
        let side;   // State flag: 0 = X-axis hit, 1 = Y-axis hit

        // Step-direction and Initial Side Distance setup
        if (rayDirX < 0) {
            stepX = -1;
            sideDistX = (this.player.x / MAP.size - mapX) * deltaDistX;
        } else {
            stepX = 1;
            sideDistX = (mapX + 1.0 - this.player.x / MAP.size) * deltaDistX;
        }

        if (rayDirY < 0) {
            stepY = -1;
            sideDistY = (this.player.y / MAP.size - mapY) * deltaDistY;
        } else {
            stepY = 1;
            sideDistY = (mapY + 1.0 - this.player.y / MAP.size) * deltaDistY;
        }

        // --- DDA LOOP ---
        // Iteratively jump to the next grid boundary until a solid wall is hit.
        // This is much faster than incremental stepping at small intervals.
        let iterations = 0;
        const maxIterations = 50; // Performance safety cap

        while (hit === 0 && iterations < maxIterations) {
            if (sideDistX < sideDistY) {
                sideDistX += deltaDistX;
                mapX += stepX;
                side = 0; // Hit a vertical grid line
            } else {
                sideDistY += deltaDistY;
                mapY += stepY;
                side = 1; // Hit a horizontal grid line
            }

            // Check world data for solid cell
            const cellType = MAP.data[mapY * MAP.cols + mapX];
            if (cellType > 0) {
                // Determine if we should stop (solid walls stop rays, windows don't)
                // Note: For advanced window rendering, we'd need multiple hits.
                if (cellType !== 3) {
                    hit = 1;
                }
            }
            iterations++;
        }

        /** @type {number} Perpendicular distance to prevent fisheye distortion */
        let perpWallDist;
        if (side === 0) {
            perpWallDist = (mapX - this.player.x / MAP.size + (1 - stepX) / 2) / rayDirX;
        } else {
            perpWallDist = (mapY - this.player.y / MAP.size + (1 - stepY) / 2) / rayDirY;
        }

        // Safety clamp on distance to prevent infinite scaling
        const dist = Math.max(0.1, perpWallDist * MAP.size);

        return {
            distance: dist,
            side: side,
            angle: angle,
            wallType: MAP.data[mapY * MAP.cols + mapX] || 1,
            mapX,
            mapY
        };
    }
}
