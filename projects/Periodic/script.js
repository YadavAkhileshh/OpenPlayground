// =====================================================
//  ELEMENT VAULT — script.js
//  Periodic Table Explorer
// =====================================================

// ------ ELEMENT DATA (selected real elements) ------
const ELEMENTS = [
  { n:1,  sym:"H",  name:"Hydrogen",     cat:"nonmetal",        period:1, group:1,  block:"s", phase:"Gas",    en:2.20, bp:-252.9, mass:1.008,   summary:"The lightest and most abundant element in the universe, making up about 75% of all normal matter by mass." },
  { n:2,  sym:"He", name:"Helium",       cat:"noble-gas",       period:1, group:18, block:"s", phase:"Gas",    en:null, bp:-268.9, mass:4.003,   summary:"The second lightest element, inert and colorless. Used in balloons, cryogenics, and as a protective atmosphere for arc welding." },
  { n:3,  sym:"Li", name:"Lithium",      cat:"alkali-metal",    period:2, group:1,  block:"s", phase:"Solid",  en:0.98, bp:1342,   mass:6.941,   summary:"The lightest metal and the lightest solid element. Widely used in rechargeable batteries and psychiatric medications." },
  { n:4,  sym:"Be", name:"Beryllium",    cat:"alkaline-earth",  period:2, group:2,  block:"s", phase:"Solid",  en:1.57, bp:2469,   mass:9.012,   summary:"A steel-grey, strong, lightweight and brittle alkaline earth metal. Highly toxic when inhaled as dust or fumes." },
  { n:5,  sym:"B",  name:"Boron",        cat:"metalloid",       period:2, group:13, block:"p", phase:"Solid",  en:2.04, bp:2076,   mass:10.81,   summary:"A metalloid essential for plant growth. Used in fiberglass, borax cleaning products, and nuclear reactor control rods." },
  { n:6,  sym:"C",  name:"Carbon",       cat:"nonmetal",        period:2, group:14, block:"p", phase:"Solid",  en:2.55, bp:3642,   mass:12.011,  summary:"The basis of all known life on Earth. Exists in multiple allotropes including graphite, diamond, and graphene." },
  { n:7,  sym:"N",  name:"Nitrogen",     cat:"nonmetal",        period:2, group:15, block:"p", phase:"Gas",    en:3.04, bp:-195.8, mass:14.007,  summary:"Makes up 78% of Earth's atmosphere. Essential for proteins and nucleic acids in all living organisms." },
  { n:8,  sym:"O",  name:"Oxygen",       cat:"nonmetal",        period:2, group:16, block:"p", phase:"Gas",    en:3.44, bp:-183.0, mass:15.999,  summary:"The third most abundant element in the universe by mass. Essential for combustion and aerobic respiration in life." },
  { n:9,  sym:"F",  name:"Fluorine",     cat:"halogen",         period:2, group:17, block:"p", phase:"Gas",    en:3.98, bp:-188.1, mass:18.998,  summary:"The most electronegative element and the most reactive nonmetal. Used in toothpaste and as Teflon coating." },
  { n:10, sym:"Ne", name:"Neon",         cat:"noble-gas",       period:2, group:18, block:"p", phase:"Gas",    en:null, bp:-246.1, mass:20.180,  summary:"A noble gas that glows a distinctive reddish-orange in neon lights. The fifth most abundant element in the universe." },
  { n:11, sym:"Na", name:"Sodium",       cat:"alkali-metal",    period:3, group:1,  block:"s", phase:"Solid",  en:0.93, bp:883,    mass:22.990,  summary:"A soft, silvery-white metal that reacts vigorously with water. Essential for nerve impulse transmission in animals." },
  { n:12, sym:"Mg", name:"Magnesium",    cat:"alkaline-earth",  period:3, group:2,  block:"s", phase:"Solid",  en:1.31, bp:1091,   mass:24.305,  summary:"A shiny grey metal that burns with a brilliant white flame. Essential for chlorophyll in plants." },
  { n:13, sym:"Al", name:"Aluminum",     cat:"post-transition", period:3, group:13, block:"p", phase:"Solid",  en:1.61, bp:2519,   mass:26.982,  summary:"The most abundant metal in Earth's crust. Lightweight, corrosion-resistant, and infinitely recyclable." },
  { n:14, sym:"Si", name:"Silicon",      cat:"metalloid",       period:3, group:14, block:"p", phase:"Solid",  en:1.90, bp:3265,   mass:28.086,  summary:"The backbone of modern electronics. Semiconducting properties make it ideal for microchips and solar cells." },
  { n:15, sym:"P",  name:"Phosphorus",   cat:"nonmetal",        period:3, group:15, block:"p", phase:"Solid",  en:2.19, bp:280.5,  mass:30.974,  summary:"Essential for DNA, RNA, and ATP in all living things. Exists as white (toxic) and red (stable) allotropes." },
  { n:16, sym:"S",  name:"Sulfur",       cat:"nonmetal",        period:3, group:16, block:"p", phase:"Solid",  en:2.58, bp:444.7,  mass:32.06,   summary:"A bright yellow non-metal known since ancient times. Used in gunpowder, matches, and vulcanizing rubber." },
  { n:17, sym:"Cl", name:"Chlorine",     cat:"halogen",         period:3, group:17, block:"p", phase:"Gas",    en:3.16, bp:-34.1,  mass:35.45,   summary:"A pale yellow-green gas used in water purification and as a building block for many industrial chemicals." },
  { n:18, sym:"Ar", name:"Argon",        cat:"noble-gas",       period:3, group:18, block:"p", phase:"Gas",    en:null, bp:-185.8, mass:39.948,  summary:"The third most abundant gas in Earth's atmosphere (0.93%). Used as an inert shielding gas in welding." },
  { n:19, sym:"K",  name:"Potassium",    cat:"alkali-metal",    period:4, group:1,  block:"s", phase:"Solid",  en:0.82, bp:759,    mass:39.098,  summary:"An essential mineral nutrient critical for nerve and muscle function in all animals. Found abundantly in bananas." },
  { n:20, sym:"Ca", name:"Calcium",      cat:"alkaline-earth",  period:4, group:2,  block:"s", phase:"Solid",  en:1.00, bp:1484,   mass:40.078,  summary:"The most abundant metal in the human body, forming bones and teeth. Fifth most abundant element in Earth's crust." },
  { n:21, sym:"Sc", name:"Scandium",     cat:"transition-metal",period:4, group:3,  block:"d", phase:"Solid",  en:1.36, bp:2836,   mass:44.956,  summary:"A soft silvery metal, often classified as a rare earth element. Used in aerospace alloys and high-intensity lamps." },
  { n:22, sym:"Ti", name:"Titanium",     cat:"transition-metal",period:4, group:4,  block:"d", phase:"Solid",  en:1.54, bp:3287,   mass:47.867,  summary:"Renowned for its high strength-to-weight ratio and corrosion resistance. Used in aerospace, medical implants, and architecture." },
  { n:23, sym:"V",  name:"Vanadium",     cat:"transition-metal",period:4, group:5,  block:"d", phase:"Solid",  en:1.63, bp:3407,   mass:50.942,  summary:"A hard, silvery-grey metal used to strengthen steel alloys for tools, springs, and jet engines." },
  { n:24, sym:"Cr", name:"Chromium",     cat:"transition-metal",period:4, group:6,  block:"d", phase:"Solid",  en:1.66, bp:2671,   mass:51.996,  summary:"Gives stainless steel its corrosion resistance and shiny finish. Also responsible for the red color of rubies." },
  { n:25, sym:"Mn", name:"Manganese",    cat:"transition-metal",period:4, group:7,  block:"d", phase:"Solid",  en:1.55, bp:2061,   mass:54.938,  summary:"An essential trace element for all known living organisms. Crucial in steel production for hardness and strength." },
  { n:26, sym:"Fe", name:"Iron",         cat:"transition-metal",period:4, group:8,  block:"d", phase:"Solid",  en:1.83, bp:2861,   mass:55.845,  summary:"The most common element on Earth by mass. The core of hemoglobin in blood, and the basis of steel civilization." },
  { n:27, sym:"Co", name:"Cobalt",       cat:"transition-metal",period:4, group:9,  block:"d", phase:"Solid",  en:1.88, bp:2927,   mass:58.933,  summary:"Used in superalloys for jet engines, lithium-ion batteries, and as a blue pigment in glass and ceramics." },
  { n:28, sym:"Ni", name:"Nickel",       cat:"transition-metal",period:4, group:10, block:"d", phase:"Solid",  en:1.91, bp:2913,   mass:58.693,  summary:"Resistant to oxidation and corrosion. Used in stainless steel, rechargeable batteries, and coins worldwide." },
  { n:29, sym:"Cu", name:"Copper",       cat:"transition-metal",period:4, group:11, block:"d", phase:"Solid",  en:1.90, bp:2562,   mass:63.546,  summary:"One of the few metals that can occur in nature in directly usable metallic form. Essential for electrical wiring." },
  { n:30, sym:"Zn", name:"Zinc",         cat:"transition-metal",period:4, group:12, block:"d", phase:"Solid",  en:1.65, bp:907,    mass:65.38,   summary:"Essential trace element for all life. Used to galvanize steel and in die casting for automotive and hardware parts." },
  { n:31, sym:"Ga", name:"Gallium",      cat:"post-transition", period:4, group:13, block:"p", phase:"Solid",  en:1.81, bp:2229,   mass:69.723,  summary:"Melts just above room temperature. Used in semiconductors, LEDs, and solar panels." },
  { n:32, sym:"Ge", name:"Germanium",    cat:"metalloid",       period:4, group:14, block:"p", phase:"Solid",  en:2.01, bp:2833,   mass:72.630,  summary:"A lustrous grey metalloid used in semiconductors, fiber optics, and infrared optics." },
  { n:33, sym:"As", name:"Arsenic",      cat:"metalloid",       period:4, group:15, block:"p", phase:"Solid",  en:2.18, bp:614,    mass:74.922,  summary:"A notoriously toxic metalloid historically used in medicines and pigments. Used in semiconductors today." },
  { n:34, sym:"Se", name:"Selenium",     cat:"nonmetal",        period:4, group:16, block:"p", phase:"Solid",  en:2.55, bp:685,    mass:78.971,  summary:"A trace element essential to human health. Used in glass manufacturing and photocopier drums." },
  { n:35, sym:"Br", name:"Bromine",      cat:"halogen",         period:4, group:17, block:"p", phase:"Liquid", en:2.96, bp:59.0,   mass:79.904,  summary:"One of only two elements liquid at room temperature. Used in flame retardants and photographic film." },
  { n:36, sym:"Kr", name:"Krypton",      cat:"noble-gas",       period:4, group:18, block:"p", phase:"Gas",    en:3.00, bp:-153.2, mass:83.798,  summary:"A rare noble gas. A krypton isotope once defined the meter. Used in some fluorescent lamps." },
  // Period 5
  { n:37, sym:"Rb", name:"Rubidium",     cat:"alkali-metal",    period:5, group:1,  block:"s", phase:"Solid",  en:0.82, bp:688,    mass:85.468,  summary:"A soft, silvery-white metal. Atomic clocks based on rubidium are widely used in telecommunications." },
  { n:38, sym:"Sr", name:"Strontium",    cat:"alkaline-earth",  period:5, group:2,  block:"s", phase:"Solid",  en:0.95, bp:1382,   mass:87.620,  summary:"Gives fireworks and flares a bright red color. Its radioactive isotope Sr-90 is a dangerous nuclear fallout product." },
  { n:47, sym:"Ag", name:"Silver",       cat:"transition-metal",period:5, group:11, block:"d", phase:"Solid",  en:1.93, bp:2162,   mass:107.87,  summary:"The metal with the highest electrical conductivity. Used in jewelry, mirrors, and antimicrobial applications." },
  { n:48, sym:"Cd", name:"Cadmium",      cat:"transition-metal",period:5, group:12, block:"d", phase:"Solid",  en:1.69, bp:767,    mass:112.41,  summary:"A toxic heavy metal used in Ni-Cd batteries and as a yellow pigment. A significant environmental pollutant." },
  { n:50, sym:"Sn", name:"Tin",          cat:"post-transition", period:5, group:14, block:"p", phase:"Solid",  en:1.96, bp:2602,   mass:118.71,  summary:"One of the earliest metals known to humanity. Combined with copper to make bronze, transforming civilization." },
  { n:53, sym:"I",  name:"Iodine",       cat:"halogen",         period:5, group:17, block:"p", phase:"Solid",  en:2.66, bp:184.4,  mass:126.90,  summary:"Essential for thyroid hormone production. Sublimes to a beautiful violet gas. Used as an antiseptic." },
  { n:54, sym:"Xe", name:"Xenon",        cat:"noble-gas",       period:5, group:18, block:"p", phase:"Gas",    en:2.60, bp:-108.1, mass:131.29,  summary:"Used in flash lamps, xenon arc lamps, and as an anesthetic. Can form chemical compounds unlike most noble gases." },
  // Period 6
  { n:55, sym:"Cs", name:"Cesium",       cat:"alkali-metal",    period:6, group:1,  block:"s", phase:"Solid",  en:0.79, bp:671,    mass:132.91,  summary:"The most electropositive element. Cesium-133 atomic clocks define the international second with stunning precision." },
  { n:56, sym:"Ba", name:"Barium",       cat:"alkaline-earth",  period:6, group:2,  block:"s", phase:"Solid",  en:0.89, bp:1845,   mass:137.33,  summary:"A heavy alkaline earth metal. Barium sulfate is used as an X-ray contrast agent to image the digestive system." },
  { n:74, sym:"W",  name:"Tungsten",     cat:"transition-metal",period:6, group:6,  block:"d", phase:"Solid",  en:2.36, bp:5555,   mass:183.84,  summary:"Has the highest melting point of all elements (3422°C). Used in incandescent light bulb filaments and drill bits." },
  { n:78, sym:"Pt", name:"Platinum",     cat:"transition-metal",period:6, group:10, block:"d", phase:"Solid",  en:2.28, bp:3825,   mass:195.08,  summary:"A dense, malleable precious metal highly resistant to corrosion. Vital in catalytic converters and cancer drugs." },
  { n:79, sym:"Au", name:"Gold",         cat:"transition-metal",period:6, group:11, block:"d", phase:"Solid",  en:2.54, bp:2856,   mass:196.97,  summary:"Prized since antiquity for its luster and rarity. An excellent conductor used in electronics and satellites." },
  { n:80, sym:"Hg", name:"Mercury",      cat:"transition-metal",period:6, group:12, block:"d", phase:"Liquid", en:2.00, bp:356.7,  mass:200.59,  summary:"The only metal liquid at room temperature. Used in thermometers and fluorescent lamps. Highly toxic." },
  { n:82, sym:"Pb", name:"Lead",         cat:"post-transition", period:6, group:14, block:"p", phase:"Solid",  en:2.33, bp:1749,   mass:207.20,  summary:"A heavy metal used since antiquity. Used in batteries, radiation shielding, and (now banned) in paints and gasoline." },
  { n:86, sym:"Rn", name:"Radon",        cat:"noble-gas",       period:6, group:18, block:"p", phase:"Gas",    en:null, bp:-61.7,  mass:222.00,  summary:"A radioactive noble gas produced by the decay of radium. A significant health hazard accumulating in basements." },
  // Lanthanides (period 6, f-block)
  { n:57, sym:"La", name:"Lanthanum",    cat:"lanthanide",      period:6, group:null,block:"f", phase:"Solid", en:1.10, bp:3464,   mass:138.91,  summary:"The first lanthanide. Used in camera and telescope lenses, hydrogen storage, and catalytic converters." },
  { n:58, sym:"Ce", name:"Cerium",       cat:"lanthanide",      period:6, group:null,block:"f", phase:"Solid", en:1.12, bp:3443,   mass:140.12,  summary:"The most abundant rare earth element. Used in catalytic converters, glass polishing, and lighter flints." },
  { n:60, sym:"Nd", name:"Neodymium",    cat:"lanthanide",      period:6, group:null,block:"f", phase:"Solid", en:1.14, bp:3074,   mass:144.24,  summary:"Creates the world's strongest permanent magnets used in hard drives, headphones, and electric motors." },
  { n:63, sym:"Eu", name:"Europium",     cat:"lanthanide",      period:6, group:null,block:"f", phase:"Solid", en:null, bp:1529,   mass:151.96,  summary:"The most reactive rare earth element. Used as a red and blue phosphor in color TV screens and anti-counterfeiting in Euro banknotes." },
  // Actinides (period 7, f-block)
  { n:92, sym:"U",  name:"Uranium",      cat:"actinide",        period:7, group:null,block:"f", phase:"Solid", en:1.38, bp:4131,   mass:238.03,  summary:"The heaviest naturally occurring element. Fissile U-235 is used as nuclear reactor fuel and in atomic bombs." },
  { n:94, sym:"Pu", name:"Plutonium",    cat:"actinide",        period:7, group:null,block:"f", phase:"Solid", en:1.28, bp:3228,   mass:244.00,  summary:"A radioactive transuranic metal. Pu-239 is a key material in nuclear weapons and a fuel for some reactors." },
  { n:88, sym:"Ra", name:"Radium",       cat:"actinide",        period:7, group:2,   block:"s", phase:"Solid", en:0.90, bp:1737,   mass:226.00,  summary:"A highly radioactive element discovered by Marie and Pierre Curie in 1898. Historically used in luminous paints." },
  // Period 7 s-block
  { n:87, sym:"Fr", name:"Francium",     cat:"alkali-metal",    period:7, group:1,  block:"s", phase:"Solid",  en:0.70, bp:677,    mass:223.00,  summary:"The second most electropositive element and the heaviest known alkali metal. Extremely rare and radioactive." },
  // Some period 7 transition metals
  { n:111, sym:"Rg", name:"Roentgenium", cat:"transition-metal",period:7, group:11, block:"d", phase:"Solid", en:null, bp:null,    mass:282.00,  summary:"A synthetic radioactive element with a half-life of only 26 seconds, named after physicist Wilhelm Röntgen." },
  { n:118, sym:"Og", name:"Oganesson",   cat:"noble-gas",       period:7, group:18, block:"p", phase:"Solid",  en:null, bp:null,   mass:294.00,  summary:"The heaviest known element, synthesized in 2002. Named after physicist Yuri Oganessian. Extremely unstable." },
];

