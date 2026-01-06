let timer;
let isRunning = false;
let timeLeft = 25 * 60;
let soundEnabled = true;
let notificationsEnabled = true;

// DOM Elements
const minutesDisplay = document.getElementById('minutes');
const secondsDisplay = document.getElementById('seconds');
const startBtn = document.getElementById('startBtn');
const pauseBtn = document.getElementById('pauseBtn');
const resetBtn = document.getElementById('resetBtn');
const soundToggle = document.getElementById('soundToggle');
const notificationToggle = document.getElementById('notificationToggle');
const soundIcon = document.getElementById('soundIcon');
const notificationIcon = document.getElementById('notificationIcon');
const modeBtns = document.querySelectorAll('.mode-btn');
const progressCircle = document.querySelector('.progress-ring__circle');
const body = document.body;

const circumference = 2 * Math.PI * 110; // 2πr where r=110
progressCircle.style.strokeDasharray = `${circumference} ${circumference}`;
progressCircle.style.strokeDashoffset = circumference;

const modes = { 
    'workBtn': { duration: 25, color: 'work-mode' }, 
    'shortBreakBtn': { duration: 5, color: 'short-break-mode' }, 
    'longBreakBtn': { duration: 15, color: 'long-break-mode' } 
};

// Initialize
updateDisplay();
updateSettingsButtons();

// Request notification permission
if ("Notification" in window && Notification.permission === "default") {
    Notification.requestPermission();
}

function updateDisplay() {
    let m = Math.floor(timeLeft / 60);
    let s = timeLeft % 60;
    minutesDisplay.textContent = m < 10 ? '0' + m : m;
    secondsDisplay.textContent = s < 10 ? '0' + s : s;
    document.title = `${minutesDisplay.textContent}:${secondsDisplay.textContent} - Focus Timer`;
    
    // Update progress circle
    const activeMode = document.querySelector('.mode-btn.active').id;
    const totalTime = modes[activeMode].duration * 60;
    const progress = timeLeft / totalTime;
    const offset = circumference - (progress * circumference);
    progressCircle.style.strokeDashoffset = offset;
}

function startTimer() {
    if (isRunning) return;
    isRunning = true;
    startBtn.classList.add('hidden');
    pauseBtn.classList.remove('hidden');
    timer = setInterval(() => {
        if (timeLeft > 0) { 
            timeLeft--; 
            updateDisplay(); 
        }
        else { 
            clearInterval(timer); 
            isRunning = false; 
            handleTimerComplete();
            resetTimer(); 
        }
    }, 1000);
}

function pauseTimer() {
    clearInterval(timer);
    isRunning = false;
    startBtn.classList.remove('hidden');
    pauseBtn.classList.add('hidden');
}

function resetTimer() {
    pauseTimer();
    const activeMode = document.querySelector('.mode-btn.active').id;
    timeLeft = modes[activeMode].duration * 60;
    updateDisplay();
}

function handleTimerComplete() {
    const activeMode = document.querySelector('.mode-btn.active').id;
    let message = '';
    
    switch(activeMode) {
        case 'workBtn':
            message = "Work session complete! Time for a break.";
            break;
        case 'shortBreakBtn':
            message = "Short break over! Ready to get back to work?";
            break;
        case 'longBreakBtn':
            message = "Long break complete! Let's focus again.";
            break;
    }
    
    // Show alert
    alert(message);
    
    // Play sound if enabled
    if (soundEnabled) {
        playSound();
    }
    
    // Show notification if enabled
    if (notificationsEnabled && "Notification" in window && Notification.permission === "granted") {
        new Notification("Pomodoro Timer", {
            body: message,
            icon: "data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' width='24' height='24'><path fill='%234f46e5' d='M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm.5-13H11v6l5.25 3.15.75-1.23-4.5-2.67z'/></svg>"
        });
    }
}

function playSound() {
    // Create a simple beep sound using Web Audio API
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    oscillator.frequency.value = 800;
    oscillator.type = 'sine';
    
    gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
    
    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.5);
}

function updateSettingsButtons() {
    soundIcon.textContent = soundEnabled ? '🔊' : '🔇';
    soundToggle.classList.toggle('active', soundEnabled);
    
    notificationIcon.textContent = notificationsEnabled ? '🔔' : '🔕';
    notificationToggle.classList.toggle('active', notificationsEnabled);
}

// Event Listeners
modeBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
        modeBtns.forEach(b => b.classList.remove('active'));
        e.target.classList.add('active');
        
        // Update body class for theme
        body.className = '';
        body.classList.add(modes[e.target.id].color);
        
        // Update progress circle color
        progressCircle.style.stroke = getComputedStyle(document.documentElement)
            .getPropertyValue(`--${modes[e.target.id].color.replace('-', '-')}`);
        
        timeLeft = modes[e.target.id].duration * 60;
        resetTimer();
    });
});

startBtn.addEventListener('click', startTimer);
pauseBtn.addEventListener('click', pauseTimer);
resetBtn.addEventListener('click', resetTimer);

soundToggle.addEventListener('click', () => {
    soundEnabled = !soundEnabled;
    updateSettingsButtons();
});

notificationToggle.addEventListener('click', () => {
    if (!notificationsEnabled && "Notification" in window && Notification.permission === "default") {
        Notification.requestPermission().then(permission => {
            if (permission === "granted") {
                notificationsEnabled = true;
            }
        });
    } else {
        notificationsEnabled = !notificationsEnabled;
    }
    updateSettingsButtons();
});

// Keyboard navigation
document.addEventListener('keydown', (e) => {
    if (e.code === 'Space') {
        e.preventDefault();
        if (isRunning) {
            pauseTimer();
        } else {
            startTimer();
        }
    } else if (e.code === 'KeyR') {
        resetTimer();
    } else if (e.code === 'Digit1') {
        document.getElementById('workBtn').click();
    } else if (e.code === 'Digit2') {
        document.getElementById('shortBreakBtn').click();
    } else if (e.code === 'Digit3') {
        document.getElementById('longBreakBtn').click();
    }
});