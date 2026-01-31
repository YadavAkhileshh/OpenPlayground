// Word list for validation
const VALID_WORDS = new Set([
    // 2-letter words
    'a', 'i', 'am', 'an', 'as', 'at', 'be', 'by', 'do', 'go', 'he', 'hi', 'if', 'in', 'is', 'it', 
    'me', 'my', 'no', 'of', 'on', 'or', 'so', 'to', 'up', 'us', 'we', 'you',
    
    // 3-letter words
    'ace', 'act', 'add', 'age', 'ago', 'aid', 'aim', 'air', 'all', 'and', 'ant', 'any', 'ape', 'arc', 'are', 'ark', 'arm', 'art', 'ash', 'ask', 'ate',
    'bad', 'bag', 'ban', 'bar', 'bat', 'bay', 'bed', 'bee', 'bet', 'bid', 'big', 'bin', 'bit', 'box', 'boy', 'bus', 'but', 'buy',
    'cab', 'can', 'cap', 'car', 'cat', 'cot', 'cow', 'cry', 'cup', 'cut',
    'dad', 'dam', 'day', 'did', 'die', 'dig', 'dog', 'dot', 'dry', 'dye',
    'ear', 'eat', 'egg', 'end', 'era', 'eve', 'eye',
    'far', 'fat', 'few', 'fig', 'fin', 'fit', 'fly', 'for', 'fox', 'fun', 'fur',
    'gap', 'gas', 'get', 'gnu', 'god', 'got', 'gun', 'gut', 'guy',
    'had', 'ham', 'has', 'hat', 'hay', 'her', 'hid', 'him', 'hip', 'his', 'hit', 'hot', 'how', 'hub', 'hug',
    'ice', 'ill', 'ink', 'inn', 'ion',
    'jam', 'jar', 'jaw', 'jet', 'job', 'joy', 'jug',
    'key', 'kid', 'kit',
    'lab', 'lad', 'lag', 'lap', 'law', 'lay', 'led', 'leg', 'let', 'lid', 'lie', 'lip', 'lit', 'log', 'lot', 'low',
    'mad', 'man', 'map', 'mat', 'may', 'men', 'met', 'mid', 'mix', 'mob', 'mom', 'mud',
    'nap', 'net', 'new', 'not', 'now', 'nut',
    'oak', 'oar', 'off', 'oil', 'old', 'one', 'our', 'out', 'owe', 'owl', 'own',
    'pad', 'pan', 'pat', 'paw', 'pay', 'pea', 'pen', 'per', 'pet', 'pie', 'pig', 'pin', 'pit', 'pop', 'pot', 'put',
    'rad', 'rain', 'ram', 'ran', 'rat', 'raw', 'ray', 'red', 'rid', 'rig', 'rim', 'rob', 'rod', 'rot', 'row', 'rub', 'rug', 'run', 'rut',
    'sad', 'sat', 'saw', 'say', 'sea', 'see', 'set', 'sew', 'she', 'shy', 'sin', 'sip', 'sir', 'sis', 'sit', 'six', 'sky', 'sly', 'sob', 'son', 'sow', 'spa', 'spy', 'sum', 'sun',
    'tab', 'tag', 'tan', 'tap', 'tar', 'tax', 'tea', 'ten', 'the', 'tie', 'tin', 'tip', 'toe', 'ton', 'too', 'top', 'toy', 'try', 'tub', 'two',
    'urn', 'use',
    'van', 'vet', 'vow',
    'wad', 'wag', 'war', 'was', 'way', 'web', 'wed', 'wet', 'who', 'why', 'wig', 'win', 'wit', 'won', 'wow',
    'yes', 'yet', 'you', 'yak',
    'zap', 'zen', 'zip', 'zoo',
    
    // 4-letter words
    'able', 'acid', 'aged', 'aide', 'also', 'area', 'army', 'away',
    'baby', 'back', 'ball', 'band', 'bank', 'base', 'bath', 'bear', 'beat', 'been', 'bell', 'belt', 'bend', 'bent', 'best', 'bike', 'bird', 'bite', 'blow', 'blue', 'boat', 'body', 'bold', 'bone', 'book', 'born', 'both', 'bowl', 'bulk', 'burn',
    'cake', 'call', 'came', 'camp', 'card', 'care', 'case', 'cast', 'cell', 'chat', 'chin', 'chop', 'city', 'clap', 'clay', 'clip', 'club', 'coal', 'coat', 'code', 'cold', 'come', 'cook', 'cool', 'cope', 'cord', 'core', 'corn', 'cost', 'crop', 'cube', 'cure', 'curl', 'cute',
    'dark', 'date', 'dawn', 'dead', 'deal', 'dean', 'dear', 'deck', 'deed', 'deep', 'desk', 'dial', 'dice', 'died', 'diet', 'dime', 'dine', 'disk', 'dive', 'dock', 'done', 'door', 'down', 'drag', 'draw', 'drew', 'drip', 'drop', 'duke', 'dull', 'dump', 'dusk', 'dust',
    'each', 'earl', 'earn', 'ease', 'east', 'easy', 'echo', 'edge', 'edit', 'else', 'emit', 'epic', 'euro', 'even', 'ever', 'evil', 'exam',
    'face', 'fact', 'fade', 'fail', 'fair', 'fall', 'fame', 'farm', 'fast', 'fear', 'feed', 'feel', 'feet', 'fell', 'felt', 'file', 'fill', 'film', 'find', 'fine', 'fire', 'firm', 'fish', 'fist', 'five', 'flag', 'flat', 'fled', 'flee', 'flew', 'flip', 'flow', 'foam', 'fold', 'folk', 'food', 'foot', 'fork', 'form', 'fort', 'foul', 'four', 'free', 'from', 'fuel', 'full', 'fund',
    'game', 'gang', 'gate', 'gave', 'gear', 'gift', 'girl', 'give', 'glad', 'glen', 'glue', 'goal', 'goat', 'gold', 'golf', 'gone', 'good', 'grab', 'gray', 'grew', 'grid', 'grim', 'grin', 'grip', 'grow', 'gulf', 'guru', 'gust',
    'hack', 'hair', 'half', 'hall', 'halt', 'hand', 'hang', 'hard', 'harm', 'hate', 'have', 'hawk', 'head', 'heal', 'heap', 'hear', 'heat', 'heel', 'heir', 'held', 'hell', 'help', 'hemp', 'herb', 'herd', 'hero', 'hide', 'high', 'hike', 'hill', 'hind', 'hint', 'hire', 'hold', 'hole', 'holy', 'home', 'hood', 'hook', 'hope', 'horn', 'hour', 'huge', 'hung', 'hurt', 'hymn',
    'icon', 'idea', 'idle', 'inch',
    'jade', 'jail', 'jazz', 'jean', 'jeep', 'joke', 'july', 'jump', 'june', 'junk', 'jury', 'just',
    'keen', 'keep', 'kept', 'kick', 'kill', 'kind', 'king', 'kiss', 'kite', 'knee', 'knew', 'knit', 'knob', 'know',
    'lack', 'lady', 'laid', 'lake', 'lamb', 'lame', 'land', 'lane', 'last', 'late', 'lead', 'leaf', 'leak', 'lean', 'leap', 'left', 'lend', 'lens', 'lent', 'less', 'liar', 'lice', 'lick', 'life', 'lift', 'like', 'lily', 'limb', 'lime', 'line', 'link', 'lion', 'list', 'live', 'load', 'loaf', 'loan', 'lock', 'loft', 'lone', 'long', 'look', 'loop', 'lord', 'lose', 'loss', 'lost', 'loud', 'love', 'luck', 'lump', 'lung',
    'made', 'maid', 'mail', 'main', 'make', 'male', 'mall', 'malt', 'many', 'mark', 'mars', 'mask', 'mass', 'mate', 'math', 'meal', 'mean', 'meat', 'meet', 'melt', 'memo', 'menu', 'mesh', 'mice', 'mild', 'mile', 'milk', 'mill', 'mind', 'mine', 'mint', 'mist', 'mock', 'mode', 'mold', 'mole', 'monk', 'mood', 'moon', 'moor', 'more', 'moss', 'most', 'moth', 'move', 'much', 'mule', 'muse', 'myth',
    'nail', 'name', 'navy', 'near', 'neat', 'neck', 'need', 'nest', 'news', 'next', 'nice', 'nick', 'nine', 'node', 'none', 'noon', 'norm', 'nose', 'note', 'noun',
    'obey', 'odds', 'ogre', 'once', 'only', 'onto', 'ooze', 'open', 'oral', 'oven', 'over', 'owed', 'owes', 'owns',
    'pace', 'pack', 'page', 'paid', 'pail', 'pain', 'pair', 'pale', 'palm', 'pane', 'pant', 'papa', 'park', 'part', 'pass', 'past', 'path', 'pave', 'peak', 'pear', 'peel', 'peer', 'pelt', 'pest', 'pick', 'pier', 'pike', 'pile', 'pill', 'pine', 'pink', 'pipe', 'plan', 'play', 'plea', 'plot', 'plow', 'plum', 'plus', 'poem', 'poet', 'pole', 'poll', 'pond', 'pony', 'pool', 'poor', 'pope', 'pork', 'port', 'pose', 'post', 'pour', 'pray', 'prep', 'prey', 'pull', 'pulp', 'pump', 'punk', 'pure', 'push',
    'quad', 'quit',
    'race', 'rack', 'rage', 'raid', 'rail', 'rain', 'rake', 'ramp', 'rank', 'rare', 'rate', 'read', 'real', 'ream', 'reap', 'rear', 'rent', 'rest', 'rice', 'rich', 'ride', 'rife', 'rift', 'ring', 'riot', 'ripe', 'rise', 'risk', 'road', 'roam', 'roar', 'robe', 'rock', 'rode', 'role', 'roll', 'roof', 'room', 'root', 'rope', 'rose', 'rote', 'rude', 'ruin', 'rule', 'rung', 'rush', 'rust',
    'safe', 'sage', 'said', 'sail', 'sake', 'sale', 'salt', 'same', 'sand', 'sane', 'sang', 'sank', 'save', 'seal', 'seam', 'seat', 'seed', 'seek', 'seem', 'seen', 'self', 'sell', 'semi', 'send', 'sent', 'sept', 'shed', 'ship', 'shoe', 'shop', 'shot', 'show', 'side', 'sigh', 'sign', 'silk', 'sing', 'sink', 'site', 'size', 'skin', 'skip', 'slab', 'slag', 'slam', 'slap', 'slid', 'slim', 'slip', 'slow', 'slug', 'snap', 'snow', 'soap', 'soar', 'sock', 'soft', 'soil', 'sold', 'sole', 'solo', 'some', 'song', 'soon', 'sore', 'sort', 'soul', 'soup', 'sour', 'span', 'spec', 'spin', 'spit', 'spot', 'stab', 'star', 'stay', 'stem', 'step', 'stew', 'stop', 'stud', 'such', 'suit', 'sump', 'sung', 'sunk', 'sure', 'surf', 'swim',
    'tail', 'take', 'tale', 'talk', 'tall', 'tame', 'tank', 'tape', 'task', 'team', 'tear', 'tease', 'teen', 'tell', 'tend', 'tent', 'term', 'test', 'text', 'than', 'that', 'thee', 'them', 'then', 'they', 'thin', 'this', 'thou', 'thus', 'tick', 'tide', 'tidy', 'tied', 'tier', 'ties', 'tile', 'till', 'tilt', 'time', 'tint', 'tiny', 'tire', 'toad', 'todd', 'toes', 'tofu', 'told', 'toll', 'tomb', 'tone', 'took', 'tool', 'tops', 'tore', 'torn', 'toss', 'tour', 'town', 'trap', 'tray', 'tree', 'trek', 'trim', 'trio', 'trip', 'trot', 'troy', 'true', 'tube', 'tuna', 'tune', 'turf', 'turn', 'twin', 'twin', 'type',
    'ugly', 'unit', 'upon', 'used', 'user',
    'vain', 'vale', 'very', 'vice', 'view', 'vine', 'vise', 'void', 'vote',
    'wade', 'wage', 'wail', 'wait', 'wake', 'walk', 'wall', 'wand', 'want', 'ward', 'warm', 'warn', 'wart', 'wash', 'wasp', 'wave', 'weak', 'wear', 'webs', 'week', 'weep', 'well', 'went', 'were', 'west', 'what', 'when', 'whom', 'whip', 'wide', 'wife', 'wild', 'will', 'wind', 'wine', 'wing', 'wink', 'wire', 'wise', 'wish', 'with', 'wolf', 'womb', 'wood', 'wool', 'word', 'wore', 'work', 'worm', 'worn', 'wrap', 'wrist',
    'yard', 'yarn', 'year', 'yell', 'yoke', 'your',
    'zero', 'zone', 'zoom',
    
    // 5-letter words
    'about', 'above', 'abuse', 'acted', 'acute', 'admit', 'adobe', 'adopt', 'adult', 'after', 'again', 'agent', 'agree', 'ahead', 'alarm', 'album', 'alert', 'alias', 'alien', 'align', 'alike', 'alive', 'allow', 'alone', 'along', 'alter', 'angel', 'anger', 'angle', 'angry', 'ankle', 'apart', 'apple', 'apply', 'arena', 'argue', 'arise', 'armed', 'armor', 'arose', 'array', 'arrow', 'aside', 'asset', 'avoid', 'awake', 'award', 'aware', 'badly',
    'badge', 'beach', 'beard', 'beast', 'began', 'begin', 'being', 'below', 'bench', 'billy', 'birth', 'black', 'blade', 'blame', 'blank', 'bleed', 'blend', 'blind', 'blink', 'block', 'blood', 'blown', 'board', 'boost', 'booth', 'bound', 'brain', 'brand', 'brass', 'brave', 'bread', 'break', 'breed', 'brick', 'bride', 'brief', 'bring', 'brink', 'broad', 'broke', 'brown', 'build', 'built', 'burst',
    'cable', 'cabin', 'calif', 'camel', 'canal', 'candy', 'canoe', 'canon', 'cargo', 'carol', 'carry', 'carve', 'catch', 'cause', 'chain', 'chair', 'chalk', 'champ', 'chant', 'chaos', 'charm', 'chart', 'chase', 'cheap', 'cheat', 'check', 'cheek', 'cheer', 'chess', 'chest', 'chief', 'child', 'china', 'chips', 'chose', 'chunk', 'civic', 'civil', 'claim', 'clamp', 'clash', 'class', 'clean', 'clear', 'click', 'cliff', 'climb', 'clock', 'clone', 'close', 'cloth', 'cloud', 'coach', 'coast', 'cobra', 'cocoa', 'colon', 'color', 'couch', 'could', 'count', 'court', 'cover', 'crack', 'craft', 'crash', 'crazy', 'cream', 'creed', 'creek', 'crime', 'crisp', 'crook', 'cross', 'crowd', 'crown', 'crude', 'crush', 'cubic', 'curve',
    'daily', 'dairy', 'dance', 'dated', 'dealt', 'death', 'debut', 'decay', 'decor', 'decoy', 'decry', 'defer', 'delay', 'delta', 'delve', 'dense', 'depot', 'depth', 'derby', 'deter', 'devil', 'diary', 'digit', 'dilly', 'dimly', 'diner', 'dirty', 'disco', 'diver', 'dizzy', 'dogma', 'doing', 'donor', 'doubt', 'dough', 'dozen', 'draft', 'drain', 'drake', 'drama', 'drank', 'drawn', 'dread', 'dream', 'dress', 'dried', 'drift', 'drill', 'drink', 'drive', 'droit', 'drown', 'drunk', 'dusty', 'dwarf',
    'eager', 'eagle', 'early', 'earth', 'easel', 'eater', 'eaves', 'ebony', 'eclipse', 'edict', 'eerie', 'eight', 'eject', 'elate', 'elbow', 'elder', 'elect', 'elite', 'elope', 'elude', 'email', 'ember', 'emerge', 'empty', 'enact', 'ended', 'enemy', 'enjoy', 'enter', 'entry', 'envoy', 'equal', 'equip', 'erase', 'erupt', 'essay', 'ether', 'ethic', 'evade', 'event', 'every', 'evict', 'evoke', 'exact', 'exalt', 'excel', 'exert', 'exile', 'exist', 'expel', 'extol', 'extra', 'exude',
    'fable', 'facet', 'fade', 'faith', 'false', 'famed', 'fancy', 'farce', 'fatal', 'fault', 'fauna', 'favor', 'feast', 'feint', 'femur', 'fence', 'ferry', 'fever', 'fewer', 'field', 'fiend', 'fiery', 'fifty', 'fight', 'filch', 'filed', 'filer', 'filet', 'filly', 'films', 'filmy', 'final', 'finch', 'fined', 'finer', 'finis', 'finny', 'fired', 'firer', 'first', 'fishy', 'fixer', 'fjord', 'flack', 'flail', 'flair', 'flake', 'flaky', 'flame', 'flank', 'flare', 'flash', 'flask', 'fleck', 'flees', 'fleet', 'flesh', 'flick', 'flier', 'flies', 'fling', 'flint', 'flirt', 'float', 'flock', 'flood', 'floor', 'flora', 'floss', 'flour', 'flown', 'fluid', 'fluke', 'flung', 'flush', 'flute', 'foamy', 'focal', 'focus', 'foggy', 'foil', 'folded', 'folio', 'folly', 'force', 'forge', 'forgo', 'forte', 'forth', 'forty', 'forum', 'fossil', 'foster', 'found', 'foyer', 'frail', 'frame', 'franc', 'frank', 'fraud', 'freak', 'freed', 'fresh', 'friar', 'fried', 'frill', 'frisk', 'frock', 'front', 'frost', 'froth', 'frown', 'froze', 'fruit', 'fryer', 'fudge', 'fully', 'fumed', 'fungi', 'funky', 'funny', 'furry', 'fused', 'fussy', 'fuzzy'
]);

