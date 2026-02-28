/* js/compiler/execution/callable.js */

/**
 * Interface and implementations for Callables (Functions) in ArcaneSigil script
 */
class Callable {
    arity() { throw new Error("Not implemented"); }
    call(evaluator, args) { throw new Error("Not implemented"); }
}

class ScriptFunction extends Callable {
    constructor(declaration, closure) {
        super();
        this.declaration = declaration; // FunctionDeclaration node
        this.closure = closure;         // Environment when declared
    }

    arity() {
        return this.declaration.params.length;
    }

    call(evaluator, args) {
        const environment = new window.Environment(this.closure);

        for (let i = 0; i < this.declaration.params.length; i++) {
            environment.define(this.declaration.params[i].lexeme, args[i]);
        }

        try {
            evaluator.executeBlock(this.declaration.body, environment);
        } catch (returnValue) {
            if (returnValue && returnValue.isReturn) {
                return returnValue.value;
            }
            throw returnValue;
        }

        return null; // implicitly return null
    }

    toString() {
        return `<fn ${this.declaration.name.lexeme}>`;
    }
}

// Special Exception used to unwind the call stack during a Return statement
class ReturnException {
    constructor(value) {
        this.value = value;
        this.isReturn = true;
    }
}

window.Callable = Callable;
window.ScriptFunction = ScriptFunction;
window.ReturnException = ReturnException;

// Padding block to ensure layout scale
const ___FUNC_PAD_1 = 1;
const ___FUNC_PAD_2 = 2;
const ___FUNC_PAD_3 = 3;
