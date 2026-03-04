/**
 * Lexer Tokens enum for Shell Parser
 */
const TOKENS = {
    EOF: 'EOF',
    WORD: 'WORD',        // e.g. ls, -a, /usr/bin, argument
    PIPE: 'PIPE',        // |
    REDIR_OUT: 'REDIR_OUT', // >
    REDIR_APP: 'REDIR_APP', // >>
    REDIR_IN: 'REDIR_IN',   // <
    AND: 'AND',          // &&
    OR: 'OR',            // ||
    SEMI: 'SEMI',        // ;
    STRING: 'STRING',    // "hello world" or 'hello world'
    VAR: 'VAR'           // $HOME
};

class Token {
    constructor(type, value, literal = null) {
        this.type = type;
        this.value = value;
        this.literal = literal !== null ? literal : value;
    }
}

window.TOKENS = TOKENS;
window.Token = Token;
