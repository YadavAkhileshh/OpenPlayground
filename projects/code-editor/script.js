let editor;
let currentLanguage = 'javascript';
let isPreviewVisible = false;
let autoSaveTimer;
let currentTheme = 'vs-dark';

const defineCustomThemes = () => {
    monaco.editor.defineTheme('dracula', {
        base: 'vs-dark',
        inherit: true,
        rules: [
            { token: 'comment', foreground: '6272a4' },
            { token: 'string', foreground: 'f1fa8c' },
            { token: 'keyword', foreground: 'ff79c6' },
            { token: 'number', foreground: 'bd93f9' },
            { token: 'type', foreground: '8be9fd' },
            { token: 'function', foreground: '50fa7b' },
            { token: 'variable', foreground: 'f8f8f2' },
            { token: 'operator', foreground: 'ff79c6' },
            { token: 'constant', foreground: 'bd93f9' },
            { token: 'class', foreground: '8be9fd' }
        ],
        colors: {
            'editor.foreground': '#f8f8f2',
            'editor.background': '#282a36',
            'editor.selectionBackground': '#44475a',
            'editor.lineHighlightBackground': '#44475a',
            'editorCursor.foreground': '#f8f8f2',
            'editorWhitespace.foreground': '#3B3A32',
            'editorIndentGuide.activeBackground': '#9D550F',
            'editor.selectionHighlightBorder': '#222218'
        }
    });

    monaco.editor.defineTheme('monokai', {
        base: 'vs-dark',
        inherit: true,
        rules: [
            { token: 'comment', foreground: '75715e' },
            { token: 'string', foreground: 'e6db74' },
            { token: 'keyword', foreground: 'f92672' },
            { token: 'number', foreground: 'ae81ff' },
            { token: 'type', foreground: '66d9ef' },
            { token: 'function', foreground: 'a6e22e' },
            { token: 'variable', foreground: 'f8f8f2' },
            { token: 'operator', foreground: 'f92672' },
            { token: 'constant', foreground: 'ae81ff' },
            { token: 'class', foreground: 'a6e22e' }
        ],
        colors: {
            'editor.foreground': '#f8f8f2',
            'editor.background': '#272822',
            'editor.selectionBackground': '#49483e',
            'editor.lineHighlightBackground': '#3e3d32',
            'editorCursor.foreground': '#f8f8f2',
            'editorWhitespace.foreground': '#3B3A32',
            'editorIndentGuide.activeBackground': '#9D550F',
            'editor.selectionHighlightBorder': '#222218'
        }
    });
};

require.config({ paths: { vs: 'https://cdn.jsdelivr.net/npm/monaco-editor@0.45.0/min/vs' } });

require(['vs/editor/editor.main'], function () {
    defineCustomThemes();
    initEditor();
    setupEventListeners();
    loadSavedCode();
    updateStatusBar();
});

function initEditor() {
    const savedTheme = localStorage.getItem('editorTheme') || 'vs-dark';
    currentTheme = savedTheme;
    
    editor = monaco.editor.create(document.getElementById('editor'), {
        value: getDefaultCode('javascript'),
        language: 'javascript',
        theme: currentTheme,
        automaticLayout: true,
        fontSize: 14,
        fontFamily: "'Consolas', 'Monaco', 'Courier New', monospace",
        lineNumbers: 'on',
        roundedSelection: true,
        scrollBeyondLastLine: false,
        minimap: { enabled: true },
        wordWrap: 'on',
        tabSize: getTabSize('javascript'),
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
    editor.onDidChangeModelContent(() => debouncedSave());
    editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.Enter, runCode);
    editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyS, (e) => downloadCode());

    document.getElementById('themeSelector').value = currentTheme;
}

function setupEventListeners() {
    document.getElementById('languageSelector').addEventListener('change', (e) => {
        switchLanguage(e.target.value);
    });

    document.getElementById('themeSelector').addEventListener('change', (e) => {
        switchTheme(e.target.value);
    });

    document.getElementById('runBtn').addEventListener('click', runCode);
    document.getElementById('previewBtn').addEventListener('click', togglePreview);
    document.getElementById('closePreview').addEventListener('click', togglePreview);
    document.getElementById('downloadBtn').addEventListener('click', downloadCode);
    document.getElementById('clearBtn').addEventListener('click', clearCode);
    document.getElementById('clearOutput').addEventListener('click', clearOutput);
}

function switchLanguage(lang) {
    const code = editor.getValue();
    localStorage.setItem(`code_${currentLanguage}`, code);
    
    currentLanguage = lang;

    const model = editor.getModel();
    monaco.editor.setModelLanguage(model, getMonacoLanguage(lang));
    
    editor.updateOptions({ tabSize: getTabSize(lang) });

    const savedCode = localStorage.getItem(`code_${lang}`);
    if (savedCode) {
        editor.setValue(savedCode);
    } else {
        editor.setValue(getDefaultCode(lang));
    }

    updateStatusBar();
    clearOutput();
}

