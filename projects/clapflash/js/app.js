import { Utils, CONSTANTS } from './utils.js';
import { UI } from './ui-manager.js';
import { Audio } from './audio-processor.js';
import { Effects } from './effects-engine.js';

class App {
    constructor() {
        this.active = false;
    }

    async init() {
        // Load persistence
        const saved = localStorage.getItem(CONSTANTS.STORAGE_KEY_SENSITIVITY);
        if (saved) Audio.setThreshold(parseFloat(saved));

        // Bind UI
        UI.bind({
            onThreshold: (v) => {
                Audio.setThreshold(v);
                localStorage.setItem(CONSTANTS.STORAGE_KEY_SENSITIVITY, v);
            },
            onToggle: () => this.toggle()
        });

        // Bind Audio
        Audio.onLevel = (amp) => UI.updateMeter(amp);
        Audio.onDraw = (time) => UI.drawWaveform(time);
        Audio.onStrike = (data) => Effects.trigger(data);

        Utils.log('App Core Initialized');
    }

    async toggle() {
        if (!this.active) {
            const ok = await Audio.init();
            if (ok) {
                this.active = true;
                UI.updateStatus(true);
            }
        } else {
            this.active = false;
            Audio.toggle(false);
            UI.updateStatus(false);
        }
    }
}

const ClapFlash = new App();
ClapFlash.init();
