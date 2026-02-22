
const DATA = {
  questions: [
    {
      id: 1,
      text: "It's Saturday morning. Your first instinct is to…",
      options: [
        { text: "Plan the day in a notebook",          scores: { A:2, B:0, C:0, D:1 } },
        { text: "Call a friend and improvise",         scores: { A:0, B:2, C:1, D:0 } },
        { text: "Stay in and create something",        scores: { A:0, B:0, C:2, D:1 } },
        { text: "Take a long walk alone",              scores: { A:1, B:0, C:0, D:2 } }
      ]
    },
    {
      id: 2,
      text: "A friend is upset. You naturally…",
      options: [
        { text: "Offer practical solutions",           scores: { A:2, B:0, C:0, D:1 } },
        { text: "Lighten the mood somehow",            scores: { A:0, B:2, C:0, D:0 } },
        { text: "Listen and validate deeply",          scores: { A:0, B:0, C:2, D:1 } },
        { text: "Give them space to process",          scores: { A:0, B:1, C:0, D:2 } }
      ]
    },
    {
      id: 3,
      text: "You describe your ideal home as…",
      options: [
        { text: "Organised, everything in its place",  scores: { A:2, B:0, C:0, D:1 } },
        { text: "Lively, full of people and colour",   scores: { A:0, B:2, C:1, D:0 } },
        { text: "A studio — walls covered in art",     scores: { A:0, B:0, C:2, D:0 } },
        { text: "Quiet, minimal, with a view",         scores: { A:1, B:0, C:0, D:2 } }
      ]
    },
    {
      id: 4,
      text: "Under real pressure, you become…",
      options: [
        { text: "Hyper-focused and methodical",        scores: { A:2, B:0, C:0, D:1 } },
        { text: "Energised — you rise to it",          scores: { A:0, B:2, C:0, D:0 } },
        { text: "Withdrawn but still creative",        scores: { A:0, B:0, C:2, D:0 } },
        { text: "Calm — detachment helps you",         scores: { A:0, B:0, C:0, D:2 } }
      ]
    },
    {
      id: 5,
      text: "Your friends would most likely describe you as…",
      options: [
        { text: "The reliable one",                    scores: { A:2, B:0, C:0, D:1 } },
        { text: "The fun one",                         scores: { A:0, B:2, C:0, D:0 } },
        { text: "The deep one",                        scores: { A:0, B:0, C:2, D:1 } },
        { text: "The mysterious one",                  scores: { A:0, B:0, C:0, D:2 } }
      ]
    },
    {
      id: 6,
      text: "You make important decisions by…",
      options: [
        { text: "Listing pros and cons carefully",     scores: { A:2, B:0, C:0, D:1 } },
        { text: "Talking it out with people you trust",scores: { A:0, B:2, C:0, D:0 } },
        { text: "Sitting with the feeling until clear",scores: { A:0, B:0, C:2, D:1 } },
        { text: "Trusting your gut, then stepping back",scores: { A:0, B:0, C:0, D:2 } }
      ]
    },
    {
      id: 7,
      text: "Which sentence speaks to you most?",
      options: [
        { text: "\"A place for everything, everything in its place.\"",  scores: { A:2, B:0, C:0, D:0 } },
        { text: "\"Life is short — enjoy every second.\"",               scores: { A:0, B:2, C:0, D:0 } },
        { text: "\"Beauty is in the details no one notices.\"",          scores: { A:0, B:0, C:2, D:0 } },
        { text: "\"Silence says more than words ever could.\"",          scores: { A:0, B:0, C:0, D:2 } }
      ]
    },
    {
      id: 8,
      text: "What drains your energy most?",
      options: [
        { text: "Chaos with no clear structure",       scores: { A:2, B:0, C:0, D:1 } },
        { text: "Being stuck alone for too long",      scores: { A:0, B:2, C:0, D:0 } },
        { text: "Surface-level conversations",         scores: { A:0, B:0, C:2, D:1 } },
        { text: "Constant noise and demands",          scores: { A:0, B:0, C:0, D:2 } }
      ]
    },
    {
      id: 9,
      text: "In a group project you gravitate toward…",
      options: [
        { text: "Organising the plan and timeline",    scores: { A:2, B:0, C:0, D:0 } },
        { text: "Rallying the team, keeping spirits up",scores: { A:0, B:2, C:0, D:0 } },
        { text: "Designing and shaping the vision",    scores: { A:0, B:0, C:2, D:0 } },
        { text: "Thinking it through independently first",scores: { A:0, B:0, C:0, D:2 } }
      ]
    },
    {
      id: 10,
      text: "Your perfect evening ends with…",
      options: [
        { text: "Everything ticked off your list",     scores: { A:2, B:0, C:0, D:0 } },
        { text: "Laughing until your sides hurt",      scores: { A:0, B:2, C:0, D:0 } },
        { text: "Creating something you're proud of",  scores: { A:0, B:0, C:2, D:0 } },
        { text: "Pure quiet — just you and your thoughts",scores: { A:0, B:0, C:0, D:2 } }
      ]
    }
  ],

  personalities: {
    A: {
      type:         "The Architect",
      emoji:        "◻",
      tagline:      "You build worlds others only imagine.",
      description:  "Methodical, dependable, and quietly driven — you are the person who turns ideas into reality. You thrive on structure, find comfort in plans, and take deep satisfaction in doing things properly. People trust you because you always deliver.",
      strengths:    ["Disciplined", "Reliable", "Strategic", "Detail-oriented"],
      blind_spot:   "Perfectionism can slow you down. Not everything needs a system.",
      resonates_with: "The Sage",
      color:        "#2D3748",
      accent:       "#E2B96A"
    },
    B: {
      type:         "The Catalyst",
      emoji:        "◇",
      tagline:      "You make every room feel alive.",
      description:  "Warm, spontaneous, and magnetically social — you move through the world with an infectious energy that draws people in. You are the spark in the room, the one who makes ordinary moments feel extraordinary. Life gets richer around you.",
      strengths:    ["Charismatic", "Optimistic", "Adaptable", "Energising"],
      blind_spot:   "Stillness can be productive too. Not all silence needs filling.",
      resonates_with: "The Architect",
      color:        "#744210",
      accent:       "#F6AD55"
    },
    C: {
      type:         "The Sage",
      emoji:        "○",
      tagline:      "You see what others walk past.",
      description:  "Perceptive, imaginative, and deeply feeling — you process the world through layers others miss. You create meaning from the mundane, feel beauty acutely, and connect with people at a profound depth. Your inner world is extraordinarily rich.",
      strengths:    ["Empathetic", "Creative", "Perceptive", "Thoughtful"],
      blind_spot:   "Your depth is a gift — but don't disappear into it. Surface up sometimes.",
      resonates_with: "The Wanderer",
      color:        "#1A365D",
      accent:       "#90CDF4"
    },
    D: {
      type:         "The Wanderer",
      emoji:        "△",
      tagline:      "You carry your home within you.",
      description:  "Independent, introspective, and quietly powerful — you move at your own pace and on your own terms. You don't need validation from the crowd; your compass is internal. Solitude fuels you, silence is your ally, and your observations cut straight to truth.",
      strengths:    ["Self-aware", "Calm", "Observant", "Autonomous"],
      blind_spot:   "Connection isn't weakness. Let people in occasionally.",
      resonates_with: "The Catalyst",
      color:        "#1C4532",
      accent:       "#9AE6B4"
    }
  }
};

