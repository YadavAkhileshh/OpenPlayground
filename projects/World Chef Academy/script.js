

// ── Country Data ──────────────────────────────
const COUNTRIES = [
  {
    id:"italy", name:"Italy", flag:"🇮🇹", continent:"Europe",
    capital:"Rome", population:"60 million", language:"Italian",
    facts:[
      { icon:"🎨", text:"Italy has more UNESCO World Heritage Sites than any other country!" },
      { icon:"🍕", text:"Pizza was invented in Naples in the 1800s. Margherita pizza was named after a queen!" },
      { icon:"⛲", text:"Rome has over 2,000 fountains — more than any other city on Earth." },
      { icon:"🎭", text:"Italy gave the world opera, the piano, and the violin." }
    ],
    dish:{
      name:"Spaghetti Bolognese", emoji:"🍝", cookEmoji:"🥘",
      tip:"💡 Real Bolognese sauce simmers for hours! Patience is the secret ingredient.",
      cultureFact:"Spaghetti Bolognese is so beloved that Italian food culture was added to UNESCO's Intangible Cultural Heritage list!",
      steps:[
        { label:"Chop onions & garlic", ingredient:"🧅", name:"Onion & Garlic" },
        { label:"Brown the minced meat", ingredient:"🥩", name:"Minced Beef" },
        { label:"Add tomato sauce",      ingredient:"🍅", name:"Tomatoes" },
        { label:"Cook the spaghetti",   ingredient:"🍝", name:"Spaghetti" },
        { label:"Grate parmesan on top",ingredient:"🧀", name:"Parmesan" }
      ],
      wrong:[
        { emoji:"🍫", name:"Chocolate" },
        { emoji:"🍓", name:"Strawberry" },
        { emoji:"🥕", name:"Carrot" }
      ]
    }
  },
  {
    id:"japan", name:"Japan", flag:"🇯🇵", continent:"Asia",
    capital:"Tokyo", population:"125 million", language:"Japanese",
    facts:[
      { icon:"🌸", text:"Cherry blossom (Sakura) season is a huge celebration — people have picnics under the trees!" },
      { icon:"🏔️", text:"Mount Fuji is 3,776m tall. It's an active volcano and sacred symbol of Japan." },
      { icon:"🤖", text:"Japan has more robots than any country — they even have robot restaurants!" },
      { icon:"🎎", text:"Some Japanese businesses are over 1,000 years old — the world's oldest companies." }
    ],
    dish:{
      name:"Sushi Rolls", emoji:"🍣", cookEmoji:"🍱",
      tip:"💡 Becoming a sushi master in Japan takes 10+ years of training. Sushi rice seasoning is the chef's secret!",
      cultureFact:"Sushi originated in ancient Japan as a way to preserve fish. Japan's tradition is over 1,000 years old!",
      steps:[
        { label:"Cook sticky rice",        ingredient:"🍚", name:"Sushi Rice" },
        { label:"Place nori seaweed sheet", ingredient:"🌿", name:"Nori Seaweed" },
        { label:"Add fresh salmon",         ingredient:"🐟", name:"Salmon" },
        { label:"Slice avocado",            ingredient:"🥑", name:"Avocado" },
        { label:"Roll and slice!",          ingredient:"🔪", name:"Bamboo Roll" }
      ],
      wrong:[
        { emoji:"🍔", name:"Burger Patty" },
        { emoji:"🌽", name:"Corn" },
        { emoji:"🥓", name:"Bacon" }
      ]
    }
  },
  {
    id:"mexico", name:"Mexico", flag:"🇲🇽", continent:"North America",
    capital:"Mexico City", population:"130 million", language:"Spanish",
    facts:[
      { icon:"🌮", text:"Mexico is the birthplace of chocolate! Ancient Mayans drank it as a bitter liquid." },
      { icon:"🦋", text:"1 billion monarch butterflies migrate to Mexico every year — one of nature's most spectacular events." },
      { icon:"🏛️", text:"Mexico City is built on the ruins of Tenochtitlan, the ancient Aztec capital." },
      { icon:"🎉", text:"Día de los Muertos honours family members with colourful food and marigold flowers." }
    ],
    dish:{
      name:"Guacamole Tacos", emoji:"🌮", cookEmoji:"🥘",
      tip:"💡 'Guacamole' comes from the Aztec word 'ahuacamolli' meaning avocado sauce. Always make it fresh!",
      cultureFact:"Tacos have been eaten in Mexico for thousands of years. Mexican cuisine is UNESCO Intangible Cultural Heritage!",
      steps:[
        { label:"Mash ripe avocados",      ingredient:"🥑", name:"Avocado" },
        { label:"Squeeze in lime juice",   ingredient:"🍋", name:"Lime" },
        { label:"Mix in tomato & onion",   ingredient:"🍅", name:"Tomato" },
        { label:"Add spicy jalapeño",      ingredient:"🌶️", name:"Jalapeño" },
        { label:"Serve in warm tortilla",  ingredient:"🫓", name:"Tortilla" }
      ],
      wrong:[
        { emoji:"🍦", name:"Ice Cream" },
        { emoji:"🥜", name:"Peanuts" },
        { emoji:"🍇", name:"Grapes" }
      ]
    }
  },
  {
    id:"india", name:"India", flag:"🇮🇳", continent:"Asia",
    capital:"New Delhi", population:"1.4 billion", language:"Hindi + 21 others",
    facts:[
      { icon:"🐯", text:"India is home to more wild tigers than any other country — over 3,000 Bengal tigers!" },
      { icon:"🕌", text:"The Taj Mahal took 22 years and 20,000 workers to build. The marble changes colour through the day." },
      { icon:"🧮", text:"India invented the number zero and the decimal system — essential to all mathematics!" },
      { icon:"🎭", text:"Bollywood produces over 2,000 films per year — more than Hollywood!" }
    ],
    dish:{
      name:"Butter Chicken Curry", emoji:"🍛", cookEmoji:"🫕",
      tip:"💡 Butter Chicken was invented accidentally in 1950s Delhi! A chef mixed leftover chicken with tomato-cream sauce.",
      cultureFact:"India has over 30 distinct regional cuisines. Spices like turmeric and cardamom have been traded from India for 3,000 years!",
      steps:[
        { label:"Marinate chicken in yogurt", ingredient:"🍗", name:"Chicken" },
        { label:"Blend spices together",      ingredient:"🌶️", name:"Spices" },
        { label:"Melt butter in pan",         ingredient:"🧈", name:"Butter" },
        { label:"Add tomato sauce",           ingredient:"🍅", name:"Tomatoes" },
        { label:"Stir in cream",              ingredient:"🥛", name:"Cream" }
      ],
      wrong:[
        { emoji:"🍦", name:"Ice Cream" },
        { emoji:"🍣", name:"Sushi" },
        { emoji:"🥞", name:"Pancake" }
      ]
    }
  },
  {
    id:"france", name:"France", flag:"🇫🇷", continent:"Europe",
    capital:"Paris", population:"68 million", language:"French",
    facts:[
      { icon:"🗼", text:"The Eiffel Tower was meant to be temporary! It was nearly torn down after 20 years." },
      { icon:"🥐", text:"France bakes 10 billion baguettes a year. It's illegal to sell bread with artificial additives!" },
      { icon:"🎨", text:"The Louvre is the world's most visited art museum, housing over 35,000 works." },
      { icon:"🐓", text:"The rooster is France's national symbol — representing pride and alertness." }
    ],
    dish:{
      name:"Crêpes Suzette", emoji:"🥞", cookEmoji:"🍳",
      tip:"💡 Crêpes Suzette were invented by accident! A waiter spilled orange liqueur and it caught fire. Now it's a classic!",
      cultureFact:"French cuisine was added to UNESCO's heritage list. A proper French meal is a ceremony — appetizer, main, cheese, dessert, and coffee!",
      steps:[
        { label:"Mix flour and eggs",  ingredient:"🥚", name:"Eggs" },
        { label:"Pour in milk",        ingredient:"🥛", name:"Milk" },
        { label:"Add melted butter",   ingredient:"🧈", name:"Butter" },
        { label:"Fry thin crêpe",      ingredient:"🍳", name:"Pan Fry" },
        { label:"Top with orange zest",ingredient:"🍊", name:"Orange" }
      ],
      wrong:[
        { emoji:"🧄", name:"Garlic" },
        { emoji:"🥩", name:"Beef" },
        { emoji:"🌽", name:"Corn" }
      ]
    }
  },
  {
    id:"brazil", name:"Brazil", flag:"🇧🇷", continent:"South America",
    capital:"Brasília", population:"215 million", language:"Portuguese",
    facts:[
      { icon:"🌳", text:"The Amazon Rainforest produces 20% of the world's oxygen — it's called Earth's lungs!" },
      { icon:"⚽", text:"Brazil has won the FIFA World Cup 5 times — more than any other country!" },
      { icon:"🦜", text:"Brazil has more animal and plant species than any country on Earth." },
      { icon:"🎉", text:"Rio Carnival attracts 2 million people per day for 5 days of samba dancing and celebrations!" }
    ],
    dish:{
      name:"Brigadeiro", emoji:"🍫", cookEmoji:"🍬",
      tip:"💡 Brigadeiro was created in the 1940s and named after a Brigadier! It's Brazil's favourite sweet — made at every birthday!",
      cultureFact:"Brigadeiro is so beloved in Brazil that entire shops (brigadeirias) are dedicated to selling them in hundreds of flavours!",
      steps:[
        { label:"Heat condensed milk",        ingredient:"🥛", name:"Condensed Milk" },
        { label:"Add cocoa powder",           ingredient:"🍫", name:"Cocoa Powder" },
        { label:"Add butter",                 ingredient:"🧈", name:"Butter" },
        { label:"Roll into balls",            ingredient:"🫙", name:"Cool & Roll" },
        { label:"Coat in chocolate sprinkles",ingredient:"✨", name:"Sprinkles" }
      ],
      wrong:[
        { emoji:"🐟", name:"Fish" },
        { emoji:"🥦", name:"Broccoli" },
        { emoji:"🧅", name:"Onion" }
      ]
    }
  },
  {
    id:"egypt", name:"Egypt", flag:"🇪🇬", continent:"Africa",
    capital:"Cairo", population:"104 million", language:"Arabic",
    facts:[
      { icon:"🏛️", text:"The Great Pyramid is the oldest of the Seven Wonders — and the only one still standing!" },
      { icon:"🐊", text:"Ancient Egyptians worshipped cats as sacred. Killing a cat was punishable by death!" },
      { icon:"📜", text:"Egyptians invented hieroglyphics — one of the world's first writing systems, using 700+ symbols." },
      { icon:"🌊", text:"The Nile is the world's longest river at 6,650 km. Ancient Egypt was built around its floods." }
    ],
    dish:{
      name:"Koshari", emoji:"🫕", cookEmoji:"🥣",
      tip:"💡 Koshari is Egypt's national dish — a hearty mix of lentils, rice, pasta and tomato sauce. Cheap and absolutely delicious!",
      cultureFact:"Koshari vendors in Cairo serve thousands of bowls per day. It's a symbol of Egyptian identity — eaten by everyone from workers to presidents!",
      steps:[
        { label:"Boil lentils",            ingredient:"🫘", name:"Lentils" },
        { label:"Cook the rice",           ingredient:"🍚", name:"Rice" },
        { label:"Boil macaroni pasta",     ingredient:"🍝", name:"Pasta" },
        { label:"Make spiced tomato sauce",ingredient:"🍅", name:"Tomato Sauce" },
        { label:"Top with crispy onions",  ingredient:"🧅", name:"Fried Onions" }
      ],
      wrong:[
        { emoji:"🍦", name:"Ice Cream" },
        { emoji:"🍣", name:"Sushi" },
        { emoji:"🥝", name:"Kiwi" }
      ]
    }
  },
  {
    id:"usa", name:"USA", flag:"🇺🇸", continent:"North America",
    capital:"Washington D.C.", population:"335 million", language:"English",
    facts:[
      { icon:"🚀", text:"NASA landed humans on the Moon in 1969 — the only country to have done so!" },
      { icon:"🗽", text:"The Statue of Liberty was a gift from France, inscribed with July 4, 1776 — Independence Day." },
      { icon:"🎸", text:"The USA gave the world jazz, blues, rock and roll, hip hop, and country music." },
      { icon:"🌎", text:"The US has 63 national parks protecting over 340,000 km² — including the Grand Canyon!" }
    ],
    dish:{
      name:"Classic Cheeseburger", emoji:"🍔", cookEmoji:"🍳",
      tip:"💡 Over 50 billion burgers are eaten in the US per year! The cheeseburger was invented accidentally by a teenager in the 1920s.",
      cultureFact:"The cheeseburger was invented when 16-year-old Lionel Sternberger accidentally dropped cheese on a patty. America adopted it instantly!",
      steps:[
        { label:"Season beef patty",       ingredient:"🥩", name:"Beef Patty" },
        { label:"Grill until juicy",       ingredient:"🔥", name:"Grill" },
        { label:"Melt cheese on top",      ingredient:"🧀", name:"Cheese Slice" },
        { label:"Add lettuce & tomato",    ingredient:"🥬", name:"Lettuce & Tomato" },
        { label:"Place in toasted bun",    ingredient:"🍞", name:"Toasted Bun" }
      ],
      wrong:[
        { emoji:"🍣", name:"Sushi" },
        { emoji:"🫘", name:"Lentils" },
        { emoji:"🥑", name:"Avocado Mash" }
      ]
    }
  }
];

