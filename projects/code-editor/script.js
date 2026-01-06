let editor;
let currentLanguage = 'javascript';
let isPreviewVisible = false;
let autoSaveTimer; // Variable for debouncing

require.config({ paths: { vs: 'https://cdn.jsdelivr.net/npm/monaco-editor@0.45.0/min/vs' } });

require(['vs/editor/editor.main'], function () {
    initEditor();
    setupEventListeners();
    loadSavedCode();
    updateStatusBar();
});

function initEditor() {
    editor = monaco.editor.create(document.getElementById('editor'), {
        value: getDefaultCode('javascript'),
        language: 'javascript',
        theme: 'vs-dark',
        automaticLayout: true,
        fontSize: 14,
        fontFamily: "'Consolas', 'Monaco', 'Courier New', monospace",
        lineNumbers: 'on',
        roundedSelection: true,
        scrollBeyondLastLine: false,
        minimap: { enabled: true },
        wordWrap: 'on',
        tabSize: 2,
        insertSpaces: true,
        formatOnPaste: true,
        formatOnType: true,
        suggestOnTriggerCharacters: true,
        quickSuggestions: true,
        folding: true,
        foldingStrategy: 'indentation',
        showFoldingControls: 'always',
        scrollbar: {
            vertical: 'visible',
            horizontal: 'visible',
            useShadows: false
        }
    });

    editor.onDidChangeCursorPosition(() => updateCursorPosition());
    
    // Updated to use the new debounced save function
    editor.onDidChangeModelContent(() => debouncedSave());

    editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.Enter, runCode);
    editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyS, (e) => downloadCode());
}

function setupEventListeners() {
    document.getElementById('languageSelector').addEventListener('change', (e) => {
        switchLanguage(e.target.value);
    });

    document.getElementById('runBtn').addEventListener('click', runCode);
    document.getElementById('previewBtn').addEventListener('click', togglePreview);
    document.getElementById('closePreview').addEventListener('click', togglePreview);
    document.getElementById('downloadBtn').addEventListener('click', downloadCode);
    document.getElementById('clearBtn').addEventListener('click', clearCode);
    document.getElementById('themeBtn').addEventListener('click', toggleTheme);
    document.getElementById('clearOutput').addEventListener('click', clearOutput);
}

function switchLanguage(lang) {
    // Save current before switching
    const code = editor.getValue();
    localStorage.setItem(`code_${currentLanguage}`, code);
    
    currentLanguage = lang;

    const model = editor.getModel();
    monaco.editor.setModelLanguage(model, getMonacoLanguage(lang));

    const savedCode = localStorage.getItem(`code_${lang}`);
    if (savedCode) {
        editor.setValue(savedCode);
    } else {
        editor.setValue(getDefaultCode(lang));
    }

    updateStatusBar();
    clearOutput();
}

function getMonacoLanguage(lang) {
    const langMap = {
        'javascript': 'javascript',
        'typescript': 'typescript',
        'html': 'html',
        'css': 'css',
        'json': 'json'
    };
    return langMap[lang] || 'plaintext';
}

function getDefaultCode(lang) {
    const defaults = {
        javascript: `console.log('Hello, World!');`,
        html: `<!DOCTYPE html>\n<html>\n<body>\n  <h1>Hello World</h1>\n</body>\n</html>`,
        css: `body { background: #f0f0f0; }`,
        typescript: `const greet = (name: string) => \`Hello \${name}\`;`,
        json: `{\n  "name": "OpenPlayground"\n}`
    };
    return defaults[lang] || '';
}

function runCode() {
    const code = editor.getValue();
    const outputContent = document.getElementById('outputContent');
    clearOutput();
    addOutput(`Running ${currentLanguage} code...`, 'info');

    if (currentLanguage === 'html') runHTMLCode(code);
    else if (currentLanguage === 'css') runCSSCode(code);
    else if (currentLanguage === 'javascript' || currentLanguage === 'typescript') runJavaScriptCode(code);
    else if (currentLanguage === 'json') runJSONCode(code);
}

// Logic for other run functions stays the same... (omitted for brevity)

function addOutput(text, type = 'output') {
    const outputContent = document.getElementById('outputContent');
    const line = document.createElement('div');
    line.className = `output-line output-${type}`;
    line.textContent = text;
    outputContent.appendChild(line);
    outputContent.scrollTop = outputContent.scrollHeight;
}

function clearOutput() {
    const outputContent = document.getElementById('outputContent');
    outputContent.innerHTML = '<div class="output-placeholder">Click "Run" to execute code</div>';
}

function togglePreview() {
    const previewSection = document.getElementById('previewSection');
    isPreviewVisible = !isPreviewVisible;
    previewSection.style.display = isPreviewVisible ? 'flex' : 'none';
}

function downloadCode() {
    const code = editor.getValue();
    const blob = new Blob([code], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `code_file`;
    a.click();
}

// Updated clearCode to also clear the specific localStorage entry
function clearCode() {
    if (confirm('Clear all code? This will also remove saved progress for this language.')) {
        editor.setValue('');
        localStorage.removeItem(`code_${currentLanguage}`);
        clearOutput();
    }
}

function toggleTheme() {
    const body = document.body;
    const btn = document.getElementById('themeBtn');
    const isLight = body.classList.toggle('light');
    monaco.editor.setTheme(isLight ? 'vs' : 'vs-dark');
    btn.innerHTML = isLight ? '<i class="ri-sun-line"></i>' : '<i class="ri-moon-line"></i>';
    localStorage.setItem('theme', isLight ? 'light' : 'dark');
}

function updateStatusBar() {
    document.getElementById('languageStatus').textContent = currentLanguage.toUpperCase();
}

function updateCursorPosition() {
    const position = editor.getPosition();
    document.getElementById('cursorPosition').textContent = `Ln ${position.lineNumber}, Col ${position.column}`;
}

// --- PERSISTENCE LOGIC FOR ISSUE #174 ---

function debouncedSave() {
    clearTimeout(autoSaveTimer);
    autoSaveTimer = setTimeout(() => {
        saveCode();
    }, 1000); // Wait 1 second after typing stops
}

function saveCode() {
    if (!editor) return;
    const code = editor.getValue();
    localStorage.setItem(`code_${currentLanguage}`, code);
    console.log(`Auto-saved ${currentLanguage}`);
}

function loadSavedCode() {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'light') {
        document.body.classList.add('light');
        monaco.editor.setTheme('vs');
    }

    const savedCode = localStorage.getItem(`code_${currentLanguage}`);
    if (savedCode) {
        editor.setValue(savedCode);
    }
}