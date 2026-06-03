// =============================================
// TAMIL QUOTE GENERATOR — Complete Script
// =============================================

// =============================================
// QUOTE DATABASE
// =============================================
const quotes = [
  // THIRUKKURAL
  { id:1, tamil:"அகர முதல எழுத்தெல்லாம் ஆதி பகவன் முதற்றே உலகு", english:"As the letter A is the first of all letters, so the eternal God is first in the world.", author:"திருவள்ளுவர்", category:"thirukkural", section:"arathuppal" },
  { id:2, tamil:"கற்றதனால் ஆய பயனென்கொல் வாலறிவன் நற்றாள் தொழாஅர் எனின்", english:"What is the use of learning if one does not bow at the feet of the pure-knowing God?", author:"திருவள்ளுவர்", category:"thirukkural", section:"arathuppal" },
  { id:3, tamil:"மலர்மிசை ஏகினான் மாணடி சேர்ந்தார் நிலமிசை நீடுவாழ் வார்", english:"Those who reach the glorious feet of God who walks on the flower shall live long on earth.", author:"திருவள்ளுவர்", category:"thirukkural", section:"arathuppal" },
  { id:4, tamil:"வேண்டுதல் வேண்டாமை இலானடி சேர்ந்தார்க்கு யாண்டும் இடும்பை இல", english:"Those who reach the feet of God who is free from desire and aversion shall never know sorrow.", author:"திருவள்ளுவர்", category:"thirukkural", section:"arathuppal" },
  { id:5, tamil:"இருள்சேர் இரண்டெழுத்து என்னும் மருள்நோய் மருந்தென்று கொள்ளப்படும்", english:"The two letters of the word 'ignorance' are considered a disease whose medicine is learning.", author:"திருவள்ளுவர்", category:"thirukkural", section:"arathuppal" },
  { id:6, tamil:"ஒழுக்கம் விழுப்பந் தரலான் ஒழுக்கம் உயிரினும் ஓம்பப் படும்", english:"Since good conduct gives excellence, conduct must be guarded more carefully than life itself.", author:"திருவள்ளுவர்", category:"thirukkural", section:"arathuppal" },
  { id:7, tamil:"அன்பின் வழியது உயிர்நிலை அஃதிலார்க்கு என்புதோல் போர்த்த உடம்பு", english:"Life is sustained by love; those without love are but bones covered with skin.", author:"திருவள்ளுவர்", category:"thirukkural", section:"arathuppal" },
  { id:8, tamil:"செய்யாமல் செய்த உதவிக்கு வையகமும் வானகமும் ஆற்றல் அரிது", english:"Even heaven and earth cannot repay a help rendered without expectation of return.", author:"திருவள்ளுவர்", category:"thirukkural", section:"arathuppal" },
  { id:9, tamil:"இனிய உளவாக இன்னாத கூறல் கனிஇருப்ப காய்கவர்ந் தற்று", english:"Speaking harshly when kind words are available is like eating unripe fruit when ripe ones exist.", author:"திருவள்ளுவர்", category:"thirukkural", section:"arathuppal" },
  { id:10, tamil:"நன்றி மறப்பது நன்றன்று நன்றல்லது அன்றே மறப்பது நன்று", english:"Forgetting a good deed is not good; but forgetting a wrong done to you immediately is good.", author:"திருவள்ளுவர்", category:"thirukkural", section:"arathuppal" },
  { id:11, tamil:"முயற்சி திருவினை ஆக்கும் முயற்றின்மை இன்மை புகுத்தி விடும்", english:"Effort brings fortune; laziness leads to poverty.", author:"திருவள்ளுவர்", category:"thirukkural", section:"porutpal" },
  { id:12, tamil:"ஆற்றின் வருந்தா வருத்தம் பலர்தூக்கின் போற்றார் புகழும் இலர்", english:"Those who do not strive through right means and are not praised by many have no glory.", author:"திருவள்ளுவர்", category:"thirukkural", section:"porutpal" },
  { id:13, tamil:"உடையார் முன்னிற்றல் ஓரன்றே ஆயினும் கடையரே கால்கொல் லாதவர்", english:"Even standing once before the wealthy is degrading for those who do not make effort.", author:"திருவள்ளுவர்", category:"thirukkural", section:"porutpal" },
  { id:14, tamil:"பொறுத்தல் இறப்பினை என்று உணர்வீர் பொறாமை சிறப்புடையது என்று உணர்வீர்", english:"Know that patience is mightier than victory; impatience brings no glory.", author:"திருவள்ளுவர்", category:"thirukkural", section:"porutpal" },
  { id:15, tamil:"காமம் வெகுளி மயக்கம் இவைமூன்றன் நாமம் கெடக்கெடும் நோய்", english:"The diseases named desire, anger, and delusion — when their names perish, the diseases perish too.", author:"திருவள்ளுவர்", category:"thirukkural", section:"kamathupal" },
  { id:16, tamil:"தாம்வீழ்வார் மென்தோள் துயிலின் இனிதுகொல் தாமரைக் கண்ணான் உலகு", english:"Is the world of the lotus-eyed God sweeter than sleeping on the soft shoulders of the beloved?", author:"திருவள்ளுவர்", category:"thirukkural", section:"kamathupal" },
  { id:17, tamil:"நோதல் எவனோ உயிர்க்கு இன்னா என்பது யாதனின் தீதெனின் தீது", english:"What is more painful than anything? Separation from the one you love.", author:"திருவள்ளுவர்", category:"thirukkural", section:"kamathupal" },
  { id:18, tamil:"உள்ளத்தால் உள்ளலும் தீதே பிறர்நலனை உள்ளதூஉம் வேண்டற்பாற் றன்று", english:"Even thinking ill of others in the heart is wrong; one should not desire others' downfall.", author:"திருவள்ளுவர்", category:"thirukkural", section:"arathuppal" },
  { id:19, tamil:"எப்பொருள் யார்யார்வாய்க் கேட்பினும் அப்பொருள் மெய்ப்பொருள் காண்ப தறிவு", english:"Wisdom is finding the true meaning of what you hear, regardless of who says it.", author:"திருவள்ளுவர்", category:"thirukkural", section:"porutpal" },
  { id:20, tamil:"கேட்பினும் கேளாத் தகையவே கேள்வியால் தோட்கப் படாத செவி", english:"Ears that are not pierced by learning are as deaf as those that hear nothing.", author:"திருவள்ளுவர்", category:"thirukkural", section:"arathuppal" },

  // PROVERBS
  { id:101, tamil:"யாதும் ஊரே யாவரும் கேளிர்", english:"Every place is my hometown; every person is my kin.", author:"கணியன் பூங்குன்றனார்", category:"proverbs", section:"all" },
  { id:102, tamil:"உழைப்பே உயர்வுக்கு வழி", english:"Hard work is the only path to greatness.", author:"Tamil Proverb", category:"proverbs", section:"all" },
  { id:103, tamil:"ஒற்றுமையே பலம்", english:"Unity is strength.", author:"Tamil Proverb", category:"proverbs", section:"all" },
  { id:104, tamil:"அறிவே ஆயுதம்", english:"Knowledge is the greatest weapon.", author:"Tamil Proverb", category:"proverbs", section:"all" },
  { id:105, tamil:"நாளை என்று சொல்பவன் நாளும் சொல்வான்", english:"He who says 'tomorrow' will keep saying tomorrow forever.", author:"Tamil Proverb", category:"proverbs", section:"all" },
  { id:106, tamil:"விடாமுயற்சி வெற்றி தரும்", english:"Persistent effort always leads to victory.", author:"Tamil Proverb", category:"proverbs", section:"all" },
  { id:107, tamil:"மனமிருந்தால் மார்க்கமுண்டு", english:"Where there is a will, there is a way.", author:"Tamil Proverb", category:"proverbs", section:"all" },
  { id:108, tamil:"படிப்பே சிறந்த செல்வம்", english:"Education is the greatest wealth.", author:"Tamil Proverb", category:"proverbs", section:"all" },
  { id:109, tamil:"தன்னை அறிந்தவன் உலகை வெல்வான்", english:"One who knows himself will conquer the world.", author:"Tamil Proverb", category:"proverbs", section:"all" },
  { id:110, tamil:"சொல்லும் செயலும் ஒன்றாக இருக்க வேண்டும்", english:"Words and deeds must be one and the same.", author:"Tamil Proverb", category:"proverbs", section:"all" },
  { id:111, tamil:"கல்லூரியில் படித்தவன் கதை அறிவான், வாழ்வில் படித்தவன் உலகை அறிவான்", english:"One who studied in college knows stories; one who studied in life knows the world.", author:"Tamil Proverb", category:"proverbs", section:"all" },
  { id:112, tamil:"காக்கை குருவி எங்கள் ஜாதி", english:"The crow and the sparrow are of our kind — all living beings are one family.", author:"Tamil Proverb", category:"proverbs", section:"all" },

  // MOTIVATIONAL
  { id:201, tamil:"தோல்வி என்பது வெற்றியின் முதல் படி", english:"Failure is the first step toward success.", author:"Tamil Wisdom", category:"motivational", section:"all" },
  { id:202, tamil:"கனவு காண்பவன் மட்டுமே கனவை நனவாக்க முடியும்", english:"Only those who dare to dream can make dreams come true.", author:"Tamil Wisdom", category:"motivational", section:"all" },
  { id:203, tamil:"சிறு சிறு துளிகள் பெரும் கடலை உருவாக்கும்", english:"Small drops of water make the mighty ocean.", author:"Tamil Wisdom", category:"motivational", section:"all" },
  { id:204, tamil:"இன்று செய்யக்கூடியதை நாளைக்கு தள்ளிபோடாதே", english:"Do not put off till tomorrow what you can do today.", author:"Tamil Wisdom", category:"motivational", section:"all" },
  { id:205, tamil:"வீழ்வதற்காக அல்ல, எழுவதற்காகவே பிறந்தோம்", english:"We were born not to fall, but to rise.", author:"Tamil Wisdom", category:"motivational", section:"all" },
  { id:206, tamil:"ஒவ்வொரு இரவும் ஒரு புதிய விடியலை கொண்டு வரும்", english:"Every night brings a new dawn.", author:"Tamil Wisdom", category:"motivational", section:"all" },
  { id:207, tamil:"தடை என்பது திசை மாற்றுவதற்கான வாய்ப்பு", english:"An obstacle is an opportunity to change direction.", author:"Tamil Wisdom", category:"motivational", section:"all" },
  { id:208, tamil:"சாதிப்போம் என்ற நம்பிக்கையே வெற்றியின் ரகசியம்", english:"Belief that you will succeed is the secret of success.", author:"Tamil Wisdom", category:"motivational", section:"all" },
  { id:209, tamil:"உன் வாழ்க்கையை உன் கனவுகளால் அளவிடு", english:"Measure your life by your dreams, not your fears.", author:"Tamil Wisdom", category:"motivational", section:"all" },
  { id:210, tamil:"முயற்சி திருவினையாக்கும்", english:"Effort transforms fate into fortune.", author:"Tamil Wisdom", category:"motivational", section:"all" },

  // LIFE
  { id:301, tamil:"வாழ்க்கை ஒரு பயணம், இலக்கை விட பயணமே முக்கியம்", english:"Life is a journey; the path matters more than the destination.", author:"Tamil Wisdom", category:"life", section:"all" },
  { id:302, tamil:"மகிழ்ச்சி வெளியில் இல்லை, உள்ளத்தில் உள்ளது", english:"Happiness is not outside; it lies within the heart.", author:"Tamil Wisdom", category:"life", section:"all" },
  { id:303, tamil:"கடந்த காலத்தை மறந்து, நிகழ்காலத்தில் வாழு", english:"Forget the past and live in the present moment.", author:"Tamil Wisdom", category:"life", section:"all" },
  { id:304, tamil:"சிரிப்பு என்பது உலகின் சிறந்த மருந்து", english:"Laughter is the best medicine in the world.", author:"Tamil Wisdom", category:"life", section:"all" },
  { id:305, tamil:"நல்லவர்களின் நட்பு நலம் தரும்", english:"The friendship of good people always brings goodness.", author:"Tamil Wisdom", category:"life", section:"all" },
  { id:306, tamil:"பொறுமை எல்லாவற்றையும் சாதிக்கும்", english:"Patience can achieve everything.", author:"Tamil Wisdom", category:"life", section:"all" },
  { id:307, tamil:"வாழ்க்கையில் எல்லாமே பாடம்தான்", english:"Everything in life is a lesson.", author:"Tamil Wisdom", category:"life", section:"all" },
  { id:308, tamil:"நேர்மை என்பது சிறந்த கொள்கை", english:"Honesty is the best policy.", author:"Tamil Wisdom", category:"life", section:"all" },
  { id:309, tamil:"நேற்று வரலாறு, நாளை மர்மம், இன்று கொடை", english:"Yesterday is history, tomorrow is mystery, today is a gift.", author:"Tamil Wisdom", category:"life", section:"all" },

  // LOVE
  { id:401, tamil:"காதல் என்பது கொடுப்பது, எதிர்பார்ப்பது அல்ல", english:"Love is about giving, not expecting in return.", author:"Tamil Wisdom", category:"love", section:"all" },
  { id:402, tamil:"உண்மையான காதல் காலத்தால் அழிவதில்லை", english:"True love is never destroyed by time.", author:"Tamil Wisdom", category:"love", section:"all" },
  { id:403, tamil:"அன்பு அனைத்தையும் வெல்லும்", english:"Love conquers all.", author:"Tamil Wisdom", category:"love", section:"all" },
  { id:404, tamil:"தாயின் அன்பு உலகின் மிகப்பெரிய அன்பு", english:"A mother's love is the greatest love in the world.", author:"Tamil Wisdom", category:"love", section:"all" },
  { id:405, tamil:"நட்பு என்பது இரண்டு உடலில் வாழும் ஒரு ஆன்மா", english:"Friendship is one soul living in two bodies.", author:"Tamil Wisdom", category:"love", section:"all" },
  { id:406, tamil:"காதல் கண்ணை மூடும், நட்பு கண்களை திறக்கும்", english:"Love closes the eyes; friendship opens them.", author:"Tamil Wisdom", category:"love", section:"all" },

  // WISDOM
  { id:501, tamil:"மூடன் பேசுவான், அறிஞன் கேட்பான்", english:"A fool speaks; a wise man listens.", author:"Tamil Wisdom", category:"wisdom", section:"all" },
  { id:502, tamil:"அறிவுள்ளவன் தன் அறியாமையை அறிவான்", english:"A truly wise man knows the extent of his own ignorance.", author:"Tamil Wisdom", category:"wisdom", section:"all" },
  { id:503, tamil:"பிறர் குறையை காண்பதை விட உன் குறையை கண்டு திருத்திக்கொள்", english:"Rather than finding faults in others, find and correct your own.", author:"Tamil Wisdom", category:"wisdom", section:"all" },
  { id:504, tamil:"வார்த்தைகள் வாளை விட கூர்மையானவை", english:"Words are sharper than swords.", author:"Tamil Wisdom", category:"wisdom", section:"all" },
  { id:505, tamil:"சிந்திக்காமல் செய்வது தவறு", english:"Acting without thinking is a mistake.", author:"Tamil Wisdom", category:"wisdom", section:"all" },
  { id:506, tamil:"எளிமையே உண்மையான அழகு", english:"Simplicity is true beauty.", author:"Tamil Wisdom", category:"wisdom", section:"all" },
  { id:507, tamil:"கேள்விகள் கேட்பவன் ஒரு நிமிடம் முட்டாளாக தெரிவான், கேட்காதவன் வாழ்நாள் முழுதும் முட்டாளாகவே இருப்பான்", english:"One who asks questions appears foolish for a moment; one who doesn't remains foolish forever.", author:"Tamil Wisdom", category:"wisdom", section:"all" },
];

