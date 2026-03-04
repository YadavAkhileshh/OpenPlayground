// ===============================
// Sandbox Engine for OpenPlayground
// Feature #1334: Project Playground Sandbox & Live Preview
// ===============================

class SandboxEngine {
    constructor() {
        this.currentProject = null;
        this.previewSize = '50%';
        this.previewMode = 'desktop'; // desktop, tablet, phone
        this.history = [];
        this.historyIndex = -1;
        this.maxHistorySize = 50;
        this.forkedProjects = this.loadForkedProjects();
        this.isOpen = false;

        this.deviceSizes = {
            phone: { width: 375, height: 667, label: 'iPhone SE' },
            tablet: { width: 768, height: 1024, label: 'iPad' },
            desktop: { width: '100%', height: '100%', label: 'Desktop' }
        };

        this.panelSizes = ['25%', '50%', '75%', '100%'];

        this.init();
    }

    init() {
        this.createSandboxPanel();
        this.setupKeyboardShortcuts();
        this.setupResizeObserver();
    }

    // ===============================
    // Panel Creation
    // ===============================

    createSandboxPanel() {
        // Remove existing panel if any
        document.getElementById('sandbox-panel')?.remove();

        const panel = document.createElement('div');
        panel.id = 'sandbox-panel';
        panel.className = 'sandbox-panel';
        panel.innerHTML = this.getPanelHTML();

        document.body.appendChild(panel);
        this.panel = panel;
        this.attachPanelEvents();
    }

    getPanelHTML() {
        return `
            <div class="sandbox-overlay" onclick="window.sandboxEngine.close()"></div>
            <div class="sandbox-container" style="width: ${this.previewSize}">
                <div class="sandbox-header">
                    <div class="sandbox-title">
                        <i class="ri-code-box-line"></i>
                        <span id="sandbox-project-title">Project Preview</span>
                        <span class="sandbox-badge">Sandbox</span>
                    </div>
                    <div class="sandbox-controls">
                        <!-- Size Controls -->
                        <div class="sandbox-size-controls">
                            <button class="size-btn" data-size="25%" title="25% width">
                                <i class="ri-layout-column-line"></i>
                            </button>
                            <button class="size-btn active" data-size="50%" title="50% width">
                                <i class="ri-layout-2-line"></i>
                            </button>
                            <button class="size-btn" data-size="75%" title="75% width">
                                <i class="ri-layout-right-2-line"></i>
                            </button>
                            <button class="size-btn" data-size="100%" title="Fullscreen">
                                <i class="ri-fullscreen-line"></i>
                            </button>
                        </div>
                        
                        <div class="sandbox-divider"></div>
                        
                        <!-- Device Preview -->
                        <div class="sandbox-device-controls">
                            <button class="device-btn" data-device="phone" title="Phone View">
                                <i class="ri-smartphone-line"></i>
                            </button>
                            <button class="device-btn" data-device="tablet" title="Tablet View">
                                <i class="ri-tablet-line"></i>
                            </button>
                            <button class="device-btn active" data-device="desktop" title="Desktop View">
                                <i class="ri-computer-line"></i>
                            </button>
                        </div>
                        
                        <div class="sandbox-divider"></div>
                        
                        <!-- Actions -->
                        <div class="sandbox-actions">
                            <button class="action-btn" id="sandbox-refresh-btn" title="Refresh Preview (Ctrl+Enter)">
                                <i class="ri-refresh-line"></i>
                            </button>
                            <button class="action-btn" id="sandbox-undo-btn" title="Undo (Ctrl+Z)" disabled>
                                <i class="ri-arrow-go-back-line"></i>
                            </button>
                            <button class="action-btn" id="sandbox-redo-btn" title="Redo (Ctrl+Y)" disabled>
                                <i class="ri-arrow-go-forward-line"></i>
                            </button>
                            <button class="action-btn" id="sandbox-fork-btn" title="Fork & Edit">
                                <i class="ri-git-branch-line"></i>
                            </button>
                            <button class="action-btn" id="sandbox-export-btn" title="Export as ZIP">
                                <i class="ri-download-2-line"></i>
                            </button>
                            <button class="action-btn" id="sandbox-open-btn" title="Open in New Tab">
                                <i class="ri-external-link-line"></i>
                            </button>
                        </div>
                        
                        <div class="sandbox-divider"></div>
                        
                        <button class="sandbox-close-btn" onclick="window.sandboxEngine.close()" title="Close (Esc)">
                            <i class="ri-close-line"></i>
                        </button>
                    </div>
                </div>
                
                <div class="sandbox-body">
                    <!-- Code Editor Tabs -->
                    <div class="sandbox-editor-section" id="sandbox-editor-section">
                        <div class="editor-tabs">
                            <button class="editor-tab active" data-tab="html">
                                <i class="ri-html5-line"></i> HTML
                            </button>
                            <button class="editor-tab" data-tab="css">
                                <i class="ri-css3-line"></i> CSS
                            </button>
                            <button class="editor-tab" data-tab="js">
                                <i class="ri-javascript-line"></i> JS
                            </button>
                            <button class="toggle-editor-btn" id="toggle-editor-btn" title="Toggle Editor">
                                <i class="ri-code-line"></i>
                            </button>
                        </div>
                        <div class="editor-panels">
                            <div class="editor-panel active" data-panel="html">
                                <textarea id="sandbox-html-editor" class="code-editor" placeholder="<!-- HTML code here -->"></textarea>
                            </div>
                            <div class="editor-panel" data-panel="css">
                                <textarea id="sandbox-css-editor" class="code-editor" placeholder="/* CSS styles here */"></textarea>
                            </div>
                            <div class="editor-panel" data-panel="js">
                                <textarea id="sandbox-js-editor" class="code-editor" placeholder="// JavaScript code here"></textarea>
                            </div>
                        </div>
                    </div>
                    
                    <!-- Preview Section -->
                    <div class="sandbox-preview-section">
                        <div class="preview-device-frame ${this.previewMode}" id="preview-device-frame">
                            <div class="device-notch" id="device-notch"></div>
                            <iframe 
                                id="sandbox-iframe"
                                class="sandbox-iframe"
                                sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-modals"
                                title="Project Preview"
                            ></iframe>
                        </div>
                        <div class="preview-info">
                            <span id="preview-device-label">Desktop</span>
                            <span id="preview-dimensions"></span>
                        </div>
                    </div>
                </div>
                
                <!-- Resize Handle -->
                <div class="sandbox-resize-handle" id="sandbox-resize-handle">
                    <i class="ri-drag-move-2-line"></i>
                </div>
            </div>
        `;
    }

