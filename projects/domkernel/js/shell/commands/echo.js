window.BinRegistry.register('echo', async (args, context, ioStream) => {
    let output = args.join(' ');
    // Handle very basic escapes manually
    output = output.replace(/\\n/g, '\n').replace(/\\t/g, '\t');
    ioStream.write(output + '\n');
    return 0;
});

window.BinRegistry.register('pwd', async (args, context, ioStream) => {
    ioStream.write((context.env.get('PWD') || '/') + '\n');
    return 0;
});
