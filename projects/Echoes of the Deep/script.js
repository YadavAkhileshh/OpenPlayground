"use strict";

// ============================================================================
// GLOBAL CONFIGURATION
// ============================================================================
const CONFIG = {
  TILE_SIZE: 32,
  CANVAS_WIDTH: 800,
  CANVAS_HEIGHT: 600,
  MAP_WIDTH: 100,
  MAP_HEIGHT: 100,
  VIEWPORT_TILES_X: 25, // 800 / 32
  VIEWPORT_TILES_Y: 19, // 600 / 32 (rounded)
  FPS_TARGET: 60,
  DEBUG_MODE: false,
  INVENTORY_SIZE: 8,

  // Rendering layers
  LAYER_FLOOR: 0,
  LAYER_ITEMS: 1,
  LAYER_ENTITIES: 2,
  LAYER_EFFECTS: 3,

  // Colors
  COLOR_FLOOR: "#2c2c2c",
  COLOR_WALL: "#1a1a1a",
  COLOR_PLAYER: "#64b5f6",
  COLOR_ENEMY: "#ef5350",
  COLOR_ITEM: "#ffa726",
  COLOR_FOG: "rgba(0, 0, 0, 0.7)",
};

// ============================================================================
// ENTITY COMPONENT SYSTEM - CORE
// ============================================================================

/**
 * Component Base Class
 * All components must extend this
 */
class Component {
  constructor() {
    this.enabled = true;
  }
}

/**
 * Entity Class
 * Represents any game object (Player, Enemy, Item, etc.)
 */
class Entity {
  static nextId = 0;

  constructor(name = "Entity") {
    this.id = Entity.nextId++;
    this.name = name;
    this.components = new Map();
    this.tags = new Set();
    this.active = true;
  }

  addComponent(component) {
    const type = component.constructor.name;
    this.components.set(type, component);
    return this;
  }

  getComponent(ComponentClass) {
    return this.components.get(ComponentClass.name);
  }

  hasComponent(ComponentClass) {
    return this.components.has(ComponentClass.name);
  }

  removeComponent(ComponentClass) {
    this.components.delete(ComponentClass.name);
    return this;
  }

  addTag(tag) {
    this.tags.add(tag);
    return this;
  }

  hasTag(tag) {
    return this.tags.has(tag);
  }

  destroy() {
    this.active = false;
    this.components.clear();
    this.tags.clear();
  }
}

/**
 * System Base Class
 * All systems must extend this and implement update()
 */
class System {
  constructor(world) {
    this.world = world;
    this.enabled = true;
    this.priority = 0; // Lower number = higher priority
  }

  // Override this in derived systems
  update(deltaTime) {
    throw new Error("System.update() must be implemented");
  }

  // Helper to get entities with specific components
  query(...componentClasses) {
    return this.world.entities.filter((entity) => {
      if (!entity.active) return false;
      return componentClasses.every((CompClass) =>
        entity.hasComponent(CompClass)
      );
    });
  }
}

/**
 * World Class
 * Manages all entities and systems
 */
class World {
  constructor() {
    this.entities = [];
    this.systems = [];
    this.toAdd = [];
    this.toRemove = [];
  }

  createEntity(name) {
    const entity = new Entity(name);
    this.toAdd.push(entity);
    return entity;
  }

  addEntity(entity) {
    this.toAdd.push(entity);
  }

  removeEntity(entity) {
    this.toRemove.push(entity);
  }

  addSystem(system) {
    this.systems.push(system);
    this.systems.sort((a, b) => a.priority - b.priority);
  }

  update(deltaTime) {
    // Process additions
    if (this.toAdd.length > 0) {
      this.entities.push(...this.toAdd);
      this.toAdd = [];
    }

    // Process removals
    if (this.toRemove.length > 0) {
      this.toRemove.forEach((entity) => {
        const index = this.entities.indexOf(entity);
        if (index !== -1) {
          this.entities.splice(index, 1);
        }
      });
      this.toRemove = [];
    }

    // Update all systems
    for (const system of this.systems) {
      if (system.enabled) {
        system.update(deltaTime);
      }
    }
  }

  getEntitiesByTag(tag) {
    return this.entities.filter((e) => e.active && e.hasTag(tag));
  }

  getEntityById(id) {
    return this.entities.find((e) => e.id === id);
  }

  clear() {
    this.entities.forEach((e) => e.destroy());
    this.entities = [];
    this.toAdd = [];
    this.toRemove = [];
  }
}

// ============================================================================
// COMPONENTS - Data containers
// ============================================================================

class PositionComponent extends Component {
  constructor(x, y) {
    super();
    this.x = Math.floor(x);
    this.y = Math.floor(y);
    this.prevX = this.x;
    this.prevY = this.y;
  }

  setPosition(x, y) {
    this.prevX = this.x;
    this.prevY = this.y;
    this.x = Math.floor(x);
    this.y = Math.floor(y);
  }
}

class RenderComponent extends Component {
  constructor(char, color, layer = CONFIG.LAYER_ENTITIES) {
    super();
    this.char = char;
    this.color = color;
    this.layer = layer;
    this.visible = true;
  }
}

class StatsComponent extends Component {
  constructor(maxHp, strength = 10, defense = 5) {
    super();
    this.maxHp = maxHp;
    this.hp = maxHp;
    this.strength = strength;
    this.defense = defense;
    this.level = 1;
    this.xp = 0;
    this.xpToNext = 100;
  }

  takeDamage(amount) {
    this.hp = Math.max(0, this.hp - amount);
    return this.hp <= 0;
  }

  heal(amount) {
    this.hp = Math.min(this.maxHp, this.hp + amount);
  }

