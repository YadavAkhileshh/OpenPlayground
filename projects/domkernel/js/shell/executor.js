/**
 * Shell Executor
 * Traverses AST and executes processes
 */
class Executor {
    constructor(env) {
        this.env = env;
    }

    async execute(input, terminalStream) {
        if (!input || input.trim() === '') return 0;

        const lexer = new Lexer(input);
        const parser = new Parser(lexer);

        try {
            const astNodes = parser.parse();
            let lastStatus = 0;

            for (const node of astNodes) {
                lastStatus = await this.visit(node, terminalStream);
            }
            return lastStatus;
        } catch (e) {
            terminalStream.writeError((e.message || e) + '\n');
            return 1;
        }
    }

    async visit(node, ioStream) {
        if (node.type === 'COMMAND') {
            return await this.executeCommand(node, ioStream);
        } else if (node.type === 'PIPELINE') {
            return await this.executePipeline(node, ioStream);
        } else if (node.type === 'LOGICAL') {
            const leftStatus = await this.visit(node.left, ioStream);
            if (node.operator === TOKENS.AND && leftStatus === 0) {
                return await this.visit(node.right, ioStream);
            } else if (node.operator === TOKENS.OR && leftStatus !== 0) {
                return await this.visit(node.right, ioStream);
            }
            return leftStatus;
        }
    }

    async executeCommand(node, ioStream) {
        // Expand environment variables
        const cmd = this.env.expandString(node.command);
        const args = node.args.map(arg => this.env.expandString(arg));

        // Handle redirections inline for now (in real OS, shell handles this before exec)
        let outputStream = ioStream;
        let appendRedirect = false;
        let redirectPath = null;

        for (const redir of node.redirects) {
            if (redir.redirectType === TOKENS.REDIR_OUT) {
                redirectPath = PathUtils.resolve(this.env.get('PWD') || '/', redir.target);
                appendRedirect = false;
            } else if (redir.redirectType === TOKENS.REDIR_APP) {
                redirectPath = PathUtils.resolve(this.env.get('PWD') || '/', redir.target);
                appendRedirect = true;
            }
        }

        // Execute via BinRegistry
        try {
            const processContext = { args, env: this.env, vfs: window.VfsInstance };
            let finalOutput = '';

            const processStream = new Stream();
            processStream.onData(chunk => {
                if (redirectPath) finalOutput += chunk;
                else ioStream.write(chunk);
            });

            // Execute command
            const status = await window.BinRegistry.execute(cmd, processContext, processStream);

            // Handle output redirection write
            if (redirectPath) {
                await window.VfsInstance.writeFile(redirectPath, finalOutput, appendRedirect);
            }

            return status;
        } catch (e) {
            ioStream.writeError(cmd + ': ' + (e.message || e) + '\n');
            return 1;
        }
    }

    async executePipeline(node, ioStream) {
        // Extremely simplified pipeline handling natively in JS instead of OS buffer mapping
        let currentInput = '';

        for (let i = 0; i < node.commands.length; i++) {
            const cmdNode = node.commands[i];
            const isLast = (i === node.commands.length - 1);

            if (currentInput) {
                cmdNode.args.push(currentInput); // Simple native pipe proxy
            }

            const processStream = new Stream();
            let accumulatedOutput = '';
            processStream.onData(chunk => accumulatedOutput += chunk);

            const status = await this.executeCommand(cmdNode, processStream);

            if (status !== 0) return status;
            currentInput = accumulatedOutput; // Result passed to next

            if (isLast) {
                ioStream.write(currentInput);
            }
        }
        return 0;
    }
}

window.Executor = Executor;
