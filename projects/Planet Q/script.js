
const PLANETS = [
  {
    id:"mercury", name:"Mercury", emoji:"☿", order:1,
    questions:[
      { q:"Mercury is the closest planet to the Sun. How long does it take Mercury to orbit the Sun?", options:["88 Earth days","365 Earth days","12 Earth years","27 Earth days"], answer:0, explain:"Mercury zips around the Sun in just 88 Earth days — that's its year! It's the fastest planet." },
      { q:"Mercury has extreme temperature swings. How hot can its surface get?", options:["100°C","430°C","200°C","600°C"], answer:1, explain:"Mercury's surface can reach 430°C during the day, then plunge to -180°C at night. No atmosphere to trap heat!" },
      { q:"Which spacecraft was the FIRST to visit Mercury?", options:["Cassini","Voyager 1","Mariner 10","New Horizons"], answer:2, explain:"Mariner 10 flew past Mercury in 1974 and 1975, giving us our first close-up pictures." },
      { q:"Mercury is the smallest planet. How does its size compare to Earth?", options:["Half Earth's size","About 38% of Earth's diameter","Same size as Earth","Twice Earth's size"], answer:1, explain:"Mercury is only about 38% of Earth's diameter. You could fit Mercury inside Earth about 18 times!" }
    ],
    facts:[
      { icon:"🌡️", text:"Mercury has the most extreme temperature swings of any planet — from 430°C in sunlight to -180°C in darkness." },
      { icon:"🕒", text:"A day on Mercury lasts 59 Earth days, but a Mercury year is only 88 Earth days!" },
      { icon:"🌑", text:"Mercury looks a lot like our Moon — covered in craters with no atmosphere and no moons of its own." },
      { icon:"🔭", text:"Despite being closest to the Sun, Venus is actually hotter than Mercury." }
    ]
  },
  {
    id:"venus", name:"Venus", emoji:"♀️", order:2,
    questions:[
      { q:"Venus is the hottest planet. Why is it hotter than Mercury even though it's farther from the Sun?", options:["It has two suns","Its thick atmosphere traps heat (greenhouse effect)","It's made of fire","It rotates faster"], answer:1, explain:"Venus has a thick atmosphere of CO₂ that traps heat like a blanket — a runaway greenhouse effect!" },
      { q:"Venus spins in the opposite direction to most planets. What does this mean?", options:["It has no poles","The Sun rises in the west on Venus","It has reversed gravity","It moves backwards in orbit"], answer:1, explain:"Venus rotates 'retrograde' — backwards! So the Sun rises in the west and sets in the east there." },
      { q:"How long is a DAY on Venus compared to a year on Venus?", options:["A day is shorter than a year","A day is longer than a year","They are exactly the same","Venus has no days"], answer:1, explain:"A Venus day (243 Earth days) is longer than its year (225 Earth days). Wild!" },
      { q:"Venus is often called Earth's 'twin.' Why?", options:["They have the same moons","Similar size and mass","Same temperature","Both have life"], answer:1, explain:"Venus and Earth are nearly the same size and mass — but Venus is an extreme world with crushing pressure." }
    ],
    facts:[
      { icon:"🔥", text:"Venus is the hottest planet at 465°C — hot enough to melt lead!" },
      { icon:"🌪️", text:"Winds at the top of Venus's clouds reach 360 km/h and circle the whole planet in just 4 days." },
      { icon:"☁️", text:"Venus is covered in thick yellow clouds made of sulfuric acid." },
      { icon:"🤩", text:"Venus is the brightest object in our sky after the Sun and Moon — it's often called the 'Morning Star.'" }
    ]
  },
  {
    id:"earth", name:"Earth", emoji:"🌍", order:3,
    questions:[
      { q:"What percentage of Earth's surface is covered by water?", options:["50%","60%","71%","90%"], answer:2, explain:"About 71% of Earth's surface is water! That's why Earth looks blue from space — the 'Blue Marble.'" },
      { q:"What protects Earth from harmful solar radiation?", options:["The Moon","The Ozone Layer","Clouds","Mountains"], answer:1, explain:"The ozone layer in our atmosphere filters out dangerous ultraviolet (UV) radiation from the Sun." },
      { q:"How old is planet Earth?", options:["4.5 thousand years","4.5 million years","4.5 billion years","45 billion years"], answer:2, explain:"Earth formed about 4.5 billion years ago from a cloud of gas and dust around our young Sun." },
      { q:"Earth is the only known planet with plate tectonics. What does that mean?", options:["Earth has metal plates","Earth's crust is broken into moving pieces","Earth has no crust","Earth is perfectly round"], answer:1, explain:"Earth's crust is broken into giant 'tectonic plates' that slowly drift — creating mountains, earthquakes, and volcanoes!" }
    ],
    facts:[
      { icon:"🧲", text:"Earth has a powerful magnetic field created by its molten iron core — it deflects harmful solar wind." },
      { icon:"🌙", text:"Earth's Moon is unusually large compared to our planet. It stabilizes Earth's tilt, giving us stable seasons." },
      { icon:"🌱", text:"Earth is the only planet in our solar system known to host life. So far!" },
      { icon:"⚡", text:"Around 100 lightning bolts strike Earth's surface every single second." }
    ]
  },
  {
    id:"mars", name:"Mars", emoji:"♂️", order:4,
    questions:[
      { q:"Why is Mars called the 'Red Planet'?", options:["It's on fire","Iron oxide (rust) on its surface","Red clouds cover it","Red sunsets only"], answer:1, explain:"Mars is red because its surface is covered in iron oxide — basically rust! The whole planet is rusty." },
      { q:"Mars has the tallest volcano in the solar system. What is it called?", options:["Mount Everest","Olympus Mons","Mauna Kea","Tharsis Ridge"], answer:1, explain:"Olympus Mons is about 22 km tall — nearly 3 times the height of Mount Everest!" },
      { q:"How many moons does Mars have?", options:["0","1","2","4"], answer:2, explain:"Mars has two small moons — Phobos and Deimos. They look more like captured asteroids than proper moons." },
      { q:"The Perseverance rover landed on Mars in 2021. What is it looking for?", options:["Gold","Signs of ancient microbial life","Water to drink","Alien cities"], answer:1, explain:"Perseverance is searching for signs of ancient life in Jezero Crater, which may have been a lake billions of years ago." }
    ],
    facts:[
      { icon:"🌀", text:"Mars has massive dust storms that can engulf the entire planet for months at a time." },
      { icon:"❄️", text:"Mars has polar ice caps made of frozen CO₂ (dry ice) and water ice." },
      { icon:"🤖", text:"More than 50 missions have been sent to Mars — more than any other planet!" },
      { icon:"⏱️", text:"A Martian day (sol) is 24 hours and 37 minutes — very close to an Earth day." }
    ]
  },
  {
    id:"jupiter", name:"Jupiter", emoji:"♃", order:5,
    questions:[
      { q:"Jupiter is the largest planet. How many Earths could fit inside Jupiter?", options:["10","100","1,300","5,000"], answer:2, explain:"About 1,300 Earths could fit inside Jupiter! It's SO massive it has more mass than all other planets combined." },
      { q:"Jupiter's Great Red Spot is famous. What is it?", options:["A giant volcano","A storm bigger than Earth","A red sea","A crater"], answer:1, explain:"The Great Red Spot is a storm that has been raging for at least 350 years — bigger than Earth itself!" },
      { q:"How many moons does Jupiter have?", options:["4","16","95+","200+"], answer:2, explain:"Jupiter has over 95 known moons! Its four largest — Io, Europa, Ganymede, Callisto — are called the Galilean moons." },
      { q:"Jupiter acts like a 'cosmic vacuum cleaner.' Why is that important for Earth?", options:["It cleans dust from space","Its gravity pulls in asteroids that might hit Earth","It creates our oxygen","It blocks the Sun"], answer:1, explain:"Jupiter's massive gravity captures many comets and asteroids — shielding the inner planets including Earth." }
    ],
    facts:[
      { icon:"💨", text:"Wind speeds on Jupiter reach up to 620 km/h — much faster than any hurricane on Earth." },
      { icon:"🌊", text:"Europa, one of Jupiter's moons, has a liquid ocean under its icy crust and might harbor life!" },
      { icon:"🔔", text:"Jupiter emits more heat than it receives from the Sun — it has its own internal heat source." },
      { icon:"⚡", text:"Jupiter has powerful auroras at its poles, thousands of times stronger than Earth's northern lights." }
    ]
  },
  {
    id:"saturn", name:"Saturn", emoji:"♄", order:6,
    questions:[
      { q:"Saturn's rings are famous. What are they made of?", options:["Solid rock rings","Bits of ice and rock","Colored gas clouds","Liquid water"], answer:1, explain:"Saturn's rings are made of billions of chunks of ice and rock, ranging from tiny grains to house-sized boulders." },
      { q:"Saturn is the least dense planet. What does this mean?", options:["It's hollow","It could float on water","It has no core","It has no gravity"], answer:1, explain:"Saturn is so light (mostly hydrogen and helium gas) that it would float if you could find an ocean big enough!" },
      { q:"How many moons does Saturn have?", options:["12","62","146+","200"], answer:2, explain:"Saturn has over 146 known moons — the most of any planet. Titan, its largest, even has rivers and lakes of liquid methane!" },
      { q:"Saturn has a hexagonal storm at its north pole. How big is it?", options:["The size of a city","Twice the size of Earth","Size of the Moon","Size of a football field"], answer:1, explain:"The hexagonal jet stream at Saturn's north pole is about twice the size of Earth — and it's been there for decades!" }
    ],
    facts:[
      { icon:"💍", text:"Saturn's rings stretch 280,000 km wide but are only about 10–100 meters thick." },
      { icon:"🌊", text:"Titan has rivers, lakes, and rain — but made of liquid methane, not water!" },
      { icon:"🕐", text:"A Saturn year lasts 29.4 Earth years. If you were born on Saturn, you'd barely be 2 years old at age 60!" },
      { icon:"📡", text:"The Cassini spacecraft orbited Saturn for 13 years, revealing stunning details about the rings and moons." }
    ]
  },
  {
    id:"uranus", name:"Uranus", emoji:"⛢", order:7,
    questions:[
      { q:"Uranus is the 'tilted planet.' By how many degrees is it tilted?", options:["23 degrees","45 degrees","98 degrees","180 degrees"], answer:2, explain:"Uranus is tilted 98 degrees — it essentially rotates on its side! Its poles get 42 years of sunlight, then 42 years of darkness." },
      { q:"What gives Uranus its blue-green color?", options:["Blue water oceans","Methane in its atmosphere absorbs red light","Blue paint","Reflected Earth light"], answer:1, explain:"Methane gas in Uranus's atmosphere absorbs red light and reflects blue-green light, giving it that unique color." },
      { q:"Uranus is an ice giant. What is its interior likely made of?", options:["Pure water ice","A hot ocean of water, ammonia, and methane","Solid rock","Liquid gold"], answer:1, explain:"Uranus likely has a slushy interior of water, ammonia, and methane — extremely hot but under huge pressure." },
      { q:"How many moons does Uranus have, and what are they named after?", options:["27 moons named after Shakespeare characters","13 moons named after stars","50 moons named after gods","5 moons named after scientists"], answer:0, explain:"Uranus has 27 known moons all named after characters from Shakespeare and Alexander Pope — Titania, Oberon, Miranda and more!" }
    ],
    facts:[
      { icon:"❄️", text:"Uranus is the coldest planetary atmosphere in the solar system at -224°C — colder than Neptune!" },
      { icon:"🎭", text:"All of Uranus's moons are named after characters from Shakespeare and Alexander Pope's poetry." },
      { icon:"💨", text:"Uranus has 13 known rings — much darker and narrower than Saturn's bright icy rings." },
      { icon:"🌀", text:"Because of its extreme tilt, one pole of Uranus points almost directly at the Sun during parts of its orbit." }
    ]
  },
  {
    id:"neptune", name:"Neptune", emoji:"♆", order:8,
    questions:[
      { q:"Neptune was predicted by mathematics before it was even seen. Who predicted it?", options:["Galileo and Newton","Le Verrier and Adams","Einstein and Hubble","Copernicus alone"], answer:1, explain:"In 1846, mathematicians Le Verrier and Adams predicted Neptune's location from Uranus's wobble — and it was found exactly there!" },
      { q:"What are the strongest winds in the solar system found on Neptune?", options:["200 km/h","500 km/h","2,100 km/h","10,000 km/h"], answer:2, explain:"Neptune has the fastest winds in the solar system — reaching up to 2,100 km/h! 6 times faster than Earth's strongest hurricanes." },
      { q:"Neptune's largest moon, Triton, does something unusual. What?", options:["It orbits backwards","It has a city on it","It's made of gold","It has rings of its own"], answer:0, explain:"Triton orbits Neptune backwards (retrograde) — the only large moon in the solar system to do this. It was likely captured." },
      { q:"How long does it take Neptune to orbit the Sun once?", options:["12 years","29 years","84 years","165 years"], answer:3, explain:"Neptune takes 165 Earth years to orbit the Sun. It has only completed one full orbit since its discovery in 1846!" }
    ],
    facts:[
      { icon:"🔵", text:"Neptune is the only planet in the solar system not visible to the naked eye from Earth." },
      { icon:"🌊", text:"It's called Neptune after the Roman god of the sea — fitting for a deep blue ice giant." },
      { icon:"🧊", text:"Scientists think it might rain diamonds deep inside Neptune due to extreme pressure and carbon-rich atmosphere." },
      { icon:"🛸", text:"Only one spacecraft has ever visited Neptune — Voyager 2 flew past in 1989 and is still our best source of close-up data." }
    ]
  }
];

