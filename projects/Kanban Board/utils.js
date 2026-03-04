// utils.js — Kanban Board Utilities

const Utils = {
  uid() {
    return "c" + Math.random().toString(36).slice(2, 9);
  },

  saveState(columns, cards) {
    try {
      localStorage.setItem(
        CONFIG.STORAGE_KEY,
        JSON.stringify({ columns, cards }),
      );
    } catch (e) {
      console.warn("Storage unavailable");
    }
  },

  loadState() {
    try {
      const raw = localStorage.getItem(CONFIG.STORAGE_KEY);
      if (raw) return JSON.parse(raw);
    } catch (e) {}
    return null;
  },

  clearState() {
    localStorage.removeItem(CONFIG.STORAGE_KEY);
  },

  getCardCountByCol(cards) {
    const map = {};
    cards.forEach((c) => {
      map[c.col] = (map[c.col] || 0) + 1;
    });
    return map;
  },

  formatDate(date = new Date()) {
    return date.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  },

  debounce(fn, delay = 300) {
    let t;
    return (...args) => {
      clearTimeout(t);
      t = setTimeout(() => fn(...args), delay);
    };
  },

  sanitize(str) {
    const d = document.createElement("div");
    d.textContent = str;
    return d.innerHTML;
  },

  priorityColor(p) {
    return CONFIG.PRIORITIES[p]?.color || "#888";
  },

  nextPriority(p) {
    const keys = Object.keys(CONFIG.PRIORITIES);
    return keys[(keys.indexOf(p) + 1) % keys.length];
  },
};
