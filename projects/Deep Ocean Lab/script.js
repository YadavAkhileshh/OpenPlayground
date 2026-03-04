

// ── Zone Data ────────────────────────────────
const ZONES = [
  {
    id:"sunlight", name:"Sunlight Zone", depth:"0 – 200m", maxDepth:200,
    emoji:"🐠", color:"#00b4d8", pressure:"1–20 ATM",
    creatures:["🐠","🦈","🐬","🐙","🦀","🐡","🦭","🐳"],
    questions:[
      { q:"The Sunlight Zone is the most productive ocean layer. Why?", options:["It has the most fish","Sunlight allows photosynthesis by phytoplankton","Warm water rises here","Ships pass through it"], answer:1, explain:"Phytoplankton in the Sunlight Zone photosynthesize, producing over 50% of Earth's oxygen — more than all rainforests combined!" },
      { q:"Coral reefs are found in the Sunlight Zone. What percentage of ocean species live there?", options:["5%","10%","25%","50%"], answer:2, explain:"Though coral reefs cover less than 1% of the ocean floor, they support about 25% of all marine species — ocean biodiversity hotspots!" },
      { q:"Why are most fish in the Sunlight Zone colorful?", options:["To attract tourists","Colors are used for camouflage, communication, and mating","They eat colorful food","Sunlight dyes them"], answer:1, explain:"Fish use color to blend in, warn predators they're toxic, attract mates, and communicate — it's their language!" },
      { q:"The Great Barrier Reef is the world's largest coral reef. Where is it?", options:["Caribbean Sea","Red Sea","Australia","Pacific Coast of USA"], answer:2, explain:"The Great Barrier Reef off Australia is so large it can be seen from space — stretching over 2,300 km!" }
    ],
    facts:[
      { icon:"☀️", text:"The Sunlight Zone (0–200m) gets enough light for photosynthesis. It produces over half of Earth's oxygen." },
      { icon:"🐟", text:"Clownfish live within the stinging tentacles of sea anemones — they're immune to the sting and help each other survive." },
      { icon:"🦈", text:"Great white sharks can detect one drop of blood in 100 liters of water from up to 5km away." },
      { icon:"🐬", text:"Dolphins use echolocation — clicking sounds that bounce off objects — to navigate and hunt even in murky water." }
    ]
  },
  {
    id:"twilight", name:"Twilight Zone", depth:"200 – 1,000m", maxDepth:1000,
    emoji:"🦑", color:"#5e5ce6", pressure:"20–100 ATM",
    creatures:["🦑","🐙","🦐","🐡","✨","💫"],
    questions:[
      { q:"The Twilight Zone gets very little light. How do creatures here survive the darkness?", options:["They use torches","Many use bioluminescence to produce their own light","They sleep all day","They follow ships"], answer:1, explain:"About 90% of deep sea creatures are bioluminescent — they produce their own chemical light for hunting, hiding, and mating!" },
      { q:"What is the Diel Vertical Migration — one of the largest animal migrations on Earth?", options:["Fish swimming to warmer oceans","Millions of sea creatures rising at night to feed near the surface, then sinking at dawn","Whales crossing oceans","Salmon returning to rivers"], answer:1, explain:"Every night, trillions of animals migrate from the deep up to the surface to feed, then descend again at dawn to avoid predators." },
      { q:"The giant squid lives in the Twilight Zone. How large can it grow?", options:["1 meter","5 meters","13 meters","30 meters"], answer:2, explain:"Giant squids can reach 13 meters — as long as a double-decker bus! Their eyes are the biggest in the animal kingdom." },
      { q:"What is 'marine snow' that falls through the Twilight Zone?", options:["Frozen seawater","Tiny particles of dead organisms and waste drifting downward","Ice from icebergs","Volcanic ash"], answer:1, explain:"'Marine snow' is a constant shower of organic particles — dead plankton, feces, mucus — that feeds creatures in the deep. Yummy!" }
    ],
    facts:[
      { icon:"✨", text:"90% of deep-sea creatures produce bioluminescence — their own light using a chemical reaction involving luciferin." },
      { icon:"🦑", text:"The giant squid has eyes the size of footballs — the biggest eyes in the animal kingdom, evolved to spot faint light in the deep." },
      { icon:"🌊", text:"Marine snow falls at about 100 meters per day, carrying carbon from the surface to the deep ocean floor." },
      { icon:"🐙", text:"Octopuses can change color AND texture in less than a second to match any surface — even perfectly mimicking other animals." }
    ]
  },
  {
    id:"midnight", name:"Midnight Zone", depth:"1,000 – 4,000m", maxDepth:4000,
    emoji:"🐟", color:"#2d6a4f", pressure:"100–400 ATM",
    creatures:["🐟","🦠","💀","🎣","👁️","🌑"],
    questions:[
      { q:"The Anglerfish uses a glowing lure to attract prey. Where does this light come from?", options:["A tiny LED inside it","Bioluminescent bacteria living inside the lure","Sunlight stored in its body","Volcanic heat"], answer:1, explain:"The anglerfish's lure contains symbiotic bioluminescent bacteria — tiny living organisms that glow as a built-in fishing light!" },
      { q:"At 1,000m depth, pressure is crushing. How does a sperm whale survive diving this deep?", options:["Armored skin","Their ribcage can collapse and lungs compress without damage","They hold their breath","They breathe water"], answer:1, explain:"Sperm whales have flexible ribcages that collapse under pressure, allowing their lungs to compress safely as they dive — incredible adaptation!" },
      { q:"The Midnight Zone has no sunlight at all. What do creatures here primarily eat?", options:["Sunlight directly","Marine snow, each other, and migrating creatures from above","Soil from the sea floor","Dissolved salt"], answer:1, explain:"In total darkness, deep-sea creatures feast on marine snow drifting down, hunt each other, or ambush migrants passing through." },
      { q:"How cold is the water in the Midnight Zone?", options:["0°C (freezing)","2–4°C (near freezing)","10°C","20°C"], answer:1, explain:"The deep ocean stays a near-constant 2–4°C — close to freezing but not quite, because salt water freezes at -1.8°C." }
    ],
    facts:[
      { icon:"🎣", text:"Anglerfish females carry males fused onto their bodies permanently — the male merges and becomes a sperm-providing parasite." },
      { icon:"🐋", text:"Sperm whales can dive to 2,250m and hold their breath for 90 minutes — the deepest and longest dive of any mammal." },
      { icon:"💀", text:"The barreleye fish has a transparent head and tubular eyes that rotate to look upward through its skull to spot prey silhouettes." },
      { icon:"🫁", text:"Pressure at 1,000m is 100 times that at the surface — enough to crush a submarine if it isn't specially designed." }
    ]
  },
  {
    id:"abyssal", name:"Abyssal Zone", depth:"4,000 – 6,000m", maxDepth:6000,
    emoji:"🦐", color:"#7b2d8b", pressure:"400–600 ATM",
    creatures:["🦐","🕷️","🌑","💠","🟣","👾"],
    questions:[
      { q:"The Abyssal Zone covers most of the ocean floor. What percentage of the ocean floor is it?", options:["10%","30%","60%","83%"], answer:3, explain:"The abyssal zone makes up about 83% of the entire ocean floor — it's the most common environment on Earth, yet we know very little about it!" },
      { q:"What are 'Polymetallic nodules' found scattered across the abyssal plain?", options:["Ancient cannonballs","Rock-like lumps of iron, manganese and metals that grow 1cm per million years","Dinosaur eggs","Volcanic rocks"], answer:1, explain:"These potato-sized nodules grow incredibly slowly — 1cm per million years — and are being studied as sources of rare metals for batteries." },
      { q:"The abyssal plain is flat. Why?", options:["It was scraped flat by glaciers","Millions of years of sediment rain has covered all features","The ocean presses it flat","Tectonic plates made it flat"], answer:1, explain:"Billions of years of marine snow have filled in every bump and crater, creating one of the flattest surfaces on Earth." },
      { q:"What percentage of the ocean have humans actually explored?", options:["80%","50%","20%","Less than 20%"], answer:3, explain:"We have explored less than 20% of Earth's oceans. We know more about the surface of Mars than we do about our own ocean floor!" }
    ],
    facts:[
      { icon:"🌑", text:"The abyssal zone is in total darkness, near-freezing, and under 400–600 times atmospheric pressure." },
      { icon:"🦐", text:"The Hirondellea gigas shrimp lives in the deepest ocean trenches and can survive pressure that would crush most machinery." },
      { icon:"🗺️", text:"We have mapped more of the surface of Venus and Mars than our own ocean floor. The deep sea is our last true frontier." },
      { icon:"🥔", text:"Polymetallic nodules on the sea floor hold more cobalt and nickel than all land deposits combined — a future resource for clean energy." }
    ]
  },
  {
    id:"hadal", name:"Hadal Zone", depth:"6,000 – 11,000m", maxDepth:11000,
    emoji:"🕳️", color:"#e63946", pressure:"600–1100 ATM",
    creatures:["🕳️","💀","🐟","🔴","⬛","❗"],
    questions:[
      { q:"The Mariana Trench is the deepest point on Earth. How deep is Challenger Deep?", options:["5,000m","7,500m","11,034m","15,000m"], answer:2, explain:"Challenger Deep reaches 11,034m — if you put Mount Everest at the bottom, its peak would still be over a mile underwater!" },
      { q:"Who was the first person to reach the deepest point of the Mariana Trench solo?", options:["Jacques Cousteau","James Cameron","Don Walsh","Sylvia Earle"], answer:1, explain:"Film director James Cameron made a solo dive to Challenger Deep in 2012 in a specially built submersible — the first solo dive to the bottom!" },
      { q:"Incredibly, life exists even in the Hadal Zone. What kind of organisms live there?", options:["No life exists","Only bacteria","Bacteria, amphipods, snailfish, and more","Only worms"], answer:2, explain:"The hadal zone teems with life! Snailfish (the world's deepest fish), giant amphipod crustaceans, and unique bacteria thrive under crushing pressure." },
      { q:"Hadal zone pressure is about 1,100 atmospheres. What happens to a wooden object sent there?", options:["It floats back up","It is compressed to a tiny fraction of its size","It turns to stone","Nothing happens"], answer:1, explain:"Styrofoam cups sent to the Mariana Trench return the size of a thimble — compressed to almost nothing by the crushing pressure!" }
    ],
    facts:[
      { icon:"🕳️", text:"Challenger Deep is 11,034m — the full height of Mount Everest would fit inside with over 2km to spare." },
      { icon:"🐟", text:"The Mariana snailfish (Pseudoliparis swirei) is the deepest-known fish, living at 8,000m — it looks almost transparent." },
      { icon:"♻️", text:"Scientists found plastic bags and candy wrappers at the bottom of the Mariana Trench — human pollution has reached the deepest point on Earth." },
      { icon:"🎬", text:"James Cameron's sub for his 2012 solo dive was shaped like a torpedo and took 2.5 hours to sink to the bottom." }
    ]
  },
  {
    id:"vents", name:"Hydrothermal Vents", depth:"2,000 – 4,000m", maxDepth:4000,
    emoji:"🌋", color:"#ff6b35", pressure:"200–400 ATM",
    creatures:["🌋","🪱","🦀","🔥","💨","⚡"],
    questions:[
      { q:"Hydrothermal vents were only discovered in 1977. What was the shocking discovery?", options:["Lava that glows","Entire ecosystems based on CHEMISTRY not sunlight","Underground rivers","Alien life forms"], answer:1, explain:"Scientists found communities of creatures living without ANY sunlight — fueled by chemosynthesis (bacteria converting vent chemicals into energy). Life found a new way!" },
      { q:"How hot is the water shooting out of hydrothermal vents?", options:["50°C","100°C","200°C","Up to 400°C"], answer:3, explain:"Vent water can reach 400°C — hot enough to melt lead! It stays liquid because of the crushing pressure at that depth." },
      { q:"Giant tube worms live at vents, up to 2m long. They have NO mouth, no gut, no stomach. How do they eat?", options:["They absorb sunlight","They eat each other","Billions of symbiotic bacteria inside them convert vent chemicals into food","They filter seawater"], answer:2, explain:"Tube worms have no digestive system! Their entire body houses billions of chemosynthetic bacteria that convert hydrogen sulfide from the vents into food." },
      { q:"Why are hydrothermal vents important for the origin of life theories?", options:["They aren't relevant","They show life can exist without sunlight, suggesting life may have started in chemical-rich environments","They create oxygen","They were found in fossils"], answer:1, explain:"Vent ecosystems suggest Earth's earliest life may have started in similar chemical-rich environments — and informs the search for life on other planets!" }
    ],
    facts:[
      { icon:"💨", text:"Hydrothermal vents emit water at up to 400°C — so hot it would normally be steam, but deep-sea pressure keeps it liquid." },
      { icon:"🪱", text:"Giant tube worms grow 2m long, have no mouth or stomach, and live off bacteria that eat poisonous hydrogen sulfide from the vents." },
      { icon:"🦀", text:"Yeti crabs at vents have hairy claws packed with bacteria that detoxify the toxic vent chemicals before the crab consumes them." },
      { icon:"🌍", text:"The discovery of vent life in 1977 rewrote biology — it proved life doesn't need sunlight, reshaping the search for life on other worlds." }
    ]
  }
];

