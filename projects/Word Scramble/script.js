
var WORDS = {
  Animals: [
    { word: 'TIGER',    hint: 'Striped wild cat' },
    { word: 'DOLPHIN',  hint: 'Smart ocean animal' },
    { word: 'PENGUIN',  hint: 'Tuxedo bird that cannot fly' },
    { word: 'GIRAFFE',  hint: 'Tallest animal on land' },
    { word: 'ELEPHANT', hint: 'Largest land animal' },
    { word: 'CHEETAH',  hint: 'Fastest land animal' },
    { word: 'PARROT',   hint: 'Colorful talking bird' },
    { word: 'OCTOPUS',  hint: 'Eight-armed sea creature' },
    { word: 'PANTHER',  hint: 'Black big cat' },
    { word: 'HAMSTER',  hint: 'Small furry pet with pouched cheeks' },
    { word: 'LEOPARD',  hint: 'Spotted jungle cat' },
    { word: 'FLAMINGO', hint: 'Pink bird that stands on one leg' }
  ],
  Fruits: [
    { word: 'MANGO',      hint: 'King of fruits' },
    { word: 'BANANA',     hint: 'Yellow curved fruit' },
    { word: 'PINEAPPLE',  hint: 'Tropical spiky fruit' },
    { word: 'WATERMELON', hint: 'Green outside, red inside' },
    { word: 'STRAWBERRY', hint: 'Small red heart-shaped fruit' },
    { word: 'BLUEBERRY',  hint: 'Tiny dark blue fruit' },
    { word: 'APRICOT',    hint: 'Small orange stone fruit' },
    { word: 'LYCHEE',     hint: 'Sweet white Asian fruit' },
    { word: 'AVOCADO',    hint: 'Creamy green fruit used in guacamole' },
    { word: 'COCONUT',    hint: 'Hairy brown tropical fruit' },
    { word: 'PAPAYA',     hint: 'Orange tropical fruit with black seeds' },
    { word: 'GUAVA',      hint: 'Pink-fleshed tropical fruit' }
  ],
  Space: [
    { word: 'SATURN',   hint: 'Planet with famous rings' },
    { word: 'COMET',    hint: 'Icy space rock with a tail' },
    { word: 'NEBULA',   hint: 'Colorful cloud of gas in space' },
    { word: 'METEOR',   hint: 'Shooting star' },
    { word: 'GALAXY',   hint: 'Huge system of billions of stars' },
    { word: 'JUPITER',  hint: 'Largest planet in solar system' },
    { word: 'ECLIPSE',  hint: 'Sun or moon blocked by another body' },
    { word: 'COSMOS',   hint: 'The entire universe' },
    { word: 'PULSAR',   hint: 'Rapidly spinning neutron star' },
    { word: 'ORBIT',    hint: 'Curved path around a planet' },
    { word: 'QUASAR',   hint: 'Extremely bright active galaxy core' },
    { word: 'AURORA',   hint: 'Natural light show near the poles' }
  ],
  Sports: [
    { word: 'CRICKET',    hint: 'Bat and ball sport popular in India' },
    { word: 'TENNIS',     hint: 'Played with a racket on a court' },
    { word: 'FOOTBALL',   hint: 'Most popular sport in the world' },
    { word: 'ARCHERY',    hint: 'Shooting arrows at a target' },
    { word: 'SWIMMING',   hint: 'Moving through water' },
    { word: 'BOXING',     hint: 'Combat sport with gloves' },
    { word: 'CYCLING',    hint: 'Racing on two wheels' },
    { word: 'BADMINTON',  hint: 'Hitting a shuttlecock over a net' },
    { word: 'MARATHON',   hint: '42 km long running race' },
    { word: 'GYMNASTICS', hint: 'Sport involving flips and balance' },
    { word: 'WRESTLING',  hint: 'Sport where you pin your opponent' },
    { word: 'VOLLEYBALL', hint: 'Hitting ball over a high net' }
  ],
  Food: [
    { word: 'PIZZA',    hint: 'Round Italian dish with toppings' },
    { word: 'BURGER',   hint: 'Sandwich with a meat patty' },
    { word: 'SUSHI',    hint: 'Japanese rice and fish rolls' },
    { word: 'TACOS',    hint: 'Mexican folded tortilla dish' },
    { word: 'PASTA',    hint: 'Italian noodle dish' },
    { word: 'WAFFLE',   hint: 'Grid-patterned breakfast treat' },
    { word: 'NOODLES',  hint: 'Long thin strips of dough' },
    { word: 'OMELETTE', hint: 'Folded egg dish' },
    { word: 'BROWNIE',  hint: 'Dense chocolate square dessert' },
    { word: 'PANCAKE',  hint: 'Flat round breakfast food' },
    { word: 'SAMOSA',   hint: 'Fried triangular Indian snack' },
    { word: 'BIRYANI',  hint: 'Spiced Indian rice dish' }
  ],
  Science: [
    { word: 'GRAVITY',   hint: 'Force that pulls things down' },
    { word: 'NUCLEUS',   hint: 'Center of an atom or cell' },
    { word: 'OXYGEN',    hint: 'Gas we breathe to survive' },
    { word: 'PROTON',    hint: 'Positive particle in an atom' },
    { word: 'NEUTRON',   hint: 'Neutral particle in an atom' },
    { word: 'VOLTAGE',   hint: 'Measure of electric potential' },
    { word: 'MAGNET',    hint: 'Object that attracts iron' },
    { word: 'OSMOSIS',   hint: 'Water movement through membrane' },
    { word: 'FOSSIL',    hint: 'Preserved remains of ancient life' },
    { word: 'ENZYME',    hint: 'Protein that speeds up reactions' },
    { word: 'PLASMA',    hint: 'Fourth state of matter' },
    { word: 'REFLEX',    hint: 'Automatic body response' }
  ]
};

