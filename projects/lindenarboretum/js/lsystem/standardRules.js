/**
 * LindenArboretum - Standard Rules Module
 * Predefined terrestrial and baseline L-System rules.
 * 
 * =========================================================================
 * UNDERSTANDING L-SYSTEM GRAMMARS:
 * 
 * Axiom: The starting string.
 * Rules: Productions that replace variables with other strings.
 * Angle: The turning increment for the turtle commands '+' and '-'.
 * Depth: The number of recursive replacements.
 * baseHue: The starting HSL hue for rendering color profiles.
 * windStrength: Default physical turbulence.
 * 
 * =========================================================================
 * RULE STRUCTURE AND SYNTAX GUIDE:
 * 
 * V (Variables): 
 *  'F' - Draw a line forward.
 *  'f' - Move forward without drawing (useful for gaps/spacing).
 *  'X', 'Y', 'Z' - Placeholders used to define the structure of branches 
 *                  but do not actually draw anything directly. They act 
 *                  like invisible growth nodes.
 * 
 * S (Constants):
 *  '+' - Turn the turtle counter-clockwise by 'angle'.
 *  '-' - Turn the turtle clockwise by 'angle'.
 *  '[' - Push current state (position, angle, thickness) to the stack.
 *        Represents the start of a new sub-branch.
 *  ']' - Pop state from the stack.
 *        Represents returning to the junction where the branch started.
 * 
 * =========================================================================
 * EXAMPLE: Terrestrial (A basic procedural plant structure)
 * 
 * Axiom: X
 * Rules:
 *   X -> F+[[X]-X]-F[-FX]+X
 *   F -> FF
 * 
 * What happens?
 * In iteration 1, X explodes into a complex set of branches holding
 * new X nodes at the tips. The F line doubles in length (FF).
 * This causes rapid, dense outward growth resembling a bush or small tree.
 */

export const PRESETS_STANDARD = {
    terrestrial: {
        axiom: "X",
        rules: [
            "X -> F+[[X]-X]-F[-FX]+X",
            "F -> FF"
        ],
        angle: 25,
        depth: 6,
        baseHue: 120,    // Standard Green typical of oak foliage
        windStrength: 0.5
    },

    // A more symmetric, classical canopy tree structure
    fractalCanopy: {
        axiom: "F",
        rules: [
            "F -> F[+F]F[-F]F"
        ],
        // The angle 25.7 is an irrational-feeling number that prevents
        // branches from overlapping perfectly, giving it a more organic feel.
        angle: 25.7,
        depth: 5,
        baseHue: 140, // Forest Green
        windStrength: 0.8 // A bit looser in the wind
    },

    // The famous Dragon Curve. Included as a mathematical curiosity.
    // Notice how it doesn't look like a plant at all, because it lacks
    // push/pop branching modifiers `[` and `]`.
    dragonCurve: {
        axiom: "FX",
        rules: [
            "X -> X+YF+",
            "Y -> -FX-Y"
        ],
        angle: 90,
        // Since it doesn't branch exponentially (it's a continuous line),
        // it can safely endure much higher depth bounds (10) without crashing.
        depth: 10,
        baseHue: 45, // Gold
        windStrength: 0.0 // Set to zero because math curves shouldn't sway in wind
    }
};