// ── State ─────────────────────────────────────
let score = 0;
let completedZones = new Set();
let currentZone = null;
let currentQ = 0;
let currentZonePoints = 0;
let answered = false;

// ── DOM ───────────────────────────────────────
const scoreVal   = document.getElementById('scoreVal');
const zonesVal   = document.getElementById('zonesVal');
const depthFill  = document.getElementById('depthFill');
const depthVal   = document.getElementById('depthVal');
const o2Fill     = document.getElementById('o2Fill');
const subIcon    = document.getElementById('subIcon');
const particleEl = document.getElementById('particles');

function $(id){ return document.getElementById(id); }

// ── Screens ───────────────────────────────────
function showScreen(id){
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
  $(id).classList.add('active');
}

// ── Ocean Canvas ──────────────────────────────
function initOcean(){
  const canvas = $('oceanCanvas');
  const ctx = canvas.getContext('2d');
  let W, H;

  function resize(){
    W = canvas.width  = window.innerWidth;
    H = canvas.height = window.innerHeight;
  }
  resize();
  window.addEventListener('resize', resize);

  // Bioluminescent particles
  const particles = Array.from({length: 80}, () => ({
    x: Math.random() * 2000,
    y: Math.random() * 1500,
    r: Math.random() * 3 + 0.5,
    vx: (Math.random() - 0.5) * 0.3,
    vy: (Math.random() - 0.5) * 0.2,
    hue: Math.random() > 0.5 ? 180 : (Math.random() > 0.5 ? 300 : 30),
    alpha: Math.random() * 0.5 + 0.1,
    pulse: Math.random() * Math.PI * 2,
  }));

  // Flowing water lines
  const waterLines = Array.from({length: 12}, () => ({
    y: Math.random() * 1500,
    x: Math.random() * 2000,
    len: 60 + Math.random() * 120,
    speed: 0.3 + Math.random() * 0.5,
    alpha: Math.random() * 0.08 + 0.02,
  }));

  function draw(){
    ctx.clearRect(0, 0, W, H);

    // Deep gradient
    const bg = ctx.createLinearGradient(0, 0, 0, H);
    bg.addColorStop(0, '#041830');
    bg.addColorStop(0.5, '#020f20');
    bg.addColorStop(1, '#010812');
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, W, H);

    // Water lines (current)
    waterLines.forEach(l => {
      l.x += l.speed;
      if(l.x > W + l.len) l.x = -l.len;
      ctx.beginPath();
      ctx.moveTo(l.x, l.y % H);
      ctx.lineTo(l.x + l.len, l.y % H);
      ctx.strokeStyle = `rgba(0,180,255,${l.alpha})`;
      ctx.lineWidth = 1;
      ctx.stroke();
    });

    // Bioluminescent particles
    particles.forEach(p => {
      p.x = (p.x + p.vx + W) % W;
      p.y = (p.y + p.vy + H) % H;
      p.pulse += 0.04;
      const a = p.alpha * (0.5 + 0.5 * Math.sin(p.pulse));
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI*2);
      ctx.fillStyle = `hsla(${p.hue},100%,70%,${a})`;
      ctx.fill();
      // Glow
      const grd = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.r * 5);
      grd.addColorStop(0, `hsla(${p.hue},100%,70%,${a * 0.3})`);
      grd.addColorStop(1, 'transparent');
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r * 5, 0, Math.PI*2);
      ctx.fillStyle = grd;
      ctx.fill();
    });

    requestAnimationFrame(draw);
  }
  requestAnimationFrame(draw);
}

