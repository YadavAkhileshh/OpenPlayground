/* js/compiler/parser/parser_utils.js */

/**
 * Utility functions for the Recursive Descent Parser
 * Helps with matching tokens, peeking, advancing and error handling.
 */
class ParserUtils {
    constructor(tokens) {
        this.tokens = tokens;
        this.current = 0;
    }

    match(...types) {
        for (const type of types) {
            if (this.check(type)) {
                this.advance();
                return true;
            }
        }
        return false;
    }

    check(type) {
        if (this.isAtEnd()) return false;
        return this.peek().type === type;
    }

    advance() {
        if (!this.isAtEnd()) this.current++;
        return this.previous();
    }

    isAtEnd() {
        return this.peek().type === TokenType.EOF;
    }

    peek() {
        return this.tokens[this.current];
    }

    previous() {
        return this.tokens[this.current - 1];
    }

    consume(type, message) {
        if (this.check(type)) return this.advance();
        throw new ParseError(this.peek(), message);
    }

    // Panic mode synchronization to recover from syntax errors
    synchronize() {
        this.advance();
        while (!this.isAtEnd()) {
            if (this.previous().type === TokenType.SEMICOLON) return;

            switch (this.peek().type) {
                case TokenType.CLASS:
                case TokenType.FUN:
                case TokenType.VAR:
                case TokenType.LET:
                case TokenType.CONST:
                case TokenType.FOR:
                case TokenType.IF:
                case TokenType.WHILE:
                case TokenType.PRINT:
                case TokenType.RETURN:
                    return;
            }

            this.advance();
        }
    }
}

window.ParserUtils = ParserUtils;
