import { NodeModel } from '../../models/NodeModel.js';
import { PortModel } from '../../models/PortModel.js';

export class TickNode extends NodeModel {
    constructor() {
        super("Tick Event", "event");

        // Execution Output
        this.addOutput(new PortModel("exec", "any", true));
        // Delta Time Data Output
        this.addOutput(new PortModel("DeltaTime", "number", false));
    }
}
