const STORAGE_KEY = 'healthmate_plus_state_v1';

const state = {
  metrics: [],
  goals: [],
  reminders: []
};

const el = {
  metricForm: document.getElementById('metric-form'),
  goalForm: document.getElementById('goal-form'),
  reminderForm: document.getElementById('reminder-form'),
  metricType: document.getElementById('metric-type'),
  metricValue: document.getElementById('metric-value'),
  metricDate: document.getElementById('metric-date'),
  goalType: document.getElementById('goal-type'),
  goalTarget: document.getElementById('goal-target'),
  goalPeriod: document.getElementById('goal-period'),
  reminderText: document.getElementById('reminder-text'),
  reminderTime: document.getElementById('reminder-time'),
  summaryCards: document.getElementById('summary-cards'),
  goalsView: document.getElementById('goals-view'),
  chartView: document.getElementById('chart-view'),
  tipsView: document.getElementById('tips-view'),
  remindersView: document.getElementById('reminders-view'),
  logsView: document.getElementById('logs-view'),
  connectTrackerBtn: document.getElementById('connect-tracker-btn'),
  exportBtn: document.getElementById('export-btn'),
  resetBtn: document.getElementById('reset-btn'),
  toast: document.getElementById('toast')
};

function uid() {
  return '_' + Math.random().toString(36).slice(2, 10);
}

function toast(message) {
  el.toast.textContent = message;
  el.toast.style.display = 'block';
  setTimeout(() => {
    el.toast.style.display = 'none';
  }, 1800);
}

function save() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function load() {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) {
    seedData();
    return;
  }
  const parsed = JSON.parse(raw);
  state.metrics = parsed.metrics || [];
  state.goals = parsed.goals || [];
  state.reminders = parsed.reminders || [];
}

function todayISO() {
  return new Date().toISOString().slice(0, 10);
}

function metricLabel(type) {
  const labels = {
    steps: 'Steps',
    water: 'Water (ml)',
    sleep: 'Sleep (hours)',
    calories: 'Calories'
  };
  return labels[type] || type;
}

function seedData() {
  const day = todayISO();
  state.metrics = [
    { id: uid(), type: 'steps', value: 4200, date: day },
    { id: uid(), type: 'water', value: 1500, date: day },
    { id: uid(), type: 'sleep', value: 7, date: day },
    { id: uid(), type: 'calories', value: 1800, date: day }
  ];
  state.goals = [
    { id: uid(), type: 'steps', target: 8000, period: 'daily' },
    { id: uid(), type: 'water', target: 2500, period: 'daily' }
  ];
  state.reminders = [
    { id: uid(), text: 'Drink water', time: '11:00', doneForDay: false },
    { id: uid(), text: 'Stretch for 5 minutes', time: '16:00', doneForDay: false }
  ];
  save();
}

function addMetric(event) {
  event.preventDefault();
  const metric = {
    id: uid(),
    type: el.metricType.value,
    value: Number(el.metricValue.value),
    date: el.metricDate.value
  };
  state.metrics.unshift(metric);
  save();
  render();
  el.metricForm.reset();
  el.metricDate.value = todayISO();
  toast('Metric added.');
}

function addGoal(event) {
  event.preventDefault();
  const exists = state.goals.find((g) => g.type === el.goalType.value && g.period === el.goalPeriod.value);
  if (exists) {
    exists.target = Number(el.goalTarget.value);
  } else {
    state.goals.push({
      id: uid(),
      type: el.goalType.value,
      target: Number(el.goalTarget.value),
      period: el.goalPeriod.value
    });
  }
  save();
  render();
  el.goalForm.reset();
  toast('Goal saved.');
}

function addReminder(event) {
  event.preventDefault();
  state.reminders.push({
    id: uid(),
    text: el.reminderText.value.trim(),
    time: el.reminderTime.value,
    doneForDay: false
  });
  save();
  renderReminders();
  el.reminderForm.reset();
  toast('Reminder added.');
}

function dailyTotal(type, day) {
  return state.metrics
    .filter((m) => m.type === type && m.date === day)
    .reduce((acc, m) => acc + Number(m.value), 0);
}

function weeklyTotal(type) {
  const now = new Date();
  const weekStart = new Date(now);
  weekStart.setDate(now.getDate() - 6);

  return state.metrics
    .filter((m) => {
      if (m.type !== type) return false;
      const d = new Date(m.date + 'T00:00:00');
      return d >= weekStart && d <= now;
    })
    .reduce((acc, m) => acc + Number(m.value), 0);
}

function renderSummary() {
  const day = todayISO();
  const types = ['steps', 'water', 'sleep', 'calories'];
  el.summaryCards.innerHTML = types
    .map((type) => {
      const value = dailyTotal(type, day);
      return `<div class="summary-card"><strong>${metricLabel(type)}</strong><div class="meta">Today: ${value}</div></div>`;
    })
    .join('');
}

