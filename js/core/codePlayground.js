/**
 * Code Playground - Interactive Code Editor with Live Preview
 * Features: Monaco Editor, Split-pane, Fork/Save, Share, Console, Download
 */

class CodePlayground {
    constructor() {
        this.isOpen = false;
        this.currentProject = null;
        this.editors = { html: null, css: null, js: null };
        this.activeTab = 'html';
        this.experiments = this.loadExperiments();
        this.originalCode = { html: '', css: '', js: '' };
        this.monacoLoaded = false;
        this.consoleMessages = [];
        this.collaborationEnabled = false;
        this.roomCode = null;

        // Template presets
        this.templates = {
            blank: {
                name: 'Blank',
                html: '<!DOCTYPE html>\n<html>\n<head>\n  <title>My Project</title>\n</head>\n<body>\n  <h1>Hello World!</h1>\n</body>\n</html>',
                css: '/* Add your styles here */\nbody {\n  font-family: system-ui, sans-serif;\n  padding: 20px;\n}',
                js: '// Add your JavaScript here\nconsole.log("Hello from the playground!");'
            },
            counter: {
                name: 'Counter App',
                html: '<!DOCTYPE html>\n<html>\n<head>\n  <title>Counter</title>\n</head>\n<body>\n  <div class="counter-container">\n    <h1>Counter: <span id="count">0</span></h1>\n    <button onclick="decrement()">-</button>\n    <button onclick="increment()">+</button>\n    <button onclick="reset()">Reset</button>\n  </div>\n</body>\n</html>',
                css: '.counter-container {\n  text-align: center;\n  padding: 40px;\n}\n\nbutton {\n  font-size: 20px;\n  padding: 10px 20px;\n  margin: 5px;\n  cursor: pointer;\n  border-radius: 8px;\n  border: none;\n  background: #007bff;\n  color: white;\n}\n\nbutton:hover {\n  background: #0056b3;\n}',
                js: 'let count = 0;\n\nfunction increment() {\n  count++;\n  updateDisplay();\n}\n\nfunction decrement() {\n  count--;\n  updateDisplay();\n}\n\nfunction reset() {\n  count = 0;\n  updateDisplay();\n}\n\nfunction updateDisplay() {\n  document.getElementById("count").textContent = count;\n}'
            },
            todoList: {
                name: 'Todo List',
                html: '<!DOCTYPE html>\n<html>\n<head>\n  <title>Todo List</title>\n</head>\n<body>\n  <div class="todo-app">\n    <h1>📝 Todo List</h1>\n    <div class="input-container">\n      <input type="text" id="todoInput" placeholder="Add a task...">\n      <button onclick="addTodo()">Add</button>\n    </div>\n    <ul id="todoList"></ul>\n  </div>\n</body>\n</html>',
                css: '.todo-app {\n  max-width: 400px;\n  margin: 40px auto;\n  font-family: system-ui, sans-serif;\n}\n\n.input-container {\n  display: flex;\n  gap: 10px;\n  margin-bottom: 20px;\n}\n\ninput {\n  flex: 1;\n  padding: 12px;\n  border: 2px solid #ddd;\n  border-radius: 8px;\n  font-size: 16px;\n}\n\nbutton {\n  padding: 12px 24px;\n  background: #28a745;\n  color: white;\n  border: none;\n  border-radius: 8px;\n  cursor: pointer;\n}\n\nul {\n  list-style: none;\n  padding: 0;\n}\n\nli {\n  padding: 12px;\n  background: #f8f9fa;\n  margin-bottom: 8px;\n  border-radius: 8px;\n  display: flex;\n  justify-content: space-between;\n}\n\nli.done {\n  text-decoration: line-through;\n  opacity: 0.6;\n}',
                js: 'const todos = [];\n\nfunction addTodo() {\n  const input = document.getElementById("todoInput");\n  const text = input.value.trim();\n  if (text) {\n    todos.push({ text, done: false });\n    input.value = "";\n    renderTodos();\n  }\n}\n\nfunction toggleTodo(index) {\n  todos[index].done = !todos[index].done;\n  renderTodos();\n}\n\nfunction deleteTodo(index) {\n  todos.splice(index, 1);\n  renderTodos();\n}\n\nfunction renderTodos() {\n  const list = document.getElementById("todoList");\n  list.innerHTML = todos.map((todo, i) => `\n    <li class="${todo.done ? "done" : ""}">\n      <span onclick="toggleTodo(${i})">${todo.text}</span>\n      <button onclick="deleteTodo(${i})">×</button>\n    </li>\n  `).join("");\n}\n\ndocument.getElementById("todoInput").addEventListener("keypress", (e) => {\n  if (e.key === "Enter") addTodo();\n});'
            },
            animation: {
                name: 'CSS Animation',
                html: '<!DOCTYPE html>\n<html>\n<head>\n  <title>Animation Demo</title>\n</head>\n<body>\n  <div class="container">\n    <div class="box"></div>\n    <p>Hover over the box!</p>\n  </div>\n</body>\n</html>',
                css: '.container {\n  display: flex;\n  flex-direction: column;\n  align-items: center;\n  justify-content: center;\n  height: 100vh;\n  gap: 20px;\n}\n\n.box {\n  width: 100px;\n  height: 100px;\n  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);\n  border-radius: 16px;\n  transition: all 0.3s ease;\n  cursor: pointer;\n}\n\n.box:hover {\n  transform: scale(1.2) rotate(45deg);\n  box-shadow: 0 20px 40px rgba(102, 126, 234, 0.4);\n}\n\np {\n  font-family: system-ui, sans-serif;\n  color: #666;\n}',
                js: '// Add click animation\nconst box = document.querySelector(".box");\n\nbox.addEventListener("click", () => {\n  box.style.animation = "pulse 0.5s ease";\n  setTimeout(() => {\n    box.style.animation = "";\n  }, 500);\n});\n\n// Add keyframes dynamically\nconst style = document.createElement("style");\nstyle.textContent = `\n  @keyframes pulse {\n    0%, 100% { transform: scale(1); }\n    50% { transform: scale(1.3); }\n  }\n`;\ndocument.head.appendChild(style);'
            }
        };

        this.init();
    }

