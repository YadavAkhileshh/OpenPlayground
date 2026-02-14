/**
 * Levels.js
 * 
 * Configuration for game levels/waves.
 */

export const LEVELS = [
    {
        id: 1,
        name: "Training Ground",
        startMessage: "Use SHORT press to Move. LONG press to Attack.",
        spawnRate: 3000,
        enemies: [
            { type: 'BASIC', count: 3, delay: 1000 },
            { type: 'BASIC', count: 2, delay: 5000 }
        ]
    },
    {
        id: 2,
        name: "First Wave",
        startMessage: "Watch out for Scouts!",
        spawnRate: 2500,
        enemies: [
            { type: 'BASIC', count: 5, delay: 0 },
            { type: 'SCOUT', count: 2, delay: 10000 }
        ]
    },
    {
        id: 3,
        name: "Heavy Hitters",
        startMessage: "Double press to DASH through danger!",
        spawnRate: 2000,
        enemies: [
            { type: 'TANK', count: 1, delay: 0 },
            { type: 'BASIC', count: 10, delay: 5000 }
        ]
    },
    {
        id: 4,
        name: "Swarm",
        startMessage: "Survive.",
        spawnRate: 1000,
        enemies: [
            { type: 'SCOUT', count: 10, delay: 0 },
            { type: 'BASIC', count: 10, delay: 15000 },
            { type: 'TANK', count: 2, delay: 30000 }
        ]
    }
];
