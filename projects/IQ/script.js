

const cursor = document.getElementById('cursor');
const trail  = document.getElementById('cursorTrail');

document.addEventListener('mousemove', e => {
  cursor.style.left = e.clientX + 'px';
  cursor.style.top  = e.clientY + 'px';
  setTimeout(() => {
    trail.style.left = e.clientX + 'px';
    trail.style.top  = e.clientY + 'px';
  }, 80);
});


const DATA = {
  questions: [
    { id:1, category:"Pattern Recognition",  question:"What comes next in the sequence: 2, 6, 12, 20, 30, ?",                                                                              options:["40","42","44","48"],                                                                        answer:1, explanation:"Differences: +4,+6,+8,+10,+12 → 42" },
    { id:2, category:"Spatial Reasoning",     question:"Fold a square diagonally twice, cut a triangle from the folded corner. How many holes appear when unfolded?",                       options:["1","2","4","8"],                                                                            answer:0, explanation:"One cut from the folded corner creates 1 hole at centre." },
    { id:3, category:"Verbal Intelligence",   question:"BOOK is to LIBRARY as PAINTING is to:",                                                                                            options:["Artist","Canvas","Gallery","Museum"],                                                       answer:2, explanation:"A book is stored in a library; a painting is displayed in a gallery." },
    { id:4, category:"Logical Deduction",     question:"All roses are flowers. Some flowers fade quickly. Therefore:",                                                                      options:["All roses fade quickly","Some roses may fade quickly","No roses fade quickly","Roses are not flowers"], answer:1, explanation:"We can only conclude some roses may fade quickly." },
    { id:5, category:"Numerical Reasoning",   question:"A clock shows 3:15. What is the angle between the hour and minute hands?",                                                         options:["0°","7.5°","15°","22.5°"],                                                                 answer:1, explanation:"At 3:15 minute hand is at 90°. Hour hand is at 97.5°. Difference = 7.5°." },
    { id:6, category:"Working Memory",        question:"Reverse: 7, 3, 9, 1, 4, 6. What is the 3rd element of the reversed sequence?",                                                    options:["9","4","1","3"],                                                                            answer:2, explanation:"Reversed: 6,4,1,9,3,7. The 3rd element is 1." },
    { id:7, category:"Abstract Reasoning",    question:"Which is the odd one out: Triangle, Square, Pentagon, Cube, Hexagon?",                                                             options:["Triangle","Square","Cube","Hexagon"],                                                       answer:2, explanation:"Cube is 3-D; all others are 2-D polygons." },
    { id:8, category:"Pattern Recognition",   question:"Complete the Fibonacci sequence: 1, 1, 2, 3, 5, 8, 13, ?",                                                                        options:["18","20","21","24"],                                                                        answer:2, explanation:"Each number = sum of previous two. 8+13=21." },
    { id:9, category:"Verbal Intelligence",   question:"Choose the word most similar to EPHEMERAL:",                                                                                       options:["Eternal","Transient","Robust","Ancient"],                                                   answer:1, explanation:"Ephemeral means short-lived — synonymous with transient." },
    { id:10,category:"Logical Deduction",     question:"RED > BLUE, BLUE > GREEN, GREEN = YELLOW. Which statement is true?",                                                               options:["YELLOW > RED","RED = GREEN","RED > YELLOW","BLUE = RED"],                                  answer:2, explanation:"RED > BLUE > GREEN = YELLOW, so RED > YELLOW." }
  ],
  iq_ranges: [
    { min:0,  max:2,  label:"Below Average", score:85,  color:"#ff6b6b" },
    { min:3,  max:4,  label:"Average",       score:100, color:"#ffd93d" },
    { min:5,  max:6,  label:"Above Average", score:110, color:"#6bcb77" },
    { min:7,  max:8,  label:"Superior",      score:125, color:"#4d96ff" },
    { min:9,  max:10, label:"Gifted",        score:145, color:"#c77dff" }
  ]
};

// ---------- STATE ----------
const questions = DATA.questions;
const iqRanges  = DATA.iq_ranges;
let current  = 0;
let answers  = [];
let timerID  = null;
let timeLeft = 20;
const TIMER_MAX = 20;

// ---------- INIT ----------
function init() {
  buildSynapseBar();
  document.getElementById('btnStart').addEventListener('click', startTest);
  document.getElementById('btnRetake').addEventListener('click', retake);
  document.getElementById('btnShare').addEventListener('click', shareResult);
}

// ---------- SCREEN SWITCH ----------
function showScreen(id) {
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
  document.getElementById(id).classList.add('active');
}

// ---------- START ----------
function startTest() {
  current = 0; answers = [];
  buildSynapseBar();
  showScreen('screen-question');
  loadQuestion();
}

