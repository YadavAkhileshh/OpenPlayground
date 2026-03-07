// ======== FOOD DATA ========
const FOODS = [
    {
        id: 'steak', name: 'Steak', emoji: '🥩', category: 'Meat',
        modes: [
            { label: 'Rare', icon: '🔴', time: 120, temp: '125°F / 52°C' },
            { label: 'Medium Rare', icon: '🟠', time: 180, temp: '135°F / 57°C' },
            { label: 'Medium', icon: '🟡', time: 240, temp: '145°F / 63°C' },
            { label: 'Well Done', icon: '⚫', time: 360, temp: '160°F / 71°C' },
        ],
        tips: [
            { icon: '🌡️', title: 'Rest the meat', text: 'Let steak rest 5 min after cooking so juices redistribute.' },
            { icon: '🧂', title: 'Season early', text: 'Salt at least 40 min before, or right before cooking.' },
            { icon: '🔥', title: 'High heat sear', text: 'Get your pan screaming hot before adding the steak.' },
            { icon: '🧈', title: 'Baste with butter', text: 'Add butter, garlic & thyme in last 2 min for extra flavour.' },
        ],
        doneMsg: 'Let it rest 5 minutes before cutting.'
    },
    {
        id: 'chicken', name: 'Chicken Breast', emoji: '🍗', category: 'Meat',
        modes: [
            { label: 'Pan-Fry', icon: '🍳', time: 840, temp: '165°F / 74°C' },
            { label: 'Oven Bake', icon: '🫙', time: 1500, temp: '375°F / 190°C' },
            { label: 'Grill', icon: '🔥', time: 600, temp: 'Medium-high heat' },
            { label: 'Air Fryer', icon: '💨', time: 900, temp: '380°F / 193°C' },
        ],
        tips: [
            { icon: '🌡️', title: 'Check temp', text: 'Always reach 165°F/74°C internal for food safety.' },
            { icon: '💧', title: 'Don\'t dry out', text: 'Pound to even thickness for uniform cooking.' },
            { icon: '🧊', title: 'Room temp', text: 'Bring chicken to room temp 15 min before cooking.' },
            { icon: '🫙', title: 'Cover when resting', text: 'Cover with foil for 5 min after cooking.' },
        ],
        doneMsg: 'Check internal temp is 165°F / 74°C before serving.'
    },
    {
        id: 'pasta', name: 'Pasta', emoji: '🍝', category: 'Grains',
        modes: [
            { label: 'Al Dente', icon: '⭐', time: 480, temp: 'Rolling boil' },
            { label: 'Standard', icon: '✅', time: 600, temp: 'Rolling boil' },
            { label: 'Soft', icon: '😌', time: 720, temp: 'Rolling boil' },
        ],
        tips: [
            { icon: '🧂', title: 'Salt the water', text: 'Use generous salt — water should taste like the sea.' },
            { icon: '💧', title: 'Save pasta water', text: 'Keep a cup of starchy water to finish your sauce.' },
            { icon: '🍳', title: 'Finish in sauce', text: 'Transfer 1-2 min early and finish cooking in the sauce.' },
            { icon: '🫙', title: 'No oil in water', text: 'Oil prevents sauce from sticking to the pasta.' },
        ],
        doneMsg: 'Drain immediately and toss with sauce!'
    },
    {
        id: 'eggs', name: 'Eggs', emoji: '🥚', category: 'Dairy & Eggs',
        modes: [
            { label: 'Soft Boiled', icon: '🟡', time: 360, temp: 'Simmering water' },
            { label: 'Medium Boiled', icon: '🟠', time: 480, temp: 'Simmering water' },
            { label: 'Hard Boiled', icon: '⚪', time: 720, temp: 'Simmering water' },
            { label: 'Poached', icon: '💧', time: 180, temp: 'Barely simmering' },
        ],
        tips: [
            { icon: '🧊', title: 'Ice bath', text: 'Plunge into ice water immediately to stop cooking.' },
            { icon: '🥚', title: 'Room temp eggs', text: 'Cold eggs may crack when placed in boiling water.' },
            { icon: '💧', title: 'Gentle simmer', text: 'Violent boiling makes whites rubbery.' },
            { icon: '🍋', title: 'Vinegar trick', text: 'Add a splash of vinegar to poaching water to help whites hold.' },
        ],
        doneMsg: 'Immediately transfer to ice water to stop cooking!'
    },
    {
        id: 'rice', name: 'Rice', emoji: '🍚', category: 'Grains',
        modes: [
            { label: 'White Rice', icon: '⬜', time: 1080, temp: 'Low simmer' },
            { label: 'Brown Rice', icon: '🟤', time: 2700, temp: 'Low simmer' },
            { label: 'Jasmine', icon: '🌸', time: 900, temp: 'Low simmer' },
            { label: 'Basmati', icon: '✨', time: 840, temp: 'Low simmer' },
        ],
        tips: [
            { icon: '💧', title: 'Rinse first', text: 'Rinse until water runs clear to remove excess starch.' },
            { icon: '🚫', title: 'Don\'t lift lid', text: 'Resist peeking — steam is essential for cooking.' },
            { icon: '🧊', title: 'Rest after', text: 'Let rice steam off heat, covered, for 5-10 min.' },
            { icon: '🍳', title: '1:1.5 ratio', text: 'Use 1.5 cups water per cup of white rice.' },
        ],
        doneMsg: 'Fluff with a fork and let rest 5 minutes.'
    },
    {
        id: 'salmon', name: 'Salmon', emoji: '🐟', category: 'Seafood',
        modes: [
            { label: 'Pan-Sear', icon: '🍳', time: 480, temp: '145°F / 63°C' },
            { label: 'Oven Bake', icon: '🫙', time: 900, temp: '400°F / 200°C' },
            { label: 'Grill', icon: '🔥', time: 480, temp: 'Medium-high' },
            { label: 'Medium-Rare', icon: '🟠', time: 360, temp: '125°F / 52°C' },
        ],
        tips: [
            { icon: '🐟', title: 'Skin side down', text: 'Start skin-side down on hot pan for crispy skin.' },
            { icon: '🌡️', title: 'Don\'t overcook', text: 'Salmon is best at 130–145°F. It dries out quickly.' },
            { icon: '🫙', title: 'Pat dry', text: 'Dry the fish well before cooking for better searing.' },
            { icon: '🍋', title: 'Acid at end', text: 'Add lemon juice only after cooking — it cooks the fish.' },
        ],
        doneMsg: 'Salmon should flake easily with a fork when done.'
    },
    {
        id: 'potato', name: 'Potatoes', emoji: '🥔', category: 'Vegetables',
        modes: [
            { label: 'Boiled', icon: '💧', time: 1200, temp: 'Boiling water' },
            { label: 'Roasted', icon: '🔥', time: 2700, temp: '425°F / 220°C' },
            { label: 'Baked', icon: '🫙', time: 3600, temp: '400°F / 200°C' },
            { label: 'Air Fryer', icon: '💨', time: 1800, temp: '400°F / 200°C' },
        ],
        tips: [
            { icon: '🧂', title: 'Salt the water', text: 'Boiling in salted water seasons from the inside.' },
            { icon: '🫙', title: 'Even size', text: 'Cut to similar sizes so everything cooks uniformly.' },
            { icon: '💧', title: 'Dry before roasting', text: 'Pat completely dry for the crispiest roast potatoes.' },
            { icon: '🌡️', title: 'Fork test', text: 'A fork should slide in with no resistance when done.' },
        ],
        doneMsg: 'Check tenderness with a fork before removing from heat.'
    },
    {
        id: 'broccoli', name: 'Broccoli', emoji: '🥦', category: 'Vegetables',
        modes: [
            { label: 'Steam', icon: '💨', time: 300, temp: 'Steaming' },
            { label: 'Roast', icon: '🔥', time: 1200, temp: '425°F / 220°C' },
            { label: 'Blanch', icon: '💧', time: 120, temp: 'Boiling water' },
            { label: 'Stir-Fry', icon: '🍳', time: 240, temp: 'High heat' },
        ],
        tips: [
            { icon: '🥦', title: 'Uniform florets', text: 'Cut florets similar size for even cooking.' },
            { icon: '🧊', title: 'Blanch & shock', text: 'Ice bath after blanching keeps colour bright green.' },
            { icon: '🧄', title: 'Add garlic', text: 'Roast with garlic, olive oil, and lemon zest.' },
            { icon: '⏱️', title: 'Don\'t overcook', text: 'Overcooked broccoli turns mushy and loses nutrition.' },
        ],
        doneMsg: 'Broccoli should be bright green and tender-crisp.'
    },
    {
        id: 'bread', name: 'Bread', emoji: '🍞', category: 'Baking',
        modes: [
            { label: 'Sandwich Loaf', icon: '🍞', time: 2400, temp: '350°F / 175°C' },
            { label: 'Artisan Loaf', icon: '🥖', time: 2700, temp: '450°F / 230°C' },
            { label: 'Rolls', icon: '🫓', time: 1200, temp: '375°F / 190°C' },
            { label: 'Focaccia', icon: '🫓', time: 1500, temp: '425°F / 220°C' },
        ],
        tips: [
            { icon: '🌡️', title: 'Internal temp', text: 'Done when internal temp reaches 190–210°F / 88–99°C.' },
            { icon: '🔊', title: 'Hollow sound', text: 'Tap the bottom — done bread sounds hollow.' },
            { icon: '🧊', title: 'Cool on rack', text: 'Never slice hot bread — steam inside is still cooking it.' },
            { icon: '💧', title: 'Steam in oven', text: 'Add a pan of water for cracklier artisan crust.' },
        ],
        doneMsg: 'Let bread cool on a wire rack for at least 30 minutes!'
    },
    {
        id: 'shrimp', name: 'Shrimp', emoji: '🦐', category: 'Seafood',
        modes: [
            { label: 'Sauté', icon: '🍳', time: 180, temp: 'Medium-high heat' },
            { label: 'Grill', icon: '🔥', time: 240, temp: 'Medium-high heat' },
            { label: 'Boil', icon: '💧', time: 120, temp: 'Boiling water' },
            { label: 'Bake', icon: '🫙', time: 480, temp: '400°F / 200°C' },
        ],
        tips: [
            { icon: '🦐', title: 'C-shape vs O', text: 'C-shape = cooked. O-shape (tight curl) = overcooked.' },
            { icon: '🚫', title: 'Don\'t overcook', text: 'Shrimp cook extremely fast — watch closely.' },
            { icon: '💧', title: 'Dry before cooking', text: 'Pat dry for better searing and browning.' },
            { icon: '🧂', title: 'Season shells', text: 'Cook in shell for extra flavour, peel after.' },
        ],
        doneMsg: 'Shrimp are done when pink and opaque — remove immediately!'
    },
    {
        id: 'cake', name: 'Cake', emoji: '🎂', category: 'Baking',
        modes: [
            { label: 'Layer Cake', icon: '🎂', time: 1800, temp: '350°F / 175°C' },
            { label: 'Cupcakes', icon: '🧁', time: 1200, temp: '350°F / 175°C' },
            { label: 'Cheesecake', icon: '🍰', time: 4200, temp: '325°F / 163°C' },
            { label: 'Lava Cake', icon: '🫀', time: 780, temp: '425°F / 220°C' },
        ],
        tips: [
            { icon: '🌡️', title: 'Room temp ingredients', text: 'Cold butter/eggs cause uneven mixing and texture.' },
            { icon: '🧁', title: 'Toothpick test', text: 'Insert toothpick — done when it comes out clean.' },
            { icon: '🚫', title: 'Don\'t open oven', text: 'Opening oven too early causes cakes to sink.' },
            { icon: '🧊', title: 'Cool before frosting', text: 'Frost only when completely cool or icing melts.' },
        ],
        doneMsg: 'Cool completely on a wire rack before removing from pan.'
    },
    {
        id: 'mushrooms', name: 'Mushrooms', emoji: '🍄', category: 'Vegetables',
        modes: [
            { label: 'Sauté', icon: '🍳', time: 420, temp: 'Medium-high heat' },
            { label: 'Roast', icon: '🔥', time: 1200, temp: '400°F / 200°C' },
            { label: 'Grill', icon: '🔥', time: 600, temp: 'Medium heat' },
        ],
        tips: [
            { icon: '🚫', title: 'Don\'t crowd', text: 'Crowding steams mushrooms instead of browning them.' },
            { icon: '💧', title: 'Don\'t wash', text: 'Wipe clean with damp cloth — don\'t submerge in water.' },
            { icon: '🧂', title: 'Salt at end', text: 'Salt draws moisture — add at end for better browning.' },
            { icon: '🧈', title: 'Finish with butter', text: 'Add butter at end for rich, glossy sauce.' },
        ],
        doneMsg: 'Golden-brown and reduced in size — perfect!'
    },
];

