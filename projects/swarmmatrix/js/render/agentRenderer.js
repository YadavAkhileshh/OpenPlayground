/**
 * js/render/agentRenderer.js
 * Highly optimized rendering of 10,000 agents.
 */

import { CONFIG } from '../core/config.js';

export class AgentRenderer {
    constructor() {
        this.colorNormal = CONFIG.COLOR_AGENT;
        this.colorCarrying = CONFIG.COLOR_AGENT_CARRYING;
        this.radius = CONFIG.AGENT_RADIUS;
    }

    render(ctx, agents, count) {
        // High performance path drawing using beginPath only once per color group
        // instead of once per agent.

        // Pass 1: Normal agents
        ctx.fillStyle = this.colorNormal;
        ctx.beginPath();
        for (let i = 0; i < count; i++) {
            const agent = agents[i];
            if (!agent.hasResource) {
                // To draw millions, use point. For 10k, small rects are fastest.
                // ctx.rect(agent.pos.x - this.radius, agent.pos.y - this.radius, this.radius * 2, this.radius * 2);

                // Draw tiny triangles for direction (slightly slower but looks better)
                this.drawTrianglePath(ctx, agent.pos.x, agent.pos.y, agent.vel.heading(), this.radius * 1.5);
            }
        }
        ctx.fill();

        // Pass 2: Agents carrying resources
        ctx.fillStyle = this.colorCarrying;
        ctx.beginPath();
        for (let i = 0; i < count; i++) {
            const agent = agents[i];
            if (agent.hasResource) {
                this.drawTrianglePath(ctx, agent.pos.x, agent.pos.y, agent.vel.heading(), this.radius * 1.8);
            }
        }
        ctx.fill();
    }

    drawTrianglePath(ctx, x, y, angle, size) {
        // Pre-calculated trig to avoid function calls
        const cos = Math.cos(angle);
        const sin = Math.sin(angle);

        // Nose
        ctx.moveTo(x + cos * size, y + sin * size);

        // Back left
        const blAngle = angle + 2.4; // ~135 degrees
        ctx.lineTo(x + Math.cos(blAngle) * size, y + Math.sin(blAngle) * size);

        // Back center (indentation)
        ctx.lineTo(x - cos * (size * 0.3), y - sin * (size * 0.3));

        // Back right
        const brAngle = angle - 2.4;
        ctx.lineTo(x + Math.cos(brAngle) * size, y + Math.sin(brAngle) * size);

        ctx.lineTo(x + cos * size, y + sin * size);
    }
}
