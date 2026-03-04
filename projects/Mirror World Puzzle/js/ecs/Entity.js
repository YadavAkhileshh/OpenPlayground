import { generateId } from '../utils/MathUtils.js';

export default class Entity {
    constructor() {
        this.id = generateId();
        this.components = new Map();
        this.active = true;
    }

    addComponent(component) {
        this.components.set(component.constructor.name, component);
        return this;
    }

    removeComponent(componentName) {
        this.components.delete(componentName);
    }

    getComponent(componentName) {
        return this.components.get(componentName);
    }

    hasComponent(componentName) {
        return this.components.has(componentName);
    }
}
