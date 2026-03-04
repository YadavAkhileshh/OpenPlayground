// config.js — Kanban Board Configuration
const CONFIG = {
  STORAGE_KEY: "kanban_board_v1",
  MAX_CARDS_PER_COLUMN: 30,
  ANIMATION_DURATION: 200,
  PRIORITIES: {
    low: { label: "LOW", color: "#4ade80" },
    medium: { label: "MED", color: "#facc15" },
    high: { label: "HIGH", color: "#f97316" },
    urgent: { label: "URGENT", color: "#ef4444" },
  },
  DEFAULT_COLUMNS: [
    { id: "backlog", title: "BACKLOG", accent: "#555" },
    { id: "inprogress", title: "IN PROGRESS", accent: "#f97316" },
    { id: "review", title: "REVIEW", accent: "#facc15" },
    { id: "done", title: "DONE", accent: "#4ade80" },
  ],
  DEFAULT_CARDS: [
    {
      id: "c1",
      col: "backlog",
      title: "Design landing page",
      priority: "medium",
      tags: ["design"],
    },
    {
      id: "c2",
      col: "backlog",
      title: "Write API docs",
      priority: "low",
      tags: ["docs"],
    },
    {
      id: "c3",
      col: "inprogress",
      title: "Auth module",
      priority: "high",
      tags: ["dev"],
    },
    {
      id: "c4",
      col: "review",
      title: "Unit tests",
      priority: "medium",
      tags: ["dev"],
    },
    {
      id: "c5",
      col: "done",
      title: "Project scaffold",
      priority: "low",
      tags: ["dev"],
    },
  ],
};
