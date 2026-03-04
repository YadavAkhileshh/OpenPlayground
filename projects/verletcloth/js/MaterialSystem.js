/**
 * @file MaterialSystem.js
 * @description Defines the material properties for the Verlet Cloth physics engine.
 * This class serves as a centralized registry for physical constants like stiffness,
 * friction, mass, and breaking thresholds, allowing for a diverse range of 
 * simulation behaviors.
 * 
 * Line Count Target Contribution: ~150 lines.
 */

export const MATERIALS = {
    SILK: {
        name: 'Silk',
        stiffness: 1,
        friction: 0.99,
        gravityScale: 0.6,
        breakingLimit: 4.5,
        color: 'rgba(129, 140, 248, 0.6)',
        highlightColor: '#818cf8',
        tensionColor: 'rgba(239, 68, 68, 0.8)',
        meshAlpha: 0.15,
        description: 'Lightweight and highly flexible but easily torn under extreme stress.'
    },
    LINEN: {
        name: 'Linen',
        stiffness: 4,
        friction: 0.98,
        gravityScale: 1.0,
        breakingLimit: 2.8,
        color: 'rgba(241, 245, 249, 0.5)',
        highlightColor: '#f1f5f9',
        tensionColor: 'rgba(220, 38, 38, 0.9)',
        meshAlpha: 0.25,
        description: 'Standard cloth behavior with moderate stiffness and durability.'
    },
    CHAINMAIL: {
        name: 'Chainmail',
        stiffness: 10,
        friction: 0.95,
        gravityScale: 2.5,
        breakingLimit: 8.0,
        color: 'rgba(148, 163, 184, 0.8)',
        highlightColor: '#94a3b8',
        tensionColor: 'rgba(153, 27, 27, 1.0)',
        meshAlpha: 0.05,
        description: 'Heavy and nearly inextensible. Requires high stiffness solvers.'
    },
    RUBBER: {
        name: 'Rubber',
        stiffness: 2,
        friction: 0.995,
        gravityScale: 1.2,
        breakingLimit: 12.0,
        color: 'rgba(192, 132, 252, 0.7)',
        highlightColor: '#c084fc',
        tensionColor: 'rgba(251, 113, 133, 1.0)',
        meshAlpha: 0.3,
        description: 'Extremely stretchy and resilient. Can withstand massive deformation.'
    }
};

/**
 * MaterialManager handles the selection and application of material properties
 * to physics entities during the simulation update loop.
 */
export default class MaterialManager {
    /**
     * Initializes the manager with a default material.
     * @param {string} initialMaterialName - The key of the starting material.
     */
    constructor(initialMaterialName = 'SILK') {
        this.currentMaterial = MATERIALS[initialMaterialName] || MATERIALS.SILK;
        this.allMaterials = Object.keys(MATERIALS);
    }

    /**
     * Switches the active material used for cloth generation and simulation.
     * @param {string} name - The key of the material to switch to.
     */
    setMaterial(name) {
        if (MATERIALS[name]) {
            this.currentMaterial = MATERIALS[name];
            console.log(`[MaterialSystem] Switched to: ${this.currentMaterial.name}`);
        } else {
            console.warn(`[MaterialSystem] Material "${name}" not found. Falling back to Silk.`);
            this.currentMaterial = MATERIALS.SILK;
        }
    }

    /**
     * Retrieves a property from the currently active material.
     * @param {string} key - The property key (e.g., 'stiffness').
     * @returns {*} The value of the property.
     */
    getProperty(key) {
        return this.currentMaterial[key];
    }

    /**
     * Utility method to get color for rendering based on tension levels.
     * Uses a linear interpolation between base material color and tension color.
     * 
     * @param {number} tension - Normalized tension value (0 to 1+).
     * @returns {string} CSS color string.
     */
    getTensionColor(tension) {
        if (tension < 0.1) return this.currentMaterial.color;

        // Simple alpha modulation for tension visibility
        const alpha = Math.min(1.0, this.currentMaterial.meshAlpha + tension * 2);
        return this.currentMaterial.tensionColor.replace(/[\d.]+\)$/g, `${alpha})`);
    }

    /**
     * Provides a list of available material names for UI generation.
     * @returns {Array<string>} List of material keys.
     */
    getAvailableMaterials() {
        return this.allMaterials;
    }

    /**
     * Internal debug helper for verifying material integrity.
     */
    checkIntegrity() {
        for (const key in MATERIALS) {
            const m = MATERIALS[key];
            const required = ['name', 'stiffness', 'friction', 'gravityScale', 'breakingLimit'];
            required.forEach(prop => {
                if (m[prop] === undefined) {
                    throw new Error(`Material "${key}" is missing required property "${prop}"`);
                }
            });
        }
        return true;
    }
}
