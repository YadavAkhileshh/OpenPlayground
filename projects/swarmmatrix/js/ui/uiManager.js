/**
 * js/ui/uiManager.js
 * Master UI controller integrating tools, inputs, and display.
 */

import { ToolManager } from './toolManager.js';
import { MouseHandler } from './mouseHandler.js';
import { Monitor } from './monitor.js';
import { Controls } from './controls.js';
import { state } from '../core/state.js';

export class UIManager {
    constructor(simulation, renderer) {
        this.sim = simulation;
        this.renderer = renderer;

        this.toolManager = new ToolManager(this.sim);
        this.mouseHandler = new MouseHandler(this.toolManager, this.renderer.camera);
        this.monitor = new Monitor();
        this.controls = new Controls(this.sim);

        this.loopRef = null;
    }

    bindLoop(loop) {
        this.loopRef = loop;
    }

    updateTelemetry() {
        this.monitor.update();
    }
}
