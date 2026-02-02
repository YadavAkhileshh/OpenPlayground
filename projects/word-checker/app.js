  //==== INTRO OVERLAY =====
    window.addEventListener("load", () => {
    const overlay = document.getElementById("intro-overlay");

    setTimeout(() => {
      overlay.classList.add("hide");

      // remove from DOM after animation
      setTimeout(() => overlay.remove(), 700);
    }, 7000);
  });

// ===== WORD LIST =====
const WORDS = [
  'apple','brave','candy','dream','eagle','flame','grape','house','index','joker',
  'knife','lemon','magic','nurse','ocean','pride','queen','river','stone','tiger',
  'union','vivid','wheat','xenon','young','zebra'
];

const ROWS = 6;
const COLS = 5;

let secret, row, col, grid, gameOver;
let timer = 0;
let interval;

const boardEl = document.getElementById('board');
const keyboardEl = document.getElementById('keyboard');
const statusEl = document.getElementById('status');
const timeEl = document.getElementById('time');
const themeSelect = document.getElementById('theme');

// ===== THEME SWITCH =====
const savedTheme = localStorage.getItem('theme') || 'neon';
document.body.className = savedTheme;
themeSelect.value = savedTheme;

themeSelect.onchange = e => {
  document.body.className = e.target.value;
  localStorage.setItem('theme', e.target.value);
};

function init() {
  secret = WORDS[Math.floor(Math.random() * WORDS.length)];
  row = 0; col = 0; gameOver = false;
  grid = Array.from({ length: ROWS }, () => Array(COLS).fill(''));
  boardEl.innerHTML = '';
  statusEl.textContent = '';
  buildBoard();
  buildKeyboard();
  resetTimer();
}

function resetTimer() {
  clearInterval(interval);
  timer = 0;
  timeEl.textContent = timer;
  interval = setInterval(() => {
    timer++;
    timeEl.textContent = timer;
  }, 1000);
}

function buildBoard() {
  for (let r = 0; r < ROWS; r++) {
    const rowEl = document.createElement('div');
    rowEl.className = 'row';
    for (let c = 0; c < COLS; c++) {
      const t = document.createElement('div');
      t.className = 'tile';
      t.id = `tile-${r}-${c}`;
      rowEl.appendChild(t);
    }
    boardEl.appendChild(rowEl);
  }
}

function buildKeyboard() {
  keyboardEl.innerHTML = '';
  'QWERTYUIOPASDFGHJKLZXCVBNM'.split('').forEach(k => keyboardEl.appendChild(keyBtn(k)));
  keyboardEl.appendChild(keyBtn('←', true));
  keyboardEl.appendChild(keyBtn('OK', true));
}

function keyBtn(label, wide=false) {
  const k = document.createElement('div');
  k.className = 'key' + (wide ? ' wide' : '');
  k.textContent = label;
  k.onclick = () => handleKey(label);
  return k;
}

function handleKey(key) {
  if (gameOver) return;
  if (key === '←') {
    if (col > 0) updateTile(row, --col, '');
    return;
  }
  if (key === 'OK') {
    if (col === COLS) submitRow();
    return;
  }
  if (/^[A-Z]$/.test(key) && col < COLS) {
    grid[row][col] = key.toLowerCase();
    updateTile(row, col++, key);
  }
}

function updateTile(r, c, val) {
  const t = document.getElementById(`tile-${r}-${c}`);
  t.textContent = val;
}

function submitRow() {
  const guess = grid[row].join('');
  if (guess.length < COLS) return;

  const used = Array(COLS).fill(false);

  for (let i = 0; i < COLS; i++) {
    if (guess[i] === secret[i]) {
      mark(row,i,'good'); used[i]=true; markKey(guess[i],'good');
    }
  }

  for (let i = 0; i < COLS; i++) {
    if (guess[i] === secret[i]) continue;
    const idx = secret.split('').findIndex((l,j)=>l===guess[i]&&!used[j]);
    if (idx !== -1) {
      used[idx]=true; mark(row,i,'mid'); markKey(guess[i],'mid');
    } else {
      mark(row,i,'bad'); markKey(guess[i],'bad');
    }
  }

  if (guess === secret) {
    clearInterval(interval);
statusEl.textContent = `✔ Correct in ${timer}s`;
    gameOver = true;
    return;
  }

  row++; col = 0;

  if (row === ROWS) {
    clearInterval(interval);
    statusEl.textContent = `✖ Word was: ${secret.toUpperCase()}`;
    gameOver = true;
  }
}

function mark(r,c,cls) {
  document.getElementById(`tile-${r}-${c}`).classList.add(cls);
}

function markKey(l,cls) {
  [...keyboardEl.children].forEach(k => {
    if (k.textContent.toLowerCase() === l) {
      if (k.classList.contains('good')) return;
      k.classList.remove('mid','bad');
      k.classList.add(cls);
    }
  });
}

// keyboard support
addEventListener('keydown', e => {
  if (e.key === 'Backspace') handleKey('←');
  else if (e.key === 'Enter') handleKey('OK');
  else if (/^[a-z]$/i.test(e.key)) handleKey(e.key.toUpperCase());
});

document.getElementById('reset').onclick = init;

init();