
let data = JSON.parse(localStorage.getItem('flashcard_data') || 'null') || {
  decks: [
    {
      id: 1,
      name: 'JavaScript Basics',
      emoji: '⚡',
      cards: [
        { id: 1, q: 'What is a closure in JavaScript?', a: 'A closure is a function that remembers its outer variables even after the outer function has finished executing.' },
        { id: 2, q: 'What is the difference between let, var, and const?', a: 'var is function-scoped, let and const are block-scoped. const cannot be reassigned, let can.' },
        { id: 3, q: 'What does === mean?', a: 'Strict equality — checks both value AND type. 0 == "0" is true, but 0 === "0" is false.' },
      ]
    },
    {
      id: 2,
      name: 'HTML & CSS',
      emoji: '🎨',
      cards: [
        { id: 1, q: 'What is the Box Model in CSS?', a: 'Every element is a box with: content, padding, border, and margin layers around it.' },
        { id: 2, q: 'What is the difference between display:flex and display:grid?', a: 'Flexbox is 1D (row OR column). Grid is 2D (rows AND columns).' },
      ]
    }
  ],
  stats: { totalStudied: 0, totalKnown: 0, sessions: 0 }
};

// Study session state
let currentDeckId   = null;
let currentIndex    = 0;
let cardResults     = {}; // cardId -> 'known' | 'unknown'
let isFlipped       = false;

const EMOJIS = ['📚','⚡','🧪','🎨','🔢','🌍','💻','🧠','📝','🔬','🎯','🏆'];

// ——— SAVE ———
function save() {
  localStorage.setItem('flashcard_data', JSON.stringify(data));
}

// ——— TABS ———
function switchTab(tab) {
  document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
  document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
  document.getElementById(`tab-${tab}`).classList.add('active');
  document.getElementById(`view-${tab}`).classList.add('active');

  if (tab === 'study')  renderDeckPicker();
  if (tab === 'manage') renderManageView();
  if (tab === 'stats')  renderStatsView();
}

// ——— INIT ———
document.addEventListener('DOMContentLoaded', () => {
  switchTab('study');
});

// ══════════════════════════════════════════
//  STUDY TAB
// ══════════════════════════════════════════

function renderDeckPicker() {
  const container = document.getElementById('deck-picker');
  document.getElementById('study-area').style.display    = 'none';
  document.getElementById('result-area').style.display   = 'none';
  document.getElementById('deck-picker-wrap').style.display = 'block';

  if (data.decks.length === 0) {
    container.innerHTML = `
      <div class="empty-state">
        <span>📭</span>
        <p>No decks yet!<br>Go to <strong>Manage</strong> tab to create your first deck.</p>
      </div>`;
    return;
  }

  container.innerHTML = data.decks.map(deck => {
    const known = deck.cards.filter(c => (deck.results || {})[c.id] === 'known').length;
    const pct   = deck.cards.length ? Math.round((known / deck.cards.length) * 100) : 0;
    return `
      <div class="deck-item" onclick="startStudy(${deck.id})">
        <span class="deck-emoji">${deck.emoji}</span>
        <div class="deck-name">${escHtml(deck.name)}</div>
        <div class="deck-count">${deck.cards.length} card${deck.cards.length !== 1 ? 's' : ''} · ${pct}% known</div>
        <div class="deck-progress-bar">
          <div class="deck-progress-fill" style="width:${pct}%"></div>
        </div>
      </div>`;
  }).join('');
}

function startStudy(deckId) {
  const deck = data.decks.find(d => d.id === deckId);
  if (!deck || deck.cards.length === 0) { showToast('⚠️ This deck has no cards!'); return; }

  currentDeckId = deckId;
  currentIndex  = 0;
  cardResults   = {};
  isFlipped     = false;

  document.getElementById('deck-picker-wrap').style.display = 'none';
  document.getElementById('result-area').style.display      = 'none';
  document.getElementById('study-area').style.display       = 'block';

  renderStudyCard();
}

function renderStudyCard() {
  const deck  = data.decks.find(d => d.id === currentDeckId);
  const card  = deck.cards[currentIndex];
  const total = deck.cards.length;

  // Header
  document.getElementById('study-deck-name').innerHTML = `${deck.emoji} ${escHtml(deck.name)}`;
  document.getElementById('study-progress-text').textContent = `${currentIndex + 1} / ${total}`;

  // Progress bar
  document.getElementById('study-progress-bar').style.width = `${((currentIndex + 1) / total) * 100}%`;

  // Card content
  document.getElementById('card-question').textContent = card.q;
  document.getElementById('card-answer').textContent   = card.a;

  // Reset flip
  isFlipped = false;
  document.getElementById('card-flipper').classList.remove('flipped');

  // Nav buttons
  document.getElementById('btn-prev').disabled = currentIndex === 0;
  document.getElementById('btn-next').disabled = currentIndex === total - 1;

  // Dots
  const dotsEl = document.getElementById('nav-dots');
  dotsEl.innerHTML = deck.cards.map((c, i) => {
    let cls = '';
    if (i === currentIndex) cls = 'current';
    else if (cardResults[c.id] === 'known')   cls = 'known';
    else if (cardResults[c.id] === 'unknown') cls = 'unknown';
    return `<div class="nav-dot ${cls}"></div>`;
  }).join('');

  // Show/hide action buttons based on flip state
  updateActionButtons();
}