// ── Bubbles ───────────────────────────────────
function initBubbles(){
  const layer = $('bubblesLayer');
  for(let i = 0; i < 18; i++){
    const b = document.createElement('div');
    b.className = 'bubble';
    const size = 4 + Math.random() * 16;
    b.style.cssText = `
      width:${size}px; height:${size}px;
      left:${Math.random()*100}%;
      animation-duration:${8 + Math.random()*14}s;
      animation-delay:${-Math.random()*20}s;
    `;
    layer.appendChild(b);
  }
}

// ── Creature Parade ───────────────────────────
function buildParade(){
  const el = $('creatureParade');
  const all = ZONES.flatMap(z => z.creatures).sort(() => Math.random()-0.5).slice(0,10);
  el.innerHTML = all.map(c => `<span>${c}</span>`).join('');
}

// ── HUD Update ────────────────────────────────
function updateHUD(){
  const pct = Math.round((completedZones.size / ZONES.length) * 100);
  depthFill.style.width = pct + '%';
  subIcon.style.setProperty('--pos', pct + '%');
  subIcon.style.right = `calc(${100-pct}% - 10px)`;

  const totalDepth = completedZones.size > 0
    ? Math.max(...Array.from(completedZones).map(id => ZONES.find(z=>z.id===id)?.maxDepth || 0))
    : 0;
  depthVal.textContent = totalDepth > 0 ? totalDepth.toLocaleString() + 'm' : '0m';
  scoreVal.textContent = score;
  zonesVal.textContent = completedZones.size;
  o2Fill.style.width = Math.max(20, 100 - (completedZones.size/ZONES.length)*70) + '%';
}

