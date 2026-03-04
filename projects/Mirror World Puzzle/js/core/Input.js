export default class Input {
    constructor() {
        this.keys = new Set();
        this.bindEvents();
    }

    bindEvents() {
        window.addEventListener('keydown', (e) => {
            this.keys.add(e.key);
        });

        window.addEventListener('keyup', (e) => {
            this.keys.delete(e.key);
        });
    }

    isKeyPressed(key) {
        return this.keys.has(key);
    }
}
