

var WORD_BANK = {
  easy: [
    'the','and','for','are','but','not','you','all','can','her',
    'was','one','our','out','day','get','has','him','his','how',
    'man','new','now','old','see','two','way','who','boy','did',
    'its','let','put','say','she','too','use','dad','mom','run',
    'cat','dog','red','big','hot','sun','box','cup','top','job',
    'sit','eat','fly','win','map','bus','car','hat','pen','key',
    'bag','bed','sky','ice','arm','leg','eye','ear','lip','toe',
    'sea','air','oil','age','act','add','ago','aim','art','ask'
  ],
  medium: [
    'about','above','after','again','along','among','asked','began',
    'below','bring','built','carry','cause','close','comes','could',
    'cover','cross','dark','doing','every','found','front','given',
    'going','group','hands','heart','house','human','known','large',
    'later','learn','level','light','lived','local','looks','might',
    'money','month','moved','music','never','night','north','often',
    'order','other','paper','parts','place','plant','point','power',
    'press','quite','reach','ready','river','scene','shown','since',
    'small','south','space','stand','start','state','still','stood',
    'store','story','study','table','taken','their','there','these',
    'think','three','times','today','total','touch','trade','tried',
    'truck','truly','under','until','usual','voice','watch','water',
    'world','would','write','years','young','black','white','green'
  ],
  hard: [
    'absolutely','accomplish','acknowledge','acquaintance','admirable',
    'advantages','alphabetical','ambiguous','ammunition','amplified',
    'anticipate','approximately','architecture','argumentative','arithmetic',
    'assassination','atmospheric','authenticate','bankruptcy','bewildering',
    'bibliography','biological','bureaucratic','catastrophic','circumstance',
    'collaboration','comfortable','commemorate','communication','complicated',
    'comprehensive','consciousness','consecutive','controversial','convenience',
    'corporation','correspondence','crystallize','demographic','deteriorate',
    'devastation','differential','disappointment','discrimination','documentation',
    'electromagnetic','elimination','embarrassment','encyclopedia','enthusiastic',
    'environmental','equivalent','exaggeration','examination','exceptional',
    'extraordinary','fluctuation','geographical','governmental','hallucination',
    'humanitarian','hypothetical','identification','imagination','implementation',
    'inappropriate','incompatible','independence','infrastructure','investigation',
    'justification','knowledgeable','liberalization','manifestation','mathematical',
    'miscellaneous','multiplication','nevertheless','notification','occasionally',
    'organization','overwhelming','parliamentary','participation','philosophical',
    'precipitation','prioritization','qualification','questionnaire','recommendation',
    'refrigerator','reimbursement','revolutionary','sophisticated','specification',
    'straightforward','subconscious','subscription','telecommunications','therapeutic'
  ]
};

var CIRCUMFLEX = 113.1; // 2 * PI * 18 (radius)

// ── Config & State ──
var CFG = { time: 60, difficulty: 'medium' };

var G = {
  words:       [],
  charMap:     [],
  currentChar: 0,
  totalChars:  0,
  correctChars:0,
  errors:      0,
  started:     false,
  finished:    false,
  seconds:     0,
  elapsed:     0,
  interval:    null,
  wordIndex:   0
};

// ── DOM ──
function el(id) { return document.getElementById(id); }

function showScreen(id) {
  ['sHome','sTest','sResult'].forEach(function(s) { el(s).classList.remove('active'); });
  el(id).classList.add('active');
}

// ── Storage ──
function saveRecord(wpm, acc) {
  var prevWPM = parseInt(localStorage.getItem('trWPM') || '0');
  var games   = parseInt(localStorage.getItem('trGames') || '0');
  var isNew   = false;
  if (wpm > prevWPM) { localStorage.setItem('trWPM', String(wpm)); isNew = true; }
  var prevAcc = parseInt(localStorage.getItem('trAcc') || '0');
  if (acc > prevAcc) localStorage.setItem('trAcc', String(acc));
  localStorage.setItem('trGames', String(games + 1));
  return isNew;
}