function updateActionButtons() {
  const actionsEl = document.getElementById('study-actions');
  if (isFlipped) {
    actionsEl.style.display = 'flex';
  } else {
    actionsEl.style.display = 'none';
  }
}

function flipCard() {
  isFlipped = !isFlipped;
  document.getElementById('card-flipper').classList.toggle('flipped', isFlipped);
  updateActionButtons();
}

function markCard(result) {
  const deck = data.decks.find(d => d.id === currentDeckId);
  const card = deck.cards[currentIndex];
  cardResults[card.id] = result;

  // Auto advance
  if (currentIndex < deck.cards.length - 1) {
    currentIndex++;
    renderStudyCard();
  } else {
    // All done — show results
    showResults();
  }
}

function navCard(dir) {
  const deck = data.decks.find(d => d.id === currentDeckId);
  currentIndex = Math.max(0, Math.min(deck.cards.length - 1, currentIndex + dir));
  renderStudyCard();
}

function showResults() {
  const deck    = data.decks.find(d => d.id === currentDeckId);
  const total   = deck.cards.length;
  const known   = Object.values(cardResults).filter(v => v === 'known').length;
  const unknown = total - known;
  const pct     = Math.round((known / total) * 100);

  // Save results to deck
  deck.results = deck.results || {};
  Object.assign(deck.results, cardResults);

  // Update global stats
  data.stats.totalStudied += total;
  data.stats.totalKnown   += known;
  data.stats.sessions     += 1;
  save();

  document.getElementById('study-area').style.display  = 'none';
  document.getElementById('result-area').style.display = 'block';

  let emoji = '🎉', title = 'Great job!', sub = 'Keep it up!';
  if (pct === 100) { emoji = '🏆'; title = 'Perfect Score!'; sub = 'You know all the cards!'; }
  else if (pct >= 70) { emoji = '😊'; title = 'Well Done!'; sub = 'Almost there, review the unknowns!'; }
  else if (pct >= 40) { emoji = '📖'; title = 'Keep Studying!'; sub = 'Review and try again!'; }
  else { emoji = '💪'; title = 'Keep Going!'; sub = 'Practice makes perfect!'; }

  document.getElementById('result-emoji').textContent    = emoji;
  document.getElementById('result-title').textContent    = title;
  document.getElementById('result-subtitle').textContent = sub;
  document.getElementById('result-known').textContent    = known;
  document.getElementById('result-unknown').textContent  = unknown;
  document.getElementById('result-pct').textContent      = pct + '%';
}

function restartDeck() {
  startStudy(currentDeckId);
}

function backToDecks() {
  renderDeckPicker();
  document.getElementById('study-area').style.display  = 'none';
  document.getElementById('result-area').style.display = 'none';
}

// ══════════════════════════════════════════
//  MANAGE TAB
// ══════════════════════════════════════════

let manageDeckId = null;

function renderManageView() {
  renderDeckList();
  renderCardList();
}

function renderDeckList() {
  const container = document.getElementById('manage-deck-list');
  if (data.decks.length === 0) {
    container.innerHTML = `<div class="empty-state" style="padding:20px"><span>📭</span><p>No decks yet!</p></div>`;
    return;
  }
  container.innerHTML = data.decks.map(deck => `
    <div class="deck-item ${manageDeckId === deck.id ? 'selected' : ''}" onclick="selectManageDeck(${deck.id})" style="margin-bottom:10px">
      <button class="deck-delete" onclick="event.stopPropagation();deleteDeck(${deck.id})">🗑️</button>
      <span class="deck-emoji">${deck.emoji}</span>
      <div class="deck-name">${escHtml(deck.name)}</div>
      <div class="deck-count">${deck.cards.length} card${deck.cards.length !== 1 ? 's' : ''}</div>
    </div>`).join('');
}

function selectManageDeck(id) {
  manageDeckId = id;
  renderDeckList();
  renderCardList();
}

