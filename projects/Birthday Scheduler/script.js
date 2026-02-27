
let reminders = JSON.parse(localStorage.getItem('wa_reminders') || '[]');
let selectedEmoji = '🎂';
let selectedTemplate = 0;
let pendingDeleteId = null;
let timerMap = {}; 


const TEMPLATES = [
  (name) => `🎂 Happy Birthday ${name}! 🎉 Wishing you a wonderful day filled with joy and happiness! May all your dreams come true! 🌟`,
  (name) => `🥳 Hey ${name}! It's your special day! Wishing you loads of happiness, success and good health! Happy Birthday! 🎈`,
  (name) => `🌸 Happy Birthday ${name}! 🎊 May this year bring you everything you've wished for. Have an amazing birthday! 💫`,
  (name) => `🎁 Wishing you a very Happy Birthday ${name}! 🎂 Hope your day is as awesome as you are! Enjoy to the fullest! 🥂`,
  (name) => `✨ Happy Birthday ${name}! 🎉 Another year older, another year wiser! Wishing you all the best on your special day! 🌈`,
];


document.addEventListener('DOMContentLoaded', () => {
  checkNotifPermission();
  renderReminders();
  scheduleAll();
  setMinDateTime();
  selectEmoji('🎂');
  selectTemplate(0);

  // Character counter
  const msgEl = document.getElementById('msg-input');
  msgEl.addEventListener('input', updateCharCount);

  // Tick countdown every 30s
  setInterval(renderReminders, 30000);
});

// ——— MIN DATE/TIME (now) ———
function setMinDateTime() {
  const now = new Date();
  const pad = n => String(n).padStart(2,'0');
  const dateStr = `${now.getFullYear()}-${pad(now.getMonth()+1)}-${pad(now.getDate())}`;
  document.getElementById('bday-date').min = dateStr;
}

// ——— EMOJI PICKER ———
function selectEmoji(emoji) {
  selectedEmoji = emoji;
  document.querySelectorAll('.emoji-pick').forEach(el => {
    el.classList.toggle('selected', el.dataset.emoji === emoji);
  });
}

// ——— TEMPLATE PICKER ———
function selectTemplate(idx) {
  selectedTemplate = idx;
  document.querySelectorAll('.tpl-chip').forEach((el, i) => {
    el.classList.toggle('active', i === idx);
  });
  // Fill preview
  const nameVal = document.getElementById('friend-name').value.trim() || 'Friend';
  document.getElementById('msg-input').value = TEMPLATES[idx](nameVal);
  updateCharCount();
}

function updateCharCount() {
  const val = document.getElementById('msg-input').value.length;
  const el = document.getElementById('char-count');
  el.textContent = `${val} characters`;
  el.classList.toggle('warn', val > 400);
}

// Update template when name changes
document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('friend-name').addEventListener('input', () => {
    const nameVal = document.getElementById('friend-name').value.trim() || 'Friend';
    document.getElementById('msg-input').value = TEMPLATES[selectedTemplate](nameVal);
    updateCharCount();
  });
});

// ——— NOTIFICATION PERMISSION ———
function checkNotifPermission() {
  const banner = document.getElementById('notif-banner');
  if (!('Notification' in window)) {
    banner.className = 'notif-banner denied';
    banner.innerHTML = `<span>⚠️ Your browser doesn't support notifications. App will still open WhatsApp at the set time if the page is open.</span>`;
    return;
  }
  if (Notification.permission === 'granted') {
    banner.className = 'notif-banner ok';
    banner.innerHTML = `<span>✅ Browser notifications are enabled! You'll get an alert before WhatsApp opens.</span>`;
  } else if (Notification.permission === 'denied') {
    banner.className = 'notif-banner denied';
    banner.innerHTML = `<span>🔕 Notifications blocked. WhatsApp will still open at the set time if this page is open.</span>`;
  } else {
    banner.className = 'notif-banner ask';
    banner.innerHTML = `<span>🔔 Enable notifications to get an alert when birthday time arrives!</span><button class="btn-allow" onclick="requestNotif()">Allow</button>`;
  }
}

function requestNotif() {
  Notification.requestPermission().then(() => checkNotifPermission());
}

// ——— ADD REMINDER ———
function addReminder() {
  const name    = document.getElementById('friend-name').value.trim();
  const phone   = document.getElementById('friend-phone').value.trim();
  const code    = document.getElementById('country-code').value;
  const date    = document.getElementById('bday-date').value;
  const time    = document.getElementById('bday-time').value;
  const message = document.getElementById('msg-input').value.trim();

  // Validation
  if (!name)    { showToast('⚠️ Please enter a name!'); return; }
  if (!phone)   { showToast('⚠️ Please enter a phone number!'); return; }
  if (!date)    { showToast('⚠️ Please select a date!'); return; }
  if (!time)    { showToast('⚠️ Please select a time!'); return; }
  if (!message) { showToast('⚠️ Please write a message!'); return; }

  // Phone number cleanup
  const cleanPhone = phone.replace(/\D/g, '');
  if (cleanPhone.length < 7) { showToast('⚠️ Invalid phone number!'); return; }

  // Check if date+time is in future
  const scheduled = new Date(`${date}T${time}`);
  if (scheduled <= new Date()) { showToast('⚠️ Please choose a future date and time!'); return; }

  const reminder = {
    id:       Date.now(),
    name,
    phone:    code + cleanPhone,
    date,
    time,
    message,
    emoji:    selectedEmoji,
    fired:    false,
    created:  new Date().toISOString(),
  };

  reminders.unshift(reminder);
  saveReminders();
  scheduleOne(reminder);
  renderReminders();
  resetForm();
  showToast(`✅ Reminder set for ${name}! 🎂`);
}

