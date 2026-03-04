/**
 * Resource Monitor Application
 */
class MonitorApp {
    constructor(winRef = null) {
        if (!winRef) {
            this.window = new SystemWindow({
                title: 'System Monitor',
                width: 600,
                height: 480,
                icon: 'M3 3v18h18v-2H5V3H3zm6 14l-2-4h2l2 4h-2zm4 0l-2-6h2l2 6h-2zm4 0l-2-8h2l2 8h-2z'
            });
            this.window.mountApp(MonitorApp, [this.window]);
            return this.window.appInstance;
        }

        this.window = winRef;
        this.activeTab = 'processes'; // processes | performance

        this.container = null;
        this.procView = null;
        this.perfView = null;
        this.tbody = null;

        this.cpuCtx = null;
        this.ramCtx = null;

        this.render();

        this.tickHandler = this.onTick.bind(this);
        EventBus.on('sys:monitor:tick', this.tickHandler);
    }

    render() {
        this.container = UIRenderer.h('div', { className: 'monitor-app' });

        // Tabs
        const btnProc = UIRenderer.h('div', { className: 'mon-tab active', onclick: () => this.switchTab('processes') }, 'Processes');
        const btnPerf = UIRenderer.h('div', { className: 'mon-tab', onclick: () => this.switchTab('performance') }, 'Performance');
        this.tabContainer = UIRenderer.h('div', { className: 'mon-tabs' }, btnProc, btnPerf);

        // Content wrapper
        this.contentWrap = UIRenderer.h('div', { className: 'mon-content' });

        // Processes View
        this.procView = UIRenderer.h('div', { className: 'mon-view active' });
        const tableWrap = UIRenderer.h('div', { className: 'mon-table-wrap' });
        this.tbody = document.createElement('tbody');
        const table = UIRenderer.h('table', { className: 'mon-table' },
            UIRenderer.h('thead', null,
                UIRenderer.h('tr', null,
                    UIRenderer.h('th', null, 'PID'),
                    UIRenderer.h('th', null, 'Command'),
                    UIRenderer.h('th', null, 'State'),
                    UIRenderer.h('th', null, 'CPU Time'),
                    UIRenderer.h('th', null, 'Memory')
                )
            ),
            this.tbody
        );
        tableWrap.appendChild(table);
        this.procView.appendChild(tableWrap);

        // Performance View
        this.perfView = UIRenderer.h('div', { className: 'mon-view mon-charts' });

        this.cpuCanvas = document.createElement('canvas');
        this.cpuCanvas.className = 'mon-chart-canvas';
        this.cpuVal = UIRenderer.h('span', { className: 'mon-chart-val' }, '0%');
        const cpuCard = UIRenderer.h('div', { className: 'mon-chart-card' },
            UIRenderer.h('div', { className: 'mon-chart-header' }, UIRenderer.h('span', null, 'CPU Usage'), this.cpuVal),
            this.cpuCanvas
        );

        this.ramCanvas = document.createElement('canvas');
        this.ramCanvas.className = 'mon-chart-canvas';
        this.ramVal = UIRenderer.h('span', { className: 'mon-chart-val' }, '0 MB');
        const ramCard = UIRenderer.h('div', { className: 'mon-chart-card' },
            UIRenderer.h('div', { className: 'mon-chart-header' }, UIRenderer.h('span', null, 'Memory Usage'), this.ramVal),
            this.ramCanvas
        );

        this.perfView.appendChild(cpuCard);
        this.perfView.appendChild(ramCard);

        this.contentWrap.appendChild(this.procView);
        this.contentWrap.appendChild(this.perfView);

        this.container.appendChild(this.tabContainer);
        this.container.appendChild(this.contentWrap);

        UIRenderer.mount(this.window.contentElement, this.container);

        // Setup contexts after mounting to get correct dimensions
        setTimeout(() => {
            this.cpuCanvas.width = this.cpuCanvas.offsetWidth;
            this.cpuCanvas.height = this.cpuCanvas.offsetHeight;
            this.cpuCtx = this.cpuCanvas.getContext('2d');

            this.ramCanvas.width = this.ramCanvas.offsetWidth;
            this.ramCanvas.height = this.ramCanvas.offsetHeight;
            this.ramCtx = this.ramCanvas.getContext('2d');
        }, 100);
    }

    switchTab(tab) {
        this.activeTab = tab;
        const tabs = this.tabContainer.querySelectorAll('.mon-tab');
        tabs[0].classList.toggle('active', tab === 'processes');
        tabs[1].classList.toggle('active', tab === 'performance');

        this.procView.classList.toggle('active', tab === 'processes');
        this.perfView.classList.toggle('active', tab === 'performance');
    }

    onTick(metrics) {
        if (this.activeTab === 'processes') {
            this.updateProcessTable();
        } else {
            this.updateCharts(metrics);
        }
    }

    updateProcessTable() {
        if (!window.ProcessScheduler) return;

        const processes = window.ProcessScheduler.getProcessList();

        // Minimal DOM diffing for performance
        // Simplest strategy: clear and redraw for tiny kernel, 
        // but let's try to update existing rows or recreate. Recreate is fine for < 100 rows.

        let html = '';
        processes.forEach(p => {
            let stateColor = 'var(--text-main)';
            if (p.state === 'RUNNING') stateColor = 'var(--acid-green)';
            if (p.state === 'ZOMBIE') stateColor = 'var(--danger)';

            html += `
                <tr>
                    <td class="mon-stat">${p.pid}</td>
                    <td>${p.command}</td>
                    <td style="color: ${stateColor}">${p.state}</td>
                    <td class="mon-stat">${Math.floor(p.cpuTime)} ms</td>
                    <td class="mon-stat">${Utils.formatBytes(p.memoryUsage, 0)}</td>
                </tr>
            `;
        });

        this.tbody.innerHTML = html;
    }

    updateCharts(metrics) {
        if (!this.cpuCtx || !this.ramCtx) return;

        this.cpuVal.textContent = Math.round(metrics.cpuUsage) + '%';
        this.ramVal.textContent = Utils.formatBytes(metrics.memoryUsage, 1);

        this.drawGraph(this.cpuCtx, this.cpuCanvas.width, this.cpuCanvas.height, metrics.history.cpu, 100, '#00e5ff');
        this.drawGraph(this.ramCtx, this.ramCanvas.width, this.ramCanvas.height, metrics.history.ram, 2, '#ff00ff'); // Assume 2GB max for graph scale
    }

    drawGraph(ctx, w, h, data, maxVal, color) {
        ctx.clearRect(0, 0, w, h);

        ctx.beginPath();
        const step = w / (data.length - 1);
        let first = true;

        for (let i = 0; i < data.length; i++) {
            const val = Math.min(data[i], maxVal);
            const x = i * step;
            const y = h - (val / maxVal) * h;

            if (first) {
                ctx.moveTo(x, y);
                first = false;
            } else {
                ctx.lineTo(x, y);
            }
        }

        ctx.strokeStyle = color;
        ctx.lineWidth = 2;
        ctx.stroke();

        // Fill gradient
        ctx.lineTo(w, h);
        ctx.lineTo(0, h);
        ctx.closePath();

        const gradient = ctx.createLinearGradient(0, 0, 0, h);
        gradient.addColorStop(0, color + '80'); // 50% opacity hex
        gradient.addColorStop(1, color + '00'); // 0% opacity hex

        ctx.fillStyle = gradient;
        ctx.fill();
    }

    destroy() {
        EventBus.off('sys:monitor:tick', this.tickHandler);
    }
}

window.MonitorApp = MonitorApp;
