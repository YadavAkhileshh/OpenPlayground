// DOM Elements
const minutesDisplay = document.getElementById('minutes');
const secondsDisplay = document.getElementById('seconds');
const timerLabel = document.getElementById('timer-label');
const startBtn = document.getElementById('startBtn');
const pauseBtn = document.getElementById('pauseBtn');
const resetBtn = document.getElementById('resetBtn');
const timeOptions = document.querySelectorAll('.time-option');
const customMinutesInput = document.getElementById('customMinutes');
const setCustomBtn = document.getElementById('setCustomBtn');
const sessionCompleteModal = document.getElementById('sessionCompleteModal');
const closeModalBtn = document.querySelector('.close-modal');
const startNewSessionBtn = document.getElementById('startNewSessionBtn');
const takeBreakBtn = document.getElementById('takeBreakBtn');
const completedSessionsEl = document.getElementById('completedSessions');
const totalFocusTimeEl = document.getElementById('totalFocusTime');
const currentStreakEl = document.getElementById('currentStreak');
const quoteTextEl = document.getElementById('quote-text');
const quoteAuthorEl = document.getElementById('quote-author');
const currentYearEl = document.getElementById('currentYear');
const sessionStartSound = document.getElementById('sessionStartSound');
const sessionEndSound = document.getElementById('sessionEndSound');

// Timer variables
let totalSeconds = 25 * 60; // Default 25 minutes
let remainingSeconds = totalSeconds;
let timerInterval = null;
let isRunning = false;
let isPaused = false;

// Stats variables
let completedSessions = 0;
let totalFocusTime = 0; // in minutes
let currentStreak = 0;
let lastSessionDate = null;

// Progress ring
const progressRing = document.querySelector('.progress-ring-circle');
const radius = progressRing.r.baseVal.value;
const circumference = 2 * Math.PI * radius;
progressRing.style.strokeDasharray = `${circumference} ${circumference}`;
progressRing.style.strokeDashoffset = circumference;

// Motivational quotes
const quotes = [
    { text: "The secret of getting ahead is getting started.", author: "Mark Twain" },
    { text: "Focus on being productive instead of busy.", author: "Tim Ferriss" },
    { text: "Concentration is the root of all the higher abilities in man.", author: "Bruce Lee" },
    { text: "The successful warrior is the average man, with laser-like focus.", author: "Bruce Lee" },
    { text: "Do not dwell in the past, do not dream of the future, concentrate the mind on the present moment.", author: "Buddha" },
    { text: "What you stay focused on will grow.", author: "Roy T. Bennett" },
    { text: "The more you concentrate, the more powerful your mind becomes.", author: "Remez Sasson" },
    { text: "Productivity is never an accident. It is always the result of a commitment to excellence, intelligent planning, and focused effort.", author: "Paul J. Meyer" },
    { text: "Concentrate all your thoughts upon the work at hand. The sun's rays do not burn until brought to a focus.", author: "Alexander Graham Bell" },
    { text: "Your focus determines your reality.", author: "George Lucas" }
];

// Initialize the app
function init() {
    loadStats();
    updateDisplay();
    updateStatsDisplay();
    setProgress(100);
    displayRandomQuote();
    setCurrentYear();
    
    // Set event listeners
    startBtn.addEventListener('click', startTimer);
    pauseBtn.addEventListener('click', pauseTimer);
    resetBtn.addEventListener('click', resetTimer);
    
    timeOptions.forEach(option => {
        option.addEventListener('click', () => setSessionTime(option.dataset.minutes));
    });
    
    setCustomBtn.addEventListener('click', setCustomTime);
    
    // Modal event listeners
    closeModalBtn.addEventListener('click', closeModal);
    startNewSessionBtn.addEventListener('click', startNewSession);
    takeBreakBtn.addEventListener('click', takeBreak);
    
    // Close modal when clicking outside
    window.addEventListener('click', (e) => {
        if (e.target === sessionCompleteModal) {
            closeModal();
        }
    });
    
    // Add keyboard shortcuts
    document.addEventListener('keydown', handleKeyPress);
}

