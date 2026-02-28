import { NodeModel } from '../../models/NodeModel.js';
import { PortModel } from '../../models/PortModel.js';

export class BranchNode extends NodeModel {
    constructor() {
        super("Branch", "logic");

        // Execution Input
        this.addInput(new PortModel("exec", "any", true));

        // Condition Input
        this.addInput(new PortModel("condition", "boolean", false));

        // True/False Execution Outputs
        this.addOutput(new PortModel("true", "any", true));
        this.addOutput(new PortModel("false", "any", true));
    }
}