  gainXp(amount) {
    this.xp += amount;
    let leveledUp = false;
    while (this.xp >= this.xpToNext) {
      this.levelUp();
      leveledUp = true;
    }
    return leveledUp;
  }

  levelUp() {
    this.level++;
    this.xp -= this.xpToNext;
    this.xpToNext = Math.floor(this.xpToNext * 1.5);
    this.maxHp += 10;
    this.hp = this.maxHp;
    this.strength += 2;
    this.defense += 1;
  }
}

class InventoryComponent extends Component {
  constructor(size = CONFIG.INVENTORY_SIZE) {
    super();
    this.size = size;
    this.items = [];
    this.gold = 0;
  }

  addItem(item) {
    if (this.items.length < this.size) {
      this.items.push(item);
      return true;
    }
    return false;
  }

  removeItem(index) {
    if (index >= 0 && index < this.items.length) {
      return this.items.splice(index, 1)[0];
    }
    return null;
  }

  hasSpace() {
    return this.items.length < this.size;
  }
}

class AIComponent extends Component {
  constructor(type = "aggressive") {
    super();
    this.type = type; // 'aggressive', 'passive', 'fleeing'
    this.state = "idle"; // 'idle', 'chase', 'attack', 'flee'
    this.target = null;
    this.path = [];
    this.visionRange = 8;
  }
}

class CollisionComponent extends Component {
  constructor(blocksMovement = true, blocksVision = false) {
    super();
    this.blocksMovement = blocksMovement;
    this.blocksVision = blocksVision;
  }
}

class ItemComponent extends Component {
  constructor(type, value = 0) {
    super();
    this.type = type; // 'potion', 'weapon', 'armor', 'gold'
    this.value = value;
    this.used = false;
  }
}

// ============================================================================
// INPUT HANDLER
// ============================================================================

class InputHandler {
  constructor() {
    this.keys = new Map();
    this.keyPressed = new Map();
    this.mousePos = { x: 0, y: 0 };
    this.mouseButtons = new Map();

    this.boundKeyDown = this.handleKeyDown.bind(this);
    this.boundKeyUp = this.handleKeyUp.bind(this);
    this.boundMouseMove = this.handleMouseMove.bind(this);
    this.boundMouseDown = this.handleMouseDown.bind(this);
    this.boundMouseUp = this.handleMouseUp.bind(this);

    this.attachListeners();
  }

  attachListeners() {
    window.addEventListener("keydown", this.boundKeyDown);
    window.addEventListener("keyup", this.boundKeyUp);
    window.addEventListener("mousemove", this.boundMouseMove);
    window.addEventListener("mousedown", this.boundMouseDown);
    window.addEventListener("mouseup", this.boundMouseUp);
  }

  detachListeners() {
    window.removeEventListener("keydown", this.boundKeyDown);
    window.removeEventListener("keyup", this.boundKeyUp);
    window.removeEventListener("mousemove", this.boundMouseMove);
    window.removeEventListener("mousedown", this.boundMouseDown);
    window.removeEventListener("mouseup", this.boundMouseUp);
  }

  handleKeyDown(e) {
    this.keys.set(e.code, true);
    if (!this.keyPressed.get(e.code)) {
      this.keyPressed.set(e.code, true);
    }
  }

  handleKeyUp(e) {
    this.keys.set(e.code, false);
    this.keyPressed.set(e.code, false);
  }

  handleMouseMove(e) {
    this.mousePos.x = e.clientX;
    this.mousePos.y = e.clientY;
  }

  handleMouseDown(e) {
    this.mouseButtons.set(e.button, true);
  }

  handleMouseUp(e) {
    this.mouseButtons.set(e.button, false);
  }

  isKeyDown(code) {
    return this.keys.get(code) || false;
  }

  wasKeyPressed(code) {
    const pressed = this.keyPressed.get(code);
    if (pressed) {
      this.keyPressed.set(code, false);
      return true;
    }
    return false;
  }

  isMouseDown(button = 0) {
    return this.mouseButtons.get(button) || false;
  }

  reset() {
    this.keyPressed.clear();
  }
}

// ============================================================================
// GAME LOOP
// ============================================================================

class GameLoop {
  constructor(updateCallback, renderCallback) {
    this.updateCallback = updateCallback;
    this.renderCallback = renderCallback;
    this.isRunning = false;
    this.lastTime = 0;
    this.deltaTime = 0;
    this.fps = 0;
    this.frameCount = 0;
    this.fpsTime = 0;
    this.boundLoop = this.loop.bind(this);
  }

  start() {
    if (!this.isRunning) {
      this.isRunning = true;
      this.lastTime = performance.now();
      requestAnimationFrame(this.boundLoop);
    }
  }

  stop() {
    this.isRunning = false;
  }

  loop(currentTime) {
    if (!this.isRunning) return;

    // Calculate delta time in seconds
    this.deltaTime = (currentTime - this.lastTime) / 1000;
    this.lastTime = currentTime;

    // Cap delta time to prevent spiral of death
    if (this.deltaTime > 0.1) {
      this.deltaTime = 0.1;
    }

    // Update FPS counter
    this.frameCount++;
    this.fpsTime += this.deltaTime;
    if (this.fpsTime >= 1.0) {
      this.fps = this.frameCount;
      this.frameCount = 0;
      this.fpsTime = 0;
    }

    // Call update and render
    this.updateCallback(this.deltaTime);
    this.renderCallback();

    // Continue loop
    requestAnimationFrame(this.boundLoop);
  }
}

// ============================================================================
// UI MANAGER
// ============================================================================

