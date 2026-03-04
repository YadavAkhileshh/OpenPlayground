
















(function spawnParticles() {
  const colors = ['#00e5ff', '#00ff88', '#bf5aff', '#ffd60a', '#ff2d55'];
  const container = document.getElementById('particles');
  for (let i = 0; i < 30; i++) {
    const el = document.createElement('div');
    el.className = 'particle';
    el.style.cssText = `
      left: ${Math.random() * 100}%;
      --dur: ${6 + Math.random() * 10}s;
      --delay: ${Math.random() * 8}s;
      --drift: ${(Math.random() - 0.5) * 80}px;
      background: ${colors[i % colors.length]};
    `;
    container.appendChild(el);
  }
})();

// ── TAB SWITCHING ──
function showTab(name, btn) {
  document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
  document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
  document.getElementById('view-' + name).classList.add('active');
  btn.classList.add('active');
}

// ══════════════════════════════════════
//  QUIZ DATA — 22 Questions
// ══════════════════════════════════════
const allQuestions = [
  // REACTIONS
  {
    cat: 'reactions', catClass: 'cat-reactions',
    q: 'Which type of reaction combines two or more substances into one product?',
    opts: ['Decomposition', 'Synthesis', 'Combustion', 'Double Replacement'], ans: 1,
    exp: 'Synthesis: A + B → AB. Two reactants combine into a single product. E.g. 2H₂ + O₂ → 2H₂O'
  },
  {
    cat: 'reactions', catClass: 'cat-reactions',
    q: 'What are the products of COMPLETE combustion of a hydrocarbon?',
    opts: ['CO + H₂', 'CO₂ + H₂O', 'C + H₂O', 'CO₂ + H₂'], ans: 1,
    exp: 'Complete combustion always produces CO₂ and H₂O. Example: CH₄ + 2O₂ → CO₂ + 2H₂O'
  },
  {
    cat: 'reactions', catClass: 'cat-reactions',
    q: 'In a neutralization reaction, an acid + base produce:',
    opts: ['An oxide and water', 'Salt and water', 'Two acids', 'A metal and gas'], ans: 1,
    exp: 'HCl + NaOH → NaCl + H₂O. The salt and water are always produced in acid-base neutralization.'
  },
  {
    cat: 'reactions', catClass: 'cat-reactions',
    q: 'The rusting of iron (Fe + O₂ → Fe₂O₃) is an example of:',
    opts: ['Decomposition', 'Combustion', 'Synthesis / Oxidation', 'Double Replacement'], ans: 2,
    exp: 'Rust is an oxidation-synthesis reaction: iron combines with oxygen to form iron(III) oxide slowly over time.'
  },
  {
    cat: 'reactions', catClass: 'cat-reactions',
    q: 'Which reaction type is the REVERSE of synthesis?',
    opts: ['Combustion', 'Single Replacement', 'Decomposition', 'Oxidation'], ans: 2,
    exp: 'Decomposition: AB → A + B. Exactly the reverse of synthesis. Example: 2H₂O → 2H₂ + O₂'
  },

  // ELEMENTS
  {
    cat: 'elements', catClass: 'cat-elements',
    q: 'Which element has the HIGHEST electronegativity?',
    opts: ['Oxygen', 'Chlorine', 'Fluorine', 'Nitrogen'], ans: 2,
    exp: 'Fluorine has electronegativity 3.98 (Pauling scale) — the highest of all elements. It attracts electrons most strongly.'
  },
  {
    cat: 'elements', catClass: 'cat-elements',
    q: 'Most abundant element in Earth\'s crust?',
    opts: ['Silicon', 'Iron', 'Aluminum', 'Oxygen'], ans: 3,
    exp: 'Oxygen makes up ~46% of Earth\'s crust by mass, mostly in silicate minerals.'
  },
  {
    cat: 'elements', catClass: 'cat-elements',
    q: 'Which non-metal element is LIQUID at room temperature?',
    opts: ['Bromine', 'Iodine', 'Chlorine', 'Phosphorus'], ans: 0,
    exp: 'Bromine (Br) is the only non-metallic element liquid at 25°C. Mercury is the only liquid metal.'
  },
  {
    cat: 'elements', catClass: 'cat-elements',
    q: 'The element with atomic number 79 is:',
    opts: ['Silver (Ag)', 'Platinum (Pt)', 'Gold (Au)', 'Copper (Cu)'], ans: 2,
    exp: 'Gold (Au, from Latin "Aurum") has atomic number 79. Known for its rarity and chemical stability.'
  },
  {
    cat: 'elements', catClass: 'cat-elements',
    q: 'Which gas is known as "laughing gas"?',
    opts: ['NO', 'N₂O', 'NO₂', 'NH₃'], ans: 1,
    exp: 'Nitrous oxide (N₂O) induces euphoria and laughter. Also used as an anesthetic in dentistry.'
  },

  // BONDING
  {
    cat: 'bonding', catClass: 'cat-bonding',
    q: 'A bond formed by SHARING electrons between atoms is called:',
    opts: ['Ionic bond', 'Metallic bond', 'Covalent bond', 'Hydrogen bond'], ans: 2,
    exp: 'Covalent bonds form when atoms share electron pairs. H₂, O₂, H₂O are all covalently bonded.'
  },
  {
    cat: 'bonding', catClass: 'cat-bonding',
    q: 'Which molecule has a BENT / V-shape geometry?',
    opts: ['CO₂', 'BF₃', 'H₂O', 'CH₄'], ans: 2,
    exp: 'Water (H₂O) is bent (104.5°) due to 2 bonding pairs + 2 lone pairs. Lone pairs repel more, bending the molecule.'
  },
  {
    cat: 'bonding', catClass: 'cat-bonding',
    q: 'How many covalent bonds does carbon typically form?',
    opts: ['2', '3', '4', '6'], ans: 2,
    exp: 'Carbon has 4 valence electrons → forms 4 bonds (tetravalent). This allows chains, rings, and complex organic molecules.'
  },
  {
    cat: 'bonding', catClass: 'cat-bonding',
    q: 'Which intermolecular force gives water its unusually high boiling point?',
    opts: ['London dispersion', 'Dipole-dipole', 'Hydrogen bonding', 'Ionic attraction'], ans: 2,
    exp: 'Strong hydrogen bonds between H₂O molecules give water a boiling point of 100°C — far higher than similar molecules.'
  },

  // ACIDS & BASES
  {
    cat: 'acids', catClass: 'cat-acids',
    q: 'Arrhenius defined an acid as a substance that:',
    opts: ['Donates a proton', 'Accepts electrons', 'Produces H⁺ in water', 'Produces OH⁻ ions'], ans: 2,
    exp: 'Arrhenius: acids produce H⁺ when dissolved in water. Example: HCl → H⁺ + Cl⁻'
  },
  {
    cat: 'acids', catClass: 'cat-acids',
    q: 'What is the pH of pure water at 25°C?',
    opts: ['6', '7', '8', '0'], ans: 1,
    exp: 'Pure water pH = 7 at 25°C. [H⁺] = [OH⁻] = 1×10⁻⁷ mol/L — perfectly neutral.'
  },
  {
    cat: 'acids', catClass: 'cat-acids',
    q: 'Which of these is a STRONG acid?',
    opts: ['Acetic acid (CH₃COOH)', 'Carbonic acid (H₂CO₃)', 'Hydrochloric acid (HCl)', 'Phosphoric acid'], ans: 2,
    exp: 'HCl fully dissociates: HCl → H⁺ + Cl⁻. The others are weak acids that only partially dissociate.'
  },

  // ORGANIC
  {
    cat: 'organic', catClass: 'cat-organic',
    q: 'What functional group is present in ALCOHOLS?',
    opts: ['–COOH', '–OH', '–NH₂', '–CHO'], ans: 1,
    exp: 'Alcohols contain the hydroxyl group (–OH). Examples: methanol CH₃OH, ethanol C₂H₅OH.'
  },
  {
    cat: 'organic', catClass: 'cat-organic',
    q: 'Isomers are molecules that have:',
    opts: ['Same formula, same structure', 'Different formula, same properties', 'Same molecular formula, different structure', 'Different molecular mass'], ans: 2,
    exp: 'Isomers: same molecular formula, different structural arrangement. E.g. butane & isobutane are both C₄H₁₀.'
  },

  // THERMOCHEMISTRY
  {
    cat: 'thermo', catClass: 'cat-thermo',
    q: 'An EXOTHERMIC reaction:',
    opts: ['Absorbs heat from surroundings', 'Has ΔH > 0', 'Releases heat to surroundings', 'Requires constant energy'], ans: 2,
    exp: 'Exothermic reactions release energy (ΔH < 0). Examples: combustion, respiration, neutralization.'
  },
  {
    cat: 'thermo', catClass: 'cat-thermo',
    q: 'A negative ΔG (Gibbs free energy) indicates:',
    opts: ['Non-spontaneous reaction', 'Spontaneous reaction', 'Endothermic only', 'No reaction'], ans: 1,
    exp: 'ΔG < 0 means spontaneous — the reaction proceeds without continuous energy input. ΔG = ΔH - TΔS'
  },
  {
    cat: 'thermo', catClass: 'cat-thermo',
    q: 'Le Chatelier\'s Principle states that a system at equilibrium:',
    opts: ['Stops reacting', 'Shifts to minimize any imposed change', 'Always favors products', 'Increases temperature'], ans: 1,
    exp: 'If stress (T, P, concentration) is applied to an equilibrium system, it shifts to counteract the change and restore balance.'
  },
];

