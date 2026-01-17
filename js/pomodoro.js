class PomodoroTimer {
    constructor() {
        this.timeLeft = 25 * 60;
        this.timerId = null;
        this.isRunning = false;
        this.currentMode = 'focus';
        this.container = document.getElementById('pomodoro-container');
        this.fab = document.getElementById('pomodoro-fab');
        this.closeBtn = document.getElementById('pomodoro-close');
        this.timerText = document.getElementById('timer-text');
        this.toggleBtn = document.getElementById('timer-toggle');
        this.resetBtn = document.getElementById('timer-reset');
        this.modeBtns = document.querySelectorAll('.mode-btn');

        this.init();
    }

    init() {
        this.fab.addEventListener('click', () => this.toggleVisibility());
        this.closeBtn.addEventListener('click', () => this.toggleVisibility());
        
        this.toggleBtn.addEventListener('click', () => this.toggleTimer());
        this.resetBtn.addEventListener('click', () => this.resetTimer());

        this.modeBtns.forEach(btn => {
            btn.addEventListener('click', (e) => this.switchMode(e.target));
        });

        if ("Notification" in window) {
            Notification.requestPermission();
        }
    }

    toggleVisibility() {
        this.container.classList.toggle('hidden');
    }

    toggleTimer() {
        if (this.isRunning) {
            this.pauseTimer();
        } else {
            this.startTimer();
        }
    }

    startTimer() {
        if (this.isRunning) return;
        
        this.isRunning = true;
        this.toggleBtn.textContent = 'Pause';
        
        this.timerId = setInterval(() => {
            if (this.timeLeft > 0) {
                this.timeLeft--;
                this.updateDisplay();
            } else {
                this.completeSession();
            }
        }, 1000);
    }

    pauseTimer() {
        this.isRunning = false;
        this.toggleBtn.textContent = 'Start';
        clearInterval(this.timerId);
    }

    resetTimer() {
        this.pauseTimer();
        const activeBtn = document.querySelector('.mode-btn.active');
        const minutes = parseInt(activeBtn.dataset.time);
        this.timeLeft = minutes * 60;
        this.updateDisplay();
    }

    switchMode(clickedBtn) {
        this.modeBtns.forEach(btn => btn.classList.remove('active'));
        clickedBtn.classList.add('active');
        
        const mode = clickedBtn.dataset.mode;
        this.container.setAttribute('data-mode', mode);
        
        const minutes = parseInt(clickedBtn.dataset.time);
        this.timeLeft = minutes * 60;
        this.updateDisplay();
        this.pauseTimer();
    }

    updateDisplay() {
        const minutes = Math.floor(this.timeLeft / 60);
        const seconds = this.timeLeft % 60;
        const timeString = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        
        this.timerText.textContent = timeString;
        document.title = `${timeString} - OpenPlayground`;
    }

    completeSession() {
        this.pauseTimer();
        this.alertUser();
        const activeBtn = document.querySelector('.mode-btn.active');
        this.timeLeft = parseInt(activeBtn.dataset.time) * 60;
        this.updateDisplay();
    }

    alertUser() {
        const audio = new Audio('https://actions.google.com/sounds/v1/alarms/beep_short.ogg');
        audio.play().catch(e => console.log('Audio play failed', e));

        if (Notification.permission === "granted") {
            new Notification("Time's up!", {
                body: "Session completed. Take a break!",
                icon: "/favicon.ico"
            });
        } else {
            alert("Time's up!");
        }
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new PomodoroTimer();
});