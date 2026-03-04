/* js/core/app.js */

/**
 * Main Application Orchestrator
 * Wires together the UI, Compiler, and Renderer subsystems.
 */
class ArcaneSigilApp {
    constructor() {
        console.log("Initializing ArcaneSigil...");

        // Modules will self-register via DOMContentLoaded or EventBus 
        // By this point, all classes should be loaded in window.

        this.bindGlobalEvents();

        // Initial setup complete notification
        if (window.notifications) {
            window.notifications.show("Core Systems Online. Matrix initialized.", "success");
        }
    }

    bindGlobalEvents() {
        appEventBus.on(EVENTS.COMPILE_REQUESTED, this.handleCompile.bind(this));
        appEventBus.on(EVENTS.EXECUTE_REQUESTED, this.handleExecute.bind(this));
        appEventBus.on(EVENTS.RESET_REQUESTED, this.handleReset.bind(this));
    }

    handleCompile() {
        if (!window.editorInstance) return;

        const code = window.editorInstance.getCode();
        try {
            // Lexing
            const lexer = new Lexer(code);
            const tokens = lexer.tokenize();

            // Parsing
            const parser = new Parser(tokens);
            const ast = parser.parse();

            appEventBus.emit(EVENTS.AST_GENERATED, ast);

            if (window.notifications) {
                window.notifications.show(`Ast generated with ${tokens.length} tokens.`, "info");
            }
        } catch (error) {
            appEventBus.emit(EVENTS.COMPILATION_ERROR, error.message);
        }
    }

    handleExecute() {
        if (!window.editorInstance) return;

        const code = window.editorInstance.getCode();
        try {
            // Re-compile and execute 
            const lexer = new Lexer(code);
            const tokens = lexer.tokenize();

            const parser = new Parser(tokens);
            const ast = parser.parse();

            // Execute
            const environment = new Environment();
            // Load builtins
            Builtins.register(environment);

            const evaluator = new Evaluator(environment);
            evaluator.evaluate(ast); // Run entire program

            if (window.notifications) {
                window.notifications.show("Execution cycle complete.", "success");
            }

            appEventBus.emit(EVENTS.AST_GENERATED, ast);
        } catch (error) {
            appEventBus.emit(EVENTS.RUNTIME_ERROR, error.message);
        }
    }

    handleReset() {
        // Clear AST
        appEventBus.emit(EVENTS.AST_GENERATED, null);
        if (window.notifications) {
            window.notifications.show("System Purged.", "warning");
        }
    }
}

// Global bootstrap
window.addEventListener('load', () => {
    window.app = new ArcaneSigilApp();
});