    init() {
        this.createPlaygroundDOM();
        this.attachEventListeners();
        this.loadMonaco();
    }

    createPlaygroundDOM() {
        if (document.getElementById('code-playground')) return;

        const playground = document.createElement('div');
        playground.id = 'code-playground';
        playground.className = 'code-playground';
        playground.innerHTML = `
            <div class="playground-overlay"></div>
            <div class="playground-container">
                <div class="playground-header">
                    <div class="playground-title">
                        <i class="ri-code-s-slash-line"></i>
                        <span id="playground-project-name">Code Playground</span>
                    </div>
                    <div class="playground-actions">
                        <button class="playground-btn" id="btn-template" title="Templates">
                            <i class="ri-file-copy-line"></i> Templates
                        </button>
                        <button class="playground-btn" id="btn-fork" title="Fork & Save">
                            <i class="ri-git-branch-line"></i> Fork
                        </button>
                        <button class="playground-btn" id="btn-experiments" title="My Experiments">
                            <i class="ri-folder-open-line"></i> My Experiments
                        </button>
                        <button class="playground-btn" id="btn-share" title="Share">
                            <i class="ri-share-line"></i> Share
                        </button>
                        <button class="playground-btn" id="btn-download" title="Download ZIP">
                            <i class="ri-download-line"></i>
                        </button>
                        <button class="playground-btn" id="btn-diff" title="Compare with Original">
                            <i class="ri-git-commit-line"></i>
                        </button>
                        <button class="playground-btn-close" id="btn-close-playground" title="Close">
                            <i class="ri-close-line"></i>
                        </button>
                    </div>
                </div>

                <div class="playground-body">
                    <div class="playground-editor-pane">
                        <div class="editor-tabs">
                            <button class="editor-tab active" data-tab="html">
                                <i class="ri-html5-fill"></i> HTML
                            </button>
                            <button class="editor-tab" data-tab="css">
                                <i class="ri-css3-fill"></i> CSS
                            </button>
                            <button class="editor-tab" data-tab="js">
                                <i class="ri-javascript-fill"></i> JS
                            </button>
                        </div>
                        <div class="editor-container">
                            <div id="editor-html" class="editor-panel active"></div>
                            <div id="editor-css" class="editor-panel"></div>
                            <div id="editor-js" class="editor-panel"></div>
                        </div>
                        <div class="console-panel" id="console-panel">
                            <div class="console-header">
                                <span><i class="ri-terminal-line"></i> Console</span>
                                <button id="btn-clear-console" title="Clear Console">
                                    <i class="ri-delete-bin-line"></i>
                                </button>
                            </div>
                            <div class="console-output" id="console-output"></div>
                        </div>
                    </div>

                    <div class="playground-resizer"></div>

                    <div class="playground-preview-pane">
                        <div class="preview-header">
                            <span><i class="ri-eye-line"></i> Live Preview</span>
                            <button id="btn-refresh-preview" title="Refresh Preview">
                                <i class="ri-refresh-line"></i>
                            </button>
                        </div>
                        <iframe id="preview-frame" sandbox="allow-scripts allow-modals"></iframe>
                    </div>
                </div>

                <div class="playground-footer">
                    <div class="playground-status">
                        <span id="playground-status-text">Ready</span>
                    </div>
                    <div class="playground-shortcuts">
                        <span><kbd>Ctrl+S</kbd> Run</span>
                        <span><kbd>Ctrl+Shift+S</kbd> Fork</span>
                    </div>
                </div>
            </div>

            <!-- Templates Modal -->
            <div class="playground-modal" id="templates-modal">
                <div class="modal-content">
                    <div class="modal-header">
                        <h3><i class="ri-file-copy-line"></i> Choose a Template</h3>
                        <button class="modal-close"><i class="ri-close-line"></i></button>
                    </div>
                    <div class="modal-body">
                        <div class="template-grid" id="template-grid"></div>
                    </div>
                </div>
            </div>

            <!-- Experiments Modal -->
            <div class="playground-modal" id="experiments-modal">
                <div class="modal-content">
                    <div class="modal-header">
                        <h3><i class="ri-folder-open-line"></i> My Experiments</h3>
                        <button class="modal-close"><i class="ri-close-line"></i></button>
                    </div>
                    <div class="modal-body">
                        <div class="experiments-list" id="experiments-list"></div>
                    </div>
                </div>
            </div>

            <!-- Fork Modal -->
            <div class="playground-modal" id="fork-modal">
                <div class="modal-content modal-small">
                    <div class="modal-header">
                        <h3><i class="ri-git-branch-line"></i> Fork & Save</h3>
                        <button class="modal-close"><i class="ri-close-line"></i></button>
                    </div>
                    <div class="modal-body">
                        <label for="fork-name">Experiment Name</label>
                        <input type="text" id="fork-name" placeholder="My Awesome Experiment">
                        <button class="btn-primary" id="btn-save-fork">
                            <i class="ri-save-line"></i> Save
                        </button>
                    </div>
                </div>
            </div>

            <!-- Share Modal -->
            <div class="playground-modal" id="share-modal">
                <div class="modal-content modal-small">
                    <div class="modal-header">
                        <h3><i class="ri-share-line"></i> Share Your Code</h3>
                        <button class="modal-close"><i class="ri-close-line"></i></button>
                    </div>
                    <div class="modal-body">
                        <label>Shareable URL</label>
                        <div class="share-url-container">
                            <input type="text" id="share-url" readonly>
                            <button id="btn-copy-url" title="Copy URL">
                                <i class="ri-clipboard-line"></i>
                            </button>
                        </div>
                        <p class="share-note">Anyone with this link can view and fork your code.</p>
                    </div>
                </div>
            </div>

            <!-- Diff Modal -->
            <div class="playground-modal" id="diff-modal">
                <div class="modal-content modal-large">
                    <div class="modal-header">
                        <h3><i class="ri-git-commit-line"></i> Compare with Original</h3>
                        <button class="modal-close"><i class="ri-close-line"></i></button>
                    </div>
                    <div class="modal-body">
                        <div class="diff-tabs">
                            <button class="diff-tab active" data-diff="html">HTML</button>
                            <button class="diff-tab" data-diff="css">CSS</button>
                            <button class="diff-tab" data-diff="js">JS</button>
                        </div>
                        <div class="diff-container" id="diff-container"></div>
                    </div>
                </div>
            </div>
        `;

        document.body.appendChild(playground);
        this.playground = playground;
        this.previewFrame = document.getElementById('preview-frame');
        this.overlay = playground.querySelector('.playground-overlay');
    }

