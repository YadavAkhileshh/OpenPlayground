
let reminders = JSON.parse(localStorage.getItem('bt_reminders') || 'null') || [
  {
    id: 1,
    name: 'Morning Office Bus',
    type: 'bus',
    station: 'Shivajinagar Stand',
    departTime: '08:30',
    remindBefore: 15,
    days: ['Mon','Tue','Wed','Thu','Fri'],
    paused: false,
    created: Date.now()
  },
  {
    id: 2,
    name: 'Evening Local Train',
    type: 'train',
    station: 'Pune Junction',
    departTime: '18:45',
    remindBefore: 20,
    days: ['Mon','Tue','Wed','Thu','Fri'],
    paused: false,
    created: Date.now()
  }
];

const DAYS = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
const TYPE_ICON = { bus: '🚌', train: '🚂', metro: '🚇', auto: '🛺' };
let notifTimers = {};
let selectedDays = ['Mon','Tue','Wed','Thu','Fri'];

// ——— INIT ———
document.addEventListener('DOMContentLoaded', () => {
  checkNotifPermission();
  renderDayChips();
  renderReminders();
  scheduleAll();
  startClock();
  setInterval(renderReminders, 30000); // refresh countdown every 30s
});

// ——— LIVE CLOCK ———
function startClock() {
  function tick() {
    const now = new Date();
    const h = String(now.getHours()).padStart(2,'0');
    const m = String(now.getMinutes()).padStart(2,'0');
    const s = String(now.getSeconds()).padStart(2,'0');
    document.getElementById('live-clock').textContent = `🕐 ${h}:${m}:${s}`;
  }
  tick();
  setInterval(tick, 1000);
}

// ——— NOTIFICATION PERMISSION ———
function checkNotifPermission() {
  const banner = document.getElementById('notif-banner');
  if (!('Notification' in window)) {
    banner.className = 'notif-banner denied';
    banner.innerHTML = `<span>⚠️ Browser doesn't support notifications. Reminders will still work if page is open.</span>`;
    return;
  }
  if (Notification.permission === 'granted') {
    banner.className = 'notif-banner ok';
    banner.innerHTML = `<span>✅ Notifications enabled! You'll get an alert before departure.</span>`;
  } else if (Notification.permission === 'denied') {
    banner.className = 'notif-banner denied';
    banner.innerHTML = `<span>🔕 Notifications blocked. Keep the page open to see countdown reminders.</span>`;
  } else {
    banner.className = 'notif-banner ask';
    banner.innerHTML = `<span>🔔 Enable notifications to get departure alerts!</span>
      <button class="btn-allow" onclick="requestNotif()">Allow</button>`;
  }
}

function requestNotif() {
  Notification.requestPermission().then(() => checkNotifPermission());
}

// ——— DAY CHIPS ———
function renderDayChips() {
  const container = document.getElementById('day-chips');
  container.innerHTML = DAYS.map(d => `
    <div class="day-chip ${selectedDays.includes(d) ? 'active' : ''}"
         onclick="toggleDay('${d}')">${d}</div>`).join('');
}

function toggleDay(day) {
  if (selectedDays.includes(day)) {
    selectedDays = selectedDays.filter(d => d !== day);
  } else {
    selectedDays.push(day);
  }
  renderDayChips();
}

// ——— ADD REMINDER ———
function addReminder() {
  const name         = document.getElementById('r-name').value.trim();
  const type         = document.getElementById('r-type').value;
  const station      = document.getElementById('r-station').value.trim();
  const departTime   = document.getElementById('r-time').value;
  const remindBefore = parseInt(document.getElementById('r-before').value);

  if (!name)       { showToast('⚠️ Enter a name!'); return; }
  if (!departTime) { showToast('⚠️ Select departure time!'); return; }
  if (selectedDays.length === 0) { showToast('⚠️ Select at least one day!'); return; }

  const reminder = {
    id:            Date.now(),
    name,
    type,
    station:       station || '',
    departTime,
    remindBefore,
    days:          [...selectedDays],
    paused:        false,
    created:       Date.now()
  };

  reminders.unshift(reminder);
  save();
  scheduleOne(reminder);
  renderReminders();
  resetForm();
  showToast(`✅ Reminder set for ${name}!`);
}

function resetForm() {
  document.getElementById('r-name').value    = '';
  document.getElementById('r-station').value = '';
  document.getElementById('r-time').value    = '';
  document.getElementById('r-type').value    = 'bus';
  document.getElementById('r-before').value  = '15';
  selectedDays = ['Mon','Tue','Wed','Thu','Fri'];
  renderDayChips();
}

// ——— SCHEDULE ———
function scheduleAll() {
  reminders.forEach(r => { if (!r.paused) scheduleOne(r); });
}

function scheduleOne(r) {
  if (r.paused) return;
  clearReminderTimer(r.id);

  const now        = new Date();
  const todayName  = DAYS[now.getDay()];
  if (!r.days.includes(todayName)) return;

  const [hh, mm]   = r.departTime.split(':').map(Number);
  const depart     = new Date();
  depart.setHours(hh, mm, 0, 0);

  const remindAt   = new Date(depart.getTime() - r.remindBefore * 60000);
  const delay      = remindAt - now;
  if (delay <= 0) return;

  notifTimers[r.id] = setTimeout(() => fireReminder(r), delay);
}

function clearReminderTimer(id) {
  if (notifTimers[id]) { clearTimeout(notifTimers[id]); delete notifTimers[id]; }
}

