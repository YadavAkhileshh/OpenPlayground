window.BinRegistry.register('help', async (args, context, ioStream) => {
    const commands = Array.from(window.BinRegistry.commands.keys()).sort();

    let output = "DOMKernel GNU-lite Shell, version 1.0.0(1)-release\n";
    output += "These shell commands are defined internally:\n\n";

    let line = "";
    commands.forEach((cmd, idx) => {
        line += cmd.padEnd(12, ' ');
        if ((idx + 1) % 5 === 0) {
            output += line + "\n";
            line = "";
        }
    });

    if (line !== "") output += line + "\n";

    ioStream.write(output);
    return 0;
});
