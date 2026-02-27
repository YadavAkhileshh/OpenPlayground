/**
 * Shell Parser
 * Transforms token sequence into an Abstract Syntax Tree
 */
class Parser {
    constructor(lexer) {
        this.lexer = lexer;
        this.currToken = this.lexer.nextToken();
        this.peekToken = this.lexer.nextToken();
    }

    nextToken() {
        this.currToken = this.peekToken;
        this.peekToken = this.lexer.nextToken();
    }

    parse() {
        const nodes = [];
        while (this.currToken.type !== TOKENS.EOF) {
            if (this.currToken.type === TOKENS.SEMI) {
                this.nextToken();
                continue;
            }
            const node = this.parseExpression();
            if (node) nodes.push(node);
        }
        return nodes;
    }

    parseExpression() {
        let left = this.parsePipeline();

        while (this.currToken.type === TOKENS.AND || this.currToken.type === TOKENS.OR) {
            const op = this.currToken.type;
            this.nextToken();
            const right = this.parsePipeline();
            left = new AST.LogicalNode(op, left, right);
        }

        return left;
    }

    parsePipeline() {
        const commands = [this.parseCommand()];

        while (this.currToken.type === TOKENS.PIPE) {
            this.nextToken();
            commands.push(this.parseCommand());
        }

        if (commands.length === 1) return commands[0];
        return new AST.PipelineNode(commands);
    }

    parseCommand() {
        if (this.currToken.type !== TOKENS.WORD && this.currToken.type !== TOKENS.STRING && this.currToken.type !== TOKENS.VAR) {
            throw new Errors.SyntaxError(`Unexpected token: ${this.currToken.literal}`);
        }

        const command = this.currToken.literal;
        this.nextToken();

        const args = [];
        const redirects = [];

        while (this.currToken.type !== TOKENS.EOF &&
            this.currToken.type !== TOKENS.PIPE &&
            this.currToken.type !== TOKENS.AND &&
            this.currToken.type !== TOKENS.OR &&
            this.currToken.type !== TOKENS.SEMI) {

            if (this.currToken.type === TOKENS.REDIR_OUT || this.currToken.type === TOKENS.REDIR_APP || this.currToken.type === TOKENS.REDIR_IN) {
                const rt = this.currToken.type;
                this.nextToken();
                if (this.currToken.type !== TOKENS.WORD && this.currToken.type !== TOKENS.STRING) {
                    throw new Errors.SyntaxError(`Expected file for redirection, got: ${this.currToken.literal}`);
                }
                redirects.push(new AST.RedirectNode(rt, this.currToken.literal));
                this.nextToken();
            } else {
                args.push(this.currToken.literal);
                this.nextToken();
            }
        }

        return new AST.CommandNode(command, args, redirects);
    }
}

window.Parser = Parser;