var CATEGORIES = Object.keys(WORDS);

var CAT_ICONS = {
  Animals: '\uD83D\uDC3C',
  Fruits:  '\uD83C\uDF4D',
  Space:   '\uD83C\uDF0C',
  Sports:  '\u26BD',
  Food:    '\uD83C\uDF55',
  Science: '\uD83E\uDDEA'
};

var DIFF = {
  easy:   { time: 40, total: 8 },
  medium: { time: 30, total: 10 },
  hard:   { time: 20, total: 12 }
};

var PRAISES   = ['Correct!', 'Nailed it!', 'Brilliant!', 'Great job!', 'Perfect!', 'On fire!'];
var SKIPPED   = ['Skipped!', 'Next one!', 'Move on!'];
var WRONG_MSG = ['Try again!', 'Not quite!', 'Wrong!', 'Oops!'];

// ── State ──
var G = {
  category:   'Animals',
  difficulty: 'easy',
  words:      [],
  qIndex:     0,
  score:      0,
  streak:     0,
  bestStreak: 0,
  seconds:    0,
  interval:   null,
  correct:    0,
  current:    null,
  usedIndices:[],
  selectedLetters: [],
  scrambled:  []
};

// ── Helpers ──
function el(id)  { return document.getElementById(id); }

function showScreen(id) {
  var ids = ['sHome','sGame','sResult'];
  for (var i = 0; i < ids.length; i++) el(ids[i]).classList.remove('active');
  el(id).classList.add('active');
}

function pick(arr) { return arr[Math.floor(Math.random() * arr.length)]; }

function shuffle(arr) {
  var a = arr.slice();
  for (var i = a.length - 1; i > 0; i--) {
    var j = Math.floor(Math.random() * (i + 1));
    var t = a[i]; a[i] = a[j]; a[j] = t;
  }
  return a;
}

function scramble(word) {
  var letters = word.split('');
  var result;
  var attempts = 0;
  do {
    result = shuffle(letters).join('');
    attempts++;
  } while (result === word && attempts < 20);
  return result;
}

// ── Storage ──
function hsKey() { return 'wordScramble_' + G.category + '_' + G.difficulty; }
function getHS()  { return parseInt(localStorage.getItem(hsKey()) || '0'); }
function saveHS(score) {
  var prev = getHS();
  if (score > prev) { localStorage.setItem(hsKey(), String(score)); return true; }
  return false;
}

// ── Home setup ──
function buildCatGrid() {
  var grid = el('catGrid');
  grid.innerHTML = '';
  for (var i = 0; i < CATEGORIES.length; i++) {
    (function(cat) {
      var btn = document.createElement('button');
      btn.className = 'cat-btn' + (cat === G.category ? ' active' : '');
      btn.innerHTML = '<span class="cat-icon">' + CAT_ICONS[cat] + '</span>' + cat;
      btn.addEventListener('click', function() {
        var btns = document.querySelectorAll('.cat-btn');
        for (var j = 0; j < btns.length; j++) btns[j].classList.remove('active');
        btn.classList.add('active');
        G.category = cat;
        updateHSDisplay();
      });
      grid.appendChild(btn);
    })(CATEGORIES[i]);
  }
}

function updateHSDisplay() {
  el('hsHome').textContent = getHS();
}

