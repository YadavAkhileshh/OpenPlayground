/**
 * SCIENCE PROJECTS HUB — script.js
 * Loads projects.json, renders cards, handles filtering/search/modal
 */

'use strict';

// ─── STATE ───────────────────────────────────────────────────
let allProjects = [];
let categories = [];
let meta = {};
let activeCategory = 'all';
let searchQuery = '';
let sortOrder = 'featured';

// ─── INIT ─────────────────────────────────────────────────────
async function init() {
  try {
    const res = await fetch('projects.json');
    if (!res.ok) throw new Error('Failed to load projects.json');
    const data = await res.json();

    allProjects = data.projects;
    categories  = data.categories;
    meta        = data.meta;

    applyMeta();
    buildFilters();
    render();
    bindEvents();
  } catch (err) {
    console.error(err);
    document.getElementById('projectGrid').innerHTML =
      `<p style="color:#ff4d4d;font-size:13px;">⚠ Could not load projects.json. Open via a local server (e.g., <code>npx serve .</code>).</p>`;
  }
}

// ─── META ─────────────────────────────────────────────────────
function applyMeta() {
  document.title = meta.title;
  document.querySelector('.header-label').textContent = meta.description;
  document.getElementById('metaTotal').textContent   = meta.totalProjects;
  document.getElementById('metaCats').textContent    = categories.length;
  document.getElementById('metaVer').textContent     = meta.version;
  document.getElementById('metaDate').textContent    = meta.lastUpdated;
  document.getElementById('footerTitle').textContent = meta.title;
}

// ─── FILTERS ──────────────────────────────────────────────────
function buildFilters() {
  const container = document.getElementById('filterTabs');
  // "All" button already in HTML; add category buttons dynamically
  categories.forEach(cat => {
    const btn = document.createElement('button');
    btn.className = 'filter-btn';
    btn.dataset.cat = cat.id;
    btn.textContent = `${cat.icon} ${cat.label}`;
    btn.style.setProperty('--cat-accent', cat.color);
    btn.addEventListener('click', () => setCategory(cat.id));
    container.appendChild(btn);
  });
}

function setCategory(id) {
  activeCategory = id;
  document.querySelectorAll('.filter-btn').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.cat === id);
  });
  render();
}

// ─── SORT + SEARCH ────────────────────────────────────────────
function getFiltered() {
  let list = [...allProjects];

  // category filter
  if (activeCategory !== 'all') {
    list = list.filter(p => p.category === activeCategory);
  }

  // search
  if (searchQuery) {
    const q = searchQuery.toLowerCase();
    list = list.filter(p =>
      p.title.toLowerCase().includes(q) ||
      p.description.toLowerCase().includes(q) ||
      p.tags.some(t => t.toLowerCase().includes(q))
    );
  }

  // sort
  switch (sortOrder) {
    case 'featured':
      list.sort((a, b) => b.featured - a.featured);
      break;
    case 'az':
      list.sort((a, b) => a.title.localeCompare(b.title));
      break;
    case 'difficulty':
      const order = { Beginner: 0, Intermediate: 1, Advanced: 2 };
      list.sort((a, b) => order[a.difficulty] - order[b.difficulty]);
      break;
    case 'duration':
      list.sort((a, b) => parseInt(a.duration) - parseInt(b.duration));
      break;
  }

  return list;
}

// ─── RENDER ───────────────────────────────────────────────────
function render() {
  const grid  = document.getElementById('projectGrid');
  const empty = document.getElementById('emptyState');
  const count = document.getElementById('resultsCount');
  const list  = getFiltered();

  grid.innerHTML = '';

  if (list.length === 0) {
    empty.style.display = 'block';
    count.innerHTML = `<span>0</span> projects found`;
    return;
  }

  empty.style.display = 'none';
  count.innerHTML = `<span>${list.length}</span> project${list.length !== 1 ? 's' : ''} found`;

  list.forEach((project, i) => {
    const cat   = categories.find(c => c.id === project.category) || {};
    const card  = buildCard(project, cat, i);
    grid.appendChild(card);
  });
}

function buildCard(p, cat, index) {
  const card = document.createElement('article');
  card.className = 'card';
  card.style.animationDelay = `${index * 40}ms`;
  card.style.setProperty('--cat-color', cat.color || 'var(--accent)');

  card.innerHTML = `
    <div class="card-header">
      <span class="card-icon">${cat.icon || '🔬'}</span>
      <div class="card-badges">
        <span class="badge badge-difficulty ${p.difficulty}">${p.difficulty}</span>
        ${p.featured ? '<span class="badge badge-featured">★ Featured</span>' : ''}
      </div>
    </div>
    <div class="card-id">${p.id} · ${cat.label || ''}</div>
    <h2>${p.title}</h2>
    <p class="card-desc">${p.description}</p>
    <div class="card-meta">
      <div class="card-meta-item">
        <strong>${p.duration}</strong>
        duration
      </div>
      <div class="card-meta-item">
        <strong>${p.materials.length}</strong>
        materials
      </div>
    </div>
    <div class="card-tags">
      ${p.tags.map(t => `<span class="tag">${t}</span>`).join('')}
    </div>
  `;

  card.addEventListener('click', () => openModal(p, cat));
  return card;
}

// ─── MODAL ────────────────────────────────────────────────────
function openModal(p, cat) {
  const modal = document.getElementById('modal');
  const box   = modal.querySelector('.modal-box');

  box.style.setProperty('--cat-color', cat.color || 'var(--accent)');
  box.querySelector('.modal-cat-label').textContent  = `${cat.icon || ''} ${cat.label || ''}`;
  box.querySelector('.modal-title').textContent      = p.title;
  box.querySelector('.modal-desc').textContent       = p.description;
  box.querySelector('.modal-cat-label').style.color  = cat.color || 'var(--accent)';

  // materials
  const matList = box.querySelector('.materials-list');
  matList.innerHTML = p.materials.map(m => `<li>${m}</li>`).join('');

  // hypothesis
  box.querySelector('.hypothesis-box').textContent = p.hypothesis;

  // metadata grid
  box.querySelector('#modalDifficulty').textContent = p.difficulty;
  box.querySelector('#modalDuration').textContent   = p.duration;
  box.querySelector('#modalId').textContent         = p.id;
  box.querySelector('#modalFeatured').textContent   = p.featured ? '★ Yes' : 'No';

  modal.classList.add('open');
  document.body.style.overflow = 'hidden';
}

function closeModal() {
  document.getElementById('modal').classList.remove('open');
  document.body.style.overflow = '';
}

// ─── EVENTS ───────────────────────────────────────────────────
function bindEvents() {
  // search
  document.getElementById('searchInput').addEventListener('input', e => {
    searchQuery = e.target.value.trim();
    render();
  });

  // sort
  document.getElementById('sortSelect').addEventListener('change', e => {
    sortOrder = e.target.value;
    render();
  });

  // modal close
  document.getElementById('modalClose').addEventListener('click', closeModal);
  document.querySelector('.modal-backdrop').addEventListener('click', closeModal);

  // keyboard
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') closeModal();
  });

  // "All" filter btn
  document.querySelector('[data-cat="all"]').addEventListener('click', () => setCategory('all'));
}

// ─── BOOT ─────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', init);
