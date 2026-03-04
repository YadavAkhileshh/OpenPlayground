import { NodeModel } from '../../models/NodeModel.js';
import { PortModel } from '../../models/PortModel.js';

export class AndNode extends NodeModel {
    constructor() {
        super("AND &&", "logic");

        this.addInput(new PortModel("A", "boolean", false));
        this.addInput(new PortModel("B", "boolean", false));

        this.addOutput(new PortModel("result", "boolean", false));
    }
}