// Periodic table layout: [atomicNumber, gridCol, gridRow]
// Standard periodic table grid positions
const POSITIONS = {
  1:  [1, 1],   2:  [18,1],
  3:  [1, 2],   4:  [2, 2],                                                             5:  [13,2],  6:  [14,2],  7:  [15,2],  8:  [16,2],  9:  [17,2],  10: [18,2],
  11: [1, 3],   12: [2, 3],                                                             13: [13,3], 14: [14,3], 15: [15,3], 16: [16,3], 17: [17,3], 18: [18,3],
  19: [1, 4],   20: [2, 4], 21:[3,4],  22:[4,4],  23:[5,4],  24:[6,4],  25:[7,4], 26:[8,4],  27:[9,4],  28:[10,4], 29:[11,4], 30:[12,4], 31:[13,4], 32:[14,4], 33:[15,4], 34:[16,4], 35:[17,4], 36:[18,4],
  37: [1, 5],   38: [2, 5], 39:[3,5],                                                                      47:[11,5], 48:[12,5],           50:[14,5],                     53:[17,5], 54:[18,5],
  55: [1, 6],   56: [2, 6],                        74:[6,6],                           78:[10,6], 79:[11,6], 80:[12,6],           82:[14,6],                              86:[18,6],
  87: [1, 7],   88: [2, 7],
  // Lanthanides row 9
  57: [3, 9],   58:[4,9],              60:[6,9],              63:[9,9],
  // Actinides row 10
  92: [6,10],   94:[8,10],             88: [2,7],
  // Synthetic elements
  111:[11,7],
  118:[18,7],
};

