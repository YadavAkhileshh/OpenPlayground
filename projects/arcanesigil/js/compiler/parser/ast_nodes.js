/* js/compiler/parser/ast_nodes.js */

/**
 * Base Node for the Abstract Syntax Tree
 */
class ASTNode {
    accept(visitor) {
        throw new Error("accept() must be implemented in subclasses");
    }
}

class Program extends ASTNode {
    constructor(statements) {
        super();
        this.type = 'Program';
        this.statements = statements; // Array of ASTNode
    }
    accept(visitor) { return visitor.visitProgram(this); }
}

class BlockStatement extends ASTNode {
    constructor(statements) {
        super();
        this.type = 'BlockStatement';
        this.statements = statements;
    }
    accept(visitor) { return visitor.visitBlockStatement(this); }
}

class ExpressionStatement extends ASTNode {
    constructor(expression) {
        super();
        this.type = 'ExpressionStatement';
        this.expression = expression;
    }
    accept(visitor) { return visitor.visitExpressionStatement(this); }
}

class IfStatement extends ASTNode {
    constructor(condition, thenBranch, elseBranch) {
        super();
        this.type = 'IfStatement';
        this.condition = condition;
        this.thenBranch = thenBranch;
        this.elseBranch = elseBranch;
    }
    accept(visitor) { return visitor.visitIfStatement(this); }
}

class WhileStatement extends ASTNode {
    constructor(condition, body) {
        super();
        this.type = 'WhileStatement';
        this.condition = condition;
        this.body = body;
    }
    accept(visitor) { return visitor.visitWhileStatement(this); }
}

class ForStatement extends ASTNode {
    constructor(initializer, condition, increment, body) {
        super();
        this.type = 'ForStatement';
        this.initializer = initializer;
        this.condition = condition;
        this.increment = increment;
        this.body = body;
    }
    accept(visitor) { return visitor.visitForStatement(this); }
}

class LetStatement extends ASTNode {
    constructor(name, initializer) {
        super();
        this.type = 'LetStatement';
        this.name = name; // Token
        this.initializer = initializer; // Expression
    }
    accept(visitor) { return visitor.visitLetStatement(this); }
}

class ReturnStatement extends ASTNode {
    constructor(keyword, value) {
        super();
        this.type = 'ReturnStatement';
        this.keyword = keyword; // Token
        this.value = value;
    }
    accept(visitor) { return visitor.visitReturnStatement(this); }
}

class FunctionDeclaration extends ASTNode {
    constructor(name, params, body) {
        super();
        this.type = 'FunctionDeclaration';
        this.name = name; // Token
        this.params = params; // Array of Tokens
        this.body = body; // Array of Statements (Block)
    }
    accept(visitor) { return visitor.visitFunctionDeclaration(this); }
}

// Expressions
class BinaryExpression extends ASTNode {
    constructor(left, operator, right) {
        super();
        this.type = 'BinaryExpression';
        this.left = left;
        this.operator = operator; // Token
        this.right = right;
    }
    accept(visitor) { return visitor.visitBinaryExpression(this); }
}

class LogicalExpression extends ASTNode {
    constructor(left, operator, right) {
        super();
        this.type = 'LogicalExpression';
        this.left = left;
        this.operator = operator;
        this.right = right;
    }
    accept(visitor) { return visitor.visitLogicalExpression(this); }
}

class UnaryExpression extends ASTNode {
    constructor(operator, right) {
        super();
        this.type = 'UnaryExpression';
        this.operator = operator;
        this.right = right;
    }
    accept(visitor) { return visitor.visitUnaryExpression(this); }
}

class CallExpression extends ASTNode {
    constructor(callee, paren, args) {
        super();
        this.type = 'CallExpression';
        this.callee = callee; // Expression
        this.paren = paren;   // Token (for error reporting pos)
        this.args = args;     // Array of Expressions
    }
    accept(visitor) { return visitor.visitCallExpression(this); }
}

class AssignmentExpression extends ASTNode {
    constructor(name, value) {
        super();
        this.type = 'AssignmentExpression';
        this.name = name; // Token
        this.value = value;
    }
    accept(visitor) { return visitor.visitAssignmentExpression(this); }
}

class Literal extends ASTNode {
    constructor(value) {
        super();
        this.type = 'Literal';
        this.value = value;
    }
    accept(visitor) { return visitor.visitLiteral(this); }
}

class Identifier extends ASTNode {
    constructor(name) {
        super();
        this.type = 'Identifier';
        this.name = name; // Token
    }
    accept(visitor) { return visitor.visitIdentifier(this); }
}

class Grouping extends ASTNode {
    constructor(expression) {
        super();
        this.type = 'Grouping';
        this.expression = expression;
    }
    accept(visitor) { return visitor.visitGrouping(this); }
}

// Flatten access for window
window.ASTNode = ASTNode;
window.Program = Program;
window.BlockStatement = BlockStatement;
window.ExpressionStatement = ExpressionStatement;
window.IfStatement = IfStatement;
window.WhileStatement = WhileStatement;
window.ForStatement = ForStatement;
window.LetStatement = LetStatement;
window.ReturnStatement = ReturnStatement;
window.FunctionDeclaration = FunctionDeclaration;
window.BinaryExpression = BinaryExpression;
window.LogicalExpression = LogicalExpression;
window.UnaryExpression = UnaryExpression;
window.CallExpression = CallExpression;
window.AssignmentExpression = AssignmentExpression;
window.Literal = Literal;
window.Identifier = Identifier;
window.Grouping = Grouping;
