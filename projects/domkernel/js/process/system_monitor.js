/**
 * System Monitor metric collector
 */
class SystemMonitor {
    constructor() {
        this.metrics = {
            cpuUsage: 0,
            memoryUsage: 0,
            processes: 0,
            uptime: 0,
            fsRead: 0,
            fsWrite: 0,
            history: {
                cpu: Array(60).fill(0),
                ram: Array(60).fill(0)
            }
        };

        this.bootTime = Date.now();
        this.interval = null;
    }

    start() {
        if (this.interval) clearInterval(this.interval);
        this.interval = setInterval(() => this.collect(), 1000);
    }

    stop() {
        if (this.interval) clearInterval(this.interval);
    }

    collect() {
        const now = Date.now();
        this.metrics.uptime = Math.floor((now - this.bootTime) / 1000);

        // Simulating CPU usage primarily by checking active run queue
        // A real system gets this from the OS ticker. Here we fake some jitter + load
        let baseCpu = 2 + Math.random() * 5; // Idle jitter

        if (window.ProcessScheduler) {
            const queueLen = window.ProcessScheduler.runQueue.length;
            const activeWorkers = CONSTANTS.WORKER_POOL_SIZE - window.ProcessScheduler.workerPool.available.length;

            baseCpu += (activeWorkers / CONSTANTS.WORKER_POOL_SIZE) * 85;
            baseCpu += (queueLen * 2); // Queue penalty

            this.metrics.processes = window.ProcessScheduler.processList.size;
        }

        this.metrics.cpuUsage = Math.min(100, Math.max(0, baseCpu));

        // Memory is faked based on process count
        let memBase = 120 * 1024 * 1024; // 120MB Kernel Overhead
        if (window.ProcessScheduler) {
            const list = window.ProcessScheduler.getProcessList();
            list.forEach(p => {
                memBase += p.memoryUsage;
            });
        }

        // Adding natural jitter
        memBase += Math.random() * 5 * 1024 * 1024;
        this.metrics.memoryUsage = memBase;

        // Shift history
        this.metrics.history.cpu.shift();
        this.metrics.history.cpu.push(this.metrics.cpuUsage);

        this.metrics.history.ram.shift();
        this.metrics.history.ram.push(this.metrics.memoryUsage / (1024 * 1024 * 1024)); // In GB for graph

        EventBus.emit('sys:monitor:tick', this.metrics);
    }
}

window.SysMonitor = new SystemMonitor();
