export class Logger {
    constructor() {
        this.styles = {
            default: 'color: #ccc; font-family: monospace;',
            title: 'color: #0f0; font-weight: bold; font-size: 14px; text-decoration: underline;',
            info: 'color: #88ccff;',
            success: 'color: #55ff55;',
            warning: 'color: #ffff55;',
            error: 'color: #ff5555; font-weight: bold;',
            combat: 'color: #ffaaaa;',
            item: 'color: #ddaaff;',
            map: 'color: #ffffff; line-height: 1.0; font-family: monospace;', // Compact line height for maps
            ui: 'color: #00ff00; background: #002200; padding: 2px 5px;',
            story: 'color: #aaaaff; font-style: italic;'
        };
    }

    log(message, type = 'default') {
        const style = this.styles[type] || this.styles.default;
        console.log(`%c${message}`, style);
    }

    // Print a line break
    br() {
        console.log('');
    }

    // Print a header
    header(text) {
        this.br();
        console.log(`%c=== ${text} ===`, this.styles.title);
        this.br();
    }

    // Print a list of items
    list(items, title = 'Items') {
        this.header(title);
        if (items.length === 0) {
            this.log('  (Empty)', 'info');
            return;
        }
        items.forEach(item => {
            this.log(`  - ${item}`, 'item');
        });
    }

    clear() {
        console.clear();
    }
}

export const logger = new Logger();
