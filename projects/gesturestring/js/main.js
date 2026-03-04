/**
 * Main Entry Point
 * Initializes the Engine and starts the application.
 */
import { Engine } from './core/engine.js';
import { Controls } from './ui/controls.js';

// Initialize Game Engine
const engine = new Engine();
const controls = new Controls(engine);

// Start Loop
engine.start();

// Expose for debugging if needed
window.engine = engine;

console.log('GestureStrings Initialized');
