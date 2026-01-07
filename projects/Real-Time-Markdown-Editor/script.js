// Real-Time Markdown Editor
// Main Application Script

// Application State
const AppState = {
    currentFile: null,
    files: [],
    currentTheme: localStorage.getItem('markdownEditorTheme') || 'light',
    autoSave: true,
    lastSaveTime: null,
    isFullscreen: false,
    fileCounter: 1
};

// DOM Elements - Initialize safely
function initDOMElements() {
    return {
        // Core Elements
        markdownInput: document.getElementById('markdownInput'),
        previewContent: document.getElementById('previewContent'),
        fileList: document.getElementById('fileList'),
        fileCount: document.getElementById('fileCount'),
        fileSearch: document.getElementById('fileSearch'),
        
        // Stats Elements
        wordCount: document.getElementById('wordCount'),
        charCount: document.getElementById('charCount'),
        lastSaved: document.getElementById('lastSaved'),
        previewTime: document.getElementById('previewTime'),
        currentYear: document.getElementById('currentYear'),
        
        // Sidebar Elements
        sidebar: document.getElementById('sidebar'),
        toggleSidebar: document.getElementById('toggleSidebar'),
        
        // Button Elements
        newFileBtn: document.getElementById('newFileBtn'),
        addFileBtn: document.getElementById('addFileBtn'),
        exportBtn: document.getElementById('exportBtn'),
        themeToggle: document.getElementById('themeToggle'),
        togglePreview: document.getElementById('togglePreview'),
        refreshPreview: document.getElementById('refreshPreview'),
        
        // Modal Elements
        newFileModal: document.getElementById('newFileModal'),
        exportModal: document.getElementById('exportModal'),
        aboutModal: document.getElementById('aboutModal'),
        helpModal: document.getElementById('helpModal'),
        
        // Modal Buttons
        cancelNewFile: document.getElementById('cancelNewFile'),
        createNewFile: document.getElementById('createNewFile'),
        cancelExport: document.getElementById('cancelExport'),
        confirmExport: document.getElementById('confirmExport'),
        closeAbout: document.getElementById('closeAbout'),
        closeHelp: document.getElementById('closeHelp'),
        helpBtn: document.getElementById('helpBtn'),
        aboutBtn: document.getElementById('aboutBtn'),
        
        // Form Elements
        fileNameInput: document.getElementById('fileName'),
        fileTemplate: document.getElementById('fileTemplate'),
        exportFileNameInput: document.getElementById('exportFileName'),
        
        // Close Modal Buttons
        closeModalBtns: document.querySelectorAll('.close-modal')
    };
}

let DOM = {};

// File Templates
const FILE_TEMPLATES = {
    blank: '# New Document\n\nStart writing here...',
    notes: `# Meeting Notes
## Date: ${new Date().toLocaleDateString()}
### Attendees:
- 
### Agenda:
1. 
2. 
3. 

### Notes:

### Action Items:
- [ ] 
- [ ] 
- [ ] 

### Next Meeting:`,
    blog: `# Blog Post Title

## Introduction

Start with an engaging introduction...

## Main Content

### Subheading 1

Content goes here...

### Subheading 2

More content...

## Conclusion

Wrap up your post...

---
*Published on ${new Date().toLocaleDateString()}*`,
    readme: `# Project Name

## Description
A brief description of your project...

## Features
- Feature 1
- Feature 2
- Feature 3

## Installation
\`\`\`bash
npm install
\`\`\`

## Usage
\`\`\`javascript
const example = require('example');
\`\`\`

## Contributing
Pull requests are welcome...

## License
MIT`,
    cheatsheet: `# Markdown Cheatsheet

## Headers
# H1
## H2
### H3

## Emphasis
*italic* or _italic_
**bold** or __bold__
~~strikethrough~~

## Lists
### Unordered
- Item 1
- Item 2
  - Subitem

### Ordered
1. First item
2. Second item

## Links
[Link text](https://example.com)

## Images
![Alt text](https://example.com/image.jpg)

## Code
Inline \`code\`

\`\`\`javascript
// Code block
function hello() {
  console.log("Hello!");
}
\`\`\`

## Tables
| Header 1 | Header 2 |
|----------|----------|
| Cell 1   | Cell 2   |
| Cell 3   | Cell 4   |

## Blockquotes
> This is a blockquote

## Horizontal Rule
---
`
};