class UIManager {
  constructor() {
    this.elements = {
      hpBar: document.getElementById("hp-bar"),
      hpBarText: document.getElementById("hp-bar-text"),
      hpText: document.getElementById("hp-text"),
      xpBar: document.getElementById("xp-bar"),
      xpBarText: document.getElementById("xp-bar-text"),
      xpText: document.getElementById("xp-text"),
      level: document.getElementById("player-level"),
      strength: document.getElementById("player-strength"),
      defense: document.getElementById("player-defense"),
      gold: document.getElementById("player-gold"),
      inventoryGrid: document.getElementById("inventory-grid"),
      combatLog: document.getElementById("combat-log"),
      debugInfo: document.getElementById("debug-info"),
      fpsCounter: document.getElementById("fps-counter"),
      entityCount: document.getElementById("entity-count"),
      turnCount: document.getElementById("turn-count"),
      cameraPos: document.getElementById("camera-pos"),
    };

    this.game = null;
    this.initInventorySlots();
  }

  setGame(game) {
    this.game = game;
  }

  initInventorySlots() {
    for (let i = 0; i < CONFIG.INVENTORY_SIZE; i++) {
      const slot = document.createElement("div");
      slot.className = "inventory-slot";
      slot.dataset.index = i;
      slot.title = `Slot ${i + 1} (Press ${i + 1})`;

      // Add click handler
      slot.addEventListener("click", () => {
        if (this.game && this.game.itemSystem) {
          this.game.itemSystem.useItem(this.game.playerEntity, i);
          this.game.updateUI();
        }
      });

      this.elements.inventoryGrid.appendChild(slot);
    }
  }

  updatePlayerStats(stats, inventory) {
    // HP Bar
    const hpPercent = (stats.hp / stats.maxHp) * 100;
    this.elements.hpBar.style.width = `${hpPercent}%`;
    this.elements.hpBarText.textContent = `${stats.hp} / ${stats.maxHp}`;
    this.elements.hpText.textContent = `${stats.hp} / ${stats.maxHp}`;

    // XP Bar
    const xpPercent = (stats.xp / stats.xpToNext) * 100;
    this.elements.xpBar.style.width = `${xpPercent}%`;
    this.elements.xpBarText.textContent = `${stats.xp} / ${stats.xpToNext}`;
    this.elements.xpText.textContent = `${stats.xp} / ${stats.xpToNext}`;

    // Stats
    this.elements.level.textContent = stats.level;
    this.elements.strength.textContent = stats.strength;
    this.elements.defense.textContent = stats.defense;
    this.elements.gold.textContent = inventory.gold;
  }

  updateInventory(inventory) {
    const slots = this.elements.inventoryGrid.children;

    for (let i = 0; i < slots.length; i++) {
      const slot = slots[i];
      const item = inventory.items[i];

      if (item) {
        slot.classList.add("occupied");
        const icon = this.getItemIcon(item.type);
        slot.innerHTML = `<span class="item-icon">${icon}</span>`;
        slot.title = `${item.type} (${item.value}) - Click to use`;
      } else {
        slot.classList.remove("occupied");
        slot.innerHTML = "";
        slot.title = `Slot ${i + 1} (Press ${i + 1})`;
      }
    }
  }

  getItemIcon(type) {
    const icons = {
      potion: "🧪",
      weapon: "⚔️",
      armor: "🛡️",
      gold: "💰",
    };
    return icons[type] || "?";
  }

  addLogEntry(message, type = "info") {
    const entry = document.createElement("div");
    entry.className = `log-entry ${type}`;
    entry.textContent = message;
    this.elements.combatLog.appendChild(entry);

    // Auto-scroll to bottom
    this.elements.combatLog.scrollTop = this.elements.combatLog.scrollHeight;

    // Limit log entries
    while (this.elements.combatLog.children.length > 50) {
      this.elements.combatLog.removeChild(this.elements.combatLog.firstChild);
    }
  }

  updateDebug(fps, entityCount, turnCount, cameraX, cameraY) {
    this.elements.fpsCounter.textContent = fps;
    this.elements.entityCount.textContent = entityCount;
    this.elements.turnCount.textContent = turnCount;
    this.elements.cameraPos.textContent = `${cameraX}, ${cameraY}`;
  }

  toggleDebug() {
    this.elements.debugInfo.classList.toggle("show");
  }
}

// ============================================================================
// MAP GENERATOR - Cellular Automata
// ============================================================================

class MapGenerator {
  constructor(width, height, seed = Date.now()) {
    this.width = width;
    this.height = height;
    this.seed = seed;
    this.map = [];
    this.rooms = [];

    // Seeded random number generator
    this.rng = this.createSeededRNG(seed);
  }

  createSeededRNG(seed) {
    return function () {
      seed = (seed * 9301 + 49297) % 233280;
      return seed / 233280;
    };
  }

  generate() {
    console.log(`🗺️ Generating map with seed: ${this.seed}`);

    // Initialize map with random walls
    this.initializeMap();

    // Apply cellular automata
    this.applyCellularAutomata(5);

    // Ensure connectivity
    this.ensureConnectivity();

    // Add rooms
    this.addRooms(8);

    return this.map;
  }

  initializeMap() {
    this.map = [];
    for (let y = 0; y < this.height; y++) {
      this.map[y] = [];
      for (let x = 0; x < this.width; x++) {
        // Borders are always walls
        if (
          x === 0 ||
          x === this.width - 1 ||
          y === 0 ||
          y === this.height - 1
        ) {
          this.map[y][x] = 1; // Wall
        } else {
          // 45% chance of wall
          this.map[y][x] = this.rng() < 0.45 ? 1 : 0;
        }
      }
    }
  }

