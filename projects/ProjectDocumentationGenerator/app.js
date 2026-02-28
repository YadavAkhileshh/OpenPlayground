// Project Documentation Generator core logic
// Drag & drop, scan files, extract comments/markdown, generate docs, live preview, export, search/filter

const uploadArea = document.getElementById('upload-area');
const fileInput = document.getElementById('file-input');
const selectBtn = document.getElementById('select-btn');
const scanStatus = document.getElementById('scan-status');
const previewArea = document.getElementById('preview-area');
const exportHtmlBtn = document.getElementById('export-html');
const exportPdfBtn = document.getElementById('export-pdf');
const searchInput = document.getElementById('search-input');

let docsContent = '';

// Drag & drop events
uploadArea.addEventListener('click', () => fileInput.click());
selectBtn.addEventListener('click', e => {
  e.stopPropagation();
  fileInput.click();
});

uploadArea.addEventListener('dragover', e => {
  e.preventDefault();
  uploadArea.classList.add('dragover');
});
uploadArea.addEventListener('dragleave', e => {
  e.preventDefault();
  uploadArea.classList.remove('dragover');
});
uploadArea.addEventListener('drop', e => {
  e.preventDefault();
  uploadArea.classList.remove('dragover');
  handleFiles(e.dataTransfer.files);
});
fileInput.addEventListener('change', e => handleFiles(e.target.files));

function handleFiles(files) {
  scanStatus.textContent = 'Scanning files...';
  previewArea.innerHTML = '';
  docsContent = '';
  const fileArr = [...files];
  let processed = 0;
  let allDocs = [];
  fileArr.forEach(file => {
    const ext = file.name.split('.').pop().toLowerCase();
    if (["js","ts","py","java","c","cpp","md","html","css"].includes(ext)) {
      const reader = new FileReader();
      reader.onload = e => {
        let doc = extractDocs(e.target.result, ext, file.name);
        if (doc) allDocs.push(doc);
        processed++;
        if (processed === fileArr.length) {
          docsContent = allDocs.join('\n---\n');
          showPreview(docsContent);
        }
      };
      reader.readAsText(file);
    } else {
      processed++;
      if (processed === fileArr.length) {
        docsContent = allDocs.join('\n---\n');
        showPreview(docsContent);
      }
    }
  });
}

function extractDocs(content, ext, filename) {
  let doc = `## ${filename}\n`;
  if (ext === 'md') {
    doc += content;
  } else if (ext === 'js' || ext === 'ts') {
    // Extract JS/TS comments
    const matches = content.match(/\/\*\*[\s\S]*?\*\/|\/\/.*$/gm);
    if (matches) doc += matches.join('\n');
  } else if (ext === 'py') {
    // Extract Python docstrings and comments
    const matches = content.match(/"""[\s\S]*?"""|\'\'\'[\s\S]*?\'\'\'|#.*$/gm);
    if (matches) doc += matches.join('\n');
  } else if (ext === 'java' || ext === 'c' || ext === 'cpp') {
    // Extract C/Java comments
    const matches = content.match(/\/\*\*[\s\S]*?\*\/|\/\/.*$/gm);
    if (matches) doc += matches.join('\n');
  } else if (ext === 'html') {
    // Extract HTML comments
    const matches = content.match(/<!--([\s\S]*?)-->/gm);
    if (matches) doc += matches.join('\n');
  } else if (ext === 'css') {
    // Extract CSS comments
    const matches = content.match(/\/\*[\s\S]*?\*\//gm);
    if (matches) doc += matches.join('\n');
  }
  return doc.trim();
}

function showPreview(md) {
  scanStatus.textContent = 'Scan complete.';
  searchInput.style.display = 'block';
  exportHtmlBtn.style.display = 'inline-block';
  exportPdfBtn.style.display = 'inline-block';
  // Simple markdown to HTML (headings, code, lists, bold, italics)
  let html = md
    .replace(/^### (.*)$/gm, '<h3>$1</h3>')
    .replace(/^## (.*)$/gm, '<h2>$1</h2>')
    .replace(/^# (.*)$/gm, '<h1>$1</h1>')
    .replace(/\*\*(.*?)\*\*/g, '<b>$1</b>')
    .replace(/\*(.*?)\*/g, '<i>$1</i>')
    .replace(/`([^`]+)`/g, '<code>$1</code>')
    .replace(/\n/g, '<br>');
  previewArea.innerHTML = html;
}

searchInput.addEventListener('input', e => {
  const val = e.target.value.toLowerCase();
  if (!val) {
    showPreview(docsContent);
    return;
  }
  // Filter sections by filename or content
  const sections = docsContent.split('---');
  const filtered = sections.filter(sec => sec.toLowerCase().includes(val)).join('\n---\n');
  showPreview(filtered);
});

exportHtmlBtn.addEventListener('click', () => {
  const blob = new Blob([
    '<html><body>' + previewArea.innerHTML + '</body></html>'
  ], {type:'text/html'});
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = 'documentation.html';
  a.click();
});

exportPdfBtn.addEventListener('click', () => {
  // Use browser print to PDF
  const win = window.open('', '', 'width=800,height=600');
  win.document.write('<html><head><title>Docs PDF</title></head><body>' + previewArea.innerHTML + '</body></html>');
  win.document.close();
  win.print();
});

// Dark mode support (auto)
if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
  document.body.classList.add('dark');
}
