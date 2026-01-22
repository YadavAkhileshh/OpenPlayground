/**
 * ============================================
 * REACTION TIME ARENA - GAME ENGINE
 * ============================================
 * A comprehensive reaction time testing game with multiple modes,
 * statistics tracking, achievements, and sound effects.
 * 
 * Features:
 * - 4 Game Modes: Classic, Visual Hunt, Sound Reaction, Pattern Memory
 * - Statistics Dashboard with localStorage persistence
 * - Achievement System with unlock notifications
 * - Particle effects and visual feedback
 * - Responsive design support
 */

// ============================================
// CONFIGURATION & CONSTANTS
// ============================================
const CONFIG = {
    // Difficulty settings (delay ranges in ms)
    difficulty: {
        easy: { minDelay: 2000, maxDelay: 4000, distractors: 8, patternSpeed: 800 },
        medium: { minDelay: 1500, maxDelay: 3500, distractors: 15, patternSpeed: 600 },
        hard: { minDelay: 1000, maxDelay: 2500, distractors: 20, patternSpeed: 400 },
        extreme: { minDelay: 500, maxDelay: 1500, distractors: 24, patternSpeed: 300 }
    },

    // Game settings
    classicAttempts: 5,
    visualRounds: 10,
    soundRounds: 5,

    // Percentile thresholds (reaction times in ms)
    percentiles: [
        { time: 150, label: 'Top 1%', percentile: 99 },
        { time: 180, label: 'Top 5%', percentile: 95 },
        { time: 200, label: 'Top 10%', percentile: 90 },
        { time: 230, label: 'Top 25%', percentile: 75 },
        { time: 270, label: 'Average', percentile: 50 },
        { time: 320, label: 'Below Average', percentile: 30 },
        { time: 400, label: 'Slow', percentile: 10 }
    ],

    // Distractor colors for visual mode
    distractorColors: [
        '#ef4444', '#f97316', '#eab308', '#a855f7',
        '#ec4899', '#6366f1', '#14b8a6', '#64748b'
    ],

    // Sound frequencies (Hz)
    beepFrequency: 800,
    beepDuration: 150
};

// Achievement definitions
const ACHIEVEMENTS = [
    { id: 'first_game', name: 'First Steps', desc: 'Complete your first game', icon: 'ri-footprint-line' },
    { id: 'speed_demon', name: 'Speed Demon', desc: 'Get under 200ms reaction', icon: 'ri-flashlight-line' },
    { id: 'lightning', name: 'Lightning Fast', desc: 'Get under 150ms reaction', icon: 'ri-thunder-storms-line' },
    { id: 'consistency', name: 'Consistency King', desc: 'Complete 5 games in a row under 250ms avg', icon: 'ri-focus-2-line' },
    { id: 'practice_10', name: 'Dedicated Player', desc: 'Complete 10 games', icon: 'ri-time-line' },
    { id: 'practice_50', name: 'Practice Master', desc: 'Complete 50 games', icon: 'ri-medal-line' },
    { id: 'visual_hunter', name: 'Visual Hunter', desc: 'Complete Visual Hunt mode', icon: 'ri-focus-3-line' },
    { id: 'sound_master', name: 'Sound Master', desc: 'Complete Sound mode under 200ms avg', icon: 'ri-headphone-fill' },
    { id: 'pattern_5', name: 'Memory Starter', desc: 'Reach level 5 in Pattern mode', icon: 'ri-shape-line' },
    { id: 'pattern_10', name: 'Memory Expert', desc: 'Reach level 10 in Pattern mode', icon: 'ri-brain-line' },
    { id: 'all_modes', name: 'Jack of All Trades', desc: 'Play all 4 game modes', icon: 'ri-gamepad-line' },
    { id: 'extreme_mode', name: 'Extreme Player', desc: 'Complete a game on Extreme difficulty', icon: 'ri-fire-line' }
];

// ============================================
// STATE MANAGEMENT
// ============================================
const GameState = {
    currentMode: 'classic',
    currentDifficulty: 'medium',
    soundEnabled: true,

    // Classic mode state
    classic: {
        isPlaying: false,
        isWaiting: false,
        startTime: null,
        timeoutId: null,
        attempts: 0,
        times: [],
        bestTime: null
    },

    // Visual mode state
    visual: {
        isPlaying: false,
        round: 0,
        startTime: null,
        times: [],
        targetIndex: null
    },

    // Sound mode state
    sound: {
        isPlaying: false,
        isListening: false,
        round: 0,
        startTime: null,
        times: [],
        timeoutId: null,
        audioContext: null
    },

    // Pattern mode state
    pattern: {
        isPlaying: false,
        isShowingPattern: false,
        level: 1,
        score: 0,
        pattern: [],
        playerPattern: [],
        currentShowIndex: 0
    }
};

// ============================================
// STATISTICS MANAGER
// ============================================
class StatisticsManager {
    constructor() {
        this.storageKey = 'reactionTimeArena_stats';
        this.data = this.load();
    }

    load() {
        try {
            const saved = localStorage.getItem(this.storageKey);
            if (saved) {
                return JSON.parse(saved);
            }
        } catch (e) {
            console.warn('Failed to load stats:', e);
        }

        return {
            classic: { times: [], games: 0, best: null },
            visual: { times: [], games: 0, best: null },
            sound: { times: [], games: 0, best: null },
            pattern: { bestLevel: 0, highScore: 0, games: 0 },
            leaderboard: [],
            achievements: [],
            totalGames: 0,
            modesPlayed: []
        };
    }

