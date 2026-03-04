/**
 * Shell Command Lexer
 * Converts string input into a stream of tokens
 */
class Lexer {
    constructor(input) {
        this.input = input;
        this.pos = 0;
        this.ch = this.input.length > 0 ? this.input[this.pos] : null;
    }

    nextChar() {
        this.pos++;
        this.ch = this.pos < this.input.length ? this.input[this.pos] : null;
    }

    peekChar() {
        if (this.pos + 1 >= this.input.length) return null;
        return this.input[this.pos + 1];
    }

    skipWhitespace() {
        while (this.ch !== null && /\s/.test(this.ch)) {
            this.nextChar();
        }
    }

    readString(quoteChar) {
        let str = '';
        this.nextChar(); // consume quote
        while (this.ch !== null && this.ch !== quoteChar) {
            str += this.ch;
            this.nextChar();
        }
        if (this.ch === quoteChar) {
            this.nextChar(); // consume closing quote
        }
        return str;
    }

    readWord() {
        let str = '';
        while (this.ch !== null && !/\s/.test(this.ch) && !['|', '>', '<', '&', ';', '"', "'"].includes(this.ch)) {
            str += this.ch;
            this.nextChar();
        }
        return str;
    }

    readVar() {
        let str = '';
        this.nextChar(); // consume $
        while (this.ch !== null && /[a-zA-Z0-9_]/.test(this.ch)) {
            str += this.ch;
            this.nextChar();
        }
        return str;
    }

    nextToken() {
        this.skipWhitespace();

        if (this.ch === null) {
            return new Token(TOKENS.EOF, "");
        }

        let token;
        switch (this.ch) {
            case '|':
                if (this.peekChar() === '|') {
                    this.nextChar();
                    token = new Token(TOKENS.OR, "||");
                } else {
                    token = new Token(TOKENS.PIPE, "|");
                }
                this.nextChar();
                break;
            case '&':
                if (this.peekChar() === '&') {
                    this.nextChar();
                    token = new Token(TOKENS.AND, "&&");
                    this.nextChar();
                } else {
                    token = new Token(TOKENS.WORD, "&");
                    this.nextChar();
                }
                break;
            case '>':
                if (this.peekChar() === '>') {
                    this.nextChar();
                    token = new Token(TOKENS.REDIR_APP, ">>");
                } else {
                    token = new Token(TOKENS.REDIR_OUT, ">");
                }
                this.nextChar();
                break;
            case '<':
                token = new Token(TOKENS.REDIR_IN, "<");
                this.nextChar();
                break;
            case ';':
                token = new Token(TOKENS.SEMI, ";");
                this.nextChar();
                break;
            case '"':
            case "'":
                const q = this.ch;
                const str = this.readString(q);
                token = new Token(TOKENS.STRING, str, q + str + q);
                break;
            case '$':
                const v = this.readVar();
                token = new Token(TOKENS.VAR, v);
                break;
            default:
                const w = this.readWord();
                token = new Token(TOKENS.WORD, w);
                break;
        }

        return token;
    }

    tokenize() {
        const tokens = [];
        let t = this.nextToken();
        while (t.type !== TOKENS.EOF) {
            tokens.push(t);
            t = this.nextToken();
        }
        tokens.push(new Token(TOKENS.EOF, ""));
        return tokens;
    }
}

window.Lexer = Lexer;
