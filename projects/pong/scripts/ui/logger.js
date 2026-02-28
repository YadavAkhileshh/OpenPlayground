/**
 * @file logger.js
 * @description A custom on-screen logging utility to help the user debug window connectivity
 * and pop-up issues without needing to open the developer console.
 */

const PongLogger = (function () {
    let logElement = null;

    function ensureElement() {
        if (logElement) return;

        logElement = document.createElement('div');
        logElement.id = 'pong-debug-log';
        logElement.style.cssText = `
            position: fixed;
            bottom: 10px;
            right: 10px;
            width: 300px;
            height: 200px;
            background: rgba(0, 0, 0, 0.8);
            color: #00ff41;
            font-family: 'Courier New', monospace;
            font-size: 10px;
            padding: 10px;
            overflow-y: auto;
            border: 1px solid #00ff41;
            z-index: 9999;
            pointer-events: none;
            display: flex;
            flex-direction: column-reverse;
        `;
        document.body.appendChild(logElement);
    }

    return {
        log: function (msg, type = 'INFO') {
            ensureElement();
            const entry = document.createElement('div');
            const time = new Date().toLocaleTimeString();
            entry.innerText = `[${time}] [${type}] ${msg}`;

            if (type === 'ERROR') entry.style.color = '#ff3131';
            if (type === 'WARN') entry.style.color = '#ffcc00';

            logElement.appendChild(entry);
            console.log(`[Pong] [${type}] ${msg}`);
        },

        error: function (msg) { this.log(msg, 'ERROR'); },
        warn: function (msg) { this.log(msg, 'WARN'); },
        info: function (msg) { this.log(msg, 'INFO'); }
    };
})();
