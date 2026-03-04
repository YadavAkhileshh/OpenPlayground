/**
 * DNAMusic Main Entry Point
 */
import { InterfaceManager } from './ui.js';

document.addEventListener('DOMContentLoaded', () => {
    // Initialize the application interface
    const app = new InterfaceManager();

    // Log startup
    console.log(`
    %c DNAMusic v1.0 
    %c Genetic Audio Interface Initialized 
    `,
        'background: #0ea5e9; color: #fff; font-weight: bold; padding: 4px 8px; border-radius: 4px;',
        'color: #94a3b8; font-family: monospace;');
});
