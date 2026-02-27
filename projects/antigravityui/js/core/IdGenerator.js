// js/core/IdGenerator.js

export class IdGenerator {
    static _currentId = 0;

    static nextId() {
        return `ag-body-${IdGenerator._currentId++}`;
    }

    static reset() {
        IdGenerator._currentId = 0;
    }
}
