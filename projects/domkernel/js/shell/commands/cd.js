window.BinRegistry.register('cd', async (args, context, ioStream) => {
    let target = args[0];

    if (!target) {
        target = context.env.get('HOME') || '/';
    } else if (target === '-') {
        target = context.env.get('OLDPWD') || context.env.get('HOME');
    }

    const resolved = PathUtils.resolve(context.env.get('PWD') || '/', target);

    try {
        const stat = await context.vfs.stat(resolved);
        if (stat.type !== CONSTANTS.FILE_TYPES.DIRECTORY) {
            ioStream.writeError(`cd: ${target}: Not a directory\n`);
            return 1;
        }

        context.env.set('OLDPWD', context.env.get('PWD'));
        context.env.set('PWD', resolved);

        // Broadcast path change so UI hooks can update
        EventBus.emit('env:pwd:changed', resolved);

        return 0;
    } catch (e) {
        ioStream.writeError(`cd: ${target}: No such file or directory\n`);
        return 1;
    }
});