const CHEF_LEVELS = [
  { min:0,   title:"Apprentice",  emoji:"👨‍🍳" },
  { min:200, title:"Home Cook",   emoji:"🧑‍🍳" },
  { min:400, title:"Sous Chef",   emoji:"🧑‍🍳" },
  { min:600, title:"Head Chef",   emoji:"👨‍🍳" },
  { min:800, title:"Master Chef", emoji:"🏆" }
];

// ── State ─────────────────────────────────────
let score = 0;
let visitedCountries = new Set();
let currentCountry = null;
let currentStepIdx = 0;
let draggedIngredient = null;

// ── DOM ───────────────────────────────────────
const splashEl   = document.getElementById('splash');
const scoreNum   = document.getElementById('scoreNum');
const chefLevel  = document.getElementById('chefLevel');
const stampDots  = document.getElementById('stampDots');
function $(id){ return document.getElementById(id); }

// ── Screens ───────────────────────────────────
function showScreen(id){
  document.querySelectorAll('.screen').forEach(s=>s.classList.remove('active'));
  $(id).classList.add('active');
}

// ── Floating Food BG ──────────────────────────
function initFoodBg(){
  const bg = $('foodBg');
  const foods = ['🍕','🍣','🌮','🍛','🥐','🍫','🍔','🍝','🥑','🍊','🌶️','🧅','🥚','🍅','🫘'];
  for(let i=0;i<20;i++){
    const span = document.createElement('span');
    span.className = 'food-float';
    span.textContent = foods[Math.floor(Math.random()*foods.length)];
    span.style.left  = Math.random()*100+'%';
    span.style.animationDuration = 12+Math.random()*18+'s';
    span.style.animationDelay   = -Math.random()*30+'s';
    span.style.fontSize = 1+Math.random()*2+'rem';
    bg.appendChild(span);
  }
}

