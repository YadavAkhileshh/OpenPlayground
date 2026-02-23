/**
 * Command Registry mapping executable names to handler functions
 */
class BinRegistry {
    constructor() {
        this.commands = new Map();
    }

    register(name, handler) {
        this.commands.set(name, handler);
    }

    async execute(name, processContext, ioStream) {
        if (!this.commands.has(name)) {
            // Check if it's an executable file in VFS
            const path = PathUtils.resolve(processContext.env.get('PWD') || '/', name);
            try {
                const stat = await processContext.vfs.stat(path);
                if (stat.type === CONSTANTS.FILE_TYPES.EXECUTABLE) {
                    ioStream.writeError(`Binary execution not implemented for VFS executables yet.\n`);
                    return 126;
                }
            } catch (e) {
                // Not a file, just not found
            }
            throw Errors.ECOMMAND(name);
        }

        const command = this.commands.get(name);
        try {
            return await command(processContext.args, processContext, ioStream);
        } catch (e) {
            ioStream.writeError(`${name}: ${e.message || e}\n`);
            return 1;
        }
    }
}

window.BinRegistry = new BinRegistry();
