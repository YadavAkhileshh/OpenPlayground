// EventNest Main JavaScript

const eventForm = document.getElementById('eventForm');
const resultDiv = document.getElementById('result');
const eventsSection = document.getElementById('eventsSection');
const eventsList = document.getElementById('eventsList');
const rsvpSection = document.getElementById('rsvpSection');
const rsvpForm = document.getElementById('rsvpForm');
const rsvpResult = document.getElementById('rsvpResult');
const historyDiv = document.getElementById('history');
const historyList = document.getElementById('historyList');
const clearHistoryBtn = document.getElementById('clearHistory');

const events = [
  {
    id: 1,
    name: 'ReactJS Meetup',
    location: 'Tech Park',
    date: '2026-03-10',
    tags: ['tech', 'react', 'meetup'],
    description: 'A meetup for ReactJS enthusiasts.'
  },
  {
    id: 2,
    name: 'Startup Pitch Night',
    location: 'Innovation Hub',
    date: '2026-03-15',
    tags: ['startup', 'business', 'networking'],
    description: 'Pitch your startup idea to investors.'
  },
  {
    id: 3,
    name: 'College Fest',
    location: 'City College',
    date: '2026-03-20',
    tags: ['college', 'music', 'fun'],
    description: 'Annual college fest with music, food, and games.'
  },
  {
    id: 4,
    name: 'AI Workshop',
    location: 'Tech Park',
    date: '2026-03-25',
    tags: ['ai', 'workshop', 'tech'],
    description: 'Hands-on workshop on Artificial Intelligence.'
  },
  {
    id: 5,
    name: 'Book Club Gathering',
    location: 'Central Library',
    date: '2026-03-12',
    tags: ['books', 'reading', 'club'],
    description: 'Monthly book club discussion.'
  }
];

let rsvpHistory = JSON.parse(localStorage.getItem('eventNestRSVP') || '[]');

function saveHistory() {
  localStorage.setItem('eventNestRSVP', JSON.stringify(rsvpHistory));
}

function renderHistory() {
  historyList.innerHTML = '';
  if (rsvpHistory.length === 0) {
    historyList.innerHTML = '<li>No previous RSVPs found.</li>';
    return;
  }
  rsvpHistory.slice(-10).reverse().forEach(item => {
    const li = document.createElement('li');
    li.innerHTML = `<strong>${item.eventName}</strong> | ${item.name} | <span style='color:#1976d2'>${item.date}</span>`;
    historyList.appendChild(li);
  });
}

function addToHistory(eventName, name) {
  rsvpHistory.push({
    eventName,
    name,
    date: new Date().toLocaleString()
  });
  if (rsvpHistory.length > 50) rsvpHistory = rsvpHistory.slice(-50);
  saveHistory();
  renderHistory();
}

function renderEvents(filteredEvents) {
  eventsList.innerHTML = '';
  if (filteredEvents.length === 0) {
    eventsList.innerHTML = '<li>No events found.</li>';
    return;
  }
  filteredEvents.forEach(event => {
    const li = document.createElement('li');
    li.innerHTML = `<strong>${event.name}</strong> - ${event.location} - ${event.date}<br>${event.description}<br><button onclick="showRSVP(${event.id})">RSVP</button>`;
    eventsList.appendChild(li);
  });
}

function showRSVP(eventId) {
  rsvpSection.style.display = 'block';
  rsvpSection.setAttribute('data-event-id', eventId);
  rsvpResult.innerHTML = '';
}

function filterEvents(query) {
  query = query.trim().toLowerCase();
  if (!query) return events;
  return events.filter(event =>
    event.name.toLowerCase().includes(query) ||
    event.location.toLowerCase().includes(query) ||
    event.tags.some(tag => tag.includes(query))
  );
}

eventForm.addEventListener('submit', function(e) {
  e.preventDefault();
  const query = document.getElementById('search').value;
  const filtered = filterEvents(query);
  renderEvents(filtered);
  resultDiv.style.display = 'block';
  resultDiv.innerHTML = `<strong>${filtered.length}</strong> event(s) found.`;
});

rsvpForm.addEventListener('submit', function(e) {
  e.preventDefault();
  const name = document.getElementById('name').value.trim();
  const email = document.getElementById('email').value.trim();
  const eventId = parseInt(rsvpSection.getAttribute('data-event-id'));
  const eventObj = events.find(ev => ev.id === eventId);
  if (!name || !email || !eventObj) {
    rsvpResult.innerHTML = '<span style="color:red">Please fill all fields correctly.</span>';
    return;
  }
  addToHistory(eventObj.name, name);
  rsvpResult.innerHTML = `<span style="color:green">RSVP confirmed for <strong>${eventObj.name}</strong>! Thank you, ${name}.</span>`;
  setTimeout(() => {
    rsvpSection.style.display = 'none';
    rsvpResult.innerHTML = '';
    rsvpForm.reset();
  }, 2000);
});

clearHistoryBtn.addEventListener('click', function() {
  rsvpHistory = [];
  saveHistory();
  renderHistory();
});

// Initial render
renderEvents(events);
renderHistory();
