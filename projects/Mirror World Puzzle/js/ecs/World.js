import Entity from './Entity.js';

export default class World {
    constructor(game) {
        this.game = game;
        this.entities = [];
        this.systems = [];
        this.entitiesToDestroy = [];
    }

    clear() {
        this.entities = [];
        this.entitiesToDestroy = [];
        // Systems persist
    }

    createEntity() {
        const entity = new Entity();
        this.entities.push(entity);
        return entity;
    }

    removeEntity(entity) {
        this.entitiesToDestroy.push(entity);
    }

    addSystem(system) {
        this.systems.push(system);
        system.init(this);
    }

    update(dt) {
        // Cleanup destroyed entities
        if (this.entitiesToDestroy.length > 0) {
            this.entities = this.entities.filter(e => !this.entitiesToDestroy.includes(e));
            this.entitiesToDestroy = [];
        }

        // Update systems
        this.systems.forEach(system => {
            if (system.update) system.update(dt);
        });
    }

    render(alpha) {
        this.systems.forEach(system => {
            if (system.render) system.render(alpha);
        });
    }

    getEntitiesWith(componentNames) {
        return this.entities.filter(entity => {
            return componentNames.every(name => entity.hasComponent(name));
        });
    }
}
