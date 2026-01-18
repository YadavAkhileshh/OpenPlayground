const timerDisplay = document.getElementById('time');
const startBtn = document.getElementById('start-btn');
const pauseBtn = document.getElementById('pause-btn');
const resetBtn = document.getElementById('reset-btn');
const statusMsg = document.getElementById('status-msg');
const modeBtns = document.querySelectorAll('.mode-btn');
const sessionCountDisplay = document.getElementById('session-count');

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

function init() {
    updateDisplay();
    updateTheme();
}

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
}

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

function updateDisplay() {
    const minutes = Math.floor(timeLeft / 60);
    const seconds = timeLeft % 60;
    timerDisplay.textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    
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
    osc.frequency.setValueAtTime(523.25, ctx.currentTime);
    gain.gain.setValueAtTime(0.1, ctx.currentTime);
    
    osc.start();
    osc.stop(ctx.currentTime + 0.5);
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