// ── HUD ───────────────────────────────────────
function updateHUD(){
  scoreNum.textContent = score;
  // Chef level
  let level = CHEF_LEVELS[0];
  for(const l of CHEF_LEVELS) if(score >= l.min) level = l;
  chefLevel.textContent = level.emoji+' '+level.title;
  // Stamp dots
  stampDots.innerHTML = '';
  for(let i=0;i<8;i++){
    const dot = document.createElement('div');
    dot.className = 'stamp-dot' + (i<visitedCountries.size?' filled':'');
    const country = COUNTRIES[i];
    dot.textContent = i<visitedCountries.size ? country.flag : '';
    dot.title = country.name;
    stampDots.appendChild(dot);
  }
}

// ── Globe Row (intro) ─────────────────────────
function buildGlobeRow(){
  const row = $('globeRow');
  COUNTRIES.forEach(c => {
    const span = document.createElement('span');
    span.textContent = c.flag;
    span.title = c.name;
    row.appendChild(span);
  });
}

// ── Country Grid ──────────────────────────────
function buildCountryGrid(){
  const grid = $('countryGrid');
  grid.innerHTML = '';
  COUNTRIES.forEach((c,i) => {
    const visited = visitedCountries.has(c.id);
    const tile = document.createElement('div');
    tile.className = 'country-tile'+(visited?' visited':'');
    tile.style.animationDelay = i*0.06+'s';
    tile.innerHTML = `
      <span class="tile-flag">${c.flag}</span>
      <div class="tile-name">${c.name}</div>
      <div class="tile-dish"><span class="tile-dish-icon">${c.dish.emoji}</span> ${c.dish.name}</div>
    `;
    tile.addEventListener('click', () => visitCountry(c));
    grid.appendChild(tile);
  });
}