    async loadMonaco() {
        if (this.monacoLoaded || window.monaco) {
            this.monacoLoaded = true;
            return;
        }

        // Load Monaco Editor from CDN
        const script = document.createElement('script');
        script.src = 'https://cdnjs.cloudflare.com/ajax/libs/monaco-editor/0.45.0/min/vs/loader.min.js';
        script.onload = () => {
            require.config({
                paths: { vs: 'https://cdnjs.cloudflare.com/ajax/libs/monaco-editor/0.45.0/min/vs' }
            });
            require(['vs/editor/editor.main'], () => {
                this.monacoLoaded = true;
                console.log('✅ Monaco Editor loaded');
            });
        };
        document.head.appendChild(script);
    }

    initEditors() {
        if (!window.monaco) return;

        const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
        const theme = isDark ? 'vs-dark' : 'vs';

        // HTML Editor
        if (!this.editors.html) {
            this.editors.html = monaco.editor.create(document.getElementById('editor-html'), {
                value: this.originalCode.html,
                language: 'html',
                theme: theme,
                minimap: { enabled: false },
                automaticLayout: true,
                fontSize: 14,
                lineNumbers: 'on',
                scrollBeyondLastLine: false,
                wordWrap: 'on'
            });
            this.editors.html.onDidChangeModelContent(() => this.updatePreview());
        }

        // CSS Editor
        if (!this.editors.css) {
            this.editors.css = monaco.editor.create(document.getElementById('editor-css'), {
                value: this.originalCode.css,
                language: 'css',
                theme: theme,
                minimap: { enabled: false },
                automaticLayout: true,
                fontSize: 14,
                lineNumbers: 'on',
                scrollBeyondLastLine: false,
                wordWrap: 'on'
            });
            this.editors.css.onDidChangeModelContent(() => this.updatePreview());
        }

        // JS Editor
        if (!this.editors.js) {
            this.editors.js = monaco.editor.create(document.getElementById('editor-js'), {
                value: this.originalCode.js,
                language: 'javascript',
                theme: theme,
                minimap: { enabled: false },
                automaticLayout: true,
                fontSize: 14,
                lineNumbers: 'on',
                scrollBeyondLastLine: false,
                wordWrap: 'on'
            });
            this.editors.js.onDidChangeModelContent(() => this.updatePreview());
        }
    }

