/**
 * js/ui/toolManager.js
 * Manages the currently active tool and brush size.
 */

import { state } from '../core/state.js';
import { events } from '../core/events.js';

export class ToolManager {
    constructor(simulation) {
        this.sim = simulation;
        this.activeTool = 'select'; // default
        this.brushSize = 40;

        this.bindEvents();
    }

    bindEvents() {
        const toolBtns = document.querySelectorAll('.tool-btn');
        toolBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                const tool = btn.getAttribute('data-tool');
                this.setTool(tool, toolBtns);
            });
        });

        // Listen for scoll wheel to change brush size if brush tool is active
        window.addEventListener('wheel', (e) => {
            if (this.activeTool === 'pheromone_brush' || this.activeTool === 'erase') {
                e.preventDefault();
                this.brushSize += e.deltaY > 0 ? -5 : 5;
                this.brushSize = Math.max(10, Math.min(100, this.brushSize));
                state.set('brushSize', this.brushSize);
                events.emit('ui:brushSizeChanged', this.brushSize);
            }
        }, { passive: false });
    }

    setTool(toolName, btnElements) {
        this.activeTool = toolName;
        state.set('activeTool', toolName);

        // Update UI
        if (btnElements) {
            btnElements.forEach(b => b.classList.remove('active'));
            const activeBtn = Array.from(btnElements).find(b => b.getAttribute('data-tool') === toolName);
            if (activeBtn) activeBtn.classList.add('active');
        }

        // Update Canvas Cursor
        const canvas = document.getElementById('ui-overlay-canvas');
        canvas.className = ''; // clear all cursors

        switch (toolName) {
            case 'obstacle':
                canvas.classList.add('cursor-obstacle');
                break;
            case 'resource_source':
            case 'resource_sink':
                canvas.classList.add('cursor-resource');
                break;
            case 'pheromone_brush':
                canvas.classList.add('cursor-brush');
                break;
            case 'erase':
                canvas.classList.add('cursor-erase');
                break;
            default:
                canvas.classList.add('cursor-select');
        }
    }

    applyTool(worldX, worldY) {
        switch (this.activeTool) {
            case 'obstacle':
                this.sim.addObstacle(worldX, worldY, 20); // Default radius
                break;
            case 'resource_source':
                this.sim.addResource('source', worldX, worldY);
                break;
            case 'resource_sink':
                this.sim.addResource('sink', worldX, worldY);
                break;
            case 'pheromone_brush':
                // Handled in drag
                break;
            case 'erase':
                this.sim.eraseEnvironment(worldX, worldY, this.brushSize);
                break;
        }
    }

    applyToolDrag(worldX, worldY) {
        if (this.activeTool === 'pheromone_brush') {
            // Add a burst of food pheromones
            this.sim.pheromoneGrid.addDensity(worldX, worldY, 1, 500); // 1 = TO_FOOD
        } else if (this.activeTool === 'erase') {
            this.sim.eraseEnvironment(worldX, worldY, this.brushSize);
        } else if (this.activeTool === 'obstacle') {
            // Draw continuous line of obstacles
            this.sim.addObstacle(worldX, worldY, 10);
        }
    }
}
