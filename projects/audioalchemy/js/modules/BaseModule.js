import { audioCtx } from './AudioEngine.js';

/**
 * BaseModule Class.
 * Abstract base class for all synthesizer modules.
 * Provides standard input/output registry and connection methods.
 * All specific modules (VCO, VCF, etc.) inherit from this.
 */
export class BaseModule {
    constructor(name) {
        this.name = name;
        this.inputs = {};  // Map<string, AudioNode | AudioParam>
        this.outputs = {}; // Map<string, AudioNode>
        this.params = {};  // Map<string, AudioParam> for knobs to control
    }

    // Connect this module's output to another module's input
    connect(outputName, targetModule, inputName) {
        const sourceNode = this.outputs[outputName];
        if (!sourceNode) {
            console.error(`Output ${outputName} not found on module ${this.name}`);
            return false;
        }

        let destNode = targetModule.inputs[inputName];

        // Handle AudioParam destinations vs AudioNode destinations
        if (!destNode && targetModule.params[inputName]) {
            destNode = targetModule.params[inputName];
        }

        if (!destNode) {
            console.error(`Input ${inputName} not found on module ${targetModule.name}`);
            return false;
        }

        try {
            sourceNode.connect(destNode);
            return true;
        } catch (e) {
            console.error(`Connection failed: ${this.name}.${outputName} -> ${targetModule.name}.${inputName}`, e);
            return false;
        }
    }

    disconnect(outputName, targetModule, inputName) {
        const sourceNode = this.outputs[outputName];
        let destNode = targetModule.inputs[inputName];

        if (!destNode && targetModule.params[inputName]) {
            destNode = targetModule.params[inputName];
        }

        if (sourceNode && destNode) {
            try {
                sourceNode.disconnect(destNode);
            } catch (e) {
                // Ignore disconnect errors (node might already be disconnected)
            }
        }
    }
}
