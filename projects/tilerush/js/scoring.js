function registerPerfectHit() {
    GAME_STATE.perfectHits++;
    GAME_STATE.totalHits++;
    GAME_STATE.combo++;
    GAME_STATE.streak++;

    if (GAME_STATE.combo > GAME_STATE.bestCombo) {
        GAME_STATE.bestCombo = GAME_STATE.combo;
    }

    if (GAME_STATE.streak > GAME_STATE.bestStreak) {
        GAME_STATE.bestStreak = GAME_STATE.streak;
    }

    const basePoints = CONFIG.SCORING.PERFECT;
    const multiplier = getComboMultiplier();
    const points = Math.floor(basePoints * multiplier);

    GAME_STATE.score += points;

    playPerfectHitSound();

    if (GAME_STATE.combo > 1) {
        playComboSound(GAME_STATE.combo);
    }

    if (GAME_STATE.streak > 0 && GAME_STATE.streak % CONFIG.SCORING.STREAK_MILESTONE === 0) {
        GAME_STATE.score += CONFIG.SCORING.STREAK_BONUS;
        playMilestoneSound();
        playStreakSound();
        showComboMilestone(GAME_STATE.streak);
        activateStreakIcon();
    }

    updateScoreDisplay();
    updateComboDisplay();
    updateStreakDisplay();
}

function registerGoodHit() {
    GAME_STATE.goodHits++;
    GAME_STATE.totalHits++;
    GAME_STATE.streak = 0;

    const basePoints = CONFIG.SCORING.GOOD;
    const multiplier = getComboMultiplier();
    const points = Math.floor(basePoints * multiplier);

    GAME_STATE.score += points;

    playGoodHitSound();

    updateScoreDisplay();
    updateStreakDisplay();
}

function registerMiss() {
    GAME_STATE.misses++;
    GAME_STATE.combo = 0;
    GAME_STATE.streak = 0;

    playMissSound();

    updateComboDisplay();
    updateStreakDisplay();
    showHitFeedback('MISS', 'miss');
}

function updateScoreDisplay() {
    const scoreValue = document.getElementById('score-value');
    scoreValue.textContent = GAME_STATE.score;

    scoreValue.classList.remove('increment');
    void scoreValue.offsetWidth;
    scoreValue.classList.add('increment');

    setTimeout(() => {
        scoreValue.classList.remove('increment');
    }, 200);
}

function updateComboDisplay() {
    const comboValue = document.getElementById('combo-value');
    const comboMultiplier = document.getElementById('combo-multiplier');

    comboValue.textContent = GAME_STATE.combo;

    if (GAME_STATE.combo > 0) {
        comboValue.classList.remove('pulse');
        void comboValue.offsetWidth;
        comboValue.classList.add('pulse');

        setTimeout(() => {
            comboValue.classList.remove('pulse');
        }, 300);
    }

    const multiplier = getComboMultiplier();
    comboMultiplier.textContent = `×${multiplier.toFixed(1)}`;

    comboMultiplier.classList.remove('change');
    void comboMultiplier.offsetWidth;
    comboMultiplier.classList.add('change');

    setTimeout(() => {
        comboMultiplier.classList.remove('change');
    }, 400);
}

function updateStreakDisplay() {
    const streakValue = document.getElementById('streak-value');
    const streakIcon = document.getElementById('streak-icon');

    streakValue.textContent = GAME_STATE.streak;

    if (GAME_STATE.streak > 0) {
        streakValue.classList.add('glow');
        streakIcon.classList.add('active');
    } else {
        streakValue.classList.remove('glow');
        streakIcon.classList.remove('active');
    }
}

function activateStreakIcon() {
    const streakIcon = document.getElementById('streak-icon');
    streakIcon.style.transform = 'scale(1.5) rotate(360deg)';
    streakIcon.style.transition = 'transform 0.5s ease-out';

    setTimeout(() => {
        streakIcon.style.transform = 'scale(1) rotate(0deg)';
    }, 500);
}

function updateFinalStats() {
    document.getElementById('final-score').textContent = GAME_STATE.score;
    document.getElementById('final-combo').textContent = GAME_STATE.bestCombo;
    document.getElementById('final-streak').textContent = GAME_STATE.bestStreak;
}

function getScoreData() {
    return {
        score: GAME_STATE.score,
        combo: GAME_STATE.bestCombo,
        streak: GAME_STATE.bestStreak,
        accuracy: getAccuracy(),
        perfectHits: GAME_STATE.perfectHits,
        goodHits: GAME_STATE.goodHits,
        misses: GAME_STATE.misses,
        totalHits: GAME_STATE.totalHits
    };
}