    attachEventListeners() {
        // Close button
        document.getElementById('btn-close-playground').addEventListener('click', () => this.close());
        this.overlay.addEventListener('click', () => this.close());

        // Tab switching
        document.querySelectorAll('.editor-tab').forEach(tab => {
            tab.addEventListener('click', (e) => this.switchTab(e.target.dataset.tab || e.target.closest('.editor-tab').dataset.tab));
        });

        // Action buttons
        document.getElementById('btn-template').addEventListener('click', () => this.showTemplates());
        document.getElementById('btn-fork').addEventListener('click', () => this.showForkModal());
        document.getElementById('btn-experiments').addEventListener('click', () => this.showExperiments());
        document.getElementById('btn-share').addEventListener('click', () => this.showShareModal());
        document.getElementById('btn-download').addEventListener('click', () => this.downloadZip());
        document.getElementById('btn-diff').addEventListener('click', () => this.showDiff());
        document.getElementById('btn-refresh-preview').addEventListener('click', () => this.updatePreview());
        document.getElementById('btn-clear-console').addEventListener('click', () => this.clearConsole());

        // Fork save
        document.getElementById('btn-save-fork').addEventListener('click', () => this.saveFork());

        // Share copy
        document.getElementById('btn-copy-url').addEventListener('click', () => this.copyShareUrl());

        // Modal closes
        document.querySelectorAll('.modal-close').forEach(btn => {
            btn.addEventListener('click', () => this.closeAllModals());
        });

        // Diff tabs
        document.querySelectorAll('.diff-tab').forEach(tab => {
            tab.addEventListener('click', (e) => this.switchDiffTab(e.target.dataset.diff));
        });

        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            if (!this.isOpen) return;

            if ((e.ctrlKey || e.metaKey) && e.key === 's' && !e.shiftKey) {
                e.preventDefault();
                this.updatePreview();
            } else if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'S') {
                e.preventDefault();
                this.showForkModal();
            } else if (e.key === 'Escape') {
                if (document.querySelector('.playground-modal.open')) {
                    this.closeAllModals();
                } else {
                    this.close();
                }
            }
        });

        // Check for shared code in URL
        this.checkSharedCode();
    }

    switchTab(tab) {
        this.activeTab = tab;

        // Update tab buttons
        document.querySelectorAll('.editor-tab').forEach(t => {
            t.classList.toggle('active', t.dataset.tab === tab);
        });

        // Update panels
        document.querySelectorAll('.editor-panel').forEach(p => {
            p.classList.toggle('active', p.id === `editor-${tab}`);
        });

        // Focus editor
        if (this.editors[tab]) {
            this.editors[tab].focus();
        }
    }

    updatePreview() {
        if (!this.editors.html || !this.editors.css || !this.editors.js) return;

        const html = this.editors.html.getValue();
        const css = this.editors.css.getValue();
        const js = this.editors.js.getValue();

        // Create preview with console capture
        const previewContent = `
            <!DOCTYPE html>
            <html>
            <head>
                <style>${css}</style>
                <script>
                    // Capture console output
                    (function() {
                        const originalLog = console.log;
                        const originalError = console.error;
                        const originalWarn = console.warn;
                        
                        function sendToParent(type, args) {
                            window.parent.postMessage({
                                type: 'console',
                                level: type,
                                message: Array.from(args).map(a => {
                                    try {
                                        return typeof a === 'object' ? JSON.stringify(a) : String(a);
                                    } catch {
                                        return String(a);
                                    }
                                }).join(' ')
                            }, '*');
                        }
                        
                        console.log = function(...args) {
                            sendToParent('log', args);
                            originalLog.apply(console, args);
                        };
                        console.error = function(...args) {
                            sendToParent('error', args);
                            originalError.apply(console, args);
                        };
                        console.warn = function(...args) {
                            sendToParent('warn', args);
                            originalWarn.apply(console, args);
                        };
                        
                        window.onerror = function(msg, url, line) {
                            sendToParent('error', ['Error: ' + msg + ' (line ' + line + ')']);
                        };
                    })();
                <\/script>
            </head>
            <body>
                ${html.replace(/<html[^>]*>|<\/html>|<head[^>]*>[\s\S]*?<\/head>|<body[^>]*>|<\/body>|<!DOCTYPE[^>]*>/gi, '')}
                <script>${js}<\/script>
            </body>
            </html>
        `;

        this.previewFrame.srcdoc = previewContent;
        this.setStatus('Preview updated');
    }

    // Console handling
    setupConsoleListener() {
        window.addEventListener('message', (e) => {
            if (e.data && e.data.type === 'console') {
                this.addConsoleMessage(e.data.level, e.data.message);
            }
        });
    }

    addConsoleMessage(level, message) {
        const output = document.getElementById('console-output');
        const msgEl = document.createElement('div');
        msgEl.className = `console-message console-${level}`;
        msgEl.innerHTML = `<span class="console-level">[${level.toUpperCase()}]</span> ${this.escapeHtml(message)}`;
        output.appendChild(msgEl);
        output.scrollTop = output.scrollHeight;
    }

    clearConsole() {
        document.getElementById('console-output').innerHTML = '';
    }

    escapeHtml(str) {
        const div = document.createElement('div');
        div.textContent = str;
        return div.innerHTML;
    }

    // Templates
    showTemplates() {
        const grid = document.getElementById('template-grid');
        grid.innerHTML = Object.entries(this.templates).map(([key, template]) => `
            <div class="template-card" data-template="${key}">
                <div class="template-icon"><i class="ri-file-code-line"></i></div>
                <div class="template-name">${template.name}</div>
            </div>
        `).join('');

        grid.querySelectorAll('.template-card').forEach(card => {
            card.addEventListener('click', () => {
                const key = card.dataset.template;
                this.loadTemplate(key);
                this.closeAllModals();
            });
        });

        document.getElementById('templates-modal').classList.add('open');
    }

    loadTemplate(key) {
        const template = this.templates[key];
        if (!template) return;

        this.originalCode = { ...template };
        if (this.editors.html) this.editors.html.setValue(template.html);
        if (this.editors.css) this.editors.css.setValue(template.css);
        if (this.editors.js) this.editors.js.setValue(template.js);

        document.getElementById('playground-project-name').textContent = template.name;
        this.setStatus(`Loaded template: ${template.name}`);
        this.updatePreview();
    }

    // Fork & Save
    showForkModal() {
        const input = document.getElementById('fork-name');
        input.value = `${this.currentProject?.title || 'Experiment'} - Fork ${Date.now()}`;
        document.getElementById('fork-modal').classList.add('open');
        input.focus();
        input.select();
    }

    saveFork() {
        const name = document.getElementById('fork-name').value.trim();
        if (!name) return;

        const experiment = {
            id: Date.now(),
            name: name,
            html: this.editors.html?.getValue() || '',
            css: this.editors.css?.getValue() || '',
            js: this.editors.js?.getValue() || '',
            originalProject: this.currentProject?.title || null,
            createdAt: new Date().toISOString()
        };

        this.experiments.push(experiment);
        this.saveExperiments();
        this.closeAllModals();
        this.setStatus(`Saved: ${name}`);
    }

    loadExperiments() {
        try {
            return JSON.parse(localStorage.getItem('codePlaygroundExperiments') || '[]');
        } catch {
            return [];
        }
    }

    saveExperiments() {
        localStorage.setItem('codePlaygroundExperiments', JSON.stringify(this.experiments));
    }

    showExperiments() {
        const list = document.getElementById('experiments-list');

        if (this.experiments.length === 0) {
            list.innerHTML = '<p class="no-experiments">No experiments saved yet. Fork some code to get started!</p>';
        } else {
            list.innerHTML = this.experiments.map(exp => `
                <div class="experiment-card" data-id="${exp.id}">
                    <div class="experiment-info">
                        <h4>${this.escapeHtml(exp.name)}</h4>
                        <span class="experiment-date">${new Date(exp.createdAt).toLocaleDateString()}</span>
                    </div>
                    <div class="experiment-actions">
                        <button class="btn-load" title="Load"><i class="ri-play-line"></i></button>
                        <button class="btn-delete" title="Delete"><i class="ri-delete-bin-line"></i></button>
                    </div>
                </div>
            `).join('');

            list.querySelectorAll('.btn-load').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    const id = parseInt(e.target.closest('.experiment-card').dataset.id);
                    this.loadExperiment(id);
                    this.closeAllModals();
                });
            });

            list.querySelectorAll('.btn-delete').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    const id = parseInt(e.target.closest('.experiment-card').dataset.id);
                    this.deleteExperiment(id);
                });
            });
        }

        document.getElementById('experiments-modal').classList.add('open');
    }

    loadExperiment(id) {
        const exp = this.experiments.find(e => e.id === id);
        if (!exp) return;

        this.originalCode = { html: exp.html, css: exp.css, js: exp.js };
        if (this.editors.html) this.editors.html.setValue(exp.html);
        if (this.editors.css) this.editors.css.setValue(exp.css);
        if (this.editors.js) this.editors.js.setValue(exp.js);

        document.getElementById('playground-project-name').textContent = exp.name;
        this.setStatus(`Loaded: ${exp.name}`);
        this.updatePreview();
    }

    deleteExperiment(id) {
        this.experiments = this.experiments.filter(e => e.id !== id);
        this.saveExperiments();
        this.showExperiments();
    }

    // Share
    showShareModal() {
        const code = {
            html: this.editors.html?.getValue() || '',
            css: this.editors.css?.getValue() || '',
            js: this.editors.js?.getValue() || ''
        };

        const encoded = btoa(encodeURIComponent(JSON.stringify(code)));
        const url = `${window.location.origin}${window.location.pathname}?playground=${encoded}`;

        document.getElementById('share-url').value = url;
        document.getElementById('share-modal').classList.add('open');
    }

    copyShareUrl() {
        const input = document.getElementById('share-url');
        input.select();
        navigator.clipboard.writeText(input.value);
        this.setStatus('URL copied to clipboard!');
    }

    checkSharedCode() {
        const params = new URLSearchParams(window.location.search);
        const playgroundData = params.get('playground');

        if (playgroundData) {
            try {
                const code = JSON.parse(decodeURIComponent(atob(playgroundData)));
                this.originalCode = code;

                // Auto-open playground with shared code
                setTimeout(() => this.open(null, code), 500);

                // Clean URL
                window.history.replaceState({}, '', window.location.pathname);
            } catch (e) {
                console.error('Failed to parse shared code:', e);
            }
        }
    }

    // Download ZIP
    async downloadZip() {
        const html = this.editors.html?.getValue() || '';
        const css = this.editors.css?.getValue() || '';
        const js = this.editors.js?.getValue() || '';

        const projectName = this.currentProject?.title || 'my-project';

        // Create full HTML file
        const fullHtml = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${projectName}</title>
    <link rel="stylesheet" href="style.css">
</head>
<body>
${html.replace(/<html[^>]*>|<\/html>|<head[^>]*>[\s\S]*?<\/head>|<body[^>]*>|<\/body>|<!DOCTYPE[^>]*>/gi, '').trim()}
    <script src="script.js"><\/script>
</body>
</html>`;

        // Use JSZip if available, otherwise create downloadable files
        if (typeof JSZip !== 'undefined') {
            const zip = new JSZip();
            zip.file('index.html', fullHtml);
            zip.file('style.css', css);
            zip.file('script.js', js);

            const content = await zip.generateAsync({ type: 'blob' });
            this.downloadBlob(content, `${projectName}.zip`);
        } else {
            // Fallback: download as single HTML with embedded CSS/JS
            const singleFile = fullHtml.replace('</head>', `<style>\n${css}\n</style>\n</head>`);
            const blob = new Blob([singleFile], { type: 'text/html' });
            this.downloadBlob(blob, `${projectName}.html`);
        }

        this.setStatus('Download started');
    }

    downloadBlob(blob, filename) {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        a.click();
        URL.revokeObjectURL(url);
    }

    // Diff View
    showDiff() {
        document.getElementById('diff-modal').classList.add('open');
        this.renderDiff('html');
    }

    switchDiffTab(type) {
        document.querySelectorAll('.diff-tab').forEach(t => {
            t.classList.toggle('active', t.dataset.diff === type);
        });
        this.renderDiff(type);
    }

    renderDiff(type) {
        const original = this.originalCode[type] || '';
        const current = this.editors[type]?.getValue() || '';
        const container = document.getElementById('diff-container');

        if (original === current) {
            container.innerHTML = '<div class="diff-same">No changes from original</div>';
            return;
        }

        // Simple line-by-line diff
        const originalLines = original.split('\n');
        const currentLines = current.split('\n');
        const maxLines = Math.max(originalLines.length, currentLines.length);

        let diffHtml = '<div class="diff-view">';
        diffHtml += '<div class="diff-column diff-original"><div class="diff-header">Original</div>';
        diffHtml += '<pre class="diff-content">';
        for (let i = 0; i < maxLines; i++) {
            const line = originalLines[i] || '';
            const isDiff = line !== currentLines[i];
            diffHtml += `<div class="diff-line ${isDiff ? 'diff-removed' : ''}">${this.escapeHtml(line) || ' '}</div>`;
        }
        diffHtml += '</pre></div>';

        diffHtml += '<div class="diff-column diff-current"><div class="diff-header">Current</div>';
        diffHtml += '<pre class="diff-content">';
        for (let i = 0; i < maxLines; i++) {
            const line = currentLines[i] || '';
            const isDiff = line !== originalLines[i];
            diffHtml += `<div class="diff-line ${isDiff ? 'diff-added' : ''}">${this.escapeHtml(line) || ' '}</div>`;
        }
        diffHtml += '</pre></div></div>';

        container.innerHTML = diffHtml;
    }

    closeAllModals() {
        document.querySelectorAll('.playground-modal').forEach(m => m.classList.remove('open'));
    }

    setStatus(text) {
        document.getElementById('playground-status-text').textContent = text;
    }

    // Main open/close
    async open(project = null, code = null) {
        this.isOpen = true;
        this.currentProject = project;
        this.playground.classList.add('open');

        // Wait for Monaco to load
        let attempts = 0;
        while (!window.monaco && attempts < 50) {
            await new Promise(r => setTimeout(r, 100));
            attempts++;
        }

        if (code) {
            this.originalCode = { ...code };
        } else if (project) {
            // Try to fetch project source code
            this.originalCode = await this.fetchProjectCode(project);
        } else {
            this.originalCode = { ...this.templates.blank };
        }

        document.getElementById('playground-project-name').textContent = 
            project?.title || (code ? 'Shared Code' : 'New Playground');

        this.initEditors();
        this.setupConsoleListener();

        // Set initial values
        if (this.editors.html) this.editors.html.setValue(this.originalCode.html);
        if (this.editors.css) this.editors.css.setValue(this.originalCode.css);
        if (this.editors.js) this.editors.js.setValue(this.originalCode.js);

        this.updatePreview();
        this.setStatus('Ready');
    }

    async fetchProjectCode(project) {
        // Default code template for projects
        const defaultCode = {
            html: `<!DOCTYPE html>\n<html>\n<head>\n  <title>${project.title}</title>\n</head>\n<body>\n  <h1>${project.title}</h1>\n  <p>${project.description || 'Start coding!'}</p>\n</body>\n</html>`,
            css: `/* Styles for ${project.title} */\nbody {\n  font-family: system-ui, sans-serif;\n  padding: 20px;\n  max-width: 800px;\n  margin: 0 auto;\n}`,
            js: `// JavaScript for ${project.title}\nconsole.log("Project loaded: ${project.title}");`
        };

        try {
            // Try to fetch actual project files
            const basePath = project.link?.replace('/index.html', '').replace('./', '');
            if (basePath) {
                const [htmlRes, cssRes, jsRes] = await Promise.allSettled([
                    fetch(`${basePath}/index.html`).then(r => r.ok ? r.text() : null),
                    fetch(`${basePath}/style.css`).then(r => r.ok ? r.text() : null).catch(() => null),
                    fetch(`${basePath}/script.js`).then(r => r.ok ? r.text() : null).catch(() => null)
                ]);

                return {
                    html: htmlRes.status === 'fulfilled' && htmlRes.value ? htmlRes.value : defaultCode.html,
                    css: cssRes.status === 'fulfilled' && cssRes.value ? cssRes.value : defaultCode.css,
                    js: jsRes.status === 'fulfilled' && jsRes.value ? jsRes.value : defaultCode.js
                };
            }
        } catch (e) {
            console.log('Using default template for project');
        }

        return defaultCode;
    }

    close() {
        this.isOpen = false;
        this.playground.classList.remove('open');
        this.closeAllModals();
    }
}

// Export singleton instance
const codePlayground = new CodePlayground();
export { codePlayground, CodePlayground };