// ══════════════════════════════════════
//  QUIZ LOGIC
// ══════════════════════════════════════
let questions = [], qIdx = 0, score = 0, streak = 0, bestStreak = 0, correctCount = 0;
let timerInterval;

function shuffleArr(arr) {
  return arr.sort(() => Math.random() - 0.5);
}

function restartQuiz() {
  questions = shuffleArr([...allQuestions]).slice(0, 20);
  qIdx = 0; score = 0; streak = 0; bestStreak = 0; correctCount = 0;
  document.getElementById('score-val').textContent = '0';
  document.getElementById('streak-val').textContent = '0';
  document.getElementById('level-val').textContent = 'I';
  document.getElementById('final-screen').classList.remove('show');
  document.getElementById('quiz-area').style.display = 'block';
  loadQuestion();
}

function loadQuestion() {
  clearInterval(timerInterval);
  const q = questions[qIdx];

  // Progress
  document.getElementById('q-num').textContent = qIdx + 1;
  document.getElementById('q-total').textContent = questions.length;
  document.getElementById('progress-fill').style.width = ((qIdx / questions.length) * 100 + 5) + '%';

  // Category
  const catEl = document.getElementById('q-category');
  catEl.textContent = q.cat.toUpperCase();
  catEl.className = 'q-category ' + q.catClass;

  // Question
  document.getElementById('question-text').textContent = q.q;

  // Options
  const grid = document.getElementById('options-grid');
  grid.innerHTML = '';
  ['A', 'B', 'C', 'D'].forEach((label, i) => {
    const btn = document.createElement('button');
    btn.className = 'option-btn';
    btn.innerHTML = `<span class="opt-label">${label}</span>${q.opts[i]}`;
    btn.addEventListener('click', () => answer(i, q.ans, q.exp));
    grid.appendChild(btn);
  });

  // Reset result & next btn
  const rb = document.getElementById('result-box');
  rb.className = 'result-box';
  rb.innerHTML = '';
  document.getElementById('next-btn').style.display = 'none';

  // Start timer
  let timeLeft = 30;
  document.getElementById('timer').textContent = timeLeft;
  timerInterval = setInterval(() => {
    timeLeft--;
    document.getElementById('timer').textContent = timeLeft;
    if (timeLeft <= 0) {
      clearInterval(timerInterval);
      answer(-1, q.ans, q.exp, true);
    }
  }, 1000);
}

