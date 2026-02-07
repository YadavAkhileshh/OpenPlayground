const CONFIG = {
    LANES: 4,
    TILE_HEIGHT: 80,
    BASE_SPEED: 400,
    MIN_SPAWN_INTERVAL: 300,
    MAX_SPAWN_INTERVAL: 800,
    
    TIMING: {
        PERFECT_WINDOW: 50,
        GOOD_WINDOW: 100,
        HIT_ZONE_START: 0.75,
        HIT_ZONE_END: 0.95
    },
    
    SCORING: {
        PERFECT: 100,
        GOOD: 50,
        MISS: 0,
        COMBO_MULTIPLIER_BASE: 1.0,
        COMBO_MULTIPLIER_INCREMENT: 0.1,
        COMBO_MULTIPLIER_MAX: 5.0,
        STREAK_BONUS: 50,
        STREAK_MILESTONE: 10
    },
    
    DIFFICULTY: {
        SPEED_INCREASE_PER_SCORE: 0.0002,
        MAX_SPEED_MULTIPLIER: 3.0,
        SPAWN_INTERVAL_DECREASE: 0.9,
        SPAWN_INTERVAL_MIN: 200,
        DIFFICULTY_SCORE_THRESHOLD: 1000,
        HIGH_ACCURACY_THRESHOLD: 0.9,
        SPEED_TRANSITION_DURATION: 2000
    },
    
    PATTERNS: {
        MAX_CONSECUTIVE_SAME_LANE: 2,
        LANE_WEIGHT_DECAY: 0.5,
        MIN_LANE_GAP: 1
    },
    
    COLORS: {
        TILE_DEFAULT: ['#00ffff', '#00cccc'],
        TILE_PERFECT: ['#ffd700', '#ffaa00'],
        TILE_GOOD: ['#00ff00', '#00cc00'],
        LANE_FLASH_PERFECT: 'rgba(255, 215, 0, 0.3)',
        LANE_FLASH_GOOD: 'rgba(0, 255, 0, 0.2)',
        LANE_FLASH_MISS: 'rgba(255, 0, 0, 0.3)'
    },
    
    VISUAL: {
        FEEDBACK_DURATION: 800,
        MILESTONE_DURATION: 1200,
        PARTICLE_COUNT: 12,
        SCREEN_FLASH_DURATION: 500
    }
};

const GAME_STATE = {
    isPlaying: false,
    isPaused: false,
    score: 0,
    combo: 0,
    bestCombo: 0,
    streak: 0,
    bestStreak: 0,
    totalHits: 0,
    perfectHits: 0,
    goodHits: 0,
    misses: 0,
    currentSpeed: CONFIG.BASE_SPEED,
    currentSpawnInterval: CONFIG.MAX_SPAWN_INTERVAL,
    lastSpawnTime: 0,
    startTime: 0,
    gameTime: 0,
    tiles: [],
    laneHistory: [],
    difficulty: 1.0
};

function resetGameState() {
    GAME_STATE.isPlaying = false;
    GAME_STATE.isPaused = false;
    GAME_STATE.score = 0;
    GAME_STATE.combo = 0;
    GAME_STATE.bestCombo = 0;
    GAME_STATE.streak = 0;
    GAME_STATE.bestStreak = 0;
    GAME_STATE.totalHits = 0;
    GAME_STATE.perfectHits = 0;
    GAME_STATE.goodHits = 0;
    GAME_STATE.misses = 0;
    GAME_STATE.currentSpeed = CONFIG.BASE_SPEED;
    GAME_STATE.currentSpawnInterval = CONFIG.MAX_SPAWN_INTERVAL;
    GAME_STATE.lastSpawnTime = 0;
    GAME_STATE.startTime = 0;
    GAME_STATE.gameTime = 0;
    GAME_STATE.tiles = [];
    GAME_STATE.laneHistory = [];
    GAME_STATE.difficulty = 1.0;
}

function getAccuracy() {
    if (GAME_STATE.totalHits === 0) return 1.0;
    return GAME_STATE.perfectHits / GAME_STATE.totalHits;
}

function getComboMultiplier() {
    const multiplier = CONFIG.SCORING.COMBO_MULTIPLIER_BASE + 
        (GAME_STATE.combo * CONFIG.SCORING.COMBO_MULTIPLIER_INCREMENT);
    return Math.min(multiplier, CONFIG.SCORING.COMBO_MULTIPLIER_MAX);
}
