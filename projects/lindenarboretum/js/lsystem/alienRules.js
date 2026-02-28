/**
 * LindenArboretum - Alien Rules Module
 * Predefined extraterrestrial and organic-looking L-System rules.
 * Uses angles, constants, and complex fractal branching for "alien weed" looks.
 */

export const PRESETS_ALIEN = {
    alienWeed: {
        axiom: "X",
        rules: [
            "X -> F-[[X]+X]+F[+FX]-X",
            "F -> FF"
        ],
        angle: 22.5,
        depth: 5,
        baseHue: 160,    // Cyan-Green
        windStrength: 0.6
    },
    crystalTree: {
        axiom: "F",
        rules: [
            "F -> FF-[-F+F+F]+[+F-F-F]"
        ],
        angle: 22.5,
        depth: 4,
        baseHue: 280, // Purple
        windStrength: 0.3
    },
    neonFern: {
        axiom: "X",
        rules: [
            "X -> F+[[X]-X]-F[-FX]+X",
            "F -> F[+F][-F]" // Alternative fern-like logic
        ],
        angle: 25,
        depth: 6,
        baseHue: 320, // Pink
        windStrength: 0.8
    }
};
