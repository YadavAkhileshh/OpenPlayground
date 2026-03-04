window.BinRegistry.register('touch', async (args, context, ioStream) => {
    if (args.length === 0) {
        ioStream.writeError("touch: missing file operand\n");
        return 1;
    }

    let status = 0;
    for (const arg of args) {
        const resolved = PathUtils.resolve(context.env.get('PWD') || '/', arg);
        try {
            // Write empty string if file doesn't exist, otherwise just updates mtime theoretically
            await context.vfs.writeFile(resolved, '', true);
        } catch (e) {
            ioStream.writeError(`touch: cannot touch '${arg}': ${e.message}\n`);
            status = 1;
        }
    }
    return status;
});
