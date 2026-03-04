var P1_KEYS = { 'a': 0, 's': 1, 'd': 2, 'f': 3 };
var P2_KEYS = { 'ArrowLeft': 0, 'ArrowDown': 1, 'ArrowUp': 2, 'ArrowRight': 3 };

var P1_KEY_IDS = ['keyA','keyS','keyD','keyF'];
var P2_KEY_IDS = ['keyLeft','keyDown','keyUp','keyRight'];

var DIFF_CFG = {
  easy:   { ops:['+','-'],       maxA:20,  maxB:10  },
  medium: { ops:['+','-','x'],   maxA:50,  maxB:20  },
  hard:   { ops:['+','-','x','\u00F7'], maxA:100, maxB:12  }
};

var CONFETTI_COLORS = ['#FF6B6B','#4ECDC4','#FFD93D','#6BCB77','#A78BFA','#F97316'];


var G = {
  p1Name:    'Player 1',
  p2Name:    'Player 2',
  totalRounds: 10,
  difficulty:  'easy',
  round:       0,
  p1Score:     0,
  p2Score:     0,
  p1Correct:   0,
  p2Correct:   0,
  p1Attempts:  0,
  p2Attempts:  0,
  currentAnswer: 0,
  options:     [],
  answered:    false,
  timerVal:    0,
  timerInterval: null,
  fastestRound:  null,
  fastestMs:     Infinity
};

// ── DOM ──
function el(id) { return document.getElementById(id); }

function showScreen(id) {
  ['sHome','sGame','sWinner'].forEach(function(s) { el(s).classList.remove('active'); });
  el(id).classList.add('active');
}

// ── Math question generator ──
function generateQuestion(diff) {
  var cfg = DIFF_CFG[diff];
  var op  = cfg.ops[Math.floor(Math.random() * cfg.ops.length)];
  var a, b, answer, display;

  if (op === '+') {
    a = rnd(1, cfg.maxA); b = rnd(1, cfg.maxB);
    answer  = a + b;
    display = a + ' + ' + b + ' = ?';
  } else if (op === '-') {
    a = rnd(cfg.maxB, cfg.maxA); b = rnd(1, cfg.maxB);
    answer  = a - b;
    display = a + ' - ' + b + ' = ?';
  } else if (op === 'x') {
    a = rnd(2, 12); b = rnd(2, 12);
    answer  = a * b;
    display = a + ' \u00D7 ' + b + ' = ?';
  } else {
    b = rnd(2, cfg.maxB);
    a = b * rnd(2, 12);
    answer  = a / b;
    display = a + ' \u00F7 ' + b + ' = ?';
  }

  // Generate 4 options including correct answer
  var opts = [answer];
  var attempts = 0;
  while (opts.length < 4 && attempts < 50) {
    attempts++;
    var off    = rnd(1, 10) * (Math.random() > .5 ? 1 : -1);
    var wrong  = answer + off;
    if (wrong !== answer && wrong > 0 && opts.indexOf(wrong) === -1) {
      opts.push(wrong);
    }
  }
  opts = shuffle(opts);

  return { display: display, answer: answer, options: opts };
}

// ── Helpers ──
function rnd(min, max) { return Math.floor(Math.random() * (max - min + 1)) + min; }

function shuffle(arr) {
  var a = arr.slice();
  for (var i = a.length - 1; i > 0; i--) {
    var j = Math.floor(Math.random() * (i + 1));
    var t = a[i]; a[i] = a[j]; a[j] = t;
  }
  return a;
}

// ── Start game ──
function startGame() {
  G.p1Name      = el('p1Name').value.trim() || 'Player 1';
  G.p2Name      = el('p2Name').value.trim() || 'Player 2';
  G.round       = 0;
  G.p1Score     = 0;
  G.p2Score     = 0;
  G.p1Correct   = 0;
  G.p2Correct   = 0;
  G.p1Attempts  = 0;
  G.p2Attempts  = 0;
  G.fastestRound= null;
  G.fastestMs   = Infinity;

  el('hudP1Name').textContent    = G.p1Name;
  el('hudP2Name').textContent    = G.p2Name;
  el('zoneP1Name').textContent   = G.p1Name;
  el('zoneP2Name').textContent   = G.p2Name;
  el('totalRoundEl').textContent = String(G.totalRounds);
  el('hudP1Score').textContent   = '0';
  el('hudP2Score').textContent   = '0';
  el('hudProgP1').style.width    = '0%';
  el('hudProgP2').style.width    = '0%';

  showScreen('sGame');
  nextRound();
}

