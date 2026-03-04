const STORAGE_KEY = 'skillswap_live_data';

const state = {
  sessions: [],
  bookings: [],
  skillRatings: {},
};

const elements = {
  form: document.getElementById('session-form'),
  title: document.getElementById('session-title'),
  mentor: document.getElementById('mentor-name'),
  tags: document.getElementById('skill-tags'),
  time: document.getElementById('session-time'),
  seats: document.getElementById('seat-count'),
  search: document.getElementById('search-tags'),
  clearSearch: document.getElementById('clear-search'),
  sessionList: document.getElementById('session-list'),
  bookingList: document.getElementById('booking-list'),
  toast: document.getElementById('toast'),
};

function uid() {
  return '_' + Math.random().toString(36).slice(2, 10);
}

function showToast(message) {
  elements.toast.textContent = message;
  elements.toast.style.display = 'block';
  setTimeout(() => {
    elements.toast.style.display = 'none';
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
  state.sessions = parsed.sessions || [];
  state.bookings = parsed.bookings || [];
  state.skillRatings = parsed.skillRatings || {};
}

function seedData() {
  state.sessions = [
    {
      id: uid(),
      title: 'Figma Wireframing Sprint',
      mentor: 'Riya',
      tags: ['ui design', 'figma'],
      time: new Date(Date.now() + 86400000).toISOString(),
      seats: 10,
      attendees: 4,
      feedback: [],
    },
    {
      id: uid(),
      title: 'JavaScript Interview Drills',
      mentor: 'Arjun',
      tags: ['javascript', 'interview prep'],
      time: new Date(Date.now() + 2 * 86400000).toISOString(),
      seats: 12,
      attendees: 7,
      feedback: [],
    },
  ];
  state.bookings = [];
  state.skillRatings = {};
  save();
}

function formatDate(iso) {
  return new Date(iso).toLocaleString();
}

function normalizeTags(input) {
  return input
    .split(',')
    .map((t) => t.trim().toLowerCase())
    .filter(Boolean)
    .slice(0, 8);
}

function averageRating(session) {
  if (!session.feedback.length) return 'No ratings';
  const sum = session.feedback.reduce((acc, item) => acc + Number(item.rating), 0);
  return (sum / session.feedback.length).toFixed(1) + '/5';
}

function renderSessions() {
  const query = elements.search.value.trim().toLowerCase();
  const filtered = !query
    ? state.sessions
    : state.sessions.filter((s) => s.tags.some((tag) => tag.includes(query)));

  if (!filtered.length) {
    elements.sessionList.innerHTML = '<div class="item">No sessions match this skill tag.</div>';
    return;
  }

  elements.sessionList.innerHTML = filtered
    .map((session) => {
      const seatsLeft = Math.max(session.seats - session.attendees, 0);
      return `
        <article class="item">
          <strong>${session.title}</strong>
          <div class="meta">Mentor: ${session.mentor}</div>
          <div class="meta">Time: ${formatDate(session.time)}</div>
          <div class="meta">Seats left: ${seatsLeft}/${session.seats}</div>
          <div class="meta">Avg rating: ${averageRating(session)}</div>
          <div class="tags">
            ${session.tags.map((tag) => `<span class="tag">#${tag}</span>`).join('')}
          </div>
          <div class="item-actions">
            <button data-action="book" data-id="${session.id}">Book Slot</button>
            <button class="btn-secondary" data-action="rate" data-id="${session.id}">Rate Session</button>
          </div>
        </article>
      `;
    })
    .join('');
}

function renderBookings() {
  if (!state.bookings.length) {
    elements.bookingList.innerHTML = '<div class="item">No bookings yet.</div>';
    return;
  }

  elements.bookingList.innerHTML = state.bookings
    .map((booking) => {
      const session = state.sessions.find((s) => s.id === booking.sessionId);
      if (!session) return '';
      return `
        <article class="item">
          <strong>${session.title}</strong>
          <div class="meta">Booked by: ${booking.name}</div>
          <div class="meta">Reminder: ${booking.reminder ? 'On' : 'Off'}</div>
          <div class="meta">Time: ${formatDate(session.time)}</div>
          <div class="item-actions">
            <button class="btn-muted" data-action="toggle-reminder" data-booking-id="${booking.id}">
              ${booking.reminder ? 'Disable Reminder' : 'Enable Reminder'}
            </button>
          </div>
        </article>
      `;
    })
    .join('');
}

function renderAll() {
  renderSessions();
  renderBookings();
}

function addSession(event) {
  event.preventDefault();

  const tags = normalizeTags(elements.tags.value);
  if (!tags.length) {
    showToast('Add at least one skill tag.');
    return;
  }

  const session = {
    id: uid(),
    title: elements.title.value.trim(),
    mentor: elements.mentor.value.trim(),
    tags,
    time: new Date(elements.time.value).toISOString(),
    seats: Number(elements.seats.value),
    attendees: 0,
    feedback: [],
  };

  state.sessions.unshift(session);
  save();
  elements.form.reset();
  renderAll();
  showToast('Session published.');
}

function bookSession(sessionId) {
  const session = state.sessions.find((s) => s.id === sessionId);
  if (!session) return;

  if (session.attendees >= session.seats) {
    showToast('This session is full.');
    return;
  }

  const name = prompt('Enter your name for booking:');
  if (!name) return;

  const alreadyBooked = state.bookings.some(
    (b) => b.sessionId === sessionId && b.name.toLowerCase() === name.trim().toLowerCase()
  );

  if (alreadyBooked) {
    showToast('You already booked this session.');
    return;
  }

  session.attendees += 1;
  state.bookings.unshift({
    id: uid(),
    sessionId,
    name: name.trim(),
    reminder: true,
  });
  save();
  renderAll();
  showToast('Booking confirmed. Reminder enabled.');
}

function rateSession(sessionId) {
  const session = state.sessions.find((s) => s.id === sessionId);
  if (!session) return;

  const rating = Number(prompt('Rate this session from 1 to 5:'));
  if (!Number.isFinite(rating) || rating < 1 || rating > 5) {
    showToast('Invalid rating. Use 1 to 5.');
    return;
  }

  const comment = prompt('Optional feedback comment:') || '';
  session.feedback.push({ rating, comment, createdAt: new Date().toISOString() });

  session.tags.forEach((tag) => {
    if (!state.skillRatings[tag]) state.skillRatings[tag] = [];
    state.skillRatings[tag].push(rating);
  });

  save();
  renderAll();
  showToast('Thanks for your feedback.');
}

function toggleReminder(bookingId) {
  const booking = state.bookings.find((b) => b.id === bookingId);
  if (!booking) return;
  booking.reminder = !booking.reminder;
  save();
  renderBookings();
  showToast(`Reminder ${booking.reminder ? 'enabled' : 'disabled'}.`);
}

function bindEvents() {
  elements.form.addEventListener('submit', addSession);
  elements.search.addEventListener('input', renderSessions);
  elements.clearSearch.addEventListener('click', () => {
    elements.search.value = '';
    renderSessions();
  });

  elements.sessionList.addEventListener('click', (event) => {
    const button = event.target.closest('button');
    if (!button) return;
    const action = button.dataset.action;
    const id = button.dataset.id;

    if (action === 'book') bookSession(id);
    if (action === 'rate') rateSession(id);
  });

  elements.bookingList.addEventListener('click', (event) => {
    const button = event.target.closest('button');
    if (!button) return;
    if (button.dataset.action === 'toggle-reminder') {
      toggleReminder(button.dataset.bookingId);
    }
  });
}

function init() {
  load();
  bindEvents();
  renderAll();
}

init();
