export const CONFIG = {
    // Display
    FOV: 80 * (Math.PI / 180),
    WIDTH: 0,
    HEIGHT: 0,
    RESOLUTION: 0.5, // Keep low for performance

    // World
    CHUNK_SIZE: 16,
    CHUNK_HEIGHT: 32,
    RENDER_DISTANCE: 4,
    BLOCK_SIZE: 1,

    // Physics
    MOVEMENT_SPEED: 5.0,
    RUN_SPEED: 10.0,
    ROTATION_SPEED: 2.0,
    PLAYER_HEIGHT: 1.6,

    MAX_RAY_DEPTH: 64,
    TARGET_FPS: 60
};

export const BLOCKS = {
    AIR: 0,
    GRASS: 1,
    DIRT: 2,
    STONE: 3,
    WOOD: 4,
    LEAVES: 5,
    WATER: 6,
    SAND: 7,
};

export const PALETTE = {
    [BLOCKS.GRASS]: [50, 205, 50],   // Lime Green
    [BLOCKS.DIRT]: [139, 69, 19],    // Saddle Brown
    [BLOCKS.STONE]: [128, 128, 128], // Gray
    [BLOCKS.WOOD]: [160, 82, 45],    // Sienna
    [BLOCKS.LEAVES]: [34, 139, 34],  // Forest Green
    [BLOCKS.WATER]: [0, 191, 255],   // Deep Sky Blue
    [BLOCKS.SAND]: [238, 214, 175]   // Tan
};
