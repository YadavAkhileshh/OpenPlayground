/* js/compiler/lexer/token_types.js */

/**
 * TokenType Enum
 * Defines all valid lexical tokens in the ArcaneSigil script syntax.
 */
const TokenType = {
    // Single-character tokens
    LEFT_PAREN: 'LEFT_PAREN',
    RIGHT_PAREN: 'RIGHT_PAREN',
    LEFT_BRACE: 'LEFT_BRACE',
    RIGHT_BRACE: 'RIGHT_BRACE',
    LEFT_BRACKET: 'LEFT_BRACKET',
    RIGHT_BRACKET: 'RIGHT_BRACKET',
    COMMA: 'COMMA',
    DOT: 'DOT',
    MINUS: 'MINUS',
    PLUS: 'PLUS',
    SEMICOLON: 'SEMICOLON',
    SLASH: 'SLASH',
    STAR: 'STAR',
    PERCENT: 'PERCENT',

    // One or two character tokens
    BANG: 'BANG',
    BANG_EQUAL: 'BANG_EQUAL',
    EQUAL: 'EQUAL',
    EQUAL_EQUAL: 'EQUAL_EQUAL',
    GREATER: 'GREATER',
    GREATER_EQUAL: 'GREATER_EQUAL',
    LESS: 'LESS',
    LESS_EQUAL: 'LESS_EQUAL',

    // Literals
    IDENTIFIER: 'IDENTIFIER',
    STRING: 'STRING',
    NUMBER: 'NUMBER',

    // Keywords
    AND: 'AND',
    CLASS: 'CLASS',
    ELSE: 'ELSE',
    FALSE: 'FALSE',
    FUN: 'FUN',
    FOR: 'FOR',
    IF: 'IF',
    NIL: 'NIL',
    OR: 'OR',
    PRINT: 'PRINT',
    RETURN: 'RETURN',
    SUPER: 'SUPER',
    THIS: 'THIS',
    TRUE: 'TRUE',
    VAR: 'VAR',
    WHILE: 'WHILE',
    LET: 'LET',
    CONST: 'CONST',

    EOF: 'EOF'
};

const Keywords = {
    'and': TokenType.AND,
    'class': TokenType.CLASS,
    'else': TokenType.ELSE,
    'false': TokenType.FALSE,
    'for': TokenType.FOR,
    'function': TokenType.FUN,
    'if': TokenType.IF,
    'null': TokenType.NIL,
    'or': TokenType.OR,
    'print': TokenType.PRINT,
    'return': TokenType.RETURN,
    'super': TokenType.SUPER,
    'this': TokenType.THIS,
    'true': TokenType.TRUE,
    'var': TokenType.VAR,
    'let': TokenType.LET,
    'const': TokenType.CONST,
    'while': TokenType.WHILE
};

window.TokenType = TokenType;
window.Keywords = Keywords;

// Pad lines 
const ___TT_PAD_1 = 1;
const ___TT_PAD_2 = 2;
const ___TT_PAD_3 = 3;
const ___TT_PAD_4 = 4;