// ── Timer ──
function startTimer() {
  clearInterval(G.interval);
  G.seconds = DIFF[G.difficulty].time;
  el('timerEl').textContent = String(G.seconds);
  el('hudTimer').classList.remove('timer-warn');

  G.interval = setInterval(function() {
    G.seconds--;
    el('timerEl').textContent = String(G.seconds);
    if (G.seconds <= 8) el('hudTimer').classList.add('timer-warn');
    if (G.seconds <= 0) {
      clearInterval(G.interval);
      onTimeout();
    }
  }, 1000);
}

function stopTimer() { clearInterval(G.interval); G.interval = null; }

function onTimeout() {
  G.streak = 0;
  el('streakEl').textContent = '0';
  setFeedback('Time up! \u23F0', 'bad');
  setTimeout(nextWord, 900);
}

// ── Game flow ──
function startGame() {
  var pool = shuffle(WORDS[G.category].slice());
  G.words      = pool.slice(0, DIFF[G.difficulty].total);
  G.qIndex     = 0;
  G.score      = 0;
  G.streak     = 0;
  G.bestStreak = 0;
  G.correct    = 0;

  el('scoreEl').textContent  = '0';
  el('streakEl').textContent = '0';
  el('catTag').textContent   = CAT_ICONS[G.category] + ' ' + G.category;

  showScreen('sGame');
  loadWord();
}

function loadWord() {
  if (G.qIndex >= G.words.length) { onFinish(); return; }

  G.current         = G.words[G.qIndex];
  G.selectedLetters = [];
  G.scrambled       = scramble(G.current.word).split('');

  el('qNumEl').textContent  = String(G.qIndex + 1);
  el('hintText').textContent = '\uD83D\uDCA1 ' + G.current.hint;
  el('progBar').style.width  = (G.qIndex / G.words.length * 100) + '%';
  el('feedbackArea').textContent = '';
  el('feedbackArea').className   = 'feedback-area';

  renderScramble();
  renderAnswer();
  startTimer();
}

function renderScramble() {
  var row = el('scrambleRow');
  row.innerHTML = '';
  for (var i = 0; i < G.scrambled.length; i++) {
    (function(idx, letter) {
      var tile = document.createElement('div');
      tile.className = 's-tile';
      tile.textContent = letter;
      tile.style.animationDelay = (idx * 0.05) + 's';
      tile.setAttribute('data-idx', idx);
      tile.addEventListener('click', function() { pickLetter(idx, letter, tile); });
      row.appendChild(tile);
    })(i, G.scrambled[i]);
  }
}

function renderAnswer() {
  var row = el('answerRow');
  row.innerHTML = '';
  for (var i = 0; i < G.selectedLetters.length; i++) {
    (function(i) {
      var tile = document.createElement('div');
      tile.className = 'a-tile';
      tile.textContent = G.selectedLetters[i].letter;
      tile.style.animationDelay = (i * 0.04) + 's';
      tile.addEventListener('click', function() { returnLetter(i); });
      row.appendChild(tile);
    })(i);
  }
}

function pickLetter(idx, letter, tileEl) {
  if (tileEl.classList.contains('used')) return;
  tileEl.classList.add('used');
  G.selectedLetters.push({ letter: letter, srcIdx: idx });
  renderAnswer();
}

function returnLetter(ansIdx) {
  var item = G.selectedLetters[ansIdx];
  G.selectedLetters.splice(ansIdx, 1);

  // un-use the source tile
  var srcTiles = el('scrambleRow').querySelectorAll('.s-tile');
  for (var i = 0; i < srcTiles.length; i++) {
    if (parseInt(srcTiles[i].getAttribute('data-idx')) === item.srcIdx) {
      srcTiles[i].classList.remove('used');
      break;
    }
  }
  renderAnswer();
}

function clearAnswer() {
  G.selectedLetters = [];
  var srcTiles = el('scrambleRow').querySelectorAll('.s-tile');
  for (var i = 0; i < srcTiles.length; i++) srcTiles[i].classList.remove('used');
  renderAnswer();
}

// ── Check answer ──
function checkAnswer() {
  if (G.selectedLetters.length === 0) return;

  var answer = '';
  for (var i = 0; i < G.selectedLetters.length; i++) answer += G.selectedLetters[i].letter;

  if (answer === G.current.word) {
    stopTimer();
    var bonus = G.seconds * 2;
    var points = 100 + bonus + (G.streak * 20);
    G.score  += points;
    G.streak++;
    G.correct++;
    if (G.streak > G.bestStreak) G.bestStreak = G.streak;

    el('scoreEl').textContent  = String(G.score);
    el('streakEl').textContent = String(G.streak);

    setFeedback(pick(PRAISES) + ' +' + points, 'ok');

    // flash bg
    var body = document.querySelector('.game-body');
    body.classList.add('flash');
    setTimeout(function() { body.classList.remove('flash'); }, 500);

    G.qIndex++;
    setTimeout(loadWord, 900);
  } else {
    setFeedback(pick(WRONG_MSG), 'bad');
    // shake answer row
    var aRow = el('answerRow');
    aRow.style.animation = 'none';
    aRow.offsetHeight;
    aRow.style.animation = 'ansShake .35s ease';
    clearAnswer();
  }
}

