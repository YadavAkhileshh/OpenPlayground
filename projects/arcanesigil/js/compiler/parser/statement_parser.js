/* js/compiler/parser/statement_parser.js */

/**
 * Sub-parser for Statements
 * Handles flow control, blocks, variable declarations.
 */
class StatementParser {
    constructor(parserUtils, expressionParser) {
        this.utils = parserUtils;
        this.exprParser = expressionParser;
    }

    declaration() {
        try {
            if (this.utils.match(TokenType.FUN)) return this.function("function");
            if (this.utils.match(TokenType.VAR) || this.utils.match(TokenType.LET) || this.utils.match(TokenType.CONST)) {
                return this.varDeclaration();
            }

            return this.statement();
        } catch (error) {
            if (error instanceof ParseError) {
                this.utils.synchronize();
                return null;
            }
            throw error;
        }
    }

    function(kind) {
        const name = this.utils.consume(TokenType.IDENTIFIER, `Expect ${kind} name.`);

        this.utils.consume(TokenType.LEFT_PAREN, `Expect '(' after ${kind} name.`);
        const parameters = [];
        if (!this.utils.check(TokenType.RIGHT_PAREN)) {
            do {
                if (parameters.length >= 255) {
                    throw new ParseError(this.utils.peek(), "Can't have more than 255 parameters.");
                }
                parameters.push(
                    this.utils.consume(TokenType.IDENTIFIER, "Expect parameter name.")
                );
            } while (this.utils.match(TokenType.COMMA));
        }
        this.utils.consume(TokenType.RIGHT_PAREN, "Expect ')' after parameters.");

        this.utils.consume(TokenType.LEFT_BRACE, `Expect '{' before ${kind} body.`);
        const body = this.block();

        return new window.FunctionDeclaration(name, parameters, body);
    }

    varDeclaration() {
        const name = this.utils.consume(TokenType.IDENTIFIER, "Expect variable name.");

        let initializer = null;
        if (this.utils.match(TokenType.EQUAL)) {
            initializer = this.exprParser.parse();
        }

        this.utils.consume(TokenType.SEMICOLON, "Expect ';' after variable declaration.");
        return new window.LetStatement(name, initializer);
    }

    statement() {
        if (this.utils.match(TokenType.FOR)) return this.forStatement();
        if (this.utils.match(TokenType.IF)) return this.ifStatement();
        if (this.utils.match(TokenType.PRINT)) return this.printStatement();
        if (this.utils.match(TokenType.RETURN)) return this.returnStatement();
        if (this.utils.match(TokenType.WHILE)) return this.whileStatement();
        if (this.utils.match(TokenType.LEFT_BRACE)) return new window.BlockStatement(this.block());

        return this.expressionStatement();
    }

    forStatement() {
        this.utils.consume(TokenType.LEFT_PAREN, "Expect '(' after 'for'.");

        let initializer;
        if (this.utils.match(TokenType.SEMICOLON)) {
            initializer = null;
        } else if (this.utils.match(TokenType.VAR) || this.utils.match(TokenType.LET)) {
            initializer = this.varDeclaration();
        } else {
            initializer = this.expressionStatement();
        }

        let condition = null;
        if (!this.utils.check(TokenType.SEMICOLON)) {
            condition = this.exprParser.parse();
        }
        this.utils.consume(TokenType.SEMICOLON, "Expect ';' after loop condition.");

        let increment = null;
        if (!this.utils.check(TokenType.RIGHT_PAREN)) {
            increment = this.exprParser.parse();
        }
        this.utils.consume(TokenType.RIGHT_PAREN, "Expect ')' after for clauses.");

        let body = this.statement();

        return new window.ForStatement(initializer, condition, increment, body);
    }

    ifStatement() {
        this.utils.consume(TokenType.LEFT_PAREN, "Expect '(' after 'if'.");
        const condition = this.exprParser.parse();
        this.utils.consume(TokenType.RIGHT_PAREN, "Expect ')' after if condition.");

        const thenBranch = this.statement();
        let elseBranch = null;
        if (this.utils.match(TokenType.ELSE)) {
            elseBranch = this.statement();
        }

        return new window.IfStatement(condition, thenBranch, elseBranch);
    }

    printStatement() {
        const value = this.exprParser.parse();
        this.utils.consume(TokenType.SEMICOLON, "Expect ';' after value.");

        // Print translates nicely to an expression statement wrapped with a specific AST struct or just grouping, 
        // to simplify we can treat print as an ExpressionStatement with a CALL to a builtin print.
        // Or we can add a PrintStatement AST node. Wait, we don't have PrintStatement in ast_nodes!
        // So we will synthesize a CallExpression to 'print' Identifier

        const callee = new window.Identifier(new window.Token(TokenType.IDENTIFIER, "print", null, 0, 0));
        const callExpr = new window.CallExpression(callee, null, [value]);
        return new window.ExpressionStatement(callExpr);
    }

    returnStatement() {
        const keyword = this.utils.previous();
        let value = null;
        if (!this.utils.check(TokenType.SEMICOLON)) {
            value = this.exprParser.parse();
        }

        this.utils.consume(TokenType.SEMICOLON, "Expect ';' after return value.");
        return new window.ReturnStatement(keyword, value);
    }

    whileStatement() {
        this.utils.consume(TokenType.LEFT_PAREN, "Expect '(' after 'while'.");
        const condition = this.exprParser.parse();
        this.utils.consume(TokenType.RIGHT_PAREN, "Expect ')' after condition.");
        const body = this.statement();

        return new window.WhileStatement(condition, body);
    }

    block() {
        const statements = [];

        while (!this.utils.check(TokenType.RIGHT_BRACE) && !this.utils.isAtEnd()) {
            statements.push(this.declaration());
        }

        this.utils.consume(TokenType.RIGHT_BRACE, "Expect '}' after block.");
        return statements;
    }

    expressionStatement() {
        const expr = this.exprParser.parse();
        this.utils.consume(TokenType.SEMICOLON, "Expect ';' after expression.");
        return new window.ExpressionStatement(expr);
    }
}

window.StatementParser = StatementParser;