function answer(chosen, correct, explanation, timedOut = false) {
  clearInterval(timerInterval);

  const btns = document.querySelectorAll('.option-btn');
  btns.forEach((btn, i) => {
    btn.disabled = true;
    if (i === correct) btn.classList.add('correct');
    else if (i === chosen) btn.classList.add('wrong');
  });

  const rb = document.getElementById('result-box');
  const isCorrect = chosen === correct && !timedOut;

  if (timedOut) {
    rb.className = 'result-box wrong-result show';
    rb.innerHTML = `<div class="verdict">⏰ TIME'S UP!</div>
      <span style="color:var(--yellow)">Correct: ${questions[qIdx].opts[correct]}</span><br/>${explanation}`;
    streak = 0;
  } else if (isCorrect) {
    const pts = 10 + streak * 2;
    score += pts;
    correctCount++;
    streak++;
    if (streak > bestStreak) bestStreak = streak;
    rb.className = 'result-box correct-result show';
    rb.innerHTML = `<div class="verdict">✅ CORRECT! +${pts} pts</div>${explanation}`;
    spawnSparks();
  } else {
    rb.className = 'result-box wrong-result show';
    rb.innerHTML = `<div class="verdict">❌ WRONG</div>
      <span style="color:var(--yellow)">Correct: ${questions[qIdx].opts[correct]}</span><br/>${explanation}`;
    streak = 0;
  }

  // Update header stats
  document.getElementById('score-val').textContent = score;
  document.getElementById('streak-val').textContent = streak;
  const level = score < 50 ? 'I' : score < 120 ? 'II' : score < 220 ? 'III' : score < 350 ? 'IV' : 'V';
  document.getElementById('level-val').textContent = level;

  document.getElementById('next-btn').style.display = 'block';
}

