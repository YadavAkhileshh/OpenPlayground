/* js/compiler/parser/ast_visitor.js */

/**
 * Base Visitor interface for traversing ASTs
 */
class ASTVisitor {
    visitProgram(node) { }
    visitBlockStatement(node) { }
    visitExpressionStatement(node) { }
    visitIfStatement(node) { }
    visitWhileStatement(node) { }
    visitForStatement(node) { }
    visitLetStatement(node) { }
    visitReturnStatement(node) { }
    visitFunctionDeclaration(node) { }
    visitBinaryExpression(node) { }
    visitLogicalExpression(node) { }
    visitUnaryExpression(node) { }
    visitCallExpression(node) { }
    visitAssignmentExpression(node) { }
    visitLiteral(node) { }
    visitIdentifier(node) { }
    visitGrouping(node) { }
}

window.ASTVisitor = ASTVisitor;
