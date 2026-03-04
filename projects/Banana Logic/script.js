

const EMOJI_SETS = {
  fruits: ['🍌','🍎','🍊','🍇','🍓','🍑','🍋','🥝'],
  animals:['🐶','🐱','🐸','🐼','🦁','🐯','🦊','🐨'],
  shapes: ['⭐','🔺','🔵','⬛','💠','🔷','🔶','❤️'],
};

// Difficulty settings
const DIFFICULTY = {
  easy:   { time: 40, lives: 3, seqLen: 4, totalLevels: 5,  scorePerRight: 10 },
  medium: { time: 30, lives: 3, seqLen: 5, totalLevels: 8,  scorePerRight: 20 },
  hard:   { time: 20, lives: 2, seqLen: 6, totalLevels: 12, scorePerRight: 35 },
};


function makeArithmetic(level) {
  // step increases with level
  const step  = [2,3,4,5,6,7,8,9,10,11,12,15][Math.min(level - 1, 11)];
  const start = randomInt(1, 10);
  const ops   = ['+','-','×','÷'];
  let op = ops[Math.min(Math.floor(level / 3), 3)];

  let seq = [];
  let cur = start;
  for (let i = 0; i < 5; i++) {
    seq.push(cur);
    if (op === '+') cur += step;
    if (op === '-') cur -= step;
    if (op === '×') cur *= 2;
    if (op === '÷') cur = Math.floor(cur / 2);
  }

  const answer  = seq[seq.length - 1];
  const visible = seq.slice(0, seq.length - 1);
  const distractors = generateDistractors(answer, 3, op);

  return {
    type: 'number',
    instruction: `What comes next? (${op})`,
    sequence: visible.map(n => ({ kind: 'number', val: n })),
    answer: String(answer),
    options: shuffle([String(answer), ...distractors.map(String)]),
  };
}

function makeFibonacci() {
  const a = randomInt(1,4), b = randomInt(2,6);
  const seq = [a, b];
  for (let i = 2; i < 5; i++) seq.push(seq[i-1] + seq[i-2]);
  const answer = seq[4];
  const visible = seq.slice(0, 4);
  const opts = generateDistractors(answer, 3, 'fib');
  return {
    type: 'number',
    instruction: '🌀 Fibonacci pattern — what\'s next?',
    sequence: visible.map(n => ({ kind: 'number', val: n })),
    answer: String(answer),
    options: shuffle([String(answer), ...opts.map(String)]),
  };
}

function makeDoubleStep() {
  const steps = [2, 3, 4, 5, 6];
  const s1 = pick(steps), s2 = pick(steps.filter(x => x !== s1));
  let seq = [randomInt(1,8)];
  for (let i = 0; i < 5; i++) {
    seq.push(seq[seq.length - 1] + (i % 2 === 0 ? s1 : s2));
  }
  const answer = seq[5];
  const visible = seq.slice(0,5);
  const opts = generateDistractors(answer, 3, '+');
  return {
    type: 'number',
    instruction: `Alternating steps (+${s1} / +${s2}) — next?`,
    sequence: visible.map(n => ({ kind: 'number', val: n })),
    answer: String(answer),
    options: shuffle([String(answer), ...opts.map(String)]),
  };
}

// ── EMOJI PUZZLES ───────────────────────
function makeEmojiRepeat(level) {
  const setKey = pick(Object.keys(EMOJI_SETS));
  const pool   = EMOJI_SETS[setKey];
  const patLen = level <= 3 ? 2 : level <= 6 ? 3 : 4;
  const pattern= pool.slice(0, patLen);
  let   seq    = [];
  while (seq.length < 5) seq = [...seq, ...pattern];
  seq = seq.slice(0, 5);
  const answer  = pattern[seq.length % pattern.length];
  const distractors = pool.filter(e => e !== answer).slice(0, 3);

  return {
    type: 'emoji',
    instruction: '🔁 Find the repeating pattern!',
    sequence: seq.map(e => ({ kind: 'emoji', val: e })),
    answer,
    options: shuffle([answer, ...distractors]),
  };
}