function nextQuestion() {
  qIdx++;
  if (qIdx >= questions.length) showFinal();
  else loadQuestion();
}

function showFinal() {
  document.getElementById('quiz-area').style.display = 'none';
  const fs = document.getElementById('final-screen');
  fs.classList.add('show');

  document.getElementById('f-score').textContent = score;
  document.getElementById('f-correct').textContent = correctCount + '/' + questions.length;
  document.getElementById('f-streak').textContent = bestStreak;

  const pct = Math.round((correctCount / questions.length) * 100);
  const grades = [
    [90, 'S', '🧬', 'Legendary Chemist! Nobel Prize awaits!', '#00ff88'],
    [75, 'A', '🏆', 'Excellent! You really know your chemistry!', '#00e5ff'],
    [60, 'B', '⚗', 'Good job! A few more experiments needed.', '#ffd60a'],
    [45, 'C', '🧪', 'Not bad — keep studying the reactions!', '#ff6b2b'],
    [0,  'D', '💀', 'Back to the lab! Chemistry awaits you!', '#ff2d55'],
  ];

  const [, grade, icon, msg, color] = grades.find(([t]) => pct >= t);
  document.getElementById('trophy-icon').textContent = icon;
  document.getElementById('final-grade').textContent = grade;
  document.getElementById('final-grade').style.color = color;
  document.getElementById('final-grade').style.textShadow = `0 0 20px ${color}`;
  document.getElementById('final-msg').textContent = msg;
}

function spawnSparks() {
  const card = document.querySelector('.question-card');
  const colors = ['#00ff88', '#00e5ff', '#ffd60a'];
  for (let i = 0; i < 10; i++) {
    const s = document.createElement('div');
    s.style.cssText = `
      position:absolute; width:4px; height:4px; border-radius:50%;
      background:${colors[i % 3]};
      left:${50 + Math.cos(i / 10 * Math.PI * 2) * 20}%;
      top:50%;
      animation: spark 0.9s ${i * 0.05}s ease both;
      --tx:${(Math.random() - 0.5) * 200}px;
      --ty:${(Math.random() - 0.5) * 180}px;
    `;
    card.appendChild(s);
    setTimeout(() => s.remove(), 1000);
  }
}

// Inject spark keyframe
const style = document.createElement('style');
style.textContent = `@keyframes spark {
  0%  { transform: scale(0); opacity: 1; }
  100%{ transform: translate(var(--tx), var(--ty)) scale(0); opacity: 0; }
}`;
document.head.appendChild(style);

