/**
 * Standard I/O Streams
 * Providing unified abstraction over DOM elements and memory for piping
 */
class Stream {
    constructor() {
        this.buffer = '';
        this.listeners = new Set();
        this.closed = false;
    }

    onData(callback) {
        this.listeners.add(callback);
    }

    offData(callback) {
        this.listeners.delete(callback);
    }

    write(data) {
        if (this.closed) throw new Errors.KernelError('Stream closed');
        this.buffer += data;
        this.listeners.forEach(cb => cb(data));
    }

    read() {
        const content = this.buffer;
        this.buffer = '';
        return content;
    }

    writeError(data) {
        if (this.closed) throw new Errors.KernelError('Stream closed');
        // By default, map error to standard out in generic streams
        this.buffer += data;
        this.listeners.forEach(cb => cb(data));
    }

    close() {
        this.closed = true;
    }
}

class DOMTerminalStream extends Stream {
    constructor(terminalElement, writeCb, errorCb) {
        super();
        this.terminal = terminalElement;
        this.writeCb = writeCb || ((data) => {
            const line = document.createElement('div');
            line.className = 'term-line';
            line.textContent = data;
            this.terminal.appendChild(line);
            this.terminal.scrollTop = this.terminal.scrollHeight;
        });
        this.errorCb = errorCb || ((data) => {
            const line = document.createElement('div');
            line.className = 'term-line term-error';
            line.textContent = data;
            this.terminal.appendChild(line);
            this.terminal.scrollTop = this.terminal.scrollHeight;
        });
    }

    write(data) {
        super.write(data);
        this.writeCb(data);
    }

    writeError(data) {
        if (this.closed) throw new Errors.KernelError('Stream closed');
        this.errorCb(data);
    }
}

window.Stream = Stream;
window.DOMTerminalStream = DOMTerminalStream;