// ── Next round ──
function nextRound() {
  if (G.round >= G.totalRounds) {
    endGame();
    return;
  }

  G.answered = false;
  G.round++;
  el('roundEl').textContent = String(G.round);

  clearFeedback();

  var q = generateQuestion(G.difficulty);
  G.currentAnswer = q.answer;
  G.options       = q.options;
  G.roundStartTime = Date.now();

  el('questionText').textContent = q.display;

  // Build option buttons
  var container = el('answerOptions');
  container.innerHTML = '';

  var p1KeyLabels = ['A','S','D','F'];
  var p2KeyLabels = ['\u2190','\u2193','\u2191','\u2192'];

  for (var i = 0; i < q.options.length; i++) {
    var div = document.createElement('div');
    div.className = 'ans-option';
    div.id = 'opt' + i;
    div.innerHTML =
      String(q.options[i]) +
      '<span class="opt-key">' + p1KeyLabels[i] + ' / ' + p2KeyLabels[i] + '</span>';
    container.appendChild(div);
  }

  // Highlight key buttons (reset)
  resetKeyHighlights();

  // Start per-round timer (8 seconds)
  startRoundTimer();
}

// ── Round timer ──
function startRoundTimer() {
  clearInterval(G.timerInterval);
  var timeLimit = G.difficulty === 'easy' ? 8 : G.difficulty === 'medium' ? 6 : 5;
  G.timerVal = timeLimit;
  el('timerDisplay').textContent = String(G.timerVal);
  el('timerDisplay').classList.remove('warn');

  G.timerInterval = setInterval(function() {
    G.timerVal--;
    el('timerDisplay').textContent = String(G.timerVal);
    if (G.timerVal <= 2) el('timerDisplay').classList.add('warn');
    if (G.timerVal <= 0) {
      clearInterval(G.timerInterval);
      if (!G.answered) {
        onTimeout();
      }
    }
  }, 1000);
}

function onTimeout() {
  G.answered = true;
  // reveal correct
  var correctIdx = G.options.indexOf(G.currentAnswer);
  if (correctIdx >= 0) el('opt' + correctIdx).classList.add('correct-ans');
  setFeedback('p1Feedback', 'Time up!', 'bad');
  setFeedback('p2Feedback', 'Time up!', 'bad');
  setTimeout(nextRound, 1200);
}

// ── Handle answer ──
function handleAnswer(player, optionIndex) {
  if (G.answered) return;
  if (optionIndex < 0 || optionIndex >= G.options.length) return;

  var chosen  = G.options[optionIndex];
  var correct = chosen === G.currentAnswer;
  var elapsed = Date.now() - G.roundStartTime;

  if (player === 1) {
    G.p1Attempts++;
    highlightKey(P1_KEY_IDS[optionIndex], correct);
  } else {
    G.p2Attempts++;
    highlightKey(P2_KEY_IDS[optionIndex], correct);
  }

  if (correct) {
    G.answered = true;
    clearInterval(G.timerInterval);

    // Track fastest
    if (elapsed < G.fastestMs) {
      G.fastestMs    = elapsed;
      G.fastestRound = G.round;
    }

    if (player === 1) {
      G.p1Score++;
      G.p1Correct++;
      el('hudP1Score').textContent = String(G.p1Score);
      el('p1Zone').classList.add('flash-correct');
      setFeedback('p1Feedback', '+1 Point!', 'ok');
      setFeedback('p2Feedback', 'Too slow!', 'bad');
      setTimeout(function() { el('p1Zone').classList.remove('flash-correct'); }, 400);
    } else {
      G.p2Score++;
      G.p2Correct++;
      el('hudP2Score').textContent = String(G.p2Score);
      el('p2Zone').classList.add('flash-correct');
      setFeedback('p2Feedback', '+1 Point!', 'ok');
      setFeedback('p1Feedback', 'Too slow!', 'bad');
      setTimeout(function() { el('p2Zone').classList.remove('flash-correct'); }, 400);
    }

    // Highlight correct option
    el('opt' + optionIndex).classList.add('correct-ans');

    // Update progress bars
    el('hudProgP1').style.width = ((G.p1Score / G.totalRounds) * 100) + '%';
    el('hudProgP2').style.width = ((G.p2Score / G.totalRounds) * 100) + '%';

    setTimeout(nextRound, 1000);

  } else {
    // Wrong answer
    if (player === 1) {
      G.p1Attempts++;
      setFeedback('p1Feedback', 'Wrong!', 'bad');
    } else {
      G.p2Attempts++;
      setFeedback('p2Feedback', 'Wrong!', 'bad');
    }
    el('opt' + optionIndex).classList.add('wrong-ans');
    setTimeout(function() { el('opt' + optionIndex).classList.remove('wrong-ans'); }, 400);
  }
}

// ── Key highlights ──
function highlightKey(keyId, correct) {
  var keyEl = el(keyId);
  if (!keyEl) return;
  keyEl.classList.add(correct ? 'key-correct' : 'key-wrong');
  setTimeout(function() {
    keyEl.classList.remove('key-correct','key-wrong');
  }, 600);
}

function resetKeyHighlights() {
  var allKeys = P1_KEY_IDS.concat(P2_KEY_IDS);
  for (var i = 0; i < allKeys.length; i++) {
    var k = el(allKeys[i]);
    if (k) k.classList.remove('key-correct','key-wrong','pressed');
  }
}

// ── Feedback ──
function setFeedback(elId, msg, cls) {
  var fb = el(elId);
  fb.textContent = msg;
  fb.className   = 'zone-feedback ' + cls;
}

