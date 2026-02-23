import { events } from './EventBus.js';
import { GraphEngine } from '../engine/GraphEngine.js';
import { NodeManager } from '../engine/NodeManager.js';
import { ConnectionManager } from '../engine/ConnectionManager.js';
import { CableRenderer } from '../engine/CableRenderer.js';
import { ViewportController } from '../engine/ViewportController.js';
import { InputManager } from '../engine/InputManager.js';
import { ContextMenu } from '../ui/ContextMenu.js';
import { Toolbar } from '../ui/Toolbar.js';
import { ConsoleWindow } from '../ui/ConsoleWindow.js';
import { SelectionManager } from '../ui/SelectionManager.js';
import { Compiler } from '../compiler/Compiler.js';
import { NodeRegistry } from '../nodes/NodeRegistry.js';

class App {
    constructor() {
        this.init();
    }

    init() {
        // Data Structures & Models
        this.graphEngine = new GraphEngine();

        // Node Type declarations
        this.nodeRegistry = new NodeRegistry();

        // UI & Views
        this.viewportController = new ViewportController(document.getElementById('viewport-container'), document.getElementById('canvas'));
        this.cableRenderer = new CableRenderer(document.getElementById('cables-layer'));
        this.contextMenu = new ContextMenu(document.getElementById('context-menu'), this.nodeRegistry);
        this.toolbar = new Toolbar();
        this.consoleWindow = new ConsoleWindow(document.getElementById('console-window'));

        // Controllers
        this.nodeManager = new NodeManager(this.graphEngine, document.getElementById('nodes-layer'));
        this.connectionManager = new ConnectionManager(this.graphEngine);
        this.selectionManager = new SelectionManager(this.viewportController, this.nodeManager);
        this.inputManager = new InputManager(
            this.viewportController,
            this.nodeManager,
            this.connectionManager,
            this.contextMenu,
            this.selectionManager
        );

        // Compiler
        this.compiler = new Compiler(this.graphEngine, this.consoleWindow);

        this.bindEvents();

        // Initial console welcome
        this.consoleWindow.log("BlueprintCompiler Init Complete", "success");
    }

    bindEvents() {
        // App-level event wiring
        events.on('request-compile', () => {
            this.compiler.compileAndRun();
        });

        events.on('request-clear', () => {
            this.graphEngine.clear();
            this.nodeManager.clear();
            this.connectionManager.clear();
            this.cableRenderer.clear();
            this.viewportController.reset();
            this.consoleWindow.clear();
            this.consoleWindow.log("Graph Cleared", "info");
        });
    }
}

// Bootstrap
window.addEventListener('DOMContentLoaded', () => {
    window.app = new App();
});
