// ============================================
// ADVANCED CODE EDITOR & COMPILER UI
// ============================================
// State Management
const state = {
    theme: 'dark',
    currentFile: null,
    files: [],
    tabs: [],
    currentLanguage: 'javascript',
    autoSave: true,
    consoleExpanded: true
};

// ============================================
// INITIALIZATION
// ============================================
document.addEventListener('DOMContentLoaded', function() {
    // Load saved files from localStorage
    loadFilesFromStorage();
    
    // Set up event listeners
    setupEventListeners();
    
    // Initialize with default file if none exist
    if (state.files.length === 0) {
        createNewFile('example.js', 
            `// Welcome to CodeEditor Pro!
console.log("Hello, World!");

// Try changing the language and running the code.
// You can create new files using the sidebar.`);
    }
    
    // Update UI components
    updateUI();
    
    // Add welcome message to console
    addConsoleMessage('CodeEditor Pro initialized. Ready to code!', 'success');
});

// ============================================
// FILE MANAGEMENT FUNCTIONS
// ============================================
function loadFilesFromStorage() {
    const savedFiles = localStorage.getItem('codeEditorFiles');
    if (savedFiles) {
        try {
            state.files = JSON.parse(savedFiles);
        } catch (error) {
            console.error('Error loading files from storage:', error);
            state.files = [];
        }
    }
}

function saveFilesToStorage() {
    localStorage.setItem('codeEditorFiles', JSON.stringify(state.files));
    updateSaveStatus('All changes saved');
}

function createNewFile(name = '', content = '') {
    // Generate default name if not provided
    if (!name) {
        const ext = getFileExtension(state.currentLanguage);
        name = `new-file-${state.files.length + 1}.${ext}`;
    }
    
    const newFile = {
        id: Date.now().toString(),
        name: name,
        content: content,
        language: state.currentLanguage,
        lastModified: new Date().toISOString()
    };
    
    state.files.push(newFile);
    state.currentFile = newFile.id;
    
    // Add to tabs if not already present
    if (!state.tabs.includes(newFile.id)) {
        state.tabs.push(newFile.id);
    }
    
    saveFilesToStorage();
    updateUI();
    
    addConsoleMessage(`Created new file: ${name}`, 'info');
    return newFile.id;
}

function getFileById(id) {
    return state.files.find(file => file.id === id);
}

function updateCurrentFileContent(content) {
    const file = getFileById(state.currentFile);
    if (file) {
        file.content = content;
        file.lastModified = new Date().toISOString();
        
        if (state.autoSave) {
            saveFilesToStorage();
        } else {
            updateSaveStatus('Unsaved changes');
        }
    }
}

function deleteFile(id) {
    const fileIndex = state.files.findIndex(file => file.id === id);
    if (fileIndex !== -1) {
        const fileName = state.files[fileIndex].name;
        
        // Remove file from files array
        state.files.splice(fileIndex, 1);
        
        // Remove from tabs
        const tabIndex = state.tabs.indexOf(id);
        if (tabIndex !== -1) {
            state.tabs.splice(tabIndex, 1);
        }
        
        // If we deleted the current file, select another one
        if (state.currentFile === id) {
            state.currentFile = state.files.length > 0 ? state.files[0].id : null;
        }
        
        saveFilesToStorage();
        updateUI();
        
        addConsoleMessage(`File deleted: ${fileName}`, 'info');
    }
}

// ============================================
// UI UPDATE FUNCTIONS
// ============================================
function updateUI() {
    updateFilesList();
    updateTabs();
    updateEditor();
    updateLanguageSelector();
    updateLineCount();
}

