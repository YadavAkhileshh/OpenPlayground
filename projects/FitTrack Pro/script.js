const STORAGE_KEY = 'fittrack_pro_v1';

const state = {
  workouts: [],
  goals: {
    calories: 500,
    minutes: 45,
  },
};

const el = {
  workoutForm: document.getElementById('workout-form'),
  targetForm: document.getElementById('target-form'),
  workoutType: document.getElementById('workout-type'),
  workoutDuration: document.getElementById('workout-duration'),
  workoutCalories: document.getElementById('workout-calories'),
  workoutDate: document.getElementById('workout-date'),
  goalCalories: document.getElementById('goal-calories'),
  goalMinutes: document.getElementById('goal-minutes'),
  exportBtn: document.getElementById('export-btn'),
  clearBtn: document.getElementById('clear-btn'),
  progressCards: document.getElementById('progress-cards'),
  chart: document.getElementById('chart'),
  workoutList: document.getElementById('workout-list'),
  toast: document.getElementById('toast'),
};

function uid() {
  return '_' + Math.random().toString(36).slice(2, 10);
}

function showToast(msg) {
  el.toast.textContent = msg;
  el.toast.style.display = 'block';
  setTimeout(() => {
    el.toast.style.display = 'none';
  }, 1800);
}

function todayISO() {
  return new Date().toISOString().slice(0, 10);
}

function save() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function load() {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) {
    seed();
    return;
  }
  const parsed = JSON.parse(raw);
  state.workouts = parsed.workouts || [];
  state.goals = parsed.goals || { calories: 500, minutes: 45 };
}

function seed() {
  const today = todayISO();
  const d1 = new Date();
  d1.setDate(d1.getDate() - 1);
  const d2 = new Date();
  d2.setDate(d2.getDate() - 2);

  state.workouts = [
    { id: uid(), type: 'Running', duration: 30, calories: 280, date: today },
    { id: uid(), type: 'Strength', duration: 40, calories: 320, date: d1.toISOString().slice(0, 10) },
    { id: uid(), type: 'Yoga', duration: 25, calories: 120, date: d2.toISOString().slice(0, 10) },
  ];
  save();
}

function getTodayTotals() {
  const today = todayISO();
  const todays = state.workouts.filter((w) => w.date === today);
  return {
    calories: todays.reduce((a, w) => a + Number(w.calories), 0),
    minutes: todays.reduce((a, w) => a + Number(w.duration), 0),
    count: todays.length,
  };
}

function progressPercent(value, goal) {
  if (!goal || goal <= 0) return 0;
  return Math.min(100, Math.round((value / goal) * 100));
}

function renderProgress() {
  const totals = getTodayTotals();
  const cPct = progressPercent(totals.calories, state.goals.calories);
  const mPct = progressPercent(totals.minutes, state.goals.minutes);

  el.progressCards.innerHTML = `
    <div class="progress-item">
      <strong>Calories Burned</strong>
      <div class="meta">${totals.calories} / ${state.goals.calories}</div>
      <div class="progress"><span style="width:${cPct}%"></span></div>
    </div>
    <div class="progress-item">
      <strong>Workout Minutes</strong>
      <div class="meta">${totals.minutes} / ${state.goals.minutes}</div>
      <div class="progress"><span style="width:${mPct}%"></span></div>
    </div>
    <div class="progress-item">
      <strong>Sessions Today</strong>
      <div class="meta">${totals.count} workout logged</div>
      <div class="meta">Keep your streak alive.</div>
    </div>
  `;
}

function last7DaysCalories() {
  const days = [];
  for (let i = 6; i >= 0; i -= 1) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const iso = d.toISOString().slice(0, 10);
    const label = d.toLocaleDateString(undefined, { weekday: 'short' });
    const total = state.workouts
      .filter((w) => w.date === iso)
      .reduce((a, w) => a + Number(w.calories), 0);
    days.push({ label, total });
  }
  return days;
}

function renderChart() {
  const points = last7DaysCalories();
  const max = Math.max(...points.map((p) => p.total), 1);

  el.chart.innerHTML = points
    .map((p) => {
      const width = Math.max(8, Math.round((p.total / max) * 100));
      return `<div class="bar" style="width:${width}%">${p.label}: ${p.total} kcal</div>`;
    })
    .join('');
}

function renderHistory() {
  if (!state.workouts.length) {
    el.workoutList.innerHTML = '<div class="list-item">No workouts logged yet.</div>';
    return;
  }

  el.workoutList.innerHTML = state.workouts
    .slice()
    .sort((a, b) => b.date.localeCompare(a.date))
    .map(
      (w) => `
      <div class="list-item">
        <strong>${w.type}</strong>
        <div class="meta">${w.date} | ${w.duration} min | ${w.calories} kcal</div>
      </div>
    `
    )
    .join('');
}

function renderAll() {
  el.goalCalories.value = state.goals.calories;
  el.goalMinutes.value = state.goals.minutes;
  renderProgress();
  renderChart();
  renderHistory();
}

function addWorkout(event) {
  event.preventDefault();

  state.workouts.push({
    id: uid(),
    type: el.workoutType.value,
    duration: Number(el.workoutDuration.value),
    calories: Number(el.workoutCalories.value),
    date: el.workoutDate.value,
  });

  save();
  renderAll();
  el.workoutForm.reset();
  el.workoutDate.value = todayISO();
  showToast('Workout logged.');
}

function saveTargets(event) {
  event.preventDefault();
  state.goals.calories = Number(el.goalCalories.value);
  state.goals.minutes = Number(el.goalMinutes.value);
  save();
  renderProgress();
  showToast('Targets updated.');
}

function exportData() {
  const blob = new Blob([JSON.stringify(state, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'fittrack-pro-data.json';
  a.click();
  URL.revokeObjectURL(url);
}

function clearAll() {
  if (!confirm('Delete all FitTrack Pro data from this browser?')) return;
  localStorage.removeItem(STORAGE_KEY);
  state.workouts = [];
  state.goals = { calories: 500, minutes: 45 };
  seed();
  renderAll();
  showToast('Data reset.');
}

function bind() {
  el.workoutForm.addEventListener('submit', addWorkout);
  el.targetForm.addEventListener('submit', saveTargets);
  el.exportBtn.addEventListener('click', exportData);
  el.clearBtn.addEventListener('click', clearAll);
}

function init() {
  load();
  el.workoutDate.value = todayISO();
  bind();
  renderAll();
}

init();
