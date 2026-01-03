let editor;
let currentLanguage = 'javascript';
let isPreviewVisible = false;

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
    editor.onDidChangeModelContent(() => saveCode());

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
    saveCode();
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
        javascript: `console.log('Hello, World!');

function greet(name) {
    return \`Hello, \${name}!\`;
}

console.log(greet('Developer'));

const numbers = [1, 2, 3, 4, 5];
const sum = numbers.reduce((a, b) => a + b, 0);
console.log('Sum:', sum);`,
        html: `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Document</title>
    <style>
        body { font-family: sans-serif; padding: 20px; }
        h1 { color: #667eea; }
    </style>
</head>
<body>
    <h1>Hello World</h1>
    <p>This is a preview of your HTML code.</p>
</body>
</html>`,
        css: `body {
    font-family: 'Segoe UI', sans-serif;
    margin: 0;
    padding: 20px;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

h1 {
    color: white;
    text-align: center;
}`,
        typescript: `function greet(name: string): string {
    return \`Hello, \${name}!\`;
}

console.log(greet('World'));

const numbers: number[] = [1, 2, 3, 4, 5];
const sum: number = numbers.reduce((a, b) => a + b, 0);
console.log('Sum:', sum);`,
        json: `{
    "name": "Example Project",
    "version": "1.0.0",
    "description": "Sample JSON configuration",
    "author": "Developer",
    "dependencies": {
        "example": "^1.0.0"
    }
}`,
        markdown: `# Hello World

This is a **Markdown** document.

## Features
- Easy to write
- Easy to read
- Supports **formatting**

### Code Example
\`\`\`javascript
console.log('Hello');
\`\`\``,
        shell: `#!/bin/bash

echo "Hello World"

for i in {1..5}; do
    echo "Number: $i"
done

name="Developer"
echo "Hello, $name"`,
        sql: `SELECT * FROM users
WHERE active = true
ORDER BY created_at DESC
LIMIT 10;

SELECT name, COUNT(*) as count
FROM orders
GROUP BY name
HAVING count > 5;`
    };
    return defaults[lang] || '';
}

function runCode() {
    const code = editor.getValue();
    const outputContent = document.getElementById('outputContent');

    clearOutput();

    addOutput(`Running ${currentLanguage} code...`, 'info');

    if (currentLanguage === 'html') {
        runHTMLCode(code);
    } else if (currentLanguage === 'css') {
        runCSSCode(code);
    } else if (currentLanguage === 'javascript' || currentLanguage === 'typescript') {
        runJavaScriptCode(code);
    } else if (currentLanguage === 'json') {
        runJSONCode(code);
    }
}

function runHTMLCode(code) {
    // Show preview if not visible
    const previewSection = document.getElementById('previewSection');
    if (!isPreviewVisible) {
        previewSection.style.display = 'flex';
        isPreviewVisible = true;
    }

    const preview = document.getElementById('preview');
    preview.srcdoc = code;

    addOutput('✓ HTML rendered in preview panel', 'success');
    addOutput(`Document contains ${code.split('\n').length} lines`, 'info');
}

function runCSSCode(code) {
    // Show preview if not visible
    const previewSection = document.getElementById('previewSection');
    if (!isPreviewVisible) {
        previewSection.style.display = 'flex';
        isPreviewVisible = true;
    }

    const html = '<div style="padding: 20px;"><h1>CSS Preview</h1><p>Your CSS has been applied to this preview.</p></div>';
    const fullCode = html + `<style>${code}</style>`;

    const preview = document.getElementById('preview');
    preview.srcdoc = fullCode;

    addOutput('✓ CSS applied in preview panel', 'success');
    const ruleCount = (code.match(/{/g) || []).length;
    addOutput(`Found ${ruleCount} CSS rule(s)`, 'info');
}

function runJavaScriptCode(code) {
    try {
        // Strip TypeScript type annotations if present
        let jsCode = code;
        if (currentLanguage === 'typescript') {
            // Basic TypeScript to JavaScript conversion - strip types
            jsCode = code
                .replace(/:\s*\w+\[\]/g, '')  // Remove array types
                .replace(/:\s*\w+/g, '')      // Remove simple types
                .replace(/\<\w+\>/g, '')      // Remove generic types
                .replace(/interface\s+\w+\s*{[^}]*}/g, '')  // Remove interfaces
                .replace(/type\s+\w+\s*=\s*[^;]+;/g, '');   // Remove type aliases
        }

        const originalLog = console.log;
        const logs = [];

        console.log = function (...args) {
            logs.push(args.map(arg =>
                typeof arg === 'object' ? JSON.stringify(arg, null, 2) : String(arg)
            ).join(' '));
            originalLog.apply(console, args);
        };

        eval(jsCode);

        console.log = originalLog;

        addOutput('✓ Code executed successfully', 'success');

        if (logs.length > 0) {
            addOutput('\nConsole Output:', 'info');
            logs.forEach(log => addOutput(log, 'output'));
        } else {
            addOutput('No console output', 'info');
        }

    } catch (error) {
        addOutput('✗ Error: ' + error.message, 'error');
    }
}

function runJSONCode(code) {
    try {
        const parsed = JSON.parse(code);
        addOutput('✓ Valid JSON', 'success');
        addOutput(`Type: ${Array.isArray(parsed) ? 'Array' : 'Object'}`, 'info');
        addOutput(`Keys: ${Object.keys(parsed).length}`, 'info');
        addOutput('\nParsed structure:', 'info');
        addOutput(JSON.stringify(parsed, null, 2), 'output');
    } catch (error) {
        addOutput('✗ Invalid JSON: ' + error.message, 'error');
    }
}

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
    const extensions = {
        javascript: 'js',
        html: 'html',
        css: 'css',
        python: 'py',
        java: 'java',
        c: 'c',
        cpp: 'cpp',
        csharp: 'cs',
        php: 'php',
        go: 'go',
        rust: 'rs',
        ruby: 'rb',
        typescript: 'ts',
        json: 'json',
        markdown: 'md',
        shell: 'sh',
        sql: 'sql'
    };

    const ext = extensions[currentLanguage] || 'txt';
    const blob = new Blob([code], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `code.${ext}`;
    a.click();
    URL.revokeObjectURL(url);
}

function clearCode() {
    if (confirm('Clear all code? This cannot be undone.')) {
        editor.setValue('');
        saveCode();
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
    const langNames = {
        javascript: 'JavaScript',
        typescript: 'TypeScript',
        html: 'HTML',
        css: 'CSS',
        json: 'JSON'
    };

    document.getElementById('languageStatus').textContent = langNames[currentLanguage] || currentLanguage;
}

function updateCursorPosition() {
    const position = editor.getPosition();
    document.getElementById('cursorPosition').textContent = `Ln ${position.lineNumber}, Col ${position.column}`;
}

function saveCode() {
    if (!editor) return;
    const code = editor.getValue();
    localStorage.setItem(`code_${currentLanguage}`, code);
}

function loadSavedCode() {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'light') {
        document.body.classList.add('light');
        monaco.editor.setTheme('vs');
        document.getElementById('themeBtn').innerHTML = '<i class="ri-sun-line"></i>';
    }

    const savedCode = localStorage.getItem(`code_${currentLanguage}`);
    if (savedCode) {
        editor.setValue(savedCode);
    }
}