function updateFilesList() {
    const filesList = document.getElementById('filesList');
    filesList.innerHTML = '';
    
    state.files.forEach(file => {
        const fileElement = document.createElement('div');
        fileElement.className = `file-item ${state.currentFile === file.id ? 'active' : ''}`;
        fileElement.dataset.id = file.id;
        
        fileElement.innerHTML = `
            <i class="fas fa-file-code file-icon"></i>
            <span class="file-name">${file.name}</span>
            <div class="file-actions">
                <button class="file-action" data-action="rename" title="Rename">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="file-action" data-action="delete" title="Delete">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        `;
        
        fileElement.addEventListener('click', (e) => {
            if (!e.target.closest('.file-action')) {
                switchToFile(file.id);
            }
        });
        
        filesList.appendChild(fileElement);
    });
    
    // Add event listeners for file actions
    document.querySelectorAll('.file-action[data-action="delete"]').forEach(button => {
        button.addEventListener('click', function(e) {
            e.stopPropagation();
            const fileId = this.closest('.file-item').dataset.id;
            if (confirm('Are you sure you want to delete this file?')) {
                deleteFile(fileId);
            }
        });
    });
    
    document.querySelectorAll('.file-action[data-action="rename"]').forEach(button => {
        button.addEventListener('click', function(e) {
            e.stopPropagation();
            const fileId = this.closest('.file-item').dataset.id;
            renameFile(fileId);
        });
    });
}

function updateTabs() {
    const tabsContainer = document.getElementById('tabsContainer');
    tabsContainer.innerHTML = '';
    
    state.tabs.forEach(tabId => {
        const file = getFileById(tabId);
        if (!file) return;
        
        const tabElement = document.createElement('button');
        tabElement.className = `tab ${state.currentFile === file.id ? 'active' : ''}`;
        tabElement.dataset.id = file.id;
        
        tabElement.innerHTML = `
            <i class="fas fa-file-code"></i>
            <span>${file.name}</span>
            <button class="tab-close" title="Close tab">
                <i class="fas fa-times"></i>
            </button>
        `;
        
        tabElement.addEventListener('click', (e) => {
            if (!e.target.closest('.tab-close')) {
                switchToFile(file.id);
            }
        });
        
        // Close tab button
        const closeButton = tabElement.querySelector('.tab-close');
        closeButton.addEventListener('click', (e) => {
            e.stopPropagation();
            closeTab(file.id);
        });
        
        tabsContainer.appendChild(tabElement);
    });
}

function updateEditor() {
    const editor = document.getElementById('codeEditor');
    const file = getFileById(state.currentFile);
    
    if (file) {
        editor.value = file.content;
        state.currentLanguage = file.language;
        document.getElementById('languageSelect').value = file.language;
        document.getElementById('languageStatus').textContent = getLanguageName(file.language);
    } else {
        editor.value = '';
        document.getElementById('languageStatus').textContent = 'No file selected';
    }
    
    updateSyntaxHighlighting();
}

function updateLanguageSelector() {
    const languageSelect = document.getElementById('languageSelect');
    languageSelect.value = state.currentLanguage;
}

function updateLineCount() {
    const editor = document.getElementById('codeEditor');
    const text = editor.value;
    const lines = text.split('\n').length;
    const currentLine = text.substring(0, editor.selectionStart).split('\n').length;
    const currentCol = editor.selectionStart - text.lastIndexOf('\n', editor.selectionStart - 1);
    
    document.getElementById('lineCount').textContent = `Line: ${currentLine}, Col: ${currentCol} | Total: ${lines}`;
}

function updateSaveStatus(message) {
    document.getElementById('saveStatus').textContent = message;
}

function updateSyntaxHighlighting() {
    const editor = document.getElementById('codeEditor');
    editor.style.fontFamily = "'Consolas', 'Monaco', monospace";
    
    // Basic syntax highlighting simulation
    const code = editor.value;
    if (state.currentLanguage === 'javascript') {
        // Could implement more advanced highlighting here
        // This is a simplified version for demo
    }
}