// ── State ──────────────────────────────────────────────
let score = 0;
let planetsVisited = 0;
let completedPlanets = new Set();
let currentPlanet = null;
let currentQ = 0;
let currentPoints = 0;
let answered = false;

// ── DOM refs ───────────────────────────────────────────
const fuelFill      = document.getElementById('fuelFill');
const fuelVal       = document.getElementById('fuelVal');
const scoreVal      = document.getElementById('scoreVal');
const planetVisited = document.getElementById('planetVisited');
const particlesCtn  = document.getElementById('particles');

function $(id) { return document.getElementById(id); }

// ── Screen Manager ─────────────────────────────────────
function showScreen(id) {
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
  $(id).classList.add('active');
}

// ── Star Canvas ────────────────────────────────────────
function initStars() {
  const canvas = document.getElementById('starCanvas');
  const ctx = canvas.getContext('2d');
  let W, H, stars = [], shooters = [];

  function resize() {
    W = canvas.width  = window.innerWidth;
    H = canvas.height = window.innerHeight;
  }
  resize();
  window.addEventListener('resize', resize);

  for (let i = 0; i < 280; i++) {
    stars.push({
      x: Math.random() * 2000,
      y: Math.random() * 1200,
      r: Math.random() * 1.8 + 0.2,
      a: Math.random(),
      speed: Math.random() * 0.4 + 0.1,
      twinkle: Math.random() * Math.PI * 2
    });
  }

  function addShooter() {
    shooters.push({
      x: Math.random() * W,
      y: Math.random() * H * 0.4,
      len: 80 + Math.random() * 120,
      speed: 6 + Math.random() * 8,
      angle: Math.PI / 6,
      life: 1
    });
  }
  setInterval(addShooter, 4000);

  function draw(t) {
    ctx.clearRect(0, 0, W, H);
    stars.forEach(s => {
      s.twinkle += 0.02;
      const alpha = 0.4 + 0.6 * Math.abs(Math.sin(s.twinkle + s.a));
      ctx.beginPath();
      ctx.arc(s.x % W, s.y % H, s.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(255,255,255,${alpha})`;
      ctx.fill();
    });
    shooters = shooters.filter(s => {
      s.x += Math.cos(s.angle) * s.speed;
      s.y += Math.sin(s.angle) * s.speed;
      s.life -= 0.018;
      if (s.life <= 0) return false;
      const grad = ctx.createLinearGradient(s.x, s.y, s.x - Math.cos(s.angle)*s.len, s.y - Math.sin(s.angle)*s.len);
      grad.addColorStop(0, `rgba(255,255,255,${s.life})`);
      grad.addColorStop(1, 'rgba(255,255,255,0)');
      ctx.beginPath();
      ctx.moveTo(s.x, s.y);
      ctx.lineTo(s.x - Math.cos(s.angle)*s.len, s.y - Math.sin(s.angle)*s.len);
      ctx.strokeStyle = grad;
      ctx.lineWidth = 2;
      ctx.stroke();
      return true;
    });
    requestAnimationFrame(draw);
  }
  requestAnimationFrame(draw);
}

// ── Update HUD ─────────────────────────────────────────
function updateHUD() {
  const pct = Math.round((completedPlanets.size / PLANETS.length) * 100);
  fuelFill.style.width = pct + '%';
  fuelVal.textContent  = pct + '%';
  scoreVal.textContent = score;
  planetVisited.textContent = completedPlanets.size;
}

// ── Solar Map ──────────────────────────────────────────
function buildMap() {
  const map = $('solarMap');
  map.innerHTML = '';
  PLANETS.forEach((planet, i) => {
    const completed = completedPlanets.has(planet.id);
    const locked    = i > 0 && !completedPlanets.has(PLANETS[i-1].id);

    const node = document.createElement('div');
    node.className = 'planet-node' + (completed ? ' completed' : '') + (locked ? ' locked' : '');
    node.innerHTML = `
      ${locked ? '<span class="lock-icon">🔒</span>' : ''}
      <span class="planet-icon">${planet.emoji}</span>
      <span class="planet-node-name">${planet.name.toUpperCase()}</span>
      <span class="planet-node-status">${completed ? '✅' : locked ? '🔒' : '🚀'}</span>
    `;
    if (!locked) {
      node.addEventListener('click', () => startQuiz(planet));
    }
    map.appendChild(node);
  });
}

// ── Quiz ───────────────────────────────────────────────
function startQuiz(planet) {
  currentPlanet = planet;
  currentQ = 0;
  currentPoints = 0;
  answered = false;

  $('quizPlanetBadge').textContent = planet.emoji;
  $('quizPlanetName').textContent  = planet.name.toUpperCase();
  $('livePoints').textContent = 0;

  showScreen('screenQuiz');
  loadQuestion();
}

function loadQuestion() {
  const q = currentPlanet.questions[currentQ];
  $('qNumber').textContent   = `Q${currentQ + 1}`;
  $('qText').textContent     = q.q;
  $('quizProgress').textContent = `Question ${currentQ + 1} of ${currentPlanet.questions.length}`;
  $('quizFeedback').className = 'quiz-feedback';
  $('feedbackIcon').textContent = '';
  $('feedbackText').textContent = '';
  answered = false;

  // Animate card
  const card = $('questionCard');
  card.style.animation = 'none';
  void card.offsetWidth;
  card.style.animation = 'nodeIn 0.4s ease both';

  const grid = $('optionsGrid');
  grid.innerHTML = '';
  q.options.forEach((opt, idx) => {
    const btn = document.createElement('button');
    btn.className = 'option-btn';
    btn.textContent = opt;
    btn.addEventListener('click', () => handleAnswer(idx, btn));
    grid.appendChild(btn);
  });
}

function handleAnswer(idx, btn) {
  if (answered) return;
  answered = true;

  const q = currentPlanet.questions[currentQ];
  const correct = idx === q.answer;
  const feedback = $('quizFeedback');
  const allBtns  = $('optionsGrid').querySelectorAll('.option-btn');

  allBtns.forEach(b => b.disabled = true);
  allBtns[q.answer].classList.add('correct');
  if (!correct) btn.classList.add('wrong');

  if (correct) {
    const pts = 100;
    score += pts;
    currentPoints += pts;
    $('livePoints').textContent = currentPoints;
    feedback.className = 'quiz-feedback show correct-fb';
    $('feedbackIcon').textContent = '🎉';
    $('feedbackText').textContent = `Correct! +${pts} pts — ${q.explain}`;
    burst(btn);
    playTone(660, 'sine', 0.15);
  } else {
    feedback.className = 'quiz-feedback show wrong-fb';
    $('feedbackIcon').textContent = '💡';
    $('feedbackText').textContent = `Not quite! ${q.explain}`;
    playTone(200, 'sawtooth', 0.1);
  }

  setTimeout(() => {
    currentQ++;
    if (currentQ < currentPlanet.questions.length) {
      loadQuestion();
    } else {
      showUnlocked();
    }
  }, 2200);
}

// ── Unlocked Screen ────────────────────────────────────
function showUnlocked() {
  completedPlanets.add(currentPlanet.id);
  planetsVisited++;
  updateHUD();

  $('unlockedBadge').textContent = currentPlanet.emoji;
  $('unlockedTitle').textContent = currentPlanet.name + ' Unlocked!';

  const fs = $('factScroll');
  fs.innerHTML = '';
  currentPlanet.facts.forEach((fact, i) => {
    const el = document.createElement('div');
    el.className = 'fact-item';
    el.style.animationDelay = `${i * 0.12}s`;
    el.innerHTML = `<span class="fact-icon">${fact.icon}</span><span class="fact-text">${fact.text}</span>`;
    fs.appendChild(el);
  });

  $('statsRow').innerHTML = `
    <div class="stat-chip">🌟 +${currentPoints} pts</div>
    <div class="stat-chip">✅ ${completedPlanets.size}/8 planets</div>
    <div class="stat-chip">⚡ ${Math.round((completedPlanets.size/8)*100)}% fuel</div>
  `;

  showScreen('screenUnlocked');
  bigBurst();
  playTone(880, 'sine', 0.2);
}

$('btnNextPlanet').addEventListener('click', () => {
  if (completedPlanets.size === PLANETS.length) {
    showVictory();
  } else {
    buildMap();
    showScreen('screenMap');
  }
});

// ── Victory ────────────────────────────────────────────
function showVictory() {
  $('finalScore').textContent = score;
  const shelf = $('badgeShelf');
  shelf.innerHTML = PLANETS.map(p => p.emoji).join('');
  showScreen('screenVictory');
  for (let i = 0; i < 5; i++) {
    setTimeout(bigBurst, i * 300);
  }
}

$('btnRestart').addEventListener('click', () => {
  score = 0; planetsVisited = 0;
  completedPlanets.clear();
  updateHUD();
  buildMap();
  showScreen('screenMap');
});

// ── Particles ──────────────────────────────────────────
function burst(target) {
  const rect = target ? target.getBoundingClientRect() : { left: window.innerWidth/2, top: window.innerHeight/2 };
  const cx = rect.left + (rect.width||0) / 2;
  const cy = rect.top  + (rect.height||0) / 2;
  const icons = ['⭐','✨','🌟','💫','🎉'];
  for (let i = 0; i < 8; i++) {
    const p = document.createElement('div');
    p.className = 'particle';
    p.textContent = icons[Math.floor(Math.random() * icons.length)];
    const angle = (i / 8) * Math.PI * 2;
    const dist = 60 + Math.random() * 80;
    p.style.left = cx + 'px';
    p.style.top  = cy + 'px';
    p.style.setProperty('--dx', Math.cos(angle)*dist + 'px');
    p.style.setProperty('--dy', Math.sin(angle)*dist + 'px');
    particlesCtn.appendChild(p);
    setTimeout(() => p.remove(), 900);
  }
}

function bigBurst() {
  const cx = window.innerWidth / 2;
  const cy = window.innerHeight / 2;
  const icons = ['🌟','⭐','💥','✨','🎊','🎉','💫','🚀'];
  for (let i = 0; i < 20; i++) {
    const p = document.createElement('div');
    p.className = 'particle';
    p.textContent = icons[Math.floor(Math.random() * icons.length)];
    const angle = Math.random() * Math.PI * 2;
    const dist = 80 + Math.random() * 200;
    p.style.left = (cx + (Math.random()-0.5)*200) + 'px';
    p.style.top  = (cy + (Math.random()-0.5)*200) + 'px';
    p.style.setProperty('--dx', Math.cos(angle)*dist + 'px');
    p.style.setProperty('--dy', Math.sin(angle)*dist + 'px');
    p.style.animationDelay = Math.random() * 0.3 + 's';
    particlesCtn.appendChild(p);
    setTimeout(() => p.remove(), 1200);
  }
}

// ── Audio ──────────────────────────────────────────────
function playTone(freq, type = 'sine', vol = 0.15) {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.type = type;
    osc.frequency.value = freq;
    gain.gain.setValueAtTime(vol, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.4);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.4);
  } catch(e) {}
}

// ── Init ───────────────────────────────────────────────
$('btnStart').addEventListener('click', () => {
  buildMap();
  showScreen('screenMap');
  playTone(440, 'sine', 0.1);
});

initStars();
updateHUD();