function makeEmojiCount(level) {
  const emojis = EMOJI_SETS.fruits;
  const base = pick(emojis);
  const alt  = pick(emojis.filter(e => e !== base));
  // show: base base alt base base alt base ...
  const seq = [];
  for (let i = 0; i < 5; i++) {
    seq.push((i+1) % 3 === 0 ? alt : base);
  }
  const answer  = (5+1) % 3 === 0 ? alt : base;
  const distractors = emojis.filter(e => e !== answer).slice(0,3);
  return {
    type: 'emoji',
    instruction: '🧩 Spot the rule — what's 6th?',
    sequence: seq.map(e => ({ kind:'emoji', val: e })),
    answer,
    options: shuffle([answer, ...distractors]),
  };
}

// ── BANANA MATH (🍌 as numbers) ─────────
function makeBananaMath(level) {
  const a = randomInt(1,5), b = randomInt(1,5);
  const c = a + b;
  const wrongOpts = [c+1, c-1, c+2].filter(x => x > 0).slice(0,3);
  return {
    type: 'banana_math',
    instruction: `🍌 Banana Maths! Count the bananas:`,
    sequence: [
      { kind: 'emoji', val: '🍌'.repeat(a) },
      { kind: 'number', val: '+' },
      { kind: 'emoji', val: '🍌'.repeat(b) },
      { kind: 'number', val: '=' },
      { kind: 'blank',  val: '?' },
    ],
    answer: String(c),
    options: shuffle([String(c), ...wrongOpts.map(String)]),
  };
}

// ── MASTER PUZZLE PICKER ────────────────
function getPuzzle(level, difficulty) {
  const pool = [];

  // Always add arithmetic
  pool.push(() => makeArithmetic(level));

  // Gradually unlock more types
  if (level >= 2) pool.push(() => makeEmojiRepeat(level));
  if (level >= 3) pool.push(() => makeBananaMath(level));
  if (level >= 4) pool.push(() => makeEmojiCount(level));
  if (level >= 5) pool.push(() => makeDoubleStep());
  if (level >= 6) pool.push(() => makeFibonacci());

  return pick(pool)();
}

// ────────────────────────────────────────
//  GAME STATE
// ────────────────────────────────────────
let state = {
  difficulty: 'easy',
  level: 1,
  score: 0,
  lives: 3,
  timer: 30,
  timerInterval: null,
  currentPuzzle: null,
  correctCount: 0,
  answered: false,
};

// ────────────────────────────────────────
//  DOM REFS
// ────────────────────────────────────────
const screens = {
  home: document.getElementById('screenHome'),
  game: document.getElementById('screenGame'),
  over: document.getElementById('screenOver'),
};

const $ = id => document.getElementById(id);

// ────────────────────────────────────────
//  NAVIGATION
// ────────────────────────────────────────
function showScreen(name) {
  Object.values(screens).forEach(s => s.classList.remove('active'));
  screens[name].classList.add('active');
}

// ────────────────────────────────────────
//  BACKGROUND BANANAS
// ────────────────────────────────────────
function spawnBgBananas() {
  const bg = $('bgLayer');
  for (let i = 0; i < 18; i++) {
    const span = document.createElement('span');
    span.className = 'float-banana';
    span.textContent = '🍌';
    span.style.left   = `${randomInt(0, 100)}%`;
    span.style.animationDuration = `${randomInt(8, 20)}s`;
    span.style.animationDelay    = `${randomInt(0, 15)}s`;
    span.style.fontSize           = `${randomInt(14, 36)}px`;
    bg.appendChild(span);
  }
}
spawnBgBananas();

// ────────────────────────────────────────
//  START GAME
// ────────────────────────────────────────
function startGame(difficulty) {
  const cfg = DIFFICULTY[difficulty];
  state = {
    difficulty,
    level: 1,
    score: 0,
    lives: cfg.lives,
    timer: cfg.time,
    timerInterval: null,
    currentPuzzle: null,
    correctCount: 0,
    answered: false,
  };

  $('score').textContent = 0;
  $('lives').textContent = cfg.lives;
  $('levelNum').textContent = 1;

  showScreen('game');
  loadPuzzle();
}

