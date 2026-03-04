const timerDisplay = document.getElementById('time');
const startBtn = document.getElementById('start-btn');
const pauseBtn = document.getElementById('pause-btn');
const resetBtn = document.getElementById('reset-btn');
const statusMsg = document.getElementById('status-msg');
const modeBtns = document.querySelectorAll('.mode-btn');
const sessionCountDisplay = document.getElementById('session-count');
const settingsBtn = document.getElementById('settings-btn');
const settingsModal = document.getElementById('settings-modal');
const closeModalBtn = document.getElementById('close-modal-btn');
const saveSettingsBtn = document.getElementById('save-settings-btn');
const historyBtn = document.getElementById('history-btn');
const historyModal = document.getElementById('history-modal');
const closeHistoryBtn = document.getElementById('close-history-btn');
const clearHistoryBtn = document.getElementById('clear-history-btn');
const historyList = document.getElementById('history-list');
const noHistory = document.getElementById('no-history');
const soundToggle = document.getElementById('sound-toggle');
const focusInput = document.getElementById('focus-time-in');
const shortInput = document.getElementById('short-break-in');
const longInput = document.getElementById('long-break-in');
const timerCard = document.getElementById('timer-card');

const MODES = {
    focus: { time: 25, color: '#667eea', gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', msg: 'Time to focus!' },
    shortBreak: { time: 5, color: '#4ecdc4', gradient: 'linear-gradient(135deg, #4ecdc4 0%, #44a08d 100%)', msg: 'Time for a break!' },
    longBreak: { time: 15, color: '#45b7d1', gradient: 'linear-gradient(135deg, #45b7d1 0%, #3a9bb1 100%)', msg: 'Time for a long break!' }
};

let currentMode = 'focus';
let timeLeft = MODES[currentMode].time * 60;
let totalTime = timeLeft;
let timerInterval = null;
let isRunning = false;
let sessionsCompleted = 0;
let isSoundEnabled = true;
let sessionHistory = JSON.parse(localStorage.getItem('focusTimerProHistory')) || [];

function init() {
    updateDisplay();
    updateTheme();
    loadSettings();
    updateHistoryDisplay();
}

function loadSettings() {
    const savedSettings = JSON.parse(localStorage.getItem('focusTimerProSettings'));
    if (savedSettings) {
        MODES.focus.time = savedSettings.focusTime || 25;
        MODES.shortBreak.time = savedSettings.shortBreakTime || 5;
        MODES.longBreak.time = savedSettings.longBreakTime || 15;
        isSoundEnabled = savedSettings.soundEnabled !== false;
        soundToggle.checked = isSoundEnabled;
    }
    timeLeft = MODES[currentMode].time * 60;
    totalTime = timeLeft;
    updateDisplay();
}

function saveSettings() {
    const settings = {
        focusTime: MODES.focus.time,
        shortBreakTime: MODES.shortBreak.time,
        longBreakTime: MODES.longBreak.time,
        soundEnabled: isSoundEnabled
    };
    localStorage.setItem('focusTimerProSettings', JSON.stringify(settings));
}

settingsBtn.addEventListener('click', () => {
    focusInput.value = MODES.focus.time;
    shortInput.value = MODES.shortBreak.time;
    longInput.value = MODES.longBreak.time;
    settingsModal.classList.remove('hidden');
});

closeModalBtn.addEventListener('click', () => {
    settingsModal.classList.add('hidden');
});

historyBtn.addEventListener('click', () => {
    updateHistoryDisplay();
    historyModal.classList.remove('hidden');
});

closeHistoryBtn.addEventListener('click', () => {
    historyModal.classList.add('hidden');
});

clearHistoryBtn.addEventListener('click', () => {
    if (confirm('Are you sure you want to clear all session history?')) {
        sessionHistory = [];
        localStorage.setItem('focusTimerProHistory', JSON.stringify(sessionHistory));
        updateHistoryDisplay();
    }
});

window.addEventListener('click', (e) => {
    if (e.target === settingsModal) {
        settingsModal.classList.add('hidden');
    }
    if (e.target === historyModal) {
        historyModal.classList.add('hidden');
    }
});

saveSettingsBtn.addEventListener('click', () => {
    MODES.focus.time = parseInt(focusInput.value) || 25;
    MODES.shortBreak.time = parseInt(shortInput.value) || 5;
    MODES.longBreak.time = parseInt(longInput.value) || 15;
    isSoundEnabled = soundToggle.checked;

    saveSettings();
    totalTime = MODES[currentMode].time * 60;
    settingsModal.classList.add('hidden');
    resetTimer();
});

function startTimer() {
    if (isRunning) return;

    isRunning = true;
    toggleControls(true);
    timerCard.classList.add('timer-running');

    timerInterval = setInterval(() => {
        timeLeft--;
        updateDisplay();

        if (timeLeft <= 0) {
            handleTimerComplete();
        }
    }, 1000);
}

function pauseTimer() {
    isRunning = false;
    clearInterval(timerInterval);
    toggleControls(false);
    timerCard.classList.remove('timer-running');
}

function resetTimer() {
    pauseTimer();
    timeLeft = totalTime;
    updateDisplay();
}

function handleTimerComplete() {
    pauseTimer();
    timerCard.classList.remove('timer-running');

    if (isSoundEnabled) {
        playNotificationSound();
    }

    const now = new Date();
    const sessionData = {
        mode: currentMode,
        duration: MODES[currentMode].time,
        completedAt: now.toISOString(),
        date: now.toLocaleDateString(),
        time: now.toLocaleTimeString()
    };

    if (currentMode === 'focus') {
        sessionsCompleted++;
        sessionCountDisplay.textContent = sessionsCompleted;
        sessionHistory.push(sessionData);
        localStorage.setItem('focusTimerProHistory', JSON.stringify(sessionHistory));

        if (sessionsCompleted % 4 === 0) {
            switchMode('longBreak');
            alert("Great job! You've completed 4 focus sessions. Take a long break.");
        } else {
            switchMode('shortBreak');
            alert("Focus session complete! Take a short break.");
        }
    } else {
        sessionHistory.push(sessionData);
        localStorage.setItem('focusTimerProHistory', JSON.stringify(sessionHistory));
        switchMode('focus');
        alert("Break is over! Let's get back to work.");
    }
}

function updateDisplay() {
    const minutes = Math.floor(timeLeft / 60);
    const seconds = timeLeft % 60;
    timerDisplay.textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;

    document.title = `${timerDisplay.textContent} - Focus Timer Pro`;

    // Update progress ring
    updateProgressRing();
}

function updateProgressRing() {
    const progress = (totalTime - timeLeft) / totalTime;
    const circumference = 2 * Math.PI * 130; // radius = 130
    const strokeDasharray = `${progress * circumference} ${circumference}`;

    const progressRing = document.querySelector('.progress-ring-circle');
    if (progressRing) {
        progressRing.style.strokeDasharray = strokeDasharray;
    }
}

function switchMode(mode) {
    currentMode = mode;

    modeBtns.forEach(btn => {
        btn.classList.remove('active');
        if (btn.dataset.mode === mode) btn.classList.add('active');
    });

    totalTime = MODES[currentMode].time * 60;
    resetTimer();
    updateTheme();
}

function updateTheme() {
    const theme = MODES[currentMode];
    document.documentElement.style.setProperty('--current-gradient', theme.gradient);
    statusMsg.textContent = theme.msg;

    // Update body background
    document.body.style.background = theme.gradient;

    // Update progress ring gradient
    updateProgressRingGradient(theme);
}

function updateProgressRingGradient(theme) {
    const gradient = document.getElementById('gradient');
    if (gradient) {
        const stops = gradient.querySelectorAll('stop');
        if (theme.color === '#667eea') {
            stops[0].setAttribute('stop-color', 'rgba(255,255,255,0.9)');
            stops[1].setAttribute('stop-color', 'rgba(255,255,255,0.7)');
        } else if (theme.color === '#4ecdc4') {
            stops[0].setAttribute('stop-color', 'rgba(78, 205, 196, 0.8)');
            stops[1].setAttribute('stop-color', 'rgba(68, 160, 141, 0.8)');
        } else {
            stops[0].setAttribute('stop-color', 'rgba(69, 183, 209, 0.8)');
            stops[1].setAttribute('stop-color', 'rgba(58, 155, 177, 0.8)');
        }
    }
}

function toggleControls(running) {
    if (running) {
        startBtn.classList.add('hidden');
        pauseBtn.classList.remove('hidden');
    } else {
        startBtn.classList.remove('hidden');
        pauseBtn.classList.add('hidden');
    }
}

function playNotificationSound() {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.type = 'sine';
    osc.frequency.setValueAtTime(523.25, ctx.currentTime); // C5
    gain.gain.setValueAtTime(0.1, ctx.currentTime);

    osc.start();
    osc.stop(ctx.currentTime + 0.5);

    // Add a second tone for better alert
    setTimeout(() => {
        const osc2 = ctx.createOscillator();
        const gain2 = ctx.createGain();
        osc2.connect(gain2);
        gain2.connect(ctx.destination);
        osc2.type = 'sine';
        osc2.frequency.setValueAtTime(659.25, ctx.currentTime); // E5
        gain2.gain.setValueAtTime(0.1, ctx.currentTime);
        osc2.start();
        osc2.stop(ctx.currentTime + 0.5);
    }, 100);
}

function updateHistoryDisplay() {
    historyList.innerHTML = '';

    if (sessionHistory.length === 0) {
        historyList.appendChild(noHistory);
        return;
    }

    sessionHistory.slice(-20).reverse().forEach(session => { // Show last 20 sessions
        const item = document.createElement('div');
        item.className = 'history-item';
        item.innerHTML = `
            <p><strong>${session.mode === 'focus' ? '🎯 Focus' : session.mode === 'shortBreak' ? '☕ Short Break' : '🛏️ Long Break'}</strong></p>
            <p>Duration: ${session.duration} minutes</p>
            <p>${session.date} at ${session.time}</p>
        `;
        historyList.appendChild(item);
    });
}

// Event Listeners
startBtn.addEventListener('click', startTimer);
pauseBtn.addEventListener('click', pauseTimer);
resetBtn.addEventListener('click', resetTimer);

modeBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        const mode = btn.dataset.mode;
        switchMode(mode);
    });
});

init();