// Initialize Application
function initApp() {
    console.log('Initializing Markdown Editor...');
    
    // Initialize DOM elements
    DOM = initDOMElements();
    
    // Check if essential DOM elements exist
    if (!DOM.markdownInput || !DOM.previewContent) {
        console.error('Essential DOM elements not found!');
        return;
    }
    
    // Set current year
    if (DOM.currentYear) {
        DOM.currentYear.textContent = new Date().getFullYear();
    }
    
    // Load files from localStorage
    loadFiles();
    
    // Set initial theme
    setTheme(AppState.currentTheme);
    
    // Set up event listeners
    setupEventListeners();
    
    // Initialize markdown parser
    initializeMarkdown();
    
    // Set up auto-save
    setupAutoSave();
    
    // Show welcome message
    setTimeout(() => {
        showToast('Welcome to Markdown Editor!', 'success');
    }, 500);
}

// Load files from localStorage
function loadFiles() {
    const savedFiles = localStorage.getItem('markdownFiles');
    console.log('Loading files from localStorage:', savedFiles);
    
    if (savedFiles) {
        try {
            const parsedFiles = JSON.parse(savedFiles);
            if (parsedFiles && Array.isArray(parsedFiles) && parsedFiles.length > 0) {
                AppState.files = parsedFiles;
                // Ensure all files have required properties
                AppState.files = AppState.files.map(file => ({
                    ...file,
                    active: file.active || false,
                    createdAt: file.createdAt || new Date().toISOString(),
                    updatedAt: file.updatedAt || new Date().toISOString()
                }));
                
                // Find or set active file
                let activeFile = AppState.files.find(f => f.active);
                if (!activeFile) {
                    AppState.files[0].active = true;
                    activeFile = AppState.files[0];
                }
                
                AppState.currentFile = activeFile;
                DOM.markdownInput.value = AppState.currentFile.content || '';
                
                updateFileList();
                updatePreview();
                updateStats();
                
                // Update file counter
                const maxId = Math.max(...AppState.files.map(f => f.id || 0));
                AppState.fileCounter = maxId + 1;
                
                console.log('Files loaded successfully:', AppState.files);
                return;
            }
        } catch (e) {
            console.error('Error parsing saved files:', e);
        }
    }
    
    // Create default file if no files exist
    console.log('Creating default file...');
    createDefaultFile();
}

// Create default file
function createDefaultFile() {
    const defaultFile = {
        id: 1,
        name: 'Welcome.md',
        content: `# Welcome to Markdown Editor! ✨

## Features
- **Real-time preview** - See your Markdown rendered as you type
- **File management** - Create, edit, and organize multiple documents
- **Export options** - Download as HTML or Markdown
- **Syntax highlighting** - Beautiful code highlighting
- **Auto-save** - Your work is automatically saved
- **Dark/Light themes** - Choose your preferred theme

## Quick Start
1. Start typing in the editor panel
2. See the preview update in real-time
3. Use the toolbar for quick formatting
4. Save your work with Ctrl/Cmd + S

## Markdown Examples
### Text Formatting
- **Bold**: \`**bold text**\`
- *Italic*: \`*italic text*\`
- \`Inline code\`: \\\`code\\\`

### Lists
- Item 1
- Item 2
  - Subitem

### Code Blocks
\`\`\`javascript
function hello() {
  console.log("Hello, Markdown!");
}
\`\`\`

### Links & Images
[Markdown Guide](https://www.markdownguide.org)

---
Happy writing! 🚀`,
        active: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
    };
    
    AppState.files = [defaultFile];
    AppState.currentFile = defaultFile;
    AppState.fileCounter = 2;
    
    saveFiles();
    updateFileList();
    DOM.markdownInput.value = defaultFile.content;
    updatePreview();
}