    save() {
        try {
            localStorage.setItem(this.storageKey, JSON.stringify(this.data));
        } catch (e) {
            console.warn('Failed to save stats:', e);
        }
    }

    addTime(mode, time) {
        if (mode === 'pattern') return;

        if (!this.data[mode]) {
            this.data[mode] = { times: [], games: 0, best: null };
        }

        this.data[mode].times.push(time);

        // Keep only last 100 times
        if (this.data[mode].times.length > 100) {
            this.data[mode].times = this.data[mode].times.slice(-100);
        }

        if (!this.data[mode].best || time < this.data[mode].best) {
            this.data[mode].best = time;
        }

        this.save();
    }

    completeGame(mode, avgTime) {
        this.data[mode].games++;
        this.data.totalGames++;

        // Track modes played
        if (!this.data.modesPlayed.includes(mode)) {
            this.data.modesPlayed.push(mode);
        }

        // Add to leaderboard
        if (mode !== 'pattern') {
            this.addToLeaderboard(avgTime, mode);
        }

        this.save();
    }

    addToLeaderboard(time, mode) {
        const entry = {
            time: Math.round(time),
            mode: mode,
            date: new Date().toISOString()
        };

        this.data.leaderboard.push(entry);
        this.data.leaderboard.sort((a, b) => a.time - b.time);
        this.data.leaderboard = this.data.leaderboard.slice(0, 10);
        this.save();
    }

    updatePatternStats(level, score) {
        if (level > this.data.pattern.bestLevel) {
            this.data.pattern.bestLevel = level;
        }
        if (score > this.data.pattern.highScore) {
            this.data.pattern.highScore = score;
        }
        this.data.pattern.games++;
        this.data.totalGames++;

        if (!this.data.modesPlayed.includes('pattern')) {
            this.data.modesPlayed.push('pattern');
        }

        this.save();
    }

    getAverage(mode) {
        if (mode === 'pattern' || !this.data[mode]?.times.length) {
            return null;
        }
        const sum = this.data[mode].times.reduce((a, b) => a + b, 0);
        return Math.round(sum / this.data[mode].times.length);
    }

    getGlobalBest() {
        let best = null;
        ['classic', 'visual', 'sound'].forEach(mode => {
            if (this.data[mode]?.best && (!best || this.data[mode].best < best)) {
                best = this.data[mode].best;
            }
        });
        return best;
    }

    getGlobalAverage() {
        let allTimes = [];
        ['classic', 'visual', 'sound'].forEach(mode => {
            if (this.data[mode]?.times) {
                allTimes = allTimes.concat(this.data[mode].times);
            }
        });
        if (!allTimes.length) return null;
        return Math.round(allTimes.reduce((a, b) => a + b, 0) / allTimes.length);
    }

    getPercentile() {
        const avg = this.getGlobalAverage();
        if (!avg) return null;

        for (const p of CONFIG.percentiles) {
            if (avg <= p.time) {
                return { label: p.label, percentile: p.percentile };
            }
        }
        return { label: 'Keep Practicing', percentile: 5 };
    }

    unlockAchievement(id) {
        if (!this.data.achievements.includes(id)) {
            this.data.achievements.push(id);
            this.save();
            return true;
        }
        return false;
    }

    hasAchievement(id) {
        return this.data.achievements.includes(id);
    }

    reset() {
        this.data = {
            classic: { times: [], games: 0, best: null },
            visual: { times: [], games: 0, best: null },
            sound: { times: [], games: 0, best: null },
            pattern: { bestLevel: 0, highScore: 0, games: 0 },
            leaderboard: [],
            achievements: [],
            totalGames: 0,
            modesPlayed: []
        };
        this.save();
    }
}

// Initialize stats manager
const stats = new StatisticsManager();