function loadRecords() {
  el('recWPM').textContent   = (localStorage.getItem('trWPM')   || '--') + (localStorage.getItem('trWPM')   ? ' wpm' : '');
  el('recAcc').textContent   = (localStorage.getItem('trAcc')   || '--') + (localStorage.getItem('trAcc')   ? '%'    : '');
  el('recGames').textContent =  localStorage.getItem('trGames') || '0';
}

// ── Build word list ──
function buildWords() {
  var bank   = WORD_BANK[CFG.difficulty].slice();
  var total  = CFG.time === 30 ? 40 : CFG.time === 60 ? 80 : 150;
  var result = [];
  while (result.length < total) {
    var shuffled = shuffle(bank);
    result = result.concat(shuffled);
  }
  return result.slice(0, total);
}

// ── Render words display ──
function renderWords() {
  var display = el('wordsDisplay');
  display.innerHTML = '';
  G.charMap = [];
  G.currentChar = 0;
  G.totalChars  = 0;

  for (var w = 0; w < G.words.length; w++) {
    var word    = G.words[w];
    var wordSpan = document.createElement('span');
    wordSpan.className = 'word-span';
    wordSpan.setAttribute('data-word', w);

    for (var c = 0; c < word.length; c++) {
      var charSpan = document.createElement('span');
      charSpan.className = 'char';
      charSpan.textContent = word[c];
      charSpan.setAttribute('data-pos', G.totalChars);
      wordSpan.appendChild(charSpan);
      G.charMap.push({ el: charSpan, char: word[c], wordIdx: w });
      G.totalChars++;
    }

    // space after word (except last)
    if (w < G.words.length - 1) {
      var spaceSpan = document.createElement('span');
      spaceSpan.className = 'char char-space';
      spaceSpan.textContent = ' ';
      spaceSpan.setAttribute('data-pos', G.totalChars);
      wordSpan.appendChild(spaceSpan);
      G.charMap.push({ el: spaceSpan, char: ' ', wordIdx: w });
      G.totalChars++;
    }

    display.appendChild(wordSpan);
  }

  // cursor at position 0
  placeCursor(0);
  el('wordTotalEl').textContent = String(G.words.length);
  el('wordCountEl').textContent = '1';
}

// ── Cursor ──
var cursorEl = null;

function placeCursor(pos) {
  if (cursorEl && cursorEl.parentNode) cursorEl.parentNode.removeChild(cursorEl);
  cursorEl = document.createElement('span');
  cursorEl.className = 'cursor-bar';

  if (pos < G.charMap.length) {
    var target = G.charMap[pos].el;
    target.parentNode.insertBefore(cursorEl, target);
  } else if (G.charMap.length > 0) {
    var last = G.charMap[G.charMap.length - 1].el;
    last.parentNode.appendChild(cursorEl);
  }

  // scroll to keep cursor visible
  if (cursorEl) {
    var top = cursorEl.offsetTop;
    el('wordsDisplay').scrollTop = Math.max(0, top - 60);
  }
}

// ── Timer ──
function startTimer() {
  G.elapsed  = 0;
  G.seconds  = CFG.time;
  el('timerNum').textContent = String(G.seconds);
  el('timerNum').className   = 'timer-num';
  updateRing(G.seconds);

  G.interval = setInterval(function() {
    G.elapsed++;
    G.seconds--;
    el('timerNum').textContent = String(G.seconds);
    updateRing(G.seconds);

    if (G.seconds <= 10) {
      el('ringFill').classList.add('ring-warn');
      el('timerNum').classList.add('warn');
    }

    updateLiveWPM();

    if (G.seconds <= 0) {
      clearInterval(G.interval);
      endTest();
    }
  }, 1000);
}

function updateRing(remaining) {
  var pct    = remaining / CFG.time;
  var offset = CIRCUMFLEX * (1 - pct);
  el('ringFill').style.strokeDashoffset = String(offset);
}

function stopTimer() { clearInterval(G.interval); G.interval = null; }