  applyCellularAutomata(iterations) {
    for (let i = 0; i < iterations; i++) {
      const newMap = [];

      for (let y = 0; y < this.height; y++) {
        newMap[y] = [];
        for (let x = 0; x < this.width; x++) {
          const neighbors = this.countWallNeighbors(x, y);

          // Cellular automata rules
          if (this.map[y][x] === 1) {
            newMap[y][x] = neighbors >= 4 ? 1 : 0;
          } else {
            newMap[y][x] = neighbors >= 5 ? 1 : 0;
          }

          // Keep borders as walls
          if (
            x === 0 ||
            x === this.width - 1 ||
            y === 0 ||
            y === this.height - 1
          ) {
            newMap[y][x] = 1;
          }
        }
      }

      this.map = newMap;
    }
  }

  countWallNeighbors(x, y) {
    let count = 0;
    for (let dy = -1; dy <= 1; dy++) {
      for (let dx = -1; dx <= 1; dx++) {
        if (dx === 0 && dy === 0) continue;

        const nx = x + dx;
        const ny = y + dy;

        if (nx < 0 || nx >= this.width || ny < 0 || ny >= this.height) {
          count++;
        } else if (this.map[ny][nx] === 1) {
          count++;
        }
      }
    }
    return count;
  }

  ensureConnectivity() {
    // Find largest open area and ensure player spawn
    const center = {
      x: Math.floor(this.width / 2),
      y: Math.floor(this.height / 2),
    };

    // Carve out a guaranteed spawn area
    for (let dy = -2; dy <= 2; dy++) {
      for (let dx = -2; dx <= 2; dx++) {
        const x = center.x + dx;
        const y = center.y + dy;
        if (x > 0 && x < this.width - 1 && y > 0 && y < this.height - 1) {
          this.map[y][x] = 0;
        }
      }
    }
  }

  addRooms(count) {
    this.rooms = [];
    for (let i = 0; i < count; i++) {
      const width = 3 + Math.floor(this.rng() * 6);
      const height = 3 + Math.floor(this.rng() * 6);
      const x = 2 + Math.floor(this.rng() * (this.width - width - 4));
      const y = 2 + Math.floor(this.rng() * (this.height - height - 4));

      this.rooms.push({ x, y, width, height });

      // Carve out room
      for (let dy = 0; dy < height; dy++) {
        for (let dx = 0; dx < width; dx++) {
          this.map[y + dy][x + dx] = 0;
        }
      }
    }
  }

  isWalkable(x, y) {
    if (x < 0 || x >= this.width || y < 0 || y >= this.height) return false;
    return this.map[y][x] === 0;
  }

  getRandomWalkablePosition() {
    let attempts = 0;
    while (attempts < 1000) {
      const x = 1 + Math.floor(this.rng() * (this.width - 2));
      const y = 1 + Math.floor(this.rng() * (this.height - 2));
      if (this.isWalkable(x, y)) {
        return { x, y };
      }
      attempts++;
    }
    return { x: Math.floor(this.width / 2), y: Math.floor(this.height / 2) };
  }
}

// ============================================================================
// PATHFINDING - A* Algorithm
// ============================================================================

class Pathfinder {
  constructor(map) {
    this.map = map;
  }

  findPath(startX, startY, endX, endY, maxDistance = 50) {
    const openSet = [];
    const closedSet = new Set();
    const cameFrom = new Map();

    const gScore = new Map();
    const fScore = new Map();

    const startKey = `${startX},${startY}`;
    const endKey = `${endX},${endY}`;

    gScore.set(startKey, 0);
    fScore.set(startKey, this.heuristic(startX, startY, endX, endY));
    openSet.push({ x: startX, y: startY, f: fScore.get(startKey) });

    while (openSet.length > 0) {
      // Get node with lowest fScore
      openSet.sort((a, b) => a.f - b.f);
      const current = openSet.shift();
      const currentKey = `${current.x},${current.y}`;

      // Reached goal
      if (currentKey === endKey) {
        return this.reconstructPath(cameFrom, currentKey);
      }

      closedSet.add(currentKey);

      // Check neighbors
      const neighbors = this.getNeighbors(current.x, current.y);
      for (const neighbor of neighbors) {
        const neighborKey = `${neighbor.x},${neighbor.y}`;

        if (closedSet.has(neighborKey)) continue;

        const tentativeG = gScore.get(currentKey) + 1;

        // Skip if too far
        if (tentativeG > maxDistance) continue;

        if (!gScore.has(neighborKey) || tentativeG < gScore.get(neighborKey)) {
          cameFrom.set(neighborKey, currentKey);
          gScore.set(neighborKey, tentativeG);
          const h = this.heuristic(neighbor.x, neighbor.y, endX, endY);
          fScore.set(neighborKey, tentativeG + h);

          if (!openSet.some((n) => n.x === neighbor.x && n.y === neighbor.y)) {
            openSet.push({
              x: neighbor.x,
              y: neighbor.y,
              f: fScore.get(neighborKey),
            });
          }
        }
      }
    }

    return []; // No path found
  }

  heuristic(x1, y1, x2, y2) {
    // Manhattan distance
    return Math.abs(x1 - x2) + Math.abs(y1 - y2);
  }

  getNeighbors(x, y) {
    const neighbors = [];
    const directions = [
      { dx: 0, dy: -1 }, // Up
      { dx: 1, dy: 0 }, // Right
      { dx: 0, dy: 1 }, // Down
      { dx: -1, dy: 0 }, // Left
    ];

    for (const dir of directions) {
      const nx = x + dir.dx;
      const ny = y + dir.dy;

      if (this.map.isWalkable(nx, ny)) {
        neighbors.push({ x: nx, y: ny });
      }
    }

    return neighbors;
  }

