/* js/compiler/lexer/char_utils.js */

/**
 * Character Utility functions for Lexer
 */
class CharUtils {
    static isDigit(c) {
        return c >= '0' && c <= '9';
    }

    static isAlpha(c) {
        return (c >= 'a' && c <= 'z') ||
            (c >= 'A' && c <= 'Z') ||
            c === '_';
    }

    static isAlphaNumeric(c) {
        return this.isAlpha(c) || this.isDigit(c);
    }
}

window.CharUtils = CharUtils;
