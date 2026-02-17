/**
 * CONFIG.JS - Game Configuration and Constants
 * Contains all game balance variables, colors, speeds, and settings
 */

const CONFIG = {
  // Canvas Settings
  CANVAS: {
    WIDTH: 800,
    HEIGHT: 600,
    BACKGROUND_COLOR: "#000000",
  },

  // Player Configuration
  PLAYER: {
    SIZE: 30,
    SPEED: 5,
    COLOR: "#00ffff",
    GLOW_COLOR: "#00ffff",
    TRAIL_COLOR: "rgba(0, 255, 255, 0.3)",
    START_X: 400,
    START_Y: 500,
  },

  // Obstacle Configuration
  OBSTACLES: {
    MIN_SIZE: 20,
    MAX_SIZE: 50,
    MIN_SPEED: 2,
    MAX_SPEED: 6,
    SPAWN_RATE: 1000, // milliseconds between spawns
    SPEED_INCREASE_RATE: 0.0001, // speed increase per frame
    SPAWN_RATE_DECREASE: 0.99, // multiplier for spawn rate over time
    COLORS: ["#ff0000", "#ff00ff", "#ff6600", "#ff0066"],
  },

  // Gold Coin Configuration
  GOLD: {
    SIZE: 20,
    SPEED: 3,
    SPAWN_RATE: 2000, // milliseconds between spawns
    COLOR: "#ffff00",
    GLOW_COLOR: "#ffaa00",
    POINTS: 10,
    SPAWN_CHANCE: 0.7, // 70% chance to spawn when timer triggers
  },

  // Particle Effects Configuration
  PARTICLES: {
    COLLISION_COUNT: 20,
    COLLECTION_COUNT: 10,
    SIZE: 3,
    SPEED: 3,
    LIFETIME: 30, // frames
    COLORS: {
      COLLISION: "#ff0000",
      COLLECTION: "#ffff00",
    },
  },

  // Scoring Configuration
  SCORING: {
    POINTS_PER_SECOND: 10,
    GOLD_BONUS: 10,
    DIFFICULTY_MULTIPLIER: 1.5, // score multiplier as difficulty increases
  },

  // Game Physics
  PHYSICS: {
    FRICTION: 0.95,
    ACCELERATION: 0.8,
  },

  // Visual Effects
  EFFECTS: {
    GLOW_INTENSITY: 15,
    TRAIL_LENGTH: 5,
    SHAKE_INTENSITY: 10,
    SHAKE_DURATION: 10, // frames
  },

  // Difficulty Progression
  DIFFICULTY: {
    INITIAL_LEVEL: 1,
    MAX_LEVEL: 10,
    TIME_PER_LEVEL: 15, // seconds to increase difficulty
    SPEED_MULTIPLIER_PER_LEVEL: 1.2,
    SPAWN_MULTIPLIER_PER_LEVEL: 0.85,
  },

  // Game States
  GAME_STATES: {
    MENU: "menu",
    PLAYING: "playing",
    PAUSED: "paused",
    GAME_OVER: "gameover",
  },

  // Input Keys
  KEYS: {
    LEFT: ["ArrowLeft", "a", "A"],
    RIGHT: ["ArrowRight", "d", "D"],
    UP: ["ArrowUp", "w", "W"],
    DOWN: ["ArrowDown", "s", "S"],
    PAUSE: [" ", "p", "P", "Escape"],
  },

  // Audio Settings (for future enhancement)
  AUDIO: {
    ENABLED: false,
    VOLUME: 0.5,
  },

  // Debug Mode
  DEBUG: {
    ENABLED: false,
    SHOW_HITBOXES: false,
    SHOW_FPS: false,
  },
};

// Helper function to get random value in range
CONFIG.randomInRange = (min, max) => {
  return Math.random() * (max - min) + min;
};

// Helper function to get random color from array
CONFIG.randomColor = (colorArray) => {
  return colorArray[Math.floor(Math.random() * colorArray.length)];
};

// Helper function to check if key is in group
CONFIG.isKeyInGroup = (key, group) => {
  return CONFIG.KEYS[group].includes(key);
};

// Export CONFIG for use in other modules
if (typeof module !== "undefined" && module.exports) {
  module.exports = CONFIG;
}
