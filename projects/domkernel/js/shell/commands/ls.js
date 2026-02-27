window.BinRegistry.register('ls', async (args, context, ioStream) => {
    let target = context.env.get('PWD') || '/';
    let flags = [];

    args.forEach(arg => {
        if (arg.startsWith('-')) flags.push(arg);
        else target = PathUtils.resolve(context.env.get('PWD') || '/', arg);
    });

    const isLong = flags.includes('-l');
    const isAll = flags.includes('-a');

    try {
        const stat = await context.vfs.stat(target);
        if (stat.type !== CONSTANTS.FILE_TYPES.DIRECTORY) {
            ioStream.write(target + '\n');
            return 0;
        }

        const entries = await context.vfs.readdir(target);
        let output = '';

        for (const entry of entries) {
            if (!isAll && entry.startsWith('.')) continue;

            if (isLong) {
                const entryPath = PathUtils.join(target, entry);
                const entryStat = await context.vfs.stat(entryPath);
                const typeChar = entryStat.type === CONSTANTS.FILE_TYPES.DIRECTORY ? 'd' : '-';
                const size = entryStat.size.toString().padStart(8, ' ');
                const date = new Date(entryStat.mtime).toLocaleString();

                let colorClass = '';
                if (entryStat.type === CONSTANTS.FILE_TYPES.DIRECTORY) colorClass = 'term-dir';
                else if (entryStat.type === CONSTANTS.FILE_TYPES.EXECUTABLE) colorClass = 'term-exec';
                else if (entryStat.type === CONSTANTS.FILE_TYPES.SYMLINK) colorClass = 'term-symlink';

                // For DOM Terminal we actually want raw text or styled? Since Stream just writes text,
                // we'll rely on the terminal renderer if it supports ANSI or basic classes later. 
                // Currently returning plain text.
                output += `${typeChar}rwxr-xr-x 1 user user ${size} ${date} <span class="${colorClass}">${entry}</span>\n`;
            } else {
                output += entry + '  ';
            }
        }

        if (!isLong) output += '\n';

        // Strip out spans if simple test without HTML
        const strippedOut = output.replace(/<span class=".*?">(.*?)<\/span>/g, '$1');
        // Let's pass raw html string if using DOM renderer
        ioStream.write(output);
        return 0;
    } catch (e) {
        throw e;
    }
});