// ── Visit Country ─────────────────────────────
function visitCountry(country){
  currentCountry = country;
  currentStepIdx = 0;

  $('cflag').textContent    = country.flag;
  $('cname').textContent    = country.name;
  $('cdishIcon').textContent= country.dish.emoji;
  $('cdishName').textContent= country.dish.name;

  $('cmeta').innerHTML = `
    <span class="meta-chip">🌍 ${country.continent}</span>
    <span class="meta-chip">🏛️ ${country.capital}</span>
    <span class="meta-chip">👥 ${country.population}</span>
    <span class="meta-chip">🗣️ ${country.language}</span>
  `;

  const fl = $('cfacts');
  fl.innerHTML = '';
  country.facts.forEach((f,i) => {
    const el = document.createElement('div');
    el.className = 'fact-item';
    el.style.animationDelay = i*0.1+'s';
    el.innerHTML = `<span class="fact-ico">${f.icon}</span><span class="fact-txt">${f.text}</span>`;
    fl.appendChild(el);
  });

  showScreen('screenCountry');
}

// ── Start Cooking ─────────────────────────────
function startCooking(){
  const country = currentCountry;
  const dish    = country.dish;
  currentStepIdx = 0;

  $('recipeFlag').textContent  = country.flag;
  $('recipeTitle').textContent = dish.name;
  $('recipeSub').textContent   = country.name + ' · Classic Recipe';
  $('recipeTip').textContent   = dish.tip;
  $('potEmoji').textContent    = dish.cookEmoji;
  $('potContents').innerHTML   = '';
  $('chefBarFill').style.width = '0%';
  $('cookStatus').textContent  = 'Add the first ingredient!';

  // Build steps
  buildSteps();
  // Build ingredients shelf
  buildIngredients();

  showScreen('screenCook');
  setupDropZone();
}

