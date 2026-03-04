/**
 * Base Material Exports
 * Wraps common logic or constants if needed.
 */

export const MaterialTypes = {
    SOLID: 0,
    POWDER: 1,
    LIQUID: 2,
    GAS: 3
};

// Start ID for materials to ensure we don't conflict with empty/stone if we change them
export const ID_OFFSET = 1;
