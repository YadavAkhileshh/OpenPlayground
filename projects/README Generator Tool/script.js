
const techTags = [];

function addTag() {
  const input = document.getElementById('tech-input');
  const val = input.value.trim();
  if (!val || techTags.includes(val)) { input.value = ''; return; }
  techTags.push(val);
  input.value = '';
  renderTags();
  generateReadme();
}

function removeTag(tag) {
  const idx = techTags.indexOf(tag);
  if (idx > -1) techTags.splice(idx, 1);
  renderTags();
  generateReadme();
}

function renderTags() {
  const list = document.getElementById('tags-list');
  list.innerHTML = techTags.map(tag =>
    `<span class="tag">${tag}<button onclick="removeTag('${tag}')" title="Remove">×</button></span>`
  ).join('');
}

// Allow Enter key to add tag
document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('tech-input').addEventListener('keydown', e => {
    if (e.key === 'Enter') { e.preventDefault(); addTag(); }
  });

  // Auto-generate on any input change
  document.querySelectorAll('input, textarea, select').forEach(el => {
    el.addEventListener('input', generateReadme);
    el.addEventListener('change', generateReadme);
  });

  generateReadme(); // initial render
});

// ——— GET FORM VALUES ———
function val(id) {
  const el = document.getElementById(id);
  return el ? el.value.trim() : '';
}

function checked(id) {
  const el = document.getElementById(id);
  return el ? el.checked : false;
}

function getCheckedSections() {
  return [...document.querySelectorAll('.section-check:checked')].map(el => el.value);
}

// ——— BADGE HELPERS ———
function shieldBadge(label, message, color) {
  const l = encodeURIComponent(label);
  const m = encodeURIComponent(message);
  return `![${label}](https://img.shields.io/badge/${l}-${m}-${color}?style=flat-square)`;
}

function licenseBadge(license) {
  const map = {
    'MIT':      ['MIT', 'green'],
    'Apache-2.0': ['Apache 2.0', 'blue'],
    'GPL-3.0':  ['GPL v3', 'red'],
    'BSD-2':    ['BSD 2', 'orange'],
    'None':     null,
  };
  const entry = map[license];
  if (!entry) return '';
  return shieldBadge('License', entry[0], entry[1]);
}

