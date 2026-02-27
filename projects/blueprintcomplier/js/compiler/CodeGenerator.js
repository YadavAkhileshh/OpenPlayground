export class CodeGenerator {
    constructor(graph) {
        this.graph = graph;
    }

    generateFunction() {
        const startNodes = Array.from(this.graph.nodes.values()).filter(n => n.category === 'event');

        if (startNodes.length === 0) {
            throw new Error("No Event (Start) nodes found to begin execution.");
        }

        let code = `
            return async function executedCompiledGraph(context) {
                const { print } = context;
        `;

        // We use a memo array to evaluate data nodes exactly once per tick if needed, 
        // though for simplicity we will just inline their generation.

        for (const startNode of startNodes) {
            code += `\n// --- Path from ${startNode.title} --- \n`;
            code += this.traverseExecPath(startNode.id, "                ");
        }

        code += `
            };
        `;

        return code;
    }

    traverseExecPath(nodeId, indent = "") {
        const node = this.graph.getNode(nodeId);
        if (!node) return "";

        let block = "";

        // Generate the code for this specific node
        // For StartNode, it just kicks things off
        if (node.constructor.name === "StartNode") {
            // no-op
        } else if (node.constructor.name === "PrintNode") {
            const inputValCode = this.getDataInputValue(node, "val");
            block += `${indent}print(${inputValCode});\n`;
        } else if (node.constructor.name === "BranchNode") {
            const condCode = this.getDataInputValue(node, "condition");
            block += `${indent}if (${condCode}) {\n`;

            // Traverse True path
            const trueNextId = this.getNextExecNodeId(nodeId, "true");
            if (trueNextId) block += this.traverseExecPath(trueNextId, indent + "    ");

            block += `${indent}} else {\n`;

            // Traverse False path
            const falseNextId = this.getNextExecNodeId(nodeId, "false");
            if (falseNextId) block += this.traverseExecPath(falseNextId, indent + "    ");

            block += `${indent}}\n`;
            // Branch nodes handle their own exec continuations inside the if/else
            return block;
        } else {
            // Other exec nodes?
        }

        // Find the next generic Exec node
        const nextId = this.getNextExecNodeId(nodeId, "exec");
        if (nextId) {
            block += this.traverseExecPath(nextId, indent);
        }

        return block;
    }

    getNextExecNodeId(nodeId, portName) {
        const node = this.graph.getNode(nodeId);
        const port = node.outputs.find(p => p.name === portName && p.isExec);
        if (!port) return null;

        const conn = Array.from(this.graph.connections.values()).find(c => c.outputNodeId === nodeId && c.outputPortId === port.id);
        return conn ? conn.inputNodeId : null;
    }

    getDataInputValue(node, inputName) {
        const port = node.inputs.find(p => p.name === inputName && !p.isExec);
        if (!port) return "undefined";

        // Check if there is a connection
        const conn = Array.from(this.graph.connections.values()).find(c => c.inputNodeId === node.id && c.inputPortId === port.id);

        if (conn) {
            // Traverse backwards to evaluate the pure data node
            return this.evaluateDataNode(conn.outputNodeId, conn.outputPortId);
        } else {
            // Use default literal value
            if (port.type === "string") return `"${port.defaultValue || ""}"`;
            return String(port.defaultValue || 0);
        }
    }

    evaluateDataNode(nodeId, portId) {
        const node = this.graph.getNode(nodeId);
        if (!node) return "undefined";

        const name = node.constructor.name;

        switch (name) {
            case "NumberNode":
            case "StringNode":
                const val = node.outputs[0].defaultValue;
                return node.category === 'data' && node.outputs[0].type === 'string' ? `"${val}"` : String(val);

            case "AddNode":
                return `(${this.getDataInputValue(node, "A")} + ${this.getDataInputValue(node, "B")})`;
            case "SubtractNode":
                return `(${this.getDataInputValue(node, "A")} - ${this.getDataInputValue(node, "B")})`;
            case "MultiplyNode":
                return `(${this.getDataInputValue(node, "A")} * ${this.getDataInputValue(node, "B")})`;
            case "DivideNode":
                return `(${this.getDataInputValue(node, "A")} / ${this.getDataInputValue(node, "B")})`;

            case "EqualsNode":
                return `(${this.getDataInputValue(node, "A")} === ${this.getDataInputValue(node, "B")})`;
            case "GreaterThanNode":
                return `(${this.getDataInputValue(node, "A")} > ${this.getDataInputValue(node, "B")})`;
            case "AndNode":
                return `(${this.getDataInputValue(node, "A")} && ${this.getDataInputValue(node, "B")})`;
            case "OrNode":
                return `(${this.getDataInputValue(node, "A")} || ${this.getDataInputValue(node, "B")})`;

            default:
                return "undefined";
        }
    }
}
