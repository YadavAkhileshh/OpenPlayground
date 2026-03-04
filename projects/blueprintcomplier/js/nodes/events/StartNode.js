import { NodeModel } from '../../models/NodeModel.js';
import { PortModel } from '../../models/PortModel.js';

export class StartNode extends NodeModel {
    constructor() {
        super("Start Event", "event");

        // Single Execution Output
        this.addOutput(new PortModel("exec", "any", true));
    }
}