// =============================================
// STATE
// =============================================
let currentQuote = null;
let currentCategory = 'all';
let exploreCategory = 'all';
let kuralSection = 'all';
let favorites = JSON.parse(localStorage.getItem('tqg-favorites') || '[]');
let posterTheme = 'gold';
let posterFormat = 'square';
let isDark = true;

// =============================================
// INIT
// =============================================
window.addEventListener('DOMContentLoaded', () => {
  setTimeout(() => {
    document.getElementById('loader').classList.add('hidden');
  }, 1200);
  setDailyQuote();
  generateQuote();
  renderExplore();
  renderKural();
  renderFavorites();
});

// =============================================
// DAILY QUOTE
// =============================================
function setDailyQuote() {
  const day = new Date().getDate();
  const q = quotes[day % quotes.length];
  document.getElementById('dailyTamil').textContent = `"${q.tamil}"`;
  document.getElementById('dailyEnglish').textContent = q.english;
  document.getElementById('dailyAuthor').textContent = `— ${q.author}`;
}

// =============================================
// GENERATE QUOTE
// =============================================
function generateQuote() {
  const pool = currentCategory === 'all' ? quotes : quotes.filter(q => q.category === currentCategory);
  if (!pool.length) return;
  let q;
  do { q = pool[Math.floor(Math.random() * pool.length)]; }
  while (pool.length > 1 && q === currentQuote);
  currentQuote = q;

  const card = document.getElementById('quoteCard');
  card.classList.add('fade');
  setTimeout(() => {
    document.getElementById('quoteTamil').textContent = `"${q.tamil}"`;
    document.getElementById('quoteEnglish').textContent = q.english;
    document.getElementById('quoteAuthor').textContent = `— ${q.author}`;
    document.getElementById('quoteTag').textContent = getCategoryLabel(q.category);
    card.style.transition = 'all 0.4s ease';
    card.classList.remove('fade');
    card.style.opacity = '1';
    card.style.transform = 'translateY(0)';
  }, 200);
}

