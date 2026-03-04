// DOM Elements
const taskInput = document.getElementById('task-input');
const startBtn = document.getElementById('start-btn');
const sessionTimeDisplay = document.getElementById('session-time');
const switchCountDisplay = document.getElementById('switch-count');
const focusTaxDisplay = document.getElementById('focus-tax');
const activeTaskDisplay = document.getElementById('active-task-display');
const currentTaskName = document.getElementById('current-task-name');
const logList = document.getElementById('log-list');

const riskForm = document.getElementById('risk-form');
const riskResult = document.getElementById('risk-result');
const riskCircle = document.getElementById('risk-circle');
const riskScoreDisplay = document.getElementById('risk-score');
const riskLevelDisplay = document.getElementById('risk-level');
const riskSuggestionDisplay = document.getElementById('risk-suggestion');

/**
 * Context Switch Cost Tracker
 * Tracks active session time and focus switches (tab visibility changes).
 * Uses a "Focus Tax" multiplier to estimate recovery time.
 */
class ContextTracker {
    constructor() {
        this.isActive = false;
        this.startTime = null;
        this.switches = 0;
        this.focusTaxMinutes = 0;
        this.timerInterval = null;
        this.recoveryTimePerSwitch = 15; // Minutes lost per interruption (research based avg)

        // Bind and add listener once
        this.handleVisibilityChange = this.handleVisibilityChange.bind(this);
        document.addEventListener('visibilitychange', this.handleVisibilityChange);
    }

    start(taskName) {
        if (!taskName) return alert('Please enter a task name!');

        this.isActive = true;
        this.startTime = Date.now();
        this.switches = 0;
        this.focusTaxMinutes = 0;

        // Reset UI
        currentTaskName.textContent = taskName;
        activeTaskDisplay.classList.remove('hidden');
        logList.innerHTML = '';
        this.updateStats();

        // Start Timer
        if (this.timerInterval) clearInterval(this.timerInterval);
        this.timerInterval = setInterval(() => this.updateTimer(), 1000);
    }

    handleVisibilityChange() {
        if (!this.isActive) return;

        if (document.hidden) {
            // User switched away
            this.switches++;
            this.focusTaxMinutes += this.recoveryTimePerSwitch; // 15 min penalty

            this.logSwitch();
            this.updateStats();
        }
    }

    updateTimer() {
        const elapsed = Date.now() - this.startTime;
        sessionTimeDisplay.textContent = this.formatTime(elapsed);
    }

    updateStats() {
        switchCountDisplay.textContent = this.switches;
        focusTaxDisplay.textContent = `${this.focusTaxMinutes}m`;
    }

    logSwitch() {
        const li = document.createElement('li');
        li.className = 'log-item';
        li.innerHTML = `
            <span><i class="ri-eye-off-line"></i> Focus lost</span>
            <span class="text-muted">${new Date().toLocaleTimeString()}</span>
        `;
        logList.prepend(li);
    }

    formatTime(ms) {
        const totalSeconds = Math.floor(ms / 1000);
        const hours = Math.floor(totalSeconds / 3600);
        const minutes = Math.floor((totalSeconds % 3600) / 60);
        const seconds = totalSeconds % 60;

        const pad = (num) => num.toString().padStart(2, '0');
        return `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;
    }
}

/**
 * Deadline Risk Estimator
 * Calculates a risk score based on task size, history of delays, and available buffer.
 */
class RiskEstimator {
    calculate(taskSize, pastDelays, buffer) {
        // Simple Risk Model
        // 1. Base Ratio: Task Size / (Task Size + Buffer) -> Higher means less wiggle room
        // 2. Delay Factor: Past Delays / Task Size -> Higher means you historically underestimate

        // Prevent division by zero
        if (taskSize <= 0) return 0;

        const effectiveWork = taskSize + pastDelays; // History adjusted work
        const totalTimeAvailable = taskSize + buffer;

        let riskScore = (effectiveWork / totalTimeAvailable) * 100;

        // Cap at 100%
        return Math.min(Math.round(riskScore), 100);
    }

    getRiskLevel(score) {
        if (score < 50) return { level: 'Low Risk', color: '#10b981', suggestion: 'You have plenty of buffer. Keep steady.' };
        if (score < 80) return { level: 'Medium Risk', color: '#f59e0b', suggestion: 'Tight schedule. Avoid any new scope creep.' };
        return { level: 'High Risk', color: '#ef4444', suggestion: 'Danger zone! Consider cutting scope or moving the deadline.' };
    }

    updateUI(taskSize, pastDelays, buffer) {
        const score = this.calculate(taskSize, pastDelays, buffer);
        const { level, color, suggestion } = this.getRiskLevel(score);

        riskResult.classList.remove('hidden');
        riskScoreDisplay.textContent = `${score}%`;
        riskLevelDisplay.textContent = level;
        riskLevelDisplay.style.color = color;
        riskSuggestionDisplay.textContent = suggestion;

        // Update Circle Gradient
        riskCircle.style.background = `conic-gradient(${color} ${score}%, transparent ${score}%)`;
    }
}

// Initialize Classes
const tracker = new ContextTracker();
const estimator = new RiskEstimator();

// Event Listeners
startBtn.addEventListener('click', () => {
    tracker.start(taskInput.value);
});

riskForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const taskSize = parseFloat(document.getElementById('task-size').value) || 0;
    const pastDelays = parseFloat(document.getElementById('past-delays').value) || 0;
    const buffer = parseFloat(document.getElementById('buffer-time').value) || 0;

    estimator.updateUI(taskSize, pastDelays, buffer);
});