// ============================================
// DOM ELEMENTS
// ============================================
const DOM = {
    // Game mode containers
    classicMode: document.getElementById('classicMode'),
    visualMode: document.getElementById('visualMode'),
    soundMode: document.getElementById('soundMode'),
    patternMode: document.getElementById('patternMode'),

    // Classic mode elements
    gameCircle: document.getElementById('gameCircle'),
    gameText: document.getElementById('gameText'),
    reactionTime: document.getElementById('reactionTime'),
    attemptDots: document.getElementById('attemptDots'),
    attemptLabel: document.getElementById('attemptLabel'),

    // Visual mode elements
    visualGrid: document.getElementById('visualGrid'),
    visualStartOverlay: document.getElementById('visualStartOverlay'),
    startVisualBtn: document.getElementById('startVisualBtn'),
    visualProgress: document.getElementById('visualProgress'),
    visualProgressLabel: document.getElementById('visualProgressLabel'),

    // Sound mode elements
    soundWave: document.getElementById('soundWave'),
    soundStatus: document.getElementById('soundStatus'),
    soundStartBtn: document.getElementById('soundStartBtn'),
    soundGameArea: document.getElementById('soundGameArea'),

    // Pattern mode elements
    patternGrid: document.getElementById('patternGrid'),
    patternLevel: document.getElementById('patternLevel'),
    patternScore: document.getElementById('patternScore'),
    patternStartBtn: document.getElementById('patternStartBtn'),
    patternCells: document.querySelectorAll('.pattern-cell'),

    // Stats elements
    bestTimeDisplay: document.getElementById('bestTimeDisplay'),
    avgTimeDisplay: document.getElementById('avgTimeDisplay'),
    totalAttemptsDisplay: document.getElementById('totalAttemptsDisplay'),
    percentileDisplay: document.getElementById('percentileDisplay'),
    leaderboardBody: document.getElementById('leaderboardBody'),
    historyChart: document.getElementById('historyChart'),
    chartEmpty: document.getElementById('chartEmpty'),

    // Modal elements
    statsModal: document.getElementById('statsModal'),
    achievementsModal: document.getElementById('achievementsModal'),
    achievementsGrid: document.getElementById('achievementsGrid'),

    // Detailed stats in modal
    classicBest: document.getElementById('classicBest'),
    classicAvg: document.getElementById('classicAvg'),
    classicGames: document.getElementById('classicGames'),
    visualBest: document.getElementById('visualBest'),
    visualAvg: document.getElementById('visualAvg'),
    visualGames: document.getElementById('visualGames'),
    soundBest: document.getElementById('soundBest'),
    soundAvg: document.getElementById('soundAvg'),
    soundGames: document.getElementById('soundGames'),
    patternBestLevel: document.getElementById('patternBestLevel'),
    patternHighScore: document.getElementById('patternHighScore'),
    patternGamesPlayed: document.getElementById('patternGamesPlayed'),

    // Buttons and controls
    modeTabs: document.querySelectorAll('.mode-tab'),
    diffBtns: document.querySelectorAll('.diff-btn'),
    soundToggle: document.getElementById('soundToggle'),
    statsBtn: document.getElementById('statsBtn'),
    achievementsBtn: document.getElementById('achievementsBtn'),
    closeStatsModal: document.getElementById('closeStatsModal'),
    closeAchievementsModal: document.getElementById('closeAchievementsModal'),
    resetStatsBtn: document.getElementById('resetStatsBtn'),

    // Toast notifications
    toast: document.getElementById('toast'),
    toastMessage: document.getElementById('toastMessage'),
    achievementToast: document.getElementById('achievementToast'),
    achievementName: document.getElementById('achievementName'),

    // Particle canvas
    particleCanvas: document.getElementById('particleCanvas')
};

// ============================================
// AUDIO MANAGER
// ============================================
class AudioManager {
    constructor() {
        this.context = null;
        this.enabled = true;
    }

    init() {
        if (!this.context) {
            this.context = new (window.AudioContext || window.webkitAudioContext)();
        }
    }

    playBeep(frequency = CONFIG.beepFrequency, duration = CONFIG.beepDuration) {
        if (!this.enabled) return;

        this.init();

        const oscillator = this.context.createOscillator();
        const gainNode = this.context.createGain();

        oscillator.connect(gainNode);
        gainNode.connect(this.context.destination);

        oscillator.frequency.value = frequency;
        oscillator.type = 'sine';

        gainNode.gain.setValueAtTime(0.3, this.context.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, this.context.currentTime + duration / 1000);

        oscillator.start(this.context.currentTime);
        oscillator.stop(this.context.currentTime + duration / 1000);
    }

    playSuccess() {
        if (!this.enabled) return;
        this.playBeep(880, 100);
        setTimeout(() => this.playBeep(1100, 100), 100);
    }

    playError() {
        if (!this.enabled) return;
        this.playBeep(200, 200);
    }

    playClick() {
        if (!this.enabled) return;
        this.playBeep(600, 50);
    }

    toggle() {
        this.enabled = !this.enabled;
        return this.enabled;
    }
}

const audio = new AudioManager();

// ============================================
// PARTICLE SYSTEM
// ============================================
class ParticleSystem {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.particles = [];
        this.resize();
        window.addEventListener('resize', () => this.resize());
    }

    resize() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
    }

    createExplosion(x, y, color = '#00ff88', count = 20) {
        for (let i = 0; i < count; i++) {
            const angle = (Math.PI * 2 * i) / count + Math.random() * 0.5;
            const speed = 2 + Math.random() * 4;

            this.particles.push({
                x: x,
                y: y,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed,
                life: 1,
                decay: 0.02 + Math.random() * 0.02,
                size: 3 + Math.random() * 4,
                color: color
            });
        }
    }

    update() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        for (let i = this.particles.length - 1; i >= 0; i--) {
            const p = this.particles[i];

            p.x += p.vx;
            p.y += p.vy;
            p.vy += 0.1; // gravity
            p.life -= p.decay;

            if (p.life <= 0) {
                this.particles.splice(i, 1);
                continue;
            }

            this.ctx.globalAlpha = p.life;
            this.ctx.fillStyle = p.color;
            this.ctx.beginPath();
            this.ctx.arc(p.x, p.y, p.size * p.life, 0, Math.PI * 2);
            this.ctx.fill();
        }

        this.ctx.globalAlpha = 1;

        if (this.particles.length > 0) {
            requestAnimationFrame(() => this.update());
        }
    }

    trigger(x, y, color) {
        this.createExplosion(x, y, color);
        this.update();
    }
}

const particles = new ParticleSystem(DOM.particleCanvas);

// ============================================
// CLASSIC MODE
// ============================================
function initClassicMode() {
    resetClassicState();
    renderAttemptDots();
}

