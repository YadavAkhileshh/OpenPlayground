/**
 * Terminal Application
 */
class TerminalApp {
    constructor(winRef = null) {
        if (!winRef) {
            this.window = new SystemWindow({
                title: 'Terminal - /bin/sh',
                width: 650,
                height: 450,
                icon: 'M4 4h16v16H4V4zm2 4v2h2V8H6zm0 4v2h6v-2H6z'
            });
            this.window.mountApp(TerminalApp, [this.window]);
            return this.window.appInstance;
        }

        this.window = winRef;
        this.env = new Environment(); // Each terminal gets its own environment scope
        this.history = new ShellHistory();
        this.executor = new Executor(this.env);
        this.stream = null;

        this.container = null;
        this.outputArea = null;
        this.inputArea = null;
        this.promptElem = null;

        this.render();
        this.setupStream();
        this.bindEvents();

        // Trigger initial prompt
        this.updatePrompt();
    }

    render() {
        this.container = UIRenderer.h('div', { className: 'terminal-app' });

        this.outputArea = UIRenderer.h('div', { className: 'term-output' });

        this.inputLine = UIRenderer.h('div', { className: 'term-input-line' });
        this.promptElem = UIRenderer.h('span', { className: 'term-prompt' });
        this.inputArea = UIRenderer.h('input', {
            className: 'term-input',
            type: 'text',
            spellcheck: 'false',
            autocomplete: 'off'
        });

        this.inputLine.appendChild(this.promptElem);
        this.inputLine.appendChild(this.inputArea);

        this.container.appendChild(this.outputArea);
        this.container.appendChild(this.inputLine);

        UIRenderer.mount(this.window.contentElement, this.container);

        // Auto focus
        setTimeout(() => this.inputArea.focus(), 10);
        this.container.onclick = () => this.inputArea.focus();
    }

    setupStream() {
        this.stream = new DOMTerminalStream(
            this.outputArea,
            (data) => {
                // If it's a clear code
                if (data === '\x1b[2J\x1b[0;0H') {
                    this.outputArea.innerHTML = '';
                    return;
                }
                const line = document.createElement('div');
                line.className = 'term-line';
                line.innerHTML = data; // Allows basic html spans for colors
                this.outputArea.appendChild(line);
                this.container.scrollTop = this.container.scrollHeight;
            },
            (err) => {
                const line = document.createElement('div');
                line.className = 'term-line term-error';
                line.textContent = err;
                this.outputArea.appendChild(line);
                this.container.scrollTop = this.container.scrollHeight;
            }
        );
    }

    updatePrompt() {
        const user = this.env.get('USER') || 'user';
        const hostname = CONSTANTS.OS_NAME.toLowerCase();
        let pwd = this.env.get('PWD') || '/';
        const home = this.env.get('HOME') || '/';

        if (pwd.startsWith(home)) {
            pwd = '~' + pwd.substring(home.length);
        }

        this.promptElem.textContent = `${user}@${hostname}:${pwd}$`;
    }

    bindEvents() {
        this.inputArea.addEventListener('keydown', async (e) => {
            if (e.key === 'Enter') {
                const val = this.inputArea.value;
                this.inputArea.value = '';

                // Echo prompt and command
                const echoLine = document.createElement('div');
                echoLine.className = 'term-line';
                echoLine.innerHTML = `<span class="term-prompt">${this.promptElem.textContent}</span> ${Utils.escapeHTML(val)}`;
                this.outputArea.appendChild(echoLine);

                this.history.add(val);

                // Lock input during execution
                this.inputArea.disabled = true;

                try {
                    await this.executor.execute(val, this.stream);
                } catch (err) {
                    this.stream.writeError('Crash: ' + err.message);
                }

                this.updatePrompt();
                this.inputArea.disabled = false;
                this.inputArea.focus();
                this.container.scrollTop = this.container.scrollHeight;
            }
            else if (e.key === 'ArrowUp') {
                e.preventDefault();
                this.inputArea.value = this.history.getPrevious();
            }
            else if (e.key === 'ArrowDown') {
                e.preventDefault();
                this.inputArea.value = this.history.getNext();
            }
            else if (e.key === 'c' && e.ctrlKey) {
                // Basic SIGINT simulation
                this.inputArea.value += '^C';
                const eFn = new KeyboardEvent('keydown', { key: 'Enter' });
                this.inputArea.dispatchEvent(eFn);
            }
            else if (e.key === 'l' && e.ctrlKey) {
                e.preventDefault();
                this.outputArea.innerHTML = '';
            }
        });

        EventBus.on('env:pwd:changed', () => this.updatePrompt());
    }

    destroy() {
        // Cleanup if necessary
    }
}

window.TerminalApp = TerminalApp;