const CATEGORIES = ['All', 'Meat', 'Seafood', 'Vegetables', 'Grains', 'Dairy & Eggs', 'Baking'];

// ======== STATE ========
let currentFood = null;
let currentMode = null;
let timerInterval = null;
let timeRemaining = 0;
let totalTime = 0;
let timerRunning = false;
let activeCategory = 'All';

// ======== PIXI SETUP ========
(async () => {
    const canvas = document.getElementById('pixi-canvas');
    const app = new PIXI.Application({
        view: canvas,
        width: window.innerWidth,
        height: window.innerHeight,
        backgroundAlpha: 0,
        antialias: true,
        resolution: window.devicePixelRatio || 1,
        autoDensity: true,
    });

    // Particle container
    const container = new PIXI.Container();
    app.stage.addChild(container);

    // Steam/bubble particles
    const particles = [];
    const NUM_PARTICLES = 28;

    function createParticle() {
        const g = new PIXI.Graphics();
        const type = Math.random() > 0.5 ? 'circle' : 'ring';
        const size = 3 + Math.random() * 10;
        const color = [0xD4873A, 0xF0A855, 0x7A9B76, 0xE8D5B7, 0xC04E2A][Math.floor(Math.random() * 5)];

        if (type === 'circle') {
            g.beginFill(color, 0.12 + Math.random() * 0.15);
            g.drawCircle(0, 0, size);
            g.endFill();
        } else {
            g.lineStyle(1.5, color, 0.18 + Math.random() * 0.12);
            g.drawCircle(0, 0, size);
        }

        g.x = Math.random() * window.innerWidth;
        g.y = window.innerHeight + 40;

        const speed = 0.4 + Math.random() * 0.9;
        const drift = (Math.random() - 0.5) * 0.8;
        const spin = (Math.random() - 0.5) * 0.025;
        const delay = Math.random() * 400;

        return { g, speed, drift, spin, delay, dead: false, phase: Math.random() * Math.PI * 2 };
    }

    for (let i = 0; i < NUM_PARTICLES; i++) {
        const p = createParticle();
        p.g.y = Math.random() * window.innerHeight;
        container.addChild(p.g);
        particles.push(p);
    }

    let t = 0;
    app.ticker.add(() => {
        t++;
        particles.forEach((p, i) => {
            if (p.delay > 0) { p.delay--; return; }
            p.g.y -= p.speed;
            p.g.x += p.drift + Math.sin(t * 0.02 + p.phase) * 0.4;
            p.g.rotation += p.spin;
            p.g.alpha = Math.max(0, p.g.alpha - 0.0015);

            if (p.g.y < -60 || p.g.alpha <= 0) {
                container.removeChild(p.g);
                const np = createParticle();
                container.addChild(np.g);
                particles[i] = np;
            }
        });
    });

    window.addEventListener('resize', () => {
        app.renderer.resize(window.innerWidth, window.innerHeight);
    });
})();

