document.addEventListener('DOMContentLoaded', () => {
    initializeGame();
    setupEventListeners();
    initializeInput();
});

function initializeGame() {
    resetGameState();
    showOverlay('start');
}

function setupEventListeners() {
    document.getElementById('start-button').addEventListener('click', startGame);
    document.getElementById('resume-button').addEventListener('click', resumeGame);
    document.getElementById('restart-button').addEventListener('click', restartGame);
    document.getElementById('play-again-button').addEventListener('click', restartGame);

    document.addEventListener('keydown', (e) => {
        if (e.code === 'Escape') {
            if (GAME_STATE.isPlaying && !GAME_STATE.isPaused) {
                pauseGame();
            } else if (GAME_STATE.isPaused) {
                resumeGame();
            }
        }
    });

    document.addEventListener('visibilitychange', () => {
        if (document.hidden && GAME_STATE.isPlaying && !GAME_STATE.isPaused) {
            pauseGame();
        }
    });
}

function startGame() {
    initAudio();
    hideAllOverlays();
    resetGameState();
    clearAllTiles();

    updateScoreDisplay();
    updateComboDisplay();
    updateStreakDisplay();

    playGameStartSound();

    setTimeout(() => {
        startGameLoop();
    }, 400);
}

function pauseGame() {
    if (!GAME_STATE.isPlaying || GAME_STATE.isPaused) return;

    pauseGameLoop();
    showOverlay('pause');
}

function resumeGame() {
    if (!GAME_STATE.isPlaying || !GAME_STATE.isPaused) return;

    hideAllOverlays();

    setTimeout(() => {
        resumeGameLoop();
    }, 100);
}

function restartGame() {
    hideAllOverlays();
    stopGameLoop();
    clearAllTiles();
    resetGameState();

    updateScoreDisplay();
    updateComboDisplay();
    updateStreakDisplay();

    playGameStartSound();

    setTimeout(() => {
        startGameLoop();
    }, 400);
}

function showOverlay(overlayId) {
    const overlayMap = {
        'start': 'start-overlay',
        'pause': 'pause-overlay',
        'gameover': 'gameover-overlay'
    };

    const overlay = document.getElementById(overlayMap[overlayId]);
    if (overlay) {
        overlay.classList.add('active');
    }
}

function hideOverlay(overlayId) {
    const overlayMap = {
        'start': 'start-overlay',
        'pause': 'pause-overlay',
        'gameover': 'gameover-overlay'
    };

    const overlay = document.getElementById(overlayMap[overlayId]);
    if (overlay) {
        overlay.classList.remove('active');
    }
}

function hideAllOverlays() {
    document.querySelectorAll('.overlay').forEach(overlay => {
        overlay.classList.remove('active');
    });
}

window.addEventListener('error', (e) => {
    console.error('Game error:', e.error);
});

window.addEventListener('unhandledrejection', (e) => {
    console.error('Unhandled promise rejection:', e.reason);
});
