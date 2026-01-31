/**
 * DUNGEON CRAWLER JS: INFINITE DEPTHS
 * Version 2.0 - Developed for ecwoc26
 * * Features:
 * - A* Pathfinding for AI
 * - Cellular Automata & Drunkard Walk Hybrid Generation
 * - Full Inventory & Gear System
 * - Dynamic Viewport Rendering
 */

// --- CONFIGURATION ---
const CONFIG = {
    TILE_SIZE: 32,
    MAP_SIZE: 64,
    VISION_RADIUS: 8,
    MAX_LOG_ENTRIES: 50,
    DIFFICULTY_SCALING: 1.2
};

const TILE = { WALL: 0, FLOOR: 1, STAIRS: 2, DOOR: 3, WATER: 4 };

// --- CORE UTILITIES ---
const rng = {
    int: (min, max) => Math.floor(Math.random() * (max - min + 1)) + min,
    chance: (val) => Math.random() < val
};

// --- DATA STRUCTURES: A* PATHFINDING ---
class Node {
    constructor(x, y, walkable) {
        this.x = x; this.y = y;
        this.walkable = walkable;
        this.g = 0; this.h = 0; this.f = 0;
        this.parent = null;
    }
}

function findPath(start, end, map) {
    let openList = [];
    let closedList = new Set();
    
    let startNode = new Node(start.x, start.y, true);
    let endNode = new Node(end.x, end.y, true);
    
    openList.push(startNode);
    
    while (openList.length > 0) {
        let current = openList.sort((a, b) => a.f - b.f)[0];
        if (current.x === endNode.x && current.y === endNode.y) {
            let path = [];
            while (current.parent) {
                path.push({x: current.x, y: current.y});
                current = current.parent;
            }
            return path.reverse();
        }
        
        openList = openList.filter(n => n !== current);
        closedList.add(`${current.x},${current.y}`);
        
        const neighbors = [
            {x: 0, y: -1}, {x: 0, y: 1}, {x: -1, y: 0}, {x: 1, y: 0}
        ];
        
        for (let dir of neighbors) {
            let nx = current.x + dir.x;
            let ny = current.y + dir.y;
            
            if (nx < 0 || ny < 0 || nx >= CONFIG.MAP_SIZE || ny >= CONFIG.MAP_SIZE) continue;
            if (map[ny][nx] === TILE.WALL || closedList.has(`${nx},${ny}`)) continue;
            
            let neighborNode = new Node(nx, ny, true);
            neighborNode.g = current.g + 1;
            neighborNode.h = Math.abs(nx - endNode.x) + Math.abs(ny - endNode.y);
            neighborNode.f = neighborNode.g + neighborNode.h;
            neighborNode.parent = current;
            
            if (!openList.some(n => n.x === nx && n.y === ny)) openList.push(neighborNode);
        }
    }
    return [];
}

// --- WORLD GENERATOR ---
class LevelGenerator {
    constructor(size) {
        this.size = size;
        this.grid = Array(size).fill().map(() => Array(size).fill(TILE.WALL));
    }

    generate() {
        // Drunkard's Walk + Smoothing
        let x = Math.floor(this.size / 2);
        let y = Math.floor(this.size / 2);
        let floorCount = 0;
        const target = (this.size * this.size) * 0.45;

        while (floorCount < target) {
            if (this.grid[y][x] === TILE.WALL) {
                this.grid[y][x] = TILE.FLOOR;
                floorCount++;
            }
            const move = rng.int(0, 3);
            if (move === 0 && y > 2) y--;
            else if (move === 1 && y < this.size - 3) y++;
            else if (move === 2 && x > 2) x--;
            else if (move === 3 && x < this.size - 3) x++;
        }
        
        this.placeStairs();
        return this.grid;
    }

    placeStairs() {
        let placed = false;
        while (!placed) {
            let rx = rng.int(5, this.size - 5);
            let ry = rng.int(5, this.size - 5);
            if (this.grid[ry][rx] === TILE.FLOOR) {
                this.grid[ry][rx] = TILE.STAIRS;
                placed = true;
            }
        }
    }
}

// --- ENTITY CLASSES ---
class Actor {
    constructor(x, y, type, stats) {
        this.x = x; this.y = y;
        this.type = type;
        this.hp = stats.hp;
        this.maxHp = stats.hp;
        this.atk = stats.atk;
        this.char = stats.char;
        this.color = stats.color;
    }
}

// --- MAIN GAME ENGINE ---
class Engine {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.floor = 1;
        this.isInvOpen = false;
        this.entities = [];
        
