// config.js — Pomodoro Station Configuration
const CONFIG = {
  STORAGE_KEY: "pomodoro_station_v1",
  MODES: {
    focus: { label: "FOCUS", duration: 25 * 60, color: "#ff6b35" },
    shortBreak: { label: "SHORT BREAK", duration: 5 * 60, color: "#4ecdc4" },
    longBreak: { label: "LONG BREAK", duration: 15 * 60, color: "#45b7d1" },
  },
  DEFAULT_MODE: "focus",
  SESSIONS_BEFORE_LONG_BREAK: 4,
  TICK_SOUND_FREQ: 880,
  BELL_FREQS: [523, 659, 784, 1047],
  MAX_HISTORY_DAYS: 14,
  MOTIVATIONAL_QUOTES: [
    "Deep work is the superpower of the 21st century.",
    "Focus is the art of knowing what to ignore.",
    "One task at a time. Do it well.",
    "Energy flows where attention goes.",
    "The secret of getting ahead is getting started.",
  ],
};
