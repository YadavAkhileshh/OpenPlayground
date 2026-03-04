/**
 * RenderSystem.js
 * 
 * Handles all canvas drawing operations.
 */

import { GAME_CONFIG } from '../core/Constants.js';

export class RenderSystem {
    constructor(canvasId) {
        this.canvas = document.getElementById(canvasId || 'game-canvas');
        if (!this.canvas) {
            // Create canvas if it doesn't exist
            this.canvas = document.createElement('canvas');
            this.canvas.id = 'game-canvas';
            document.getElementById('game-area').appendChild(this.canvas);
        }

        this.ctx = this.canvas.getContext('2d');
        this.resize();

        window.addEventListener('resize', () => this.resize());
    }

    resize() {
        // Keep internal resolution fixed, scale with CSS
        this.canvas.width = GAME_CONFIG.WIDTH;
        this.canvas.height = GAME_CONFIG.HEIGHT;
    }

    /**
     * Clear the canvas.
     */
    clear() {
        this.ctx.fillStyle = GAME_CONFIG.BACKGROUND_COLOR;
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    }

    /**
     * Render all entities and systems.
     * @param {Array} entities 
     * @param {ParticleSystem} particleSystem 
     * @param {Object} uiData - Data for UI rendering
     */
    render(entities, particleSystem, uiData) {
        this.clear();

        // Draw Grid (optional background)
        this.drawGrid();

        // Draw Particles (Background layer)
        // particleSystem.render(this.ctx, 'background');

        // Draw Entities
        entities.forEach(entity => {
            if (!entity.components.render) return;
            this.drawEntity(entity);
        });

        // Draw Particles (Foreground layer)
        if (particleSystem) {
            particleSystem.render(this.ctx);
        }

        // Draw UI Overlay
        // (UI is mostly DOM-based in this project, but we can draw some HUD elements here)
        this.drawHUD(uiData);
    }

    drawGrid() {
        this.ctx.strokeStyle = 'rgba(0,0,0,0.05)';
        this.ctx.lineWidth = 1;
        const cellSize = 50;

        for (let x = 0; x <= GAME_CONFIG.WIDTH; x += cellSize) {
            this.ctx.beginPath();
            this.ctx.moveTo(x, 0);
            this.ctx.lineTo(x, GAME_CONFIG.HEIGHT);
            this.ctx.stroke();
        }

        for (let y = 0; y <= GAME_CONFIG.HEIGHT; y += cellSize) {
            this.ctx.beginPath();
            this.ctx.moveTo(0, y);
            this.ctx.lineTo(GAME_CONFIG.WIDTH, y);
            this.ctx.stroke();
        }
    }

    drawEntity(entity) {
        const render = entity.components.render;
        const { x, y } = entity;
        const size = entity.size || 20;

        this.ctx.save();
        this.ctx.translate(x, y);

        // Rotation
        if (entity.rotation) {
            this.ctx.rotate(entity.rotation);
        }

        // Color / Style
        this.ctx.fillStyle = render.color || '#000';

        // Effects
        if (render.effect === 'blink' && Math.floor(Date.now() / 100) % 2 === 0) {
            this.ctx.globalAlpha = 0.5;
        }

        // Shape
        if (render.shape === 'circle') {
            this.ctx.beginPath();
            this.ctx.arc(0, 0, size / 2, 0, Math.PI * 2);
            this.ctx.fill();
        } else if (render.shape === 'square') {
            this.ctx.fillRect(-size / 2, -size / 2, size, size);
        } else if (render.shape === 'triangle') {
            this.ctx.beginPath();
            this.ctx.moveTo(0, -size / 2);
            this.ctx.lineTo(size / 2, size / 2);
            this.ctx.lineTo(-size / 2, size / 2);
            this.ctx.closePath();
            this.ctx.fill();
        }

        // Health Bar (if applicable)
        if (entity.components.health) {
            this.drawHealthBar(entity, size);
        }

        this.ctx.restore();

        // Debug Hitbox
        if (GAME_CONFIG.SHOW_HITBOXES) {
            this.ctx.strokeStyle = 'red';
            this.ctx.strokeRect(x - size / 2, y - size / 2, size, size);
        }
    }

    drawHealthBar(entity, size) {
        const hp = entity.components.health;
        if (hp.current >= hp.max) return; // Don't show full health

        const width = size;
        const height = 4;
        const yOffset = size / 2 + 8;

        // Background
        this.ctx.fillStyle = 'rgba(0,0,0,0.5)';
        this.ctx.fillRect(-width / 2, yOffset, width, height);

        // Foreground
        const pct = Math.max(0, hp.current / hp.max);
        this.ctx.fillStyle = pct > 0.5 ? '#48bb78' : (pct > 0.2 ? '#ecc94b' : '#f56565');
        this.ctx.fillRect(-width / 2, yOffset, width * pct, height);
    }

    drawHUD(uiData) {
        if (!uiData) return;

        // Simple Debug Info
        if (GAME_CONFIG.SHOW_FPS) {
            this.ctx.fillStyle = 'black';
            this.ctx.font = '10px monospace';
            this.ctx.fillText(`FPS: ${Math.round(1 / uiData.dt)}`, 10, 15);
        }
    }
}
