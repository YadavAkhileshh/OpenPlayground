import { UIRenderer } from './ui-renderer.js';
import Store from './store.js';

export default class FocusTimer {
    constructor(durationMinutes = 25) {
        this.defaultDuration = durationMinutes * 60;
        this.timeLeft = this.defaultDuration;
        this.isRunning = false;
        this.interval = null;
        this.mode = 'pomodoro';

        this.store = new Store('zenith_analytics');
    }

    start() {
        if (this.isRunning) return;
        this.isRunning = true;
        UIRenderer.setPlayState(true);

        this.interval = setInterval(() => {
            this.tick();
        }, 1000);
    }

    pause() {
        this.isRunning = false;
        clearInterval(this.interval);
        UIRenderer.setPlayState(false);
    }

    toggle() {
        if (this.isRunning) this.pause();
        else this.start();
    }

    reset() {
        this.pause();
        this.timeLeft = this.defaultDuration;
        this.updateUI();
    }

    setMode(mode) {
        this.mode = mode;
        switch (mode) {
            case 'pomodoro': this.defaultDuration = 25 * 60; break;
            case 'short-break': this.defaultDuration = 5 * 60; break;
            case 'long-break': this.defaultDuration = 15 * 60; break;
        }
        this.reset();
        UIRenderer.setTimerMode(mode);
    }

    tick() {
        if (this.timeLeft > 0) {
            this.timeLeft--;
            this.updateUI();

            // Log time every minute for stats (simplified approach)
            // Or better: just log completion. 
            // Let's log 'minutes focused' more granualarly if we want robust stats,
            // but for now, logging completion sessions is easier.
        } else {
            this.complete();
        }
    }

    complete() {
        this.pause();

        // Save Session
        if (this.mode === 'pomodoro') {
            this.logSession(25); // Hardcoded for now, ideal to use actual duration
        }

        const audio = new Audio('https://actions.google.com/sounds/v1/alarms/beep_short.ogg');
        audio.play().catch(e => console.log('Audio play failed', e));
        alert("Time is up!");
    }

    logSession(minutes) {
        const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
        const history = this.store.get('history', {});

        if (!history[today]) history[today] = 0;
        history[today] += minutes;

        this.store.set('history', history);

        // Trigger generic event or manually update charts if they exist
        window.dispatchEvent(new CustomEvent('zenith:session-complete'));
    }

    updateUI() {
        const minutes = Math.floor(this.timeLeft / 60);
        const seconds = this.timeLeft % 60;
        const percent = (this.timeLeft / this.defaultDuration) * 100;

        UIRenderer.updateTimer(minutes, seconds, percent);
    }
}
