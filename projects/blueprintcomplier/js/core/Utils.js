/**
 * Utility functions for UUID generation and common operations.
 */
export class Utils {
    static generateId() {
        return 'id-' + Math.random().toString(36).substr(2, 9) + '-' + Date.now().toString(36);
    }

    static deepClone(obj) {
        return JSON.parse(JSON.stringify(obj));
    }

    static getElementCenter(element) {
        const rect = element.getBoundingClientRect();
        return {
            x: rect.left + rect.width / 2,
            y: rect.top + rect.height / 2
        };
    }
}
