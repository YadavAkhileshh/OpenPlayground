/**
 * js/render/resourceRenderer.js
 * Draws resource sources and sinks with visual effects.
 */

import { CONFIG } from '../core/config.js';
import { state } from '../core/state.js';

export class ResourceRenderer {
    constructor() {
        this.sourceColor = getComputedStyle(document.body).getPropertyValue('--resource-source').trim() || '#0088ff';
        this.sinkColor = getComputedStyle(document.body).getPropertyValue('--resource-sink').trim() || '#00ff88';
    }

    render(ctx, resourceManager) {
        const resources = resourceManager.resources;
        if (resources.length === 0) return;

        const time = state.get('currentTick') * 0.05;

        for (let i = 0; i < resources.length; i++) {
            const res = resources[i];
            const isSource = res.type === 'source';

            ctx.fillStyle = isSource ? this.sourceColor : this.sinkColor;

            // Draw base circle
            ctx.globalAlpha = 0.2;
            ctx.beginPath();
            ctx.arc(res.x, res.y, res.radius, 0, Math.PI * 2);
            ctx.fill();

            // Draw core
            ctx.globalAlpha = 0.8;
            ctx.beginPath();
            ctx.arc(res.x, res.y, res.radius * 0.3, 0, Math.PI * 2);
            ctx.fill();

            // Draw outer pulsing ring
            const pulse = (Math.sin(time + (isSource ? 0 : Math.PI)) + 1) * 0.5; // 0 to 1
            const rOffset = isSource ? -pulse * 10 : pulse * 10; // Source pulses in, sink pulses out

            ctx.globalAlpha = 0.5 * (1 - pulse);
            ctx.strokeStyle = isSource ? this.sourceColor : this.sinkColor;
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.arc(res.x, res.y, res.radius + rOffset, 0, Math.PI * 2);
            ctx.stroke();

            ctx.globalAlpha = 1.0;
        }
    }
}
