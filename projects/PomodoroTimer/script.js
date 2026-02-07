/* =======================
   MUSIC LOGIC (FIXED)
   ======================= */

// Reuse existing audio element (no new Audio())
const bgMusic = document.getElementById("bg-music");
const musicBtn = document.getElementById("musicBtn");

let isMusicPlaying = false;

bgMusic.loop = true;
bgMusic.volume = 0.5;

function toggleMusic() {
    if (!isMusicPlaying) {
        bgMusic.play()
            .then(() => {
                musicBtn.textContent = "⏸ Pause Music";
                isMusicPlaying = true;
            })
            .catch(err => {
                console.error("Music playback failed:", err);
            });
    } else {
        bgMusic.pause();
        musicBtn.textContent = "🎵 Play Music";
        isMusicPlaying = false;
    }
}

musicBtn.addEventListener("click", toggleMusic);


/* =======================
   TIMER ELEMENTS
   ======================= */

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

const focusInput = document.getElementById('focus-time-in');
const shortInput = document.getElementById('short-break-in');
const longInput = document.getElementById('long-break-in');


/* =======================
   MODES
   ======================= */

const MODES = {
    focus: { time: 25, color: '#ff6b6b', msg: 'Time to focus!' },
    shortBreak: { time: 5, color: '#4ecdc4', msg: 'Time for a break!' },
    longBreak: { time: 15, color: '#45b7d1', msg: 'Time for a long break!' }
};

let currentMode = 'focus';
let timeLeft = MODES[currentMode].time * 60;
let timerInterval = null;
let isRunning = false;
let sessionsCompleted = 0;


/* =======================
   INIT
   ======================= */

function init() {
    updateDisplay();
    updateTheme();
}


/* =======================
   SETTINGS MODAL
   ======================= */

settingsBtn.addEventListener('click', () => {
    focusInput.value = MODES.focus.time;
    shortInput.value = MODES.shortBreak.time;
    longInput.value = MODES.longBreak.time;
    settingsModal.classList.remove('hidden');
});

closeModalBtn.addEventListener('click', () => {
    settingsModal.classList.add('hidden');
});

window.addEventListener('click', (e) => {
    if (e.target === settingsModal) {
        settingsModal.classList.add('hidden');
    }
});

saveSettingsBtn.addEventListener('click', () => {
    MODES.focus.time = parseInt(focusInput.value) || 25;
    MODES.shortBreak.time = parseInt(shortInput.value) || 5;
    MODES.longBreak.time = parseInt(longInput.value) || 15;
    settingsModal.classList.add('hidden');
    resetTimer();
});


/* =======================
   TIMER CONTROLS
   ======================= */

function startTimer() {
    if (isRunning) return;

    isRunning = true;
    toggleControls(true);

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
}

function resetTimer() {
    pauseTimer();
    timeLeft = MODES[currentMode].time * 60;
    updateDisplay();

    // Stop music on reset
    bgMusic.pause();
    bgMusic.currentTime = 0;
    isMusicPlaying = false;
    musicBtn.textContent = "🎵 Play Music";
}


/* =======================
   TIMER FLOW
   ======================= */

function handleTimerComplete() {
    pauseTimer();
    playNotificationSound();

    if (currentMode === 'focus') {
        sessionsCompleted++;
        sessionCountDisplay.textContent = sessionsCompleted;

        if (sessionsCompleted % 4 === 0) {
            switchMode('longBreak');
            alert("Great job! You've completed 4 sessions. Take a long break.");
        } else {
            switchMode('shortBreak');
            alert("Session complete! Take a short break.");
        }
    } else {
        switchMode('focus');
        alert("Break is over! Let's get back to work.");
    }
}


/* =======================
   UI HELPERS
   ======================= */

function updateDisplay() {
    const minutes = Math.floor(timeLeft / 60);
    const seconds = timeLeft % 60;
    timerDisplay.textContent =
        `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;

    document.title = `${timerDisplay.textContent} - Pomodoro`;
}

function switchMode(mode) {
    currentMode = mode;

    modeBtns.forEach(btn => {
        btn.classList.remove('active');
        if (btn.dataset.mode === mode) btn.classList.add('active');
    });

    resetTimer();
    updateTheme();
}

function updateTheme() {
    const theme = MODES[currentMode];
    document.documentElement.style.setProperty('--current-color', theme.color);
    statusMsg.textContent = theme.msg;
}

function toggleControls(running) {
    startBtn.classList.toggle('hidden', running);
    pauseBtn.classList.toggle('hidden', !running);
}


/* =======================
   NOTIFICATION SOUND
   ======================= */

function playNotificationSound() {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.type = 'sine';
    osc.frequency.setValueAtTime(523.25, ctx.currentTime);
    gain.gain.setValueAtTime(0.1, ctx.currentTime);

    osc.start();
    osc.stop(ctx.currentTime + 0.5);
}


/* =======================
   EVENT LISTENERS
   ======================= */

startBtn.addEventListener('click', startTimer);
pauseBtn.addEventListener('click', pauseTimer);
resetBtn.addEventListener('click', resetTimer);

modeBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        switchMode(btn.dataset.mode);
    });
});

init();
