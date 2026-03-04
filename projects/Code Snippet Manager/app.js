// Code Snippet Manager
// Vanilla JS, HTML, CSS

const addSnippetBtn = document.getElementById('addSnippetBtn');
const importBtn = document.getElementById('importBtn');
const exportBtn = document.getElementById('exportBtn');
const searchInput = document.getElementById('searchInput');
const snippetList = document.getElementById('snippetList');
const snippetFormSection = document.getElementById('snippetFormSection');
const snippetForm = document.getElementById('snippetForm');
const titleInput = document.getElementById('titleInput');
const tagsInput = document.getElementById('tagsInput');
const languageInput = document.getElementById('languageInput');
const codeInput = document.getElementById('codeInput');
const cancelBtn = document.getElementById('cancelBtn');

let snippets = [];
let editIndex = null;

function saveSnippets() {
    localStorage.setItem('snippets', JSON.stringify(snippets));
}
function loadSnippets() {
    snippets = JSON.parse(localStorage.getItem('snippets')) || [];
}

function renderSnippets(filter = '') {
    snippetList.innerHTML = '';
    const filtered = snippets.filter(s =>
        s.title.toLowerCase().includes(filter) ||
        s.tags.join(',').toLowerCase().includes(filter) ||
        s.language.toLowerCase().includes(filter) ||
        s.code.toLowerCase().includes(filter)
    );
    filtered.forEach((snippet, i) => {
        const li = document.createElement('li');
        li.className = 'snippet-item';
        const header = document.createElement('div');
        header.className = 'snippet-header';
        const title = document.createElement('span');
        title.className = 'snippet-title';
        title.textContent = snippet.title;
        const tags = document.createElement('span');
        tags.className = 'snippet-tags';
        tags.textContent = snippet.tags.join(', ');
        const actions = document.createElement('span');
        actions.className = 'snippet-actions';
        const editBtn = document.createElement('button');
        editBtn.textContent = '✎';
        editBtn.onclick = () => openForm(snippet, i);
        const delBtn = document.createElement('button');
        delBtn.textContent = '✕';
        delBtn.onclick = () => {
            snippets.splice(i, 1);
            saveSnippets();
            renderSnippets(searchInput.value.toLowerCase());
        };
        const copyBtn = document.createElement('button');
        copyBtn.textContent = '⧉';
        copyBtn.onclick = () => {
            navigator.clipboard.writeText(snippet.code);
            copyBtn.textContent = '✔';
            setTimeout(() => copyBtn.textContent = '⧉', 1000);
        };
        actions.appendChild(editBtn);
        actions.appendChild(delBtn);
        actions.appendChild(copyBtn);
        header.appendChild(title);
        header.appendChild(tags);
        header.appendChild(actions);
        li.appendChild(header);
        const code = document.createElement('pre');
        code.className = 'snippet-code';
        code.textContent = snippet.code;
        li.appendChild(code);
        snippetList.appendChild(li);
    });
}

function openForm(snippet = null, index = null) {
    snippetFormSection.style.display = '';
    if (snippet) {
        titleInput.value = snippet.title;
        tagsInput.value = snippet.tags.join(', ');
        languageInput.value = snippet.language;
        codeInput.value = snippet.code;
        editIndex = index;
    } else {
        snippetForm.reset();
        editIndex = null;
    }
}

addSnippetBtn.onclick = () => openForm();
cancelBtn.onclick = () => {
    snippetFormSection.style.display = 'none';
    snippetForm.reset();
    editIndex = null;
};

snippetForm.onsubmit = e => {
    e.preventDefault();
    const title = titleInput.value.trim();
    const tags = tagsInput.value.split(',').map(t => t.trim()).filter(Boolean);
    const language = languageInput.value;
    const code = codeInput.value;
    if (editIndex !== null) {
        snippets[editIndex] = { title, tags, language, code };
    } else {
        snippets.push({ title, tags, language, code });
    }
    saveSnippets();
    renderSnippets(searchInput.value.toLowerCase());
    snippetFormSection.style.display = 'none';
    snippetForm.reset();
    editIndex = null;
};

searchInput.oninput = () => {
    renderSnippets(searchInput.value.toLowerCase());
};

importBtn.onclick = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json,application/json';
    input.onchange = e => {
        const file = e.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = evt => {
            try {
                const imported = JSON.parse(evt.target.result);
                if (Array.isArray(imported)) {
                    snippets = imported;
                    saveSnippets();
                    renderSnippets(searchInput.value.toLowerCase());
                } else {
                    alert('Invalid JSON format.');
                }
            } catch {
                alert('Failed to parse JSON.');
            }
        };
        reader.readAsText(file);
    };
    input.click();
};

exportBtn.onclick = () => {
    const data = JSON.stringify(snippets, null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'snippets.json';
    a.click();
    URL.revokeObjectURL(url);
};

// On load
loadSnippets();
renderSnippets();
