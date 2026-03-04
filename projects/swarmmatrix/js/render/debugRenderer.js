/**
 * js/render/debugRenderer.js
 * Renders debug overlays (steering vectors, spatial hash grid).
 */

import { CONFIG } from '../core/config.js';

export class DebugRenderer {
    constructor() {
        // Read CSS variables for debug colors
        const style = getComputedStyle(document.body);
        this.colors = {
            alignment: style.getPropertyValue('--vector-align').trim() || '#00ff00',
            cohesion: style.getPropertyValue('--vector-cohesion').trim() || '#0000ff',
            separation: style.getPropertyValue('--vector-separation').trim() || '#ff0000',
            gradient: style.getPropertyValue('--vector-gradient').trim() || '#ffff00',
            grid: style.getPropertyValue('--grid-line').trim() || 'rgba(255, 255, 255, 0.05)'
        };
    }

    renderSteering(ctx, agents, count) {
        // Render vectors for a small subset to avoid visual clutter and lag
        const maxDebugAgents = Math.min(count, 100);

        ctx.lineWidth = 1;

        for (let i = 0; i < maxDebugAgents; i++) {
            const agent = agents[i];
            const px = agent.pos.x;
            const py = agent.pos.y;
            const mult = 10; // Exaggerate vector length for visibility

            // Alignment (Green)
            if (agent.steeringVectors.alignment.magSq() > 0.01) {
                ctx.strokeStyle = this.colors.alignment;
                ctx.beginPath();
                ctx.moveTo(px, py);
                ctx.lineTo(px + agent.steeringVectors.alignment.x * mult, py + agent.steeringVectors.alignment.y * mult);
                ctx.stroke();
            }

            // Cohesion (Blue)
            if (agent.steeringVectors.cohesion.magSq() > 0.01) {
                ctx.strokeStyle = this.colors.cohesion;
                ctx.beginPath();
                ctx.moveTo(px, py);
                ctx.lineTo(px + agent.steeringVectors.cohesion.x * mult, py + agent.steeringVectors.cohesion.y * mult);
                ctx.stroke();
            }

            // Separation (Red)
            if (agent.steeringVectors.separation.magSq() > 0.01) {
                ctx.strokeStyle = this.colors.separation;
                ctx.beginPath();
                ctx.moveTo(px, py);
                ctx.lineTo(px + agent.steeringVectors.separation.x * mult, py + agent.steeringVectors.separation.y * mult);
                ctx.stroke();
            }

            // Gradient / Food (Yellow)
            if (agent.steeringVectors.gradient.magSq() > 0.01) {
                ctx.strokeStyle = this.colors.gradient;
                ctx.beginPath();
                ctx.moveTo(px, py);
                ctx.lineTo(px + agent.steeringVectors.gradient.x * mult, py + agent.steeringVectors.gradient.y * mult);
                ctx.stroke();
            }
        }
    }

    renderSpatialHash(ctx, spatialHash) {
        if (!spatialHash) return;

        ctx.strokeStyle = this.colors.grid;
        ctx.lineWidth = 1;
        ctx.beginPath();

        const size = spatialHash.cellSize;

        // Vertical lines
        for (let x = 0; x <= spatialHash.width; x += size) {
            ctx.moveTo(x, 0);
            ctx.lineTo(x, spatialHash.height);
        }

        // Horizontal lines
        for (let y = 0; y <= spatialHash.height; y += size) {
            ctx.moveTo(0, y);
            ctx.lineTo(spatialHash.width, y);
        }

        ctx.stroke();
    }
}
