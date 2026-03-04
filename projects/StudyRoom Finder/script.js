const STORAGE_KEY = 'studyroom_finder_v1';

const state = {
  spots: [],
  favorites: [],
};

const el = {
  location: document.getElementById('location'),
  distance: document.getElementById('distance'),
  noise: document.getElementById('noise'),
  wifi: document.getElementById('wifi'),
  sockets: document.getElementById('sockets'),
  openNow: document.getElementById('openNow'),
  applyBtn: document.getElementById('apply-btn'),
  resetBtn: document.getElementById('reset-btn'),
  spots: document.getElementById('spots'),
  favorites: document.getElementById('favorites'),
  toast: document.getElementById('toast'),
};

function uid() {
  return '_' + Math.random().toString(36).slice(2, 10);
}

function showToast(message) {
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
    seed();
    return;
  }
  const parsed = JSON.parse(raw);
  state.spots = parsed.spots || [];
  state.favorites = parsed.favorites || [];
}

function seed() {
  state.spots = [
    {
      id: uid(),
      name: 'Central Library Hall',
      location: 'North Campus',
      distance: 2.4,
      noise: 'quiet',
      wifi: true,
      sockets: true,
      openNow: true,
      rating: 4.6,
      reviews: ['Great for long focus sessions.'],
    },
    {
      id: uid(),
      name: 'Night Owl Reading Hub',
      location: 'Civil Lines',
      distance: 6.9,
      noise: 'moderate',
      wifi: true,
      sockets: false,
      openNow: true,
      rating: 4.1,
      reviews: ['Good late-night timings.'],
    },
    {
      id: uid(),
      name: 'Sunrise Study Cafe',
      location: 'Rajouri Garden',
      distance: 9.5,
      noise: 'lively',
      wifi: true,
      sockets: true,
      openNow: false,
      rating: 3.9,
      reviews: ['Crowded in the evening.'],
    },
    {
      id: uid(),
      name: 'Silent Stack Room',
      location: 'Mukherjee Nagar',
      distance: 4.1,
      noise: 'quiet',
      wifi: false,
      sockets: true,
      openNow: true,
      rating: 4.3,
      reviews: [],
    },
  ];
  state.favorites = [];
  save();
}

function applyFilters() {
  const maxDistance = Number(el.distance.value) || 50;
  const noise = el.noise.value;
  const needsWifi = el.wifi.checked;
  const needsSockets = el.sockets.checked;
  const needsOpenNow = el.openNow.checked;
  const locationQuery = el.location.value.trim().toLowerCase();

  return state.spots.filter((spot) => {
    if (spot.distance > maxDistance) return false;
    if (noise !== 'all' && spot.noise !== noise) return false;
    if (needsWifi && !spot.wifi) return false;
    if (needsSockets && !spot.sockets) return false;
    if (needsOpenNow && !spot.openNow) return false;

    if (locationQuery) {
      const hay = `${spot.location} ${spot.name}`.toLowerCase();
      if (!hay.includes(locationQuery)) return false;
    }

    return true;
  });
}

function spotCard(spot) {
  const isFav = state.favorites.includes(spot.id);
  const tagItems = [spot.noise, spot.wifi ? 'wifi' : 'no wifi', spot.sockets ? 'sockets' : 'no sockets', spot.openNow ? 'open' : 'closed'];

  const reviews = spot.reviews.length
    ? `<div class="meta">Latest review: ${spot.reviews[spot.reviews.length - 1]}</div>`
    : '<div class="meta">No reviews yet</div>';

  return `
    <article class="spot">
      <h3>${spot.name}</h3>
      <div class="meta">${spot.location} • ${spot.distance} km away • Rating ${spot.rating.toFixed(1)}</div>
      <div class="tags">${tagItems.map((t) => `<span class="tag">${t}</span>`).join('')}</div>
      ${reviews}
      <div class="actions">
        <button data-action="favorite" data-id="${spot.id}">${isFav ? 'Unsave' : 'Save Favorite'}</button>
        <button data-action="toggle-open" data-id="${spot.id}" class="muted">Mark ${spot.openNow ? 'Closed' : 'Open'}</button>
      </div>
      <div class="review-box">
        <textarea id="review-${spot.id}" placeholder="Write a short review..."></textarea>
        <button data-action="review" data-id="${spot.id}">Add Review</button>
      </div>
    </article>
  `;
}

function renderSpots() {
  const filtered = applyFilters();

  if (!filtered.length) {
    el.spots.innerHTML = '<article class="spot">No study spots match your filters.</article>';
    return;
  }

  el.spots.innerHTML = filtered.map(spotCard).join('');
}

function renderFavorites() {
  const favSpots = state.spots.filter((s) => state.favorites.includes(s.id));

  if (!favSpots.length) {
    el.favorites.innerHTML = '<article class="favorite">No favorite spots yet.</article>';
    return;
  }

  el.favorites.innerHTML = favSpots
    .map(
      (spot) => `
      <article class="favorite">
        <h3>${spot.name}</h3>
        <div class="meta">${spot.location} • Rating ${spot.rating.toFixed(1)}</div>
      </article>
    `
    )
    .join('');
}

function toggleFavorite(id) {
  const i = state.favorites.indexOf(id);
  if (i >= 0) {
    state.favorites.splice(i, 1);
    showToast('Removed from favorites.');
  } else {
    state.favorites.push(id);
    showToast('Saved to favorites.');
  }
  save();
  renderFavorites();
  renderSpots();
}

function toggleOpen(id) {
  const spot = state.spots.find((s) => s.id === id);
  if (!spot) return;
  spot.openNow = !spot.openNow;
  save();
  renderSpots();
  renderFavorites();
}

function addReview(id) {
  const spot = state.spots.find((s) => s.id === id);
  if (!spot) return;

  const box = document.getElementById(`review-${id}`);
  const text = (box?.value || '').trim();
  if (!text) {
    showToast('Write a review first.');
    return;
  }

  spot.reviews.push(text);
  const n = spot.reviews.length;
  const impact = n <= 3 ? 0.1 : 0.05;
  spot.rating = Math.min(5, spot.rating + impact);

  save();
  renderSpots();
  renderFavorites();
  showToast('Review added.');
}

function resetFilters() {
  el.location.value = '';
  el.distance.value = 8;
  el.noise.value = 'all';
  el.wifi.checked = false;
  el.sockets.checked = false;
  el.openNow.checked = false;
  renderSpots();
}

function bind() {
  el.applyBtn.addEventListener('click', renderSpots);
  el.resetBtn.addEventListener('click', resetFilters);

  el.spots.addEventListener('click', (event) => {
    const btn = event.target.closest('button');
    if (!btn) return;

    const action = btn.dataset.action;
    const id = btn.dataset.id;

    if (action === 'favorite') toggleFavorite(id);
    if (action === 'toggle-open') toggleOpen(id);
    if (action === 'review') addReview(id);
  });
}

function init() {
  load();
  bind();
  renderSpots();
  renderFavorites();
}

init();