function buildSteps(){
  const list = $('stepsList');
  list.innerHTML = '';
  currentCountry.dish.steps.forEach((s,i) => {
    const el = document.createElement('div');
    el.className = 'step-item'+(i===0?' active':'');
    el.id = `step${i}`;
    el.innerHTML = `
      <span class="step-num">${i+1}</span>
      <span>${s.ingredient} ${s.label}</span>
    `;
    list.appendChild(el);
  });
}

function buildIngredients(){
  const grid = $('ingredientsGrid');
  grid.innerHTML = '';

  // Mix correct + wrong ingredients and shuffle
  const dish = currentCountry.dish;
  const allIngredients = [
    ...dish.steps.map(s => ({ emoji:s.ingredient, name:s.name, correct:true })),
    ...dish.wrong.map(w => ({ emoji:w.emoji, name:w.name, correct:false }))
  ].sort(() => Math.random()-0.5);

  allIngredients.forEach(ing => {
    const card = document.createElement('div');
    card.className = 'ingredient-card';
    card.draggable = true;
    card.dataset.emoji = ing.emoji;
    card.dataset.correct = ing.correct;
    card.innerHTML = `<span class="ing-emoji">${ing.emoji}</span><span class="ing-name">${ing.name}</span>`;

    // Desktop drag
    card.addEventListener('dragstart', e => {
      draggedIngredient = { emoji: ing.emoji, correct: ing.correct, card };
      e.dataTransfer.effectAllowed = 'copy';
    });

    // Click to add (mobile friendly)
    card.addEventListener('click', () => {
      if(card.classList.contains('used')) return;
      handleIngredientDrop(ing.emoji, ing.correct, card);
    });

    grid.appendChild(card);
  });
}

