







































// ── STORAGE KEYS ──────────────────────────────────
const KEY_HABITS  = 'ritual_habits';
const KEY_HISTORY = 'ritual_history';

// ── STATE ─────────────────────────────────────────
let habits  = [];   // [{ id, name, emoji, createdAt, streak, lastDone }]
let history = {};   // { 'YYYY-MM-DD': { habitId: bool, ... } }
let pendingDeleteId = null;

// ── DATE UTILS ────────────────────────────────────
function todayStr() {
  return new Date().toISOString().slice(0, 10);
}

function formatDate(d) {
  return new Date(d).toLocaleDateString('en-US', { weekday:'short', month:'short', day:'numeric' });
}

function getLast7Days() {
  const days = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    days.push(d.toISOString().slice(0, 10));
  }
  return days;
}

function dayName(dateStr) {
  return new Date(dateStr).toLocaleDateString('en-US', { weekday: 'short' }).toUpperCase();
}

// ── LOAD / SAVE ───────────────────────────────────
function load() {
  try {
    habits  = JSON.parse(localStorage.getItem(KEY_HABITS))  || [];
    history = JSON.parse(localStorage.getItem(KEY_HISTORY)) || {};
  } catch { habits = []; history = {}; }
}

function save() {
  localStorage.setItem(KEY_HABITS,  JSON.stringify(habits));
  localStorage.setItem(KEY_HISTORY, JSON.stringify(history));
}

// ── TODAY'S RECORD ────────────────────────────────
function todayRecord() {
  const t = todayStr();
  if (!history[t]) history[t] = {};
  return history[t];
}

function isDoneToday(id) {
  return !!todayRecord()[id];
}

// ── STREAKS ───────────────────────────────────────
function calcStreak(habit) {
  let streak = 0;
  const d = new Date();
  // Check backwards from yesterday (today might not be done yet)
  // But if done today, start from today
  if (isDoneToday(habit.id)) {
    streak = 1;
    d.setDate(d.getDate() - 1);
  } else {
    // Check if yesterday was done — if not, streak is 0
    const yest = new Date();
    yest.setDate(yest.getDate() - 1);
    const yestStr = yest.toISOString().slice(0, 10);
    if (!history[yestStr]?.[habit.id]) return 0;
    streak = 1;
    d.setDate(d.getDate() - 2);
  }
  for (let i = 0; i < 365; i++) {
    const ds = d.toISOString().slice(0, 10);
    if (history[ds]?.[habit.id]) { streak++; d.setDate(d.getDate() - 1); }
    else break;
  }
  return streak;
}

function bestStreakToday() {
  return habits.reduce((max, h) => Math.max(max, calcStreak(h)), 0);
}

// ── RENDER HEADER ─────────────────────────────────
function renderHeader() {
  document.getElementById('dateChip').textContent = formatDate(new Date());
  const best = bestStreakToday();
  document.getElementById('streakNum').textContent = best;
}

// ── RENDER STATS ──────────────────────────────────
function renderStats() {
  const total  = habits.length;
  const done   = habits.filter(h => isDoneToday(h.id)).length;
  const pct    = total ? Math.round((done / total) * 100) : 0;
  const streak = bestStreakToday();

  document.getElementById('statTotal').textContent  = total;
  document.getElementById('statDone').textContent   = done;
  document.getElementById('statPct').textContent    = pct + '%';
  document.getElementById('statStreak').textContent = streak;
  document.getElementById('streakNum').textContent  = streak;

  // Arc
  const arcFill = document.getElementById('arcFill');
  const total_len = 251.2;
  const offset = total_len - (pct / 100) * total_len;
  arcFill.style.strokeDashoffset = offset;
  document.getElementById('arcPct').textContent = pct + '%';
}

// ── RENDER WEEK HEATMAP ───────────────────────────
function renderWeek() {
  const wrap = document.getElementById('weekRow');
  wrap.innerHTML = '';
  const days = getLast7Days();
  const today = todayStr();

  days.forEach(dateStr => {
    const rec   = history[dateStr] || {};
    const total = habits.length;
    const done  = total ? habits.filter(h => rec[h.id]).length : 0;
    const pct   = total ? Math.round((done / total) * 100) : 0;

    let cellClass = 'week-day-cell';
    let label = '—';
    if (dateStr === today) cellClass += ' today';
    if (total > 0 && (done > 0 || dateStr < today)) {
      cellClass += ' has-data';
      label = pct + '%';
      if (pct >= 70) cellClass += ' pct-high';
      else if (pct >= 40) cellClass += ' pct-mid';
      else if (pct > 0)   cellClass += ' pct-low';
    }
    if (dateStr === today && total === 0) label = '·';

    const col = document.createElement('div');
    col.className = 'week-day';
    col.innerHTML = `
      <span class="week-day-name">${dayName(dateStr)}</span>
      <div class="${cellClass}" title="${dateStr}: ${done}/${total} habits">${label}</div>
    `;
    wrap.appendChild(col);
  });
}

