import { Utils } from '../core/Utils.js';

/**
 * Represents a connection point on a node. Can be data or exec type.
 */
export class PortModel {
    constructor(name, type = "any", isExec = false) {
        this.id = Utils.generateId();
        this.name = name;
        this.type = type; // number, string, boolean, any
        this.isExec = isExec; // Exec ports handle flow, data ports handle values

        // Provided by node when added
        this.parentNodeId = null;
        this.isInput = null;

        // If it's an input port mapped to a default literal UI value
        this.defaultValue = null;
    }

    canConnectTo(otherPort) {
        if (this.parentNodeId === otherPort.parentNodeId) return false; // same node
        if (this.isInput === otherPort.isInput) return false; // both inputs or both outputs
        if (this.isExec !== otherPort.isExec) return false; // execs only to execs, data to data

        // Data type checking (simplified: 'any' connects to anything, otherwise strict match)
        if (!this.isExec) {
            if (this.type !== "any" && otherPort.type !== "any" && this.type !== otherPort.type) {
                return false;
            }
        }
        return true;
    }
}