    attachPanelEvents() {
        // Size buttons
        this.panel.querySelectorAll('.size-btn').forEach(btn => {
            btn.addEventListener('click', () => this.setPreviewSize(btn.dataset.size));
        });

        // Device buttons
        this.panel.querySelectorAll('.device-btn').forEach(btn => {
            btn.addEventListener('click', () => this.setDeviceMode(btn.dataset.device));
        });

        // Editor tabs
        this.panel.querySelectorAll('.editor-tab').forEach(tab => {
            tab.addEventListener('click', () => this.switchEditorTab(tab.dataset.tab));
        });

        // Toggle editor
        document.getElementById('toggle-editor-btn')?.addEventListener('click', () => this.toggleEditor());

        // Action buttons
        document.getElementById('sandbox-refresh-btn')?.addEventListener('click', () => this.refreshPreview());
        document.getElementById('sandbox-undo-btn')?.addEventListener('click', () => this.undo());
        document.getElementById('sandbox-redo-btn')?.addEventListener('click', () => this.redo());
        document.getElementById('sandbox-fork-btn')?.addEventListener('click', () => this.forkProject());
        document.getElementById('sandbox-export-btn')?.addEventListener('click', () => this.exportAsZip());
        document.getElementById('sandbox-open-btn')?.addEventListener('click', () => this.openInNewTab());

        // Editor input events
        ['html', 'css', 'js'].forEach(type => {
            const editor = document.getElementById(`sandbox-${type}-editor`);
            if (editor) {
                editor.addEventListener('input', () => {
                    this.saveToHistory();
                    this.refreshPreviewDebounced();
                });

                // Tab key support
                editor.addEventListener('keydown', (e) => this.handleEditorKeydown(e, editor));
            }
        });

        // Resize handle
        this.setupResizeHandle();
    }

    // ===============================
    // Preview Management
    // ===============================

