import { events } from '../core/EventBus.js';

export class Toolbar {
    constructor() {
        this.btnCompile = document.getElementById('btn-compile');
        this.btnClear = document.getElementById('btn-clear');

        this.bindEvents();
    }

    bindEvents() {
        this.btnCompile.addEventListener('click', () => {
            events.emit('request-compile');
        });

        this.btnClear.addEventListener('click', () => {
            events.emit('request-clear');
        });
    }
}
