import FocusTimer from './timer.js';
import MixerEngine from './mixer/mixer-engine.js'; // Updated import
import TaskManager from './task-manager.js';
import Store from './store.js';
import AuthSystem from './auth.js';

class ZenithApp {
    constructor() {
        this.auth = new AuthSystem();

        // Security Check
        if (!this.auth.requireAuth()) return;

        this.store = new Store('zenith_config');

        // Initialize Core Modules
        this.timer = new FocusTimer();
        this.audio = new MixerEngine(); // Updated Instance
        this.audio.init(); // Init the mixer
        this.tasks = new TaskManager(); // Still needed for the quick widget

        this.init();
    }

    init() {
        this.setupEventListeners();
        this.setupTheme();
        this.updateDate();

        // Initial Render
        this.timer.updateUI();
    }

    setupEventListeners() {
        // --- Timer Controls ---
        const startBtn = document.getElementById('start-timer');
        if (startBtn) {
            startBtn.addEventListener('click', () => {
                this.timer.toggle();
                if (this.timer.isRunning) {
                    this.audio.resume(); // Ensure context is unlocked
                }
            });
        }

        const resetBtn = document.getElementById('reset-timer');
        if (resetBtn) {
            resetBtn.addEventListener('click', () => {
                this.timer.reset();
            });
        }

        document.querySelectorAll('.mode-chip').forEach(chip => {
            chip.addEventListener('click', (e) => {
                this.timer.setMode(e.target.dataset.mode);
            });
        });

        // --- Mixer UI Generation (Dynamic) ---
        this.renderMixer();

        // --- Task Controls (Widget) ---
        const addTaskBtn = document.getElementById('add-task-btn');
        if (addTaskBtn) {
            addTaskBtn.addEventListener('click', () => {
                const text = prompt("What's your next focus task?");
                if (text) this.tasks.addTask(text);
            });
        }

        // --- Global Config ---
        document.getElementById('theme-toggle').addEventListener('click', () => {
            this.toggleTheme();
        });

        document.getElementById('logout-btn').addEventListener('click', () => {
            this.auth.logout();
            window.location.href = 'auth.html';
        });

        // --- Focus Mode Toggle ---
        const focusToggleBtn = document.getElementById('focus-mode-toggle');
        if (focusToggleBtn) {
            focusToggleBtn.addEventListener('click', () => {
                this.toggleFocusMode();
            });
        }
    }

    renderMixer() {
        const mixerContainer = document.querySelector('.mixer-controls');
        if (!mixerContainer) return;

        // Import configs dynamically (or use global if exposed, but we can't import in method here easily without async)
        // Accessing from audio engine instance
        const channels = this.audio.channels;

        mixerContainer.innerHTML = ''; // Clear hardcoded

        Object.entries(channels).forEach(([key, channel]) => {
            const div = document.createElement('div');
            div.className = 'sound-channel';
            div.dataset.sound = key;
            div.innerHTML = `
                <div class="channel-header">
                    <label>${channel.config.label}</label>
                    <button class="mute-btn">M</button>
                </div>
                <input type="range" min="0" max="100" value="0" class="slider">
            `;

            // Bind Events
            const slider = div.querySelector('.slider');
            const muteBtn = div.querySelector('.mute-btn');

            slider.addEventListener('input', (e) => {
                this.audio.setChannelVolume(key, parseInt(e.target.value));
            });

            muteBtn.addEventListener('click', () => {
                const isMuted = this.audio.toggleMute(key);
                muteBtn.classList.toggle('active', isMuted);
                muteBtn.style.opacity = isMuted ? '0.5' : '1';
                muteBtn.textContent = isMuted ? 'Unmute' : 'Mute';
            });

            mixerContainer.appendChild(div);
        });

        // Add Preset Selector
        const header = document.querySelector('.mixer-card .card-header');
        if (header && !header.querySelector('.preset-select')) {
            const select = document.createElement('select');
            select.className = 'preset-select';
            select.innerHTML = `<option value="">Select Preset...</option>
                                 <option value="focus-deep">Deep Focus</option>
                                 <option value="cafe-morning">Morning Cafe</option>
                                 <option value="forest-zen">Forest Zen</option>
                                 <option value="pure-silence">Clear All</option>`;

            select.style.marginLeft = 'auto';
            select.style.background = 'var(--surface-2)';
            select.style.color = 'var(--text-main)';
            select.style.border = 'none';
            select.style.padding = '4px 8px';
            select.style.borderRadius = '4px';

            select.addEventListener('change', (e) => {
                if (e.target.value) {
                    const preset = this.audio.loadPreset(e.target.value);
                    // Update UI sliders to match preset
                    if (preset || e.target.value === 'pure-silence') {
                        document.querySelectorAll('.sound-channel').forEach(el => {
                            const key = el.dataset.sound;
                            const slider = el.querySelector('.slider');
                            const vol = (preset && preset.channels[key]) ? preset.channels[key] : 0;
                            slider.value = vol;
                        });
                    }
                }
            });

            header.appendChild(select);
        }
    }

    toggleFocusMode() {
        const body = document.body;
        const btn = document.getElementById('focus-mode-toggle');
        const text = document.getElementById('focus-text');

        body.classList.toggle('focus-mode-active');
        const isActive = body.classList.contains('focus-mode-active');

        if (isActive) {
            text.textContent = 'Focus Mode On';
            btn.classList.add('active');
            if (document.documentElement.requestFullscreen) {
                document.documentElement.requestFullscreen().catch(e => console.log(e));
            }
        } else {
            text.textContent = 'Focus Mode Off';
            btn.classList.remove('active');
            if (document.exitFullscreen && document.fullscreenElement) {
                document.exitFullscreen().catch(e => console.log(e));
            }
        }
    }

    setupTheme() {
        const savedTheme = this.store.get('theme', 'dark');
        document.body.setAttribute('data-theme', savedTheme);
    }

    toggleTheme() {
        const current = document.body.getAttribute('data-theme');
        const next = current === 'dark' ? 'light' : 'dark';
        document.body.setAttribute('data-theme', next);
        this.store.set('theme', next);
    }

    updateDate() {
        const options = { weekday: 'long', month: 'long', day: 'numeric' };
        const dateStr = new Date().toLocaleDateString('en-US', options);
        document.getElementById('date-display').textContent = dateStr;

        // Dynamic Greeting
        const session = this.auth.getSession();
        const username = session ? session.username : 'User';

        const hour = new Date().getHours();
        let greeting = `Welcome back, ${username}`;
        if (hour < 12) greeting = `Good morning, ${username}`;
        else if (hour < 18) greeting = `Good afternoon, ${username}`;
        else greeting = `Good evening, ${username}`;

        const greetingEl = document.getElementById('greeting-text');
        if (greetingEl) greetingEl.textContent = greeting;
    }
}

// Start the App
window.addEventListener('DOMContentLoaded', () => {
    window.app = new ZenithApp();
});
