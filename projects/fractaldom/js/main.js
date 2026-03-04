import { State } from './state.js';
import { ZoomEngine } from './zoom-engine.js';
import { InputHandler } from './input-handler.js';
import { DOMRenderer } from './dom-renderer.js';
import { RecursionManager } from './recursion-manager.js';
import { HUD } from './hud.js';

console.log("FractalDOM System Initializing...");

// 1. Initialize Subsystems (Order matters for some deps)
const input = new InputHandler();
const recursion = new RecursionManager();
const renderer = new DOMRenderer();
const engine = new ZoomEngine();

// HUD is self-initializing via import side-effects or manual new, here we referenced it.

// 2. Start Engine
engine.start();

// 3. Initial Render Trigger
State.emit('zoom_update', State.camera.scale);

console.log("System Online.");