const CAT_COLORS = {
  "alkali-metal":    "var(--alkali-metal)",
  "alkaline-earth":  "var(--alkaline-earth)",
  "transition-metal":"var(--transition-metal)",
  "post-transition": "var(--post-transition)",
  "metalloid":       "var(--metalloid)",
  "nonmetal":        "var(--nonmetal)",
  "halogen":         "var(--halogen)",
  "noble-gas":       "var(--noble-gas)",
  "lanthanide":      "var(--lanthanide)",
  "actinide":        "var(--actinide)",
  "unknown":         "var(--unknown)",
};

// Resolve CSS var to actual color (for panel CSS variable)
const CAT_HEX = {
  "alkali-metal":    "#f97316",
  "alkaline-earth":  "#facc15",
  "transition-metal":"#60a5fa",
  "post-transition": "#a78bfa",
  "metalloid":       "#34d399",
  "nonmetal":        "#fb7185",
  "halogen":         "#f472b6",
  "noble-gas":       "#818cf8",
  "lanthanide":      "#22d3ee",
  "actinide":        "#e879f9",
  "unknown":         "#475569",
};

// ---- BUILD TABLE ----
const grid = document.getElementById('table-grid');

// We'll build the grid from the known elements
// For real layout we use CSS grid-column / grid-row
ELEMENTS.forEach(el => {
  const pos = POSITIONS[el.n];
  if (!pos) return;
  const [col, row] = pos;
  const card = document.createElement('div');
  card.className = 'el-card';
  card.dataset.n = el.n;
  card.dataset.cat = el.cat;
  card.style.gridColumn = col;
  card.style.gridRow = row;
  card.style.setProperty('--cat-color', CAT_HEX[el.cat] || CAT_HEX.unknown);
  card.style.animationDelay = `${(el.n * 7) % 400}ms`;

  card.innerHTML = `
    <span class="el-number">${el.n}</span>
    <span class="el-symbol">${el.sym}</span>
    <span class="el-name">${el.name}</span>
  `;

  card.addEventListener('click', (e) => { e.stopPropagation(); showDetail(el, card); });
  grid.appendChild(card);
});

