import { StartNode } from './events/StartNode.js';
import { TickNode } from './events/TickNode.js';
import { BranchNode } from './logic/BranchNode.js';
import { EqualsNode } from './logic/EqualsNode.js';
import { GreaterThanNode } from './logic/GreaterThanNode.js';
import { AndNode } from './logic/AndNode.js';
import { OrNode } from './logic/OrNode.js';
import { AddNode } from './math/AddNode.js';
import { SubtractNode } from './math/SubtractNode.js';
import { MultiplyNode } from './math/MultiplyNode.js';
import { DivideNode } from './math/DivideNode.js';
import { NumberNode } from './data/NumberNode.js';
import { StringNode } from './data/StringNode.js';
import { PrintNode } from './debug/PrintNode.js';

export class NodeRegistry {
    constructor() {
        this.registry = new Map();

        // Events
        this.register('Event: Start', StartNode);
        this.register('Event: Tick', TickNode);

        // Logic
        this.register('Logic: Branch', BranchNode);
        this.register('Logic: Equals', EqualsNode);
        this.register('Logic: Greater Than', GreaterThanNode);
        this.register('Logic: AND', AndNode);
        this.register('Logic: OR', OrNode);

        // Math
        this.register('Math: Add', AddNode);
        this.register('Math: Subtract', SubtractNode);
        this.register('Math: Multiply', MultiplyNode);
        this.register('Math: Divide', DivideNode);

        // Data
        this.register('Data: Number', NumberNode);
        this.register('Data: String', StringNode);

        // Debug
        this.register('Debug: Print', PrintNode);
    }

    register(name, nodeClass) {
        this.registry.set(name, nodeClass);
    }

    getNodeClass(name) {
        return this.registry.get(name);
    }

    getRegisteredTypes() {
        return this.registry;
    }
}
