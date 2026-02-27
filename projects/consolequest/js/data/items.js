export const ITEMS = {
    // Consumables
    POTION_SMALL: {
        id: 'potion_small',
        name: 'Small Potion',
        type: 'consumable',
        effect: { type: 'heal', value: 20 },
        desc: 'Restores 20 HP.'
    },
    POTION_LARGE: {
        id: 'potion_large',
        name: 'Large Potion',
        type: 'consumable',
        effect: { type: 'heal', value: 50 },
        desc: 'Restores 50 HP.'
    },
    ELIXIR: {
        id: 'elixir',
        name: 'Elixir of Life',
        type: 'consumable',
        effect: { type: 'heal', value: 999 },
        desc: 'Fully restores health.'
    },
    SCROLL_FIREBALL: {
        id: 'scroll_fireball',
        name: 'Scroll of Fireball',
        type: 'consumable',
        effect: { type: 'damage', value: 50 },
        desc: 'Deals 50 damage.'
    },
    SCROLL_ICE: {
        id: 'scroll_ice',
        name: 'Scroll of Ice',
        type: 'consumable',
        effect: { type: 'damage', value: 30 },
        desc: 'Deals 30 damage and chills (not really).'
    },

    // Weapons
    SWORD_WOODEN: {
        id: 'sword_wooden',
        name: 'Wooden Sword',
        type: 'weapon',
        damage: 5,
        desc: 'Basic practice sword.'
    },
    SWORD_IRON: {
        id: 'sword_iron',
        name: 'Iron Sword',
        type: 'weapon',
        damage: 10,
        desc: 'Standard adventurer gear.'
    },
    SWORD_STEEL: {
        id: 'sword_steel',
        name: 'Steel Sword',
        type: 'weapon',
        damage: 15,
        desc: 'Sharp and reliable.'
    },
    AXE_BATTLE: {
        id: 'axe_battle',
        name: 'Battle Axe',
        type: 'weapon',
        damage: 18,
        desc: 'Heavy but powerful.'
    },
    DAGGER_POISON: {
        id: 'dagger_poison',
        name: 'Poison Dagger',
        type: 'weapon',
        damage: 8,
        desc: 'Glows with a sickly green light.'
    },

    // Armor
    SHIELD_BUCKLER: {
        id: 'shield_buckler',
        name: 'Buckler',
        type: 'armor',
        defense: 2,
        desc: 'Small wooden shield.'
    },
    SHIELD_KITE: {
        id: 'shield_kite',
        name: 'Kite Shield',
        type: 'armor',
        defense: 5,
        desc: 'Protects the full body.'
    },
    ARMOR_LEATHER: {
        id: 'armor_leather',
        name: 'Leather Armor',
        type: 'armor',
        defense: 3,
        desc: 'Light and flexible.'
    },
    ARMOR_CHAINMAIL: {
        id: 'armor_chainmail',
        name: 'Chainmail',
        type: 'armor',
        defense: 7,
        desc: 'Interlocking metal rings.'
    },
    ARMOR_PLATE: {
        id: 'armor_plate',
        name: 'Plate Armor',
        type: 'armor',
        defense: 12,
        desc: 'Heavy steel plating.'
    },

    // Key Items
    KEY_RUSTY: {
        id: 'key_rusty',
        name: 'Rusty Key',
        type: 'key',
        desc: 'Opens simple doors.'
    },
    KEY_GOLDEN: {
        id: 'key_golden',
        name: 'Golden Key',
        type: 'key',
        desc: 'Opens the treasure room.'
    },
    MAP_DUNGEON: {
        id: 'map_dungeon',
        name: 'Dungeon Map',
        type: 'key',
        desc: 'Reveals the layout.'
    }
};