// ══════════════════════════════════════
//  REACTIONS DATA
// ══════════════════════════════════════
const reactions = [
  {
    name: 'Water Formation',
    eq: '2H₂ + O₂ → 2H₂O', type: 'Synthesis 🔵', color: 'var(--cyan)',
    desc: 'Two hydrogen molecules + one oxygen → two water molecules. Releases enormous energy — used in rocket engines!'
  },
  {
    name: 'Rusting of Iron',
    eq: '4Fe + 3O₂ → 2Fe₂O₃', type: 'Oxidation 🟠', color: 'var(--orange)',
    desc: 'Iron reacts slowly with oxygen in moisture to form iron(III) oxide. Costs billions annually in infrastructure damage.'
  },
  {
    name: 'Photosynthesis',
    eq: '6CO₂ + 6H₂O → C₆H₁₂O₆ + 6O₂', type: 'Biochemical 🟢', color: 'var(--green)',
    desc: 'Plants convert CO₂ and water into glucose and oxygen using sunlight. The foundation of almost all life on Earth!'
  },
  {
    name: 'Cellular Respiration',
    eq: 'C₆H₁₂O₆ + 6O₂ → 6CO₂ + 6H₂O + ATP', type: 'Biochemical 🟢', color: 'var(--green)',
    desc: 'Cells break down glucose with oxygen to release energy (ATP). Reverse of photosynthesis — happening in your body right now!'
  },
  {
    name: 'Acid-Base Neutralization',
    eq: 'HCl + NaOH → NaCl + H₂O', type: 'Acid-Base 🔴', color: 'var(--pink)',
    desc: 'Strong acid + strong base neutralize perfectly to form table salt and water. The reaction is exothermic!'
  },
  {
    name: 'Haber Process (NH₃)',
    eq: 'N₂ + 3H₂ ⇌ 2NH₃', type: 'Industrial ⚡', color: 'var(--yellow)',
    desc: 'Ammonia synthesis at high pressure + temperature with iron catalyst. Produces fertilizer for ~50% of the world\'s food!'
  },
  {
    name: 'Thermite Reaction',
    eq: '2Al + Fe₂O₃ → Al₂O₃ + 2Fe', type: 'Single Replacement 🔥', color: 'var(--orange)',
    desc: 'Aluminum displaces iron at 2500°C — hot enough to melt steel. Used in welding railway tracks. Cannot be stopped by water!'
  },
  {
    name: 'Baking Soda + Vinegar',
    eq: 'NaHCO₃ + CH₃COOH → CO₂↑ + H₂O + NaCH₃COO', type: 'Double Replacement 💜', color: 'var(--purple)',
    desc: 'Classic volcano experiment! Base + acid produce CO₂ bubbles, water, and sodium acetate. A beautiful double displacement reaction.'
  },
  {
    name: 'Electrolysis of Water',
    eq: '2H₂O → 2H₂↑ + O₂↑', type: 'Decomposition ⚡', color: 'var(--cyan)',
    desc: 'Electric current splits water into H₂ and O₂ gases at 2:1 ratio. Key technology for clean hydrogen fuel production!'
  },
  {
    name: 'Combustion of Methane',
    eq: 'CH₄ + 2O₂ → CO₂ + 2H₂O', type: 'Combustion 🔥', color: 'var(--orange)',
    desc: 'Natural gas burns with oxygen. Powers most home stoves and furnaces. Releases ~890 kJ per mole of methane.'
  },
];

function initReactions() {
  const grid = document.getElementById('rxn-grid');
  reactions.forEach((r, i) => {
    const btn = document.createElement('button');
    btn.className = 'rxn-pick';
    btn.textContent = r.name;
    btn.addEventListener('click', () => {
      document.querySelectorAll('.rxn-pick').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      showReaction(r);
    });
    grid.appendChild(btn);
  });
}