// Save files to localStorage
function saveFiles() {
    try {
        if (AppState.currentFile) {
            AppState.currentFile.content = DOM.markdownInput.value;
            AppState.currentFile.updatedAt = new Date().toISOString();
            AppState.lastSaveTime = new Date();
            
            if (DOM.lastSaved) {
                DOM.lastSaved.textContent = `Last saved: ${AppState.lastSaveTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
            }
        }
        
        localStorage.setItem('markdownFiles', JSON.stringify(AppState.files));
        console.log('Files saved:', AppState.files);
    } catch (e) {
        console.error('Error saving files:', e);
        showToast('Error saving files!', 'error');
    }
}

// Update file list in sidebar
function updateFileList() {
    if (!DOM.fileList) return;
    
    DOM.fileList.innerHTML = '';
    const searchTerm = DOM.fileSearch ? DOM.fileSearch.value.toLowerCase() : '';
    
    // Filter files based on search
    const filteredFiles = AppState.files.filter(file => 
        file.name.toLowerCase().includes(searchTerm) ||
        (file.content && file.content.toLowerCase().includes(searchTerm))
    );
    
    if (DOM.fileCount) {
        DOM.fileCount.textContent = `${filteredFiles.length} file${filteredFiles.length !== 1 ? 's' : ''}`;
    }
    
    filteredFiles.forEach(file => {
        const fileItem = createFileElement(file);
        DOM.fileList.appendChild(fileItem);
    });
}

// Create file element for sidebar
function createFileElement(file) {
    const li = document.createElement('li');
    li.className = `file-item ${file.active ? 'active' : ''}`;
    li.dataset.id = file.id;
    
    // Format date
    const updatedDate = new Date(file.updatedAt || Date.now());
    const dateString = updatedDate.toLocaleDateString([], { month: 'short', day: 'numeric' });
    
    li.innerHTML = `
        <i class="fas fa-file-alt"></i>
        <div class="file-info">
            <div class="file-name">${file.name}</div>
            <div class="file-date">Updated ${dateString}</div>
        </div>
        <div class="file-actions">
            <button class="file-action-btn rename-file" title="Rename">
                <i class="fas fa-edit"></i>
            </button>
            <button class="file-action-btn delete-file" title="Delete">
                <i class="fas fa-trash"></i>
            </button>
        </div>
    `;
    
    // File click event
    li.addEventListener('click', (e) => {
        if (!e.target.closest('.file-actions')) {
            setActiveFile(file.id);
        }
    });
    
    // Rename button
    const renameBtn = li.querySelector('.rename-file');
    renameBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        renameFile(file.id);
    });
    
    // Delete button
    const deleteBtn = li.querySelector('.delete-file');
    deleteBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        deleteFile(file.id);
    });
    
    return li;
}

// Set active file
function setActiveFile(fileId) {
    // Update state
    AppState.files.forEach(file => {
        file.active = file.id === fileId;
        if (file.active) {
            AppState.currentFile = file;
        }
    });
    
    // Update UI
    updateFileList();
    
    // Update editor content
    DOM.markdownInput.value = AppState.currentFile.content || '';
    
    // Update preview and stats
    updatePreview();
    updateStats();
    
    // Focus on editor
    DOM.markdownInput.focus();
    
    // Save files
    saveFiles();
    
    // Show notification
    showToast(`Switched to "${AppState.currentFile.name}"`, 'info');
}

// Create new file
function createNewFile(name, template = 'blank') {
    const newFile = {
        id: AppState.fileCounter++,
        name: name.endsWith('.md') ? name : `${name}.md`,
        content: FILE_TEMPLATES[template] || FILE_TEMPLATES.blank,
        active: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
    };
    
    AppState.files.push(newFile);
    setActiveFile(newFile.id);
    saveFiles();
    
    showToast(`Created "${newFile.name}"`, 'success');
}

// Rename file
function renameFile(fileId) {
    const file = AppState.files.find(f => f.id === fileId);
    if (!file) return;
    
    const newName = prompt('Enter new name for the file:', file.name.replace('.md', ''));
    if (newName && newName.trim() && newName !== file.name.replace('.md', '')) {
        const finalName = newName.endsWith('.md') ? newName : `${newName}.md`;
        file.name = finalName;
        file.updatedAt = new Date().toISOString();
        
        updateFileList();
        saveFiles();
        
        showToast(`Renamed to "${finalName}"`, 'success');
    }
}

// Delete file
function deleteFile(fileId) {
    if (AppState.files.length <= 1) {
        showToast('Cannot delete the last file', 'error');
        return;
    }
    
    if (!confirm('Are you sure you want to delete this file?')) {
        return;
    }
    
    const fileIndex = AppState.files.findIndex(file => file.id === fileId);
    if (fileIndex === -1) return;
    
    const deletedFile = AppState.files[fileIndex];
    const wasActive = deletedFile.active;
    
    AppState.files.splice(fileIndex, 1);
    
    if (wasActive && AppState.files.length > 0) {
        setActiveFile(AppState.files[0].id);
    }
    
    saveFiles();
    showToast(`Deleted "${deletedFile.name}"`, 'warning');
}

// Update preview
function updatePreview() {
    if (!DOM.previewContent) return;
    
    const content = DOM.markdownInput.value.trim();
    
    if (!content) {
        DOM.previewContent.innerHTML = `
            <div class="empty-preview">
                <i class="fas fa-file-alt"></i>
                <h3>Nothing to preview yet</h3>
                <p>Start writing in the editor to see the live preview here.</p>
            </div>
        `;
        return;
    }
    
    try {
        // Check if marked is loaded
        if (typeof marked === 'undefined') {
            console.error('marked.js not loaded!');
            DOM.previewContent.innerHTML = `
                <div class="empty-preview">
                    <i class="fas fa-exclamation-triangle"></i>
                    <h3>Markdown Parser Error</h3>
                    <p>Markdown parser not loaded. Please refresh the page.</p>
                </div>
            `;
            return;
        }
        
        // Convert markdown to HTML
        const html = marked.parse(content, {
            breaks: true,
            gfm: true,
            headerIds: true,
            mangle: false
        });
        
        DOM.previewContent.innerHTML = html;
        
        // Apply syntax highlighting if hljs is available
        if (typeof hljs !== 'undefined') {
            document.querySelectorAll('pre code').forEach((block) => {
                try {
                    hljs.highlightElement(block);
                } catch (e) {
                    console.warn('Error highlighting code block:', e);
                }
            });
        }
        
        // Update timestamp
        const now = new Date();
        if (DOM.previewTime) {
            DOM.previewTime.textContent = `Last update: ${now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
        }
        
    } catch (error) {
        console.error('Error parsing markdown:', error);
        DOM.previewContent.innerHTML = `
            <div class="empty-preview">
                <i class="fas fa-exclamation-triangle"></i>
                <h3>Error parsing Markdown</h3>
                <p>There was an error parsing your Markdown. Please check your syntax.</p>
                <pre>${error.message}</pre>
            </div>
        `;
    }
}

// Update statistics
function updateStats() {
    const text = DOM.markdownInput.value;
    
    // Word count (simple implementation)
    const words = text.trim().split(/\s+/).filter(word => word.length > 0);
    if (DOM.wordCount) {
        DOM.wordCount.textContent = `${words.length} words`;
    }
    
    // Character count
    if (DOM.charCount) {
        DOM.charCount.textContent = `${text.length} chars`;
    }
}

// Initialize markdown parser
function initializeMarkdown() {
    // Check if marked is available
    if (typeof marked === 'undefined') {
        console.error('marked.js is not loaded!');
        showToast('Markdown parser not loaded. Please refresh.', 'error');
        return;
    }
    
    // Configure marked.js
    marked.setOptions({
        highlight: function(code, lang) {
            if (typeof hljs !== 'undefined' && lang && hljs.getLanguage(lang)) {
                try {
                    return hljs.highlight(code, { language: lang }).value;
                } catch (e) {
                    console.warn('Error highlighting code:', e);
                }
            }
            if (typeof hljs !== 'undefined') {
                return hljs.highlightAuto(code).value;
            }
            return code;
        },
        langPrefix: 'hljs language-'
    });
}

// Export file
function exportFile(format, fileName) {
    try {
        let content = '';
        let fileExtension = '';
        let mimeType = '';
        
        const markdownContent = DOM.markdownInput.value;
        const baseFileName = fileName || (AppState.currentFile ? 
            AppState.currentFile.name.replace('.md', '') : 'document');
        
        switch (format) {
            case 'html':
                if (typeof marked === 'undefined') {
                    showToast('Markdown parser not available', 'error');
                    return;
                }
                const htmlContent = marked.parse(markdownContent);
                content = createHTMLExport(htmlContent, baseFileName);
                fileExtension = '.html';
                mimeType = 'text/html';
                break;
                
            case 'markdown':
            default:
                content = markdownContent;
                fileExtension = '.md';
                mimeType = 'text/markdown';
                break;
        }
        
        // Create download link
        const blob = new Blob([content], { type: mimeType });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = baseFileName + fileExtension;
        document.body.appendChild(a);
        a.click();
        setTimeout(() => {
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        }, 100);
        
        showToast(`Exported as ${format.toUpperCase()}`, 'success');
    } catch (error) {
        console.error('Export error:', error);
        showToast('Export failed!', 'error');
    }
}

// Create HTML export content
function createHTMLExport(content, title) {
    return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${title}</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 800px;
            margin: 0 auto;
            padding: 2rem;
            background: #f8f9fa;
        }
        
        .document {
            background: white;
            padding: 3rem;
            border-radius: 10px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }
        
        h1, h2, h3, h4 {
            margin-top: 1.5em;
            margin-bottom: 0.5em;
            color: #2c3e50;
        }
        
        h1 { 
            font-size: 2.5em; 
            border-bottom: 3px solid #4a6fa5;
            padding-bottom: 0.3em;
        }
        
        h2 { 
            font-size: 2em; 
            border-bottom: 2px solid #eaeaea;
            padding-bottom: 0.3em;
        }
        
        p { margin-bottom: 1em; }
        
        ul, ol { 
            margin-left: 1.5em;
            margin-bottom: 1em;
        }
        
        li { margin-bottom: 0.5em; }
        
        blockquote {
            border-left: 4px solid #4a6fa5;
            padding-left: 1em;
            margin-left: 0;
            color: #666;
            font-style: italic;
        }
        
        code {
            background: #f4f4f4;
            padding: 0.2em 0.4em;
            border-radius: 3px;
            font-family: 'Monaco', 'Menlo', monospace;
            font-size: 0.9em;
        }
        
        pre {
            background: #1e1e1e;
            color: #f8f8f2;
            padding: 1em;
            border-radius: 5px;
            overflow-x: auto;
            margin: 1em 0;
        }
        
        pre code {
            background: none;
            padding: 0;
        }
        
        table {
            border-collapse: collapse;
            width: 100%;
            margin: 1em 0;
        }
        
        th, td {
            border: 1px solid #ddd;
            padding: 0.75em;
            text-align: left;
        }
        
        th {
            background: #f4f4f4;
            font-weight: 600;
        }
        
        a {
            color: #4a6fa5;
            text-decoration: none;
        }
        
        a:hover {
            text-decoration: underline;
        }
        
        img {
            max-width: 100%;
            height: auto;
            border-radius: 5px;
        }
        
        hr {
            border: none;
            border-top: 2px solid #eaeaea;
            margin: 2em 0;
        }
        
        .footer {
            margin-top: 3em;
            padding-top: 1em;
            border-top: 1px solid #eaeaea;
            color: #666;
            font-size: 0.9em;
            text-align: center;
        }
    </style>
</head>
<body>
    <div class="document">
        ${content}
        
        <div class="footer">
            <p>Exported from Markdown Editor • ${new Date().toLocaleDateString()}</p>
        </div>
    </div>
</body>
</html>`;
}

// Set theme
function setTheme(theme) {
    AppState.currentTheme = theme;
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('markdownEditorTheme', theme);
    
    // Update theme toggle icon
    if (DOM.themeToggle) {
        const icon = DOM.themeToggle.querySelector('i');
        const textSpan = DOM.themeToggle.querySelector('span');
        
        if (icon) {
            icon.className = theme === 'dark' ? 'fas fa-sun' : 'fas fa-moon';
        }
        
        if (textSpan) {
            textSpan.textContent = theme === 'dark' ? ' Light' : ' Dark';
        }
    }
}

// Toggle theme
function toggleTheme() {
    const newTheme = AppState.currentTheme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    showToast(`Switched to ${newTheme} theme`, 'info');
}

// Show toast notification
function showToast(message, type = 'info') {
    // Remove existing toasts
    const existingToasts = document.querySelectorAll('.toast');
    existingToasts.forEach(toast => toast.remove());
    
    // Create toast element
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    
    // Set icon based on type
    let icon = 'info-circle';
    switch (type) {
        case 'success': icon = 'check-circle'; break;
        case 'error': icon = 'exclamation-circle'; break;
        case 'warning': icon = 'exclamation-triangle'; break;
    }
    
    toast.innerHTML = `
        <i class="fas fa-${icon}"></i>
        <span>${message}</span>
    `;
    
    document.body.appendChild(toast);
    
    // Auto-remove after 3 seconds
    setTimeout(() => {
        if (toast.parentNode) {
            toast.style.opacity = '0';
            toast.style.transform = 'translateX(100%)';
            setTimeout(() => {
                if (toast.parentNode) {
                    toast.parentNode.removeChild(toast);
                }
            }, 300);
        }
    }, 3000);
}

// Insert markdown syntax
function insertMarkdownSyntax(action) {
    const textarea = DOM.markdownInput;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = textarea.value.substring(start, end);
    
    let insertText = '';
    let cursorOffset = 0;
    
    switch (action) {
        case 'heading1':
            insertText = `# ${selectedText}`;
            cursorOffset = selectedText ? 0 : 2;
            break;
        case 'heading2':
            insertText = `## ${selectedText}`;
            cursorOffset = selectedText ? 0 : 3;
            break;
        case 'bold':
            insertText = `**${selectedText}**`;
            cursorOffset = selectedText ? 0 : 2;
            break;
        case 'italic':
            insertText = `*${selectedText}*`;
            cursorOffset = selectedText ? 0 : 1;
            break;
        case 'link':
            insertText = `[${selectedText || 'Link Text'}](https://example.com)`;
            cursorOffset = selectedText ? 0 : 1;
            break;
        case 'image':
            insertText = `![${selectedText || 'Alt Text'}](https://example.com/image.jpg)`;
            cursorOffset = selectedText ? 0 : 1;
            break;
        case 'code':
            if (selectedText.includes('\n')) {
                insertText = `\`\`\`\n${selectedText}\n\`\`\``;
                cursorOffset = selectedText ? 0 : 4;
            } else {
                insertText = `\`${selectedText}\``;
                cursorOffset = selectedText ? 0 : 1;
            }
            break;
        case 'list':
            insertText = selectedText 
                ? selectedText.split('\n').map(line => `- ${line}`).join('\n')
                : `- List item`;
            cursorOffset = selectedText ? 0 : 2;
            break;
        case 'numberedList':
            insertText = selectedText 
                ? selectedText.split('\n').map((line, i) => `${i + 1}. ${line}`).join('\n')
                : `1. List item`;
            cursorOffset = selectedText ? 0 : 3;
            break;
        case 'quote':
            insertText = selectedText 
                ? selectedText.split('\n').map(line => `> ${line}`).join('\n')
                : `> Blockquote`;
            cursorOffset = selectedText ? 0 : 2;
            break;
        case 'table':
            insertText = `| Header 1 | Header 2 |\n|----------|----------|\n| Cell 1   | Cell 2   |\n| Cell 3   | Cell 4   |`;
            cursorOffset = 0;
            break;
        case 'hr':
            insertText = `\n---\n`;
            cursorOffset = 0;
            break;
    }
    
    // Update textarea value
    textarea.value = textarea.value.substring(0, start) + insertText + textarea.value.substring(end);
    
    // Set cursor position
    const newCursorPos = start + insertText.length - (selectedText ? 0 : cursorOffset);
    textarea.setSelectionRange(newCursorPos, newCursorPos);
    textarea.focus();
    
    // Update preview and stats
    updatePreview();
    updateStats();
    saveFiles();
}