// ── STATE ──────────────────────────────────────────
const questions = DATA.questions;
const personalities = DATA.personalities;
let current = 0;
let totals  = { A: 0, B: 0, C: 0, D: 0 };
const KEYS  = ['A', 'B', 'C', 'D'];

// ── HELPERS ────────────────────────────────────────
function showScreen(id) {
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
  document.getElementById(id).classList.add('active');
}

function $(id) { return document.getElementById(id); }

// ── STEP DOTS ──────────────────────────────────────
function buildStepDots() {
  const wrap = $('qSteps');
  wrap.innerHTML = '';
  questions.forEach((_, i) => {
    const d = document.createElement('div');
    d.className = 'step-dot';
    d.id = `dot-${i}`;
    wrap.appendChild(d);
  });
}

function updateStepDots() {
  questions.forEach((_, i) => {
    const d = $(`dot-${i}`);
    d.className = 'step-dot';
    if (i < current)       d.classList.add('done');
    else if (i === current) d.classList.add('active');
  });
}

// ── LOAD QUESTION ──────────────────────────────────
function loadQuestion() {
  const q = questions[current];

  $('qLabel').textContent = `Question ${current + 1}`;
  $('qNum').textContent   = `${current + 1} / ${questions.length}`;

  // Re-trigger card animation
  const card = document.querySelector('.q-card');
  card.style.animation = 'none';
  void card.offsetWidth;
  card.style.animation = '';

  $('qText').textContent = q.text;

  const container = $('qOptions');
  container.innerHTML = '';
  const labels = ['A', 'B', 'C', 'D'];

  q.options.forEach((opt, i) => {
    const btn = document.createElement('button');
    btn.className = 'opt-btn';
    btn.innerHTML = `<span class="opt-key">${labels[i]}</span><span class="opt-text">${opt.text}</span>`;
    btn.addEventListener('click', () => pickAnswer(i, btn));
    container.appendChild(btn);
  });

  $('qProgressFill').style.width = `${(current / questions.length) * 100}%`;
  updateStepDots();
}