// ======== UI BUILDERS ========
function buildCategories() {
    const el = document.getElementById('categories');
    CATEGORIES.forEach(cat => {
        const btn = document.createElement('button');
        btn.className = 'cat-btn' + (cat === 'All' ? ' active' : '');
        btn.textContent = cat;
        btn.onclick = () => {
            activeCategory = cat;
            document.querySelectorAll('.cat-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            buildFoodGrid();
        };
        el.appendChild(btn);
    });
}

function buildFoodGrid() {
    const el = document.getElementById('food-grid');
    el.innerHTML = '';
    const filtered = activeCategory === 'All' ? FOODS : FOODS.filter(f => f.category === activeCategory);
    filtered.forEach(food => {
        const card = document.createElement('div');
        card.className = 'food-card' + (currentFood?.id === food.id ? ' active' : '');
        card.innerHTML = `<span class="food-emoji">${food.emoji}</span><span class="food-name">${food.name}</span>`;
        card.onclick = () => selectFood(food);
        el.appendChild(card);
    });
}

function buildModes(food) {
    const el = document.getElementById('modes-grid');
    el.innerHTML = '';
    food.modes.forEach((mode, i) => {
        const card = document.createElement('div');
        card.className = 'mode-card' + (i === 0 ? ' selected' : '');
        card.innerHTML = `
      <div class="mode-icon">${mode.icon}</div>
      <div class="mode-label">${mode.label}</div>
      <div class="mode-time">${formatTime(mode.time)}</div>
      <div class="mode-temp">${mode.temp}</div>
    `;
        card.onclick = () => {
            document.querySelectorAll('.mode-card').forEach(c => c.classList.remove('selected'));
            card.classList.add('selected');
            selectMode(mode);
        };
        el.appendChild(card);
    });
}

function buildTips(food) {
    const el = document.getElementById('tips-grid');
    el.innerHTML = '';
    food.tips.forEach(tip => {
        const card = document.createElement('div');
        card.className = 'tip-card';
        card.innerHTML = `
      <span class="tip-icon">${tip.icon}</span>
      <span class="tip-text"><strong>${tip.title}</strong>${tip.text}</span>
    `;
        el.appendChild(card);
    });
}

// ======== FOOD SELECTION ========
function selectFood(food) {
    stopTimer();
    currentFood = food;
    currentMode = food.modes[0];

    document.getElementById('empty-state').style.display = 'none';
    document.getElementById('food-detail').classList.add('visible');
    document.getElementById('done-banner').classList.remove('visible');

    document.getElementById('detail-emoji').textContent = food.emoji;
    document.getElementById('detail-name').textContent = food.name;
    document.getElementById('detail-category').textContent = food.category;

    buildModes(food);
    buildTips(food);
    buildFoodGrid();

    // Set timer to first mode
    totalTime = currentMode.time;
    timeRemaining = totalTime;
    updateTimerDisplay();
    document.getElementById('timer-sublabel').textContent = `${currentMode.label} — ${currentMode.temp}`;
    document.getElementById('timer-status').textContent = 'Ready';
    document.getElementById('timer-status').className = 'timer-status';
}

function selectMode(mode) {
    stopTimer();
    currentMode = mode;
    totalTime = mode.time;
    timeRemaining = totalTime;
    updateTimerDisplay();
    document.getElementById('done-banner').classList.remove('visible');
    document.getElementById('timer-sublabel').textContent = `${mode.label} — ${mode.temp}`;
    document.getElementById('timer-status').textContent = 'Ready';
    document.getElementById('timer-status').className = 'timer-status';
    updateProgress(0);
}

// ======== TIMER ========
function formatTime(secs) {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

function updateTimerDisplay() {
    const el = document.getElementById('timer-digits');
    el.textContent = formatTime(timeRemaining);
    const pct = totalTime > 0 ? Math.round((1 - timeRemaining / totalTime) * 100) : 0;
    document.getElementById('progress-pct').textContent = `${pct}%`;

    el.className = 'timer-digits';
    if (timeRemaining <= 30 && timeRemaining > 0 && timerRunning) el.classList.add('danger');
    else if (timeRemaining <= totalTime * 0.2 && timerRunning) el.classList.add('warning');
}

function updateProgress(pct) {
    const circumference = 427;
    const offset = circumference - (pct / 100) * circumference;
    const circle = document.getElementById('progress-circle');
    circle.style.strokeDashoffset = offset;

    if (pct >= 80) circle.style.stroke = '#F0A855';
    else if (pct >= 95) circle.style.stroke = '#E06B4A';
    else circle.style.stroke = 'var(--amber)';
}

function startTimer() {
    if (!currentMode) return;
    timerRunning = true;
    document.getElementById('btn-start').textContent = '⏸ Pause';
    document.getElementById('timer-status').textContent = 'Cooking…';
    document.getElementById('timer-status').className = 'timer-status running';

    timerInterval = setInterval(() => {
        if (timeRemaining <= 0) {
            clearInterval(timerInterval);
            timerRunning = false;
            onTimerDone();
            return;
        }
        timeRemaining--;
        const pct = Math.round((1 - timeRemaining / totalTime) * 100);
        updateTimerDisplay();
        updateProgress(pct);
        document.getElementById('footer-info').textContent = `⏱ ${formatTime(timeRemaining)} remaining`;
    }, 1000);
}

function pauseTimer() {
    clearInterval(timerInterval);
    timerRunning = false;
    document.getElementById('btn-start').textContent = '▶ Resume';
    document.getElementById('timer-status').textContent = 'Paused';
    document.getElementById('timer-status').className = 'timer-status';
}

function stopTimer() {
    clearInterval(timerInterval);
    timerRunning = false;
    document.getElementById('btn-start').textContent = '▶ Start Timer';
    document.getElementById('footer-info').textContent = '';
}

function resetTimer() {
    stopTimer();
    if (currentMode) {
        timeRemaining = totalTime;
        updateTimerDisplay();
        updateProgress(0);
        document.getElementById('timer-status').textContent = 'Ready';
        document.getElementById('timer-status').className = 'timer-status';
        document.getElementById('done-banner').classList.remove('visible');
        document.getElementById('timer-digits').className = 'timer-digits';
    }
}

function onTimerDone() {
    document.getElementById('timer-digits').textContent = '00:00';
    document.getElementById('timer-digits').className = 'timer-digits';
    document.getElementById('timer-status').textContent = 'Done!';
    document.getElementById('timer-status').className = 'timer-status done';
    updateProgress(100);
    document.getElementById('progress-circle').style.stroke = 'var(--sage)';
    document.getElementById('btn-start').textContent = '▶ Start Timer';
    document.getElementById('footer-info').textContent = '';

    // Show done banner
    if (currentFood) {
        document.getElementById('done-banner-msg').textContent = currentFood.doneMsg;
        document.getElementById('done-banner').classList.add('visible');
    }

    // Notification
    showNotification(
        '🎉',
        `${currentFood?.name || 'Food'} is ready!`,
        currentFood?.doneMsg || 'Remove from heat.'
    );
}

function showNotification(icon, title, msg) {
    const notif = document.getElementById('notification');
    document.getElementById('notif-icon').textContent = icon;
    document.getElementById('notif-title').textContent = title;
    document.getElementById('notif-msg').textContent = msg;
    notif.classList.add('show');
    setTimeout(() => notif.classList.remove('show'), 5000);
}

// ======== EVENT LISTENERS ========
document.getElementById('btn-start').onclick = () => {
    if (timerRunning) pauseTimer();
    else startTimer();
};

document.getElementById('btn-reset').onclick = resetTimer;

// ======== INIT ========
buildCategories();
buildFoodGrid();