function renderCardList() {
  const container  = document.getElementById('card-list');
  const headerEl   = document.getElementById('card-list-header');
  const addFormEl  = document.getElementById('add-card-form');

  if (!manageDeckId) {
    headerEl.textContent = 'Select a deck to manage cards';
    container.innerHTML  = `<div class="empty-state" style="padding:20px"><span>👈</span><p>Select a deck first</p></div>`;
    addFormEl.style.display = 'none';
    return;
  }

  const deck = data.decks.find(d => d.id === manageDeckId);
  headerEl.textContent = `${deck.emoji} ${deck.name} — ${deck.cards.length} cards`;
  addFormEl.style.display = 'block';

  if (deck.cards.length === 0) {
    container.innerHTML = `<div class="empty-state" style="padding:20px"><span>🃏</span><p>No cards yet!<br>Add your first card below.</p></div>`;
    return;
  }

  container.innerHTML = deck.cards.map((c, i) => `
    <div class="card-list-item">
      <div class="card-list-num">${i + 1}</div>
      <div class="card-list-content">
        <div class="card-list-q">Q: ${escHtml(c.q)}</div>
        <div class="card-list-a">A: ${escHtml(c.a)}</div>
      </div>
      <button class="btn-icon" onclick="deleteCard(${manageDeckId}, ${c.id})" title="Delete">🗑️</button>
    </div>`).join('');
}

// Add Deck
function addDeck() {
  const nameEl  = document.getElementById('new-deck-name');
  const emojiEl = document.getElementById('new-deck-emoji');
  const name    = nameEl.value.trim();
  if (!name) { showToast('⚠️ Enter a deck name!'); return; }

  const newDeck = {
    id:      Date.now(),
    name,
    emoji:   emojiEl.value,
    cards:   [],
    results: {}
  };
  data.decks.push(newDeck);
  save();
  nameEl.value = '';
  manageDeckId = newDeck.id;
  renderManageView();
  showToast(`✅ Deck "${name}" created!`);
}

// Delete Deck
function deleteDeck(id) {
  if (!confirm('Delete this deck and all its cards?')) return;
  data.decks = data.decks.filter(d => d.id !== id);
  if (manageDeckId === id) manageDeckId = null;
  save();
  renderManageView();
  showToast('🗑️ Deck deleted!');
}

// Add Card
function addCard() {
  if (!manageDeckId) { showToast('⚠️ Select a deck first!'); return; }
  const qEl = document.getElementById('new-card-q');
  const aEl = document.getElementById('new-card-a');
  const q   = qEl.value.trim();
  const a   = aEl.value.trim();
  if (!q || !a) { showToast('⚠️ Fill in both question and answer!'); return; }

  const deck = data.decks.find(d => d.id === manageDeckId);
  deck.cards.push({ id: Date.now(), q, a });
  save();
  qEl.value = '';
  aEl.value = '';
  renderCardList();
  showToast('✅ Card added!');
}

// Delete Card
function deleteCard(deckId, cardId) {
  const deck = data.decks.find(d => d.id === deckId);
  deck.cards = deck.cards.filter(c => c.id !== cardId);
  save();
  renderCardList();
  showToast('🗑️ Card deleted!');
}

// ══════════════════════════════════════════
//  STATS TAB
// ══════════════════════════════════════════

function renderStatsView() {
  document.getElementById('stat-sessions').textContent = data.stats.sessions;
  document.getElementById('stat-studied').textContent  = data.stats.totalStudied;
  const acc = data.stats.totalStudied
    ? Math.round((data.stats.totalKnown / data.stats.totalStudied) * 100) + '%'
    : '—';
  document.getElementById('stat-accuracy').textContent = acc;

  // Per-deck breakdown
  const container = document.getElementById('deck-stats-list');
  if (data.decks.length === 0) {
    container.innerHTML = `<div class="empty-state"><span>📊</span><p>No data yet.<br>Study some cards first!</p></div>`;
    return;
  }
  container.innerHTML = data.decks.map(deck => {
    const results = deck.results || {};
    const known   = deck.cards.filter(c => results[c.id] === 'known').length;
    const total   = deck.cards.length;
    const pct     = total ? Math.round((known / total) * 100) : 0;
    return `
      <div class="card-list-item">
        <div class="card-list-num">${deck.emoji}</div>
        <div class="card-list-content">
          <div class="card-list-q">${escHtml(deck.name)}</div>
          <div class="card-list-a">${known}/${total} known · ${pct}%</div>
          <div class="deck-progress-bar" style="margin-top:6px">
            <div class="deck-progress-fill" style="width:${pct}%"></div>
          </div>
        </div>
        <strong style="color:${pct >= 70 ? 'var(--success)' : 'var(--warning)'}; font-size:0.9rem;">${pct}%</strong>
      </div>`;
  }).join('');
}

function resetAllStats() {
  if (!confirm('Reset all study progress? Card decks will be kept.')) return;
  data.stats = { totalStudied: 0, totalKnown: 0, sessions: 0 };
  data.decks.forEach(d => d.results = {});
  save();
  renderStatsView();
  showToast('🔄 Stats reset!');
}

// ——— UTILS ———
function escHtml(s) {
  return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
}

function showToast(msg) {
  const toast = document.getElementById('toast');
  toast.textContent = msg;
  toast.classList.add('show');
  setTimeout(() => toast.classList.remove('show'), 2800);
}
