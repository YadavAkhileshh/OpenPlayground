/**
 * Shell History tracker
 */
class History {
    constructor() {
        this.commands = [];
        this.cursor = 0;
    }

    add(command) {
        if (!command || command.trim() === '') return;
        if (this.commands[this.commands.length - 1] === command) return; // Prevent duplicates
        this.commands.push(command);
        this.cursor = this.commands.length;
    }

    getPrevious() {
        if (this.cursor > 0) {
            this.cursor--;
            return this.commands[this.cursor];
        }
        return this.commands.length > 0 ? this.commands[0] : '';
    }

    getNext() {
        if (this.cursor < this.commands.length - 1) {
            this.cursor++;
            return this.commands[this.cursor];
        }
        this.cursor = this.commands.length;
        return '';
    }
}

window.ShellHistory = History;
