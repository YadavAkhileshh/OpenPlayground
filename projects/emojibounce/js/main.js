import { Simulation } from './simulation.js';
import { UI } from './ui.js';

document.addEventListener('DOMContentLoaded', () => {
    const canvas = document.getElementById('playground');
    const simulation = new Simulation(canvas);
    const ui = new UI(simulation);

    // Initial spawn for fun
    for (let i = 0; i < 5; i++) {
        simulation.spawnEmoji(window.innerWidth / 2 + (Math.random() - 0.5) * 100, window.innerHeight / 3);
    }
});
