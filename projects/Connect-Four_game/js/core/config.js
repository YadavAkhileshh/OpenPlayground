/**
 * Global Configuration and Constants
 */

/**
 * Global Configuration and Constants
 * 
 * Defines all material IDs, simulation constants, and color mappings.
 * This file serves as the single source of truth for numeric IDs to ensure consistency.
 */
export const Config = {
    // Grid settings
    WIDTH: 600,
    HEIGHT: 400,
    GRAVITY: 1,

    // Material IDs - these must match the rendering palettes
    MATERIALS: {
        EMPTY: 0,
        SAND: 1,
        WATER: 2,
        STONE: 3,
        FIRE: 4,
        SMOKE: 5,
        WOOD: 6,
        PLANT: 7,
        ACID: 8,
        OIL: 9,
        ICE: 10,
        STEAM: 11,
        LAVA: 12,
        GUNPOWDER: 13,
        SEED: 14,
        C4: 15,
        VIRUS: 16,
        MITHRIL: 17, // Conductor
        DISCO: 18,
        SPOUT_WATER: 19,
        SPOUT_SAND: 20,
        VOID: 21, // Black Hole
        LIFE: 22, // Game of Life
        CRYSTAL: 23,
        FUSE: 24,
        SPARK: 25,
        OIL: 26
    },

    // Physics parameters
    CHANCE_TO_IGNITE: 0.1,
    FIRE_LIFE_MIN: 20,
    FIRE_LIFE_MAX: 100,
    PLANT_GROWTH_RATE: 0.05,
};

export const Colors = {
    // 0xAABBGGRR format for Uint32 Little Endian (which is standard for canvas)
    // So 0xFFAA00FF is Alpha=FF, Blue=00, Green=AA, Red=FF -> Red/Orange

    [Config.MATERIALS.EMPTY]: 0xFF000000,
    [Config.MATERIALS.SAND]: 0xFF60A4F4, // #f4a460 (reversed hex roughly for LE)
    [Config.MATERIALS.WATER]: 0xFFE16941, // #4169e1
    [Config.MATERIALS.STONE]: 0xFF808080,
    [Config.MATERIALS.FIRE]: 0xFF0055FF, // Orange-ish
    [Config.MATERIALS.SMOKE]: 0xFF696969,
    [Config.MATERIALS.WOOD]: 0xFF13458B,
    [Config.MATERIALS.PLANT]: 0xFF228B22,
    [Config.MATERIALS.ACID]: 0xFF00FF7F,
    [Config.MATERIALS.OIL]: 0xFF112233,
    [Config.MATERIALS.ICE]: 0xFFF3F2A5,
    [Config.MATERIALS.STEAM]: 0xFFDCDCDC,
    [Config.MATERIALS.LAVA]: 0xFF2010CF,
    [Config.MATERIALS.GUNPOWDER]: 0xFF444444,
    [Config.MATERIALS.SEED]: 0xFF2E8B57,
    [Config.MATERIALS.C4]: 0xFF2F2F2F, // Dark Grey
    [Config.MATERIALS.VIRUS]: 0xFF880088, // Purple
    [Config.MATERIALS.MITHRIL]: 0xFFE0E0E0, // Bright Silver
    [Config.MATERIALS.DISCO]: 0xFFFFFFFF,
    [Config.MATERIALS.SPOUT_WATER]: 0xFFA0A0FF,
    [Config.MATERIALS.SPOUT_SAND]: 0xFFFFD700,
    [Config.MATERIALS.VOID]: 0xFF000000,
    [Config.MATERIALS.LIFE]: 0xFF00FF00,
    [Config.MATERIALS.CRYSTAL]: 0xFFFFFFCC,
    [Config.MATERIALS.FUSE]: 0xFF225511,
    [Config.MATERIALS.SPARK]: 0xFFFFFF00, // Yellow
    [Config.MATERIALS.OIL]: 0xFF0BDA51, // Slippery Green/Brown? Actually Oil is usually dark gold. 0xFF808000
    // Let's go with Dark Goldenrod
    [Config.MATERIALS.OIL]: 0xFF2A2AA5, // Wait, ABGR... A5 2A 2A = Brown ish


};

// Helper to define material properties (density, flammability, etc if needed)
export const MaterialProps = {
    [Config.MATERIALS.SAND]: { density: 10, flammable: false },
    [Config.MATERIALS.WATER]: { density: 5, flammable: false },
    [Config.MATERIALS.OIL]: { density: 4, flammable: true, burnTemp: 50 },
    // ... extensive props can be added here
};