window.BinRegistry.register('cat', async (args, context, ioStream) => {
    if (args.length === 0) {
        // Technically should wait for stdin, but for this mock shell we'll just return
        return 0;
    }

    let status = 0;
    for (const arg of args) {
        const resolved = PathUtils.resolve(context.env.get('PWD') || '/', arg);
        try {
            const content = await context.vfs.readFile(resolved);
            ioStream.write(content + (content.endsWith('\n') ? '' : '\n'));
        } catch (e) {
            ioStream.writeError(`cat: ${arg}: ${e.message}\n`);
            status = 1;
        }
    }
    return status;
});