function showReaction(r) {
  const eq = document.getElementById('rxn-equation');
  eq.textContent = r.eq;
  eq.style.color = r.color;
  eq.style.textShadow = `0 0 15px ${r.color}`;
  document.getElementById('rxn-type').textContent = r.type;
  const desc = document.getElementById('rxn-desc');
  desc.className = 'rxn-desc show';
  desc.innerHTML = `<strong style="color:${r.color}">${r.name}</strong><br/>${r.desc}`;
}

// ══════════════════════════════════════
//  LAB TOOLS
// ══════════════════════════════════════

// Atomic masses lookup table
const ATOMIC_MASSES = {
  H:1.008,He:4.003,Li:6.941,Be:9.012,B:10.81,C:12.011,N:14.007,O:15.999,
  F:18.998,Ne:20.18,Na:22.99,Mg:24.305,Al:26.982,Si:28.086,P:30.974,
  S:32.06,Cl:35.45,Ar:39.948,K:39.098,Ca:40.078,Fe:55.845,Cu:63.546,
  Zn:65.38,Br:79.904,Kr:83.798,Ag:107.868,I:126.904,Au:196.967,Pb:207.2,
  Hg:200.59,Mn:54.938,Ni:58.693,Co:58.933,Cr:51.996,Ba:137.327,
  Sn:118.71,Ti:47.867,V:50.942,W:183.84,U:238.029,Pt:195.084,
};

function parseFormula(formula) {
  const regex = /([A-Z][a-z]?)(\d*)/g;
  const elems = {};
  let m;
  while ((m = regex.exec(formula)) !== null) {
    if (m[1]) elems[m[1]] = (elems[m[1]] || 0) + parseInt(m[2] || 1);
  }
  return elems;
}

function calcMolarMass() {
  const formula = document.getElementById('mm-input').value.trim();
  const res = document.getElementById('mm-result');
  if (!formula) {
    res.innerHTML = '<span class="dim-text">Type a formula above to calculate...</span>';
    return;
  }
  const elems = parseFormula(formula);
  let total = 0;
  let rows = '';
  for (const [el, cnt] of Object.entries(elems)) {
    const mass = ATOMIC_MASSES[el];
    if (!mass) {
      res.style.color = 'var(--pink)';
      res.innerHTML = `Unknown element: <strong>${el}</strong>`;
      return;
    }
    const sub = mass * cnt;
    total += sub;
    rows += `<tr><td>${el}</td><td>×${cnt}</td><td>${mass.toFixed(3)}</td><td>${sub.toFixed(3)}</td></tr>`;
  }
  res.style.color = 'var(--green)';
  res.innerHTML = `
    <table class="mm-table">
      <tr style="color:var(--dim);font-size:.6rem;letter-spacing:1px;">
        <td>ELEM</td><td>COUNT</td><td>MASS</td><td>SUBTOTAL</td>
      </tr>
      ${rows}
      <tr style="border-top:1px solid rgba(0,229,255,.3);font-weight:bold;">
        <td colspan="3" style="color:var(--cyan);">MOLAR MASS</td>
        <td>${total.toFixed(3)} g/mol</td>
      </tr>
    </table>`;
}

function calcPH() {
  const h = parseFloat(document.getElementById('ph-input').value);
  const res = document.getElementById('ph-result');
  res.className = 'tool-result show';
  if (isNaN(h) || h <= 0) {
    res.style.color = 'var(--pink)';
    res.textContent = 'Please enter a valid positive concentration.';
    return;
  }
  const ph = -Math.log10(h);
  const pct = Math.max(0, Math.min(100, (ph / 14) * 100));
  document.getElementById('ph-marker').style.left = pct + '%';

  let label, color;
  if      (ph < 3)  { label = 'STRONGLY ACIDIC'; color = 'var(--pink)';   }
  else if (ph < 7)  { label = 'WEAKLY ACIDIC';   color = 'var(--orange)'; }
  else if (ph === 7){ label = 'NEUTRAL';          color = 'var(--green)';  }
  else if (ph < 11) { label = 'WEAKLY BASIC';    color = 'var(--cyan)';   }
  else              { label = 'STRONGLY BASIC';   color = 'var(--purple)'; }

  res.style.color = color;
  res.innerHTML = `
    <span style="font-family:var(--font-head);font-size:1.3rem;">pH = ${ph.toFixed(3)}</span><br/>
    <span style="font-size:.7rem;letter-spacing:2px;">${label}</span><br/>
    <span style="color:var(--dim);font-size:.72rem;">pOH = ${(14 - ph).toFixed(3)} | [OH⁻] = ${(1e-14 / h).toExponential(3)} mol/L</span>
  `;
}