function renderGoals() {
  if (!state.goals.length) {
    el.goalsView.innerHTML = '<div class="list-item">No goals yet.</div>';
    return;
  }

  el.goalsView.innerHTML = state.goals
    .map((goal) => {
      const current = goal.period === 'daily' ? dailyTotal(goal.type, todayISO()) : weeklyTotal(goal.type);
      const percent = Math.min(100, Math.round((current / goal.target) * 100));
      return `
        <div class="list-item">
          <strong>${metricLabel(goal.type)} (${goal.period})</strong>
          <div class="meta">${current} / ${goal.target} (${percent}%)</div>
          <div class="progress"><span style="width:${percent}%"></span></div>
        </div>
      `;
    })
    .join('');
}

function renderChart() {
  const types = ['steps', 'water', 'sleep', 'calories'];
  const day = todayISO();
  const rows = types.map((type) => ({ type, value: dailyTotal(type, day) }));
  const max = Math.max(...rows.map((r) => r.value), 1);

  el.chartView.innerHTML = rows
    .map((row) => {
      const width = Math.max(8, Math.round((row.value / max) * 100));
      return `
        <div class="bar-row">
          <div class="meta">${metricLabel(row.type)}</div>
          <div class="bar" style="width:${width}%">${row.value}</div>
        </div>
      `;
    })
    .join('');
}

function renderTips() {
  const tips = [];

  state.goals.forEach((goal) => {
    const current = goal.period === 'daily' ? dailyTotal(goal.type, todayISO()) : weeklyTotal(goal.type);
    if (current < goal.target) {
      tips.push(`You are behind on ${metricLabel(goal.type)}. Target: ${goal.target}.`);
    }
  });

  const sleepToday = dailyTotal('sleep', todayISO());
  if (sleepToday > 0 && sleepToday < 7) {
    tips.push('Try to get at least 7 hours of sleep for better recovery.');
  }

  const waterToday = dailyTotal('water', todayISO());
  if (waterToday > 0 && waterToday < 2000) {
    tips.push('Hydration is low today. Aim for 2000ml+ water intake.');
  }

  if (!tips.length) tips.push('Great work. Keep your consistency streak going.');

  el.tipsView.innerHTML = tips.map((tip) => `<div class="list-item">${tip}</div>`).join('');
}

function renderReminders() {
  if (!state.reminders.length) {
    el.remindersView.innerHTML = '<div class="list-item">No reminders set.</div>';
    return;
  }

  el.remindersView.innerHTML = state.reminders
    .map((r) => `<div class="list-item"><strong>${r.text}</strong><div class="meta">At ${r.time}</div></div>`)
    .join('');
}

function renderLogs() {
  if (!state.metrics.length) {
    el.logsView.innerHTML = '<div class="list-item">No logs yet.</div>';
    return;
  }

  el.logsView.innerHTML = state.metrics
    .slice(0, 12)
    .map((m) => `<div class="list-item"><strong>${metricLabel(m.type)}</strong>: ${m.value}<div class="meta">${m.date}</div></div>`)
    .join('');
}

function simulateTrackerSync() {
  const day = todayISO();
  const generated = [
    { type: 'steps', value: 1200 + Math.floor(Math.random() * 3500), date: day },
    { type: 'water', value: 200 + Math.floor(Math.random() * 600), date: day },
    { type: 'sleep', value: 5 + Math.floor(Math.random() * 4), date: day }
  ];

  generated.forEach((item) => state.metrics.unshift({ id: uid(), ...item }));
  save();
  render();
  toast('Tracker sync completed.');
}

function exportData() {
  const blob = new Blob([JSON.stringify(state, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'healthmate-plus-data.json';
  a.click();
  URL.revokeObjectURL(url);
}

function resetAll() {
  if (!confirm('Delete all HealthMate Plus data from this browser?')) return;
  localStorage.removeItem(STORAGE_KEY);
  state.metrics = [];
  state.goals = [];
  state.reminders = [];
  seedData();
  render();
  toast('Data reset done.');
}

function runReminderChecks() {
  const now = new Date();
  const hh = String(now.getHours()).padStart(2, '0');
  const mm = String(now.getMinutes()).padStart(2, '0');
  const current = `${hh}:${mm}`;

  state.reminders.forEach((r) => {
    if (r.time === current && !r.doneForDay) {
      toast(r.text);
      r.doneForDay = true;
    }
  });

  if (current === '00:00') {
    state.reminders.forEach((r) => {
      r.doneForDay = false;
    });
  }

  save();
}

function render() {
  renderSummary();
  renderGoals();
  renderChart();
  renderTips();
  renderReminders();
  renderLogs();
}

function bind() {
  el.metricForm.addEventListener('submit', addMetric);
  el.goalForm.addEventListener('submit', addGoal);
  el.reminderForm.addEventListener('submit', addReminder);
  el.connectTrackerBtn.addEventListener('click', simulateTrackerSync);
  el.exportBtn.addEventListener('click', exportData);
  el.resetBtn.addEventListener('click', resetAll);
}

function init() {
  load();
  el.metricDate.value = todayISO();
  bind();
  render();
  setInterval(runReminderChecks, 60000);
}

init();
