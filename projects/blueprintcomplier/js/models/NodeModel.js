import { Utils } from '../core/Utils.js';

/**
 * Base Model for any node in the graph
 */
export class NodeModel {
    constructor(title, category = "default") {
        this.id = Utils.generateId();
        this.title = title;
        this.category = category;
        this.x = 0;
        this.y = 0;

        this.inputs = []; // array of PortModels
        this.outputs = []; // array of PortModels

        this.isCompiled = false;

        // Dynamic state mapping
        this.state = {};
    }

    addInput(port) {
        this.inputs.push(port);
        port.parentNodeId = this.id;
        port.isInput = true;
    }

    addOutput(port) {
        this.outputs.push(port);
        port.parentNodeId = this.id;
        port.isInput = false;
    }

    getInput(portId) {
        return this.inputs.find(p => p.id === portId) || this.inputs.find(p => p.name === portId);
    }

    getOutput(portId) {
        return this.outputs.find(p => p.id === portId) || this.outputs.find(p => p.name === portId);
    }

    setPosition(x, y) {
        this.x = x;
        this.y = y;
    }
}
