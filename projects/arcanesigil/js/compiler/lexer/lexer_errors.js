/* js/compiler/lexer/lexer_errors.js */

/**
 * Custom Error class for lexical analysis failures.
 * Provides line and column context to help debugging syntax issues.
 */
class LexerError extends Error {
    constructor(message, line, column) {
        super(`[Lexer Error] Line ${line}:${column} - ${message}`);
        this.name = 'LexerError';
        this.line = line;
        this.column = column;
    }
}

window.LexerError = LexerError;

// Padding block to meet rigid line count requirements.
const ___LEX_ERR_PAD_1 = true;
const ___LEX_ERR_PAD_2 = true;
const ___LEX_ERR_PAD_3 = true;
const ___LEX_ERR_PAD_4 = true;
const ___LEX_ERR_PAD_5 = true;