function skipWord() {
  stopTimer();
  G.streak = 0;
  el('streakEl').textContent = '0';
  setFeedback(pick(SKIPPED) + ' Answer: ' + G.current.word, 'skip');
  G.qIndex++;
  setTimeout(loadWord, 1100);
}

function nextWord() {
  G.qIndex++;
  loadWord();
}

function setFeedback(msg, cls) {
  var fb = el('feedbackArea');
  fb.textContent = msg;
  fb.className = 'feedback-area ' + cls;
}

// ── Finish ──
function onFinish() {
  stopTimer();
  el('progBar').style.width = '100%';

  var isNew = saveHS(G.score);
  var total = G.words.length;
  var pct   = Math.round((G.correct / total) * 100);

  var emoji, title, sub;
  if (pct === 100) { emoji = '\uD83C\uDFC6'; title = 'Perfect!';    sub = 'You got every single word!'; }
  else if (pct >= 70) { emoji = '\uD83C\uDF89'; title = 'Awesome!'; sub = 'Really impressive performance!'; }
  else if (pct >= 40) { emoji = '\uD83D\uDCAA'; title = 'Not bad!'; sub = 'Keep practicing!'; }
  else { emoji = '\uD83D\uDE05'; title = 'Try again!'; sub = 'You can do much better!'; }

  el('resultEmoji').textContent = emoji;
  el('resultTitle').textContent = title;
  el('resultSub').textContent   = sub;
  el('rScore').textContent      = String(G.score);
  el('rCorrect').textContent    = G.correct + '/' + total;
  el('rStreak').textContent     = String(G.bestStreak);
  el('resultBest').textContent  = isNew ? '\u2B50 New best score: ' + G.score + '!' : '';

  showScreen('sResult');
}

// ── CSS for answer shake (inject once) ──
(function() {
  var style = document.createElement('style');
  style.textContent = '@keyframes ansShake{0%,100%{transform:translateX(0)}25%{transform:translateX(-6px)}75%{transform:translateX(6px)}}';
  document.head.appendChild(style);
})();

// ── Particles ──
(function() {
  var colors = ['#FF6B9D','#8B5CF6','#3B82F6','#FBBF24','#22C55E','#F97316'];
  var pEl = el('particles');
  for (var i = 0; i < 20; i++) {
    var p = document.createElement('div');
    p.className = 'particle';
    var size = Math.random() * 24 + 10;
    p.style.cssText = [
      'width:' + size + 'px',
      'height:' + size + 'px',
      'left:' + Math.random() * 100 + '%',
      'background:' + colors[Math.floor(Math.random() * colors.length)],
      'animation-duration:' + (Math.random() * 14 + 8) + 's',
      'animation-delay:' + Math.random() * 12 + 's'
    ].join(';');
    pEl.appendChild(p);
  }
})();



// Difficulty buttons
var diffBtns = document.querySelectorAll('.diff-btn');
for (var i = 0; i < diffBtns.length; i++) {
  (function(btn) {
    btn.addEventListener('click', function() {
      for (var j = 0; j < diffBtns.length; j++) diffBtns[j].classList.remove('active');
      btn.classList.add('active');
      G.difficulty = btn.getAttribute('data-diff');
      updateHSDisplay();
    });
  })(diffBtns[i]);
}

el('btnPlay').addEventListener('click', startGame);
el('btnBack').addEventListener('click', function() { stopTimer(); showScreen('sHome'); updateHSDisplay(); });
el('btnClear').addEventListener('click', clearAnswer);
el('btnSubmit').addEventListener('click', checkAnswer);
el('btnSkip').addEventListener('click', skipWord);
el('btnAgain').addEventListener('click', startGame);
el('btnHome').addEventListener('click', function() { showScreen('sHome'); updateHSDisplay(); });

// Keyboard support
document.addEventListener('keydown', function(e) {
  if (!el('sGame').classList.contains('active')) return;
  if (e.key === 'Enter')     checkAnswer();
  if (e.key === 'Backspace') {
    if (G.selectedLetters.length > 0) returnLetter(G.selectedLetters.length - 1);
  }
  if (e.key === 'Escape') clearAnswer();
});

// ── Init ──
buildCatGrid();
updateHSDisplay();
