import { DagValidator } from './DagValidator.js';
import { TopologicalSorter } from './TopologicalSorter.js';
import { CodeGenerator } from './CodeGenerator.js';
import { ExecutionEngine } from './ExecutionEngine.js';

export class Compiler {
    constructor(graphEngine, consoleWindow) {
        this.graphEngine = graphEngine;
        this.console = consoleWindow;
        this.executionEngine = new ExecutionEngine(consoleWindow);
    }

    compileAndRun() {
        this.console.clear();
        this.console.log("Starting Compilation...", "info");

        const graph = this.graphEngine.graph;

        try {
            // 1. Validation phase (Cycles, etc)
            this.console.log("Validating DAG constraints...", "info");
            const validation = DagValidator.validate(graph);

            if (!validation.isValid) {
                validation.errors.forEach(err => this.console.log(err, "error"));
                this.console.log("Compilation Failed during Validation.", "error");
                return;
            }

            // 2. Generate Abstract Code / AST string
            this.console.log("Generating executable code...", "info");
            const codeGen = new CodeGenerator(graph);
            const executableCode = codeGen.generateFunction();

            this.console.log("Generated Code Structure successfully.", "success");
            // Optional: this.console.log(executableCode, "info"); // for heavy debugging

            // 3. Execution
            this.executionEngine.execute(executableCode);

        } catch (err) {
            this.console.log(`Compilation Error: ${err.message}`, "error");
            console.error(err);
        }
    }
}
