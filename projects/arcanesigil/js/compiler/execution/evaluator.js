/* js/compiler/execution/evaluator.js */

/**
 * AST Evaluator
 * Traverses the AST and executes semantics using the Visitor pattern.
 */
class Evaluator extends window.ASTVisitor {
    constructor(environment) {
        super();
        this.environment = environment;
        this.loopCounter = 0;
    }

    evaluate(node) {
        if (!node) return null;
        return node.accept(this);
    }

    executeBlock(statements, environment) {
        const previous = this.environment;
        try {
            this.environment = environment;
            for (const statement of statements) {
                if (statement) {
                    this.evaluate(statement);
                }
            }
        } finally {
            this.environment = previous;
        }
    }

    visitProgram(program) {
        let value = null;
        for (const statement of program.statements) {
            value = this.evaluate(statement);
        }
        return value;
    }

    visitBlockStatement(stmt) {
        this.executeBlock(stmt.statements, new window.Environment(this.environment));
        return null;
    }

    visitExpressionStatement(stmt) {
        this.evaluate(stmt.expression);
        return null;
    }

    visitIfStatement(stmt) {
        if (this.isTruthy(this.evaluate(stmt.condition))) {
            this.evaluate(stmt.thenBranch);
        } else if (stmt.elseBranch !== null) {
            this.evaluate(stmt.elseBranch);
        }
        return null;
    }

    visitWhileStatement(stmt) {
        while (this.isTruthy(this.evaluate(stmt.condition))) {
            this.evaluate(stmt.body);

            this.loopCounter++;
            if (this.loopCounter > CONFIG.EXECUTION.MAX_LOOP_ITERATIONS) {
                throw new RuntimeError(null, "Infinite loop detected - terminating execution.");
            }
        }
        this.loopCounter = 0; // reset
        return null;
    }

    visitForStatement(stmt) {
        let envWrapper = new window.Environment(this.environment);
        const previousEnv = this.environment;

        try {
            this.environment = envWrapper;

            if (stmt.initializer !== null) {
                this.evaluate(stmt.initializer);
            }

            while (true) {
                if (stmt.condition !== null) {
                    if (!this.isTruthy(this.evaluate(stmt.condition))) {
                        break;
                    }
                }

                this.evaluate(stmt.body);

                if (stmt.increment !== null) {
                    this.evaluate(stmt.increment);
                }

                this.loopCounter++;
                if (this.loopCounter > CONFIG.EXECUTION.MAX_LOOP_ITERATIONS) {
                    throw new RuntimeError(null, "Infinite loop detected - terminating execution.");
                }
            }
        } finally {
            this.environment = previousEnv;
            this.loopCounter = 0;
        }

        return null;
    }

    visitLetStatement(stmt) {
        let value = null;
        if (stmt.initializer !== null) {
            value = this.evaluate(stmt.initializer);
        }
        this.environment.define(stmt.name.lexeme, value);
        return null;
    }

    visitReturnStatement(stmt) {
        let value = null;
        if (stmt.value !== null) {
            value = this.evaluate(stmt.value);
        }
        throw new window.ReturnException(value);
    }

    visitFunctionDeclaration(stmt) {
        const functionObj = new window.ScriptFunction(stmt, this.environment);
        this.environment.define(stmt.name.lexeme, functionObj);
        return null;
    }

    // Expressions
    visitBinaryExpression(expr) {
        const left = this.evaluate(expr.left);
        const right = this.evaluate(expr.right);

        switch (expr.operator.type) {
            case TokenType.MINUS:
                this.checkNumberOperands(expr.operator, left, right);
                return Number(left) - Number(right);
            case TokenType.SLASH:
                this.checkNumberOperands(expr.operator, left, right);
                if (right === 0) throw new RuntimeError(expr.operator, "Division by zero.");
                return Number(left) / Number(right);
            case TokenType.STAR:
                this.checkNumberOperands(expr.operator, left, right);
                return Number(left) * Number(right);
            case TokenType.PERCENT:
                this.checkNumberOperands(expr.operator, left, right);
                return Number(left) % Number(right);
            case TokenType.PLUS:
                if (typeof left === 'number' && typeof right === 'number') {
                    return left + right;
                }
                if (typeof left === 'string' || typeof right === 'string') {
                    return String(left) + String(right);
                }
                throw new RuntimeError(expr.operator, "Operands must be two numbers or two strings.");
            case TokenType.GREATER:
                this.checkNumberOperands(expr.operator, left, right);
                return Number(left) > Number(right);
            case TokenType.GREATER_EQUAL:
                this.checkNumberOperands(expr.operator, left, right);
                return Number(left) >= Number(right);
            case TokenType.LESS:
                this.checkNumberOperands(expr.operator, left, right);
                return Number(left) < Number(right);
            case TokenType.LESS_EQUAL:
                this.checkNumberOperands(expr.operator, left, right);
                return Number(left) <= Number(right);
            case TokenType.BANG_EQUAL:
                return !this.isEqual(left, right);
            case TokenType.EQUAL_EQUAL:
                return this.isEqual(left, right);
        }

        return null;
    }

    visitLogicalExpression(expr) {
        const left = this.evaluate(expr.left);

        if (expr.operator.type === TokenType.OR) {
            if (this.isTruthy(left)) return left;
        } else {
            // AND
            if (!this.isTruthy(left)) return left;
        }

        return this.evaluate(expr.right);
    }

    visitUnaryExpression(expr) {
        const right = this.evaluate(expr.right);

        switch (expr.operator.type) {
            case TokenType.BANG:
                return !this.isTruthy(right);
            case TokenType.MINUS:
                this.checkNumberOperand(expr.operator, right);
                return -Number(right);
        }
        return null;
    }

    visitCallExpression(expr) {
        const callee = this.evaluate(expr.callee);

        const args = [];
        for (const arg of expr.args) {
            args.push(this.evaluate(arg));
        }

        if (!(callee instanceof window.Callable)) {
            throw new RuntimeError(expr.paren, "Can only call functions and classes.");
        }

        if (args.length !== callee.arity()) {
            throw new RuntimeError(expr.paren, `Expected ${callee.arity()} arguments but got ${args.length}.`);
        }

        return callee.call(this, args);
    }

    visitAssignmentExpression(expr) {
        const value = this.evaluate(expr.value);
        this.environment.assign(expr.name, value);
        return value;
    }

    visitLiteral(expr) {
        return expr.value;
    }

    visitIdentifier(expr) {
        return this.environment.get(expr.name);
    }

    visitGrouping(expr) {
        return this.evaluate(expr.expression);
    }

    // Helpers
    isTruthy(object) {
        if (object === null || object === undefined) return false;
        if (typeof object === 'boolean') return object;
        return true;
    }

    isEqual(a, b) {
        return a === b;
    }

    checkNumberOperand(operator, operand) {
        if (typeof operand === 'number') return;
        throw new RuntimeError(operator, "Operand must be a number.");
    }

    checkNumberOperands(operator, left, right) {
        if (typeof left === 'number' && typeof right === 'number') return;
        throw new RuntimeError(operator, "Operands must be numbers.");
    }
}

window.Evaluator = Evaluator;