// ────────────────────────────────────────
//  LOAD PUZZLE
// ────────────────────────────────────────
function loadPuzzle() {
  state.answered = false;
  state.currentPuzzle = getPuzzle(state.level, state.difficulty);

  const p = state.currentPuzzle;
  $('puzzleInstruction').textContent = p.instruction;

  // Build sequence
  const row = $('sequenceRow');
  row.innerHTML = '';
  p.sequence.forEach((item, i) => {
    if (i > 0) {
      const arrow = document.createElement('span');
      arrow.className = 'seq-arrow';
      // only show arrow for number/emoji sequences, not banana_math
      if (p.type !== 'banana_math') arrow.textContent = '→';
      row.appendChild(arrow);
    }

    const div = document.createElement('div');
    div.className = `seq-item ${item.kind}`;
    div.style.animationDelay = `${i * 0.07}s`;
    div.textContent = item.val;
    row.appendChild(div);
  });

  // Build options
  const grid = $('optionsGrid');
  grid.innerHTML = '';
  p.options.forEach(opt => {
    const btn = document.createElement('button');
    btn.className = 'option-btn';
    btn.textContent = opt;
    btn.addEventListener('click', () => checkAnswer(opt, btn));
    grid.appendChild(btn);
  });

  $('feedbackMsg').textContent = '';
  $('feedbackMsg').className = 'feedback-msg';

  // Update progress bar
  const cfg = DIFFICULTY[state.difficulty];
  const pct = ((state.level - 1) / cfg.totalLevels) * 100;
  $('progressFill').style.width = `${pct}%`;

  // Start timer
  startTimer();
}

// ────────────────────────────────────────
//  TIMER
// ────────────────────────────────────────
function startTimer() {
  clearInterval(state.timerInterval);
  const cfg = DIFFICULTY[state.difficulty];
  state.timer = cfg.time;
  $('timer').textContent = state.timer;
  $('timer').className = '';

  state.timerInterval = setInterval(() => {
    state.timer--;
    $('timer').textContent = state.timer;

    if (state.timer <= 8) {
      $('timer').className = 'timer-warning';
    }

    if (state.timer <= 0) {
      clearInterval(state.timerInterval);
      if (!state.answered) handleTimeout();
    }
  }, 1000);
}

function handleTimeout() {
  state.answered = true;
  state.lives--;
  $('lives').textContent = state.lives;

  setFeedback('⏰ Time\'s up! -1 Life', 'wrong');

  // Show correct answer
  highlightCorrect();

  if (state.lives <= 0) {
    setTimeout(endGame, 1200);
  } else {
    setTimeout(() => {
      state.level++;
      const cfg = DIFFICULTY[state.difficulty];
      if (state.level > cfg.totalLevels) {
        winGame();
      } else {
        $('levelNum').textContent = state.level;
        loadPuzzle();
      }
    }, 1500);
  }
}

// ────────────────────────────────────────
//  CHECK ANSWER
// ────────────────────────────────────────
function checkAnswer(chosen, btn) {
  if (state.answered) return;
  state.answered = true;
  clearInterval(state.timerInterval);

  const correct = state.currentPuzzle.answer;
  const cfg = DIFFICULTY[state.difficulty];

  if (chosen === correct) {
    // Correct!
    btn.classList.add('correct');
    state.score += cfg.scorePerRight + state.timer; // bonus for speed
    state.correctCount++;
    $('score').textContent = state.score;

    setFeedback(randomPraise(), 'correct');

    setTimeout(nextLevel, 1200);
  } else {
    // Wrong!
    btn.classList.add('wrong');
    state.lives--;
    $('lives').textContent = state.lives;

    setFeedback('❌ Wrong! Try next one...', 'wrong');
    highlightCorrect();

    if (state.lives <= 0) {
      setTimeout(endGame, 1300);
    } else {
      setTimeout(nextLevel, 1400);
    }
  }
}

