window.BinRegistry.register('rm', async (args, context, ioStream) => {
    if (args.length === 0) {
        ioStream.writeError("rm: missing operand\n");
        return 1;
    }

    const recursive = args.includes('-r') || args.includes('-rf');
    const targets = args.filter(a => !a.startsWith('-'));
    let status = 0;

    for (const target of targets) {
        const resolved = PathUtils.resolve(context.env.get('PWD') || '/', target);
        try {
            const stat = await context.vfs.stat(resolved);
            if (stat.type === CONSTANTS.FILE_TYPES.DIRECTORY) {
                if (!recursive) {
                    ioStream.writeError(`rm: cannot remove '${target}': Is a directory\n`);
                    status = 1;
                    continue;
                }

                // Extremely simple recursive deleting using readdir for VFS
                const rmDirRec = async (p) => {
                    const entries = await context.vfs.readdir(p);
                    for (const e of entries) {
                        const subPath = PathUtils.join(p, e);
                        const subStat = await context.vfs.stat(subPath);
                        if (subStat.type === CONSTANTS.FILE_TYPES.DIRECTORY) {
                            await rmDirRec(subPath);
                        } else {
                            await context.vfs.unlink(subPath);
                        }
                    }
                    await context.vfs.rmdir(p);
                };

                await rmDirRec(resolved);
            } else {
                await context.vfs.unlink(resolved);
            }
        } catch (e) {
            ioStream.writeError(`rm: cannot remove '${target}': ${e.message}\n`);
            status = 1;
        }
    }
    return status;
});
