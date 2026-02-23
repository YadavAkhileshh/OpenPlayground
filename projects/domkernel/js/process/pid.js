/**
 * PID Allocator
 */
class PIDAllocator {
    constructor() {
        this.currentPID = 1;
        this.usedMap = new Set();
    }

    allocate() {
        // Prevent infinite loops if completely full
        if (this.usedMap.size >= CONSTANTS.MAX_PIDS) {
            throw new Errors.ProcessError('Cannot fork: Resource temporarily unavailable', 'EAGAIN');
        }

        while (this.usedMap.has(this.currentPID)) {
            this.currentPID++;
            if (this.currentPID > CONSTANTS.MAX_PIDS) {
                this.currentPID = 1;
            }
        }

        const pid = this.currentPID;
        this.usedMap.add(pid);
        this.currentPID++;
        return pid;
    }

    free(pid) {
        if (pid <= 0) return;
        this.usedMap.delete(pid);
    }
}

window.PIDAllocator = new PIDAllocator();
