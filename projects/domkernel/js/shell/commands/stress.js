window.BinRegistry.register('stress', async (args, context, ioStream) => {
    let limit = 100000;
    if (args.length > 0) {
        const val = parseInt(args[0], 10);
        if (!isNaN(val)) limit = val;
    }

    ioStream.write(`Spawning background worker job to find primes up to ${limit}...\n`);
    ioStream.write(`Check the System Monitor (Processes Tab) to see CPU time load via Scheduler.\n`);

    try {
        const proc = window.ProcessScheduler.spawn('long_loop_task', [limit]);

        let lastReport = 0;
        const status = await window.ProcessScheduler.exec(proc, 'LONG_LOOP', { limit }, (progress) => {
            const current = Math.floor(progress * 100);
            if (current >= lastReport + 20) {
                // To avoid spamming terminal too much, only report every 20%
                ioStream.write(`Task computing: ${current}%\n`);
                lastReport = current;
            }
        });

        if (status === 0) {
            ioStream.write(`Task completed successfully.\n`);
            return 0;
        } else {
            ioStream.writeError(`Task crashed or was killed (Status: ${status}).\n`);
            return status;
        }
    } catch (e) {
        ioStream.writeError(`Failed to spawn worker job: ${e.message}\n`);
        return 1;
    }
});
