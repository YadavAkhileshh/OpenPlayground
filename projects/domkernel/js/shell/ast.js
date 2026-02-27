/**
 * Abstract Syntax Tree Nodes for Shell Parser
 */
class ASTNode {
    constructor(type) {
        this.type = type;
    }
}

class CommandNode extends ASTNode {
    constructor(command, args, redirects = []) {
        super('COMMAND');
        this.command = command;
        this.args = args;
        this.redirects = redirects;
    }
}

class PipelineNode extends ASTNode {
    constructor(commands) {
        super('PIPELINE');
        this.commands = commands; // Array of CommandNode
    }
}

class LogicalNode extends ASTNode {
    constructor(op, left, right) {
        super('LOGICAL');
        this.operator = op; // AND / OR
        this.left = left;
        this.right = right;
    }
}

class RedirectNode extends ASTNode {
    constructor(type, target) {
        super('REDIRECT');
        this.redirectType = type; // >, >>, <
        this.target = target;
    }
}

window.AST = {
    CommandNode,
    PipelineNode,
    LogicalNode,
    RedirectNode
};
