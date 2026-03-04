// DOM Elements
const codeInput = document.getElementById('code-input');
const codePreview = document.getElementById('code-preview');
const highlightedCode = document.getElementById('highlighted-code');
const languageSelect = document.getElementById('language');
const snippetTitle = document.getElementById('snippet-title');
const charCount = document.getElementById('char-count');
const snippetsList = document.getElementById('snippets-list');
const toast = document.getElementById('toast');

// Buttons
const copyBtn = document.getElementById('copy-btn');
const downloadBtn = document.getElementById('download-btn');
const saveBtn = document.getElementById('save-btn');
const clearBtn = document.getElementById('clear-btn');
const togglePreviewBtn = document.getElementById('toggle-preview');

// Storage key
const STORAGE_KEY = 'codeSnippets';

// Initialize
let snippets = loadSnippets();
renderSnippets();

// Event Listeners
codeInput.addEventListener('input', () => {
    updatePreview();
    updateCharCount();
});

languageSelect.addEventListener('change', updatePreview);

copyBtn.addEventListener('click', copyToClipboard);
downloadBtn.addEventListener('click', downloadSnippet);
saveBtn.addEventListener('click', saveSnippet);
clearBtn.addEventListener('click', clearEditor);
togglePreviewBtn.addEventListener('click', togglePreview);

// Functions
function updatePreview() {
    const code = codeInput.value;
    const language = languageSelect.value;
    
    highlightedCode.textContent = code;
    highlightedCode.className = `language-${language}`;
    
    // Apply syntax highlighting
    hljs.highlightElement(highlightedCode);
}

function updateCharCount() {
    const count = codeInput.value.length;
    charCount.textContent = `${count} character${count !== 1 ? 's' : ''}`;
}

function copyToClipboard() {
    const code = codeInput.value;
    
    if (!code.trim()) {
        showToast('Nothing to copy!', 'error');
        return;
    }
    
    navigator.clipboard.writeText(code).then(() => {
        showToast('Code copied to clipboard! 📋', 'success');
    }).catch(err => {
        showToast('Failed to copy code', 'error');
        console.error('Copy failed:', err);
    });
}

function downloadSnippet() {
    const code = codeInput.value;
    const language = languageSelect.value;
    const title = snippetTitle.value || 'snippet';
    
    if (!code.trim()) {
        showToast('Nothing to download!', 'error');
        return;
    }
    
    // Determine file extension
    const extensions = {
        javascript: 'js',
        python: 'py',
        java: 'java',
        cpp: 'cpp',
        csharp: 'cs',
        html: 'html',
        css: 'css',
        php: 'php',
        ruby: 'rb',
        go: 'go',
        rust: 'rs',
        sql: 'sql',
        json: 'json',
        xml: 'xml',
        markdown: 'md'
    };
    
    const extension = extensions[language] || 'txt';
    const filename = `${title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.${extension}`;
    
    const blob = new Blob([code], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    showToast(`Downloaded as ${filename} 💾`, 'success');
}

function saveSnippet() {
    const code = codeInput.value;
    const language = languageSelect.value;
    const title = snippetTitle.value || 'Untitled Snippet';
    
    if (!code.trim()) {
        showToast('Cannot save empty snippet!', 'error');
        return;
    }
    
    const snippet = {
        id: Date.now(),
        title: title,
        code: code,
        language: language,
        date: new Date().toLocaleString()
    };
    
    snippets.unshift(snippet);
    saveSnippets();
    renderSnippets();
    
    showToast('Snippet saved! 💾', 'success');
}

function clearEditor() {
    if (codeInput.value.trim() && !confirm('Are you sure you want to clear the editor?')) {
        return;
    }
    
    codeInput.value = '';
    snippetTitle.value = '';
    updatePreview();
    updateCharCount();
    showToast('Editor cleared! 🗑️', 'info');
}

function togglePreview() {
    const previewSection = document.querySelector('.preview-section');
    previewSection.classList.toggle('hidden');
    
    if (previewSection.classList.contains('hidden')) {
        showToast('Preview hidden', 'info');
    } else {
        showToast('Preview shown', 'info');
    }
}

function loadSnippet(id) {
    const snippet = snippets.find(s => s.id === id);
    
    if (snippet) {
        codeInput.value = snippet.code;
        snippetTitle.value = snippet.title;
        languageSelect.value = snippet.language;
        updatePreview();
        updateCharCount();
        
        // Scroll to top
        window.scrollTo({ top: 0, behavior: 'smooth' });
        
        showToast('Snippet loaded! 📝', 'success');
    }
}

function deleteSnippet(id) {
    if (!confirm('Are you sure you want to delete this snippet?')) {
        return;
    }
    
    snippets = snippets.filter(s => s.id !== id);
    saveSnippets();
    renderSnippets();
    showToast('Snippet deleted! 🗑️', 'success');
}

function renderSnippets() {
    if (snippets.length === 0) {
        snippetsList.innerHTML = '<div class="empty-state">No saved snippets yet. Create your first one! 🚀</div>';
        return;
    }
    
    snippetsList.innerHTML = snippets.map(snippet => `
        <div class="snippet-card">
            <h3>${escapeHtml(snippet.title)}</h3>
            <div class="snippet-meta">
                <span>📝 ${snippet.language}</span>
                <span>🕒 ${snippet.date}</span>
            </div>
            <div class="snippet-preview">${escapeHtml(snippet.code.substring(0, 150))}${snippet.code.length > 150 ? '...' : ''}</div>
            <div class="snippet-actions">
                <button class="snippet-btn" onclick="loadSnippet(${snippet.id})">
                    📂 Load
                </button>
                <button class="snippet-btn" onclick="deleteSnippet(${snippet.id})">
                    🗑️ Delete
                </button>
            </div>
        </div>
    `).join('');
}

function loadSnippets() {
    try {
        const saved = localStorage.getItem(STORAGE_KEY);
        return saved ? JSON.parse(saved) : [];
    } catch (e) {
        console.error('Error loading snippets:', e);
        return [];
    }
}

function saveSnippets() {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(snippets));
    } catch (e) {
        console.error('Error saving snippets:', e);
        showToast('Failed to save snippet', 'error');
    }
}

function showToast(message, type = 'info') {
    toast.textContent = message;
    toast.className = `toast ${type} show`;
    
    setTimeout(() => {
        toast.classList.remove('show');
    }, 3000);
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Initialize preview on load
updatePreview();
updateCharCount();

// Add keyboard shortcuts
document.addEventListener('keydown', (e) => {
    // Ctrl/Cmd + S to save
    if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        saveSnippet();
    }
    
    // Ctrl/Cmd + K to clear
    if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        clearEditor();
    }
    
    // Ctrl/Cmd + D to download
    if ((e.ctrlKey || e.metaKey) && e.key === 'd') {
        e.preventDefault();
        downloadSnippet();
    }
});