// ── Zone Map ──────────────────────────────────
function buildMap(){
  const col = $('zoneColumn');
  col.innerHTML = '';
  ZONES.forEach((zone, i) => {
    const done   = completedZones.has(zone.id);
    const locked = i > 0 && !completedZones.has(ZONES[i-1].id);

    const card = document.createElement('div');
    card.className = 'zone-card' + (done?' completed':'') + (locked?' locked':'');
    card.style.setProperty('--zone-color', zone.color);
    card.innerHTML = `
      <span class="zone-card-icon" style="color:${zone.color}">${zone.emoji}</span>
      <div class="zone-card-info">
        <div class="zone-card-name">${zone.name}</div>
        <div class="zone-card-depth">${zone.depth} · ${zone.pressure}</div>
      </div>
      <span class="zone-card-status">${done ? '✅' : locked ? '🔒' : '▶'}</span>
    `;
    if(!locked) card.addEventListener('click', () => startQuiz(zone));
    col.appendChild(card);
  });
}

// ── Quiz ──────────────────────────────────────
function startQuiz(zone){
  currentZone = zone;
  currentQ = 0;
  currentZonePoints = 0;
  answered = false;

  $('creatureBadge').textContent = zone.emoji;
  $('creatureBadge').style.filter = `drop-shadow(0 0 20px ${zone.color})`;
  $('zoneLabel').textContent = zone.name.toUpperCase();
  $('zoneLabel').style.color = zone.color;
  $('depthTag').textContent = zone.depth + ' · ' + zone.pressure;

  showScreen('screenQuiz');
  loadQ();
}

