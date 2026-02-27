/* js/compiler/execution/builtins.js */

/**
 * Builtin Functions for the runtime.
 * Provides standard math and generic JS bindings.
 */
class BuiltinFunction extends window.Callable {
    constructor(ar, func, name = "native") {
        super();
        this._arity = ar;
        this._func = func;
        this._name = name;
    }

    arity() {
        return this._arity;
    }

    call(evaluator, args) {
        return this._func(args, evaluator);
    }

    toString() {
        return `<native fn ${this._name}>`;
    }
}

class Builtins {
    static register(environment) {
        // Clock / Time
        environment.define("time", new BuiltinFunction(0, () => Date.now() / 1000, "time"));

        // Global Print override
        environment.define("print", new BuiltinFunction(1, (args) => {
            const val = Builtins.stringify(args[0]);
            appEventBus.emit(EVENTS.RUNTIME_OUTPUT, val);
            return null;
        }, "print"));

        // Math builtins
        environment.define("Math_abs", new BuiltinFunction(1, (args) => Math.abs(args[0]), "Math_abs"));
        environment.define("Math_sqrt", new BuiltinFunction(1, (args) => Math.sqrt(args[0]), "Math_sqrt"));
        environment.define("Math_sin", new BuiltinFunction(1, (args) => Math.sin(args[0]), "Math_sin"));
        environment.define("Math_cos", new BuiltinFunction(1, (args) => Math.cos(args[0]), "Math_cos"));
        environment.define("Math_random", new BuiltinFunction(0, () => Math.random(), "Math_random"));
        environment.define("Math_PI", Math.PI);

        // Core visual bindings -> allowing script to emit visual commands
        // We will expose a `sigil` array object built-in
        environment.define("Sigil_drawRune", new BuiltinFunction(3, (args) => {
            // args: [ringIndex, angleData, colorCode]
            // We emit an event to the renderer, this is a conceptual bridge.
            // (In our hybrid model, renderer automatically walks the AST rather than waiting for command calls, 
            // but providing a command interface can be a cool secondary feature).
            appEventBus.emit(EVENTS.RUNTIME_OUTPUT, `[Rune Drawn by code at ring ${args[0]}]`);
            return null;
        }, "Sigil_drawRune"));
    }

    static stringify(object) {
        if (object === null) return "null";

        if (typeof object === 'number') {
            let text = object.toString();
            if (text.endsWith(".0")) {
                text = text.substring(0, text.length - 2);
            }
            return text;
        }

        if (object && typeof object.toString === 'function') {
            return object.toString();
        }

        return String(object);
    }
}

window.Builtins = Builtins;
window.BuiltinFunction = BuiltinFunction;
