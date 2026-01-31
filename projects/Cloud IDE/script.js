/**
 * CLOUD IDE ENGINE (Professional Edition)
 * Features:
 * 1. Virtual File System (Linked List/Tree)
 * 2. Custom Regex Lexer for JS/HTML/CSS
 * 3. Observer Pattern for State Management
 * 4. Command Palette Logic
 * * @author saiusesgithub
 * @version 2.0.0
 */

/* =========================================
   1. CORE UTILITIES
   ========================================= */

const Utils = {
    uuid: () => 'id-' + Math.random().toString(36).substr(2, 9),
    
    escapeHtml: (unsafe) => {
        return unsafe
             .replace(/&/g, "&amp;")
             .replace(/</g, "&lt;")
             .replace(/>/g, "&gt;")
             .replace(/"/g, "&quot;")
             .replace(/'/g, "&#039;");
    },

    debounce: (func, wait) => {
        let timeout;
        return function(...args) {
            clearTimeout(timeout);
            timeout = setTimeout(() => func.apply(this, args), wait);
        };
    }
};

/* =========================================
   2. VIRTUAL FILE SYSTEM (VFS)
   ========================================= */

class FileNode {
    constructor(name, type, parent = null, content = "") {
        this.id = Utils.uuid();
        this.name = name;
        this.type = type; // 'file' or 'folder'
        this.parent = parent;
        this.content = content;
        this.children = [];
        this.isOpen = false;
        this.language = this.detectLanguage(name);
    }

    detectLanguage(name) {
        if (name.endsWith('.js')) return 'javascript';
        if (name.endsWith('.html')) return 'html';
        if (name.endsWith('.css')) return 'css';
        if (name.endsWith('.json')) return 'json';
        return 'plaintext';
    }
}

class VirtualFileSystem {
    constructor() {
        this.root = new FileNode('root', 'folder');
        this.initDefaultFiles();
    }

    initDefaultFiles() {
        // Build initial project structure
        const src = this.createFolder('src', this.root);
        const components = this.createFolder('components', src);
        const styles = this.createFolder('styles', this.root);
        
        this.createFile('index.html', this.root, 
`<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Cloud IDE App</title>
    <link rel="stylesheet" href="styles/main.css">
</head>
<body>
    <div id="root"></div>
    <script src="src/index.js"></script>
</body>
</html>`);

        this.createFile('main.css', styles, 
`:root {
    --primary: #007acc;
    --bg: #1e1e1e;
}

body {
    background: var(--bg);
    color: white;
    font-family: 'Segoe UI', sans-serif;
    margin: 0;
}

.container {
    max-width: 1200px;
    margin: 0 auto;
    padding: 2rem;
}`);

        this.createFile('index.js', src, 
`/**
 * Application Entry Point
 */
import { App } from './components/App';

const root = document.getElementById('root');
const app = new App();

// Initialize Render Loop
app.mount(root);

console.log('App started successfully');`);

        this.createFile('App.js', components, 
`export class App {
    constructor() {
        this.state = { 
            count: 0,
            title: "Hello World" 
        };
    }

    mount(parent) {
        this.parent = parent;
        this.render();
    }

    render() {
        this.parent.innerHTML = \`
            <h1>\${this.state.title}</h1>
            <button>Count: \${this.state.count}</button>
        \`;
    }
}`);
        
        // Open the src folder by default
        src.isOpen = true;
    }

    createFolder(name, parent) {
        const folder = new FileNode(name, 'folder', parent);
        parent.children.push(folder);
        this.sortChildren(parent);
        return folder;
    }

    createFile(name, parent, content = "") {
        const file = new FileNode(name, 'file', parent, content);
        parent.children.push(file);
        this.sortChildren(parent);
        return file;
    }

    sortChildren(folder) {
        folder.children.sort((a, b) => {
            if (a.type === b.type) return a.name.localeCompare(b.name);
            return a.type === 'folder' ? -1 : 1;
        });
    }

    findFile(id, node = this.root) {
        if (node.id === id) return node;
        if (node.children) {
            for (let child of node.children) {
                const found = this.findFile(id, child);
                if (found) return found;
            }
        }
        return null;
    }
}

/* =========================================
   3. LEXER & SYNTAX HIGHLIGHTER
   ========================================= */

class Lexer {
    constructor() {
        // Regex rules optimized for performance
        this.rules = {
            javascript: [
                { type: 'comment', regex: /\/\/.*|\/\*[\s\S]*?\*\//g },
                { type: 'string', regex: /"([^"\\]|\\.)*"|'([^'\\]|\\.)*'|`([^`\\]|\\.)*`/g },
                { type: 'keyword', regex: /\b(const|let|var|if|else|for|while|return|function|class|extends|import|export|from|new|this|async|await|try|catch|default|case|switch)\b/g },
                { type: 'function', regex: /\b[a-zA-Z_]\w*(?=\()/g },
                { type: 'number', regex: /\b\d+(\.\d+)?\b/g },
                { type: 'class', regex: /\b[A-Z][a-zA-Z0-9_]*\b/g },
                { type: 'operator', regex: /[+\-*/%=&|<>!]+/g },
                { type: 'variable', regex: /\b[a-zA-Z_]\w*\b/g } // Fallback
            ],
            html: [
                { type: 'comment', regex: /<!--[\s\S]*?-->/g },
                { type: 'tag', regex: /<\/?[a-zA-Z0-9]+(?=[\s>])/g },
                { type: 'string', regex: /".*?"|'.*?'/g },
                { type: 'attr', regex: /[a-zA-Z-]+(?==)/g },
            ],
            css: [
                { type: 'comment', regex: /\/\*[\s\S]*?\*\//g },
                { type: 'class', regex: /\.[\w-]+/g },
                { type: 'function', regex: /#[\w]+/g }, // ID selector
                { type: 'keyword', regex: /@[\w]+/g },  // At-rules
                { type: 'attr', regex: /[\w-]+(?=:)/g }, // Property
                { type: 'string', regex: /:.*?(?=;)/g }, // Value
            ]
        };
    }

    tokenize(code, language) {
        if (!this.rules[language]) return Utils.escapeHtml(code);
        
        const tokens = [];
        let placeholderCode = code;
        
        // 1. Token Extraction (Masking)
        // We replace matches with __TOKEN_ID__ to prevent recursive matching issues
        this.rules[language].forEach(rule => {
            placeholderCode = placeholderCode.replace(rule.regex, (match) => {
                const id = `__T${tokens.length}__`;
                tokens.push({ id, type: rule.type, value: match });
                return id;
            });
        });

        // 2. Escape HTML special chars in the non-token parts
        placeholderCode = Utils.escapeHtml(placeholderCode);

        // 3. Restoration (Unmasking) with Span wrappers
        tokens.forEach(token => {
            const span = `<span class="token-${token.type}">${Utils.escapeHtml(token.value)}</span>`;
            placeholderCode = placeholderCode.replace(token.id, span);
        });

        return placeholderCode;
    }
}

/* =========================================
   4. EDITOR ENGINE & UI CONTROLLER
   ========================================= */

class EditorEngine {
    constructor(vfs, lexer) {
        this.vfs = vfs;
        this.lexer = lexer;
        this.tabs = [];
        this.activeFile = null;

        this.elements = {
            input: document.getElementById('code-input'),
            output: document.getElementById('code-content'),
            gutter: document.getElementById('line-numbers'),
            tabContainer: document.getElementById('tabs-header'),
            explorer: document.getElementById('file-explorer-root'),
            breadcrumbs: document.getElementById('breadcrumbs-bar'),
            statusBar: {
                lang: document.getElementById('lang-mode'),
                cursor: document.getElementById('cursor-pos')
            }
        };

        this.bindEvents();
    }

    bindEvents() {
        // Sync Textarea -> Pre
        this.elements.input.addEventListener('input', () => {
            if (this.activeFile) {
                this.activeFile.content = this.elements.input.value;
                this.renderHighlighting();
                this.updateGutter();
                this.markDirty(this.activeFile.id, true);
            }
        });

        // Sync Scroll
        this.elements.input.addEventListener('scroll', () => {
            this.elements.output.parentElement.scrollTop = this.elements.input.scrollTop;
            this.elements.output.parentElement.scrollLeft = this.elements.input.scrollLeft;
            this.elements.gutter.scrollTop = this.elements.input.scrollTop;
        });

        // Handle Tab Key
        this.elements.input.addEventListener('keydown', (e) => {
            if (e.key === 'Tab') {
                e.preventDefault();
                const start = this.elements.input.selectionStart;
                const end = this.elements.input.selectionEnd;
                const val = this.elements.input.value;
                this.elements.input.value = val.substring(0, start) + "    " + val.substring(end);
                this.elements.input.selectionStart = this.elements.input.selectionEnd = start + 4;
                this.renderHighlighting();
            }
        });

        // Cursor Position
        ['keyup', 'click'].forEach(evt => 
            this.elements.input.addEventListener(evt, () => this.updateCursor())
        );
    }

    openFile(id) {
        const file = this.vfs.findFile(id);
        if (!file || file.type !== 'file') return;

        if (!this.tabs.includes(id)) {
            this.tabs.push(id);
            this.renderTabs();
        }
        this.setActiveFile(file);
    }

    setActiveFile(file) {
        this.activeFile = file;
        this.elements.input.value = file.content;
        this.elements.statusBar.lang.innerText = file.language.toUpperCase();
        
        this.renderHighlighting();
        this.updateGutter();
        this.renderTabs();
        this.updateBreadcrumbs(file);
    }

    closeFile(id, e) {
        if(e) e.stopPropagation();
        this.tabs = this.tabs.filter(t => t !== id);
        
        if (this.activeFile && this.activeFile.id === id) {
            this.activeFile = null;
            this.elements.input.value = "";
            this.elements.output.innerHTML = "";
            
            if (this.tabs.length > 0) {
                this.openFile(this.tabs[this.tabs.length - 1]);
            }
        }
        this.renderTabs();
    }

    renderHighlighting() {
        if (!this.activeFile) return;
        const code = this.elements.input.value;
        const highlighted = this.lexer.tokenize(code, this.activeFile.language);
        this.elements.output.innerHTML = highlighted + '<br>'; // Trailing newline fix
    }

    updateGutter() {
        const lineCount = this.elements.input.value.split('\n').length;
        this.elements.gutter.innerHTML = Array(lineCount)
            .fill(0)
            .map((_, i) => `<div class="line-num">${i + 1}</div>`)
            .join('');
    }

    updateCursor() {
        const val = this.elements.input.value;
        const sel = this.elements.input.selectionStart;
        const lines = val.substr(0, sel).split('\n');
        const line = lines.length;
        const col = lines[lines.length - 1].length + 1;
        this.elements.statusBar.cursor.innerText = `Ln ${line}, Col ${col}`;
    }

    markDirty(id, isDirty) {
        const tab = document.querySelector(`.tab[data-id="${id}"]`);
        if (tab) isDirty ? tab.classList.add('dirty') : tab.classList.remove('dirty');
    }

    /* --- RENDERING UI --- */

    renderTabs() {
        this.elements.tabContainer.innerHTML = '';
        this.tabs.forEach(id => {
            const file = this.vfs.findFile(id);
            const div = document.createElement('div');
            div.className = `tab ${this.activeFile && this.activeFile.id === id ? 'active' : ''}`;
            div.dataset.id = id;
            
            let icon = 'ri-file-text-line';
            if (file.name.endsWith('.js')) icon = 'ri-javascript-fill token-function';
            if (file.name.endsWith('.html')) icon = 'ri-html5-fill token-string';
            if (file.name.endsWith('.css')) icon = 'ri-css3-fill token-attr';

            div.innerHTML = `
                <i class="${icon} tab-icon"></i>
                ${file.name}
                <span class="tab-close" onclick="app.editor.closeFile('${id}', event)">
                    <i class="ri-close-line"></i>
                </span>
            `;
            div.onclick = () => this.openFile(id);
            this.elements.tabContainer.appendChild(div);
        });
    }

    renderExplorer() {
        const renderNode = (node, level) => {
            const div = document.createElement('div');
            div.style.paddingLeft = `${level * 12 + 10}px`;
            div.className = `tree-node ${this.activeFile && this.activeFile.id === node.id ? 'focus' : ''}`;
            
            // Icons
            let iconClass = 'ri-file-line';
            if (node.type === 'folder') iconClass = node.isOpen ? 'ri-folder-open-fill' : 'ri-folder-fill';
            else if (node.name.endsWith('.js')) iconClass = 'ri-javascript-fill token-function';
            else if (node.name.endsWith('.html')) iconClass = 'ri-html5-fill token-string';
            else if (node.name.endsWith('.css')) iconClass = 'ri-css3-fill token-attr';

            const arrow = node.type === 'folder' 
                ? `<i class="ri-arrow-right-s-line tree-arrow ${node.isOpen ? 'rotated' : ''}"></i>` 
                : `<span class="tree-indent"></span>`;

            div.innerHTML = `${arrow} <i class="${iconClass} tree-icon"></i> ${node.name}`;
            
            div.onclick = (e) => {
                if (node.type === 'folder') {
                    node.isOpen = !node.isOpen;
                    this.renderExplorer();
                } else {
                    this.openFile(node.id);
                    this.renderExplorer(); // Re-render for focus state
                }
            };
            this.elements.explorer.appendChild(div);

            if (node.type === 'folder' && node.isOpen) {
                node.children.forEach(child => renderNode(child, level + 1));
            }
        };

        this.elements.explorer.innerHTML = '';
        this.vfs.root.children.forEach(child => renderNode(child, 0));
    }

    updateBreadcrumbs(file) {
        const path = [];
        let curr = file;
        while(curr.parent && curr.parent.name !== 'root') {
            path.unshift(curr.name);
            curr = curr.parent;
        }
        path.unshift(curr.name);
        
        this.elements.breadcrumbs.innerHTML = path.map((p, i) => `
            ${i > 0 ? '<i class="ri-arrow-right-s-line"></i>' : ''}
            <span>${p}</span>
        `).join('');
    }
}

/* =========================================
   5. APP CONTROLLER
   ========================================= */

class App {
    constructor() {
        this.vfs = new VirtualFileSystem();
        this.lexer = new Lexer();
        this.editor = new EditorEngine(this.vfs, this.lexer);
        
        this.init();
    }

    init() {
        this.editor.renderExplorer();
        
        // Open default file
        const src = this.vfs.root.children.find(c => c.name === 'src');
        if (src) {
            const main = src.children.find(f => f.name === 'index.js');
            if (main) this.editor.openFile(main.id);
        }

        this.bindGlobalKeys();
        this.setupPalette();
    }

    bindGlobalKeys() {
        window.addEventListener('keydown', (e) => {
            // Ctrl+P / Cmd+P
            if ((e.ctrlKey || e.metaKey) && e.key === 'p') {
                e.preventDefault();
                this.togglePalette();
            }
            // Ctrl+S
            if ((e.ctrlKey || e.metaKey) && e.key === 's') {
                e.preventDefault();
                this.save();
            }
        });
    }

    save() {
        if (this.editor.activeFile) {
            this.editor.markDirty(this.editor.activeFile.id, false);
            // Simulate saving delay
            const status = document.querySelector('.status-right .status-item:last-child i');
            status.className = 'ri-loader-4-line blink';
            setTimeout(() => status.className = 'ri-notification-3-fill', 500);
        }
    }

    togglePalette() {
        const modal = document.getElementById('command-palette');
        const input = document.getElementById('command-input');
        
        if (modal.classList.contains('hidden')) {
            modal.classList.remove('hidden');
            input.value = '';
            input.focus();
            this.renderCommands('');
        } else {
            modal.classList.add('hidden');
        }
    }

    setupPalette() {
        const commands = [
            { name: 'File: Save', shortcut: 'Ctrl+S', action: () => this.save() },
            { name: 'View: Toggle Sidebar', shortcut: 'Ctrl+B', action: () => document.getElementById('sidebar-panel').classList.toggle('hidden') },
            { name: 'Editor: Close All', shortcut: '', action: () => { this.editor.tabs = []; this.editor.renderTabs(); this.editor.activeFile=null; this.editor.elements.input.value=''; this.editor.elements.output.innerHTML=''; } },
            { name: 'Terminal: New Terminal', shortcut: 'Ctrl+Shift+`', action: () => alert('New Terminal session started.') },
            { name: 'Debug: Start Debugging', shortcut: 'F5', action: () => alert('Debugger attached.') },
        ];

        const list = document.getElementById('command-list');
        const input = document.getElementById('command-input');

        this.renderCommands = (filter) => {
            list.innerHTML = '';
            const filtered = commands.filter(c => c.name.toLowerCase().includes(filter.toLowerCase()));
            
            filtered.forEach((cmd, i) => {
                const div = document.createElement('div');
                div.className = `command-item ${i === 0 ? 'selected' : ''}`;
                div.innerHTML = `<span>${cmd.name}</span> <span class="command-shortcut">${cmd.shortcut}</span>`;
                div.onclick = () => {
                    cmd.action();
                    this.togglePalette();
                };
                list.appendChild(div);
            });
        };

        input.addEventListener('input', (e) => this.renderCommands(e.target.value));
        
        // Close on click outside
        document.getElementById('command-palette').addEventListener('click', (e) => {
            if (e.target.id === 'command-palette') this.togglePalette();
        });
    }
}

// Start App
window.app = new App();