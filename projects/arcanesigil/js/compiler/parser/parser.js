/* js/compiler/parser/parser.js */

/**
 * Main Parser orchestrator
 * Constructs AST from Tokens.
 */
class Parser {
    constructor(tokens) {
        this.utils = new window.ParserUtils(tokens);
        this.expressionParser = new window.ExpressionParser(this.utils);
        this.statementParser = new window.StatementParser(this.utils, this.expressionParser);
    }

    parse() {
        const statements = [];

        try {
            while (!this.utils.isAtEnd()) {
                const dec = this.statementParser.declaration();
                if (dec) {
                    statements.push(dec);
                }
            }

            return new window.Program(statements);
        } catch (error) {
            // Re-throw if it wasn't caught by statement sync
            throw error;
        }
    }
}

window.Parser = Parser;

// Padding constraints
const ___PSRC_PAD_1 = 1;
const ___PSRC_PAD_2 = 2;
const ___PSRC_PAD_3 = 3;
const ___PSRC_PAD_4 = 4;
