window.BinRegistry.register('kill', async (args, context, ioStream) => {
    if (args.length === 0) {
        ioStream.writeError("kill: usage: kill <pid>...\n");
        return 1;
    }

    let status = 0;
    for (const arg of args) {
        const pid = parseInt(arg, 10);
        if (isNaN(pid)) {
            ioStream.writeError(`kill: ${arg}: arguments must be process or job IDs\n`);
            status = 1;
            continue;
        }

        if (!window.ProcessScheduler) {
            ioStream.writeError("kill: Scheduler not running\n");
            return 1;
        }

        try {
            await window.ProcessScheduler.kill(pid);
        } catch (e) {
            ioStream.writeError(`kill: (${pid}) - No such process\n`);
            status = 1;
        }
    }
    return status;
});
