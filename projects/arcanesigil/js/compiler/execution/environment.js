/* js/compiler/execution/environment.js */

/**
 * Environment / Scope Management
 * Stores variables mapping Identifier names to Values
 */
class Environment {
    constructor(enclosing = null) {
        this.values = new Map();
        this.enclosing = enclosing; // Pointer to parent scope
    }

    define(name, value) {
        this.values.set(name, value);
    }

    get(nameToken) {
        if (this.values.has(nameToken.lexeme)) {
            return this.values.get(nameToken.lexeme);
        }

        if (this.enclosing !== null) {
            return this.enclosing.get(nameToken);
        }

        throw new RuntimeError(nameToken, `Undefined variable '${nameToken.lexeme}'.`);
    }

    assign(nameToken, value) {
        if (this.values.has(nameToken.lexeme)) {
            this.values.set(nameToken.lexeme, value);
            return;
        }

        if (this.enclosing !== null) {
            this.enclosing.assign(nameToken, value);
            return;
        }

        throw new RuntimeError(nameToken, `Undefined variable '${nameToken.lexeme}'.`);
    }

    /**
     * Retrieve by string name rather than token (used for builtins)
     */
    getByName(name) {
        if (this.values.has(name)) {
            return this.values.get(name);
        }
        if (this.enclosing !== null) {
            return this.enclosing.getByName(name);
        }
        return undefined;
    }
}

window.Environment = Environment;
