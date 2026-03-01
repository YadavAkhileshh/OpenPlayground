const TAG_EMOJI = { idea:"💡", work:"💼", personal:"🙋", worry:"😰", goal:"🎯", random:"🎲" };
const TAG_LABELS = { idea:"IDEA", work:"WORK", personal:"PERSONAL", worry:"WORRY", goal:"GOAL", random:"RANDOM" };

let thoughts = JSON.parse(localStorage.getItem("md_thoughts") || "[]");
let activeTag = "idea";
let activeFilter = "all";
let searchQuery = "";
let sortMode = "newest";

function save() { localStorage.setItem("md_thoughts", JSON.stringify(thoughts)); }

function updateStats() {
  const today = new Date().toDateString();
  const todayCount = thoughts.filter(t => new Date(t.createdAt).toDateString() === today).length;
  document.getElementById("totalThoughts").textContent = thoughts.length + " thoughts";
  document.getElementById("todayThoughts").textContent = todayCount + " today";
}

document.querySelectorAll(".tag-btn").forEach(btn => {
  btn.addEventListener("click", () => {
    document.querySelectorAll(".tag-btn").forEach(b => b.classList.remove("active"));
    btn.classList.add("active");
    activeTag = btn.dataset.tag;
  });
});

document.querySelectorAll(".filter-btn").forEach(btn => {
  btn.addEventListener("click", () => {
    document.querySelectorAll(".filter-btn").forEach(b => b.classList.remove("active"));
    btn.classList.add("active");
    activeFilter = btn.dataset.filter;
    render();
  });
});

const thoughtInput = document.getElementById("thoughtInput");
const charCount = document.getElementById("charCount");

thoughtInput.addEventListener("input", () => {
  charCount.textContent = thoughtInput.value.length + " / 500";
  charCount.style.color = thoughtInput.value.length > 450 ? "#f85c8a" : "#4a4e6a";
});

thoughtInput.addEventListener("keydown", e => {
  if (e.key === "Enter" && e.ctrlKey) dump();
});

document.getElementById("dumpBtn").addEventListener("click", dump);

function dump() {
  const text = thoughtInput.value.trim();
  if (!text) return;

  const thought = {
    id: Date.now().toString(),
    text,
    tag: activeTag,
    createdAt: new Date().toISOString(),
    pinned: false
  };

  thoughts.unshift(thought);
  save();
  thoughtInput.value = "";
  charCount.textContent = "0 / 500";
  updateStats();
  render();

  thoughtInput.focus();
}

document.getElementById("searchInput").addEventListener("input", e => {
  searchQuery = e.target.value.toLowerCase();
  render();
});

document.getElementById("sortSelect").addEventListener("change", e => {
  sortMode = e.target.value;
  render();
});

function highlight(text, query) {
  if (!query) return text;
  const escaped = query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  return text.replace(new RegExp(escaped, "gi"), match => `<mark>${match}</mark>`);
}

function formatTime(iso) {
  const d = new Date(iso);
  const now = new Date();
  const diff = Math.floor((now - d) / 1000);
  if (diff < 60) return "just now";
  if (diff < 3600) return Math.floor(diff / 60) + "m ago";
  if (diff < 86400) return Math.floor(diff / 3600) + "h ago";
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function render() {
  const container = document.getElementById("thoughtsContainer");
  const emptyState = document.getElementById("emptyState");

  let filtered = [...thoughts];

  if (activeFilter !== "all") filtered = filtered.filter(t => t.tag === activeFilter);
  if (searchQuery) filtered = filtered.filter(t => t.text.toLowerCase().includes(searchQuery));

  if (sortMode === "oldest") filtered.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
  else if (sortMode === "tag") filtered.sort((a, b) => a.tag.localeCompare(b.tag));
  else filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  filtered.sort((a, b) => (b.pinned ? 1 : 0) - (a.pinned ? 1 : 0));

  const existing = container.querySelectorAll(".thought-card");
  existing.forEach(e => e.remove());

  if (filtered.length === 0) {
    emptyState.style.display = "block";
    return;
  }
  emptyState.style.display = "none";

  filtered.forEach(thought => {
    const card = document.createElement("div");
    card.className = "thought-card";
    card.dataset.tag = thought.tag;
    card.dataset.id = thought.id;

    card.innerHTML = `
      <div class="thought-emoji">${TAG_EMOJI[thought.tag]}</div>
      <div class="thought-body">
        <div class="thought-text">${highlight(thought.text, searchQuery)}</div>
        <div class="thought-meta">
          <span class="thought-tag tag-${thought.tag}">${TAG_LABELS[thought.tag]}</span>
          <span class="thought-time">${formatTime(thought.createdAt)}</span>
          ${thought.pinned ? '<span class="thought-time">📌 Pinned</span>' : ""}
        </div>
      </div>
      <div class="thought-actions">
        <button class="act-btn pin-btn ${thought.pinned ? 'pin-active' : ''}" title="Pin">📌</button>
        <button class="act-btn copy-btn" title="Copy">📋</button>
        <button class="act-btn del-btn" title="Delete">✕</button>
      </div>
    `;

    card.querySelector(".del-btn").addEventListener("click", () => {
      card.style.transition = "all .3s";
      card.style.opacity = "0";
      card.style.transform = "translateX(20px)";
      setTimeout(() => {
        thoughts = thoughts.filter(t => t.id !== thought.id);
        save();
        updateStats();
        render();
      }, 300);
    });

    card.querySelector(".pin-btn").addEventListener("click", () => {
      const idx = thoughts.findIndex(t => t.id === thought.id);
      thoughts[idx].pinned = !thoughts[idx].pinned;
      save();
      render();
    });

    card.querySelector(".copy-btn").addEventListener("click", () => {
      navigator.clipboard.writeText(thought.text).then(() => {
        const btn = card.querySelector(".copy-btn");
        btn.textContent = "✓";
        setTimeout(() => btn.textContent = "📋", 1500);
      });
    });

    container.appendChild(card);
  });
}

document.getElementById("exportBtn").addEventListener("click", () => {
  if (thoughts.length === 0) return alert("No thoughts to export!");
  const lines = thoughts.map(t =>
    `[${TAG_LABELS[t.tag]}] ${new Date(t.createdAt).toLocaleString()}\n${t.text}\n`
  ).join("\n---\n\n");
  const blob = new Blob([`MINDDUMP EXPORT\n${"=".repeat(40)}\n\n${lines}`], { type: "text/plain" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = "minddump-" + new Date().toISOString().slice(0, 10) + ".txt";
  a.click();
});

document.getElementById("clearAllBtn").addEventListener("click", () => {
  if (thoughts.length === 0) return;
  if (confirm("Delete all thoughts? This cannot be undone.")) {
    thoughts = [];
    save();
    updateStats();
    render();
  }
});

updateStats();
render();
