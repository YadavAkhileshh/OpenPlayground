

























































































































































const REGIONS = [
  {
    id: "india",
    name: "India",
    continent: "Asia",
    instrument: "Sitar",
    genre: "Hindustani Classical",
    description: "The sitar, with its 18–20 strings, creates the meditative drone of Indian classical music. Ragas are mapped to specific times of day, mirroring nature's own cycles.",
    funFact: "A single raga performance can last 3–4 hours of pure improvisation.",
    emoji: "🪕",
    color: "#FF9933",
    top: "42%", left: "66%"
  },
  {
    id: "japan",
    name: "Japan",
    continent: "Asia",
    instrument: "Shamisen",
    genre: "Traditional Hogaku",
    description: "The three-stringed shamisen is struck with a large plectrum called a bachi. Its sharp, percussive tone defines kabuki theater and geisha performances across centuries.",
    funFact: "Shamisen strings were traditionally crafted from cat or dog skin.",
    emoji: "🎸",
    color: "#E53935",
    top: "30%", left: "80%"
  },
  {
    id: "brazil",
    name: "Brazil",
    continent: "South America",
    instrument: "Berimbau",
    genre: "Capoeira / Samba",
    description: "The berimbau is a single-string percussion bow central to capoeira martial arts. Its hypnotic rhythms dictate the pace and energy of the fight-dance below it.",
    funFact: "The berimbau arrived in Brazil from Central Africa via the transatlantic slave trade.",
    emoji: "🪘",
    color: "#43A047",
    top: "65%", left: "28%"
  },
  {
    id: "scotland",
    name: "Scotland",
    continent: "Europe",
    instrument: "Bagpipes",
    genre: "Celtic Folk",
    description: "The Great Highland Bagpipe has nine pipes — a chanter, bass drone, and two tenors. Its wailing cry was used to rally Scottish clans in battle for centuries.",
    funFact: "Playing bagpipes was banned by the British Crown after the Jacobite uprising of 1745.",
    emoji: "🎶",
    color: "#1E88E5",
    top: "17%", left: "44%"
  },
  {
    id: "ghana",
    name: "Ghana",
    continent: "Africa",
    instrument: "Kora",
    genre: "West African Griot",
    description: "The kora has 21 strings and is played exclusively by hereditary musicians called griots. It simultaneously functions as a harp, lute, and spiritual bridge between the living and ancestors.",
    funFact: "Mastering the kora traditionally requires 7 years of apprenticeship under a master griot.",
    emoji: "🎵",
    color: "#FDD835",
    top: "50%", left: "43%"
  },
  {
    id: "peru",
    name: "Peru",
    continent: "South America",
    instrument: "Charango",
    genre: "Andean Folk",
    description: "The charango is a small 10-stringed lute from the Andean highlands, traditionally crafted from the shell of an armadillo. Its bright, crisp tone echoes across mountain valleys.",
    funFact: "The charango was developed by indigenous musicians adapting the Spanish vihuela after colonization.",
    emoji: "🪗",
    color: "#FB8C00",
    top: "63%", left: "22%"
  }
];

// ── CONTINENT LABELS ─────────────────────────────────────────
const CONTINENT_LABELS = [
  { name: "NORTH AMERICA", top: "28%", left: "13%" },
  { name: "SOUTH AMERICA", top: "58%", left: "20%" },
  { name: "EUROPE",        top: "22%", left: "46%" },
  { name: "AFRICA",        top: "46%", left: "47%" },
  { name: "ASIA",          top: "28%", left: "65%" },
  { name: "OCEANIA",       top: "65%", left: "78%" }
];

// ── RENDER PINS ──────────────────────────────────────────────
function renderPins() {
  const mapArea = document.getElementById("map-area");

  // Add continent labels
  CONTINENT_LABELS.forEach(cl => {
    const el = document.createElement("div");
    el.className = "continent-label";
    el.style.top  = cl.top;
    el.style.left = cl.left;
    el.textContent = cl.name;
    mapArea.appendChild(el);
  });

  // Add pins
  REGIONS.forEach(region => {
    const pin = document.createElement("div");
    pin.className = "region-pin";
    pin.id = "pin-" + region.id;
    pin.style.top  = region.top;
    pin.style.left = region.left;
    pin.style.setProperty("--pin-color", region.color);

    pin.innerHTML = `
      <div class="pin-ripple" style="border-color:${region.color}"></div>
      <div class="pin-label">${region.name}</div>
      <div class="pin-outer" style="background:${region.color}"></div>
    `;

    pin.addEventListener("click", () => selectRegion(region.id));
    mapArea.appendChild(pin);
  });
}

// ── RENDER SIDEBAR LIST ──────────────────────────────────────
function renderList() {
  const list = document.getElementById("region-list");
  list.innerHTML = `<div class="region-list-title">All Regions</div>`;

  REGIONS.forEach(region => {
    const item = document.createElement("div");
    item.className = "region-list-item";
    item.id = "list-" + region.id;
    item.innerHTML = `
      <span class="dot" style="background:${region.color}"></span>
      <span>${region.name}</span>
      <span class="inst">${region.instrument}</span>
    `;
    item.addEventListener("click", () => selectRegion(region.id));
    list.appendChild(item);
  });
}

// ── SELECT REGION ────────────────────────────────────────────
function selectRegion(id) {
  const region = REGIONS.find(r => r.id === id);
  if (!region) return;

  // Highlight pin
  document.querySelectorAll(".region-pin").forEach(p => p.classList.remove("active"));
  const pin = document.getElementById("pin-" + id);
  if (pin) pin.classList.add("active");

  // Highlight list item
  document.querySelectorAll(".region-list-item").forEach(i => {
    i.style.color = "";
    i.style.fontWeight = "";
  });
  const listItem = document.getElementById("list-" + id);
  if (listItem) {
    listItem.style.color = region.color;
    listItem.style.fontWeight = "700";
  }

  // Render detail
  document.getElementById("region-detail").innerHTML = `
    <div class="region-card">
      <span class="emoji">${region.emoji}</span>
      <div class="country-name">${region.name}</div>
      <div class="continent">${region.continent}</div>
      <span class="tag tag-dark">${region.instrument}</span>
      <span class="tag tag-red">${region.genre}</span>
      <p class="desc">${region.description}</p>
      <div class="fun-fact">${region.funFact}</div>
    </div>
  `;
}

// ── INIT ─────────────────────────────────────────────────────
renderPins();
renderList();