// Game state
const gameState = {
    isGameRunning: false,
    isPaused: false,
    score: 0,
    wordsFound: [],
    timeRemaining: 60,
    totalTime: 60,
    currentLetters: [],
    selectedIndices: [],
    timerInterval: null
};

// Initialize the game
function initGame() {
    gameState.isGameRunning = true;
    gameState.isPaused = false;
    gameState.score = 0;
    gameState.wordsFound = [];
    gameState.timeRemaining = 60;
    gameState.selectedIndices = [];
    
    generateLetters();
    updateUI();
    startTimer();
    document.getElementById('startBtn').style.display = 'none';
    document.getElementById('pauseBtn').style.display = 'inline-block';
}

// Generate random letters
function generateLetters() {
    const consonants = 'bcdfghjklmnpqrstvwxyz'.split('');
    const vowels = 'aeiou'.split('');
    
    gameState.currentLetters = [];
    
    // Get more vowels for better word formation
    for (let i = 0; i < 12; i++) {
        if (i < 5) {
            gameState.currentLetters.push(vowels[Math.floor(Math.random() * vowels.length)]);
        } else {
            gameState.currentLetters.push(consonants[Math.floor(Math.random() * consonants.length)]);
        }
    }
    
    // Shuffle the letters
    for (let i = gameState.currentLetters.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [gameState.currentLetters[i], gameState.currentLetters[j]] = [gameState.currentLetters[j], gameState.currentLetters[i]];
    }
    
    displayLetters();
}

