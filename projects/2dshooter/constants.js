// Game constants - no magic numbers
const CONSTANTS = {
    // Canvas
    CANVAS_WIDTH: 800,
    CANVAS_HEIGHT: 600,

    // Player
    PLAYER_SIZE: 24,
    PLAYER_SPEED: 320, // pixels per second
    PLAYER_COLOR: '#4A9EFF',
    PLAYER_BORDER_COLOR: '#2A5E9F',

    // Enemy
    ENEMY_SIZE: 36,
    ENEMY_BASE_COLOR: '#FF4A4A',
    ENEMY_TURRET_COLOR: '#CC2A2A',
    ENEMY_TURRET_LENGTH: 40,
    ENEMY_ROTATION_SPEED: 0.1, // radians per frame
    ENEMY_MOVE_SPEED: 150, // pixels per second
    ENEMY_DODGE_RANGE: 200, // pixels detection range

    // Bullets
    BULLET_RADIUS: 6,
    BULLET_SPEED: 450, // pixels per second
    ENEMY_BULLET_COLOR: '#FF9E4A',
    PLAYER_BULLET_COLOR: '#4AFF9E',

    // Enemy Learning
    PLAYER_POSITION_HISTORY_SIZE: 20, // How many positions to track
    MAX_LEARNING_RATE: 0.3,
    MIN_LEARNING_RATE: 0.05,
    MAX_OFFSET_CLAMP: 100, // pixels
    MIN_OFFSET_CLAMP: 10,
    BASE_LEAD_TIME: 0.8, // seconds to predict ahead
    AIM_NOISE_RANGE: 15, // pixels of random offset

    // Game
    ENEMY_FIRE_RATE: 1.2, // seconds between shots
    PLAYER_SHOOT_COOLDOWN: 0.3, // seconds
    INITIAL_PLAYER_HEALTH: 3,
    INITIAL_ENEMY_HEALTH: 10,

    // Visual
    UI_FONT: '16px "Segoe UI", Arial, sans-serif',
    UI_TEXT_COLOR: '#F0F0F0',
    UI_BACKGROUND: 'rgba(20, 20, 30, 0.7)',
    UI_BORDER_COLOR: '#4A4A6A',

    // Colors
    BACKGROUND_COLOR: '#1A1A2E',
    GRID_COLOR: 'rgba(100, 100, 150, 0.1)',
    HEALTH_BAR_BACKGROUND: '#4A4A6A',
    PLAYER_HEALTH_BAR: '#4AFF9E',
    ENEMY_HEALTH_BAR: '#FF9E4A'
};