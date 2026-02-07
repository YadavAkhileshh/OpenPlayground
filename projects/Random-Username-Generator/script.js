/* ===================================================
   Random Username Generator – Core Logic
   =================================================== */

// ──── Word Lists by Theme ────
const WORD_LISTS = {
  adjectives: {
    general: [
      'swift', 'bold', 'cool', 'epic', 'keen', 'lucky', 'mighty', 'noble',
      'prime', 'rapid', 'sharp', 'vivid', 'witty', 'zesty', 'brave', 'calm',
      'deft', 'eager', 'fiery', 'grand', 'happy', 'jolly', 'kind', 'lively',
      'neat', 'proud', 'quiet', 'royal', 'smart', 'true'
    ],
    fantasy: [
      'arcane', 'mystic', 'shadow', 'frost', 'ember', 'ancient', 'crystal',
      'divine', 'elven', 'golden', 'hidden', 'iron', 'lunar', 'mythic',
      'phantom', 'rune', 'sacred', 'thunder', 'wild', 'void'
    ],
    tech: [
      'cyber', 'digital', 'nano', 'pixel', 'quantum', 'binary', 'cloud',
      'data', 'electric', 'hyper', 'logic', 'mega', 'neural', 'open',
      'proto', 'silicon', 'turbo', 'virtual', 'wired', 'zero'
    ],
    nature: [
      'alpine', 'coral', 'desert', 'forest', 'glacial', 'ivy', 'jade',
      'leafy', 'misty', 'ocean', 'pine', 'river', 'stone', 'sunny',
      'tidal', 'valley', 'wild', 'windy', 'bloom', 'cedar'
    ],
    gaming: [
      'alpha', 'blitz', 'clutch', 'elite', 'frag', 'grind', 'hyper',
      'insane', 'killer', 'legend', 'master', 'nova', 'omega', 'power',
      'rage', 'savage', 'toxic', 'ultra', 'venom', 'warp'
    ],
    space: [
      'astro', 'cosmic', 'galactic', 'lunar', 'nebula', 'orbital', 'pulsar',
      'quasar', 'solar', 'stellar', 'void', 'warp', 'zenith', 'comet',
      'eclipse', 'meteor', 'nova', 'plasma', 'radiant', 'titan'
    ],
    food: [
      'crispy', 'golden', 'honey', 'maple', 'nutty', 'pepper', 'savory',
      'smoky', 'spicy', 'sweet', 'tangy', 'toasty', 'vanilla', 'zesty',
      'buttery', 'crunchy', 'fresh', 'glazed', 'minty', 'salty'
    ]
  },
  nouns: {
    general: [
      'falcon', 'wolf', 'hawk', 'tiger', 'phoenix', 'rider', 'runner',
      'scout', 'spark', 'star', 'blade', 'coder', 'drift', 'echo',
      'flash', 'ghost', 'hunter', 'jet', 'knight', 'lance', 'mask',
      'ninja', 'orbit', 'pilot', 'quest', 'raven', 'sage', 'viper',
      'wizard', 'zenith'
    ],
    fantasy: [
      'wizard', 'dragon', 'knight', 'paladin', 'ranger', 'sorcerer',
      'oracle', 'phoenix', 'golem', 'griffin', 'sentinel', 'warlock',
      'specter', 'archer', 'druid', 'shaman', 'titan', 'wraith',
      'crusader', 'enchanter'
    ],
    tech: [
      'bot', 'byte', 'chip', 'code', 'core', 'dev', 'engine', 'flux',
      'grid', 'hack', 'kernel', 'link', 'node', 'port', 'script',
      'server', 'stack', 'stream', 'sync', 'vault'
    ],
    nature: [
      'bear', 'brook', 'creek', 'dove', 'elk', 'fern', 'grove', 'hawk',
      'lake', 'lynx', 'moss', 'oak', 'peak', 'reef', 'sage', 'sparrow',
      'thorn', 'vine', 'willow', 'wolf'
    ],
    gaming: [
      'ace', 'boss', 'champ', 'clan', 'core', 'crew', 'fury', 'king',
      'lord', 'pro', 'raid', 'rift', 'rush', 'shield', 'sniper',
      'squad', 'strike', 'tank', 'titan', 'zone'
    ],
    space: [
      'comet', 'star', 'planet', 'rocket', 'shuttle', 'voyager', 'probe',
      'station', 'nebula', 'horizon', 'cosmos', 'satellite', 'capsule',
      'beacon', 'cruiser', 'lander', 'module', 'orbit', 'ranger', 'pilot'
    ],
    food: [
      'bagel', 'berry', 'biscuit', 'cake', 'chip', 'cookie', 'cupcake',
      'donut', 'fudge', 'mango', 'muffin', 'nacho', 'noodle', 'olive',
      'pancake', 'pretzel', 'taco', 'toast', 'waffle', 'brownie'
    ]
  }
};