// Display letters as buttons
function displayLetters() {
    const grid = document.getElementById('lettersGrid');
    grid.innerHTML = '';
    
    gameState.currentLetters.forEach((letter, index) => {
        const btn = document.createElement('button');
        btn.className = 'letter-btn';
        btn.textContent = letter.toUpperCase();
        btn.id = `letter-${index}`;
        
        if (gameState.selectedIndices.includes(index)) {
            btn.classList.add('selected');
        }
        
        btn.onclick = () => toggleLetter(index);
        grid.appendChild(btn);
    });
}

// Toggle letter selection
function toggleLetter(index) {
    if (!gameState.isGameRunning || gameState.isPaused) return;
    
    if (gameState.selectedIndices.includes(index)) {
        gameState.selectedIndices = gameState.selectedIndices.filter(i => i !== index);
    } else {
        gameState.selectedIndices.push(index);
    }
    
    updateSelectedLetters();
    displayLetters();
}

// Update selected letters display
function updateSelectedLetters() {
    const container = document.getElementById('selectedLetters');
    container.innerHTML = '';
    
    gameState.selectedIndices.forEach(index => {
        const letter = gameState.currentLetters[index];
        const span = document.createElement('span');
        span.textContent = letter.toUpperCase();
        container.appendChild(span);
    });
}