// Lanthanide / Actinide label placeholders
function addLabel(text, col, row) {
  const lbl = document.createElement('div');
  lbl.className = 'el-card el-spacer';
  lbl.style.gridColumn = `${col} / span 2`;
  lbl.style.gridRow = row;
  lbl.style.fontSize = '0.5rem';
  lbl.style.color = 'var(--muted)';
  lbl.style.fontFamily = 'var(--font-mono)';
  lbl.style.border = '1px dashed rgba(255,255,255,0.07)';
  lbl.style.borderRadius = '6px';
  lbl.style.display = 'flex';
  lbl.style.alignItems = 'center';
  lbl.style.justifyContent = 'center';
  lbl.style.letterSpacing = '0.05em';
  lbl.textContent = text;
  grid.appendChild(lbl);
}
addLabel('57–71 Lanthanides', 3, 6);
addLabel('89–103 Actinides', 3, 7);

// ---- DETAIL PANEL ----
const panel = document.getElementById('detail-panel');
const closeBtn = document.getElementById('close-panel');
let selectedCard = null;

function showDetail(el, card) {
  if (selectedCard) selectedCard.classList.remove('selected');
  selectedCard = card;
  card.classList.add('selected');

  const color = CAT_HEX[el.cat] || CAT_HEX.unknown;
  panel.style.setProperty('--panel-color', color);
  panel.querySelector('.panel-symbol-block').style.borderColor = color;
  panel.querySelector('.panel-symbol-block').style.boxShadow = `0 0 24px ${color}`;

  document.getElementById('p-number').textContent = el.n;
  document.getElementById('p-symbol').textContent = el.sym;
  document.getElementById('p-mass').textContent = el.mass + ' u';
  document.getElementById('p-name').textContent = el.name;
  document.getElementById('p-category-label').textContent = el.cat.replace(/-/g,' ');
  document.getElementById('p-category-label').style.background = color;
  document.getElementById('p-phase').textContent = el.phase;
  document.getElementById('p-period').textContent = el.period;
  document.getElementById('p-group').textContent = el.group ?? 'f-block';
  document.getElementById('p-block').textContent = el.block + '-block';
  document.getElementById('p-en').textContent = el.en != null ? el.en : '—';
  document.getElementById('p-bp').textContent = el.bp != null ? el.bp + ' °C' : '—';
  document.getElementById('p-summary').textContent = el.summary;

  document.getElementById('p-symbol').style.color = color;
  document.getElementById('p-symbol').style.textShadow = `0 0 16px ${color}`;

  panel.classList.remove('hidden');
}

