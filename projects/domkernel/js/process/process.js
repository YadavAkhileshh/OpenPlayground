/**
 * Process representation
 */
class Process {
    constructor(pid, command, args, parentPid = 0) {
        this.pid = pid;
        this.ppid = parentPid;
        this.command = command;
        this.args = args;

        this.state = 'NEW'; // NEW, READY, RUNNING, BLOCKED, ZOMBIE, DEAD
        this.startTime = Date.now();
        this.exitCode = null;
        this.workerId = null; // Assigned when scheduled

        this.cpuTime = 0;
        this.memoryUsage = Math.floor(Math.random() * 5 * 1024 * 1024); // Mock metric

        this.resolvePromise = null;
        this.rejectPromise = null;
        this.completionPromise = new Promise((resolve, reject) => {
            this.resolvePromise = resolve;
            this.rejectPromise = reject;
        });
    }

    setState(state) {
        this.state = state;
        EventBus.emit('process:stateChange', { pid: this.pid, state: this.state });
    }

    exit(code) {
        this.exitCode = code;
        this.setState('DEAD');
        PIDAllocator.free(this.pid);
        Logger.debug('Process', `Process ${this.pid} (${this.command}) exited with code ${code}`);
        EventBus.emit(CONSTANTS.EVENTS.PROCESS_EXIT, { pid: this.pid, code });
        if (this.resolvePromise) this.resolvePromise(code);
    }

    crash(reason) {
        this.exitCode = 1;
        this.setState('DEAD');
        PIDAllocator.free(this.pid);
        Logger.error('Process', `Process ${this.pid} (${this.command}) crashed: ${reason}`);
        EventBus.emit(CONSTANTS.EVENTS.PROCESS_EXIT, { pid: this.pid, code: 1, reason });
        if (this.rejectPromise) this.rejectPromise(new Error(reason));
    }
}

window.Process = Process;