function resetClassicState() {
    GameState.classic = {
        isPlaying: false,
        isWaiting: false,
        startTime: null,
        timeoutId: null,
        attempts: 0,
        times: [],
        bestTime: null
    };

    DOM.gameCircle.className = 'game-circle';
    DOM.gameText.textContent = 'Click to Start';
    DOM.reactionTime.textContent = '';
    DOM.reactionTime.classList.remove('visible');
}

function renderAttemptDots() {
    DOM.attemptDots.innerHTML = '';
    for (let i = 0; i < CONFIG.classicAttempts; i++) {
        const dot = document.createElement('div');
        dot.className = 'attempt-dot';
        if (i < GameState.classic.attempts) {
            dot.classList.add('completed');
        } else if (i === GameState.classic.attempts && GameState.classic.isPlaying) {
            dot.classList.add('current');
        }
        DOM.attemptDots.appendChild(dot);
    }
    DOM.attemptLabel.textContent = `Attempt ${GameState.classic.attempts} / ${CONFIG.classicAttempts}`;
}

function handleClassicClick(e) {
    const state = GameState.classic;
    const settings = CONFIG.difficulty[GameState.currentDifficulty];

    // Not started yet - start the game
    if (!state.isPlaying && !state.isWaiting) {
        if (state.attempts >= CONFIG.classicAttempts) {
            // Reset for new game
            resetClassicState();
            renderAttemptDots();
        }

        startClassicRound();
        return;
    }

    // Too soon!
    if (state.isWaiting && !state.isPlaying) {
        clearTimeout(state.timeoutId);
        state.timeoutId = null;
        state.isWaiting = false;

        DOM.gameCircle.className = 'game-circle too-soon';
        DOM.gameText.textContent = 'Too Soon!';
        audio.playError();

        setTimeout(() => {
            DOM.gameCircle.className = 'game-circle';
            DOM.gameText.textContent = 'Click to Retry';
        }, 1000);

        return;
    }

    // Valid click - calculate reaction time
    if (state.isPlaying) {
        const reactionTime = Date.now() - state.startTime;
        state.isPlaying = false;
        state.attempts++;
        state.times.push(reactionTime);

        // Update best time
        if (!state.bestTime || reactionTime < state.bestTime) {
            state.bestTime = reactionTime;
        }

        // Add to stats
        stats.addTime('classic', reactionTime);

        // Show result
        DOM.gameCircle.className = 'game-circle success';
        DOM.gameText.textContent = '';
        DOM.reactionTime.textContent = `${reactionTime}ms`;
        DOM.reactionTime.classList.add('visible');

        // Particle effect
        const rect = DOM.gameCircle.getBoundingClientRect();
        particles.trigger(rect.left + rect.width / 2, rect.top + rect.height / 2, '#00ff88');

        audio.playSuccess();

        // Check achievements
        checkAchievements(reactionTime);

        renderAttemptDots();
        updateDashboard();

        // Check if game complete
        if (state.attempts >= CONFIG.classicAttempts) {
            const avg = Math.round(state.times.reduce((a, b) => a + b, 0) / state.times.length);
            stats.completeGame('classic', avg);

            setTimeout(() => {
                DOM.gameText.textContent = `Average: ${avg}ms`;
                DOM.reactionTime.textContent = `Best: ${state.bestTime}ms`;

                // Check extreme difficulty achievement
                if (GameState.currentDifficulty === 'extreme') {
                    unlockAchievement('extreme_mode');
                }
            }, 1500);
        } else {
            setTimeout(() => {
                DOM.gameCircle.className = 'game-circle';
                DOM.gameText.textContent = 'Click for Next';
                DOM.reactionTime.classList.remove('visible');
            }, 1500);
        }
    }
}

function startClassicRound() {
    const state = GameState.classic;
    const settings = CONFIG.difficulty[GameState.currentDifficulty];

    state.isWaiting = true;
    DOM.gameCircle.className = 'game-circle waiting';
    DOM.gameText.textContent = 'Wait...';
    DOM.reactionTime.classList.remove('visible');

    renderAttemptDots();

    const delay = settings.minDelay + Math.random() * (settings.maxDelay - settings.minDelay);

    state.timeoutId = setTimeout(() => {
        state.isWaiting = false;
        state.isPlaying = true;
        state.startTime = Date.now();

        DOM.gameCircle.className = 'game-circle ready';
        DOM.gameText.textContent = 'CLICK!';
        audio.playBeep();
    }, delay);
}

// ============================================
// VISUAL HUNT MODE
// ============================================
function initVisualMode() {
    resetVisualState();
}

function resetVisualState() {
    GameState.visual = {
        isPlaying: false,
        round: 0,
        startTime: null,
        times: [],
        targetIndex: null
    };

    DOM.visualGrid.innerHTML = '';
    DOM.visualGrid.classList.remove('active');
    DOM.visualStartOverlay.classList.remove('hidden');
    DOM.visualProgress.style.width = '0%';
    DOM.visualProgressLabel.textContent = `Round 0 / ${CONFIG.visualRounds}`;
}

function startVisualGame() {
    resetVisualState();
    GameState.visual.isPlaying = true;
    DOM.visualStartOverlay.classList.add('hidden');

    setTimeout(() => {
        startVisualRound();
    }, 500);
}

