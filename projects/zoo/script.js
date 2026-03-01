// =============================================
//   Magic Zoo Builder — script.js
// =============================================

// Animal data (mirrors project.json)
const projectData = {
  animals: [
    { id: "lion",      name: "Lion",      emoji: "🦁", sound: 120, fact: "Lions are the only cats that live in groups called prides! A lion's roar can be heard 8 km away. 🌟" },
    { id: "elephant",  name: "Elephant",  emoji: "🐘", sound: 80,  fact: "Elephants never forget! They have the biggest brains of any land animal and can remember friends for years. 🧠" },
    { id: "giraffe",   name: "Giraffe",   emoji: "🦒", sound: 200, fact: "Giraffes are the tallest animals on Earth. Their tongues are 45 cm long and dark blue to avoid sunburn! 💜" },
    { id: "zebra",     name: "Zebra",     emoji: "🦓", sound: 300, fact: "Every zebra has a unique stripe pattern — just like human fingerprints! No two zebras look alike. 🖊️" },
    { id: "monkey",    name: "Monkey",    emoji: "🐒", sound: 440, fact: "Monkeys peel bananas from the bottom, not the top — just like pro chefs do. They're super smart! 🍌" },
    { id: "penguin",   name: "Penguin",   emoji: "🐧", sound: 550, fact: "Penguins propose with pebbles! A male penguin gives a special rock to the penguin he likes. 💍" },
    { id: "panda",     name: "Panda",     emoji: "🐼", sound: 160, fact: "A panda eats bamboo for up to 14 hours a day. That's a lot of crunching! 🎋" },
    { id: "tiger",     name: "Tiger",     emoji: "🐯", sound: 110, fact: "Tigers are the largest wild cats and are great swimmers! They love to cool off in rivers. 🏊" },
    { id: "hippo",     name: "Hippo",     emoji: "🦛", sound: 90,  fact: "Hippos produce a natural sunscreen — a reddish oily liquid that protects their skin. Built-in SPF! ☀️" },
    { id: "parrot",    name: "Parrot",    emoji: "🦜", sound: 660, fact: "Some parrots can learn over 1000 words and even use them in the right context. Smarty beaks! 🗣️" },
    { id: "crocodile", name: "Croc",      emoji: "🐊", sound: 70,  fact: "Crocodiles can hold their breath underwater for up to 2 hours. They also can't stick out their tongue! 😮" },
    { id: "flamingo",  name: "Flamingo",  emoji: "🦩", sound: 480, fact: "Flamingos are pink because of the shrimp they eat! They turn grey if they stop eating shrimp. 🍤" },
  ]
};

// ── State ──────────────────────────────────────
let soundEnabled = true;
let placedCount = 0;
let draggedAnimal = null;

// ── DOM ────────────────────────────────────────
const animalsGrid  = document.getElementById('animalsGrid');
const zooCanvas    = document.getElementById('zooCanvas');
const placedEl     = document.getElementById('placedAnimals');
const counter      = document.getElementById('counter');
const dropHint     = document.getElementById('dropHint');
const clearBtn     = document.getElementById('clearBtn');
const toggleSound  = document.getElementById('toggleSound');
const popup        = document.getElementById('popup');
const popupEmoji   = document.getElementById('popupEmoji');
const popupName    = document.getElementById('popupName');
const popupFact    = document.getElementById('popupFact');
const popupClose   = document.getElementById('popupClose');

// ── Build Palette ──────────────────────────────
function buildPalette() {
  animalsGrid.innerHTML = '';
  projectData.animals.forEach(animal => {
    const card = document.createElement('div');
    card.className = 'animal-card';
    card.draggable = true;
    card.dataset.id = animal.id;
    card.innerHTML = `<span class="animal-emoji">${animal.emoji}</span><span class="animal-label">${animal.name}</span>`;

    // Desktop drag
    card.addEventListener('dragstart', e => {
      draggedAnimal = animal;
      e.dataTransfer.effectAllowed = 'copy';
    });

    // Mobile / click to place in center
    card.addEventListener('click', () => placeAnimal(animal, randomPos()));

    animalsGrid.appendChild(card);
  });
}

// ── Drop Zone ──────────────────────────────────
zooCanvas.addEventListener('dragover', e => {
  e.preventDefault();
  e.dataTransfer.dropEffect = 'copy';
  zooCanvas.classList.add('drag-over');
});
zooCanvas.addEventListener('dragleave', () => zooCanvas.classList.remove('drag-over'));
zooCanvas.addEventListener('drop', e => {
  e.preventDefault();
  zooCanvas.classList.remove('drag-over');
  if (!draggedAnimal) return;
  const rect = zooCanvas.getBoundingClientRect();
  const x = e.clientX - rect.left;
  const y = e.clientY - rect.top;
  placeAnimal(draggedAnimal, { x, y });
  draggedAnimal = null;
});

// ── Place Animal ───────────────────────────────
function placeAnimal(animal, pos) {
  dropHint.classList.add('hidden');

  const el = document.createElement('span');
  el.className = 'placed';
  el.textContent = animal.emoji;
  el.title = animal.name;
  el.style.left = `${pos.x}px`;
  el.style.top  = `${pos.y}px`;
  el.dataset.id = animal.id;

  placedEl.appendChild(el);
  placedCount++;
  counter.textContent = placedCount;

  // Play sound
  if (soundEnabled) playSound(animal.sound);

  // Click to show fact
  el.addEventListener('click', () => {
    el.classList.remove('wiggle');
    void el.offsetWidth; // reflow
    el.classList.add('wiggle');
    showPopup(animal);
  });

  // Animate in done; no further action needed
}

// ── Random Position ────────────────────────────
function randomPos() {
  const rect = zooCanvas.getBoundingClientRect();
  return {
    x: 80 + Math.random() * (rect.width  - 160),
    y: 80 + Math.random() * (rect.height - 180),
  };
}

// ── Sound ──────────────────────────────────────
function playSound(freq) {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(freq, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(freq * 0.5, ctx.currentTime + 0.3);
    gain.gain.setValueAtTime(0.3, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.45);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.45);
  } catch (e) {
    // Audio not available
  }
}

// ── Popup ──────────────────────────────────────
function showPopup(animal) {
  popupEmoji.textContent = animal.emoji;
  popupName.textContent  = animal.name;
  popupFact.textContent  = animal.fact;
  popup.classList.add('show');
}
popupClose.addEventListener('click', () => popup.classList.remove('show'));
popup.addEventListener('click', e => { if (e.target === popup) popup.classList.remove('show'); });

// ── Controls ───────────────────────────────────
clearBtn.addEventListener('click', () => {
  placedEl.innerHTML = '';
  placedCount = 0;
  counter.textContent = 0;
  dropHint.classList.remove('hidden');
});

toggleSound.addEventListener('click', () => {
  soundEnabled = !soundEnabled;
  toggleSound.textContent = soundEnabled ? '🔊 Sound: ON' : '🔇 Sound: OFF';
});

// ── Init ───────────────────────────────────────
buildPalette();