    async open(project) {
        if (!project) return;

        this.currentProject = project;
        this.history = [];
        this.historyIndex = -1;

        // Update title
        const titleEl = document.getElementById('sandbox-project-title');
        if (titleEl) titleEl.textContent = project.title;

        // Load project content
        await this.loadProjectContent(project);

        // Show panel
        this.panel.classList.add('visible');
        this.isOpen = true;
        document.body.style.overflow = 'hidden';

        // Initial preview
        this.refreshPreview();
        this.saveToHistory();
    }

    close() {
        this.panel.classList.remove('visible');
        this.isOpen = false;
        document.body.style.overflow = '';

        // Clear iframe
        const iframe = document.getElementById('sandbox-iframe');
        if (iframe) iframe.srcdoc = '';
    }

    async loadProjectContent(project) {
        try {
            // Try to fetch project files
            const baseUrl = project.link.replace(/\/index\.html$/, '').replace(/\/$/, '');

            // Fetch HTML
            let htmlContent = '';
            let cssContent = '';
            let jsContent = '';

            try {
                const htmlResponse = await fetch(`${baseUrl}/index.html`);
                if (htmlResponse.ok) {
                    htmlContent = await htmlResponse.text();

                    // Extract inline styles and scripts
                    const parser = new DOMParser();
                    const doc = parser.parseFromString(htmlContent, 'text/html');

                    // Extract CSS from style tags
                    const styleTags = doc.querySelectorAll('style');
                    styleTags.forEach(style => {
                        cssContent += style.textContent + '\n';
                    });

                    // Extract JS from script tags (inline only)
                    const scriptTags = doc.querySelectorAll('script:not([src])');
                    scriptTags.forEach(script => {
                        jsContent += script.textContent + '\n';
                    });

                    // Get body content
                    const bodyContent = doc.body ? doc.body.innerHTML : htmlContent;
                    htmlContent = bodyContent;
                }
            } catch (e) {
                console.warn('Could not fetch project HTML:', e);
            }

            // Try to fetch separate CSS file
            try {
                const cssResponse = await fetch(`${baseUrl}/style.css`);
                if (cssResponse.ok) {
                    cssContent = await cssResponse.text();
                }
            } catch (e) {
                // CSS file might not exist
            }

            // Try to fetch separate JS file
            try {
                const jsResponse = await fetch(`${baseUrl}/script.js`);
                if (jsResponse.ok) {
                    jsContent = await jsResponse.text();
                }
            } catch (e) {
                // JS file might not exist
            }

            // Check for forked version
            const forked = this.getForkedProject(project.title);
            if (forked) {
                htmlContent = forked.html || htmlContent;
                cssContent = forked.css || cssContent;
                jsContent = forked.js || jsContent;
            }

            // Set editor content
            this.setEditorContent('html', htmlContent || this.getDefaultHTML(project));
            this.setEditorContent('css', cssContent || this.getDefaultCSS());
            this.setEditorContent('js', jsContent || this.getDefaultJS());

        } catch (error) {
            console.error('Error loading project content:', error);
            this.setEditorContent('html', this.getDefaultHTML(project));
            this.setEditorContent('css', this.getDefaultCSS());
            this.setEditorContent('js', this.getDefaultJS());
        }
    }