// ——— RESET FORM ———
function resetForm() {
  document.getElementById('friend-name').value  = '';
  document.getElementById('friend-phone').value = '';
  document.getElementById('bday-date').value    = '';
  document.getElementById('bday-time').value    = '';
  selectTemplate(0);
  selectEmoji('🎂');
}

// ——— SCHEDULE ———
function scheduleAll() {
  reminders.forEach(r => { if (!r.fired) scheduleOne(r); });
}

function scheduleOne(reminder) {
  const scheduled = new Date(`${reminder.date}T${reminder.time}`);
  const delay = scheduled - new Date();
  if (delay <= 0) return;

  // Clear existing timer if any
  if (timerMap[reminder.id]) clearTimeout(timerMap[reminder.id]);

  timerMap[reminder.id] = setTimeout(() => {
    fireReminder(reminder.id);
  }, delay);
}

function fireReminder(id) {
  const reminder = reminders.find(r => r.id === id);
  if (!reminder || reminder.fired) return;

  // Show browser notification
  if (Notification.permission === 'granted') {
    new Notification(`🎂 Birthday Time! - ${reminder.name}`, {
      body: `Time to send your WhatsApp message to ${reminder.name}!`,
      icon: 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/6b/WhatsApp.svg/64px-WhatsApp.svg.png',
    });
  }

  // Mark as fired
  reminder.fired = true;
  saveReminders();
  renderReminders();

  // Open WhatsApp
  openWhatsApp(reminder.phone, reminder.message);
  showToast(`🎉 Birthday time for ${reminder.name}! Opening WhatsApp...`);
}

// ——— OPEN WHATSAPP ———
function openWhatsApp(phone, message) {
  const encoded = encodeURIComponent(message);
  const url = `https://wa.me/${phone}?text=${encoded}`;
  window.open(url, '_blank');
}

// ——— SEND NOW ———
function sendNow(id) {
  const reminder = reminders.find(r => r.id === id);
  if (!reminder) return;
  openWhatsApp(reminder.phone, reminder.message);
  showToast(`📲 Opening WhatsApp for ${reminder.name}!`);
}

// ——— DELETE ———
function confirmDelete(id) {
  pendingDeleteId = id;
  const reminder = reminders.find(r => r.id === id);
  document.getElementById('delete-name').textContent = reminder ? reminder.name : '';
  document.getElementById('modal-backdrop').classList.add('open');
}

function cancelDelete() {
  pendingDeleteId = null;
  document.getElementById('modal-backdrop').classList.remove('open');
}

function confirmDeleteFinal() {
  if (!pendingDeleteId) return;
  if (timerMap[pendingDeleteId]) clearTimeout(timerMap[pendingDeleteId]);
  reminders = reminders.filter(r => r.id !== pendingDeleteId);
  saveReminders();
  renderReminders();
  cancelDelete();
  showToast('🗑️ Reminder deleted!');
}

// ——— RENDER REMINDERS ———
function renderReminders() {
  const container = document.getElementById('reminder-list');
  const countEl   = document.getElementById('reminder-count');
  const active = reminders.filter(r => !r.fired).length;
  countEl.textContent = `${reminders.length} total`;

  if (reminders.length === 0) {
    container.innerHTML = `
      <div class="empty-state">
        <span>🎈</span>
        <p>No reminders yet!<br>Add your first birthday reminder above.</p>
      </div>`;
    return;
  }

  container.innerHTML = reminders.map(r => {
    const scheduled = new Date(`${r.date}T${r.time}`);
    const now = new Date();
    const countdown = r.fired ? '' : getCountdown(scheduled, now);
    const dateStr = scheduled.toLocaleDateString('en-IN', { day:'numeric', month:'short', year:'numeric' });
    const timeStr = scheduled.toLocaleTimeString('en-IN', { hour:'2-digit', minute:'2-digit' });
    const initial = r.name.charAt(0).toUpperCase();

    return `
      <div class="reminder-item ${r.fired ? 'fired' : ''}">
        <div class="ri-avatar">${r.emoji || initial}</div>
        <div class="ri-info">
          <div class="ri-name">${escHtml(r.name)}</div>
          <div class="ri-phone">📞 +${escHtml(r.phone)}</div>
          <div class="ri-meta">
            <span class="ri-time">📅 ${dateStr} at ${timeStr}</span>
            ${r.fired
              ? `<span class="ri-fired-badge">✅ Sent</span>`
              : `<span class="ri-countdown">⏳ ${countdown}</span>`}
          </div>
        </div>
        <div class="ri-actions">
          <button class="btn-send-now" onclick="sendNow(${r.id})">📲 Send</button>
          <button class="btn-danger" onclick="confirmDelete(${r.id})">🗑️</button>
        </div>
      </div>`;
  }).join('');
}

// ——— COUNTDOWN STRING ———
function getCountdown(target, now) {
  const diff = target - now;
  if (diff <= 0) return 'Now!';
  const days  = Math.floor(diff / 86400000);
  const hours = Math.floor((diff % 86400000) / 3600000);
  const mins  = Math.floor((diff % 3600000) / 60000);
  if (days > 0)  return `${days}d ${hours}h`;
  if (hours > 0) return `${hours}h ${mins}m`;
  return `${mins}m`;
}

// ——— SAVE ———
function saveReminders() {
  localStorage.setItem('wa_reminders', JSON.stringify(reminders));
}

// ——— TOAST ———
function showToast(msg) {
  let toast = document.getElementById('toast');
  toast.textContent = msg;
  toast.classList.add('show');
  setTimeout(() => toast.classList.remove('show'), 3000);
}

// ——— ESCAPE HTML ———
function escHtml(s) {
  return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
}