// ── Drop Zone ─────────────────────────────────
function setupDropZone(){
  const pot = document.querySelector('.pot-area');
  pot.addEventListener('dragover', e => { e.preventDefault(); pot.classList.add('drag-over'); });
  pot.addEventListener('dragleave', ()=> pot.classList.remove('drag-over'));
  pot.addEventListener('drop', e => {
    e.preventDefault();
    pot.classList.remove('drag-over');
    if(!draggedIngredient) return;
    handleIngredientDrop(draggedIngredient.emoji, draggedIngredient.correct, draggedIngredient.card);
    draggedIngredient = null;
  });
}

function handleIngredientDrop(emoji, correct, card){
  const dish = currentCountry.dish;
  const expectedStep = dish.steps[currentStepIdx];

  if(emoji === expectedStep.ingredient){
    // Correct!
    card.classList.add('used');

    // Add to pot
    const potContents = $('potContents');
    const el = document.createElement('span');
    el.className = 'pot-ingredient';
    el.textContent = emoji;
    potContents.appendChild(el);

    // Mark step done
    const stepEl = $(`step${currentStepIdx}`);
    if(stepEl){ stepEl.className = 'step-item done'; }

    currentStepIdx++;
    score += 50;
    updateHUD();

    // Splash
    celebrationSplash(card);
    playTone(550,'sine',0.1);

    // Progress bar
    const pct = (currentStepIdx/dish.steps.length)*100;
    $('chefBarFill').style.width = pct+'%';

    if(currentStepIdx < dish.steps.length){
      // Activate next step
      const nextStep = $(`step${currentStepIdx}`);
      if(nextStep) nextStep.className = 'step-item active';
      $('cookStatus').textContent = `Great! Now: ${dish.steps[currentStepIdx].label}`;
    } else {
      // Dish complete!
      $('cookStatus').textContent = '🎉 Dish complete! Amazing work!';
      setTimeout(() => dishComplete(), 1000);
    }

  } else {
    // Wrong ingredient
    card.classList.add('wrong-flash');
    setTimeout(() => card.classList.remove('wrong-flash'), 500);
    $('cookStatus').textContent = `❌ That's not right! Hint: ${expectedStep.ingredient}`;
    playTone(200,'sawtooth',0.07);
  }
}

