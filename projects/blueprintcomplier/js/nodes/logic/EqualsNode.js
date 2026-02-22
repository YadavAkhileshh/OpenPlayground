import { NodeModel } from '../../models/NodeModel.js';
import { PortModel } from '../../models/PortModel.js';

export class EqualsNode extends NodeModel {
    constructor() {
        super("Equals ==", "logic");

        this.addInput(new PortModel("A", "any", false));
        this.addInput(new PortModel("B", "any", false));

        this.addOutput(new PortModel("result", "boolean", false));
    }
}
