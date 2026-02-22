import { NodeModel } from '../../models/NodeModel.js';
import { PortModel } from '../../models/PortModel.js';

export class AddNode extends NodeModel {
    constructor() {
        super("Add +", "math");

        this.addInput(new PortModel("A", "number", false));
        this.addInput(new PortModel("B", "number", false));

        this.addOutput(new PortModel("result", "number", false));
    }
}