// ============================================
// THEME MANAGEMENT
// ============================================
function toggleTheme() {
    state.theme = state.theme === 'dark' ? 'light' : 'dark';
    document.body.classList.toggle('light-theme', state.theme === 'light');
    
    const themeToggle = document.getElementById('themeToggle');
    const icon = themeToggle.querySelector('i');
    const text = themeToggle.querySelector('span');
    
    if (state.theme === 'light') {
        icon.className = 'fas fa-moon';
        text.textContent = 'Dark Mode';
    } else {
        icon.className = 'fas fa-sun';
        text.textContent = 'Light Mode';
    }
    
    addConsoleMessage(`Switched to ${state.theme} theme`, 'info');
}

// ============================================
// CONSOLE FUNCTIONS
// ============================================
function addConsoleMessage(message, type = 'info') {
    const consoleOutput = document.getElementById('consoleOutput');
    const messageElement = document.createElement('div');
    messageElement.className = `console-message ${type}`;
    
    // Add timestamp
    const timestamp = new Date().toLocaleTimeString([], { 
        hour: '2-digit', 
        minute: '2-digit', 
        second: '2-digit' 
    });
    messageElement.innerHTML = `<strong>[${timestamp}]</strong> ${message}`;
    
    consoleOutput.appendChild(messageElement);
    consoleOutput.scrollTop = consoleOutput.scrollHeight;
}

function clearConsole() {
    document.getElementById('consoleOutput').innerHTML = '';
    addConsoleMessage('Console cleared', 'info');
}

function toggleConsole() {
    const consoleElement = document.querySelector('.console');
    const toggleButton = document.getElementById('toggleConsole');
    const icon = toggleButton.querySelector('i');
    
    if (state.consoleExpanded) {
        consoleElement.style.height = '40px';
        toggleButton.innerHTML = '<i class="fas fa-chevron-up"></i> Expand';
        state.consoleExpanded = false;
    } else {
        consoleElement.style.height = '200px';
        toggleButton.innerHTML = '<i class="fas fa-chevron-down"></i> Collapse';
        state.consoleExpanded = true;
    }
}

// ============================================
// CODE EXECUTION FUNCTIONS
// ============================================
function executeCode() {
    const file = getFileById(state.currentFile);
    if (!file) {
        addConsoleMessage('No file selected to execute', 'error');
        return;
    }
    
    addConsoleMessage(`Executing ${file.name}...`, 'info');
    
    switch(file.language) {
        case 'javascript':
            executeJavaScript(file.content);
            break;
        case 'html':
            executeHTML(file.content);
            break;
        case 'css':
            executeCSS(file.content);
            break;
        case 'python':
            executePython(file.content);
            break;
        case 'java':
            executeJava(file.content);
            break;
        case 'cpp':
            executeCpp(file.content);
            break;
        default:
            addConsoleMessage(`Language ${file.language} is not supported for execution.`, 'warning');
    }
}

function executeJavaScript(code) {
    try {
        // Capture console.log output
        const originalLog = console.log;
        let capturedOutput = '';
        
        console.log = function(...args) {
            capturedOutput += args.join(' ') + '\n';
            originalLog.apply(console, args);
        };
        
        // Execute the code
        eval(code);
        
        // Restore original console.log
        console.log = originalLog;
        
        // Display output
        if (capturedOutput) {
            addConsoleMessage(capturedOutput, 'output');
        } else {
            addConsoleMessage('Code executed successfully (no output).', 'success');
        }
    } catch (error) {
        addConsoleMessage(`Error: ${error.message}`, 'error');
    }
}

function executeHTML(code) {
    addConsoleMessage('HTML executed. Opening preview...', 'info');
    
    // For demo, create a simple preview
    try {
        const previewWindow = window.open('', '_blank');
        previewWindow.document.write(code);
        previewWindow.document.close();
        addConsoleMessage('HTML preview opened in new tab', 'success');
    } catch (error) {
        addConsoleMessage('Could not open preview (popup may be blocked)', 'warning');
        addConsoleMessage('HTML Preview would render here in a real implementation.', 'info');
    }
}

