import { State } from './state.js';
import { EVENTS } from './constants.js';

export class HUDController {
    constructor() {
        this.els = {
            scale: document.getElementById('debug-scale'),
            level: document.getElementById('debug-level'),
            nodes: document.getElementById('debug-nodes'),
            monitor: document.querySelector('.monitor-bar')
        };

        this.bindEvents();
    }

    bindEvents() {
        State.subscribe(EVENTS.ZOOM_UPDATE, (scale) => {
            this.updateScale(scale);
        });

        State.subscribe(EVENTS.LEVEL_CHANGE, (level) => {
            this.updateLevel(level);
        });

        // Polling interaction for Nodes count (don't do this every frame)
        setInterval(() => {
            this.updateNodes();
            this.pulseMonitor();
        }, 500);
    }

    updateScale(scale) {
        if (this.els.scale) {
            this.els.scale.innerText = scale.toFixed(3) + ' x';
        }
    }

    updateLevel(level) {
        if (this.els.level) {
            this.els.level.innerText = `DEPTH: ${level}`;
            // Add a visual flash to HUD on level change
            document.body.style.filter = 'brightness(1.2)';
            setTimeout(() => { document.body.style.filter = ''; }, 100);
        }
    }

    updateNodes() {
        if (this.els.nodes) {
            // This is actually expensive if many nodes.
            // Estimate or use the internal counter if we had one.
            // Using getElementsByTagName is fast enough for < 10k nodes.
            const count = document.getElementsByTagName('*').length;
            this.els.nodes.innerText = count;

            if (count > 2000) {
                this.els.nodes.style.color = 'red';
            } else {
                this.els.nodes.style.color = '';
            }
        }
    }

    pulseMonitor() {
        if (this.els.monitor) {
            const h = Math.random() * 10 + 5;
            this.els.monitor.style.height = h + 'px';
        }
    }
}

export const HUD = new HUDController();
