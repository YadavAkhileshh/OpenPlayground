/**
 * @file renderer.js
 * @description Handles Canvas 2D rendering of the simulation.
 */

import { CONFIG } from '../utils/constants.js';

export class Renderer {
    constructor(canvas, simulation) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.sim = simulation;

        this.width = canvas.width;
        this.height = canvas.height;

        this.camera = {
            mode: 'global', // 'global' or 'follow'
            targetId: null,
            x: 0,
            y: 0,
            scale: 1,
            zoom: 1
        };
    }

    setCameraMode(mode, targetId = null) {
        this.camera.mode = mode;
        this.camera.targetId = targetId;
        if (mode === 'global') {
            this.camera.scale = 1;
            this.camera.x = 0;
            this.camera.y = 0;
        } else {
            this.camera.scale = 2.5; // Zoom in
        }
    }

    resize(w, h) {
        this.width = w;
        this.height = h;
        this.canvas.width = w;
        this.canvas.height = h;
    }

    render(effects) {
        // Clear background
        this.ctx.fillStyle = '#0a0a0a';
        this.ctx.fillRect(0, 0, this.width, this.height);

        this.ctx.save();

        // Center coordinate system
        this.ctx.translate(this.width / 2, this.height / 2);

        // Apply Camera Transform
        if (this.camera.mode === 'follow' && this.camera.targetId !== null) {
            const target = this.sim.vehicles.find(v => v.id === this.camera.targetId);
            if (target) {
                // Get target position
                const { x, y, angle } = this.sim.road.getCoordinates(target.position);

                // Rotate world so car is always UP? Or just follow position?
                // Let's just follow position for now.
                // We want target to be at (0,0) of screen (which is width/2, height/2)
                // So we translate by -x, -y

                this.ctx.scale(this.camera.scale, this.camera.scale);
                // this.ctx.rotate(-angle - Math.PI/2); // Optional: Rotate to keep car vertical
                this.ctx.translate(-x, -y);
            } else {
                // Target lost, switch back
                this.setCameraMode('global');
            }
        } else {
            // Global view
            // Maybe fit road to screen if window is small?
            // Road radius 250.
            const minDim = Math.min(this.width, this.height);
            const fitScale = (minDim * 0.9) / (this.sim.road.radius * 2);
            this.ctx.scale(fitScale, fitScale);
        }

        this.drawRoad();
        this.drawVehicles();

        if (effects) {
            effects.draw(this.ctx);
        }

        this.ctx.restore();
    }

    drawRoad() {
        const { radius, width } = this.sim.road;

        // Road surface
        this.ctx.beginPath();
        this.ctx.arc(0, 0, radius, 0, Math.PI * 2);
        this.ctx.lineWidth = width;
        this.ctx.strokeStyle = CONFIG.ROAD_COLOR;
        this.ctx.stroke();

        // Inner Border
        this.ctx.beginPath();
        this.ctx.arc(0, 0, radius - width / 2, 0, Math.PI * 2);
        this.ctx.lineWidth = 2;
        this.ctx.strokeStyle = CONFIG.ROAD_BORDER_COLOR;
        this.ctx.stroke();

        // Outer Border
        this.ctx.beginPath();
        this.ctx.arc(0, 0, radius + width / 2, 0, Math.PI * 2);
        this.ctx.lineWidth = 2;
        this.ctx.strokeStyle = CONFIG.ROAD_BORDER_COLOR;
        this.ctx.stroke();
    }

    drawVehicles() {
        const vehicles = this.sim.vehicles;
        const road = this.sim.road;

        vehicles.forEach(vehicle => {
            const { x, y, angle } = road.getCoordinates(vehicle.position);

            this.ctx.save();
            this.ctx.translate(x, y);
            this.ctx.rotate(angle + Math.PI / 2); // Rotate to face direction of travel

            // Vehicle Body
            this.ctx.fillStyle = vehicle.color;

            // Draw a slightly fancy car (rounded rect)
            const w = vehicle.width;
            const h = vehicle.length * 3; // Visual scaling (meters to pixels approx)

            // Glow effect for fast cars or braking
            if (vehicle.acceleration < -1) {
                // Braking lights
                this.ctx.shadowColor = '#ff0000';
                this.ctx.shadowBlur = 15;
            } else {
                this.ctx.shadowBlur = 0;
            }

            this.roundRect(-w / 2, -h / 2, w, h, 3);
            this.ctx.fill();

            this.ctx.shadowBlur = 0;

            this.ctx.restore();
        });
    }

    /**
     * Helper to draw rounded rectangle.
     */
    roundRect(x, y, w, h, r) {
        if (w < 2 * r) r = w / 2;
        if (h < 2 * r) r = h / 2;
        this.ctx.beginPath();
        this.ctx.moveTo(x + r, y);
        this.ctx.arcTo(x + w, y, x + w, y + h, r);
        this.ctx.arcTo(x + w, y + h, x, y + h, r);
        this.ctx.arcTo(x, y + h, x, y, r);
        this.ctx.arcTo(x, y, x + w, y, r);
        this.ctx.closePath();
    }
}
