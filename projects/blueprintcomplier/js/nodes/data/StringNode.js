import { NodeModel } from '../../models/NodeModel.js';
import { PortModel } from '../../models/PortModel.js';

export class StringNode extends NodeModel {
    constructor() {
        super("String", "data");

        const port = new PortModel("value", "string", false);
        port.defaultValue = "Hello"; // Literal default
        this.addOutput(port);
    }
}