// Setup auto-save
function setupAutoSave() {
    let saveTimeout;
    
    DOM.markdownInput.addEventListener('input', () => {
        updatePreview();
        updateStats();
        
        // Clear existing timeout
        if (saveTimeout) {
            clearTimeout(saveTimeout);
        }
        
        // Set new timeout for auto-save
        if (AppState.autoSave) {
            saveTimeout = setTimeout(() => {
                saveFiles();
                showToast('Auto-saved', 'success');
            }, 2000);
        }
    });
}

// Setup event listeners
function setupEventListeners() {
    console.log('Setting up event listeners...');
    
    // Editor events
    DOM.markdownInput.addEventListener('input', updatePreview);
    
    // Toolbar buttons
    document.querySelectorAll('.toolbar-btn').forEach(button => {
        button.addEventListener('click', (e) => {
            e.preventDefault();
            const action = button.dataset.action;
            insertMarkdownSyntax(action);
        });
    });
    
    // Sidebar toggle
    if (DOM.toggleSidebar) {
        DOM.toggleSidebar.addEventListener('click', () => {
            DOM.sidebar.classList.toggle('open');
        });
    }
    
    // File search
    if (DOM.fileSearch) {
        DOM.fileSearch.addEventListener('input', updateFileList);
    }
    
    // New file buttons
    if (DOM.newFileBtn) {
        DOM.newFileBtn.addEventListener('click', (e) => {
            e.preventDefault();
            DOM.fileNameInput.value = 'Untitled Document';
            DOM.fileTemplate.value = 'blank';
            DOM.newFileModal.classList.remove('hidden');
        });
    }
    
    if (DOM.addFileBtn) {
        DOM.addFileBtn.addEventListener('click', (e) => {
            e.preventDefault();
            DOM.fileNameInput.value = 'Untitled Document';
            DOM.fileTemplate.value = 'blank';
            DOM.newFileModal.classList.remove('hidden');
        });
    }
    
    // Export button
    if (DOM.exportBtn) {
        DOM.exportBtn.addEventListener('click', (e) => {
            e.preventDefault();
            const currentFileName = AppState.currentFile ? 
                AppState.currentFile.name.replace('.md', '') : 'document';
            DOM.exportFileNameInput.value = currentFileName;
            DOM.exportModal.classList.remove('hidden');
        });
    }
    
    // Theme toggle
    if (DOM.themeToggle) {
        DOM.themeToggle.addEventListener('click', toggleTheme);
    }
    
    // Preview controls
    if (DOM.togglePreview) {
        DOM.togglePreview.addEventListener('click', () => {
            const previewSection = document.querySelector('.preview-section');
            AppState.isFullscreen = !AppState.isFullscreen;
            
            if (AppState.isFullscreen) {
                previewSection.classList.add('fullscreen');
                document.querySelector('.editor-section').classList.add('hidden');
                DOM.togglePreview.innerHTML = '<i class="fas fa-compress"></i> Exit Fullscreen';
            } else {
                previewSection.classList.remove('fullscreen');
                document.querySelector('.editor-section').classList.remove('hidden');
                DOM.togglePreview.innerHTML = '<i class="fas fa-expand"></i> Fullscreen';
            }
        });
    }
    
    if (DOM.refreshPreview) {
        DOM.refreshPreview.addEventListener('click', updatePreview);
    }
    
    // Modal buttons
    if (DOM.cancelNewFile) {
        DOM.cancelNewFile.addEventListener('click', () => {
            DOM.newFileModal.classList.add('hidden');
        });
    }
    
    if (DOM.createNewFile) {
        DOM.createNewFile.addEventListener('click', () => {
            const name = DOM.fileNameInput.value.trim();
            const template = DOM.fileTemplate.value;
            
            if (name) {
                createNewFile(name, template);
                DOM.newFileModal.classList.add('hidden');
            } else {
                showToast('Please enter a file name', 'error');
            }
        });
    }
    
    if (DOM.cancelExport) {
        DOM.cancelExport.addEventListener('click', () => {
            DOM.exportModal.classList.add('hidden');
        });
    }
    
    if (DOM.confirmExport) {
        DOM.confirmExport.addEventListener('click', () => {
            const format = document.querySelector('input[name="exportFormat"]:checked').value;
            let fileName = DOM.exportFileNameInput.value.trim();
            
            if (!fileName) {
                fileName = AppState.currentFile ? 
                    AppState.currentFile.name.replace('.md', '') : 'document';
            }
            
            exportFile(format, fileName);
            DOM.exportModal.classList.add('hidden');
        });
    }
    
    // About and Help buttons
    if (DOM.aboutBtn) {
        DOM.aboutBtn.addEventListener('click', (e) => {
            e.preventDefault();
            DOM.aboutModal.classList.remove('hidden');
        });
    }
    
    if (DOM.helpBtn) {
        DOM.helpBtn.addEventListener('click', (e) => {
            e.preventDefault();
            DOM.helpModal.classList.remove('hidden');
        });
    }
    
    if (DOM.closeAbout) {
        DOM.closeAbout.addEventListener('click', () => {
            DOM.aboutModal.classList.add('hidden');
        });
    }
    
    if (DOM.closeHelp) {
        DOM.closeHelp.addEventListener('click', () => {
            DOM.helpModal.classList.add('hidden');
        });
    }
    
    // Close modal buttons
    DOM.closeModalBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            btn.closest('.modal-overlay').classList.add('hidden');
        });
    });
    
    // Close modals when clicking outside
    [DOM.newFileModal, DOM.exportModal, DOM.aboutModal, DOM.helpModal].forEach(modal => {
        if (modal) {
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    modal.classList.add('hidden');
                }
            });
        }
    });
    
    // Keyboard shortcuts
    document.addEventListener('keydown', (e) => {
        // Don't trigger shortcuts when typing in inputs or modals are open
        if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA' || 
            e.target.tagName === 'SELECT' || document.querySelector('.modal-overlay:not(.hidden)')) {
            return;
        }
        
        // Ctrl/Cmd + S to save
        if ((e.ctrlKey || e.metaKey) && e.key === 's') {
            e.preventDefault();
            saveFiles();
            showToast('Document saved!', 'success');
        }
        
        // Ctrl/Cmd + B for bold
        if ((e.ctrlKey || e.metaKey) && e.key === 'b') {
            e.preventDefault();
            insertMarkdownSyntax('bold');
        }
        
        // Ctrl/Cmd + I for italic
        if ((e.ctrlKey || e.metaKey) && e.key === 'i') {
            e.preventDefault();
            insertMarkdownSyntax('italic');
        }
        
        // Ctrl/Cmd + K for link
        if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
            e.preventDefault();
            insertMarkdownSyntax('link');
        }
        
        // Ctrl/Cmd + E to toggle preview
        if ((e.ctrlKey || e.metaKey) && e.key === 'e') {
            e.preventDefault();
            if (DOM.togglePreview) DOM.togglePreview.click();
        }
        
        // Ctrl/Cmd + / for help
        if ((e.ctrlKey || e.metaKey) && e.key === '/') {
            e.preventDefault();
            if (DOM.helpModal) DOM.helpModal.classList.remove('hidden');
        }
        
        // Escape to close modals and fullscreen
        if (e.key === 'Escape') {
            if (AppState.isFullscreen && DOM.togglePreview) {
                DOM.togglePreview.click();
            }
            
            // Close any open modals
            document.querySelectorAll('.modal-overlay').forEach(modal => {
                modal.classList.add('hidden');
            });
            
            // Close sidebar on mobile
            if (window.innerWidth <= 1024 && DOM.sidebar) {
                DOM.sidebar.classList.remove('open');
            }
        }
    });
    
    // Window resize handler
    window.addEventListener('resize', () => {
        if (window.innerWidth > 1024 && DOM.sidebar) {
            DOM.sidebar.classList.remove('open');
        }
    });
    
    console.log('Event listeners set up successfully');
}

// Check if all required libraries are loaded
function checkLibraries() {
    const requiredLibs = ['marked'];
    const missingLibs = requiredLibs.filter(lib => typeof window[lib] === 'undefined');
    
    if (missingLibs.length > 0) {
        console.error('Missing required libraries:', missingLibs);
        showToast('Some required libraries failed to load. Please refresh the page.', 'error');
        return false;
    }
    
    return true;
}

// Initialize the application when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM loaded, initializing app...');
    
    // Check for required libraries
    if (!checkLibraries()) {
        return;
    }
    
    // Initialize the app
    setTimeout(initApp, 100); // Small delay to ensure all DOM is ready
});

// Export functions for debugging
if (typeof window !== 'undefined') {
    window.markdownEditor = {
        AppState,
        DOM,
        initApp,
        saveFiles,
        updatePreview,
        showToast,
        exportFile
    };
}