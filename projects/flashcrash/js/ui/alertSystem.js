class AlertSystem {
    constructor(bus) {
        this.bus = bus;
        this.elLogs = document.getElementById('log-list');
        this.elWrap = document.getElementById('system-logs');

        // Listen to logs
        this.bus.on(CONSTANTS.EVENTS.LOG, this.onLog.bind(this));

        this.logCount = 0;
    }

    onLog(entry) {
        this.logCount++;
        const li = document.createElement('li');
        li.className = `log-${entry.level}`;

        const date = new Date(entry.time);
        const timeStr = `${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}:${date.getSeconds().toString().padStart(2, '0')}.${date.getMilliseconds().toString().padStart(3, '0')}`;

        li.innerHTML = `<span class="log-time">[${timeStr}]</span> ${entry.msg}`;
        this.elLogs.appendChild(li);

        if (this.elLogs.children.length > 50) {
            this.elLogs.removeChild(this.elLogs.firstChild);
        }

        // auto scroll
        this.elWrap.scrollTop = this.elWrap.scrollHeight;
    }
}

window.AlertSystem = AlertSystem;