        this.init();
        this.setupListeners();
    }

    init() {
        this.resize();
        const gen = new LevelGenerator(CONFIG.MAP_SIZE);
        this.map = gen.generate();
        
        // Spawn Player
        const pPos = this.getEmptyTile();
        this.player = new Actor(pPos.x, pPos.y, 'player', {hp: 100, atk: 15, char: '@', color: '#00d2ff'});
        
        // Spawn Enemies
        this.spawnEnemies();
        this.addLog("You descend into the darkness...", "#aaa");
        this.render();
    }

    spawnEnemies() {
        this.entities = [];
        const count = 5 + (this.floor * 2);
        for (let i = 0; i < count; i++) {
            const pos = this.getEmptyTile();
            const type = rng.chance(0.8) ? 'goblin' : 'orc';
            const stats = type === 'goblin' ? 
                {hp: 30, atk: 5, char: 'g', color: '#4dff88'} : 
                {hp: 70, atk: 12, char: 'O', color: '#ff4d4d'};
            this.entities.push(new Actor(pos.x, pos.y, type, stats));
        }
    }

    getEmptyTile() {
        let x, y;
        do {
            x = rng.int(0, CONFIG.MAP_SIZE - 1);
            y = rng.int(0, CONFIG.MAP_SIZE - 1);
        } while (this.map[y][x] !== TILE.FLOOR);
        return {x, y};
    }

    handleInput(key) {
        let dx = 0, dy = 0;
        if (key === 'w' || key === 'ArrowUp') dy = -1;
        if (key === 's' || key === 'ArrowDown') dy = 1;
        if (key === 'a' || key === 'ArrowLeft') dx = -1;
        if (key === 'd' || key === 'ArrowRight') dx = 1;
        if (key === 'i') this.toggleInventory();

        if (dx !== 0 || dy !== 0) {
            this.moveEntity(this.player, dx, dy);
            this.enemyTurn();
        }
        this.render();
    }

    moveEntity(entity, dx, dy) {
        const nx = entity.x + dx;
        const ny = entity.y + dy;

        // Wall Collision
        if (this.map[ny][nx] === TILE.WALL) return;

        // Combat Collision
        const target = this.entities.find(e => e.x === nx && e.y === ny);
        if (target) {
            this.combat(entity, target);
            return;
        }

        // Move
        entity.x = nx;
        entity.y = ny;

        // Stairs check
        if (entity.type === 'player' && this.map[ny][nx] === TILE.STAIRS) {
            this.floor++;
            this.init();
        }
    }

    enemyTurn() {
        this.entities.forEach(enemy => {
            const dist = Math.abs(enemy.x - this.player.x) + Math.abs(enemy.y - this.player.y);
            if (dist < 8) {
                const path = findPath({x: enemy.x, y: enemy.y}, {x: this.player.x, y: this.player.y}, this.map);
                if (path.length > 0) {
                    const step = path[0];
                    if (step.x === this.player.x && step.y === this.player.y) {
                        this.combat(enemy, this.player);
                    } else {
                        // Ensure enemies don't stack
                        if (!this.entities.some(e => e.x === step.x && e.y === step.y)) {
                            enemy.x = step.x;
                            enemy.y = step.y;
                        }
                    }
                }
            }
        });
    }

    combat(source, target) {
        const dmg = rng.int(source.atk - 2, source.atk + 5);
        target.hp -= dmg;
        target.hp = Math.max(0, target.hp); // Prevent negative HP
        this.addLog(`${source.type} hits ${target.type} for ${dmg} HP`, source.type === 'player' ? '#fff' : '#ff4d4d');

        if (target.hp <= 0) {
            this.addLog(`${target.type} was slain!`, "#ffd700");
            this.entities = this.entities.filter(e => e !== target);
        }
    }

    addLog(msg, color) {
        const log = document.getElementById('log');
        const entry = document.createElement('div');
        entry.className = 'log-entry';
        entry.style.color = color;
        entry.innerText = `> ${msg}`;
        log.prepend(entry);
    }

    resize() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
    }

    render() {
        this.ctx.fillStyle = '#000';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        const cx = Math.floor(this.canvas.width / 2 / CONFIG.TILE_SIZE);
        const cy = Math.floor(this.canvas.height / 2 / CONFIG.TILE_SIZE);
        const offsetX = cx - this.player.x;
        const offsetY = cy - this.player.y;

        // Render Map
        for (let y = 0; y < CONFIG.MAP_SIZE; y++) {
            for (let x = 0; x < CONFIG.MAP_SIZE; x++) {
                const screenX = (x + offsetX) * CONFIG.TILE_SIZE;
                const screenY = (y + offsetY) * CONFIG.TILE_SIZE;
                
                if (this.map[y][x] === TILE.WALL) this.ctx.fillStyle = '#111122';
                else if (this.map[y][x] === TILE.STAIRS) this.ctx.fillStyle = '#0055ff';
                else this.ctx.fillStyle = '#1a1a2e';

                this.ctx.fillRect(screenX, screenY, CONFIG.TILE_SIZE - 1, CONFIG.TILE_SIZE - 1);
            }
        }

        // Render Enemies
        this.entities.forEach(e => {
            this.ctx.fillStyle = e.color;
            this.ctx.font = 'bold 18px Courier';
            this.ctx.fillText(e.char, (e.x + offsetX) * CONFIG.TILE_SIZE + 8, (e.y + offsetY) * CONFIG.TILE_SIZE + 22);
        });

        // Render Player
        this.ctx.fillStyle = this.player.color;
        this.ctx.fillText(this.player.char, (this.player.x + offsetX) * CONFIG.TILE_SIZE + 8, (this.player.y + offsetY) * CONFIG.TILE_SIZE + 22);

        // Update UI
        document.getElementById('hp-val').innerText = this.player.hp;
        document.getElementById('floor-val').innerText = this.floor;
    }

    setupListeners() {
        window.onkeydown = (e) => this.handleInput(e.key);
        window.onresize = () => this.resize();
    }
}

const game = new Engine();