const R = 0.08206; // L·atm/(mol·K)

function calcGas() {
  const solve = document.getElementById('gas-solve').value;
  const P = parseFloat(document.getElementById('gas-P').value);
  const V = parseFloat(document.getElementById('gas-V').value);
  const n = parseFloat(document.getElementById('gas-n').value);
  const T = parseFloat(document.getElementById('gas-T').value);
  const res = document.getElementById('gas-result');
  res.className = 'tool-result show';
  try {
    let result;
    if      (solve === 'P') result = `P = nRT/V = ${((n * R * T) / V).toFixed(4)} atm`;
    else if (solve === 'V') result = `V = nRT/P = ${((n * R * T) / P).toFixed(4)} L`;
    else if (solve === 'n') result = `n = PV/RT = ${((P * V) / (R * T)).toFixed(4)} mol`;
    else                    result = `T = PV/nR = ${((P * V) / (n * R)).toFixed(4)} K`;
    res.style.color = 'var(--green)';
    res.innerHTML = `<span style="font-family:var(--font-head);font-size:1rem;">${result}</span>
      <br/><span style="color:var(--dim);font-size:.7rem;">R = 0.08206 L·atm/(mol·K)</span>`;
  } catch {
    res.style.color = 'var(--pink)';
    res.textContent = 'Fill in all values except the one you are solving for.';
  }
}

function calcDilution() {
  const solve = document.getElementById('dil-solve').value;
  const C1 = parseFloat(document.getElementById('dil-C1').value);
  const V1 = parseFloat(document.getElementById('dil-V1').value);
  const C2 = parseFloat(document.getElementById('dil-C2').value);
  const V2 = parseFloat(document.getElementById('dil-V2').value);
  const res = document.getElementById('dil-result');
  res.className = 'tool-result show';
  try {
    let result;
    if      (solve === 'C2') result = `C₂ = C₁V₁/V₂ = ${((C1 * V1) / V2).toFixed(4)} M`;
    else if (solve === 'V2') result = `V₂ = C₁V₁/C₂ = ${((C1 * V1) / C2).toFixed(4)} mL`;
    else if (solve === 'C1') result = `C₁ = C₂V₂/V₁ = ${((C2 * V2) / V1).toFixed(4)} M`;
    else                     result = `V₁ = C₂V₂/C₁ = ${((C2 * V2) / C1).toFixed(4)} mL`;
    res.style.color = 'var(--green)';
    res.innerHTML = `<span style="font-family:var(--font-head);font-size:1rem;">${result}</span>`;
  } catch {
    res.style.color = 'var(--pink)';
    res.textContent = 'Fill in all values except the one you are solving for.';
  }
}