// ── RENDER HABITS ─────────────────────────────────
function renderHabits() {
  const list  = document.getElementById('habitList');
  const empty = document.getElementById('emptyState');

  // Clear old cards but keep empty state
  Array.from(list.querySelectorAll('.habit-card')).forEach(c => c.remove());

  if (habits.length === 0) {
    empty.style.display = 'block';
    return;
  }
  empty.style.display = 'none';

  habits.forEach((habit, idx) => {
    const done   = isDoneToday(habit.id);
    const streak = calcStreak(habit);
    const card   = document.createElement('div');
    card.className = 'habit-card' + (done ? ' done' : '');
    card.style.animationDelay = (idx * 0.05) + 's';
    card.dataset.id = habit.id;

    card.innerHTML = `
      <div class="habit-check ${done ? 'checked' : ''}" data-id="${habit.id}">
        <span class="check-icon">✓</span>
      </div>
      <span class="habit-emoji">${habit.emoji}</span>
      <div class="habit-info">
        <div class="habit-name">${escHtml(habit.name)}</div>
        <div class="habit-meta">
          <span class="habit-streak">${streak > 0 ? '🔥 ' + streak + ' day streak' : 'Start your streak!'}</span>
          <span class="habit-added">Since ${formatDate(habit.createdAt)}</span>
        </div>
      </div>
      <button class="habit-delete" data-id="${habit.id}" title="Delete habit">✕</button>
    `;

    list.appendChild(card);
  });
}

function escHtml(s) {
  return s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

// ── FULL RENDER ───────────────────────────────────
function render() {
  renderHeader();
  renderStats();
  renderWeek();
  renderHabits();
}

// ── ADD HABIT ─────────────────────────────────────
function addHabit() {
  const input = document.getElementById('addInput');
  const sel   = document.getElementById('addEmoji');
  const name  = input.value.trim();
  if (!name) { showToast('Please enter a habit name.'); input.focus(); return; }

  const habit = {
    id:        Date.now().toString(),
    name,
    emoji:     sel.value,
    createdAt: new Date().toISOString(),
    streak:    0
  };
  habits.push(habit);
  save();
  render();
  input.value = '';
  input.focus();
  showToast(`"${name}" added ✓`);
}

// ── TOGGLE DONE ───────────────────────────────────
function toggleHabit(id) {
  const rec = todayRecord();
  if (rec[id]) {
    delete rec[id];
    showToast('Habit unmarked');
  } else {
    rec[id] = true;
    showToast('Habit completed! 🎉');
  }
  save();
  render();
}

// ── DELETE ────────────────────────────────────────
function requestDelete(id) {
  const habit = habits.find(h => h.id === id);
  if (!habit) return;
  pendingDeleteId = id;
  document.getElementById('modalSub').textContent = `"${habit.name}" and all its history will be removed.`;
  document.getElementById('modalOverlay').classList.add('open');
}

function confirmDelete() {
  if (!pendingDeleteId) return;
  const id = pendingDeleteId;
  habits = habits.filter(h => h.id !== id);
  Object.values(history).forEach(day => { delete day[id]; });
  pendingDeleteId = null;
  closeModal();
  save();
  render();
  showToast('Habit deleted');
}

function closeModal() {
  document.getElementById('modalOverlay').classList.remove('open');
  pendingDeleteId = null;
}

// ── TOAST ─────────────────────────────────────────
let toastTimer = null;
function showToast(msg) {
  const t = document.getElementById('toast');
  t.textContent = msg;
  t.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => t.classList.remove('show'), 2200);
}

// ── EVENT DELEGATION ──────────────────────────────
document.getElementById('habitList').addEventListener('click', e => {
  const check  = e.target.closest('.habit-check');
  const delBtn = e.target.closest('.habit-delete');
  if (check)  toggleHabit(check.dataset.id);
  if (delBtn) requestDelete(delBtn.dataset.id);
});

// ── KEYBOARD SHORTCUT ─────────────────────────────
document.getElementById('addInput').addEventListener('keydown', e => {
  if (e.key === 'Enter') addHabit();
});

// ── BUTTON BINDINGS ───────────────────────────────
document.getElementById('btnAdd').addEventListener('click', addHabit);
document.getElementById('btnConfirmDelete').addEventListener('click', confirmDelete);
document.getElementById('btnCancel').addEventListener('click', closeModal);
document.getElementById('modalOverlay').addEventListener('click', e => {
  if (e.target === document.getElementById('modalOverlay')) closeModal();
});

// ── SEED DEFAULT HABITS (first time only) ─────────
function seedDefaults() {
  if (habits.length > 0) return;
  const defaults = [
    { name: 'Drink 8 glasses of water', emoji: '💧' },
    { name: 'Exercise for 30 minutes',  emoji: '🏃' },
    { name: 'Read for 20 minutes',      emoji: '📖' },
  ];
  defaults.forEach(d => {
    habits.push({
      id: Date.now().toString() + Math.random().toString(36).slice(2),
      name: d.name,
      emoji: d.emoji,
      createdAt: new Date().toISOString(),
    });
  });
  save();
}

// ── BOOT ──────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  load();
  seedDefaults();
  render();
});
