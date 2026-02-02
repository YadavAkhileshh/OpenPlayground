let lastFrameTime = 0;
let animationFrameId = null;

function startGameLoop() {
    lastFrameTime = performance.now();
    GAME_STATE.startTime = lastFrameTime;
    GAME_STATE.isPlaying = true;
    GAME_STATE.isPaused = false;

    gameLoop(lastFrameTime);
}

function stopGameLoop() {
    GAME_STATE.isPlaying = false;
    if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
        animationFrameId = null;
    }
}

function pauseGameLoop() {
    GAME_STATE.isPaused = true;
}

function resumeGameLoop() {
    GAME_STATE.isPaused = false;
    lastFrameTime = performance.now();
    gameLoop(lastFrameTime);
}

function gameLoop(currentTime) {
    if (!GAME_STATE.isPlaying) return;

    if (GAME_STATE.isPaused) {
        animationFrameId = requestAnimationFrame(gameLoop);
        return;
    }

    const deltaTime = currentTime - lastFrameTime;
    lastFrameTime = currentTime;

    GAME_STATE.gameTime = currentTime - GAME_STATE.startTime;

    if (shouldSpawnTile(currentTime)) {
        spawnTile();
    }

    updateTiles(deltaTime);

    updateDifficulty();

    adjustDifficultyForPerformance();

    animationFrameId = requestAnimationFrame(gameLoop);
}

function checkGameOver() {
    if (GAME_STATE.misses >= 3) {
        endGame();
        return true;
    }
    return false;
}

function endGame() {
    stopGameLoop();
    clearAllTiles();
    playGameOverSound();
    updateFinalStats();
    showOverlay('gameover');
}
