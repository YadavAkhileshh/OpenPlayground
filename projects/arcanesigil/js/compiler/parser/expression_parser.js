/* js/compiler/parser/expression_parser.js */

/**
 * Sub-parser specifically handling Expressions 
 * (Binary, Unary, Logical, Assignments)
 */
class ExpressionParser {
    constructor(parserUtils) {
        this.utils = parserUtils;
    }

    parse() {
        return this.assignment();
    }

    assignment() {
        const expr = this.or();

        if (this.utils.match(TokenType.EQUAL)) {
            const equals = this.utils.previous();
            const value = this.assignment();

            if (expr.type === 'Identifier') {
                const name = expr.name;
                return new window.AssignmentExpression(name, value);
            }

            throw new ParseError(equals, "Invalid assignment target.");
        }

        return expr;
    }

    or() {
        let expr = this.and();

        while (this.utils.match(TokenType.OR)) {
            const operator = this.utils.previous();
            const right = this.and();
            expr = new window.LogicalExpression(expr, operator, right);
        }

        return expr;
    }

    and() {
        let expr = this.equality();

        while (this.utils.match(TokenType.AND)) {
            const operator = this.utils.previous();
            const right = this.equality();
            expr = new window.LogicalExpression(expr, operator, right);
        }

        return expr;
    }

    equality() {
        let expr = this.comparison();

        while (this.utils.match(TokenType.BANG_EQUAL, TokenType.EQUAL_EQUAL)) {
            const operator = this.utils.previous();
            const right = this.comparison();
            expr = new window.BinaryExpression(expr, operator, right);
        }

        return expr;
    }

    comparison() {
        let expr = this.term();

        while (this.utils.match(TokenType.GREATER, TokenType.GREATER_EQUAL, TokenType.LESS, TokenType.LESS_EQUAL)) {
            const operator = this.utils.previous();
            const right = this.term();
            expr = new window.BinaryExpression(expr, operator, right);
        }

        return expr;
    }

    term() {
        let expr = this.factor();

        while (this.utils.match(TokenType.MINUS, TokenType.PLUS)) {
            const operator = this.utils.previous();
            const right = this.factor();
            expr = new window.BinaryExpression(expr, operator, right);
        }

        return expr;
    }

    factor() {
        let expr = this.unary();

        while (this.utils.match(TokenType.SLASH, TokenType.STAR, TokenType.PERCENT)) {
            const operator = this.utils.previous();
            const right = this.unary();
            expr = new window.BinaryExpression(expr, operator, right);
        }

        return expr;
    }

    unary() {
        if (this.utils.match(TokenType.BANG, TokenType.MINUS)) {
            const operator = this.utils.previous();
            const right = this.unary();
            return new window.UnaryExpression(operator, right);
        }

        return this.call();
    }

    call() {
        let expr = this.primary();

        while (true) {
            if (this.utils.match(TokenType.LEFT_PAREN)) {
                expr = this.finishCall(expr);
            } else {
                break;
            }
        }

        return expr;
    }

    finishCall(callee) {
        const args = [];
        if (!this.utils.check(TokenType.RIGHT_PAREN)) {
            do {
                if (args.length >= 255) {
                    throw new ParseError(this.utils.peek(), "Can't have more than 255 arguments.");
                }
                args.push(this.parse());
            } while (this.utils.match(TokenType.COMMA));
        }

        const paren = this.utils.consume(TokenType.RIGHT_PAREN, "Expect ')' after arguments.");

        return new window.CallExpression(callee, paren, args);
    }

    primary() {
        if (this.utils.match(TokenType.FALSE)) return new window.Literal(false);
        if (this.utils.match(TokenType.TRUE)) return new window.Literal(true);
        if (this.utils.match(TokenType.NIL)) return new window.Literal(null);

        if (this.utils.match(TokenType.NUMBER, TokenType.STRING)) {
            return new window.Literal(this.utils.previous().literal);
        }

        if (this.utils.match(TokenType.IDENTIFIER)) {
            return new window.Identifier(this.utils.previous());
        }

        if (this.utils.match(TokenType.LEFT_PAREN)) {
            const expr = this.parse();
            this.utils.consume(TokenType.RIGHT_PAREN, "Expect ')' after expression.");
            return new window.Grouping(expr);
        }

        throw new ParseError(this.utils.peek(), "Expect expression.");
    }
}

window.ExpressionParser = ExpressionParser;