function loadQ(){
  const q = currentZone.questions[currentQ];
  $('qNumLabel').textContent = `Q${currentQ+1}`;
  $('qText').textContent = q.q;
  $('qCounter').textContent = `${currentQ+1}/4`;
  answered = false;

  const rp = $('resultPanel');
  rp.className = 'result-panel';
  $('resultIcon').textContent = '';
  $('resultMsg').textContent = '';

  // Animate card
  const sc = $('sonarScreen');
  sc.style.animation = 'none';
  void sc.offsetWidth;
  sc.style.animation = 'cardSlide 0.4s ease both';

  const wrap = $('answersWrap');
  wrap.innerHTML = '';
  q.options.forEach((opt, idx) => {
    const btn = document.createElement('button');
    btn.className = 'ans-btn';
    btn.textContent = opt;
    btn.addEventListener('click', () => handleAns(idx, btn));
    wrap.appendChild(btn);
  });
}

function handleAns(idx, btn){
  if(answered) return;
  answered = true;

  const q = currentZone.questions[currentQ];
  const correct = idx === q.answer;
  const allBtns = $('answersWrap').querySelectorAll('.ans-btn');
  allBtns.forEach(b => b.disabled = true);
  allBtns[q.answer].classList.add('correct');
  if(!correct) btn.classList.add('wrong');

  const rp = $('resultPanel');
  if(correct){
    score += 100;
    currentZonePoints += 100;
    rp.className = 'result-panel show ok';
    $('resultIcon').textContent = '🐠';
    $('resultMsg').textContent = `Correct! +100 pts — ${q.explain}`;
    burst(btn, currentZone.color);
    playTone(660, 'sine', 0.12);
  } else {
    rp.className = 'result-panel show bad';
    $('resultIcon').textContent = '🦑';
    $('resultMsg').textContent = `Not quite! ${q.explain}`;
    playTone(180, 'sawtooth', 0.08);
  }

  updateHUD();
  setTimeout(() => {
    currentQ++;
    if(currentQ < currentZone.questions.length){
      loadQ();
    } else {
      showZoneUnlocked();
    }
  }, 2400);
}

