// script.js — Markdown Journal Main Logic

let entries = [];
let meta = { theme: CONFIG.DEFAULT_THEME, activeId: null };
let currentId = null;

const editor = document.getElementById("editor");
const preview = document.getElementById("preview");
const entryList = document.getElementById("entryList");
const searchIn = document.getElementById("searchInput");
const stats = document.getElementById("stats");

function init() {
  const saved = Utils.load();
  if (saved) {
    entries = saved.entries || [];
    meta = { ...meta, ...saved.meta };
  } else {
    createEntry(CONFIG.SAMPLE_ENTRY);
    return;
  }
  Utils.applyTheme(meta.theme);
  if (meta.activeId && entries.find((e) => e.id === meta.activeId)) {
    openEntry(meta.activeId);
  } else if (entries.length) {
    openEntry(entries[0].id);
  }
  renderList();
}

function createEntry(content = "") {
  const entry = {
    id: Utils.uid(),
    content: content || "",
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };
  entries.unshift(entry);
  openEntry(entry.id);
  renderList();
  save();
}

function openEntry(id) {
  currentId = id;
  meta.activeId = id;
  const entry = entries.find((e) => e.id === id);
  if (!entry) return;
  editor.value = entry.content;
  renderPreview(entry.content);
  updateStats(entry.content);
  renderList();
}

function renderList(filter = "") {
  entryList.innerHTML = "";
  const filtered = entries.filter(
    (e) => !filter || e.content.toLowerCase().includes(filter.toLowerCase()),
  );
  if (!filtered.length) {
    entryList.innerHTML =
      '<div style="padding:1rem;font-size:0.75rem;color:var(--dim)">No entries found.</div>';
    return;
  }
  filtered.forEach((entry) => {
    const div = document.createElement("div");
    div.className = "entry-item" + (entry.id === currentId ? " active" : "");
    div.innerHTML = `
      <div class="entry-item-title">${Utils.sanitize ? Utils.sanitize(Utils.extractTitle(entry.content)) : Utils.extractTitle(entry.content)}</div>
      <div class="entry-item-date">${Utils.formatDate(entry.updatedAt)} · ${Utils.formatTime(entry.updatedAt)}</div>`;
    div.addEventListener("click", () => openEntry(entry.id));
    entryList.appendChild(div);
  });
}

function renderPreview(md) {
  preview.innerHTML = Utils.parseMarkdown(md);
}

function updateStats(text) {
  stats.textContent = `${Utils.wordCount(text)} words · ${Utils.charCount(text)} chars`;
}

function save() {
  Utils.save(entries, meta);
}

// Autosave on type
const autosave = Utils.debounce(() => {
  const entry = entries.find((e) => e.id === currentId);
  if (!entry) return;
  entry.content = editor.value;
  entry.updatedAt = Date.now();
  // Re-sort so most recent is first
  entries.sort((a, b) => b.updatedAt - a.updatedAt);
  renderPreview(editor.value);
  updateStats(editor.value);
  renderList(searchIn.value);
  save();
}, CONFIG.AUTOSAVE_DELAY);

editor.addEventListener("input", autosave);

// Tab key
editor.addEventListener("keydown", (e) => {
  if (e.key === "Tab") {
    e.preventDefault();
    const s = editor.selectionStart;
    editor.value =
      editor.value.slice(0, s) + "  " + editor.value.slice(editor.selectionEnd);
    editor.selectionStart = editor.selectionEnd = s + 2;
  }
});

document
  .getElementById("newEntryBtn")
  .addEventListener("click", () => createEntry());

searchIn.addEventListener("input", () => renderList(searchIn.value));

document.querySelectorAll(".theme-btn").forEach((btn) => {
  btn.addEventListener("click", () => {
    meta.theme = btn.dataset.theme;
    Utils.applyTheme(meta.theme);
    save();
  });
});

// Sanitize helper if missing
if (!Utils.sanitize) Utils.sanitize = (s) => s;

init();