// Profanity filter – basic blocklist
const BLOCKED_WORDS = new Set([
  'ass', 'damn', 'hell', 'crap', 'dick', 'shit', 'fuck', 'piss',
  'slut', 'whore', 'bitch', 'bastard', 'porn', 'nude', 'sex',
  'drug', 'kill', 'die', 'hate', 'nazi'
]);

// ──── Helper Utilities ────

function randomItem(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function randomNumber(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function containsProfanity(str) {
  const lower = str.toLowerCase();
  for (const word of BLOCKED_WORDS) {
    if (lower.includes(word)) return true;
  }
  return false;
}

function applyStyle(adjective, noun, style) {
  switch (style) {
    case 'camelCase':
      return adjective.toLowerCase() + noun.charAt(0).toUpperCase() + noun.slice(1).toLowerCase();
    case 'PascalCase':
      return adjective.charAt(0).toUpperCase() + adjective.slice(1).toLowerCase() +
             noun.charAt(0).toUpperCase() + noun.slice(1).toLowerCase();
    case 'snake_case':
      return adjective.toLowerCase() + '_' + noun.toLowerCase();
    case 'kebab-case':
      return adjective.toLowerCase() + '-' + noun.toLowerCase();
    case 'lowercase':
      return (adjective + noun).toLowerCase();
    default:
      return adjective + noun;
  }
}

// ──── Username Generation ────

function generateUsername(options) {
  const { theme, style, maxLength, includeNumbers, prefix, suffix } = options;

  const adjectives = WORD_LISTS.adjectives[theme] || WORD_LISTS.adjectives.general;
  const nouns = WORD_LISTS.nouns[theme] || WORD_LISTS.nouns.general;

  const adj = randomItem(adjectives);
  const noun = randomItem(nouns);

  let username = applyStyle(adj, noun, style);

  if (includeNumbers) {
    username += randomNumber(1, 999);
  }

  if (prefix) username = prefix + username;
  if (suffix) username = username + suffix;

  // Truncate to max length
  if (username.length > maxLength) {
    username = username.slice(0, maxLength);
  }

  return username;
}

function generateUsernames(options) {
  const { count, ensureUnique } = options;
  const results = [];
  const seen = new Set();
  let attempts = 0;
  const maxAttempts = count * 20; // prevent infinite loop

  while (results.length < count && attempts < maxAttempts) {
    attempts++;
    const username = generateUsername(options);

    if (containsProfanity(username)) continue;
    if (ensureUnique && seen.has(username.toLowerCase())) continue;

    seen.add(username.toLowerCase());
    results.push(username);
  }

  return results;
}

// ──── DOM References ────

const themeSelect = document.getElementById('theme-select');
const styleSelect = document.getElementById('style-select');
const lengthSlider = document.getElementById('length-slider');
const lengthValue = document.getElementById('length-value');
const countSlider = document.getElementById('count-slider');
const countValue = document.getElementById('count-value');
const prefixInput = document.getElementById('prefix-input');
const suffixInput = document.getElementById('suffix-input');
const includeNumbersCheck = document.getElementById('include-numbers');
const uniqueCheck = document.getElementById('unique-check');
const generateBtn = document.getElementById('generate-btn');
const exportBtn = document.getElementById('export-btn');
const clearBtn = document.getElementById('clear-btn');
const usernameList = document.getElementById('username-list');
const resultsBadge = document.getElementById('results-count');
const favoritesList = document.getElementById('favorites-list');
const favoritesBadge = document.getElementById('favorites-count');
const toast = document.getElementById('toast');

// ──── State ────

let currentUsernames = [];
let favorites = JSON.parse(localStorage.getItem('rug-favorites') || '[]');

// ──── Slider Labels ────

lengthSlider.addEventListener('input', () => {
  lengthValue.textContent = lengthSlider.value;
});

countSlider.addEventListener('input', () => {
  countValue.textContent = countSlider.value;
});

// ──── Toast ────

function showToast(msg) {
  toast.textContent = msg;
  toast.classList.add('show');
  setTimeout(() => toast.classList.remove('show'), 2000);
}

// ──── Render Functions ────

function createUsernameCard(username, index, isFavorite = false) {
  const card = document.createElement('div');
  card.className = 'username-card';
  card.style.animationDelay = `${index * 0.05}s`;

  const isStarred = favorites.includes(username);

  card.innerHTML = `
    <span class="username-text">${escapeHTML(username)}</span>
    <div class="card-actions">
      <button class="icon-btn copy-btn" title="Copy to clipboard" aria-label="Copy ${escapeHTML(username)}">
        <i class="ri-file-copy-line"></i>
      </button>
      ${!isFavorite ? `
        <button class="icon-btn star-btn ${isStarred ? 'starred' : ''}" title="Add to favorites" aria-label="Favorite ${escapeHTML(username)}">
          <i class="${isStarred ? 'ri-star-fill' : 'ri-star-line'}"></i>
        </button>
      ` : `
        <button class="icon-btn remove-fav-btn" title="Remove from favorites" aria-label="Remove ${escapeHTML(username)} from favorites">
          <i class="ri-close-line"></i>
        </button>
      `}
    </div>
  `;

  // Copy handler
  card.querySelector('.copy-btn').addEventListener('click', () => {
    navigator.clipboard.writeText(username).then(() => {
      showToast(`Copied "${username}" to clipboard!`);
    }).catch(() => {
      // Fallback
      const ta = document.createElement('textarea');
      ta.value = username;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      ta.remove();
      showToast(`Copied "${username}" to clipboard!`);
    });
  });

  // Star / Remove favorite handler
  if (!isFavorite) {
    const starBtn = card.querySelector('.star-btn');
    starBtn.addEventListener('click', () => {
      if (favorites.includes(username)) {
        favorites = favorites.filter(f => f !== username);
        starBtn.classList.remove('starred');
        starBtn.querySelector('i').className = 'ri-star-line';
        showToast(`Removed "${username}" from favorites`);
      } else {
        favorites.push(username);
        starBtn.classList.add('starred');
        starBtn.querySelector('i').className = 'ri-star-fill';
        showToast(`Added "${username}" to favorites ⭐`);
      }
      saveFavorites();
      renderFavorites();
    });
  } else {
    card.querySelector('.remove-fav-btn').addEventListener('click', () => {
      favorites = favorites.filter(f => f !== username);
      saveFavorites();
      renderFavorites();
      renderResults(); // update star states
      showToast(`Removed "${username}" from favorites`);
    });
  }

  return card;
}

function renderResults() {
  usernameList.innerHTML = '';

  if (currentUsernames.length === 0) {
    usernameList.innerHTML = '<p class="placeholder-text">Click "Generate Usernames" to get started!</p>';
    resultsBadge.textContent = '0';
    exportBtn.disabled = true;
    clearBtn.disabled = true;
    return;
  }

  currentUsernames.forEach((u, i) => {
    usernameList.appendChild(createUsernameCard(u, i));
  });

  resultsBadge.textContent = currentUsernames.length;
  exportBtn.disabled = false;
  clearBtn.disabled = false;
}

function renderFavorites() {
  favoritesList.innerHTML = '';

  if (favorites.length === 0) {
    favoritesList.innerHTML = '<p class="placeholder-text">Star usernames to add them to favorites.</p>';
    favoritesBadge.textContent = '0';
    return;
  }

  favorites.forEach((u, i) => {
    favoritesList.appendChild(createUsernameCard(u, i, true));
  });

  favoritesBadge.textContent = favorites.length;
}

function saveFavorites() {
  localStorage.setItem('rug-favorites', JSON.stringify(favorites));
}

function escapeHTML(str) {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

// ──── Event Handlers ────

generateBtn.addEventListener('click', () => {
  const options = {
    theme: themeSelect.value,
    style: styleSelect.value,
    maxLength: parseInt(lengthSlider.value, 10),
    count: parseInt(countSlider.value, 10),
    includeNumbers: includeNumbersCheck.checked,
    ensureUnique: uniqueCheck.checked,
    prefix: prefixInput.value.trim(),
    suffix: suffixInput.value.trim()
  };

  currentUsernames = generateUsernames(options);
  renderResults();
  showToast(`Generated ${currentUsernames.length} usernames!`);
});

clearBtn.addEventListener('click', () => {
  currentUsernames = [];
  renderResults();
  showToast('Cleared all usernames');
});

exportBtn.addEventListener('click', () => {
  if (currentUsernames.length === 0) return;

  const allUsernames = [...currentUsernames];
  if (favorites.length > 0) {
    allUsernames.push('', '--- Favorites ---');
    allUsernames.push(...favorites);
  }

  const text = allUsernames.join('\n');
  const blob = new Blob([text], { type: 'text/plain' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'usernames.txt';
  a.click();
  URL.revokeObjectURL(url);
  showToast('Exported usernames as .txt file!');
});

// ──── Init ────

renderFavorites();