// ── Zone Unlocked ─────────────────────────────
function showZoneUnlocked(){
  completedZones.add(currentZone.id);
  updateHUD();

  $('zoneBig').textContent = currentZone.emoji;
  $('zoneBig').style.filter = `drop-shadow(0 0 50px ${currentZone.color})`;
  $('zoneUnlockedName').textContent = currentZone.name + ' Explored!';
  $('pressureBadge').textContent = `⬇ DEPTH: ${currentZone.depth} · PRESSURE: ${currentZone.pressure}`;

  const fc = $('factsContainer');
  fc.innerHTML = '';
  currentZone.facts.forEach((f, i) => {
    const row = document.createElement('div');
    row.className = 'fact-row';
    row.style.animationDelay = `${i*0.12}s`;
    row.innerHTML = `<span class="fact-em">${f.icon}</span><span class="fact-body">${f.text}</span>`;
    fc.appendChild(row);
  });

  $('zoneScoreRow').innerHTML = `
    <div class="chip">🔬 +${currentZonePoints} pts</div>
    <div class="chip">✅ ${completedZones.size}/6 zones</div>
    <div class="chip">▼ ${currentZone.maxDepth.toLocaleString()}m reached</div>
  `;

  showScreen('screenZone');
  bigBurst(currentZone.color);
  playTone(880, 'triangle', 0.15);
}

