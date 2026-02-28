/* js/compiler/lexer/token.js */

/**
 * Token Class
 * Represents a single lexical token.
 */
class Token {
    constructor(type, lexeme, literal, line, column) {
        this.type = type;         // From TokenType
        this.lexeme = lexeme;     // String representation
        this.literal = literal;   // Parsed value (Number, String inner text)
        this.line = line;         // Line number
        this.column = column;     // Column number
    }

    toString() {
        return `${this.type} ${this.lexeme} ${this.literal}`;
    }
}

window.Token = Token;
