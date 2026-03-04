/**
 * Level Manager
 * 
 * Manages the static and procedural data for game levels.
 * Stores level layouts, configurations, and handles parsing of ASCII maps into game objects.
 * 
 * LEVEL FORMAT:
 * - W: Wall
 * - S: Start Position
 * - E: End/Goal Position
 * - .: Empty Space
 */

class LevelManager {
    /**
     * Create a LevelManager instance.
     * Defines all available levels in the constructor.
     */
    constructor() {
        this.levels = [
            // Level 1: Basics
            // A simple room to understand coordinates and movement.
            // Short delay (1000ms) to ease the player in.
            {
                id: 1,
                name: "Initiation",
                width: 15,
                height: 10,
                delay: 1000,
                layout: [
                    "WWWWWWWWWWWWWWW",
                    "WSP.....W.....W",
                    "W.WWWWW.W.WWW.W",
                    "W.W...W...W...W",
                    "W.W.W.WWWWW.W.W",
                    "W...W.......W.W",
                    "WWWWW.WWWWW.W.W",
                    "W.....W...W...W",
                    "W.WWWWW.W.WWWEW",
                    "WWWWWWWWWWWWWWW"
                ]
            },
            // Level 2: Winding
            // Introduces tighter corridors and backtracking.
            // Increased delay (1500ms) requires more memory.
            {
                id: 2,
                name: "Distortion",
                width: 20,
                height: 15,
                delay: 1500,
                layout: [
                    "WWWWWWWWWWWWWWWWWWWW",
                    "WSP......W.........W",
                    "WWWWWW.W.W.WWWWWWW.W",
                    "W......W.W.W.....W.W",
                    "W.WWWWWW.W.W.WWW.W.W",
                    "W.W......W...W...W.W",
                    "W.W.WWWWWWWWWW.WWW.W",
                    "W.W..........W.....W",
                    "W.WWWWWWWWWW.W.WWWWW",
                    "W..........W.W.....W",
                    "WWWWWWWWWW.W.WWWWW.W",
                    "W..........W.....W.W",
                    "W.WWWWWWWWWWWWWW.W.W",
                    "W..................E",
                    "WWWWWWWWWWWWWWWWWWWW"
                ]
            },
            // Level 3: Desync
            // A complex maze with many dead ends.
            // Significant delay (2000ms) forces full strategic planning.
            {
                id: 3,
                name: "Desync",
                width: 20,
                height: 15,
                delay: 2000,
                layout: [
                    "WWWWWWWWWWWWWWWWWWWW",
                    "WSP................W",
                    "W.WWWWWWWWWWWWWWWW.W",
                    "W.W..............W.W",
                    "W.W.WWWWWWWWWWWW.W.W",
                    "W.W.W..........W.W.W",
                    "W.W.W.WWWWWWWW.W.W.W",
                    "W.W.W.W......W.W.W.W",
                    "W.W.W.W.WWWW.W.W.W.W",
                    "W.W.W.W.WE.W.W.W.W.W",
                    "W.W.W.WWWW.W.W.W.W.W",
                    "W.W.W......W.W.W.W.W",
                    "W.W.WWWWWWWW.W.W.W.W",
                    "W.W..........W.....W",
                    "WWWWWWWWWWWWWWWWWWWW"
                ]
            },
            // Level 4: The Void
            // Large open spaces mixed with tight corridors.
            {
                id: 4,
                name: "The Void",
                width: 25,
                height: 20,
                delay: 2500,
                layout: [
                    "WWWWWWWWWWWWWWWWWWWWWWWWW",
                    "WSP.....................W",
                    "W.WWWWWWWWWWWWWWWWWWWWW.W",
                    "W.W...................W.W",
                    "W.W.WWWWWWWWWWWWWWWWW.W.W",
                    "W.W.W...............W.W.W",
                    "W.W.W.WWWWWWWWWWWWW.W.W.W",
                    "W.W.W.W...........W.W.W.W",
                    "W.W.W.W.WWWWWWWWW.W.W.W.W",
                    "W.W.W.W.W.......W.W.W.W.W",
                    "W.W.W.W.W.WWWWW.W.W.W.W.W",
                    "W.W.W.W.W.W...W.W.W.W.W.W",
                    "W.W.W.W.W.W.E.W.W.W.W.W.W",
                    "W.W.W.W.W.WWWWW.W.W.W.W.W",
                    "W.W.W.W.........W.W.W.W.W",
                    "W.W.W.WWWWWWWWWWW.W.W.W.W",
                    "W.W...................W.W",
                    "W.WWWWWWWWWWWWWWWWWWWWW.W",
                    "W.......................W",
                    "WWWWWWWWWWWWWWWWWWWWWWWWW"
                ]
            },
            // Level 5: Shattered
            // A fragmented grid that is disorienting.
            {
                id: 5,
                name: "Shattered",
                width: 25,
                height: 25,
                delay: 3000,
                layout: [
                    "WWWWWWWWWWWWWWWWWWWWWWWWW",
                    "WSP..W...W...W...W.....W",
                    "WWWW.W.W.W.W.W.W.W.WWWWW",
                    "W....W.W.W.W.W.W.W.....W",
                    "W.WWWW.W.W.W.W.W.WWWWW.W",
                    "W.W....W.W.W.W.W.....W.W",
                    "W.W.WWWW.W.W.W.WWWWW.W.W",
                    "W.W.W....W.W.W.....W.W.W",
                    "W.W.W.WWWW.W.WWWWW.W.W.W",
                    "W.W.W.W....W.....W.W.W.W",
                    "W.W.W.W.WWWWWWWW.W.W.W.W",
                    "W.W.W.W.W......W.W.W.W.W",
                    "W.W.W.W.W.WWWW.W.W.W.W.W",
                    "W.W.W.W.W.W..E.W.W.W.W.W",
                    "W.W.W.W.W.WWWWWW.W.W.W.W",
                    "W.W.W.W..........W.W.W.W",
                    "W.W.W.WWWWWWWWWWWW.W.W.W",
                    "W.W.W..............W.W.W",
                    "W.W.WWWWWWWWWWWWWWWW.W.W",
                    "W.W..................W.W",
                    "W.WWWWWWWWWWWWWWWWWWWW.W",
                    "W......................W",
                    "WWWWWWWWWWWWWWWWWWWWWWWWW",
                    "WWWWWWWWWWWWWWWWWWWWWWWWW",
                    "WWWWWWWWWWWWWWWWWWWWWWWWW"
                ]
            }
        ];
    }