// ---------- LOAD QUESTION ----------
function loadQuestion() {
  const q = questions[current];

  document.getElementById('qCount').textContent    = `Q ${current + 1} / ${questions.length}`;
  document.getElementById('qCategory').textContent = q.category;
  document.getElementById('progressFill').style.width = `${(current / questions.length) * 100}%`;

  const qText = document.getElementById('qText');
  qText.style.animation = 'none';
  void qText.offsetWidth;
  qText.style.animation = '';
  qText.textContent = q.question;

  const container = document.getElementById('qOptions');
  container.innerHTML = '';
  ['A','B','C','D'].forEach((lbl, i) => {
    const btn = document.createElement('button');
    btn.className = 'option-btn';
    btn.innerHTML = `<span class="opt-label">${lbl}</span>${q.options[i]}`;
    btn.addEventListener('click', () => selectAnswer(i));
    container.appendChild(btn);
  });

  updateSynapse();
  startTimer();
}

// ---------- TIMER ----------
function startTimer() {
  clearInterval(timerID);
  timeLeft = TIMER_MAX;
  updateTimerUI();
  timerID = setInterval(() => {
    timeLeft--;
    updateTimerUI();
    if (timeLeft <= 0) { clearInterval(timerID); timeoutAnswer(); }
  }, 1000);
}

function updateTimerUI() {
  document.getElementById('timerNum').textContent = timeLeft;
  const circle = document.getElementById('timerCircle');
  const circ   = 2 * Math.PI * 17; // r=17
  circle.style.strokeDasharray  = circ;
  circle.style.strokeDashoffset = circ * (1 - timeLeft / TIMER_MAX);
  const hot = timeLeft / TIMER_MAX < 0.3;
  circle.style.stroke = hot ? '#ff6b6b' : '#64c8ff';
  document.getElementById('timerNum').style.color = hot ? '#ff6b6b' : '#64c8ff';
}

function timeoutAnswer() {
  const q    = questions[current];
  const btns = document.querySelectorAll('.option-btn');
  btns.forEach(b => b.classList.add('disabled'));
  btns[q.answer].classList.add('correct');
  answers.push({ correct: false, category: q.category });
  updateSynapse();
  setTimeout(nextQuestion, 1400);
}

// ---------- SELECT ANSWER ----------
function selectAnswer(idx) {
  clearInterval(timerID);
  const q    = questions[current];
  const btns = document.querySelectorAll('.option-btn');
  btns.forEach(b => b.classList.add('disabled'));
  const correct = idx === q.answer;
  btns[idx].classList.add(correct ? 'correct' : 'wrong');
  if (!correct) btns[q.answer].classList.add('correct');
  answers.push({ correct, category: q.category });
  updateSynapse();
  setTimeout(nextQuestion, 1400);
}

function nextQuestion() {
  current++;
  current < questions.length ? loadQuestion() : showResult();
}

// ---------- SYNAPSE BAR ----------
function buildSynapseBar() {
  const bar = document.getElementById('synapseBar');
  bar.innerHTML = '';
  questions.forEach((_, i) => {
    const dot = document.createElement('div');
    dot.className = 'synapse-dot';
    dot.id = `dot-${i}`;
    bar.appendChild(dot);
  });
}

function updateSynapse() {
  questions.forEach((_, i) => {
    const dot = document.getElementById(`dot-${i}`);
    if (!dot) return;
    dot.className = 'synapse-dot';
    if (i < answers.length) dot.classList.add(answers[i].correct ? 'correct' : 'wrong');
    else if (i === current) dot.classList.add('active');
  });
}

// ---------- RESULT ----------
function showResult() {
  showScreen('screen-result');
  const correctCount = answers.filter(a => a.correct).length;
  const range  = iqRanges.find(r => correctCount >= r.min && correctCount <= r.max) || iqRanges[0];
  const iqScore = range.score + Math.floor(Math.random() * 7) - 3;

  animateNumber(document.getElementById('resultIQ'), 0, iqScore, 1400);
  const bandEl = document.getElementById('resultBand');
  bandEl.textContent = range.label;
  bandEl.style.color  = range.color;

  // Breakdown
  const cats = {};
  questions.forEach((q, i) => {
    if (!cats[q.category]) cats[q.category] = { correct:0, total:0 };
    cats[q.category].total++;
    if (answers[i] && answers[i].correct) cats[q.category].correct++;
  });
  const grid = document.getElementById('breakdownGrid');
  grid.innerHTML = '';
  Object.entries(cats).forEach(([cat, d]) => {
    const div = document.createElement('div');
    div.className = 'breakdown-item';
    div.innerHTML = `<div class="breakdown-cat">${cat}</div><div class="breakdown-score">${d.correct}/${d.total} correct</div>`;
    grid.appendChild(div);
  });

  setTimeout(() => drawIQCurve(iqScore), 150);
  spawnParticles(range.color);
}

// ---------- ANIMATE NUMBER ----------
function animateNumber(el, from, to, duration) {
  const start = performance.now();
  (function step(now) {
    const t    = Math.min((now - start) / duration, 1);
    const ease = 1 - Math.pow(1 - t, 3);
    el.textContent = Math.round(from + (to - from) * ease);
    if (t < 1) requestAnimationFrame(step);
  })(performance.now());
}