// ── Live WPM ──
function updateLiveWPM() {
  var mins = G.elapsed / 60;
  var wpm  = mins > 0 ? Math.round((G.correctChars / 5) / mins) : 0;
  var acc  = G.currentChar > 0 ? Math.round((G.correctChars / G.currentChar) * 100) : 100;

  el('liveWPM').textContent    = String(wpm);
  el('liveAcc').textContent    = acc + '%';
  el('liveErrors').textContent = String(G.errors);
}

// ── Input handling ──
function handleInput(e) {
  var input = el('typeInput');
  var val   = input.value;

  if (!G.started && val.length > 0) {
    G.started = true;
    startTimer();
  }

  if (G.finished) return;

  // Process each character typed
  var typedLen = val.length;

  // Handle backspace (not allowed — challenge mode OR allow)
  // We allow backspace within current word only
  if (typedLen < G._prevLen) {
    // backspace pressed
    if (G.currentChar > 0) {
      // Only allow backspace if not past a space
      var prevEntry = G.charMap[G.currentChar - 1];
      if (prevEntry && prevEntry.char !== ' ') {
        G.currentChar--;
        var charEntry = G.charMap[G.currentChar];
        charEntry.el.className = 'char';
        if (charEntry.char !== ' ') charEntry.el.className = 'char';
        placeCursor(G.currentChar);
        // recount correct chars
        recountCorrect();
      }
    }
    G._prevLen = typedLen;
    input.value = val.slice(0, typedLen);
    return;
  }

  // New character typed
  var newChar = val[val.length - 1];
  if (newChar === undefined) { G._prevLen = 0; return; }

  if (G.currentChar >= G.charMap.length) { input.value = ''; G._prevLen = 0; return; }

  var expected = G.charMap[G.currentChar];

  if (newChar === expected.char) {
    // correct
    expected.el.className = 'char correct';
    G.correctChars++;
    G.currentChar++;

    // If typed space, clear input and advance
    if (newChar === ' ') {
      input.value = '';
      G._prevLen  = 0;
      updateWordCounter();
      placeCursor(G.currentChar);
      return;
    }
  } else {
    // wrong
    expected.el.className = 'char wrong';
    G.errors++;
    G.currentChar++;

    // shake input
    input.classList.remove('shake');
    void input.offsetWidth;
    input.classList.add('shake');
    setTimeout(function() { input.classList.remove('shake'); }, 320);
  }

  placeCursor(G.currentChar);
  updateWordCounter();

  // Auto-advance at space
  // If all words done
  if (G.currentChar >= G.charMap.length) {
    input.value = '';
    endTest();
    return;
  }

  // Keep input to just the current word letters (no accumulation)
  // Reset input when space is next expected
  if (G.charMap[G.currentChar] && G.charMap[G.currentChar].char === ' ') {
    // wait for space press
  }

  G._prevLen = input.value.length;
  updateLiveWPM();
}

function recountCorrect() {
  var count = 0;
  for (var i = 0; i < G.currentChar; i++) {
    if (G.charMap[i] && G.charMap[i].el.classList.contains('correct')) count++;
  }
  G.correctChars = count;
  G.errors = 0;
  for (var j = 0; j < G.currentChar; j++) {
    if (G.charMap[j] && G.charMap[j].el.classList.contains('wrong')) G.errors++;
  }
}

function updateWordCounter() {
  if (G.currentChar < G.charMap.length) {
    el('wordCountEl').textContent = String(G.charMap[G.currentChar].wordIdx + 1);
  }
}