    /**
     * Get level data by index (0-based)
     * @param {number} index
     * @returns {Object|null} Parsed level data or null if out of bounds
     */
    getLevel(index) {
        if (index < 0 || index >= this.levels.length) {
            return null;
        }
        return this.parseLevel(this.levels[index]);
    }

    /**
     * Parse text layout into usable objects
     * Converts ASCII grid into coordinate objects.
     * @param {Object} levelData - Raw level definition
     * @returns {Object} Processed level with wall coordinates
     */
    parseLevel(levelData) {
        const parsed = {
            ...levelData,
            walls: [],
            start: { x: 0, y: 0 },
            end: { x: 0, y: 0 }
        };

        for (let y = 0; y < levelData.height; y++) {
            // Safety check for row existence
            if (y >= levelData.layout.length) break;

            const row = levelData.layout[y];
            for (let x = 0; x < levelData.width; x++) {
                // Safety check for char existence
                if (x >= row.length) break;

                const char = row[x];

                // Calculate pixel positions based on grid size
                const px = x * CONFIG.GRID_SIZE;
                const py = y * CONFIG.GRID_SIZE;

                if (char === 'W') {
                    // Wall Block
                    parsed.walls.push({
                        x: px,
                        y: py,
                        w: CONFIG.GRID_SIZE,
                        h: CONFIG.GRID_SIZE
                    });
                } else if (char === 'S') {
                    // Start Position (center of cell)
                    parsed.start = {
                        x: px + CONFIG.GRID_SIZE / 2,
                        y: py + CONFIG.GRID_SIZE / 2
                    };
                } else if (char === 'E') {
                    // End Position (center of cell)
                    parsed.end = {
                        x: px + CONFIG.GRID_SIZE / 2,
                        y: py + CONFIG.GRID_SIZE / 2
                    };
                }
            }
        }
        return parsed;
    }
}
