/**
 * @fileoverview Visualization Engine.
 * Renders charts and graphs using Canvas and DOM elements.
 * Custom implementation to avoid external chart libraries.
 */

import { $ } from '../utils/dom.js';

export class Visualizer {

    /**
     * Renders the Mouse Path canvas.
     * @param {Array} pathData - Array of {x, y} points
     */
    renderMousePath(pathData) {
        const container = $('#path-canvas-container');
        const rect = container.getBoundingClientRect();

        // Create Canvas on the fly if not exists
        let canvas = container.querySelector('canvas');
        if (!canvas) {
            canvas = document.createElement('canvas');
            container.appendChild(canvas);
        }

        canvas.width = rect.width;
        canvas.height = rect.height;
        const ctx = canvas.getContext('2d');

        // Clear
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        if (pathData.length < 2) return;

        // Draw Path
        ctx.beginPath();

        // Normalize coordinates to canvas size 
        // We assume tracking was typically full screen, so we scale down?
        // Actually, let's just draw relative to window width/height at time of capture.
        // For simplicity in this demo, we'll just map the points blindly 
        // and hope they fit or use a simple scaling factor.
        // A better approach: Find bounding box of path, scale to fit canvas.

        const xs = pathData.map(p => p.x);
        const ys = pathData.map(p => p.y);
        const minX = Math.min(...xs);
        const maxX = Math.max(...xs);
        const minY = Math.min(...ys);
        const maxY = Math.max(...ys);

        const rangeX = maxX - minX || 1;
        const rangeY = maxY - minY || 1;

        const scaleX = (canvas.width - 40) / rangeX;
        const scaleY = (canvas.height - 40) / rangeY;
        const scale = Math.min(scaleX, scaleY); // Maintain aspect ratio

        // Center it
        const offsetX = (canvas.width - (rangeX * scale)) / 2;
        const offsetY = (canvas.height - (rangeY * scale)) / 2;

        ctx.strokeStyle = '#2563eb';
        ctx.lineWidth = 2;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';

        ctx.moveTo(
            (pathData[0].x - minX) * scale + offsetX,
            (pathData[0].y - minY) * scale + offsetY
        );

        for (let i = 1; i < pathData.length; i++) {
            const p = pathData[i];
            ctx.lineTo(
                (p.x - minX) * scale + offsetX,
                (p.y - minY) * scale + offsetY
            );
        }
        ctx.stroke();

        // Draw Start/End points
        this.drawDot(ctx, (pathData[0].x - minX) * scale + offsetX, (pathData[0].y - minY) * scale + offsetY, 'green');
        this.drawDot(ctx, (pathData[pathData.length - 1].x - minX) * scale + offsetX, (pathData[pathData.length - 1].y - minY) * scale + offsetY, 'red');
    }

    drawDot(ctx, x, y, color) {
        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.arc(x, y, 4, 0, Math.PI * 2);
        ctx.fill();
    }

    /**
     * Updates the text displays in the dashboard.
     * @param {Object} results 
     */
    updateDashboard(results) {
        // Influence Score
        const scoreEl = $('.score-display', $('#influence-score-card'));
        scoreEl.textContent = `${results.score}%`;

        // Color code score
        if (results.score > 70) scoreEl.style.color = 'var(--color-danger)';
        else if (results.score > 40) scoreEl.style.color = 'var(--color-accent)';
        else scoreEl.style.color = 'var(--color-success)';

        // Latency
        const latencyEl = $('.latency-display', $('#time-analysis-card'));
        latencyEl.textContent = `${(results.duration / 1000).toFixed(2)}s`;

        // Explanation
        const biasText = $('#bias-text');
        biasText.innerHTML = results.insightHtml;
    }
}

export const visualizer = new Visualizer();