// ── PICK ANSWER ────────────────────────────────────
function pickAnswer(idx, btn) {
  // Disable all buttons
  document.querySelectorAll('.opt-btn').forEach(b => {
    b.style.pointerEvents = 'none';
    b.style.opacity = '0.45';
  });
  btn.style.opacity = '1';
  btn.classList.add('selected');

  // Accumulate scores
  const opt = questions[current].options[idx];
  KEYS.forEach(k => { totals[k] += (opt.scores[k] || 0); });

  setTimeout(() => {
    current++;
    if (current < questions.length) {
      loadQuestion();
    } else {
      finishQuiz();
    }
  }, 420);
}

// ── FINISH ─────────────────────────────────────────
function finishQuiz() {
  showScreen('s-transition');
  setTimeout(showResult, 1600);
}

// ── RESULT ─────────────────────────────────────────
function showResult() {
  // Find winner
  const winner = KEYS.reduce((a, b) => totals[a] >= totals[b] ? a : b);
  const p = personalities[winner];

  // Populate
  $('resultSymbol').textContent  = p.emoji;
  $('resultType').textContent    = p.type;
  $('resultTagline').textContent = p.tagline;
  $('resultDesc').textContent    = p.description;

  const strengthsList = $('resultStrengths');
  strengthsList.innerHTML = '';
  p.strengths.forEach(s => {
    const li = document.createElement('li');
    li.textContent = s;
    strengthsList.appendChild(li);
  });

  $('resultBlindspot').textContent  = p.blind_spot;
  $('resultResonates').textContent  = p.resonates_with;

  // Score bars
  const barsWrap = $('resultBars');
  const total    = Object.values(totals).reduce((a, b) => a + b, 0) || 1;
  barsWrap.innerHTML = `<div class="bar-label-row">Score Breakdown</div>`;

  const typeNames = { A:'The Architect', B:'The Catalyst', C:'The Sage', D:'The Wanderer' };

  KEYS.forEach(k => {
    const pct = Math.round((totals[k] / total) * 100);
    const isTop = k === winner;
    const item = document.createElement('div');
    item.className = 'bar-item';
    item.innerHTML = `
      <span class="bar-name">${typeNames[k]}</span>
      <div class="bar-track">
        <div class="bar-fill${isTop ? ' top' : ''}" data-pct="${pct}"></div>
      </div>
      <span class="bar-pct">${pct}%</span>
    `;
    barsWrap.appendChild(item);
  });

  showScreen('s-result');

  // Animate bars after a tick
  setTimeout(() => {
    document.querySelectorAll('.bar-fill').forEach(el => {
      el.style.width = el.dataset.pct + '%';
    });
  }, 80);
}

// ── RETAKE ─────────────────────────────────────────
function retake() {
  current = 0;
  totals  = { A:0, B:0, C:0, D:0 };
  buildStepDots();
  showScreen('s-intro');
}

// ── COPY RESULT ────────────────────────────────────
function copyResult() {
  const winner = KEYS.reduce((a, b) => totals[a] >= totals[b] ? a : b);
  const p      = personalities[winner];
  const text   = `✦ PERSONA Result\n${p.emoji} ${p.type}\n"${p.tagline}"\n\nStrengths: ${p.strengths.join(', ')}`;
  navigator.clipboard.writeText(text).then(() => {
    const btn = $('btnCopy');
    const orig = btn.textContent;
    btn.textContent = 'Copied!';
    setTimeout(() => btn.textContent = orig, 2000);
  }).catch(() => alert('Copy not available in this browser.'));
}

// ── INIT ───────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  buildStepDots();
  $('btnBegin').addEventListener('click', () => {
    showScreen('s-question');
    loadQuestion();
  });
  $('btnRetake').addEventListener('click', retake);
  $('btnCopy').addEventListener('click', copyResult);
});
