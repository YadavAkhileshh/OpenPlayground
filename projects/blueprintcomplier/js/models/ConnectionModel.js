import { Utils } from '../core/Utils.js';

/**
 * A linkage between an output port and an input port.
 */
export class ConnectionModel {
    constructor(outputNodeId, outputPortId, inputNodeId, inputPortId, isExec = false) {
        this.id = Utils.generateId();
        this.outputNodeId = outputNodeId;
        this.outputPortId = outputPortId;
        this.inputNodeId = inputNodeId;
        this.inputPortId = inputPortId;
        this.isExec = isExec;
    }
}
