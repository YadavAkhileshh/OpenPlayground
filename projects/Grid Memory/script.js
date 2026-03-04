




var SYMBOLS = [
  '\uD83C\uDF0A', '\uD83C\uDF32', '\uD83C\uDF3B', '\uD83C\uDF44',
  '\uD83C\uDF4A', '\uD83C\uDF5A', '\uD83C\uDF63', '\uD83C\uDF7F',
  '\uD83C\uDF82', '\uD83C\uDFB8', '\uD83C\uDFD4', '\uD83D\uDC0A',
  '\uD83D\uDC11', '\uD83D\uDC19', '\uD83D\uDC20', '\uD83D\uDC2C',
  '\uD83D\uDC35', '\uD83D\uDC40', '\uD83D\uDC8E', '\uD83D\uDCA7',
  '\uD83D\uDCAB', '\uD83D\uDCD6', '\uD83D\uDD25', '\uD83D\uDE86',
  '\uD83D\uDEF8', '\uD83E\uDD0D', '\uD83E\uDDA6', '\uD83E\uDDC4',
  '\uD83E\uDDE7', '\u2614',       '\u26A1',       '\u2728'
];


var G = {
  size:       4,
  tiles:      [],
  flipped:    [],
  matched:    0,
  moves:      0,
  seconds:    0,
  interval:   null,
  lock:       false,
  totalPairs: 0
};

// ── Helpers ──
function el(id) { return document.getElementById(id); }

function showScreen(id) {
  var list = ['sHome', 'sGame', 'sWin'];
  for (var i = 0; i < list.length; i++) {
    el(list[i]).classList.remove('active');
  }
  el(id).classList.add('active');
}

function shuffle(arr) {
  var a = arr.slice();
  for (var i = a.length - 1; i > 0; i--) {
    var j = Math.floor(Math.random() * (i + 1));
    var t = a[i]; a[i] = a[j]; a[j] = t;
  }
  return a;
}

function formatTime(sec) {
  var m = Math.floor(sec / 60);
  var s = sec % 60;
  return m + ':' + (s < 10 ? '0' : '') + s;
}

// ── LocalStorage ──
function storageKey() { return 'gridMemory_' + G.size; }

function getBest() { return localStorage.getItem(storageKey()); }

function saveBest(sec, moves) {
  var prev = getBest();
  if (!prev) { localStorage.setItem(storageKey(), sec + '|' + moves); return true; }
  var prevSec = parseInt(prev.split('|')[0]);
  if (sec < prevSec) { localStorage.setItem(storageKey(), sec + '|' + moves); return true; }
  return false;
}

function formatBest(raw) {
  if (!raw) return '--';
  var p = raw.split('|');
  return formatTime(parseInt(p[0])) + '  /  ' + p[1] + ' moves';
}

function updateHomeBest() {
  el('bestDisplay').textContent = formatBest(getBest());
}

// ── Timer ──
function startTimer() {
  clearInterval(G.interval);
  G.seconds = 0;
  el('timerEl').textContent = '0:00';
  G.interval = setInterval(function () {
    G.seconds++;
    el('timerEl').textContent = formatTime(G.seconds);
  }, 1000);
}

function stopTimer() { clearInterval(G.interval); G.interval = null; }

// ── Progress ──
function updateProgress() {
  var pct = (G.matched / G.totalPairs) * 100;
  el('progFill').style.width = pct + '%';
}

// ── Build board ──
function buildBoard() {
  var total      = G.size * G.size;
  G.totalPairs   = total / 2;
  G.matched      = 0;
  G.moves        = 0;
  G.flipped      = [];
  G.lock         = false;
  G.tiles        = [];

  el('movesEl').textContent = '0';
  el('progFill').style.width = '0%';

  var pool     = shuffle(SYMBOLS).slice(0, G.totalPairs);
  var combined = shuffle(pool.concat(pool));

  var board = el('board');
  board.innerHTML = '';
  board.className = 'board g' + G.size;

  for (var i = 0; i < combined.length; i++) {
    var tileObj = makeTile(i, combined[i]);
    board.appendChild(tileObj.el);
    G.tiles.push(tileObj);
  }
}

function makeTile(index, symbol) {
  var wrap  = document.createElement('div');
  wrap.className = 'tile';

  var inner = document.createElement('div');
  inner.className = 'tile-inner';

  var front = document.createElement('div');
  front.className = 'tile-front';

  var back  = document.createElement('div');
  back.className = 'tile-back';
  back.textContent = symbol;

  inner.appendChild(front);
  inner.appendChild(back);
  wrap.appendChild(inner);

  var obj = { el: wrap, symbol: symbol, index: index, isFlipped: false, isMatched: false };

  wrap.addEventListener('click', function () { onTileClick(obj); });

  return obj;
}

// ── Tile click ──
function onTileClick(tile) {
  if (G.lock) return;
  if (tile.isFlipped) return;
  if (tile.isMatched) return;
  if (G.flipped.length >= 2) return;

  // flip it
  tile.isFlipped = true;
  tile.el.classList.add('flipped');
  G.flipped.push(tile);

  if (G.flipped.length === 2) {
    G.moves++;
    el('movesEl').textContent = String(G.moves);
    G.lock = true;
    setTimeout(checkMatch, 700);
  }
}

function checkMatch() {
  var a = G.flipped[0];
  var b = G.flipped[1];

  if (a.symbol === b.symbol) {
    // Match!
    a.isMatched = true;
    b.isMatched = true;
    a.el.classList.add('matched');
    b.el.classList.add('matched');
    G.matched++;
    updateProgress();

    G.flipped = [];
    G.lock    = false;

    if (G.matched === G.totalPairs) {
      setTimeout(onWin, 400);
    }
  } else {
    // No match
    a.el.classList.add('wrong');
    b.el.classList.add('wrong');

    setTimeout(function () {
      a.el.classList.remove('wrong', 'flipped');
      b.el.classList.remove('wrong', 'flipped');
      a.isFlipped = false;
      b.isFlipped = false;
      G.flipped   = [];
      G.lock      = false;
    }, 600);
  }
}

// ── Win ──
function onWin() {
  stopTimer();
  var isNew = saveBest(G.seconds, G.moves);

  el('wMoves').textContent = String(G.moves);
  el('wTime').textContent  = formatTime(G.seconds);
  el('wPairs').textContent = String(G.totalPairs);
  el('winBestMsg').textContent = isNew ? '\u2605 New best score!' : '';

  showScreen('sWin');
}

// ── Start game ──
function startGame() {
  buildBoard();
  showScreen('sGame');
  startTimer();
}

// ── Event listeners ──

// Size buttons
var sizeBtns = document.querySelectorAll('.size-btn');
for (var i = 0; i < sizeBtns.length; i++) {
  (function (btn) {
    btn.addEventListener('click', function () {
      for (var j = 0; j < sizeBtns.length; j++) sizeBtns[j].classList.remove('active');
      btn.classList.add('active');
      G.size = parseInt(btn.getAttribute('data-size'));
      updateHomeBest();
    });
  })(sizeBtns[i]);
}

el('btnStart').addEventListener('click', function () { startGame(); });

el('btnBack').addEventListener('click', function () {
  stopTimer();
  showScreen('sHome');
  updateHomeBest();
});

el('btnAgain').addEventListener('click', function () {
  startGame();
});

el('btnWinHome').addEventListener('click', function () {
  showScreen('sHome');
  updateHomeBest();
});

// ── Init ──
updateHomeBest();
