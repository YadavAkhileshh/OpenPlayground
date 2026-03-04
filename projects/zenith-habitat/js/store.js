/**
 * Simple wrapper around LocalStorage for namespaced data persistence.
 */
export default class Store {
    constructor(namespace) {
        this.namespace = namespace;
    }

    get(key, defaultValue = null) {
        const fullKey = `${this.namespace}:${key}`;
        try {
            const item = localStorage.getItem(fullKey);
            return item ? JSON.parse(item) : defaultValue;
        } catch (e) {
            console.error('Error reading from storage', e);
            return defaultValue;
        }
    }

    set(key, value) {
        const fullKey = `${this.namespace}:${key}`;
        try {
            localStorage.setItem(fullKey, JSON.stringify(value));
            return true;
        } catch (e) {
            console.error('Error writing to storage', e);
            return false;
        }
    }

    remove(key) {
        const fullKey = `${this.namespace}:${key}`;
        localStorage.removeItem(fullKey);
    }
}