  reconstructPath(cameFrom, currentKey) {
    const path = [];
    let current = currentKey;

    while (cameFrom.has(current)) {
      const [x, y] = current.split(",").map(Number);
      path.unshift({ x, y });
      current = cameFrom.get(current);
    }

    return path;
  }
}

// ============================================================================
// CAMERA
// ============================================================================

class Camera {
  constructor(viewportWidth, viewportHeight, mapWidth, mapHeight) {
    this.x = 0;
    this.y = 0;
    this.viewportWidth = viewportWidth;
    this.viewportHeight = viewportHeight;
    this.mapWidth = mapWidth;
    this.mapHeight = mapHeight;
  }

  centerOn(x, y) {
    this.x = Math.floor(x - this.viewportWidth / 2);
    this.y = Math.floor(y - this.viewportHeight / 2);
    this.clamp();
  }

  clamp() {
    this.x = Math.max(0, Math.min(this.x, this.mapWidth - this.viewportWidth));
    this.y = Math.max(
      0,
      Math.min(this.y, this.mapHeight - this.viewportHeight)
    );
  }

  isVisible(x, y) {
    return (
      x >= this.x &&
      x < this.x + this.viewportWidth &&
      y >= this.y &&
      y < this.y + this.viewportHeight
    );
  }

  worldToScreen(x, y) {
    return {
      x: (x - this.x) * CONFIG.TILE_SIZE,
      y: (y - this.y) * CONFIG.TILE_SIZE,
    };
  }
}

// ============================================================================
// SYSTEMS - Game Logic
// ============================================================================

class RenderSystem extends System {
  constructor(world, ctx, camera, mapGenerator) {
    super(world);
    this.ctx = ctx;
    this.camera = camera;
    this.mapGenerator = mapGenerator;
    this.priority = 100; // Render last
    this.fogOfWar = [];
    this.explored = [];
    this.initFogOfWar();
  }

  initFogOfWar() {
    for (let y = 0; y < CONFIG.MAP_HEIGHT; y++) {
      this.fogOfWar[y] = [];
      this.explored[y] = [];
      for (let x = 0; x < CONFIG.MAP_WIDTH; x++) {
        this.fogOfWar[y][x] = true;
        this.explored[y][x] = false;
      }
    }
  }

  updateFogOfWar(playerX, playerY) {
    const visionRange = 8;

    for (let y = 0; y < CONFIG.MAP_HEIGHT; y++) {
      for (let x = 0; x < CONFIG.MAP_WIDTH; x++) {
        this.fogOfWar[y][x] = true;
      }
    }

    for (let y = playerY - visionRange; y <= playerY + visionRange; y++) {
      for (let x = playerX - visionRange; x <= playerX + visionRange; x++) {
        if (x >= 0 && x < CONFIG.MAP_WIDTH && y >= 0 && y < CONFIG.MAP_HEIGHT) {
          const dist = Math.sqrt((x - playerX) ** 2 + (y - playerY) ** 2);
          if (dist <= visionRange) {
            this.fogOfWar[y][x] = false;
            this.explored[y][x] = true;
          }
        }
      }
    }
  }

  update(deltaTime) {
    const { ctx } = this;

    // Clear canvas
    ctx.fillStyle = "#000000";
    ctx.fillRect(0, 0, CONFIG.CANVAS_WIDTH, CONFIG.CANVAS_HEIGHT);

    // Update fog of war
    const player = this.world.getEntitiesByTag("player")[0];
    if (player) {
      const pos = player.getComponent(PositionComponent);
      this.updateFogOfWar(pos.x, pos.y);
    }

    // Render map
    this.renderMap();

    // Render entities by layer
    this.renderEntitiesByLayer();

    // Render fog of war
    this.renderFogOfWar();
  }

  renderMap() {
    const { ctx, camera, mapGenerator } = this;

    for (let y = camera.y; y < camera.y + camera.viewportHeight; y++) {
      for (let x = camera.x; x < camera.x + camera.viewportWidth; x++) {
        if (x < 0 || x >= CONFIG.MAP_WIDTH || y < 0 || y >= CONFIG.MAP_HEIGHT)
          continue;

        if (!this.explored[y][x]) continue;

        const screenPos = camera.worldToScreen(x, y);
        const isWall = mapGenerator.map[y][x] === 1;

        const inFog = this.fogOfWar[y][x];

        ctx.fillStyle = isWall ? CONFIG.COLOR_WALL : CONFIG.COLOR_FLOOR;
        if (inFog) {
          ctx.globalAlpha = 0.3;
        }

        ctx.fillRect(
          screenPos.x,
          screenPos.y,
          CONFIG.TILE_SIZE,
          CONFIG.TILE_SIZE
        );

        // Draw grid lines
        ctx.strokeStyle = "#111111";
        ctx.globalAlpha = 0.2;
        ctx.strokeRect(
          screenPos.x,
          screenPos.y,
          CONFIG.TILE_SIZE,
          CONFIG.TILE_SIZE
        );

        ctx.globalAlpha = 1.0;
      }
    }
  }

  renderEntitiesByLayer() {
    const layers = [
      CONFIG.LAYER_FLOOR,
      CONFIG.LAYER_ITEMS,
      CONFIG.LAYER_ENTITIES,
      CONFIG.LAYER_EFFECTS,
    ];

    for (const layer of layers) {
      const entities = this.query(PositionComponent, RenderComponent);

      for (const entity of entities) {
        const pos = entity.getComponent(PositionComponent);
        const render = entity.getComponent(RenderComponent);

        if (!render.visible || render.layer !== layer) continue;
        if (!this.camera.isVisible(pos.x, pos.y)) continue;
        if (this.fogOfWar[pos.y][pos.x]) continue;

        const screenPos = this.camera.worldToScreen(pos.x, pos.y);

        this.ctx.fillStyle = render.color;
        this.ctx.font = "bold 24px monospace";
        this.ctx.textAlign = "center";
        this.ctx.textBaseline = "middle";
        this.ctx.fillText(
          render.char,
          screenPos.x + CONFIG.TILE_SIZE / 2,
          screenPos.y + CONFIG.TILE_SIZE / 2
        );
      }
    }
  }