// Clear selected letters
function clearSelection() {
    gameState.selectedIndices = [];
    updateSelectedLetters();
    displayLetters();
}

// Get current word
function getCurrentWord() {
    return gameState.selectedIndices.map(i => gameState.currentLetters[i].toLowerCase()).join('');
}

// Submit word
function submitWord() {
    if (!gameState.isGameRunning || gameState.isPaused) return;
    
    const word = getCurrentWord();
    
    if (word.length < 2) {
        showMessage('Word must be at least 2 letters!', 'error');
        return;
    }
    
    if (gameState.wordsFound.includes(word)) {
        showMessage('Word already found!', 'error');
        clearSelection();
        return;
    }
    
    if (!VALID_WORDS.has(word)) {
        showMessage('Word not in dictionary!', 'error');
        clearSelection();
        return;
    }
    
    // Calculate score
    const points = Math.pow(word.length, 2);
    gameState.score += points;
    gameState.wordsFound.push(word);
    
    showMessage(`+${points} points! 🎉`, 'success');
    clearSelection();
    updateUI();
}

// Start timer
function startTimer() {
    if (gameState.timerInterval) clearInterval(gameState.timerInterval);
    
    gameState.timerInterval = setInterval(() => {
        if (!gameState.isPaused && gameState.isGameRunning) {
            gameState.timeRemaining--;
            updateUI();
            
            if (gameState.timeRemaining <= 0) {
                endGame();
            }
        }
    }, 1000);
}