function switchTheme(themeName) {
    currentTheme = themeName;
    monaco.editor.setTheme(themeName);
    localStorage.setItem('editorTheme', themeName);
    updateStatusBar();
}

function getMonacoLanguage(lang) {
    const langMap = {
        'javascript': 'javascript',
        'python': 'python',
        'java': 'java',
        'cpp': 'cpp',
        'typescript': 'typescript',
        'html': 'html',
        'css': 'css',
        'json': 'json'
    };
    return langMap[lang] || 'plaintext';
}

function getTabSize(lang) {
    const tabSizes = {
        'python': 4,
        'java': 4,
        'cpp': 4,
        'default': 2
    };
    return tabSizes[lang] || tabSizes.default;
}

function getDefaultCode(lang) {
    const defaults = {
        javascript: `// JavaScript Code
console.log('Hello, World!');

function calculateSum(a, b) {
    return a + b;
}

const result = calculateSum(5, 3);
console.log('Result:', result);`,

        python: `# Python Code
def greet(name):
    """Greet the user"""
    return f"Hello, {name}!"

class Calculator:
    def __init__(self):
        self.result = 0
    
    def add(self, a, b):
        return a + b

if __name__ == "__main__":
    print(greet("World"))
    calc = Calculator()
    print(f"2 + 3 = {calc.add(2, 3)}")`,

        java: `// Java Code
public class Main {
    public static void main(String[] args) {
        System.out.println("Hello, World!");
        
        int sum = addNumbers(5, 3);
        System.out.println("Sum: " + sum);
        
        Person person = new Person("Alice");
        person.greet();
    }
    
    public static int addNumbers(int a, int b) {
        return a + b;
    }
}

class Person {
    private String name;
    
    public Person(String name) {
        this.name = name;
    }
    
    public void greet() {
        System.out.println("Hello, my name is " + name);
    }
}`,

        cpp: `// C++ Code
#include <iostream>
#include <string>

using namespace std;

class Calculator {
public:
    int add(int a, int b) {
        return a + b;
    }
    
    double add(double a, double b) {
        return a + b;
    }
};

int main() {
    cout << "Hello, World!" << endl;
    
    Calculator calc;
    int result = calc.add(5, 3);
    cout << "5 + 3 = " << result << endl;
    
    return 0;
}`,

        typescript: `// TypeScript Code
interface Person {
    name: string;
    age: number;
}

function greet(person: Person): string {
    return \`Hello, \${person.name}! You are \${person.age} years old.\`;
}

class Employee implements Person {
    constructor(public name: string, public age: number, public position: string) {}
    
    introduce(): void {
        console.log(greet(this));
        console.log(\`I work as a \${this.position}.\`);
    }
}

const alice = new Employee('Alice', 30, 'Developer');
alice.introduce();`,

        html: `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>My Page</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            margin: 40px;
            background: #f0f0f0;
        }
        h1 {
            color: #333;
        }
    </style>
</head>
<body>
    <h1>Hello, World!</h1>
    <p>Welcome to my HTML page.</p>
    <button onclick="alert('Button clicked!')">Click me</button>
    <script>
        console.log('Page loaded successfully');
    </script>
</body>
</html>`,

        css: `/* CSS Styles */
body {
    font-family: 'Arial', sans-serif;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    margin: 0;
    padding: 0;
    min-height: 100vh;
}

.container {
    max-width: 1200px;
    margin: 0 auto;
    padding: 20px;
}

.card {
    background: white;
    border-radius: 10px;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    padding: 30px;
    margin: 20px 0;
}

.btn {
    background: #4CAF50;
    color: white;
    border: none;
    padding: 10px 20px;
    border-radius: 5px;
    cursor: pointer;
    transition: background 0.3s;
}

.btn:hover {
    background: #45a049;
}

@media (max-width: 768px) {
    .container {
        padding: 10px;
    }
    
    .card {
        padding: 20px;
    }
}`,

        json: `{
  "name": "Code Editor",
  "version": "1.0.0",
  "description": "Professional code editor with multi-language support",
  "features": [
    "Syntax highlighting",
    "Multiple themes",
    "Code execution",
    "Auto-save",
    "Preview mode"
  ],
  "languages": [
    "JavaScript",
    "Python",
    "Java",
    "C++",
    "TypeScript",
    "HTML",
    "CSS",
    "JSON"
  ],
  "author": "OpenPlayground",
  "license": "MIT"
}`
    };
    
    return defaults[lang] || `// ${lang.toUpperCase()} Code\n// Start coding here...`;
}

function runCode() {
    const code = editor.getValue();
    const outputContent = document.getElementById('outputContent');
    clearOutput();
    addOutput(`Running ${currentLanguage} code...`, 'info');

    try {
        if (currentLanguage === 'html') runHTMLCode(code);
        else if (currentLanguage === 'css') runCSSCode(code);
        else if (currentLanguage === 'javascript' || currentLanguage === 'typescript') runJavaScriptCode(code);
        else if (currentLanguage === 'json') runJSONCode(code);
        else if (currentLanguage === 'python' || currentLanguage === 'java' || currentLanguage === 'cpp') {
            runUnsupportedLanguage(code);
        }
    } catch (error) {
        addOutput(`Error: ${error.message}`, 'error');
    }
}