  renderFogOfWar() {
    // This is already handled in renderMap
  }
}

class TurnSystem extends System {
  constructor(world, game) {
    super(world);
    this.game = game;
    this.priority = 10;
    this.playerTurnTaken = false;
  }

  update(deltaTime) {
    if (!this.playerTurnTaken) return;

    // Process enemy turns
    const enemies = this.world.getEntitiesByTag("enemy");

    for (const enemy of enemies) {
      const ai = enemy.getComponent(AIComponent);
      if (ai && ai.enabled) {
        this.processEnemyTurn(enemy);
      }
    }

    this.playerTurnTaken = false;
    this.game.turnCount++;
  }

  processEnemyTurn(enemy) {
    const pos = enemy.getComponent(PositionComponent);
    const ai = enemy.getComponent(AIComponent);

    if (ai.type === "aggressive") {
      this.aggressiveBehavior(enemy, pos, ai);
    } else if (ai.type === "passive") {
      this.passiveBehavior(enemy, pos, ai);
    }
  }

  aggressiveBehavior(enemy, pos, ai) {
    const player = this.world.getEntitiesByTag("player")[0];
    if (!player) return;

    const playerPos = player.getComponent(PositionComponent);
    const distance = Math.sqrt(
      (pos.x - playerPos.x) ** 2 + (pos.y - playerPos.y) ** 2
    );

    if (distance <= ai.visionRange) {
      ai.state = "chase";
      ai.target = player.id;

      // Check if adjacent to player
      if (distance <= 1.5) {
        // Attack player
        const enemyStats = enemy.getComponent(StatsComponent);
        const playerStats = player.getComponent(StatsComponent);

        if (enemyStats && playerStats) {
          const damage = Math.max(1, enemyStats.strength - playerStats.defense);
          const died = playerStats.takeDamage(damage);

          this.game.ui.addLogEntry(
            `${enemy.name} attacks for ${damage} damage!`,
            "damage"
          );

          // Flash damage animation
          const hpBar = document.getElementById("hp-bar").parentElement;
          hpBar.classList.add("damage-flash");
          setTimeout(() => hpBar.classList.remove("damage-flash"), 300);

          if (died) {
            this.game.ui.addLogEntry("You have died...", "damage");
            this.game.gameOver();
          }
        }
      } else {
        // Move towards player using A*
        if (ai.path.length === 0 || Math.random() < 0.3) {
          const pathfinder = new Pathfinder(this.game.mapGenerator);
          ai.path = pathfinder.findPath(
            pos.x,
            pos.y,
            playerPos.x,
            playerPos.y,
            20
          );
        }

        if (ai.path.length > 0) {
          const next = ai.path.shift();
          this.game.moveEntity(enemy, next.x, next.y);
        }
      }
    } else {
      ai.state = "idle";
      // Random walk
      if (Math.random() < 0.3) {
        const directions = [
          { dx: 0, dy: -1 },
          { dx: 1, dy: 0 },
          { dx: 0, dy: 1 },
          { dx: -1, dy: 0 },
        ];
        const dir = directions[Math.floor(Math.random() * directions.length)];
        this.game.moveEntity(enemy, pos.x + dir.dx, pos.y + dir.dy);
      }
    }
  }

  passiveBehavior(enemy, pos, ai) {
    // Passive enemies just wander
    if (Math.random() < 0.2) {
      const directions = [
        { dx: 0, dy: -1 },
        { dx: 1, dy: 0 },
        { dx: 0, dy: 1 },
        { dx: -1, dy: 0 },
      ];
      const dir = directions[Math.floor(Math.random() * directions.length)];
      this.game.moveEntity(enemy, pos.x + dir.dx, pos.y + dir.dy);
    }
  }

  triggerPlayerTurn() {
    this.playerTurnTaken = true;
  }
}

class ItemSystem extends System {
  constructor(world, game) {
    super(world);
    this.game = game;
    this.priority = 20;
  }

  update(deltaTime) {
    // Check for item pickups
    const player = this.world.getEntitiesByTag("player")[0];
    if (!player) return;

    const playerPos = player.getComponent(PositionComponent);
    const items = this.world.getEntitiesByTag("item");

    for (const item of items) {
      const itemPos = item.getComponent(PositionComponent);
      if (playerPos.x === itemPos.x && playerPos.y === itemPos.y) {
        this.pickupItem(player, item);
      }
    }
  }

  pickupItem(player, item) {
    const inventory = player.getComponent(InventoryComponent);
    const itemComp = item.getComponent(ItemComponent);

    if (itemComp.type === "gold") {
      inventory.gold += itemComp.value;
      this.game.ui.addLogEntry(`Picked up ${itemComp.value} gold!`, "loot");
      this.world.removeEntity(item);
    } else if (inventory.hasSpace()) {
      inventory.addItem(itemComp);
      this.game.ui.addLogEntry(`Picked up ${itemComp.type}!`, "loot");
      this.world.removeEntity(item);
    } else {
      this.game.ui.addLogEntry("Inventory is full!", "info");
    }
  }

  useItem(player, itemIndex) {
    const inventory = player.getComponent(InventoryComponent);
    const item = inventory.items[itemIndex];

    if (!item) return;

    if (item.type === "potion") {
      const stats = player.getComponent(StatsComponent);
      stats.heal(item.value);
      this.game.ui.addLogEntry(`Used potion, healed ${item.value} HP!`, "heal");
      inventory.removeItem(itemIndex);
      this.game.turnSystem.triggerPlayerTurn();
    }
  }
}

