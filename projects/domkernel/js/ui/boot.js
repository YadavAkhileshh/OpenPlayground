/**
 * System Boot Sequence Manager
 */
class BootManager {
    constructor() {
        this.screen = document.getElementById('boot-screen');
        this.progressFill = document.getElementById('boot-progress');
        this.desktop = document.getElementById('desktop');

        Logger.setBootOutput(document.getElementById('boot-logs'));
    }

    async start() {
        this.setProgress(10, 'Initializing Core...');
        await Utils.sleep(500);

        this.setProgress(30, 'Mounting Virtual File System (IndexedDB)...');
        await window.VfsInstance.init();

        this.setProgress(60, 'Starting Task Scheduler...');
        window.ProcessScheduler = new Scheduler();
        await Utils.sleep(300);

        this.setProgress(80, 'Starting User Interface Desktop Environment...');
        await Utils.sleep(300);

        this.setProgress(100, 'Boot Complete');
        await Utils.sleep(500);

        this.finishBoot();
    }

    setProgress(percent, message) {
        this.progressFill.style.width = `${percent}%`;
        if (message) Logger.info('BOOT', message);
    }

    finishBoot() {
        this.screen.style.opacity = '0';
        setTimeout(() => {
            this.screen.classList.add('hidden');
            this.desktop.classList.remove('hidden');

            // Start System Monitor
            window.SysMonitor.start();

            EventBus.emit(CONSTANTS.EVENTS.SYS_BOOT_DONE);
        }, 1000);
    }
}

window.BootManager = BootManager;
