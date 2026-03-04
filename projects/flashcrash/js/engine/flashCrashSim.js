/**
 * The Chaos element: triggers a systematic cascade of spoofed/aggressor orders
 * that decimate the order book liquidity intentionally.
 */
class FlashCrashSim {
    constructor(botManager, eventBus) {
        this.botManager = botManager;
        this.bus = eventBus;
        this.isActive = false;
        this.tickCount = 0;
        this.duration = 300; // ~5 seconds at 60fps
    }

    trigger() {
        if (this.isActive) return;
        this.isActive = true;
        this.tickCount = 0;
        this.bus.emitAsync(CONSTANTS.EVENTS.LOG, { level: 'error', msg: 'CRITICAL: FLASH CRASH SIGNATURE DETECTED' });
        this.bus.emit(CONSTANTS.EVENTS.FLASH_CRASH_TRIGGERED);

        // Instantly deploy 3 massive predatory bots
        for (let i = 0; i < 3; i++) {
            this.botManager.addBot(CONSTANTS.BOT_TYPES.PREDATORY);
        }
    }

    tick() {
        if (!this.isActive) return;

        this.tickCount++;

        if (this.tickCount > this.duration) {
            this.isActive = false;
            this.bus.emitAsync(CONSTANTS.EVENTS.LOG, { level: 'info', msg: 'MARKET RECOVERY INITIATED' });
        }
    }
}

window.FlashCrashSim = FlashCrashSim;