function filterCategory(cat, btn) {
  currentCategory = cat;
  document.querySelectorAll('.categories .cat-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  generateQuote();
}

function getCategoryLabel(cat) {
  return { thirukkural:'📜 Thirukkural', proverbs:'🗣️ Proverb', motivational:'💪 Motivational', life:'🌱 Life', love:'❤️ Love', wisdom:'🧠 Wisdom' }[cat] || cat;
}

// =============================================
// COPY
// =============================================
function copyQuote() {
  if (!currentQuote) return;
  navigator.clipboard.writeText(`"${currentQuote.tamil}"\n\n${currentQuote.english}\n— ${currentQuote.author}\n\n#TamilQuotes #SSoC2026`);
  showToast('📋 Copied to clipboard!');
}

// =============================================
// VOICE
// =============================================
function speakQuote() {
  if (!currentQuote) return;
  window.speechSynthesis.cancel();
  const utt = new SpeechSynthesisUtterance(currentQuote.tamil + '. ' + currentQuote.english);
  utt.rate = 0.85;
  window.speechSynthesis.speak(utt);
  showToast('🔊 Reading quote aloud...');
}

// =============================================
// FAVORITES
// =============================================
function toggleFavorite() {
  if (!currentQuote) return;
  const idx = favorites.findIndex(f => f.id === currentQuote.id);
  if (idx === -1) {
    favorites.push(currentQuote);
    showToast('⭐ Saved to favorites!');
    launchConfetti();
  } else {
    favorites.splice(idx, 1);
    showToast('💔 Removed from favorites');
  }
  localStorage.setItem('tqg-favorites', JSON.stringify(favorites));
  renderFavorites();
}

function renderFavorites() {
  const grid = document.getElementById('favGrid');
  if (!favorites.length) {
    grid.innerHTML = `<div class="empty-state"><p>⭐</p><p>No favorites yet.<br>Save quotes you love!</p></div>`;
    return;
  }
  grid.innerHTML = favorites.map(q => quoteCardHTML(q, true)).join('');
}

// =============================================
// EXPLORE
// =============================================
let exploreSearch = '';
function searchQuotes() {
  exploreSearch = document.getElementById('searchInput').value.toLowerCase();
  renderExplore();
}
function exploreFilter(cat, btn) {
  exploreCategory = cat;
  document.querySelectorAll('.filter-row .cat-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  renderExplore();
}
function renderExplore() {
  let pool = exploreCategory === 'all' ? quotes : quotes.filter(q => q.category === exploreCategory);
  if (exploreSearch) {
    pool = pool.filter(q =>
      q.tamil.includes(exploreSearch) ||
      q.english.toLowerCase().includes(exploreSearch) ||
      q.author.toLowerCase().includes(exploreSearch) ||
      q.category.includes(exploreSearch)
    );
  }
  document.getElementById('resultsCount').textContent = `${pool.length} quotes found`;
  const grid = document.getElementById('quotesGrid');
  if (!pool.length) {
    grid.innerHTML = `<div class="empty-state"><p>🔍</p><p>No quotes found.<br>Try a different search.</p></div>`;
    return;
  }
  grid.innerHTML = pool.map(q => quoteCardHTML(q, false)).join('');
}

// =============================================
// THIRUKKURAL — All 1330 from GitHub JSON
// =============================================
let allKurals = [];

async function loadKurals() {
  if (allKurals.length > 0) return allKurals;
  try {
    const res = await fetch('https://raw.githubusercontent.com/tk120404/thirukkural/master/thirukkural.json');
    const data = await res.json();
    allKurals = data.kural || [];
    return allKurals;
  } catch(e) {
    return [];
  }
}

function filterKural(section, btn) {
  kuralSection = section;
  document.querySelectorAll('.section-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  renderKural();
}

function searchByNumber() {
  renderKural();
}

async function renderKural() {
  const grid = document.getElementById('kuralGrid');
  grid.innerHTML = `<div class="empty-state"><p>⏳</p><p>Loading all 1330 Kurals...</p></div>`;

  const kurals = await loadKurals();

  if (!kurals.length) {
    grid.innerHTML = `<div class="empty-state"><p>❌</p><p>Could not load Kurals.<br>Check internet connection.</p></div>`;
    return;
  }

  let pool = [...kurals];

  // Filter by section
  if (kuralSection === 'arathuppal') pool = pool.filter(k => k.Number <= 380);
  if (kuralSection === 'porutpal')   pool = pool.filter(k => k.Number > 380 && k.Number <= 1080);
  if (kuralSection === 'kamathupal') pool = pool.filter(k => k.Number > 1080);

  // Filter by number
  const num = document.getElementById('kuralNumber')?.value;
  if (num) pool = pool.filter(k => k.Number === parseInt(num));

  if (!pool.length) {
    grid.innerHTML = `<div class="empty-state"><p>📜</p><p>No kurals found.</p></div>`;
    return;
  }

  grid.innerHTML = pool.map(k => {
    const tamil = `${k.Line1} ${k.Line2}`.replace(/'/g, "\\'").replace(/"/g, '&quot;');
    const eng = k.Translation.replace(/'/g, "\\'").replace(/"/g, '&quot;');
    return `
    <div class="grid-card">
      <div class="kural-number">குறள் ${k.Number}</div>
      <div class="card-tamil">${k.Line1}<br>${k.Line2}</div>
      <div class="card-english">${k.Translation}</div>
      <div class="kural-explanation">${k.explanation || ''}</div>
      <div class="card-footer">
        <span class="card-author">திருவள்ளுவர்</span>
        <span class="card-actions">
          <button class="card-btn" title="Listen" onclick="speakKural('${tamil}')">🔊</button>
          <button class="card-btn" title="Copy" onclick="copyKural('${tamil}','${eng}','திருவள்ளுவர்')">📋</button>
        </span>
      </div>
    </div>`;
  }).join('');
}

function speakKural(text) {
  window.speechSynthesis.cancel();
  const utt = new SpeechSynthesisUtterance(text);
  utt.rate = 0.85;
  window.speechSynthesis.speak(utt);
  showToast('🔊 Reading kural aloud...');
}
function copyKural(tamil, english, author) {
  navigator.clipboard.writeText(`"${tamil}"\n\n${english}\n— ${author}\n\n#Thirukkural #TamilWisdom`);
  showToast('📋 Kural copied!');
}

// =============================================
// QUOTE CARD HTML
// =============================================
function quoteCardHTML(q, isFav) {
  return `
    <div class="grid-card" onclick="setQuoteFromCard(${q.id})">
      <div class="card-tamil">${q.tamil}</div>
      <div class="card-english">${q.english}</div>
      <div class="card-footer">
        <span class="card-author">— ${q.author}</span>
        <span class="card-actions">
          <button class="card-btn" onclick="event.stopPropagation();speakKural('${q.tamil.replace(/'/g,"\\'")}')">🔊</button>
          <button class="card-btn" onclick="event.stopPropagation();copyKural('${q.tamil.replace(/'/g,"\\'")}','${q.english.replace(/'/g,"\\'")}','${q.author}')">📋</button>
          ${isFav ? `<button class="card-btn" onclick="event.stopPropagation();removeFav(${q.id})">🗑️</button>` : ''}
        </span>
      </div>
    </div>`;
}

function removeFav(id) {
  favorites = favorites.filter(f => f.id !== id);
  localStorage.setItem('tqg-favorites', JSON.stringify(favorites));
  renderFavorites();
  showToast('Removed from favorites');
}

function setQuoteFromCard(id) {
  const q = quotes.find(q => q.id === id);
  if (!q) return;
  currentQuote = q;
  showPage('home');
  document.getElementById('quoteTamil').textContent = `"${q.tamil}"`;
  document.getElementById('quoteEnglish').textContent = q.english;
  document.getElementById('quoteAuthor').textContent = `— ${q.author}`;
  document.getElementById('quoteTag').textContent = getCategoryLabel(q.category);
}

// =============================================
// WHATSAPP SHARE
// =============================================
function shareWhatsApp() {
  if (!currentQuote) return;
  const text = encodeURIComponent(`✨ Tamil Wisdom ✨\n\n"${currentQuote.tamil}"\n\n${currentQuote.english}\n\n— ${currentQuote.author}\n\n#TamilQuotes #SSoC2026`);
  window.open(`https://wa.me/?text=${text}`, '_blank');
}

// =============================================
// POSTER GENERATOR
// =============================================
const posterThemes = {
  gold:    { bg:'#0d0d0d', accent:'#c9a84c', text:'#f5f0e8', sub:'#a89f8e' },
  cream:   { bg:'#f9f0e1', accent:'#7a1a2a', text:'#2a1008', sub:'#6b4c3b' },
  saffron: { bg:'#ffffff', accent:'#e67e22', text:'#1a1a1a', sub:'#7f8c8d' },
  green:   { bg:'#0d2818', accent:'#c9a84c', text:'#f0f7f2', sub:'#8aab90' },
};
const posterFormats = {
  square: { w:800,  h:800  },
  story:  { w:450,  h:800  },
  wide:   { w:1000, h:563  },
};

function setPosterTheme(t, btn) {
  posterTheme = t;
  document.querySelectorAll('.theme-opt').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
}
function setPosterFormat(f, btn) {
  posterFormat = f;
  document.querySelectorAll('.format-opt').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
}

function renderPoster() {
  const q = currentQuote || quotes[0];
  const theme = posterThemes[posterTheme];
  const fmt = posterFormats[posterFormat];
  const canvas = document.getElementById('posterCanvas');
  canvas.width = fmt.w; canvas.height = fmt.h;
  canvas.style.maxHeight = '500px';
  const ctx = canvas.getContext('2d');

  // BG
  ctx.fillStyle = theme.bg;
  ctx.fillRect(0, 0, fmt.w, fmt.h);

  // Border
  ctx.strokeStyle = theme.accent;
  ctx.lineWidth = 4;
  ctx.strokeRect(20, 20, fmt.w - 40, fmt.h - 40);

  // Inner border
  ctx.strokeStyle = theme.accent + '44';
  ctx.lineWidth = 1;
  ctx.strokeRect(30, 30, fmt.w - 60, fmt.h - 60);

  // Big quote mark
  ctx.fillStyle = theme.accent + '22';
  ctx.font = `bold ${Math.floor(fmt.w * 0.25)}px serif`;
  ctx.fillText('"', fmt.w * 0.05, fmt.h * 0.38);

  // Tamil text
  ctx.fillStyle = theme.text;
  ctx.font = `600 ${Math.floor(fmt.w * 0.042)}px "Noto Sans Tamil", serif`;
  wrapText(ctx, q.tamil, fmt.w * 0.1, fmt.h * 0.3, fmt.w * 0.8, Math.floor(fmt.w * 0.058));

  // Divider
  ctx.strokeStyle = theme.accent;
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(fmt.w * 0.1, fmt.h * 0.62);
  ctx.lineTo(fmt.w * 0.9, fmt.h * 0.62);
  ctx.stroke();

  // English text
  ctx.fillStyle = theme.sub;
  ctx.font = `italic ${Math.floor(fmt.w * 0.032)}px Georgia, serif`;
  wrapText(ctx, q.english, fmt.w * 0.1, fmt.h * 0.69, fmt.w * 0.8, Math.floor(fmt.w * 0.044));

  // Author
  ctx.fillStyle = theme.accent;
  ctx.font = `600 ${Math.floor(fmt.w * 0.028)}px Inter, sans-serif`;
  ctx.fillText(`— ${q.author}`, fmt.w * 0.1, fmt.h * 0.86);

  // Watermark
  ctx.fillStyle = theme.accent + '88';
  ctx.font = `${Math.floor(fmt.w * 0.022)}px Inter, sans-serif`;
  ctx.textAlign = 'right';
  ctx.fillText('🌿 Tamil Quote Generator', fmt.w * 0.92, fmt.h * 0.94);
  ctx.textAlign = 'left';

  showToast('🎨 Poster generated!');
}

function downloadPoster() {
  renderPoster();
  setTimeout(() => {
    const canvas = document.getElementById('posterCanvas');
    canvas.toBlob(blob => {
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = `tamil-quote-${posterFormat}.png`;
      a.click();
      showToast('📥 Downloaded!');
    });
  }, 300);
}

function sharePosterWhatsApp() {
  if (!currentQuote) return;
  shareWhatsApp();
}

function wrapText(ctx, text, x, y, maxW, lh) {
  const words = text.split(' ');
  let line = '';
  for (let i = 0; i < words.length; i++) {
    const test = line + words[i] + ' ';
    if (ctx.measureText(test).width > maxW && i > 0) {
      ctx.fillText(line, x, y);
      line = words[i] + ' ';
      y += lh;
    } else { line = test; }
  }
  ctx.fillText(line, x, y);
}

// =============================================
// NAVIGATION
// =============================================
function showPage(name) {
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  document.getElementById(`page-${name}`).classList.add('active');
  document.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active'));
  document.querySelector(`.nav-link[onclick="showPage('${name}')"]`)?.classList.add('active');
  if (name === 'favorites') renderFavorites();
  if (name === 'explore') renderExplore();
  if (name === 'thirukkural') renderKural();
  closeSidebar();
}

// =============================================
// SIDEBAR TOGGLE
// =============================================
function toggleSidebar() {
  document.querySelector('.sidebar').classList.toggle('open');
}
function closeSidebar() {
  document.querySelector('.sidebar').classList.remove('open');
}

// =============================================
// THEME TOGGLE
// =============================================
function toggleTheme() {
  isDark = !isDark;
  document.body.classList.toggle('light', !isDark);
  document.querySelector('.theme-btn').textContent = isDark ? '🌙' : '☀️';
}

// =============================================
// TOAST
// =============================================
function showToast(msg) {
  const t = document.getElementById('toast');
  t.textContent = msg;
  t.classList.add('show');
  setTimeout(() => t.classList.remove('show'), 2200);
}

// =============================================
// CONFETTI
// =============================================
function launchConfetti() {
  const canvas = document.getElementById('confettiCanvas');
  const ctx = canvas.getContext('2d');
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  const colors = ['#c9a84c','#e2c27d','#fff','#27ae60','#e74c3c','#f39c12'];
  const particles = Array.from({length:80}, () => ({
    x: Math.random() * canvas.width,
    y: -10,
    r: Math.random() * 7 + 3,
    color: colors[Math.floor(Math.random() * colors.length)],
    speed: Math.random() * 3 + 1,
    tilt: Math.random() * 10 - 5,
  }));
  let frame, count = 0;
  function draw() {
    ctx.clearRect(0,0,canvas.width,canvas.height);
    particles.forEach(p => {
      p.y += p.speed;
      p.x += Math.sin(count * 0.05) * 0.5;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = p.color;
      ctx.fill();
    });
    count++;
    if (count < 120) frame = requestAnimationFrame(draw);
    else ctx.clearRect(0,0,canvas.width,canvas.height);
  }
  draw();
}