function executeCSS(code) {
    addConsoleMessage('CSS executed. Applying styles...', 'info');
    
    const styleId = 'temp-css-execution';
    let existingStyle = document.getElementById(styleId);
    
    if (existingStyle) {
        existingStyle.remove();
    }
    
    const style = document.createElement('style');
    style.id = styleId;
    style.textContent = code;
    document.head.appendChild(style);
    
    addConsoleMessage('CSS applied to the page.', 'success');
}

function executePython(code) {
    addConsoleMessage('Python execution simulated.', 'info');
    addConsoleMessage('In a real application, this would connect to a Python backend.', 'info');
    
    // Simulate Python output
    const lines = code.split('\n');
    lines.forEach(line => {
        const printMatch = line.match(/print\(['"](.*?)['"]\)/);
        if (printMatch) {
            addConsoleMessage(printMatch[1], 'output');
        }
    });
    
    if (!code.includes('print(')) {
        addConsoleMessage('Python code parsed (no output detected).', 'info');
    }
}

function executeJava(code) {
    addConsoleMessage('Java execution simulated.', 'info');
    addConsoleMessage('This would require compilation in a real environment.', 'info');
    
    setTimeout(() => {
        if (code.includes('System.out.println')) {
            const matches = code.match(/System\.out\.println\(["'](.*?)["']\);/g);
            if (matches) {
                matches.forEach(match => {
                    const text = match.match(/System\.out\.println\(["'](.*?)["']\);/)[1];
                    addConsoleMessage(text, 'output');
                });
            }
            addConsoleMessage('Java program executed successfully.', 'success');
        } else {
            addConsoleMessage('Java program compiled (no output detected).', 'info');
        }
    }, 800);
}

function executeCpp(code) {
    addConsoleMessage('C++ execution simulated.', 'info');
    addConsoleMessage('This would require compilation in a real environment.', 'info');
    
    setTimeout(() => {
        if (code.includes('cout <<')) {
            const lines = code.split('\n');
            lines.forEach(line => {
                const textMatch = line.match(/cout << "(.*?)"/);
                if (textMatch) {
                    addConsoleMessage(textMatch[1], 'output');
                }
            });
            addConsoleMessage('C++ program executed successfully.', 'success');
        } else {
            addConsoleMessage('C++ program compiled (no output detected).', 'info');
        }
    }, 1000);
}

// ============================================
// HELPER FUNCTIONS
// ============================================
function getFileExtension(language) {
    const extensions = {
        'javascript': 'js',
        'html': 'html',
        'css': 'css',
        'python': 'py',
        'java': 'java',
        'cpp': 'cpp'
    };
    return extensions[language] || 'txt';
}

function getLanguageName(languageCode) {
    const languages = {
        'javascript': 'JavaScript',
        'html': 'HTML',
        'css': 'CSS',
        'python': 'Python',
        'java': 'Java',
        'cpp': 'C++'
    };
    return languages[languageCode] || 'Text';
}

function switchToFile(fileId) {
    state.currentFile = fileId;
    updateUI();
    
    const file = getFileById(fileId);
    if (file) {
        addConsoleMessage(`Switched to file: ${file.name}`, 'info');
    }
}

function closeTab(fileId) {
    const tabIndex = state.tabs.indexOf(fileId);
    if (tabIndex !== -1) {
        state.tabs.splice(tabIndex, 1);
        
        if (state.currentFile === fileId) {
            state.currentFile = state.tabs.length > 0 ? state.tabs[state.tabs.length - 1] : null;
        }
        
        updateUI();
    }
}

function renameFile(fileId) {
    const file = getFileById(fileId);
    if (!file) return;
    
    const newName = prompt('Enter new file name:', file.name);
    if (newName && newName.trim() !== '') {
        const oldName = file.name;
        file.name = newName.trim();
        saveFilesToStorage();
        updateUI();
        addConsoleMessage(`File renamed from "${oldName}" to "${file.name}"`, 'info');
    }
}

// ============================================
// EVENT LISTENERS SETUP
// ============================================
function setupEventListeners() {
    // Theme toggle
    document.getElementById('themeToggle').addEventListener('click', toggleTheme);
    
    // Run code button
    document.getElementById('runCode').addEventListener('click', executeCode);
    
    // Save code button
    document.getElementById('saveCode').addEventListener('click', () => {
        const file = getFileById(state.currentFile);
        if (file) {
            file.content = document.getElementById('codeEditor').value;
            file.lastModified = new Date().toISOString();
            saveFilesToStorage();
            addConsoleMessage(`File saved: ${file.name}`, 'success');
        } else {
            addConsoleMessage('No file selected to save', 'warning');
        }
    });
    
    // Add file button
    document.getElementById('addFile').addEventListener('click', () => {
        createNewFile();
    });
    
    // Language selector
    document.getElementById('languageSelect').addEventListener('change', function() {
        state.currentLanguage = this.value;
        
        const file = getFileById(state.currentFile);
        if (file) {
            file.language = state.currentLanguage;
            saveFilesToStorage();
            updateUI();
            addConsoleMessage(`Language changed to ${getLanguageName(state.currentLanguage)}`, 'info');
        }
    });
    
    // Code editor input
    const codeEditor = document.getElementById('codeEditor');
    codeEditor.addEventListener('input', function() {
        updateCurrentFileContent(this.value);
        updateLineCount();
    });
    
    codeEditor.addEventListener('keyup', updateLineCount);
    codeEditor.addEventListener('click', updateLineCount);
    
    // Console controls
    document.getElementById('clearConsole').addEventListener('click', clearConsole);
    document.getElementById('toggleConsole').addEventListener('click', toggleConsole);
    
    // Console input
    document.getElementById('sendInput').addEventListener('click', function() {
        const input = document.getElementById('consoleInput').value;
        if (input.trim()) {
            addConsoleMessage(`> ${input}`, 'output');
            
            // Process input based on current language
            processConsoleInput(input);
            
            document.getElementById('consoleInput').value = '';
        }
    });
    
    document.getElementById('consoleInput').addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            document.getElementById('sendInput').click();
        }
    });
    
    // Keyboard shortcuts
    document.addEventListener('keydown', function(e) {
        // Ctrl+S to save
        if (e.ctrlKey && e.key === 's') {
            e.preventDefault();
            document.getElementById('saveCode').click();
        }
        
        // Ctrl+Enter to run code
        if (e.ctrlKey && e.key === 'Enter') {
            e.preventDefault();
            document.getElementById('runCode').click();
        }
        
        // Ctrl+` to toggle console
        if (e.ctrlKey && e.key === '`') {
            e.preventDefault();
            document.getElementById('toggleConsole').click();
        }
    });
}

// ============================================
// CONSOLE INPUT PROCESSING
// ============================================
function processConsoleInput(input) {
    const file = getFileById(state.currentFile);
    const language = file ? file.language : 'javascript';
    
    setTimeout(() => {
        switch(language) {
            case 'javascript':
                try {
                    const result = eval(input);
                    if (result !== undefined) {
                        addConsoleMessage(`Result: ${result}`, 'info');
                    }
                } catch (error) {
                    addConsoleMessage(`Error: ${error.message}`, 'error');
                }
                break;
            default:
                addConsoleMessage(`Input received: "${input}"`, 'info');
        }
    }, 300);
}

// ============================================
// AUTO-SAVE FUNCTIONALITY
// ============================================
setInterval(() => {
    if (state.autoSave) {
        const file = getFileById(state.currentFile);
        const editor = document.getElementById('codeEditor');
        
        if (file && file.content !== editor.value) {
            updateSaveStatus('Auto-saving...');
            setTimeout(() => {
                updateCurrentFileContent(editor.value);
                updateSaveStatus('All changes saved');
            }, 1000);
        }
    }
}, 10000); // Check every 10 seconds