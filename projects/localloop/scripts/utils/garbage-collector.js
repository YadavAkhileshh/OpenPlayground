/**
 * Garbage Collector - Data Hygiene
 * Automatically deletes messages older than 1 hour.
 */
class GarbageCollector {
    constructor() {
        this.interval = 60 * 1000; // Run every minute
        this.start();
    }

    start() {
        // Initial run
        this.cleanup();

        setInterval(() => this.cleanup(), this.interval);
    }

    cleanup() {
        const raw = localStorage.getItem('localloop_messages');
        if (!raw) return;

        try {
            let messages = JSON.parse(raw);
            const initialCount = messages.length;
            const oneHourAgo = Date.now() - (60 * 60 * 1000);

            // Filter
            messages = messages.filter(msg => {
                return msg.timestamp > oneHourAgo;
            });

            if (messages.length < initialCount) {
                console.log(`[GC] Removed ${initialCount - messages.length} old messages.`);
                localStorage.setItem('localloop_messages', JSON.stringify(messages));

                // Notify via bus that data changed so other tabs refresh
                if (window.StorageBus && window.StorageBus.emit) {
                    window.StorageBus.emit('new-message', {});
                }
            }
        } catch (e) {
            console.error('[GC] Error:', e);
        }
    }
}

window.GarbageCollector = new GarbageCollector();
