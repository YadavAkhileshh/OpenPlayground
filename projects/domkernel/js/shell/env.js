/**
 * Shell Environment handling variables
 */
class Environment {
    constructor(parent = null) {
        this.parent = parent;
        this.vars = {};

        if (!parent) {
            Object.assign(this.vars, CONSTANTS.DEFAULT_ENV);
        }
    }

    get(key) {
        if (this.vars.hasOwnProperty(key)) return this.vars[key];
        if (this.parent) return this.parent.get(key);
        return '';
    }

    set(key, value) {
        this.vars[key] = value;
    }

    expandString(str) {
        return str.replace(/\$(\w+)/g, (match, varName) => {
            return this.get(varName);
        });
    }

    getAll() {
        const merged = this.parent ? this.parent.getAll() : {};
        return { ...merged, ...this.vars };
    }
}

window.Environment = Environment;
