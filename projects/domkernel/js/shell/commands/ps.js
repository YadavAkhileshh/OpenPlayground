window.BinRegistry.register('ps', async (args, context, ioStream) => {
    if (!window.ProcessScheduler) {
        ioStream.writeError("ps: Scheduler not running\n");
        return 1;
    }

    const processes = window.ProcessScheduler.getProcessList();

    // Header
    let output = "  PID TTY          TIME CMD\n";

    processes.forEach(p => {
        const pid = p.pid.toString().padStart(5, ' ');
        // Format time up time (fake CPU time for now)
        const uptimeSeconds = Math.floor((Date.now() - p.startTime) / 1000);
        const mins = Math.floor(uptimeSeconds / 60).toString().padStart(2, '0');
        const secs = (uptimeSeconds % 60).toString().padStart(2, '0');
        const time = `00:${mins}:${secs}`;

        output += `${pid} pts/0    ${time} ${p.command}\n`;
    });

    ioStream.write(output);
    return 0;
});
