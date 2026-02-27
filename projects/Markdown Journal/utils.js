// utils.js — Markdown Journal Utilities

const Utils = {
  uid() {
    return Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
  },

  save(entries, meta) {
    try {
      localStorage.setItem(
        CONFIG.STORAGE_KEY,
        JSON.stringify({ entries, meta }),
      );
    } catch (e) {}
  },

  load() {
    try {
      const r = localStorage.getItem(CONFIG.STORAGE_KEY);
      return r ? JSON.parse(r) : null;
    } catch (e) {
      return null;
    }
  },

  wordCount(text) {
    return text.trim() ? text.trim().split(/\s+/).length : 0;
  },

  charCount(text) {
    return text.length;
  },

  formatDate(ts) {
    return new Date(ts).toLocaleDateString("en-GB", {
      weekday: "short",
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  },

  formatTime(ts) {
    return new Date(ts).toLocaleTimeString("en-GB", {
      hour: "2-digit",
      minute: "2-digit",
    });
  },

  extractTitle(md) {
    const m = md.match(/^#\s+(.+)/m);
    return m ? m[1].trim() : CONFIG.DEFAULT_ENTRY_TITLE;
  },

  parseMarkdown(md) {
    let h = md
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/^### (.+)$/gm, "<h3>$1</h3>")
      .replace(/^## (.+)$/gm, "<h2>$1</h2>")
      .replace(/^# (.+)$/gm, "<h1>$1</h1>")
      .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
      .replace(/\*(.+?)\*/g, "<em>$1</em>")
      .replace(/_(.+?)_/g, "<em>$1</em>")
      .replace(/`(.+?)`/g, "<code>$1</code>")
      .replace(/^> (.+)$/gm, "<blockquote>$1</blockquote>")
      .replace(/^- (.+)$/gm, "<li>$1</li>")
      .replace(/(<li>.*<\/li>)/s, "<ul>$1</ul>")
      .replace(/\n\n/g, "</p><p>")
      .replace(/\n/g, "<br>");
    return "<p>" + h + "</p>";
  },

  debounce(fn, delay) {
    let t;
    return (...a) => {
      clearTimeout(t);
      t = setTimeout(() => fn(...a), delay);
    };
  },

  applyTheme(themeName) {
    const theme =
      CONFIG.THEMES[themeName] || CONFIG.THEMES[CONFIG.DEFAULT_THEME];
    Object.entries(theme).forEach(([k, v]) =>
      document.documentElement.style.setProperty(k, v),
    );
  },
};
