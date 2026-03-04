import { NodeModel } from '../../models/NodeModel.js';
import { PortModel } from '../../models/PortModel.js';

export class OrNode extends NodeModel {
    constructor() {
        super("OR ||", "logic");

        this.addInput(new PortModel("A", "boolean", false));
        this.addInput(new PortModel("B", "boolean", false));

        this.addOutput(new PortModel("result", "boolean", false));
    }
}