closeBtn.addEventListener('click', (e) => {
  e.stopPropagation();
  panel.classList.add('hidden');
  if (selectedCard) selectedCard.classList.remove('selected');
  selectedCard = null;
});

// ---- SEARCH ----
const searchInput = document.getElementById('search');
searchInput.addEventListener('input', applyFilters);

// ---- FILTER BUTTONS ----
let activeFilter = 'all';
document.querySelectorAll('.filter-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    activeFilter = btn.dataset.filter;
    applyFilters();
  });
});

function applyFilters() {
  const q = searchInput.value.toLowerCase().trim();
  const cards = document.querySelectorAll('.el-card:not(.el-spacer)');

  cards.forEach(card => {
    const n = parseInt(card.dataset.n);
    const el = ELEMENTS.find(e => e.n === n);
    if (!el) { card.classList.add('dimmed'); return; }

    const matchSearch = !q ||
      el.name.toLowerCase().includes(q) ||
      el.sym.toLowerCase().includes(q) ||
      String(el.n).includes(q);

    const matchFilter = activeFilter === 'all' || el.cat === activeFilter;

    card.classList.toggle('dimmed', !(matchSearch && matchFilter));
  });
}

// Close panel clicking outside
document.addEventListener('click', (e) => {
  if (!panel.classList.contains('hidden') &&
      !panel.contains(e.target) &&
      !e.target.closest('.el-card')) {
    panel.classList.add('hidden');
    if (selectedCard) selectedCard.classList.remove('selected');
    selectedCard = null;
  }
});
















































































































































































































































console.log(`%c⚛ ElementVault loaded — ${ELEMENTS.length} elements in database`, 'color:#00f5d4;font-family:monospace;font-size:14px');