// ---------- BELL CURVE ----------
function drawIQCurve(yourIQ) {
  const canvas = document.getElementById('resultChart');
  const rect   = canvas.getBoundingClientRect();
  canvas.width  = Math.round(rect.width)  || 500;
  canvas.height = Math.round(rect.height) || 160;

  const ctx = canvas.getContext('2d');
  const W = canvas.width, H = canvas.height;
  const padL = 30, padR = 30, padT = 20, padB = 30;
  const xMin = 55, xMax = 145;

  function gauss(x) { return Math.exp(-0.5 * Math.pow((x - 100) / 15, 2)); }
  function xToC(x)  { return padL + ((x - xMin) / (xMax - xMin)) * (W - padL - padR); }
  function yToC(y)  { return H - padB - y * (H - padT - padB); }

  // Gradient fill
  const grad = ctx.createLinearGradient(0, 0, W, 0);
  grad.addColorStop(0,   'rgba(150,100,255,0.15)');
  grad.addColorStop(0.5, 'rgba(100,200,255,0.28)');
  grad.addColorStop(1,   'rgba(150,100,255,0.15)');

  ctx.beginPath();
  for (let x = xMin; x <= xMax; x += 0.5) {
    const px = xToC(x), py = yToC(gauss(x));
    x === xMin ? ctx.moveTo(px, py) : ctx.lineTo(px, py);
  }
  ctx.lineTo(xToC(xMax), yToC(0));
  ctx.lineTo(xToC(xMin), yToC(0));
  ctx.closePath();
  ctx.fillStyle = grad;
  ctx.fill();

  // Outline
  ctx.beginPath();
  for (let x = xMin; x <= xMax; x += 0.5) {
    const px = xToC(x), py = yToC(gauss(x));
    x === xMin ? ctx.moveTo(px, py) : ctx.lineTo(px, py);
  }
  ctx.strokeStyle = 'rgba(100,200,255,0.6)';
  ctx.lineWidth = 1.5;
  ctx.stroke();

  // X-axis
  ctx.beginPath();
  ctx.moveTo(padL, H - padB);
  ctx.lineTo(W - padR, H - padB);
  ctx.strokeStyle = 'rgba(255,255,255,0.12)';
  ctx.lineWidth = 1;
  ctx.stroke();

  // Labels
  ctx.font = '10px "Space Mono", monospace';
  ctx.fillStyle = 'rgba(200,223,240,0.45)';
  ctx.textAlign = 'center';
  [70,85,100,115,130].forEach(v => ctx.fillText(v, xToC(v), H - 8));

  // YOU marker
  const iqClamped = Math.max(xMin + 2, Math.min(xMax - 2, yourIQ));
  const markerX   = xToC(iqClamped);
  const markerY   = yToC(gauss(iqClamped));

  ctx.beginPath();
  ctx.moveTo(markerX, H - padB);
  ctx.lineTo(markerX, markerY);
  ctx.strokeStyle = '#ff6b6b';
  ctx.lineWidth = 1.5;
  ctx.setLineDash([4,3]);
  ctx.stroke();
  ctx.setLineDash([]);

  ctx.beginPath();
  ctx.arc(markerX, markerY, 5, 0, Math.PI * 2);
  ctx.fillStyle = '#ff6b6b';
  ctx.fill();

  // YOU label via DOM element
  const label = document.getElementById('chartLabelYou');
  label.style.left  = markerX + 'px';
  label.style.top   = (markerY - 20) + 'px';
  label.style.color = '#ff6b6b';
}

// ---------- PARTICLES ----------
function spawnParticles(color) {
  const c = document.getElementById('resultParticles');
  c.innerHTML = '';
  for (let i = 0; i < 40; i++) {
    const p    = document.createElement('div');
    p.className = 'particle';
    const size = 4 + Math.random() * 6;
    p.style.cssText = `width:${size}px;height:${size}px;background:${Math.random()>.5?color:'#64c8ff'};left:${10+Math.random()*80}%;top:-10px;opacity:${.5+Math.random()*.5};animation-duration:${2+Math.random()*3}s;animation-delay:${Math.random()*1.5}s;`;
    c.appendChild(p);
  }
}

// ---------- RETAKE ----------
function retake() {
  clearInterval(timerID);
  answers = []; current = 0;
  showScreen('screen-intro');
}

// ---------- SHARE / COPY ----------
function shareResult() {
  const iq   = document.getElementById('resultIQ').textContent;
  const band = document.getElementById('resultBand').textContent;
  const ok   = answers.filter(a => a.correct).length;
  const text = `🧠 IQ Index Result\nIQ Score: ${iq}\nClassification: ${band}\nCorrect: ${ok}/${questions.length}`;
  navigator.clipboard.writeText(text).then(() => {
    const btn = document.getElementById('btnShare');
    const orig = btn.textContent;
    btn.textContent = 'Copied!';
    setTimeout(() => btn.textContent = orig, 2000);
  }).catch(() => alert('Copy not supported in this browser.'));
}

// ---------- BOOT ----------
document.addEventListener('DOMContentLoaded', init);