function startVisualRound() {
    const state = GameState.visual;
    const settings = CONFIG.difficulty[GameState.currentDifficulty];

    DOM.visualGrid.innerHTML = '';
    DOM.visualGrid.classList.add('active');

    const totalCells = settings.distractors + 1;
    const cols = Math.ceil(Math.sqrt(totalCells));
    DOM.visualGrid.style.gridTemplateColumns = `repeat(${cols}, 1fr)`;

    // Generate targets
    state.targetIndex = Math.floor(Math.random() * totalCells);

    for (let i = 0; i < totalCells; i++) {
        const cell = document.createElement('div');
        cell.className = 'visual-target';
        cell.dataset.index = i;

        if (i === state.targetIndex) {
            cell.style.background = '#22c55e';
            cell.dataset.correct = 'true';
        } else {
            const color = CONFIG.distractorColors[Math.floor(Math.random() * CONFIG.distractorColors.length)];
            cell.style.background = color;
        }

        cell.addEventListener('click', handleVisualClick);
        DOM.visualGrid.appendChild(cell);
    }

    state.startTime = Date.now();
}

function handleVisualClick(e) {
    const state = GameState.visual;
    if (!state.isPlaying) return;

    const isCorrect = e.target.dataset.correct === 'true';

    if (isCorrect) {
        const reactionTime = Date.now() - state.startTime;
        state.times.push(reactionTime);
        state.round++;

        e.target.classList.add('correct');
        audio.playSuccess();

        // Particle effect
        const rect = e.target.getBoundingClientRect();
        particles.trigger(rect.left + rect.width / 2, rect.top + rect.height / 2, '#00ff88');

        stats.addTime('visual', reactionTime);

        // Update progress
        const progress = (state.round / CONFIG.visualRounds) * 100;
        DOM.visualProgress.style.width = `${progress}%`;
        DOM.visualProgressLabel.textContent = `Round ${state.round} / ${CONFIG.visualRounds}`;

        updateDashboard();

        if (state.round >= CONFIG.visualRounds) {
            // Game complete
            state.isPlaying = false;
            const avg = Math.round(state.times.reduce((a, b) => a + b, 0) / state.times.length);
            stats.completeGame('visual', avg);

            unlockAchievement('visual_hunter');

            setTimeout(() => {
                showToast(`Great job! Average: ${avg}ms`);
                resetVisualState();
            }, 1000);
        } else {
            setTimeout(() => {
                startVisualRound();
            }, 500);
        }
    } else {
        e.target.classList.add('wrong');
        audio.playError();

        setTimeout(() => {
            e.target.classList.remove('wrong');
        }, 400);
    }
}

// ============================================
// SOUND MODE
// ============================================
function initSoundMode() {
    resetSoundState();
}

function resetSoundState() {
    if (GameState.sound.timeoutId) {
        clearTimeout(GameState.sound.timeoutId);
    }

    GameState.sound = {
        isPlaying: false,
        isListening: false,
        round: 0,
        startTime: null,
        times: [],
        timeoutId: null
    };

    DOM.soundWave.className = 'sound-wave';
    DOM.soundStatus.textContent = 'Press Start to Begin';
    DOM.soundStatus.className = 'sound-status';
    DOM.soundStartBtn.style.display = 'flex';
}

function startSoundGame() {
    resetSoundState();
    GameState.sound.isPlaying = true;
    DOM.soundStartBtn.style.display = 'none';

    startSoundRound();
}

function startSoundRound() {
    const state = GameState.sound;
    const settings = CONFIG.difficulty[GameState.currentDifficulty];

    state.isListening = true;
    DOM.soundWave.className = 'sound-wave active';
    DOM.soundStatus.textContent = 'Listen carefully...';
    DOM.soundStatus.className = 'sound-status listening';

    const delay = settings.minDelay + Math.random() * (settings.maxDelay - settings.minDelay);

    state.timeoutId = setTimeout(() => {
        // Play beep
        audio.playBeep(CONFIG.beepFrequency, CONFIG.beepDuration);

        DOM.soundWave.className = 'sound-wave beeping';
        DOM.soundStatus.textContent = 'REACT NOW!';
        DOM.soundStatus.className = 'sound-status react';

        state.startTime = Date.now();
        state.isListening = false;
    }, delay);
}

function handleSoundReaction() {
    const state = GameState.sound;

    if (!state.isPlaying) return;

    // Too soon
    if (state.isListening) {
        clearTimeout(state.timeoutId);
        audio.playError();

        DOM.soundWave.className = 'sound-wave';
        DOM.soundStatus.textContent = 'Too Soon! Try again...';

        setTimeout(() => {
            startSoundRound();
        }, 1500);

        return;
    }

    // Valid reaction
    if (state.startTime) {
        const reactionTime = Date.now() - state.startTime;
        state.times.push(reactionTime);
        state.round++;

        audio.playSuccess();

        // Particle effect (center of screen)
        particles.trigger(window.innerWidth / 2, window.innerHeight / 2, '#00d4ff');

        stats.addTime('sound', reactionTime);

        DOM.soundWave.className = 'sound-wave';
        DOM.soundStatus.textContent = `${reactionTime}ms - Round ${state.round}/${CONFIG.soundRounds}`;

        state.startTime = null;
        updateDashboard();

        if (state.round >= CONFIG.soundRounds) {
            state.isPlaying = false;
            const avg = Math.round(state.times.reduce((a, b) => a + b, 0) / state.times.length);
            stats.completeGame('sound', avg);

            if (avg < 200) {
                unlockAchievement('sound_master');
            }

            setTimeout(() => {
                showToast(`Completed! Average: ${avg}ms`);
                resetSoundState();
            }, 1500);
        } else {
            setTimeout(() => {
                startSoundRound();
            }, 1500);
        }
    }
}

