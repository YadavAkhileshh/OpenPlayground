window.BinRegistry.register('date', async (args, context, ioStream) => {
    ioStream.write(new Date().toString() + '\n');
    return 0;
});
