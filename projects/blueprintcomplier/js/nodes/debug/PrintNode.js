import { NodeModel } from '../../models/NodeModel.js';
import { PortModel } from '../../models/PortModel.js';

export class PrintNode extends NodeModel {
    constructor() {
        super("Print", "debug");

        this.addInput(new PortModel("exec", "any", true));
        this.addInput(new PortModel("val", "any", false));

        this.addOutput(new PortModel("exec", "any", true));
    }
}