// ============================================
// PATTERN MODE
// ============================================
function initPatternMode() {
    resetPatternState();
}

function resetPatternState() {
    GameState.pattern = {
        isPlaying: false,
        isShowingPattern: false,
        level: 1,
        score: 0,
        pattern: [],
        playerPattern: [],
        currentShowIndex: 0
    };

    DOM.patternLevel.textContent = 'Level 1';
    DOM.patternScore.textContent = 'Score: 0';
    DOM.patternStartBtn.style.display = 'flex';

    DOM.patternCells.forEach(cell => {
        cell.className = 'pattern-cell';
    });
}

function startPatternGame() {
    resetPatternState();
    GameState.pattern.isPlaying = true;
    DOM.patternStartBtn.style.display = 'none';

    generatePattern();
    setTimeout(() => showPattern(), 500);
}

function generatePattern() {
    const state = GameState.pattern;
    const newIndex = Math.floor(Math.random() * 9);
    state.pattern.push(newIndex);
}

function showPattern() {
    const state = GameState.pattern;
    const settings = CONFIG.difficulty[GameState.currentDifficulty];

    state.isShowingPattern = true;
    state.currentShowIndex = 0;

    // Disable cells during pattern display
    DOM.patternCells.forEach(cell => cell.classList.add('disabled'));

    function showNext() {
        if (state.currentShowIndex > 0) {
            // Clear previous
            DOM.patternCells.forEach(cell => cell.classList.remove('flash'));
        }

        if (state.currentShowIndex < state.pattern.length) {
            const index = state.pattern[state.currentShowIndex];
            DOM.patternCells[index].classList.add('flash');
            audio.playBeep(440 + index * 80, 200);

            state.currentShowIndex++;
            setTimeout(showNext, settings.patternSpeed);
        } else {
            // Pattern shown, player's turn
            DOM.patternCells.forEach(cell => {
                cell.classList.remove('flash', 'disabled');
            });

            state.isShowingPattern = false;
            state.playerPattern = [];
        }
    }

    showNext();
}

function handlePatternClick(e) {
    const state = GameState.pattern;

    if (!state.isPlaying || state.isShowingPattern) return;

    const index = parseInt(e.target.dataset.index);
    state.playerPattern.push(index);

    // Visual feedback
    e.target.classList.add('flash');
    audio.playBeep(440 + index * 80, 150);

    setTimeout(() => {
        e.target.classList.remove('flash');
    }, 200);

    // Check if correct
    const currentIndex = state.playerPattern.length - 1;

    if (state.playerPattern[currentIndex] !== state.pattern[currentIndex]) {
        // Wrong!
        e.target.classList.add('wrong-flash');
        audio.playError();

        setTimeout(() => {
            e.target.classList.remove('wrong-flash');
        }, 500);

        // Game over
        state.isPlaying = false;
        stats.updatePatternStats(state.level, state.score);

        // Check achievements
        if (state.level >= 5) unlockAchievement('pattern_5');
        if (state.level >= 10) unlockAchievement('pattern_10');

        setTimeout(() => {
            showToast(`Game Over! Level ${state.level}, Score: ${state.score}`);
            resetPatternState();
        }, 1000);

        return;
    }

    e.target.classList.add('correct-flash');
    setTimeout(() => {
        e.target.classList.remove('correct-flash');
    }, 200);

    // Check if pattern complete
    if (state.playerPattern.length === state.pattern.length) {
        // Level complete!
        state.level++;
        state.score += state.pattern.length * 10;

        DOM.patternLevel.textContent = `Level ${state.level}`;
        DOM.patternScore.textContent = `Score: ${state.score}`;

        audio.playSuccess();

        // Generate next pattern
        generatePattern();

        setTimeout(() => {
            showPattern();
        }, 1000);
    }
}

// ============================================
// ACHIEVEMENTS
// ============================================
function checkAchievements(reactionTime = null) {
    // First game
    if (stats.data.totalGames >= 1) {
        unlockAchievement('first_game');
    }

    // Speed achievements
    if (reactionTime !== null) {
        if (reactionTime < 200) unlockAchievement('speed_demon');
        if (reactionTime < 150) unlockAchievement('lightning');
    }

    // Practice achievements
    if (stats.data.totalGames >= 10) unlockAchievement('practice_10');
    if (stats.data.totalGames >= 50) unlockAchievement('practice_50');

    // All modes achievement
    if (stats.data.modesPlayed.length >= 4) {
        unlockAchievement('all_modes');
    }
}

function unlockAchievement(id) {
    if (stats.unlockAchievement(id)) {
        const achievement = ACHIEVEMENTS.find(a => a.id === id);
        if (achievement) {
            showAchievementToast(achievement.name);
        }
    }
}

function showAchievementToast(name) {
    DOM.achievementName.textContent = name;
    DOM.achievementToast.classList.add('show');

    setTimeout(() => {
        DOM.achievementToast.classList.remove('show');
    }, 4000);
}

