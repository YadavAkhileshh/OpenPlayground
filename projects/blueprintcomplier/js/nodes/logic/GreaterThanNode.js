import { NodeModel } from '../../models/NodeModel.js';
import { PortModel } from '../../models/PortModel.js';

export class GreaterThanNode extends NodeModel {
    constructor() {
        super("Greater Than >", "logic");

        this.addInput(new PortModel("A", "number", false));
        this.addInput(new PortModel("B", "number", false));

        this.addOutput(new PortModel("result", "boolean", false));
    }
}
