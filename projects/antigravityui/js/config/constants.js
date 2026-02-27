// js/config/constants.js

export const PHYSICS = {
    // Inverted Gravity points upwards (negative Y in screen space)
    GRAVITY: { x: 0, y: -0.15 },
    DAMPING: 0.98, // Air resistance/friction
    REPULSION_RADIUS: 250, // Cursor repulsion radius
    REPULSION_FORCE: 0.8,
    BOUNCE: 0.5, // Restitution coefficient on collision
    RESTING_VELOCITY: 0.01,
    MAX_VELOCITY: 25,
    WALL_BOUNCE: 0.6
};

export const TIME = {
    FIXED_DELTA: 1000 / 60, // 60 FPS target
    MAX_DELTA: 100 // Cap delta to prevent huge jumps if tab is backgrounded
};

export const LAYOUT = {
    Z_INDEX_BASE: 10,
    PADDING: 20
};