function renderAchievements() {
    DOM.achievementsGrid.innerHTML = '';

    ACHIEVEMENTS.forEach(achievement => {
        const unlocked = stats.hasAchievement(achievement.id);

        const card = document.createElement('div');
        card.className = `achievement-card ${unlocked ? 'unlocked' : ''}`;

        card.innerHTML = `
            <div class="achievement-icon">
                <i class="${achievement.icon}"></i>
            </div>
            <span class="achievement-name">${achievement.name}</span>
            <span class="achievement-desc">${achievement.desc}</span>
        `;

        DOM.achievementsGrid.appendChild(card);
    });
}

// ============================================
// UI UPDATES
// ============================================
function updateDashboard() {
    // Best time
    const best = stats.getGlobalBest();
    DOM.bestTimeDisplay.textContent = best ? `${best}ms` : '--';

    // Average
    const avg = stats.getGlobalAverage();
    DOM.avgTimeDisplay.textContent = avg ? `${avg}ms` : '--';

    // Total attempts
    const totalAttempts = ['classic', 'visual', 'sound'].reduce((sum, mode) => {
        return sum + (stats.data[mode]?.times?.length || 0);
    }, 0);
    DOM.totalAttemptsDisplay.textContent = totalAttempts;

    // Percentile
    const percentile = stats.getPercentile();
    DOM.percentileDisplay.textContent = percentile ? percentile.label : '--';

    // Leaderboard
    updateLeaderboard();

    // Chart
    updateChart();
}

function updateLeaderboard() {
    if (stats.data.leaderboard.length === 0) {
        DOM.leaderboardBody.innerHTML = `
            <tr class="empty-row">
                <td colspan="4">No records yet. Start playing!</td>
            </tr>
        `;
        return;
    }

    DOM.leaderboardBody.innerHTML = stats.data.leaderboard.map((entry, index) => {
        let rankBadge = '';
        if (index === 0) rankBadge = 'gold';
        else if (index === 1) rankBadge = 'silver';
        else if (index === 2) rankBadge = 'bronze';

        const badgeClass = rankBadge ? `rank-badge ${rankBadge}` : 'rank-badge';
        const date = new Date(entry.date).toLocaleDateString();
        const modeLabel = entry.mode.charAt(0).toUpperCase() + entry.mode.slice(1);

        return `
            <tr>
                <td><span class="${badgeClass}">${index + 1}</span></td>
                <td><strong>${entry.time}ms</strong></td>
                <td>${modeLabel}</td>
                <td>${date}</td>
            </tr>
        `;
    }).join('');
}

function updateChart() {
    const ctx = DOM.historyChart.getContext('2d');
    const width = DOM.historyChart.parentElement.clientWidth - 40;
    const height = 200;

    DOM.historyChart.width = width;
    DOM.historyChart.height = height;

    // Get last 20 times
    let allTimes = [];
    ['classic', 'visual', 'sound'].forEach(mode => {
        if (stats.data[mode]?.times) {
            allTimes = allTimes.concat(stats.data[mode].times.map(t => ({ time: t, mode })));
        }
    });

    allTimes = allTimes.slice(-20);

    if (allTimes.length === 0) {
        DOM.chartEmpty.classList.remove('hidden');
        return;
    }

    DOM.chartEmpty.classList.add('hidden');

    // Clear canvas
    ctx.clearRect(0, 0, width, height);

    // Calculate bounds
    const maxTime = Math.max(...allTimes.map(t => t.time));
    const minTime = Math.min(...allTimes.map(t => t.time));
    const range = maxTime - minTime || 100;

    // Draw grid lines
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
    ctx.lineWidth = 1;

    for (let i = 0; i <= 4; i++) {
        const y = (i / 4) * height;
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
    }

    // Draw line
    const padding = 20;
    const graphWidth = width - padding * 2;
    const graphHeight = height - padding * 2;

    ctx.strokeStyle = '#00ff88';
    ctx.lineWidth = 2;
    ctx.beginPath();

    allTimes.forEach((entry, index) => {
        const x = padding + (index / (allTimes.length - 1 || 1)) * graphWidth;
        const y = height - padding - ((entry.time - minTime) / range) * graphHeight;

        if (index === 0) {
            ctx.moveTo(x, y);
        } else {
            ctx.lineTo(x, y);
        }
    });

    ctx.stroke();

    // Draw points
    allTimes.forEach((entry, index) => {
        const x = padding + (index / (allTimes.length - 1 || 1)) * graphWidth;
        const y = height - padding - ((entry.time - minTime) / range) * graphHeight;

        ctx.fillStyle = entry.mode === 'classic' ? '#00ff88' :
            entry.mode === 'visual' ? '#00d4ff' : '#a855f7';
        ctx.beginPath();
        ctx.arc(x, y, 4, 0, Math.PI * 2);
        ctx.fill();
    });
}