    getDefaultHTML(project) {
        return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${project?.title || 'Sandbox Project'}</title>
</head>
<body>
    <div class="container">
        <h1>${project?.title || 'Hello Sandbox!'}</h1>
        <p>${project?.description || 'Start editing to see your changes live.'}</p>
    </div>
</body>
</html>`;
    }

    getDefaultCSS() {
        return `* {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
}

body {
    font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    min-height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
}

.container {
    text-align: center;
    padding: 2rem;
}

h1 {
    font-size: 2.5rem;
    margin-bottom: 1rem;
}

p {
    font-size: 1.2rem;
    opacity: 0.9;
}`;
    }

    getDefaultJS() {
        return `// Your JavaScript code here
console.log('Sandbox loaded!');

// Example: Add interactivity
document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM ready');
});`;
    }

    setEditorContent(type, content) {
        const editor = document.getElementById(`sandbox-${type}-editor`);
        if (editor) {
            editor.value = content;
        }
    }

    getEditorContent(type) {
        const editor = document.getElementById(`sandbox-${type}-editor`);
        return editor ? editor.value : '';
    }

    refreshPreview() {
        const iframe = document.getElementById('sandbox-iframe');
        if (!iframe) return;

        const html = this.getEditorContent('html');
        const css = this.getEditorContent('css');
        const js = this.getEditorContent('js');

        // Construct the document
        const fullHTML = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <style>${css}</style>
</head>
<body>
    ${html}
    <script>${js}<\/script>
</body>
</html>`;

        iframe.srcdoc = fullHTML;
    }

    refreshPreviewDebounced = this.debounce(() => {
        this.refreshPreview();
    }, 500);

    // ===============================
    // Size & Device Controls
    // ===============================

    setPreviewSize(size) {
        this.previewSize = size;

        const container = this.panel.querySelector('.sandbox-container');
        if (container) {
            container.style.width = size;
        }

        // Update active button
        this.panel.querySelectorAll('.size-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.size === size);
        });
    }

    setDeviceMode(device) {
        this.previewMode = device;

        const frame = document.getElementById('preview-device-frame');
        const notch = document.getElementById('device-notch');
        const label = document.getElementById('preview-device-label');
        const dimensions = document.getElementById('preview-dimensions');

        if (frame) {
            frame.className = `preview-device-frame ${device}`;

            const deviceInfo = this.deviceSizes[device];
            if (device !== 'desktop') {
                frame.style.width = `${deviceInfo.width}px`;
                frame.style.maxHeight = `${deviceInfo.height}px`;
            } else {
                frame.style.width = '100%';
                frame.style.maxHeight = '100%';
            }
        }

        if (notch) {
            notch.style.display = device === 'phone' ? 'block' : 'none';
        }

        if (label) {
            label.textContent = this.deviceSizes[device].label;
        }

        if (dimensions && device !== 'desktop') {
            dimensions.textContent = `${this.deviceSizes[device].width} × ${this.deviceSizes[device].height}`;
        } else if (dimensions) {
            dimensions.textContent = '';
        }

        // Update active button
        this.panel.querySelectorAll('.device-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.device === device);
        });
    }

    // ===============================
    // Editor Management
    // ===============================

    switchEditorTab(tab) {
        // Update tabs
        this.panel.querySelectorAll('.editor-tab').forEach(t => {
            t.classList.toggle('active', t.dataset.tab === tab);
        });

        // Update panels
        this.panel.querySelectorAll('.editor-panel').forEach(p => {
            p.classList.toggle('active', p.dataset.panel === tab);
        });
    }

    toggleEditor() {
        const section = document.getElementById('sandbox-editor-section');
        if (section) {
            section.classList.toggle('collapsed');
        }
    }

    handleEditorKeydown(e, editor) {
        // Tab key - insert spaces
        if (e.key === 'Tab') {
            e.preventDefault();
            const start = editor.selectionStart;
            const end = editor.selectionEnd;
            const value = editor.value;

            editor.value = value.substring(0, start) + '    ' + value.substring(end);
            editor.selectionStart = editor.selectionEnd = start + 4;
        }
    }

    // ===============================
    // History (Undo/Redo)
    // ===============================

    saveToHistory() {
        const state = {
            html: this.getEditorContent('html'),
            css: this.getEditorContent('css'),
            js: this.getEditorContent('js'),
            timestamp: Date.now()
        };

        // Remove future states if we're in the middle of history
        if (this.historyIndex < this.history.length - 1) {
            this.history = this.history.slice(0, this.historyIndex + 1);
        }

        // Add new state
        this.history.push(state);

        // Limit history size
        if (this.history.length > this.maxHistorySize) {
            this.history.shift();
        }

        this.historyIndex = this.history.length - 1;
        this.updateHistoryButtons();
    }

    undo() {
        if (this.historyIndex > 0) {
            this.historyIndex--;
            this.restoreFromHistory();
        }
    }

    redo() {
        if (this.historyIndex < this.history.length - 1) {
            this.historyIndex++;
            this.restoreFromHistory();
        }
    }

    restoreFromHistory() {
        const state = this.history[this.historyIndex];
        if (!state) return;

        this.setEditorContent('html', state.html);
        this.setEditorContent('css', state.css);
        this.setEditorContent('js', state.js);
        this.refreshPreview();
        this.updateHistoryButtons();
    }

    updateHistoryButtons() {
        const undoBtn = document.getElementById('sandbox-undo-btn');
        const redoBtn = document.getElementById('sandbox-redo-btn');

        if (undoBtn) undoBtn.disabled = this.historyIndex <= 0;
        if (redoBtn) redoBtn.disabled = this.historyIndex >= this.history.length - 1;
    }

    // ===============================
    // Fork & Save
    // ===============================

    forkProject() {
        if (!this.currentProject) return;

        const forkedData = {
            originalTitle: this.currentProject.title,
            title: `${this.currentProject.title} (Forked)`,
            html: this.getEditorContent('html'),
            css: this.getEditorContent('css'),
            js: this.getEditorContent('js'),
            forkedAt: Date.now()
        };

        this.forkedProjects[this.currentProject.title] = forkedData;
        this.saveForkedProjects();

        this.showNotification('Project forked successfully! Changes will persist.', 'success');
    }

    loadForkedProjects() {
        try {
            const saved = localStorage.getItem('sandbox_forked_projects');
            return saved ? JSON.parse(saved) : {};
        } catch (e) {
            return {};
        }
    }

    saveForkedProjects() {
        try {
            localStorage.setItem('sandbox_forked_projects', JSON.stringify(this.forkedProjects));
        } catch (e) {
            console.error('Failed to save forked projects:', e);
        }
    }

    getForkedProject(title) {
        return this.forkedProjects[title] || null;
    }

    // ===============================
    // Export
    // ===============================

    async exportAsZip() {
        const html = this.getEditorContent('html');
        const css = this.getEditorContent('css');
        const js = this.getEditorContent('js');
        const projectName = this.currentProject?.title || 'sandbox-project';

        // Create full HTML document
        const fullHTML = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${projectName}</title>
    <link rel="stylesheet" href="style.css">
</head>
<body>
    ${html}
    <script src="script.js"><\/script>
</body>
</html>`;

        // Use JSZip if available, otherwise create individual downloads
        if (typeof JSZip !== 'undefined') {
            const zip = new JSZip();
            zip.file('index.html', fullHTML);
            zip.file('style.css', css);
            zip.file('script.js', js);

            const blob = await zip.generateAsync({ type: 'blob' });
            this.downloadBlob(blob, `${this.sanitizeFilename(projectName)}.zip`);
        } else {
            // Fallback: download as single HTML file
            const singleFileHTML = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${projectName}</title>
    <style>${css}</style>
</head>
<body>
    ${html}
    <script>${js}<\/script>
</body>
</html>`;

            const blob = new Blob([singleFileHTML], { type: 'text/html' });
            this.downloadBlob(blob, `${this.sanitizeFilename(projectName)}.html`);
        }

        this.showNotification('Project exported successfully!', 'success');
    }

    downloadBlob(blob, filename) {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }

    sanitizeFilename(name) {
        return name.replace(/[^a-z0-9]/gi, '-').toLowerCase();
    }

    // ===============================
    // Open in New Tab
    // ===============================

    openInNewTab() {
        const html = this.getEditorContent('html');
        const css = this.getEditorContent('css');
        const js = this.getEditorContent('js');

        const fullHTML = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${this.currentProject?.title || 'Sandbox Preview'}</title>
    <style>${css}</style>
</head>
<body>
    ${html}
    <script>${js}<\/script>
</body>
</html>`;

        const blob = new Blob([fullHTML], { type: 'text/html' });
        const url = URL.createObjectURL(blob);
        window.open(url, '_blank');
    }

    // ===============================
    // Keyboard Shortcuts
    // ===============================

    setupKeyboardShortcuts() {
        document.addEventListener('keydown', (e) => {
            if (!this.isOpen) return;

            // Escape - close
            if (e.key === 'Escape') {
                this.close();
            }

            // Ctrl+Enter - refresh
            if (e.ctrlKey && e.key === 'Enter') {
                e.preventDefault();
                this.refreshPreview();
            }

            // Ctrl+Z - undo (when not in editor)
            if (e.ctrlKey && e.key === 'z' && !this.isEditorFocused()) {
                e.preventDefault();
                this.undo();
            }

            // Ctrl+Y - redo (when not in editor)
            if (e.ctrlKey && e.key === 'y' && !this.isEditorFocused()) {
                e.preventDefault();
                this.redo();
            }

            // Ctrl+S - fork/save
            if (e.ctrlKey && e.key === 's') {
                e.preventDefault();
                this.forkProject();
            }
        });
    }

    isEditorFocused() {
        const activeEl = document.activeElement;
        return activeEl && activeEl.classList.contains('code-editor');
    }

    // ===============================
    // Resize Handle
    // ===============================

    setupResizeHandle() {
        const handle = document.getElementById('sandbox-resize-handle');
        if (!handle) return;

        let isResizing = false;
        let startX;
        let startWidth;

        handle.addEventListener('mousedown', (e) => {
            isResizing = true;
            startX = e.clientX;
            const container = this.panel.querySelector('.sandbox-container');
            startWidth = container.offsetWidth;

            document.body.style.cursor = 'ew-resize';
            document.body.style.userSelect = 'none';
        });

        document.addEventListener('mousemove', (e) => {
            if (!isResizing) return;

            const container = this.panel.querySelector('.sandbox-container');
            const dx = startX - e.clientX;
            const newWidth = Math.min(Math.max(startWidth + dx, 300), window.innerWidth - 50);

            container.style.width = `${newWidth}px`;
        });

        document.addEventListener('mouseup', () => {
            if (isResizing) {
                isResizing = false;
                document.body.style.cursor = '';
                document.body.style.userSelect = '';
            }
        });
    }

    setupResizeObserver() {
        // Watch for window resize
        window.addEventListener('resize', () => {
            if (this.isOpen) {
                this.refreshPreview();
            }
        });
    }

    // ===============================
    // Utilities
    // ===============================

    debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }

    showNotification(message, type = 'info') {
        const existing = document.querySelector('.sandbox-notification');
        if (existing) existing.remove();

        const notification = document.createElement('div');
        notification.className = `sandbox-notification ${type}`;
        notification.innerHTML = `
            <i class="ri-${type === 'success' ? 'check' : type === 'error' ? 'error-warning' : 'information'}-line"></i>
            <span>${message}</span>
        `;
        document.body.appendChild(notification);

        setTimeout(() => notification.classList.add('show'), 10);
        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => notification.remove(), 300);
        }, 3000);
    }
}

// ===============================
// Quick Preview Button Integration
// ===============================

function addQuickPreviewButtons() {
    // Wait for cards to be rendered
    const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
            mutation.addedNodes.forEach((node) => {
                if (node.nodeType === 1) {
                    const cards = node.querySelectorAll?.('.card:not(.has-preview-btn), .list-card:not(.has-preview-btn)') || [];
                    cards.forEach(addPreviewButtonToCard);

                    if (node.classList?.contains('card') && !node.classList.contains('has-preview-btn')) {
                        addPreviewButtonToCard(node);
                    }
                }
            });
        });
    });

    observer.observe(document.body, { childList: true, subtree: true });

    // Add to existing cards
    document.querySelectorAll('.card:not(.has-preview-btn)').forEach(addPreviewButtonToCard);
}

function addPreviewButtonToCard(card) {
    if (!card || card.classList.contains('has-preview-btn')) return;

    const actionsDiv = card.querySelector('.card-actions');
    if (!actionsDiv) return;

    const previewBtn = document.createElement('button');
    previewBtn.className = 'preview-btn';
    previewBtn.title = 'Quick Preview';
    previewBtn.innerHTML = '<i class="ri-play-circle-line"></i>';

    previewBtn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();

        // Extract project data from card
        const title = card.querySelector('.card-heading, .list-card-title')?.textContent || 'Untitled';
        const description = card.querySelector('.card-description, .list-card-description')?.textContent || '';
        const category = card.querySelector('.category-tag')?.textContent?.toLowerCase() || 'utility';

        // Better link detection
        let link = card.getAttribute('data-link');
        if (!link) {
            const onclick = card.getAttribute('onclick');
            const match = onclick?.match(/window\.location\.href\s*=\s*'([^']+)'/);
            link = match ? match[1] : '';
        }
        if (!link) {
            link = card.querySelector('a')?.getAttribute('href') || '';
        }

        const project = { title, description, category, link };
        window.sandboxEngine?.open(project);

    });

    actionsDiv.insertBefore(previewBtn, actionsDiv.firstChild);
    card.classList.add('has-preview-btn');
}

// Create global instance
const sandboxEngine = new SandboxEngine();
window.sandboxEngine = sandboxEngine;


export { SandboxEngine, sandboxEngine };
