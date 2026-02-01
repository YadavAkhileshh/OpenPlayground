// Navigation
const navButtons = document.querySelectorAll('nav button');
const sections = document.querySelectorAll('main section');
navButtons.forEach(btn => {
    btn.addEventListener('click', () => {
        sections.forEach(sec => sec.classList.remove('active'));
        document.getElementById(btn.dataset.section).classList.add('active');
    });
});

// Dark mode
const darkModeToggle = document.getElementById('darkModeToggle');
darkModeToggle.addEventListener('click', () => {
    document.body.classList.toggle('dark');
    localStorage.setItem('calmroute-dark', document.body.classList.contains('dark'));
});
if (localStorage.getItem('calmroute-dark') === 'true') {
    document.body.classList.add('dark');
}

// Routine Builder
const routineBlocks = document.getElementById('routineBlocks');
const addBlockBtn = document.getElementById('addBlock');
let routine = JSON.parse(localStorage.getItem('calmroute-routine') || '[]');
function renderRoutine() {
    routineBlocks.innerHTML = '';
    routine.forEach((block, i) => {
        const div = document.createElement('div');
        div.className = 'routine-block';
        div.innerHTML = `<input type="time" value="${block.time}"> <input type="text" value="${block.task}" placeholder="Task"> <button data-i="${i}">🗑️</button>`;
        div.querySelector('button').onclick = () => {
            routine.splice(i, 1);
            saveRoutine();
        };
        div.querySelector('input[type="time"]').onchange = e => {
            block.time = e.target.value;
            saveRoutine();
        };
        div.querySelector('input[type="text"]').onchange = e => {
            block.task = e.target.value;
            saveRoutine();
        };
        routineBlocks.appendChild(div);
    });
}
function saveRoutine() {
    localStorage.setItem('calmroute-routine', JSON.stringify(routine));
    renderRoutine();
}
addBlockBtn.onclick = () => {
    routine.push({ time: '', task: '' });
    saveRoutine();
};
renderRoutine();

// Mood Tracker & Journal
const moodTracker = document.getElementById('moodTracker');
const journal = document.getElementById('journal');
const saveMoodBtn = document.getElementById('saveMood');
let moodData = JSON.parse(localStorage.getItem('calmroute-mood') || '[]');
function renderMood() {
    moodTracker.innerHTML = '<label>Mood: <select id="moodSelect"><option>😊</option><option>😐</option><option>😔</option></select></label>';
    if (moodData.length) {
        const last = moodData[moodData.length-1];
        document.getElementById('moodSelect').value = last.mood;
        journal.value = last.journal;
    }
}
saveMoodBtn.onclick = () => {
    const mood = document.getElementById('moodSelect').value;
    const entry = { date: new Date().toISOString().slice(0,10), mood, journal: journal.value };
    moodData.push(entry);
    localStorage.setItem('calmroute-mood', JSON.stringify(moodData));
    alert('Mood saved!');
};
renderMood();

// Breathing/Meditation Timer
const breathingTimer = document.getElementById('breathingTimer');
const startBreathingBtn = document.getElementById('startBreathing');
let breathingInterval, breathingCount = 0;
startBreathingBtn.onclick = () => {
    breathingCount = 0;
    breathingTimer.textContent = 'Breathe in...';
    clearInterval(breathingInterval);
    breathingInterval = setInterval(() => {
        breathingCount++;
        if (breathingCount % 2 === 0) {
            breathingTimer.textContent = 'Breathe in...';
        } else {
            breathingTimer.textContent = 'Breathe out...';
        }
        if (breathingCount > 7) {
            clearInterval(breathingInterval);
            breathingTimer.textContent = 'Done!';
        }
    }, 4000);
};

// Analytics, Streaks, Badges
const analyticsData = document.getElementById('analyticsData');
const streaksBadges = document.getElementById('streaksBadges');
function renderAnalytics() {
    // Simple analytics: mood count per week
    const week = {};
    moodData.forEach(entry => {
        week[entry.date] = entry.mood;
    });
    analyticsData.innerHTML = '<h4>Mood This Week</h4>' + Object.entries(week).map(([d,m]) => `${d}: ${m}`).join('<br>');
    // Streaks
    let streak = 0, maxStreak = 0, prev = null;
    Object.keys(week).sort().forEach(date => {
        if (prev && (new Date(date) - new Date(prev) === 86400000)) {
            streak++;
        } else {
            streak = 1;
        }
        if (streak > maxStreak) maxStreak = streak;
        prev = date;
    });
    streaksBadges.innerHTML = `<h4>Streak: ${maxStreak} days</h4>`;
}
renderAnalytics();

// Offline support (basic)
if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('service-worker.js');
}