function updateDetailedStats() {
    // Classic
    DOM.classicBest.textContent = stats.data.classic.best ? `${stats.data.classic.best}ms` : '--';
    DOM.classicAvg.textContent = stats.getAverage('classic') ? `${stats.getAverage('classic')}ms` : '--';
    DOM.classicGames.textContent = stats.data.classic.games;

    // Visual
    DOM.visualBest.textContent = stats.data.visual.best ? `${stats.data.visual.best}ms` : '--';
    DOM.visualAvg.textContent = stats.getAverage('visual') ? `${stats.getAverage('visual')}ms` : '--';
    DOM.visualGames.textContent = stats.data.visual.games;

    // Sound
    DOM.soundBest.textContent = stats.data.sound.best ? `${stats.data.sound.best}ms` : '--';
    DOM.soundAvg.textContent = stats.getAverage('sound') ? `${stats.getAverage('sound')}ms` : '--';
    DOM.soundGames.textContent = stats.data.sound.games;

    // Pattern
    DOM.patternBestLevel.textContent = stats.data.pattern.bestLevel;
    DOM.patternHighScore.textContent = stats.data.pattern.highScore;
    DOM.patternGamesPlayed.textContent = stats.data.pattern.games;
}

function showToast(message) {
    DOM.toastMessage.textContent = message;
    DOM.toast.classList.add('show');

    setTimeout(() => {
        DOM.toast.classList.remove('show');
    }, 3000);
}

// ============================================
// MODE SWITCHING
// ============================================
function switchMode(mode) {
    GameState.currentMode = mode;

    // Update tabs
    DOM.modeTabs.forEach(tab => {
        tab.classList.toggle('active', tab.dataset.mode === mode);
    });

    // Hide all modes
    DOM.classicMode.classList.add('hidden');
    DOM.visualMode.classList.add('hidden');
    DOM.soundMode.classList.add('hidden');
    DOM.patternMode.classList.add('hidden');

    // Show selected mode
    switch (mode) {
        case 'classic':
            DOM.classicMode.classList.remove('hidden');
            initClassicMode();
            break;
        case 'visual':
            DOM.visualMode.classList.remove('hidden');
            initVisualMode();
            break;
        case 'sound':
            DOM.soundMode.classList.remove('hidden');
            initSoundMode();
            break;
        case 'pattern':
            DOM.patternMode.classList.remove('hidden');
            initPatternMode();
            break;
    }

    audio.playClick();
}

function setDifficulty(difficulty) {
    GameState.currentDifficulty = difficulty;

    DOM.diffBtns.forEach(btn => {
        btn.classList.toggle('active', btn.dataset.difficulty === difficulty);
    });

    audio.playClick();

    // Reset current mode with new difficulty
    switchMode(GameState.currentMode);
}

// ============================================
// MODAL HANDLERS
// ============================================
function openModal(modal) {
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
}

function closeModal(modal) {
    modal.classList.remove('active');
    document.body.style.overflow = '';
}

// ============================================
// EVENT LISTENERS
// ============================================
function initEventListeners() {
    // Mode tabs
    DOM.modeTabs.forEach(tab => {
        tab.addEventListener('click', () => switchMode(tab.dataset.mode));
    });

    // Difficulty buttons
    DOM.diffBtns.forEach(btn => {
        btn.addEventListener('click', () => setDifficulty(btn.dataset.difficulty));
    });

    // Classic mode
    DOM.gameCircle.addEventListener('click', handleClassicClick);

    // Visual mode
    DOM.startVisualBtn.addEventListener('click', startVisualGame);

    // Sound mode
    DOM.soundStartBtn.addEventListener('click', startSoundGame);
    DOM.soundGameArea.addEventListener('click', handleSoundReaction);

    // Pattern mode
    DOM.patternStartBtn.addEventListener('click', startPatternGame);
    DOM.patternCells.forEach(cell => {
        cell.addEventListener('click', handlePatternClick);
    });

    // Keyboard handler for sound mode
    document.addEventListener('keydown', (e) => {
        if (e.code === 'Space' && GameState.currentMode === 'sound' && GameState.sound.isPlaying) {
            e.preventDefault();
            handleSoundReaction();
        }
    });

    // Sound toggle
    DOM.soundToggle.addEventListener('click', () => {
        const enabled = audio.toggle();
        DOM.soundToggle.classList.toggle('muted', !enabled);
        DOM.soundToggle.querySelector('i').className = enabled ? 'ri-volume-up-line' : 'ri-volume-mute-line';
    });

    // Stats button
    DOM.statsBtn.addEventListener('click', () => {
        updateDetailedStats();
        openModal(DOM.statsModal);
    });

    // Achievements button
    DOM.achievementsBtn.addEventListener('click', () => {
        renderAchievements();
        openModal(DOM.achievementsModal);
    });

    // Close modals
    DOM.closeStatsModal.addEventListener('click', () => closeModal(DOM.statsModal));
    DOM.closeAchievementsModal.addEventListener('click', () => closeModal(DOM.achievementsModal));

    // Close modal on overlay click
    document.querySelectorAll('.modal-overlay').forEach(overlay => {
        overlay.addEventListener('click', () => {
            closeModal(DOM.statsModal);
            closeModal(DOM.achievementsModal);
        });
    });

    // Reset stats
    DOM.resetStatsBtn.addEventListener('click', () => {
        if (confirm('Are you sure you want to reset all statistics? This cannot be undone.')) {
            stats.reset();
            updateDashboard();
            updateDetailedStats();
            closeModal(DOM.statsModal);
            showToast('Statistics reset successfully');
        }
    });

    // Window resize for chart
    window.addEventListener('resize', () => {
        updateChart();
    });
}

// ============================================
// INITIALIZATION
// ============================================
function init() {
    initEventListeners();
    initClassicMode();
    updateDashboard();

    console.log('🎮 Reaction Time Arena initialized!');
}

// Start the game when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}