// ── End test ──
function endTest() {
  if (G.finished) return;
  G.finished = true;
  stopTimer();

  var input = el('typeInput');
  input.blur();
  input.disabled = true;

  var timeUsed = CFG.time - G.seconds;
  if (timeUsed <= 0) timeUsed = CFG.time;
  var mins = timeUsed / 60;
  var wpm  = Math.round((G.correctChars / 5) / mins);
  var acc  = G.currentChar > 0 ? Math.round((G.correctChars / G.currentChar) * 100) : 100;
  if (acc > 100) acc = 100;

  // Grade
  var grade, title;
  if (wpm >= 100 && acc >= 95) { grade = 'S';  title = 'Legendary!'; }
  else if (wpm >= 80 && acc >= 90) { grade = 'A+'; title = 'Lightning Fast!'; }
  else if (wpm >= 60 && acc >= 85) { grade = 'A';  title = 'Excellent Speed!'; }
  else if (wpm >= 40 && acc >= 80) { grade = 'B';  title = 'Good Job!'; }
  else if (wpm >= 20)              { grade = 'C';  title = 'Keep Practicing!'; }
  else                             { grade = 'D';  title = 'Just Getting Started'; }

  var isNew = saveRecord(wpm, acc);

  el('resultGrade').textContent = grade;
  el('resultTitle').textContent = title;
  el('bigWPM').textContent      = String(wpm);
  el('stAcc').textContent       = acc + '%';
  el('stCorrect').textContent   = String(G.correctChars);
  el('stErrors').textContent    = String(G.errors);
  el('stTime').textContent      = timeUsed + 's';
  el('newRecord').textContent   = isNew ? '\u2605 New personal best: ' + wpm + ' WPM!' : '';

  setTimeout(function() { showScreen('sResult'); }, 400);
}

// ── Start test ──
function startTest() {
  G = {
    words:        buildWords(),
    charMap:      [],
    currentChar:  0,
    totalChars:   0,
    correctChars: 0,
    errors:       0,
    started:      false,
    finished:     false,
    seconds:      CFG.time,
    elapsed:      0,
    interval:     null,
    wordIndex:    0,
    _prevLen:     0
  };

  el('liveWPM').textContent    = '0';
  el('liveAcc').textContent    = '100%';
  el('liveErrors').textContent = '0';
  el('ringFill').classList.remove('ring-warn');
  el('timerNum').classList.remove('warn');
  el('ringFill').style.strokeDashoffset = '0';

  showScreen('sTest');
  renderWords();

  var input = el('typeInput');
  input.value    = '';
  input.disabled = false;
  G._prevLen     = 0;
  setTimeout(function() { input.focus(); }, 100);
}

// ── Helpers ──
function shuffle(arr) {
  var a = arr.slice();
  for (var i = a.length - 1; i > 0; i--) {
    var j = Math.floor(Math.random() * (i + 1));
    var t = a[i]; a[i] = a[j]; a[j] = t;
  }
  return a;
}

// ── Config button groups ──
function setupBtnGroup(containerId, callback) {
  var btns = el(containerId).querySelectorAll('.cfg-btn');
  for (var i = 0; i < btns.length; i++) {
    (function(btn) {
      btn.addEventListener('click', function() {
        for (var j = 0; j < btns.length; j++) btns[j].classList.remove('active');
        btn.classList.add('active');
        callback(btn.getAttribute('data-val'));
      });
    })(btns[i]);
  }
}

// ── Events ──
setupBtnGroup('timeOptions', function(val) {
  CFG.time = parseInt(val);
});

setupBtnGroup('diffOptions', function(val) {
  CFG.difficulty = val;
});

el('btnStart').addEventListener('click', startTest);
el('btnRetry').addEventListener('click', startTest);

el('btnQuit').addEventListener('click', function() {
  stopTimer();
  showScreen('sHome');
  loadRecords();
});

el('btnResultHome').addEventListener('click', function() {
  showScreen('sHome');
  loadRecords();
});

el('typeInput').addEventListener('input', handleInput);

// Keyboard shortcuts
document.addEventListener('keydown', function(e) {
  if (el('sTest').classList.contains('active')) {
    if (e.key === 'Tab') {
      e.preventDefault();
      stopTimer();
      startTest();
    }
    if (e.key === 'Escape') {
      stopTimer();
      showScreen('sHome');
      loadRecords();
    }
  }
});

// ── Init ──
loadRecords();