$('btnContinue').addEventListener('click', () => {
  if(completedZones.size === ZONES.length){
    showVictory();
  } else {
    buildMap();
    showScreen('screenMap');
  }
});

// ── Victory ───────────────────────────────────
function showVictory(){
  $('finalPts').textContent = score;
  $('trophyShelf').innerHTML = ZONES.map(z => z.emoji).join(' ');
  showScreen('screenVictory');
  for(let i=0;i<6;i++) setTimeout(() => bigBurst('#00fff7'), i*250);
}

$('btnRestart').addEventListener('click', () => {
  score = 0; completedZones.clear();
  updateHUD(); buildMap();
  showScreen('screenMap');
});

// ── Particles ─────────────────────────────────
function burst(target, color='#00fff7'){
  const rect = target?.getBoundingClientRect() || {left:window.innerWidth/2, top:window.innerHeight/2, width:0, height:0};
  const cx = rect.left + rect.width/2;
  const cy = rect.top  + rect.height/2;
  const icons = ['✨','💫','🌊','⭐','🐠','🦈'];
  for(let i=0;i<10;i++){
    const p = document.createElement('div');
    p.className = 'particle';
    p.textContent = icons[Math.floor(Math.random()*icons.length)];
    const angle = (i/10)*Math.PI*2;
    const dist = 50 + Math.random()*90;
    p.style.left = cx+'px'; p.style.top = cy+'px';
    p.style.setProperty('--dx', Math.cos(angle)*dist+'px');
    p.style.setProperty('--dy', Math.sin(angle)*dist+'px');
    p.style.animationDelay = Math.random()*0.15+'s';
    particleEl.appendChild(p);
    setTimeout(() => p.remove(), 1000);
  }
}

function bigBurst(color){
  const cx = window.innerWidth/2;
  const cy = window.innerHeight/2;
  const icons = ['🌊','✨','💫','🐠','🦑','🐙','⭐','🎉','💥','🌟'];
  for(let i=0;i<25;i++){
    const p = document.createElement('div');
    p.className = 'particle';
    p.textContent = icons[Math.floor(Math.random()*icons.length)];
    const angle = Math.random()*Math.PI*2;
    const dist = 80+Math.random()*220;
    p.style.left = (cx+(Math.random()-0.5)*300)+'px';
    p.style.top  = (cy+(Math.random()-0.5)*200)+'px';
    p.style.setProperty('--dx', Math.cos(angle)*dist+'px');
    p.style.setProperty('--dy', Math.sin(angle)*dist+'px');
    p.style.animationDelay = Math.random()*0.4+'s';
    particleEl.appendChild(p);
    setTimeout(() => p.remove(), 1300);
  }
}

// ── Audio ─────────────────────────────────────
function playTone(freq, type='sine', vol=0.12){
  try{
    const ctx = new (window.AudioContext||window.webkitAudioContext)();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain); gain.connect(ctx.destination);
    osc.type = type; osc.frequency.value = freq;
    gain.gain.setValueAtTime(vol, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime+0.45);
    osc.start(); osc.stop(ctx.currentTime+0.45);
  }catch(e){}
}

// ── Init ──────────────────────────────────────
$('btnDive').addEventListener('click', () => {
  buildMap();
  showScreen('screenMap');
  playTone(320, 'sine', 0.08);
});

$('btnRestart').addEventListener('click', () => {
  score = 0; completedZones.clear();
  updateHUD(); buildMap();
  showScreen('screenMap');
});

initOcean();
initBubbles();
buildParade();
updateHUD();
