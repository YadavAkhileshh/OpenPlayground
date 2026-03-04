/**
 * terminal.js
 * In-game terminal console that logs system events.
 */

import { LOG_DATA } from '../data/manifesto.js';
import { pick, chance } from '../utils/random.js';

export class Terminal {
    constructor() {
        this.container = null;
        this.logList = null;
        this.maxLines = 15;
    }

    init() {
        if (!document.getElementById('sys-terminal')) {
            this.createDOM();
        }
        this.container = document.getElementById('sys-terminal');
        this.logList = this.container.querySelector('.log-list');
    }

    createDOM() {
        const div = document.createElement('div');
        div.id = 'sys-terminal';
        div.className = 'terminal-overlay';
        div.innerHTML = `
            <div class="term-header">
                <span class="term-title">SYS.LOG.01</span>
                <span class="term-status">ONLINE</span>
            </div>
            <ul class="log-list"></ul>
        `;
        document.body.appendChild(div);
    }

    log(msg, type = 'info') {
        if (!this.logList) return;

        const li = document.createElement('li');
        li.className = `log-item log-${type}`;

        const time = new Date().toLocaleTimeString().split(' ')[0];
        li.innerHTML = `<span class="log-time">[${time}]</span> <span class="log-msg">${msg}</span>`;

        this.logList.appendChild(li);
        this.logList.scrollTop = this.logList.scrollHeight;

        while (this.logList.children.length > this.maxLines) {
            this.logList.removeChild(this.logList.firstChild);
        }
    }

    update(chaosLevel) {
        if (!this.logList) return;

        const logChance = 0.01 + (chaosLevel * 0.05);

        if (Math.random() < logChance) {
            this.log(pick(LOG_DATA), chaosLevel > 0.5 ? 'warn' : 'info');
        }

        if (chaosLevel > 0.3) {
            const items = this.logList.children;
            if (items.length > 0) {
                const victim = items[Math.floor(Math.random() * items.length)];
                if (chance(0.1)) {
                    victim.style.opacity = Math.random();
                }
                if (chance(0.05)) {
                    victim.innerHTML = victim.innerHTML.replace(/[a-z0-9]/, pick(['#', '!', '?', '_']));
                }
            }
        }
    }
}
