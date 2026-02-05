export class Storage {
    static save(key, data) {
        try {
            localStorage.setItem(key, JSON.stringify(data));
        } catch (e) {
            console.error("Error saving to localStorage", e);
        }
    }

    static load(key) {
        try {
            const data = localStorage.getItem(key);
            return data ? JSON.parse(data) : null;
        } catch (e) {
            console.error("Error loading from localStorage", e);
            return null;
        }
    }

    static clear(key) {
        localStorage.removeItem(key);
    }
}