function clearFeedback() {
  el('p1Feedback').textContent = '';
  el('p1Feedback').className   = 'zone-feedback';
  el('p2Feedback').textContent = '';
  el('p2Feedback').className   = 'zone-feedback';
}

// ── End game ──
function endGame() {
  clearInterval(G.timerInterval);

  // Names
  el('fsP1Name').textContent   = G.p1Name;
  el('fsP2Name').textContent   = G.p2Name;
  el('fStatP1Name').textContent = G.p1Name + ' Acc';
  el('fStatP2Name').textContent = G.p2Name + ' Acc';

  // Scores
  el('fsP1Score').textContent = String(G.p1Score);
  el('fsP2Score').textContent = String(G.p2Score);

  // Accuracy
  var p1Acc = G.p1Attempts > 0 ? Math.round((G.p1Correct / G.p1Attempts) * 100) : 0;
  var p2Acc = G.p2Attempts > 0 ? Math.round((G.p2Correct / G.p2Attempts) * 100) : 0;
  el('fAccP1').textContent = p1Acc + '%';
  el('fAccP2').textContent = p2Acc + '%';
  el('fFastestRound').textContent = G.fastestRound ? 'R' + G.fastestRound : '--';

  // Winner
  var winnerName, isTie;
  if (G.p1Score > G.p2Score) {
    winnerName = G.p1Name;
    isTie      = false;
  } else if (G.p2Score > G.p1Score) {
    winnerName = G.p2Name;
    isTie      = false;
  } else {
    winnerName = 'TIE';
    isTie      = true;
  }

  if (isTie) {
    el('winnerCrown').textContent = '\uD83E\uDD1D';
    el('winnerTag').textContent   = 'IT\'S A';
    el('winnerName').textContent  = 'TIE GAME!';
  } else {
    el('winnerCrown').textContent = '\uD83D\uDC51';
    el('winnerTag').textContent   = 'WINNER';
    el('winnerName').textContent  = winnerName + '!';
  }

  showScreen('sWinner');
  launchConfetti();
}

// ── Confetti ──
function launchConfetti() {
  var area = el('confettiArea');
  area.innerHTML = '';
  for (var i = 0; i < 60; i++) {
    (function(i) {
      setTimeout(function() {
        var piece = document.createElement('div');
        piece.className = 'confetti-piece';
        piece.style.cssText = [
          'left:' + Math.random() * 100 + '%',
          'background:' + CONFETTI_COLORS[Math.floor(Math.random() * CONFETTI_COLORS.length)],
          'width:' + (rnd(6,14)) + 'px',
          'height:' + (rnd(6,14)) + 'px',
          'animation-duration:' + (rnd(12,24) / 10) + 's',
          'animation-delay:0s',
          'border-radius:' + (Math.random() > .5 ? '50%' : '2px')
        ].join(';');
        area.appendChild(piece);
      }, i * 40);
    })(i);
  }
}

// ── Keyboard input ──
document.addEventListener('keydown', function(e) {
  if (!el('sGame').classList.contains('active')) return;
  var key = e.key.toLowerCase();

  // Prevent arrow key scrolling
  if (['ArrowLeft','ArrowRight','ArrowUp','ArrowDown'].indexOf(e.key) >= 0) {
    e.preventDefault();
  }

  // P1 keys
  if (key in P1_KEYS) {
    var idx = P1_KEYS[key];
    var kb  = el(P1_KEY_IDS[idx]);
    if (kb) { kb.classList.add('pressed'); setTimeout(function(){ kb.classList.remove('pressed'); }, 100); }
    handleAnswer(1, idx);
    return;
  }

  // P2 keys
  if (e.key in P2_KEYS) {
    var idx2 = P2_KEYS[e.key];
    var kb2  = el(P2_KEY_IDS[idx2]);
    if (kb2) { kb2.classList.add('pressed'); setTimeout(function(){ kb2.classList.remove('pressed'); }, 100); }
    handleAnswer(2, idx2);
  }
});

// Click on key buttons (mobile / mouse)
(function() {
  var p1KeyMap = { 'keyA':0, 'keyS':1, 'keyD':2, 'keyF':3 };
  var p2KeyMap = { 'keyLeft':0, 'keyDown':1, 'keyUp':2, 'keyRight':3 };

  Object.keys(p1KeyMap).forEach(function(id) {
    var btn = el(id);
    if (!btn) return;
    btn.addEventListener('click', function() { handleAnswer(1, p1KeyMap[id]); });
  });
  Object.keys(p2KeyMap).forEach(function(id) {
    var btn = el(id);
    if (!btn) return;
    btn.addEventListener('click', function() { handleAnswer(2, p2KeyMap[id]); });
  });
})();

// ── Setting buttons ──
function setupOpts(containerId, callback) {
  var btns = el(containerId).querySelectorAll('.sopt');
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

setupOpts('roundOpts', function(val) { G.totalRounds = parseInt(val); });
setupOpts('diffOpts',  function(val) { G.difficulty  = val; });

// ── Nav buttons ──
el('btnStart').addEventListener('click', startGame);
el('btnRematch').addEventListener('click', startGame);
el('btnHomeWin').addEventListener('click', function() { showScreen('sHome'); });
