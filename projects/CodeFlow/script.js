import mermaid from 'https://cdn.jsdelivr.net/npm/mermaid@10.9.5/dist/mermaid.esm.min.mjs';

mermaid.initialize({ startOnLoad: false });

// Theme toggle
const themeBtn = document.getElementById('themeToggle');
if (themeBtn) {
  themeBtn.addEventListener('click', () => {
    document.body.classList.toggle('dark-theme');
    themeBtn.textContent =
      document.body.classList.contains('dark-theme') ? '☀️' : '🌙';
  });
}

// Render flowchart
const renderBtn = document.getElementById('renderBtn');
if (renderBtn) {
  renderBtn.addEventListener('click', () => {
    const code = document.getElementById('code').value.trim();
    const chart = document.getElementById('chart');
    chart.innerHTML = '';

    const temp = document.createElement('div');
    temp.className = 'mermaid';
    temp.textContent = code;
    chart.appendChild(temp);

    mermaid.init(undefined, temp);
  });
}

// Save SVG
const saveBtn = document.getElementById('saveBtn');
if (saveBtn) {
  saveBtn.addEventListener('click', () => {
    const svg = document.querySelector('#chart svg');
    if (!svg) return alert('Render the flowchart first');

    const blob = new Blob(
      [new XMLSerializer().serializeToString(svg)],
      { type: 'image/svg+xml' }
    );

    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'flowchart.svg';
    a.click();
    URL.revokeObjectURL(url);
  });
}
