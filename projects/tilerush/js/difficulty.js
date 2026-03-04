function updateDifficulty() {
    const scoreMultiplier = 1 + (GAME_STATE.score * CONFIG.DIFFICULTY.SPEED_INCREASE_PER_SCORE);
    const targetSpeed = CONFIG.BASE_SPEED * Math.min(scoreMultiplier, CONFIG.DIFFICULTY.MAX_SPEED_MULTIPLIER);

    const accuracy = getAccuracy();
    let accuracyBonus = 1.0;
    if (accuracy >= CONFIG.DIFFICULTY.HIGH_ACCURACY_THRESHOLD) {
        accuracyBonus = 1.2;
    }

    const finalTargetSpeed = targetSpeed * accuracyBonus;

    const speedDiff = finalTargetSpeed - GAME_STATE.currentSpeed;
    const speedIncrement = speedDiff * 0.05;
    GAME_STATE.currentSpeed += speedIncrement;

    if (GAME_STATE.score > 0 && GAME_STATE.score % CONFIG.DIFFICULTY.DIFFICULTY_SCORE_THRESHOLD === 0) {
        const newInterval = Math.max(
            GAME_STATE.currentSpawnInterval * CONFIG.DIFFICULTY.SPAWN_INTERVAL_DECREASE,
            CONFIG.DIFFICULTY.SPAWN_INTERVAL_MIN
        );
        GAME_STATE.currentSpawnInterval = newInterval;
    }

    GAME_STATE.difficulty = GAME_STATE.currentSpeed / CONFIG.BASE_SPEED;
}

function getDifficultyLevel() {
    if (GAME_STATE.difficulty < 1.5) return 'Easy';
    if (GAME_STATE.difficulty < 2.0) return 'Medium';
    if (GAME_STATE.difficulty < 2.5) return 'Hard';
    return 'Extreme';
}

function shouldSpawnTile(currentTime) {
    if (GAME_STATE.lastSpawnTime === 0) {
        GAME_STATE.lastSpawnTime = currentTime;
        return true;
    }

    const timeSinceLastSpawn = currentTime - GAME_STATE.lastSpawnTime;

    const baseInterval = GAME_STATE.currentSpawnInterval;
    const variance = baseInterval * 0.3;
    const randomInterval = baseInterval + (Math.random() * variance * 2 - variance);

    if (timeSinceLastSpawn >= randomInterval) {
        GAME_STATE.lastSpawnTime = currentTime;
        return true;
    }

    return false;
}

function getSpawnProbability() {
    const baseProbability = 0.5;
    const difficultyBonus = (GAME_STATE.difficulty - 1) * 0.2;
    return Math.min(baseProbability + difficultyBonus, 0.9);
}

function adjustDifficultyForPerformance() {
    const recentMisses = GAME_STATE.misses;
    const recentHits = GAME_STATE.totalHits;

    if (recentHits > 20) {
        const missRate = recentMisses / recentHits;

        if (missRate > 0.5) {
            GAME_STATE.currentSpeed *= 0.95;
            GAME_STATE.currentSpawnInterval *= 1.05;
        }
    }
}
