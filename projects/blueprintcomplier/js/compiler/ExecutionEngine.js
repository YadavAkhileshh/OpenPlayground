export class ExecutionEngine {
    constructor(consoleWindow) {
        this.console = consoleWindow;
    }

    async execute(codeString) {
        this.console.log("--- Starting Execution ---", "info");
        try {
            // Context object to pass into the dynamic function
            const context = {
                print: (msg) => this.console.log(msg, "info")
            };

            // Using AsyncFunction constructor to allow async/await inside compiled blueprints
            const AsyncFunction = Object.getPrototypeOf(async function () { }).constructor;
            const executable = new AsyncFunction(codeString)(); // returns the inner function

            // Execute the inner function with context
            await executable(context);

            this.console.log("--- Execution Completed Successfully ---", "success");
        } catch (err) {
            this.console.log(`Execution Error: ${err.message}`, "error");
            console.error(err);
        }
    }
}