function fireReminder(r) {
  showToast(`🚨 ${r.name} departs in ${r.remindBefore} min!`);
  if (Notification.permission === 'granted') {
    new Notification(`${TYPE_ICON[r.type]} Time to leave! — ${r.name}`, {
      body: `${r.name} departs at ${r.departTime}. Leave now! 🏃`,
      icon: 'https://cdn-icons-png.flaticon.com/512/3448/3448359.png'
    });
  }
  renderReminders(); // refresh UI
}

// ——— TOGGLE PAUSE ———
function togglePause(id) {
  const r = reminders.find(r => r.id === id);
  if (!r) return;
  r.paused = !r.paused;
  if (r.paused) {
    clearReminderTimer(id);
    showToast(`⏸️ "${r.name}" paused`);
  } else {
    scheduleOne(r);
    showToast(`▶️ "${r.name}" resumed`);
  }
  save();
  renderReminders();
}

// ——— DELETE ———
function deleteReminder(id) {
  const r = reminders.find(r => r.id === id);
  if (!confirm(`Delete "${r ? r.name : 'this reminder'}"?`)) return;
  clearReminderTimer(id);
  reminders = reminders.filter(r => r.id !== id);
  save();
  renderReminders();
  showToast('🗑️ Deleted!');
}

// ——— COUNTDOWN ———
function getCountdown(r) {
  const now       = new Date();
  const todayName = DAYS[now.getDay()];
  const [hh, mm]  = r.departTime.split(':').map(Number);
  const depart    = new Date();
  depart.setHours(hh, mm, 0, 0);

  const remindAt  = new Date(depart.getTime() - r.remindBefore * 60000);
  const diffDepart = depart - now;
  const diffRemind = remindAt - now;

  if (!r.days.includes(todayName)) {
    // Find next scheduled day
    const todayIdx = now.getDay();
    let nextLabel = '';
    for (let i = 1; i <= 7; i++) {
      const nextDay = DAYS[(todayIdx + i) % 7];
      if (r.days.includes(nextDay)) { nextLabel = nextDay; break; }
    }
    return { label: `Next: ${nextLabel}`, value: '—', status: 'normal' };
  }

  if (diffDepart < 0) {
    return { label: 'Today\'s departure', value: 'Passed ✓', status: 'passed' };
  }

  const totalMins = Math.floor(diffDepart / 60000);
  const hrs  = Math.floor(totalMins / 60);
  const mins = totalMins % 60;

  if (totalMins <= r.remindBefore) {
    return {
      label: '🚨 Time to leave!',
      value: `${totalMins} min to depart`,
      status: 'now'
    };
  }

  if (diffRemind > 0) {
    const remindMins = Math.floor(diffRemind / 60000);
    const rh = Math.floor(remindMins / 60);
    const rm = remindMins % 60;
    return {
      label: 'Reminder in',
      value: rh > 0 ? `${rh}h ${rm}m` : `${rm} min`,
      status: totalMins <= 30 ? 'soon' : 'active'
    };
  }

  return {
    label: 'Departs in',
    value: hrs > 0 ? `${hrs}h ${mins}m` : `${mins} min`,
    status: 'active'
  };
}

// ——— RENDER REMINDERS ———
function renderReminders() {
  const container = document.getElementById('reminder-list');
  const countEl   = document.getElementById('list-count');
  const active    = reminders.filter(r => !r.paused).length;
  countEl.textContent = `${reminders.length} total · ${active} active`;

  if (reminders.length === 0) {
    container.innerHTML = `
      <div class="empty-state">
        <span>🚌</span>
        <p>No reminders yet!<br>Add your first bus or train reminder above.</p>
      </div>`;
    return;
  }

  container.innerHTML = reminders.map(r => {
    const cd       = r.paused ? null : getCountdown(r);
    const icon     = TYPE_ICON[r.type] || '🚌';
    const daysStr  = r.days.join(', ');
    const statusCls = r.paused ? 'paused' : (cd ? `status-${cd.status}` : 'status-normal');

    return `
      <div class="reminder-item ${statusCls}">
        <div class="ri-top">
          <div class="ri-icon">${icon}</div>
          <div class="ri-info">
            <div class="ri-name">
              ${escHtml(r.name)}
              ${r.paused ? '<span class="badge-paused">Paused</span>' : ''}
            </div>
            <div class="ri-sub">${r.station ? '📍 ' + escHtml(r.station) : '📍 No station set'}</div>
            <div class="ri-tags">
              <span class="tag tag-time">🕐 Departs ${r.departTime}</span>
              <span class="tag tag-remind">⏰ ${r.remindBefore} min before</span>
              <span class="tag tag-days">📅 ${daysStr}</span>
            </div>
          </div>
        </div>

        ${!r.paused && cd ? `
        <div class="ri-countdown">
          <span class="countdown-label">${cd.label}</span>
          <span class="countdown-value ${cd.status}">${cd.value}</span>
        </div>` : ''}

        <div class="ri-actions">
          <button class="btn btn-sm ${r.paused ? 'btn-success-soft' : 'btn-gray'}"
                  onclick="togglePause(${r.id})">
            ${r.paused ? '▶️ Resume' : '⏸️ Pause'}
          </button>
          <button class="btn btn-sm btn-danger-soft" onclick="deleteReminder(${r.id})">🗑️ Delete</button>
        </div>
      </div>`;
  }).join('');
}

// ——— SAVE ———
function save() {
  localStorage.setItem('bt_reminders', JSON.stringify(reminders));
}

// ——— TOAST ———
function showToast(msg) {
  const toast = document.getElementById('toast');
  toast.textContent = msg;
  toast.classList.add('show');
  setTimeout(() => toast.classList.remove('show'), 3000);
}

// ——— ESCAPE HTML ———
function escHtml(s) {
  return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
}