// ── Dish Complete ─────────────────────────────
function dishComplete(){
  const country = currentCountry;
  const dish    = country.dish;

  visitedCountries.add(country.id);
  score += 100; // completion bonus
  updateHUD();

  $('cookedDish').textContent       = dish.emoji;
  $('dishCompleteTitle').textContent= dish.name + ' — Done!';
  $('stampEmoji').textContent       = country.flag;
  $('cultureNugget').textContent    = dish.cultureFact;
  $('dishScoreRow').innerHTML       = `
    <div class="score-chip">⭐ +${150} pts</div>
    <div class="score-chip">🌍 ${visitedCountries.size}/8 countries</div>
    <div class="score-chip">${country.flag} ${country.name}</div>
  `;

  showScreen('screenDish');
  bigCelebration();
  playTone(880,'triangle',0.12);
}

$('btnNextCountry').addEventListener('click', () => {
  if(visitedCountries.size === COUNTRIES.length){
    showGraduation();
  } else {
    buildCountryGrid();
    showScreen('screenMap');
  }
});

// ── Graduation ────────────────────────────────
function showGraduation(){
  $('finalScore').textContent = score;
  $('passportFull').innerHTML = COUNTRIES.map(c=>c.flag).join(' ');
  showScreen('screenGrad');
  for(let i=0;i<6;i++) setTimeout(bigCelebration, i*250);
}

$('btnGradRestart').addEventListener('click',()=>{
  score=0; visitedCountries.clear();
  updateHUD(); buildCountryGrid();
  showScreen('screenMap');
});

// ── Celebrations ──────────────────────────────
function celebrationSplash(target){
  const rect = target?.getBoundingClientRect()||{left:window.innerWidth/2,top:window.innerHeight/2,width:0,height:0};
  const cx=rect.left+rect.width/2, cy=rect.top+rect.height/2;
  const icons=['⭐','✨','🎉','💫','🍀'];
  for(let i=0;i<8;i++){
    const p=document.createElement('div');
    p.className='splash-item';
    p.textContent=icons[Math.floor(Math.random()*icons.length)];
    const angle=(i/8)*Math.PI*2, dist=40+Math.random()*70;
    p.style.left=cx+'px'; p.style.top=cy+'px';
    p.style.setProperty('--dx',Math.cos(angle)*dist+'px');
    p.style.setProperty('--dy',Math.sin(angle)*dist+'px');
    splashEl.appendChild(p);
    setTimeout(()=>p.remove(),950);
  }
}

function bigCelebration(){
  const cx=window.innerWidth/2, cy=window.innerHeight/2;
  const icons=['🎉','🎊','⭐','✨','🍕','🌮','🍣','🍫','🥐','🌍','💫','🏆'];
  for(let i=0;i<24;i++){
    const p=document.createElement('div');
    p.className='splash-item';
    p.textContent=icons[Math.floor(Math.random()*icons.length)];
    const angle=Math.random()*Math.PI*2, dist=80+Math.random()*200;
    p.style.left=(cx+(Math.random()-0.5)*300)+'px';
    p.style.top=(cy+(Math.random()-0.5)*200)+'px';
    p.style.setProperty('--dx',Math.cos(angle)*dist+'px');
    p.style.setProperty('--dy',Math.sin(angle)*dist+'px');
    p.style.animationDelay=Math.random()*0.3+'s';
    splashEl.appendChild(p);
    setTimeout(()=>p.remove(),1200);
  }
}

// ── Audio ─────────────────────────────────────
function playTone(freq,type='sine',vol=0.1){
  try{
    const ctx=new(window.AudioContext||window.webkitAudioContext)();
    const osc=ctx.createOscillator(), gain=ctx.createGain();
    osc.connect(gain); gain.connect(ctx.destination);
    osc.type=type; osc.frequency.value=freq;
    gain.gain.setValueAtTime(vol,ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001,ctx.currentTime+0.4);
    osc.start(); osc.stop(ctx.currentTime+0.4);
  }catch(e){}
}

// ── Event Listeners ───────────────────────────
$('btnBegin').addEventListener('click',()=>{
  buildCountryGrid();
  showScreen('screenMap');
  playTone(440,'sine',0.08);
});

$('btnCook').addEventListener('click', startCooking);

// ── Init ──────────────────────────────────────
initFoodBg();
buildGlobeRow();
updateHUD();
