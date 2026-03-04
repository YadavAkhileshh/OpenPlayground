import { NodeModel } from '../../models/NodeModel.js';
import { PortModel } from '../../models/PortModel.js';

export class NumberNode extends NodeModel {
    constructor() {
        super("Number", "data");

        const port = new PortModel("value", "number", false);
        port.defaultValue = 0; // Literal default
        this.addOutput(port);
    }
}