// ============================================================================
// MAIN GAME CLASS
// ============================================================================

class Game {
  constructor() {
    this.canvas = document.getElementById("game-canvas");
    this.ctx = this.canvas.getContext("2d");

    this.world = new World();
    this.input = new InputHandler();
    this.ui = new UIManager();

    this.camera = new Camera(
      CONFIG.VIEWPORT_TILES_X,
      CONFIG.VIEWPORT_TILES_Y,
      CONFIG.MAP_WIDTH,
      CONFIG.MAP_HEIGHT
    );

    this.gameLoop = new GameLoop(
      this.update.bind(this),
      this.render.bind(this)
    );

    this.turnCount = 0;
    this.playerEntity = null;
    this.mapGenerator = null;
    this.renderSystem = null;
    this.turnSystem = null;
    this.itemSystem = null;
    this.isGameOver = false;

    this.init();
  }

  init() {
    console.log("🎮 Initializing Echoes of the Deep...");

    // Connect UI to game
    this.ui.setGame(this);

    // Generate map
    this.mapGenerator = new MapGenerator(CONFIG.MAP_WIDTH, CONFIG.MAP_HEIGHT);
    this.mapGenerator.generate();

    // Initialize systems
    this.renderSystem = new RenderSystem(
      this.world,
      this.ctx,
      this.camera,
      this.mapGenerator
    );
    this.turnSystem = new TurnSystem(this.world, this);
    this.itemSystem = new ItemSystem(this.world, this);

    this.world.addSystem(this.turnSystem);
    this.world.addSystem(this.itemSystem);
    this.world.addSystem(this.renderSystem);

    // Create player
    this.createPlayer();

    // Spawn enemies
    this.spawnEnemies(15);

    // Spawn items
    this.spawnItems(20);

    this.ui.addLogEntry("🗡️ Welcome to Echoes of the Deep!", "info");
    this.ui.addLogEntry("Explore the dungeon and survive...", "info");
    console.log("✅ Game ready!");
  }

  createPlayer() {
    const spawnPos = this.mapGenerator.getRandomWalkablePosition();

    this.playerEntity = this.world.createEntity("Player");
    this.playerEntity
      .addComponent(new PositionComponent(spawnPos.x, spawnPos.y))
      .addComponent(
        new RenderComponent("@", CONFIG.COLOR_PLAYER, CONFIG.LAYER_ENTITIES)
      )
      .addComponent(new StatsComponent(100, 10, 5))
      .addComponent(new InventoryComponent())
      .addComponent(new CollisionComponent(true, false))
      .addTag("player");

    this.updateUI();
  }

  spawnEnemies(count) {
    const enemyTypes = [
      {
        name: "Slime",
        char: "s",
        color: "#66bb6a",
        hp: 20,
        str: 5,
        def: 2,
        type: "passive",
        xp: 10,
      },
      {
        name: "Goblin",
        char: "g",
        color: "#ef5350",
        hp: 30,
        str: 8,
        def: 3,
        type: "aggressive",
        xp: 15,
      },
      {
        name: "Skeleton",
        char: "S",
        color: "#e0e0e0",
        hp: 40,
        str: 10,
        def: 4,
        type: "aggressive",
        xp: 20,
      },
      {
        name: "Bat",
        char: "b",
        color: "#ab47bc",
        hp: 15,
        str: 6,
        def: 1,
        type: "aggressive",
        xp: 8,
      },
    ];

    for (let i = 0; i < count; i++) {
      const pos = this.mapGenerator.getRandomWalkablePosition();
      const type = enemyTypes[Math.floor(Math.random() * enemyTypes.length)];

      const enemy = this.world.createEntity(type.name);
      enemy
        .addComponent(new PositionComponent(pos.x, pos.y))
        .addComponent(
          new RenderComponent(type.char, type.color, CONFIG.LAYER_ENTITIES)
        )
        .addComponent(new StatsComponent(type.hp, type.str, type.def))
        .addComponent(new AIComponent(type.type))
        .addComponent(new CollisionComponent(true, false))
        .addTag("enemy");
    }
  }

  spawnItems(count) {
    const itemTypes = [
      { type: "potion", char: "!", color: "#ef5350", value: 30, weight: 0.6 },
      { type: "gold", char: "$", color: "#ffd700", value: 10, weight: 0.4 },
    ];

    for (let i = 0; i < count; i++) {
      const pos = this.mapGenerator.getRandomWalkablePosition();
      const rand = Math.random();
      let cumulativeWeight = 0;
      let selectedType = itemTypes[0];

      for (const itemType of itemTypes) {
        cumulativeWeight += itemType.weight;
        if (rand < cumulativeWeight) {
          selectedType = itemType;
          break;
        }
      }

      const value = selectedType.value + Math.floor(Math.random() * 10);

      const item = this.world.createEntity(selectedType.type);
      item
        .addComponent(new PositionComponent(pos.x, pos.y))
        .addComponent(
          new RenderComponent(
            selectedType.char,
            selectedType.color,
            CONFIG.LAYER_ITEMS
          )
        )
        .addComponent(new ItemComponent(selectedType.type, value))
        .addTag("item");
    }
  }

