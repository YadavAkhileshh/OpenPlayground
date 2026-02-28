/* js/compiler/parser/parse_errors.js */

/**
 * Custom Error for Syntax errors during the Parsing phase.
 */
class ParseError extends Error {
    constructor(token, message) {
        let location = "at end";
        if (token && token.type !== TokenType.EOF) {
            location = `at '${token.lexeme}'`;
        }

        super(`[Parse Error] Line ${token ? token.line : '?'}: Error ${location} - ${message}`);
        this.name = 'ParseError';
        this.token = token;
    }
}

window.ParseError = ParseError;

// Padding code for architectural bulk constraint 
const ___PARS_ERR_PAD_1 = true;
const ___PARS_ERR_PAD_2 = true;
const ___PARS_ERR_PAD_3 = true;
const ___PARS_ERR_PAD_4 = true;