// Timer functions
function startTimer() {
    if (isRunning) return;
    
    isRunning = true;
    isPaused = false;
    startBtn.disabled = true;
    pauseBtn.disabled = false;
    timerLabel.textContent = "Focusing...";
    
    // Play start sound
    sessionStartSound.currentTime = 0;
    sessionStartSound.play().catch(e => console.log("Audio play failed:", e));
    
    // Update button appearance
    startBtn.innerHTML = '<i class="fas fa-play"></i> Session Started';
    startBtn.classList.add('active');
    
    timerInterval = setInterval(() => {
        remainingSeconds--;
        updateDisplay();
        
        // Update progress ring
        const progressPercentage = (remainingSeconds / totalSeconds) * 100;
        setProgress(progressPercentage);
        
        // Check if timer is complete
        if (remainingSeconds <= 0) {
            completeSession();
        }
    }, 1000);
}

function pauseTimer() {
    if (!isRunning) return;
    
    isRunning = false;
    isPaused = true;
    startBtn.disabled = false;
    pauseBtn.disabled = true;
    timerLabel.textContent = "Paused";
    
    clearInterval(timerInterval);
    
    // Update button appearance
    startBtn.innerHTML = '<i class="fas fa-play"></i> Resume';
    startBtn.classList.remove('active');
}

function resetTimer() {
    clearInterval(timerInterval);
    isRunning = false;
    isPaused = false;
    remainingSeconds = totalSeconds;
    
    startBtn.disabled = false;
    pauseBtn.disabled = true;
    timerLabel.textContent = "Focus Session";
    
    // Reset button appearance
    startBtn.innerHTML = '<i class="fas fa-play"></i> Start Session';
    startBtn.classList.remove('active');
    
    updateDisplay();
    setProgress(100);
}

function setSessionTime(minutes) {
    // Remove active class from all time options
    timeOptions.forEach(option => option.classList.remove('active'));
    
    // Add active class to clicked option
    const selectedOption = document.querySelector(`[data-minutes="${minutes}"]`);
    selectedOption.classList.add('active');
    
    // Update timer
    totalSeconds = minutes * 60;
    remainingSeconds = totalSeconds;
    
    // Update custom input to match
    customMinutesInput.value = minutes;
    
    // Reset timer if it's not running
    if (!isRunning) {
        resetTimer();
    }
    
    updateDisplay();
}

function setCustomTime() {
    const minutes = parseInt(customMinutesInput.value);
    
    if (isNaN(minutes) || minutes < 1 || minutes > 120) {
        alert("Please enter a valid number between 1 and 120");
        customMinutesInput.value = 25;
        return;
    }
    
    // Remove active class from all time options
    timeOptions.forEach(option => option.classList.remove('active'));
    
    // Update timer
    totalSeconds = minutes * 60;
    remainingSeconds = totalSeconds;
    
    // Reset timer if it's not running
    if (!isRunning) {
        resetTimer();
    }
    
    updateDisplay();
}

function updateDisplay() {
    const minutes = Math.floor(remainingSeconds / 60);
    const seconds = remainingSeconds % 60;
    
    minutesDisplay.textContent = minutes.toString().padStart(2, '0');
    secondsDisplay.textContent = seconds.toString().padStart(2, '0');
}

function setProgress(percent) {
    const offset = circumference - (percent / 100) * circumference;
    progressRing.style.strokeDashoffset = offset;
    
    // Change color based on progress
    if (percent > 50) {
        progressRing.style.stroke = "#97d8c4"; // Green
    } else if (percent > 20) {
        progressRing.style.stroke = "#ff9800"; // Orange
    } else {
        progressRing.style.stroke = "#f44336"; // Red
    }
}