// ——— MAIN GENERATOR ———
function generateReadme() {
  const name        = val('proj-name')        || 'My Project';
  const tagline     = val('proj-tagline')     || '';
  const description = val('proj-desc')        || '';
  const demoUrl     = val('proj-demo')        || '';
  const repoUrl     = val('proj-repo')        || '';
  const authorName  = val('author-name')      || '';
  const authorGH    = val('author-github')    || '';
  const license     = val('proj-license')     || 'MIT';
  const sections    = getCheckedSections();

  let md = '';

  // ── Title & Badges ──
  md += `# ${name}\n\n`;

  // Badges row
  const badges = [];
  if (license !== 'None') badges.push(licenseBadge(license));
  if (techTags.length > 0) badges.push(shieldBadge('Built with', techTags[0], '0d1117'));
  badges.push(shieldBadge('Status', 'Active', '22c55e'));
  md += badges.join(' ') + '\n\n';

  // Tagline
  if (tagline) md += `> **${tagline}**\n\n`;

  // Demo link
  if (demoUrl) md += `🔗 **Live Demo:** [${demoUrl}](${demoUrl})\n\n`;

  // Divider
  md += `---\n\n`;

  // ── Description ──
  if (description) {
    md += `## 📖 About\n\n${description}\n\n`;
  }

  // ── Tech Stack ──
  if (techTags.length > 0) {
    md += `## 🛠️ Tech Stack\n\n`;
    md += techTags.map(t => `- ${t}`).join('\n');
    md += '\n\n';
  }

  // ── Screenshots ──
  if (sections.includes('screenshots')) {
    md += `## 📸 Screenshots\n\n`;
    md += `<!-- Add your screenshots here -->\n`;
    md += `![App Screenshot](https://via.placeholder.com/800x400?text=Screenshot)\n\n`;
  }

  // ── Getting Started ──
  if (sections.includes('installation')) {
    const repoLine = repoUrl
      ? `git clone ${repoUrl}`
      : `git clone https://github.com/username/${name.toLowerCase().replace(/\s+/g, '-')}.git`;
    md += `## 🚀 Getting Started\n\n`;
    md += `### Prerequisites\n\n`;
    md += `- Node.js (v16+)\n- npm or yarn\n\n`;
    md += `### Installation\n\n`;
    md += `\`\`\`bash\n`;
    md += `# 1. Clone the repo\n${repoLine}\n\n`;
    md += `# 2. Go into the project folder\ncd ${name.toLowerCase().replace(/\s+/g, '-')}\n\n`;
    md += `# 3. Install dependencies\nnpm install\n\n`;
    md += `# 4. Run the project\nnpm start\n`;
    md += `\`\`\`\n\n`;
  }

  // ── Features ──
  if (sections.includes('features')) {
    md += `## ✨ Features\n\n`;
    md += `- ✅ Feature one\n- ✅ Feature two\n- ✅ Feature three\n- 🔜 Coming soon...\n\n`;
  }

  // ── Contributing ──
  if (sections.includes('contributing')) {
    md += `## 🤝 Contributing\n\n`;
    md += `Contributions are always welcome!\n\n`;
    md += `\`\`\`bash\n`;
    md += `# 1. Fork the project\n# 2. Create your branch\ngit checkout -b feature/AmazingFeature\n\n`;
    md += `# 3. Commit your changes\ngit commit -m 'Add some AmazingFeature'\n\n`;
    md += `# 4. Push to the branch\ngit push origin feature/AmazingFeature\n\n`;
    md += `# 5. Open a Pull Request\n`;
    md += `\`\`\`\n\n`;
  }

  // ── License ──
  if (sections.includes('license') && license !== 'None') {
    md += `## 📄 License\n\n`;
    md += `This project is licensed under the **${license} License** — see the [LICENSE](LICENSE) file for details.\n\n`;
  }

  // ── Author ──
  if (sections.includes('author') && authorName) {
    md += `## 👨‍💻 Author\n\n`;
    md += `**${authorName}**\n\n`;
    if (authorGH) {
      md += `- GitHub: [@${authorGH}](https://github.com/${authorGH})\n`;
    }
    md += `\n`;
  }

  // ── Footer ──
  md += `---\n\n`;
  md += `<p align="center">Made with ❤️ by ${authorName || 'Developer'}</p>\n`;

  // Render
  document.getElementById('preview-box').textContent = md;
}

// ——— COPY TO CLIPBOARD ———
function copyReadme() {
  const text = document.getElementById('preview-box').textContent;
  navigator.clipboard.writeText(text).then(() => {
    showToast('✅ Copied to clipboard!');
  }).catch(() => {
    // Fallback
    const ta = document.createElement('textarea');
    ta.value = text;
    document.body.appendChild(ta);
    ta.select();
    document.execCommand('copy');
    document.body.removeChild(ta);
    showToast('✅ Copied to clipboard!');
  });
}

// ——— DOWNLOAD AS .MD FILE ———
function downloadReadme() {
  const text = document.getElementById('preview-box').textContent;
  const projName = val('proj-name') || 'readme';
  const filename = projName.toLowerCase().replace(/\s+/g, '-') + '-README.md';

  const blob = new Blob([text], { type: 'text/markdown' });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
  showToast('📥 Downloaded: ' + filename);
}

// ——— RESET FORM ———
function resetForm() {
  if (!confirm('Reset all fields?')) return;
  document.querySelectorAll('input[type="text"], input[type="url"], textarea').forEach(el => el.value = '');
  document.querySelectorAll('select').forEach(el => el.selectedIndex = 0);
  document.querySelectorAll('input[type="checkbox"]').forEach(el => el.checked = true);
  techTags.length = 0;
  renderTags();
  generateReadme();
  showToast('🔄 Form reset!');
}

// ——— TOAST ———
function showToast(msg) {
  let toast = document.getElementById('toast');
  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'toast';
    toast.className = 'toast';
    document.body.appendChild(toast);
  }
  toast.textContent = msg;
  toast.classList.add('show');
  setTimeout(() => toast.classList.remove('show'), 2800);
}
