/* js/core/config.js */

/**
 * Global Configuration Object for ArcaneSigil
 * Manages all application-level constants and parameters.
 */
const CONFIG = {
    // Editor configs
    EDITOR: {
        FONT_FAMILY: "'Courier New', Courier, monospace",
        FONT_SIZE: "16px",
        TAB_SIZE: 4,
        DEFAULT_CODE: `// Initialize Sigil Matrix\nlet matrixPower = 100;\n\nfor (let i = 0; i < 5; i = i + 1) {\n    if (matrixPower > 50) {\n        print("Resonating channel: " + i);\n    } else {\n        print("Channel closed.");\n    }\n}\n`
    },

    // Rendering params
    RENDERER: {
        FPS: 60,
        BACKGROUND_COLOR: "#0A0B10", // Dark slate/void
        CORE_COLOR: "#00FFCC", // Cyan magical glow
        RING_COLOR: "rgba(0, 255, 204, 0.4)",
        BRANCH_COLOR: "rgba(255, 100, 255, 0.6)",
        NODE_GLOW_BLUR: 15,
        BASE_RADIUS_STEP: 60,   // Spread of AST depth rings
        ROTATION_SPEED_BASE: 0.005, // Radians per frame
        MAX_RINGS: 12           // Safeguard against deep recursion rendering
    },

    // execution engine config
    EXECUTION: {
        MAX_LOOP_ITERATIONS: 10000, // protect against infinite loops
        ALLOW_GLOBAL_SCOPE_POLLUTION: false
    },

    // System settings
    SYSTEM: {
        DEBUG_MODE: true,
        LOG_LEVEL: 1 // 0: None, 1: Error, 2: Info, 3: Debug
    }
};

/**
 * Freezes the configuration objects to prevent accidental modification at runtime.
 */
Object.freeze(CONFIG.EDITOR);
Object.freeze(CONFIG.RENDERER);
Object.freeze(CONFIG.EXECUTION);
Object.freeze(CONFIG.SYSTEM);
Object.freeze(CONFIG);