function nextLevel() {
  state.level++;
  const cfg = DIFFICULTY[state.difficulty];
  if (state.level > cfg.totalLevels) {
    winGame();
  } else {
    $('levelNum').textContent = state.level;
    loadPuzzle();
  }
}

function highlightCorrect() {
  const opts = $('optionsGrid').querySelectorAll('.option-btn');
  opts.forEach(b => {
    if (b.textContent === state.currentPuzzle.answer) {
      b.classList.add('correct');
    }
  });
}

// ────────────────────────────────────────
//  GAME END
// ────────────────────────────────────────
function endGame() {
  clearInterval(state.timerInterval);
  saveHighScore(state.score);
  $('overEmoji').textContent = state.lives <= 0 ? '😵' : '🎉';
  $('overTitle').textContent = state.lives <= 0 ? 'Game Over!' : 'You Did It!';
  $('overMsg').textContent = state.lives <= 0
    ? 'You ran out of lives! Better luck next time 🍌'
    : 'You beat all the levels! 🏆 Go bananas!';
  $('finalScore').textContent = state.score;
  $('finalLevel').textContent = state.level - 1;
  $('finalCorrect').textContent = state.correctCount;
  showScreen('over');
}

function winGame() {
  clearInterval(state.timerInterval);
  saveHighScore(state.score);
  $('overEmoji').textContent = '🏆';
  $('overTitle').textContent = '🎉 You Won!';
  $('overMsg').textContent = `Amazing! You completed all levels on ${state.difficulty} mode! 🍌`;
  $('finalScore').textContent = state.score;
  $('finalLevel').textContent = state.level - 1;
  $('finalCorrect').textContent = state.correctCount;
  showScreen('over');
}

// ────────────────────────────────────────
//  FEEDBACK
// ────────────────────────────────────────
function setFeedback(msg, type) {
  const el = $('feedbackMsg');
  el.textContent = msg;
  el.className = `feedback-msg ${type}`;
}

const praises = [
  '🍌 Bananas! Correct!',
  '🎯 Nailed it!',
  '🔥 On fire!',
  '⚡ Lightning fast!',
  '🧠 Big brain move!',
  '🎉 Excellent!',
  '🌟 Perfect!',
  '🚀 Genius!',
];
function randomPraise() { return pick(praises); }

// ────────────────────────────────────────
//  HIGH SCORE
// ────────────────────────────────────────
function saveHighScore(score) {
  const prev = parseInt(localStorage.getItem('bananaHighScore') || '0');
  if (score > prev) {
    localStorage.setItem('bananaHighScore', score);
    $('highscoreDisplay').textContent = score;
  }
}

function loadHighScore() {
  const hs = localStorage.getItem('bananaHighScore') || '0';
  $('highscoreDisplay').textContent = hs;
}

// ────────────────────────────────────────
//  HELPERS
// ────────────────────────────────────────
function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function pick(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function generateDistractors(answer, count, op) {
  const set = new Set();
  const offsets = op === '×' || op === '÷'
    ? [1, 2, 3, 4, 5, 6, -1, -2]
    : [1, 2, 3, 4, 5, -1, -2, -3];

  for (const o of shuffle(offsets)) {
    const v = answer + o;
    if (v !== answer && v > 0) set.add(v);
    if (set.size >= count) break;
  }
  return [...set].slice(0, count);
}

// ────────────────────────────────────────
//  EVENT LISTENERS
// ────────────────────────────────────────
document.getElementById('btnEasy').addEventListener('click', () => startGame('easy'));
document.getElementById('btnMedium').addEventListener('click', () => startGame('medium'));
document.getElementById('btnHard').addEventListener('click', () => startGame('hard'));

document.getElementById('btnBack').addEventListener('click', () => {
  clearInterval(state.timerInterval);
  showScreen('home');
});

document.getElementById('btnPlayAgain').addEventListener('click', () => {
  startGame(state.difficulty);
});

document.getElementById('btnGoHome').addEventListener('click', () => {
  showScreen('home');
});

// ────────────────────────────────────────
//  INIT
// ────────────────────────────────────────
loadHighScore();
console.log('🍌 Banana Logic Game loaded!');