function completeSession() {
    clearInterval(timerInterval);
    isRunning = false;
    
    // Update stats
    updateSessionStats();
    
    // Show completion modal
    sessionCompleteModal.style.display = 'flex';
    
    // Play completion sound
    sessionEndSound.currentTime = 0;
    sessionEndSound.play().catch(e => console.log("Audio play failed:", e));
    
    // Reset button states
    startBtn.disabled = false;
    pauseBtn.disabled = true;
    startBtn.innerHTML = '<i class="fas fa-play"></i> Start Session';
    startBtn.classList.remove('active');
    timerLabel.textContent = "Session Complete!";
    
    // Visual feedback
    document.querySelector('.time-text').style.color = '#4CAF50';
    
    // Reset visual after 2 seconds
    setTimeout(() => {
        if (!isRunning) {
            document.querySelector('.time-text').style.color = '';
        }
    }, 2000);
}

// Stats functions
function updateSessionStats() {
    completedSessions++;
    
    const sessionMinutes = totalSeconds / 60;
    totalFocusTime += sessionMinutes;
    
    // Update streak
    const today = new Date().toDateString();
    if (lastSessionDate !== today) {
        // Check if last session was yesterday
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        
        if (lastSessionDate === yesterday.toDateString()) {
            currentStreak++;
        } else {
            // Reset streak if not consecutive days
            currentStreak = 1;
        }
        
        lastSessionDate = today;
    }
    
    saveStats();
    updateStatsDisplay();
}

function updateStatsDisplay() {
    completedSessionsEl.textContent = completedSessions;
    totalFocusTimeEl.textContent = Math.round(totalFocusTime);
    currentStreakEl.textContent = currentStreak;
}

function saveStats() {
    const stats = {
        completedSessions,
        totalFocusTime,
        currentStreak,
        lastSessionDate
    };
    
    localStorage.setItem('focusSessionStats', JSON.stringify(stats));
}

function loadStats() {
    const savedStats = localStorage.getItem('focusSessionStats');
    
    if (savedStats) {
        const stats = JSON.parse(savedStats);
        completedSessions = stats.completedSessions || 0;
        totalFocusTime = stats.totalFocusTime || 0;
        currentStreak = stats.currentStreak || 0;
        lastSessionDate = stats.lastSessionDate || null;
        
        // Check if last session was today
        const today = new Date().toDateString();
        if (lastSessionDate !== today) {
            // Check if last session was yesterday to maintain streak
            const yesterday = new Date();
            yesterday.setDate(yesterday.getDate() - 1);
            
            if (lastSessionDate !== yesterday.toDateString()) {
                currentStreak = 0;
            }
        }
    }
}

// Modal functions
function closeModal() {
    sessionCompleteModal.style.display = 'none';
    resetTimer();
}

function startNewSession() {
    closeModal();
    startTimer();
}

function takeBreak() {
    closeModal();
    // Set timer to 5 minutes for a break
    setSessionTime(5);
    timerLabel.textContent = "Break Time";
    startTimer();
}

// UI functions
function displayRandomQuote() {
    const randomIndex = Math.floor(Math.random() * quotes.length);
    const quote = quotes[randomIndex];
    
    quoteTextEl.textContent = `"${quote.text}"`;
    quoteAuthorEl.textContent = `- ${quote.author}`;
}

function setCurrentYear() {
    currentYearEl.textContent = new Date().getFullYear();
}

// Keyboard shortcuts
function handleKeyPress(e) {
    // Spacebar to start/pause
    if (e.code === 'Space' && e.target === document.body) {
        e.preventDefault();
        if (isRunning) {
            pauseTimer();
        } else {
            startTimer();
        }
    }
    
    // R to reset
    if (e.code === 'KeyR' && e.ctrlKey) {
        e.preventDefault();
        resetTimer();
    }
    
    // Escape to close modal
    if (e.code === 'Escape' && sessionCompleteModal.style.display === 'flex') {
        closeModal();
    }
}

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', init);