// End game
function endGame() {
    gameState.isGameRunning = false;
    clearInterval(gameState.timerInterval);
    
    document.getElementById('finalScore').textContent = gameState.score;
    document.getElementById('finalWordsFound').textContent = gameState.wordsFound.length;
    document.getElementById('gameOverModal').classList.add('active');
    
    document.getElementById('startBtn').style.display = 'inline-block';
    document.getElementById('pauseBtn').style.display = 'none';
}

// Shuffle letters
function shuffleLetters() {
    if (!gameState.isGameRunning || gameState.isPaused) return;
    
    gameState.selectedIndices = [];
    
    for (let i = gameState.currentLetters.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [gameState.currentLetters[i], gameState.currentLetters[j]] = [gameState.currentLetters[j], gameState.currentLetters[i]];
    }
    
    updateSelectedLetters();
    displayLetters();
}

// Pause/Resume game
function togglePause() {
    gameState.isPaused = !gameState.isPaused;
    const pauseBtn = document.getElementById('pauseBtn');
    pauseBtn.textContent = gameState.isPaused ? '▶ Resume' : '⏸ Pause';
}

// Update UI
function updateUI() {
    document.getElementById('score').textContent = gameState.score;
    document.getElementById('wordsFound').textContent = gameState.wordsFound.length;
    document.getElementById('timer').textContent = gameState.timeRemaining;
    
    const wordsList = document.getElementById('wordsList');
    const noWords = document.getElementById('noWords');
    
    if (gameState.wordsFound.length > 0) {
        noWords.style.display = 'none';
        wordsList.innerHTML = gameState.wordsFound
            .map(word => `<li>${word.toUpperCase()}</li>`)
            .join('');
    } else {
        noWords.style.display = 'block';
        wordsList.innerHTML = '';
    }
}

// Show message
function showMessage(text, type) {
    const message = document.getElementById('message');
    message.textContent = text;
    message.className = `message ${type}`;
    
    setTimeout(() => {
        message.textContent = '';
        message.className = 'message';
    }, 3000);
}

// Event listeners
document.getElementById('startBtn').addEventListener('click', initGame);
document.getElementById('pauseBtn').addEventListener('click', togglePause);
document.getElementById('submitBtn').addEventListener('click', submitWord);
document.getElementById('clearBtn').addEventListener('click', clearSelection);
document.getElementById('shuffleBtn').addEventListener('click', shuffleLetters);
document.getElementById('playAgainBtn').addEventListener('click', () => {
    document.getElementById('gameOverModal').classList.remove('active');
    initGame();
});

// Allow Enter key to submit word
document.addEventListener('keypress', (e) => {
    if (e.key === 'Enter' && gameState.isGameRunning && !gameState.isPaused) {
        submitWord();
    }
});

// Initialize UI
updateUI();
