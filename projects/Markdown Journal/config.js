// config.js — Markdown Journal Configuration
const CONFIG = {
  STORAGE_KEY: "md_journal_v1",
  AUTOSAVE_DELAY: 800,
  MAX_ENTRIES: 200,
  DEFAULT_ENTRY_TITLE: "Untitled Entry",
  THEMES: {
    warm: {
      "--bg": "#fdf6ec",
      "--surface": "#fff9f2",
      "--text": "#2d1f0e",
      "--accent": "#b5541c",
      "--border": "#e8d9c4",
      "--dim": "#9a836a",
    },
    slate: {
      "--bg": "#0f1117",
      "--surface": "#161b27",
      "--text": "#e2e8f0",
      "--accent": "#60a5fa",
      "--border": "#1e293b",
      "--dim": "#64748b",
    },
    sage: {
      "--bg": "#f0f5ef",
      "--surface": "#f8faf7",
      "--text": "#1a2b1a",
      "--accent": "#4a7c59",
      "--border": "#c8dbc4",
      "--dim": "#6b8f6b",
    },
  },
  DEFAULT_THEME: "warm",
  SAMPLE_ENTRY: `# Welcome to your Journal\n\nThis is a **markdown-powered** journal. Start writing and see your words come alive.\n\n## Features\n- Live markdown preview\n- Multiple entries with search\n- Autosave to localStorage\n- Word & character count\n\n> _"The act of writing is the act of discovering what you believe."_ — David Hare\n\nEnjoy writing! ✍️`,
};