// ══════════════════════════════════════
//  CHEMISTRY FACTS
// ══════════════════════════════════════
const factsData = [
  {
    icon:'💎', tag:'Carbon', tagClass:'cat-organic', color:'var(--purple)',
    title:'Diamond vs Graphite',
    text:'Both are pure carbon — yet diamond is the hardest natural material while graphite leaves marks on paper. The difference is entirely how carbon atoms are bonded and arranged in 3D space.'
  },
  {
    icon:'🌊', tag:'Water', tagClass:'cat-bonding', color:'var(--cyan)',
    title:'Water Expands When Frozen',
    text:'Unlike most substances, ice is LESS dense than liquid water. Hydrogen bonds form a hexagonal lattice with more space. This anomaly means ice floats — making underwater life in lakes possible!'
  },
  {
    icon:'☢', tag:'Radioactivity', tagClass:'cat-thermo', color:'var(--yellow)',
    title:'Radioactive Bananas',
    text:'Bananas contain potassium-40, a naturally radioactive isotope. Scientists use the "Banana Equivalent Dose" (BED) unit of radiation. A chest X-ray ≈ 70 bananas. Totally harmless!'
  },
  {
    icon:'🔥', tag:'Thermite', tagClass:'cat-reactions', color:'var(--orange)',
    title:'The Unstoppable Reaction',
    text:'Once started, the thermite reaction reaches ~2500°C and cannot be stopped — not even by water. Water on thermite vaporizes explosively, making it even more dangerous.'
  },
  {
    icon:'💉', tag:'pH', tagClass:'cat-acids', color:'var(--pink)',
    title:'Blood pH is Tightly Controlled',
    text:'Human blood must stay between pH 7.35–7.45. Even a drop to 7.0 can be fatal. Your body uses bicarbonate, phosphate, and protein buffer systems 24/7 to maintain this narrow range.'
  },
  {
    icon:'⚡', tag:'Reactions', tagClass:'cat-reactions', color:'var(--green)',
    title:'Fastest Chemical Reaction',
    text:'Proton transfer in acid-base reactions can occur in femtoseconds (10⁻¹⁵ s) — faster than light travels the width of a human hair. Among the fastest known molecular events.'
  },
  {
    icon:'🧬', tag:'Organic', tagClass:'cat-organic', color:'var(--purple)',
    title:'Carbon: The Element of Life',
    text:'Carbon forms over 10 million compounds — more than all other elements combined. Its ability to bond to itself in chains, rings, and branches is the foundation of all organic chemistry and life itself.'
  },
  {
    icon:'🌈', tag:'Spectroscopy', tagClass:'cat-elements', color:'var(--yellow)',
    title:'Identify Elements by Light',
    text:'Every element emits a unique spectrum when heated — a chemical fingerprint. By analyzing starlight, astronomers determine what elements exist in stars millions of light-years away!'
  },
  {
    icon:'🫧', tag:'Soap', tagClass:'cat-bonding', color:'var(--green)',
    title:'How Soap Actually Works',
    text:'Soap molecules have a water-loving head and a grease-loving tail. Tails surround grease; heads face water. This forms micelles that rinse away with water. Brilliant molecular engineering!'
  },
  {
    icon:'💊', tag:'Chirality', tagClass:'cat-organic', color:'var(--purple)',
    title:'Mirror Image Molecules',
    text:'Two molecules can have the same formula but be non-superimposable mirror images (like hands). One form of Thalidomide cured morning sickness; its mirror image caused birth defects. Chirality matters enormously.'
  },
  {
    icon:'🌡', tag:'Noble Gases', tagClass:'cat-elements', color:'var(--cyan)',
    title:'Noble Gases Were "Impossible"',
    text:'Before 1962, chemists believed noble gases formed ZERO compounds. Neil Bartlett shattered this by creating XePtF₆. Now hundreds of noble gas compounds are known!'
  },
  {
    icon:'🧲', tag:'Electrons', tagClass:'cat-bonding', color:'var(--cyan)',
    title:'Electrons Don\'t Move Fast',
    text:'Electrons in a wire actually drift incredibly slowly (~mm/sec). But the electric field pushing them travels near light speed. That\'s why your lights turn on instantly.'
  },
];

function initFacts() {
  const grid = document.getElementById('facts-grid');
  factsData.forEach((f, i) => {
    const card = document.createElement('div');
    card.className = 'fact-card';
    card.style.cssText = `--card-color:${f.color}; animation-delay:${i * 0.07}s`;
    card.innerHTML = `
      <span class="fact-icon">${f.icon}</span>
      <span class="fact-tag ${f.tagClass}">${f.tag}</span>
      <h3>${f.title}</h3>
      <p>${f.text}</p>
    `;
    grid.appendChild(card);
  });
}

// ══════════════════════════════════════
//  INITIALISE APP
// ══════════════════════════════════════
restartQuiz();
initReactions();
initFacts();
