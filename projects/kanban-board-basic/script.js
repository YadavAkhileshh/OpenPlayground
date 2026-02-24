// script.js — Kanban Board Main Logic

let state = { columns: [], cards: [] };
let dragCard = null;
let editingCardId = null;
let targetColId = null;

function init() {
  const saved = Utils.loadState();
  if (saved) {
    state = saved;
  } else {
    state.columns = [...CONFIG.DEFAULT_COLUMNS];
    state.cards = [...CONFIG.DEFAULT_CARDS];
  }
  document.getElementById("todayDate").textContent = Utils.formatDate();
  render();
}

function render() {
  const board = document.getElementById("board");
  board.innerHTML = "";
  const counts = Utils.getCardCountByCol(state.cards);

  state.columns.forEach((col) => {
    const colEl = document.createElement("div");
    colEl.className = "column";
    colEl.dataset.colId = col.id;

    colEl.innerHTML = `
      <div class="col-header">
        <div class="col-accent" style="background:${col.accent}"></div>
        <div class="col-title">${Utils.sanitize(col.title)}</div>
        <div class="col-count">${counts[col.id] || 0}</div>
        <button class="col-add" data-col="${col.id}" title="Add card">+</button>
      </div>
      <div class="col-body" data-col="${col.id}"></div>`;

    const body = colEl.querySelector(".col-body");

    state.cards
      .filter((c) => c.col === col.id)
      .forEach((card) => {
        body.appendChild(makeCardEl(card));
      });

    // Drop zone events
    body.addEventListener("dragover", (e) => {
      e.preventDefault();
      body.classList.add("drag-over");
      targetColId = col.id;
    });
    body.addEventListener("dragleave", () =>
      body.classList.remove("drag-over"),
    );
    body.addEventListener("drop", (e) => {
      e.preventDefault();
      body.classList.remove("drag-over");
      if (dragCard) {
        dragCard.col = col.id;
        save();
        render();
      }
    });

    board.appendChild(colEl);
  });

  // Add card buttons
  document.querySelectorAll(".col-add").forEach((btn) => {
    btn.addEventListener("click", () => openModal(null, btn.dataset.col));
  });

  // Update meta
  document.getElementById("topbarMeta").innerHTML =
    `${state.cards.length} tasks · <span id="todayDate">${Utils.formatDate()}</span>`;
}

function makeCardEl(card) {
  const el = document.createElement("div");
  el.className = "card";
  el.draggable = true;
  el.dataset.cardId = card.id;

  const pc = CONFIG.PRIORITIES[card.priority] || CONFIG.PRIORITIES.medium;
  const tagsHtml = (card.tags || [])
    .map((t) => `<span class="card-tag">${Utils.sanitize(t.trim())}</span>`)
    .join("");

  el.innerHTML = `
    <button class="card-edit" data-id="${card.id}">✎</button>
    <div class="card-priority" style="background:${pc.color};color:#000">${pc.label}</div>
    <div class="card-title">${Utils.sanitize(card.title)}</div>
    ${tagsHtml ? `<div class="card-tags">${tagsHtml}</div>` : ""}`;

  el.addEventListener("dragstart", () => {
    dragCard = card;
    el.classList.add("dragging");
  });
  el.addEventListener("dragend", () => {
    dragCard = null;
    el.classList.remove("dragging");
  });
  el.querySelector(".card-edit").addEventListener("click", (e) => {
    e.stopPropagation();
    openModal(card.id);
  });
  return el;
}

// Modal
function openModal(cardId = null, colId = null) {
  editingCardId = cardId;
  targetColId = colId;
  const overlay = document.getElementById("overlay");
  const modeEl = document.getElementById("modalMode");
  const titleEl = document.getElementById("cardTitle");
  const prioEl = document.getElementById("cardPriority");
  const tagsEl = document.getElementById("cardTags");
  const delBtn = document.getElementById("deleteCardBtn");

  if (cardId) {
    const card = state.cards.find((c) => c.id === cardId);
    modeEl.textContent = "EDIT CARD";
    titleEl.value = card.title;
    prioEl.value = card.priority;
    tagsEl.value = (card.tags || []).join(", ");
    delBtn.hidden = false;
  } else {
    modeEl.textContent = "NEW CARD";
    titleEl.value = "";
    prioEl.value = "medium";
    tagsEl.value = "";
    delBtn.hidden = true;
  }
  overlay.hidden = false;
  titleEl.focus();
}

function closeModal() {
  document.getElementById("overlay").hidden = true;
  editingCardId = null;
}

document.getElementById("modalClose").addEventListener("click", closeModal);
document.getElementById("overlay").addEventListener("click", (e) => {
  if (e.target === document.getElementById("overlay")) closeModal();
});

document.getElementById("saveCardBtn").addEventListener("click", () => {
  const title = document.getElementById("cardTitle").value.trim();
  if (!title) return;
  const priority = document.getElementById("cardPriority").value;
  const tags = document
    .getElementById("cardTags")
    .value.split(",")
    .map((t) => t.trim())
    .filter(Boolean);

  if (editingCardId) {
    const card = state.cards.find((c) => c.id === editingCardId);
    Object.assign(card, { title, priority, tags });
  } else {
    state.cards.push({
      id: Utils.uid(),
      col: targetColId || state.columns[0].id,
      title,
      priority,
      tags,
    });
  }
  save();
  render();
  closeModal();
});

document.getElementById("deleteCardBtn").addEventListener("click", () => {
  state.cards = state.cards.filter((c) => c.id !== editingCardId);
  save();
  render();
  closeModal();
});

document.getElementById("resetBtn").addEventListener("click", () => {
  if (confirm("Reset board to defaults?")) {
    Utils.clearState();
    state = {
      columns: [...CONFIG.DEFAULT_COLUMNS],
      cards: [...CONFIG.DEFAULT_CARDS],
    };
    save();
    render();
  }
});

function save() {
  Utils.saveState(state.columns, state.cards);
}

init();
