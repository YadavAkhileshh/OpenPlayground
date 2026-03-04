/**
 * @fileoverview Geology Database for PetRock.
 * Contains a comprehensive collection of rock-related facts, mineral data,
 * and geological eras to provide a rich dataset for the reporting system.
 * This module is designed to give the PetRock "world" significant (though useless) depth.
 * @module GeologyDB
 */

/**
 * @typedef {Object} Mineral
 * @property {string} name - Name of the mineral.
 * @property {number} MohsHardness - Hardness on the Mohs scale.
 * @property {string} crystalSystem - The internal structure of the mineral.
 * @property {string} typicalColor - Common appearance.
 */

/**
 * Array of minerals commonly found in PetRocks.
 * @type {Mineral[]}
 */
export const MINERALS = [
    { name: "Quartz", MohsHardness: 7, crystalSystem: "Trigonal", typicalColor: "Clear/White" },
    { name: "Feldspar", MohsHardness: 6, crystalSystem: "Monoclinic", typicalColor: "Pink/White" },
    { name: "Mica", MohsHardness: 2.5, crystalSystem: "Monoclinic", typicalColor: "Black/Silvery" },
    { name: "Calcite", MohsHardness: 3, crystalSystem: "Trigonal", typicalColor: "White/Yellow" },
    { name: "Pyrite", MohsHardness: 6.5, crystalSystem: "Cubic", typicalColor: "Brass Yellow" },
    { name: "Hematite", MohsHardness: 5.5, crystalSystem: "Hexagonal", typicalColor: "Metallic Gray" },
    { name: "Magnetite", MohsHardness: 6, crystalSystem: "Cubic", typicalColor: "Black" },
    { name: "Graphite", MohsHardness: 1.5, crystalSystem: "Hexagonal", typicalColor: "Dark Gray" },
    { name: "Halite", MohsHardness: 2, crystalSystem: "Cubic", typicalColor: "Clear" },
    { name: "Beryl", MohsHardness: 7.5, crystalSystem: "Hexagonal", typicalColor: "Green/Blue" },
    { name: "Garnet", MohsHardness: 7, crystalSystem: "Cubic", typicalColor: "Deep Red" },
    { name: "Topaz", MohsHardness: 8, crystalSystem: "Orthorhombic", typicalColor: "Yellow/Blue" },
    { name: "Corundum", MohsHardness: 9, crystalSystem: "Hexagonal", typicalColor: "Red/Blue" },
    { name: "Diamond", MohsHardness: 10, crystalSystem: "Cubic", typicalColor: "Clear" },
    { name: "Obsidian", MohsHardness: 5.5, crystalSystem: "Amorphous", typicalColor: "Black" },
    { name: "Apatite", MohsHardness: 5, crystalSystem: "Hexagonal", typicalColor: "Green/Yellow" },
    { name: "Fluorite", MohsHardness: 4, crystalSystem: "Cubic", typicalColor: "Purple/Green" },
    { name: "Talc", MohsHardness: 1, crystalSystem: "Monoclinic", typicalColor: "White" },
    { name: "Gypsum", MohsHardness: 2, crystalSystem: "Monoclinic", typicalColor: "Clear/White" },
    { name: "Orthoclase", MohsHardness: 6, crystalSystem: "Monoclinic", typicalColor: "Flesh-colored" }
];

/**
 * Descriptive strings for different types of rock foundations.
 * @type {string[]}
 */
export const ROCK_TYPES = [
    "Igneous - Formed from cooled magma. Very intense background.",
    "Sedimentary - Formed from compressed layers. Has a lot of history.",
    "Metamorphic - Formed under pressure. Very resilient attitude.",
    "Extraterrestrial - Likely fell from the sky. Feels alienated.",
    "Unknown - Might technically be a very hard piece of bread.",
    "Glacial - Travelled a long way inside an ice sheet.",
    "Volcanic - Born in fire, lives in silence.",
    "Fossil-bearing - Might have a tiny secret inside.",
    "River-bed - Smooth to the touch, rough on the history."
];

/**
 * Humorous "History" events for the rock spanning millions of years.
 * @type {string[]}
 */
export const GEOLOGICAL_EVENTS = [
    "400 Million Years Ago: The rock sat perfectly still.",
    "250 Million Years Ago: A dinosaur walked past. The rock was unimpressed.",
    "100 Million Years Ago: Tectonic shifts moved the rock 2 inches. Thrilling.",
    "65 Million Years Ago: Asteroid impact. The rock maintained its composure.",
    "10 Million Years Ago: Erosion attempted to wear the rock down. It failed.",
    "1 Million Years Ago: Ice age. The rock enjoyed the cold.",
    "Last Tuesday: You bought the rock. Life changed forever (for you).",
    "Yesterday: A slight breeze blew. The rock successfully resisted it.",
    "Tomorrow: Probable state: Still a rock.",
    "In 1 Billion Years: The rock may become dust. Or remain a rock. Optimistic.",
    "The 1800s: The rock was used as a doorstop. It was very reliable.",
    "Ancient Greece: A philosopher looked at the rock. The rock didn't blink.",
    "The Jurassic: A stegosaurus sat on the rock. It was slightly compressed.",
    "The Triassic: The rock was slightly warmer than average.",
    "The Carboniferous: Ferns grew nearby. The rock watched them turn to coal."
];

/**
 * Gets a random mineral from the database.
 * @returns {Mineral}
 */
export function getRandomMineral() {
    return MINERALS[Math.floor(Math.random() * MINERALS.length)];
}

/**
 * Gets a random geological event.
 * @returns {string}
 */
export function getRandomHistory() {
    return GEOLOGICAL_EVENTS[Math.floor(Math.random() * GEOLOGICAL_EVENTS.length)];
}

/**
 * Returns a detailed string describing a specific mineral.
 * @param {string} mineralName - Name of the mineral to look up.
 * @returns {string} Detailed description.
 */
export function getMineralDescription(mineralName) {
    const min = MINERALS.find(m => m.name === mineralName);
    if (!min) return "An unidentified mystery mineral.";

    return `The mineral ${min.name} has a Mohs hardness of ${min.MohsHardness}. ` +
        `It typically appears ${min.typicalColor} and structured in a ${min.crystalSystem} system.`;
}

/**
 * Calculates the theoretical geological value of the rock.
 * (Returns exactly 0, as it is a pet rock).
 * @returns {number}
 */
export function calculateMarketValue() {
    // Advanced economics simulation
    const demand = 1.0;
    const supply = Infinity;
    const sentimentalValue = 1000000;

    return (demand / supply) * sentimentalValue; // Result is basically 0
}