  handlePlayerInput() {
    if (this.isGameOver) return;

    let moved = false;
    const playerPos = this.playerEntity.getComponent(PositionComponent);
    let newX = playerPos.x;
    let newY = playerPos.y;

    // Movement
    if (
      this.input.wasKeyPressed("ArrowUp") ||
      this.input.wasKeyPressed("KeyW")
    ) {
      newY--;
      moved = true;
    } else if (
      this.input.wasKeyPressed("ArrowDown") ||
      this.input.wasKeyPressed("KeyS")
    ) {
      newY++;
      moved = true;
    } else if (
      this.input.wasKeyPressed("ArrowLeft") ||
      this.input.wasKeyPressed("KeyA")
    ) {
      newX--;
      moved = true;
    } else if (
      this.input.wasKeyPressed("ArrowRight") ||
      this.input.wasKeyPressed("KeyD")
    ) {
      newX++;
      moved = true;
    } else if (this.input.wasKeyPressed("Space")) {
      // Wait turn
      moved = true;
    }

    // Item usage
    for (let i = 1; i <= 8; i++) {
      if (this.input.wasKeyPressed(`Digit${i}`)) {
        this.itemSystem.useItem(this.playerEntity, i - 1);
        this.updateUI();
        return;
      }
    }

    if (moved) {
      if (newX !== playerPos.x || newY !== playerPos.y) {
        const success = this.moveEntity(this.playerEntity, newX, newY);
        if (!success) return; // Blocked movement doesn't count as turn
      }

      this.turnSystem.triggerPlayerTurn();
      this.updateUI();
    }
  }

  moveEntity(entity, newX, newY) {
    const pos = entity.getComponent(PositionComponent);

    // Check map bounds and walls
    if (!this.mapGenerator.isWalkable(newX, newY)) {
      return false;
    }

    // Check for collision with other entities
    const entities = this.world.entities;
    for (const other of entities) {
      if (other === entity || !other.active) continue;

      const otherPos = other.getComponent(PositionComponent);
      const otherCol = other.getComponent(CollisionComponent);

      if (otherPos && otherCol && otherCol.blocksMovement) {
        if (otherPos.x === newX && otherPos.y === newY) {
          // Handle combat
          if (entity.hasTag("player") && other.hasTag("enemy")) {
            this.handleCombat(entity, other);
            return true;
          } else if (entity.hasTag("enemy") && other.hasTag("player")) {
            // Enemy attacking player handled in turn system
            return false;
          }
          return false;
        }
      }
    }

    pos.setPosition(newX, newY);
    return true;
  }

  handleCombat(attacker, defender) {
    const attackerStats = attacker.getComponent(StatsComponent);
    const defenderStats = defender.getComponent(StatsComponent);

    if (!attackerStats || !defenderStats) return;

    const damage = Math.max(1, attackerStats.strength - defenderStats.defense);
    const died = defenderStats.takeDamage(damage);

    this.ui.addLogEntry(
      `You attack ${defender.name} for ${damage} damage!`,
      "damage"
    );

    if (died) {
      this.ui.addLogEntry(`${defender.name} has been defeated!`, "info");

      // Award XP
      const xpGain = 10 + defenderStats.level * 5;
      const leveledUp = attackerStats.gainXp(xpGain);
      this.ui.addLogEntry(`Gained ${xpGain} XP!`, "info");

      if (leveledUp) {
        this.ui.addLogEntry(
          `🎉 Level up! You are now level ${attackerStats.level}!`,
          "heal"
        );

        // Level up animation
        const statsSection =
          document.querySelector("#player-stats").parentElement;
        statsSection.classList.add("level-up");
        setTimeout(() => statsSection.classList.remove("level-up"), 500);
      }

      // Drop loot
      const defenderPos = defender.getComponent(PositionComponent);
      if (Math.random() < 0.5) {
        const item = this.world.createEntity("potion");
        item
          .addComponent(new PositionComponent(defenderPos.x, defenderPos.y))
          .addComponent(new RenderComponent("!", "#ef5350", CONFIG.LAYER_ITEMS))
          .addComponent(
            new ItemComponent("potion", 20 + Math.floor(Math.random() * 20))
          )
          .addTag("item");
      }

      this.world.removeEntity(defender);
    }
  }

  updateUI() {
    const stats = this.playerEntity.getComponent(StatsComponent);
    const inventory = this.playerEntity.getComponent(InventoryComponent);
    this.ui.updatePlayerStats(stats, inventory);
    this.ui.updateInventory(inventory);
  }

  gameOver() {
    this.isGameOver = true;
    this.ui.addLogEntry("💀 GAME OVER 💀", "damage");
    this.ui.addLogEntry("Refresh the page to play again.", "info");
  }

  update(deltaTime) {
    if (this.isGameOver) return;

    // Handle debug toggle
    if (this.input.wasKeyPressed("KeyD")) {
      CONFIG.DEBUG_MODE = !CONFIG.DEBUG_MODE;
      this.ui.toggleDebug();
    }

    // Handle player input
    this.handlePlayerInput();

    // Update world (all systems)
    this.world.update(deltaTime);

    // Update camera to follow player
    if (this.playerEntity) {
      const pos = this.playerEntity.getComponent(PositionComponent);
      this.camera.centerOn(pos.x, pos.y);
    }

    // Update debug info
    if (CONFIG.DEBUG_MODE) {
      this.ui.updateDebug(
        this.gameLoop.fps,
        this.world.entities.length,
        this.turnCount,
        Math.floor(this.camera.x),
        Math.floor(this.camera.y)
      );
    }

    // Reset input states
    this.input.reset();
  }

  render() {
    // Rendering is handled by RenderSystem
  }

  start() {
    console.log("🚀 Starting game loop...");
    this.gameLoop.start();
  }

  stop() {
    this.gameLoop.stop();
  }
}

// ============================================================================
// INITIALIZATION
// ============================================================================

window.addEventListener("load", () => {
  const game = new Game();
  game.start();

  // Expose game instance for debugging
  window.game = game;
});