function runHTMLCode(code) {
    const preview = document.getElementById('preview');
    preview.srcdoc = code;
    addOutput('HTML rendered successfully! Open preview panel to view.', 'success');
}

function runCSSCode(code) {
    const style = document.createElement('style');
    style.textContent = code;
    document.head.appendChild(style);
    addOutput('CSS applied to page. Check the appearance of this editor.', 'success');
    
    setTimeout(() => {
        if (style.parentNode) {
            style.parentNode.removeChild(style);
        }
    }, 5000);
}

function runJavaScriptCode(code) {
    try {
        const logMessages = [];
        const originalLog = console.log;
        console.log = (...args) => {
            logMessages.push(args.map(arg => 
                typeof arg === 'object' ? JSON.stringify(arg, null, 2) : String(arg)
            ).join(' '));
            originalLog.apply(console, args);
        };

        const result = eval(code);
        
        console.log = originalLog;

        logMessages.forEach(msg => addOutput(msg, 'output'));
        
        if (result !== undefined) {
            addOutput(`Result: ${typeof result === 'object' ? JSON.stringify(result, null, 2) : result}`, 'success');
        }
        
        addOutput('JavaScript executed successfully!', 'success');
    } catch (error) {
        addOutput(`Error: ${error.message}`, 'error');
    }
}

function runJSONCode(code) {
    try {
        const parsed = JSON.parse(code);
        addOutput('Valid JSON!', 'success');
        addOutput(JSON.stringify(parsed, null, 2), 'output');
    } catch (error) {
        addOutput(`Invalid JSON: ${error.message}`, 'error');
    }
}

function runUnsupportedLanguage(code) {
    addOutput(`⚠️ ${currentLanguage.toUpperCase()} execution not supported in browser`, 'warning');
    addOutput('Code syntax highlighting is available, but execution requires a backend server.', 'info');
    addOutput('Code snippet:', 'info');
    addOutput('```' + currentLanguage, 'output');
    addOutput(code, 'output');
    addOutput('```', 'output');
}

function addOutput(text, type = 'output') {
    const outputContent = document.getElementById('outputContent');
    const line = document.createElement('div');
    line.className = `output-line output-${type}`;
    
    if (text.includes('\n')) {
        const lines = text.split('\n');
        lines.forEach((lineText, index) => {
            const lineElem = document.createElement('div');
            lineElem.className = `output-line output-${type}`;
            lineElem.textContent = lineText;
            outputContent.appendChild(lineElem);
        });
    } else {
        line.textContent = text;
        outputContent.appendChild(line);
    }
    
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
    
    if (isPreviewVisible && currentLanguage === 'html') {
        const preview = document.getElementById('preview');
        preview.srcdoc = editor.getValue();
    }
}

function downloadCode() {
    const code = editor.getValue();
    const blob = new Blob([code], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `code.${getFileExtension(currentLanguage)}`;
    a.click();
}

function getFileExtension(lang) {
    const extensions = {
        'javascript': 'js',
        'typescript': 'ts',
        'python': 'py',
        'java': 'java',
        'cpp': 'cpp',
        'html': 'html',
        'css': 'css',
        'json': 'json'
    };
    return extensions[lang] || 'txt';
}

function clearCode() {
    if (confirm('Clear all code? This will also remove saved progress for this language.')) {
        editor.setValue('');
        localStorage.removeItem(`code_${currentLanguage}`);
        clearOutput();
    }
}

function debouncedSave() {
    clearTimeout(autoSaveTimer);
    autoSaveTimer = setTimeout(() => {
        saveCode();
    }, 1000);
}

function saveCode() {
    if (!editor) return;
    const code = editor.getValue();
    localStorage.setItem(`code_${currentLanguage}`, code);
}

function loadSavedCode() {
    const savedTheme = localStorage.getItem('editorTheme') || 'vs-dark';
    currentTheme = savedTheme;
    
    if (editor) {
        monaco.editor.setTheme(savedTheme);
    }
    
    document.getElementById('themeSelector').value = savedTheme;
    
    const savedCode = localStorage.getItem(`code_${currentLanguage}`);
    if (savedCode && editor) {
        editor.setValue(savedCode);
    }
}

function updateStatusBar() {
    document.getElementById('languageStatus').textContent = currentLanguage.toUpperCase();
    
    const themeNames = {
        'vs-dark': 'Dark',
        'vs': 'Light',
        'dracula': 'Dracula',
        'monokai': 'Monokai'
    };
    document.getElementById('themeStatus').textContent = themeNames[currentTheme] || 'Custom';
}

function updateCursorPosition() {
    const position = editor.getPosition();
    document.getElementById('cursorPosition').textContent = `Ln ${position.lineNumber}, Col ${position.column}`;
}