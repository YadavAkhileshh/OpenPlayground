/**
 * Global State Management
 * Centralized configuration and user settings.
 */
export const State = {
    // Simulation Settings
    brushSize: 20,
    viscosity: 0.5,
    activeTool: 'rake', // 'rake', 'stone', 'water', 'level'

    // Grid Configuration
    gridWidth: 200, // Resolution of the heightmap
    gridHeight: 200,

    // Visual Configuration
    themes: {
        nature: {
            sand: '#f5f5f0',
            stroke: '#d4d4ca',
            accent: '#4caf50',
            bg: '#e8f5e9'
        },
        ocean: {
            sand: '#f0f4f8',
            stroke: '#cbd5e1',
            accent: '#2196f3',
            bg: '#e3f2fd'
        },
        sunset: {
            sand: '#fffbeb',
            stroke: '#fde68a',
            accent: '#fbc02d',
            bg: '#fffde7'
        }
    },
    currentTheme: 'nature',

    // Runtime state
    isMouseDown: false,
    mouseX: 0,
    mouseY: 0,

    // Observers (Minimalistic pub/sub)
    listeners: [],
    subscribe(callback) {
        this.listeners.push(callback);
    },
    notify() {
        this.listeners.forEach(cb => cb(this));
    }
};
