window.BinRegistry.register('clear', async (args, context, ioStream) => {
    // A special UI sequence that the terminal app intercepts
    ioStream.write('\x1b[2J\x1b[0;0H');
    return 0;
});
