// utils.js — Pomodoro Station Utilities

const Utils = {
  formatTime(secs) {
    const m = Math.floor(secs / 60)
      .toString()
      .padStart(2, "0");
    const s = (secs % 60).toString().padStart(2, "0");
    return `${m}:${s}`;
  },

  todayKey() {
    return new Date().toISOString().slice(0, 10);
  },

  save(data) {
    try {
      localStorage.setItem(CONFIG.STORAGE_KEY, JSON.stringify(data));
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

  playTick(ctx) {
    if (!ctx) return;
    const osc = ctx.createOscillator();
    const g = ctx.createGain();
    osc.connect(g);
    g.connect(ctx.destination);
    osc.frequency.value = CONFIG.TICK_SOUND_FREQ;
    osc.type = "sine";
    g.gain.setValueAtTime(0.04, ctx.currentTime);
    g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.06);
    osc.start();
    osc.stop(ctx.currentTime + 0.06);
  },

  playBell(ctx) {
    if (!ctx) return;
    CONFIG.BELL_FREQS.forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const g = ctx.createGain();
      osc.connect(g);
      g.connect(ctx.destination);
      osc.frequency.value = freq;
      osc.type = "sine";
      const t = ctx.currentTime + i * 0.18;
      g.gain.setValueAtTime(0.2, t);
      g.gain.exponentialRampToValueAtTime(0.001, t + 0.8);
      osc.start(t);
      osc.stop(t + 0.8);
    });
  },

  randomQuote() {
    const q = CONFIG.MOTIVATIONAL_QUOTES;
    return q[Math.floor(Math.random() * q.length)];
  },

  updateTitle(time, mode) {
    document.title = `${time} · ${CONFIG.MODES[mode].label}`;
  },
};
