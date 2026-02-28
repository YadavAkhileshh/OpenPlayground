/**
 * MenuController - Handles settings navigation and updates.
 */
import { AppState } from '../core/state.js';

export class MenuController {
    constructor(onSettingChange) {
        this.element = document.getElementById('settings-menu');
        this.items = Array.from(this.element.querySelectorAll('.menu-item'));
        this.onSettingChange = onSettingChange;

        this.activeIndex = 0;
        this.isOpen = false;

        // Settings options
        this.options = {
            theme: ['green', 'amber', 'blue', 'bw'],
            noise: ['white', 'pink', 'brownian'],
            brightness: [0.5, 0.75, 1.0, 1.25, 1.5],
            contrast: [0.5, 0.75, 1.0, 1.25, 1.5],
            'h-hold': [0, 5, 10, 20, -5, -10, -20],
            'v-hold': [0, 5, 10, 20, -5, -10, -20]
        };

        this.init();
    }

    init() {
        document.getElementById('menu-button').addEventListener('click', () => this.toggle());

        window.addEventListener('keydown', (e) => {
            if (!this.isOpen) return;

            switch (e.key) {
                case 'ArrowUp':
                    this.navigate(-1);
                    break;
                case 'ArrowDown':
                    this.navigate(1);
                    break;
                case 'ArrowLeft':
                    this.changeValue(-1);
                    break;
                case 'ArrowRight':
                    this.changeValue(1);
                    break;
                case 'Escape':
                    this.toggle();
                    break;
            }
        });
    }

    toggle() {
        if (!AppState.isPoweredOn) return;
        this.isOpen = !this.isOpen;
        this.element.classList.toggle('hidden', !this.isOpen);
    }

    navigate(dir) {
        this.items[this.activeIndex].classList.remove('active');
        this.activeIndex = (this.activeIndex + dir + this.items.length) % this.items.length;
        this.items[this.activeIndex].classList.add('active');
    }

    changeValue(dir) {
        const item = this.items[this.activeIndex];
        const setting = item.dataset.setting;
        const opts = this.options[setting];

        let currentVal = AppState.settings[this.mapSettingKey(setting)];
        let idx = opts.indexOf(currentVal);

        // Handle numeric displays
        if (idx === -1) {
            // Find closest index for numeric values
            idx = opts.reduce((prev, curr, i) =>
                Math.abs(curr - currentVal) < Math.abs(opts[prev] - currentVal) ? i : prev, 0);
        }

        const nextIdx = (idx + dir + opts.length) % opts.length;
        const newVal = opts[nextIdx];

        AppState.updateSetting(this.mapSettingKey(setting), newVal);

        // Update UI
        item.querySelector('.value').innerText = this.formatDisplayValue(setting, newVal);
        this.onSettingChange(setting, newVal);
    }

    mapSettingKey(key) {
        const maps = {
            'theme': 'theme',
            'noise': 'noiseType',
            'brightness': 'brightness',
            'contrast': 'contrast',
            'h-hold': 'hHold',
            'v-hold': 'vHold'
        };
        return maps[key] || key;
    }

    formatDisplayValue(setting, val) {
        if (typeof val === 'number' && setting !== 'h-hold' && setting !== 'v-hold') {
            return (val * 100) + '%';
        }
        if (val === 0) return 'AUTO';
        return String(val).toUpperCase();
    }
}
