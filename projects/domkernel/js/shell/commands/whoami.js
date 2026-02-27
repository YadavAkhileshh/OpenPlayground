window.BinRegistry.register('whoami', async (args, context, ioStream) => {
    ioStream.write((context.env.get('USER') || 'user') + '\n');
    return 0;
});
