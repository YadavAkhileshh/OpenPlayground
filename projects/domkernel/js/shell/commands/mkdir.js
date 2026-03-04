window.BinRegistry.register('mkdir', async (args, context, ioStream) => {
    if (args.length === 0) {
        ioStream.writeError("mkdir: missing operand\n");
        return 1;
    }

    let status = 0;
    for (const arg of args) {
        const resolved = PathUtils.resolve(context.env.get('PWD') || '/', arg);
        try {
            await context.vfs.mkdir(resolved);
        } catch (e) {
            ioStream.writeError(`mkdir: cannot create directory '${arg}': ${e.message}\n`);
            status = 1;
        }
    }
    return status;
});
