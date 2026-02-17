// ==================== UTILITY FUNCTIONS ====================
function showToast(message, duration = 2000) {
  const toast = document.getElementById("toast");
  toast.textContent = message;
  toast.classList.add("show");
  setTimeout(() => {
    toast.classList.remove("show");
  }, duration);
}

function togglePanel(panelClass) {
  const panel = document.querySelector("." + panelClass);
  panel.classList.toggle("collapsed");
  const toggleBtn = panel.querySelector(".toggle-btn");
  if (panel.classList.contains("collapsed")) {
    if (panelClass === "control-panel") {
      toggleBtn.textContent = "▶";
    } else {
      toggleBtn.textContent = "◀";
    }
  } else {
    if (panelClass === "control-panel") {
      toggleBtn.textContent = "◀";
    } else {
      toggleBtn.textContent = "▶";
    }
  }
}

// ==================== VECTOR CLASS ====================
class Vector2D {
  constructor(x = 0, y = 0) {
    this.x = x;
    this.y = y;
  }

  add(v) {
    this.x += v.x;
    this.y += v.y;
    return this;
  }

  sub(v) {
    this.x -= v.x;
    this.y -= v.y;
    return this;
  }

  mult(n) {
    this.x *= n;
    this.y *= n;
    return this;
  }

  div(n) {
    if (n !== 0) {
      this.x /= n;
      this.y /= n;
    }
    return this;
  }

  mag() {
    return Math.sqrt(this.x * this.x + this.y * this.y);
  }

  normalize() {
    const m = this.mag();
    if (m !== 0) this.div(m);
    return this;
  }

  limit(max) {
    if (this.mag() > max) {
      this.normalize();
      this.mult(max);
    }
    return this;
  }

  setMag(n) {
    this.normalize();
    this.mult(n);
    return this;
  }

  dist(v) {
    const dx = this.x - v.x;
    const dy = this.y - v.y;
    return Math.sqrt(dx * dx + dy * dy);
  }

  copy() {
    return new Vector2D(this.x, this.y);
  }

  static sub(v1, v2) {
    return new Vector2D(v1.x - v2.x, v1.y - v2.y);
  }

  static random2D() {
    const angle = Math.random() * Math.PI * 2;
    return new Vector2D(Math.cos(angle), Math.sin(angle));
  }
}

// ==================== A* PATHFINDING ====================
class AStarGrid {
  constructor(width, height, cellSize = 50) {
    this.width = width;
    this.height = height;
    this.cellSize = cellSize;
    this.cols = Math.ceil(width / cellSize);
    this.rows = Math.ceil(height / cellSize);
  }

  findPath(start, end, obstacles = []) {
    const startNode = this.posToGrid(start);
    const endNode = this.posToGrid(end);

    if (!startNode || !endNode) return null;

    const openSet = [startNode];
    const closedSet = new Set();
    const cameFrom = new Map();
    const gScore = new Map();
    const fScore = new Map();

    gScore.set(this.nodeKey(startNode), 0);
    fScore.set(this.nodeKey(startNode), this.heuristic(startNode, endNode));

    let iterations = 0;
    const maxIterations = 200;

    while (openSet.length > 0 && iterations < maxIterations) {
      iterations++;

      openSet.sort((a, b) => {
        return (
          (fScore.get(this.nodeKey(a)) || Infinity) -
          (fScore.get(this.nodeKey(b)) || Infinity)
        );
      });

      const current = openSet.shift();
      const currentKey = this.nodeKey(current);

      if (current.x === endNode.x && current.y === endNode.y) {
        return this.reconstructPath(cameFrom, current);
      }

      closedSet.add(currentKey);

      const neighbors = this.getNeighbors(current);
      for (const neighbor of neighbors) {
        const neighborKey = this.nodeKey(neighbor);
        if (closedSet.has(neighborKey)) continue;

        const tentativeGScore = (gScore.get(currentKey) || Infinity) + 1;

        if (!openSet.some((n) => this.nodeKey(n) === neighborKey)) {
          openSet.push(neighbor);
        } else if (tentativeGScore >= (gScore.get(neighborKey) || Infinity)) {
          continue;
        }

        cameFrom.set(neighborKey, current);
        gScore.set(neighborKey, tentativeGScore);
        fScore.set(
          neighborKey,
          tentativeGScore + this.heuristic(neighbor, endNode)
        );
      }
    }

    return null;
  }

  posToGrid(pos) {
    const x = Math.floor(pos.x / this.cellSize);
    const y = Math.floor(pos.y / this.cellSize);
    if (x >= 0 && x < this.cols && y >= 0 && y < this.rows) {
      return { x, y };
    }
    return null;
  }

  gridToPos(gridPos) {
    return new Vector2D(
      gridPos.x * this.cellSize + this.cellSize / 2,
      gridPos.y * this.cellSize + this.cellSize / 2
    );
  }

  getNeighbors(node) {
    const neighbors = [];
    const dirs = [
      { x: 0, y: -1 },
      { x: 1, y: 0 },
      { x: 0, y: 1 },
      { x: -1, y: 0 },
    ];

    for (const dir of dirs) {
      const x = node.x + dir.x;
      const y = node.y + dir.y;
      if (x >= 0 && x < this.cols && y >= 0 && y < this.rows) {
        neighbors.push({ x, y });
      }
    }

    return neighbors;
  }

  heuristic(a, b) {
    return Math.abs(a.x - b.x) + Math.abs(a.y - b.y);
  }

  nodeKey(node) {
    return `${node.x},${node.y}`;
  }

  reconstructPath(cameFrom, current) {
    const path = [this.gridToPos(current)];
    let currentKey = this.nodeKey(current);

    while (cameFrom.has(currentKey)) {
      current = cameFrom.get(currentKey);
      currentKey = this.nodeKey(current);
      path.unshift(this.gridToPos(current));
    }

    return path;
  }
}

// ==================== PARTICLE SYSTEM ====================
class Particle {
  constructor(x, y, color) {
    this.position = new Vector2D(x, y);
    this.velocity = Vector2D.random2D().mult(Math.random() * 3 + 1);
    this.lifespan = 255;
    this.color = color;
  }

  update() {
    this.position.add(this.velocity);
    this.lifespan -= 5;
    this.velocity.mult(0.95);
  }

  render(ctx) {
    ctx.fillStyle = `${this.color}${Math.floor(this.lifespan)
      .toString(16)
      .padStart(2, "0")}`;
    ctx.beginPath();
    ctx.arc(this.position.x, this.position.y, 3, 0, Math.PI * 2);
    ctx.fill();
  }

  isDead() {
    return this.lifespan <= 0;
  }
}

// ==================== FOOD CLASS ====================
class Food {
  constructor(x, y) {
    this.position = new Vector2D(x, y);
    this.energy = 30;
    this.radius = 6;
    this.pulsePhase = Math.random() * Math.PI * 2;
  }

  render(ctx, time) {
    const pulse = Math.sin(time * 0.003 + this.pulsePhase) * 0.3 + 1;

    ctx.fillStyle = "#34d399";
    ctx.shadowBlur = 15;
    ctx.shadowColor = "#34d399";
    ctx.beginPath();
    ctx.arc(
      this.position.x,
      this.position.y,
      this.radius * pulse,
      0,
      Math.PI * 2
    );
    ctx.fill();
    ctx.shadowBlur = 0;

    ctx.strokeStyle = "#10b981";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.arc(this.position.x, this.position.y, this.radius + 3, 0, Math.PI * 2);
    ctx.stroke();
  }
}

// ==================== PREDATOR CLASS ====================
class Predator {
  constructor(x, y, canvasWidth, canvasHeight) {
    this.position = new Vector2D(x, y);
    this.velocity = new Vector2D(0, 0);
    this.acceleration = new Vector2D(0, 0);
    this.maxSpeed = 3.5;
    this.maxForce = 0.2;
    this.size = 15;
    this.canvasWidth = canvasWidth;
    this.canvasHeight = canvasHeight;
    this.senseRange = 250;
  }

  seek(target) {
    const desired = Vector2D.sub(target, this.position);
    desired.setMag(this.maxSpeed);
    const steer = Vector2D.sub(desired, this.velocity);
    steer.limit(this.maxForce);
    return steer;
  }

  update() {
    this.velocity.add(this.acceleration);
    this.velocity.limit(this.maxSpeed);
    this.position.add(this.velocity);
    this.acceleration.mult(0);

    this.edges();
  }

  edges() {
    if (this.position.x > this.canvasWidth) this.position.x = 0;
    if (this.position.x < 0) this.position.x = this.canvasWidth;
    if (this.position.y > this.canvasHeight) this.position.y = 0;
    if (this.position.y < 0) this.position.y = this.canvasHeight;
  }

  applyForce(force) {
    this.acceleration.add(force);
  }

  hunt(pets) {
    let closest = null;
    let closestDist = Infinity;

    for (const pet of pets) {
      const d = this.position.dist(pet.position);
      if (d < this.senseRange && d < closestDist) {
        closestDist = d;
        closest = pet;
      }
    }

    if (closest) {
      const seekForce = this.seek(closest.position);
      this.applyForce(seekForce);
    } else {
      const wanderForce = Vector2D.random2D().mult(0.1);
      this.applyForce(wanderForce);
    }
  }

  render(ctx) {
    ctx.save();
    ctx.translate(this.position.x, this.position.y);

    const angle = Math.atan2(this.velocity.y, this.velocity.x) + Math.PI / 2;
    ctx.rotate(angle);

    ctx.shadowBlur = 20;
    ctx.shadowColor = "#f87171";
    ctx.fillStyle = "#f87171";
    ctx.beginPath();
    ctx.moveTo(0, -this.size);
    ctx.lineTo(-this.size * 0.7, this.size * 0.7);
    ctx.lineTo(this.size * 0.7, this.size * 0.7);
    ctx.closePath();
    ctx.fill();
    ctx.shadowBlur = 0;

    ctx.strokeStyle = "#ef4444";
    ctx.lineWidth = 2;
    ctx.stroke();

    ctx.restore();
  }
}

// ==================== PET CLASS ====================
class Pet {
  constructor(x, y, dna = null, canvasWidth, canvasHeight) {
    this.position = new Vector2D(x, y);
    this.velocity = Vector2D.random2D();
    this.acceleration = new Vector2D(0, 0);
    this.canvasWidth = canvasWidth;
    this.canvasHeight = canvasHeight;

    this.dna = dna || [
      Math.random() * 10,
      Math.random() * 10,
      Math.random() * 10,
      Math.random() * 10,
    ];

    this.maxSpeed = this.mapDNA(this.dna[0], 1, 5);
    this.size = this.mapDNA(this.dna[1], 4, 14);
    this.senseRange = this.mapDNA(this.dna[2], 50, 200);
    this.health = this.mapDNA(this.dna[3], 50, 150);
    this.maxHealth = this.health;
    this.energy = 100;
    this.maxForce = 0.2;

    this.wanderAngle = Math.random() * Math.PI * 2;
    this.birthTime = Date.now();
    this.generation = 1;
    this.pathIndex = 0;
    this.currentPath = null;
  }

  mapDNA(value, min, max) {
    return min + (value / 10) * (max - min);
  }

  seek(target) {
    const desired = Vector2D.sub(target, this.position);
    desired.setMag(this.maxSpeed);
    const steer = Vector2D.sub(desired, this.velocity);
    steer.limit(this.maxForce);
    return steer;
  }

  flee(target) {
    const desired = Vector2D.sub(target, this.position);
    desired.setMag(this.maxSpeed);
    desired.mult(-1);
    const steer = Vector2D.sub(desired, this.velocity);
    steer.limit(this.maxForce);
    return steer;
  }

  wander() {
    const wanderRadius = 50;
    const wanderDistance = 80;
    const changeAngle = 0.3;

    this.wanderAngle += (Math.random() - 0.5) * changeAngle;

    const circlePos = this.velocity.copy();
    circlePos.normalize();
    circlePos.mult(wanderDistance);

    const displacement = new Vector2D(
      Math.cos(this.wanderAngle) * wanderRadius,
      Math.sin(this.wanderAngle) * wanderRadius
    );

    const wanderForce = circlePos.add(displacement);
    wanderForce.limit(this.maxForce);
    return wanderForce;
  }

  behaviors(food, predators, pets, grid) {
    let foodForce = new Vector2D(0, 0);
    let predatorForce = new Vector2D(0, 0);

    let closestFood = null;
    let closestFoodDist = Infinity;

    for (const f of food) {
      const d = this.position.dist(f.position);
      if (d < this.senseRange && d < closestFoodDist) {
        closestFoodDist = d;
        closestFood = f;
      }
    }

    if (closestFood && food.length < 5) {
      if (!this.currentPath || this.pathIndex >= this.currentPath.length) {
        this.currentPath = grid.findPath(this.position, closestFood.position);
        this.pathIndex = 0;
      }

      if (this.currentPath && this.pathIndex < this.currentPath.length) {
        const targetPoint = this.currentPath[this.pathIndex];
        if (this.position.dist(targetPoint) < 10) {
          this.pathIndex++;
        }
        if (this.pathIndex < this.currentPath.length) {
          foodForce = this.seek(this.currentPath[this.pathIndex]);
          foodForce.mult(2);
        }
      }
    } else if (closestFood) {
      this.currentPath = null;
      foodForce = this.seek(closestFood.position);
      foodForce.mult(2);
    }

    for (const predator of predators) {
      const d = this.position.dist(predator.position);
      if (d < this.senseRange) {
        const fleeForce = this.flee(predator.position);
        fleeForce.mult(3);
        predatorForce.add(fleeForce);
      }
    }

    const wanderForce = this.wander();

    this.applyForce(foodForce);
    this.applyForce(predatorForce);
    this.applyForce(wanderForce);
  }

  update(deltaTime = 1) {
    this.velocity.add(this.acceleration);
    this.velocity.limit(this.maxSpeed);
    this.position.add(this.velocity.copy().mult(deltaTime));
    this.acceleration.mult(0);

    this.energy -= 0.1 * deltaTime;
    this.health -= 0.05 * deltaTime;

    this.edges();
  }

  edges() {
    if (this.position.x > this.canvasWidth) this.position.x = 0;
    if (this.position.x < 0) this.position.x = this.canvasWidth;
    if (this.position.y > this.canvasHeight) this.position.y = 0;
    if (this.position.y < 0) this.position.y = this.canvasHeight;
  }

  applyForce(force) {
    this.acceleration.add(force);
  }

  eat(food) {
    this.energy = Math.min(this.energy + food.energy, 200);
    this.health = Math.min(this.health + 10, this.maxHealth);
    this.currentPath = null;
  }

  isDead() {
    return this.health <= 0 || this.energy <= 0;
  }

  canReproduce() {
    return this.energy > 120;
  }

  reproduce(partner) {
    const childDNA = [];
    for (let i = 0; i < this.dna.length; i++) {
      const gene = Math.random() < 0.5 ? this.dna[i] : partner.dna[i];
      const mutation = (Math.random() - 0.5) * 2;
      childDNA.push(Math.max(0, Math.min(10, gene + mutation)));
    }

    const midX = (this.position.x + partner.position.x) / 2;
    const midY = (this.position.y + partner.position.y) / 2;
    const child = new Pet(
      midX,
      midY,
      childDNA,
      this.canvasWidth,
      this.canvasHeight
    );
    child.generation = Math.max(this.generation, partner.generation) + 1;

    this.energy -= 40;
    partner.energy -= 40;

    return child;
  }

  render(ctx, time) {
    const barWidth = this.size * 2;
    const barHeight = 3;
    const healthPercent = this.health / this.maxHealth;

    ctx.fillStyle = "rgba(51, 65, 85, 0.5)";
    ctx.fillRect(
      this.position.x - barWidth / 2,
      this.position.y - this.size - 8,
      barWidth,
      barHeight
    );
    ctx.fillStyle =
      healthPercent > 0.5
        ? "#34d399"
        : healthPercent > 0.25
        ? "#fbbf24"
        : "#f87171";
    ctx.fillRect(
      this.position.x - barWidth / 2,
      this.position.y - this.size - 8,
      barWidth * healthPercent,
      barHeight
    );

    const hue = 210 + this.dna[0] * 15;
    const pulse = Math.sin(time * 0.005) * 0.1 + 1;

    ctx.shadowBlur = 12;
    ctx.shadowColor = `hsl(${hue}, 80%, 60%)`;
    ctx.fillStyle = `hsl(${hue}, 80%, 60%)`;
    ctx.beginPath();
    ctx.arc(
      this.position.x,
      this.position.y,
      this.size * pulse,
      0,
      Math.PI * 2
    );
    ctx.fill();
    ctx.shadowBlur = 0;

    ctx.strokeStyle = `hsl(${hue}, 80%, 45%)`;
    ctx.lineWidth = 2;
    ctx.stroke();

    ctx.fillStyle = "#fff";
    ctx.beginPath();
    ctx.arc(
      this.position.x - this.size * 0.3,
      this.position.y - this.size * 0.2,
      this.size * 0.2,
      0,
      Math.PI * 2
    );
    ctx.arc(
      this.position.x + this.size * 0.3,
      this.position.y - this.size * 0.2,
      this.size * 0.2,
      0,
      Math.PI * 2
    );
    ctx.fill();

    ctx.fillStyle = "#000";
    ctx.beginPath();
    ctx.arc(
      this.position.x - this.size * 0.3,
      this.position.y - this.size * 0.2,
      this.size * 0.1,
      0,
      Math.PI * 2
    );
    ctx.arc(
      this.position.x + this.size * 0.3,
      this.position.y - this.size * 0.2,
      this.size * 0.1,
      0,
      Math.PI * 2
    );
    ctx.fill();
  }
}

// ==================== ECOSYSTEM ENGINE ====================
class EcosystemEngine {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext("2d");
    this.resizeCanvas();

    this.pets = [];
    this.food = [];
    this.predators = [];
    this.particles = [];
    this.grid = new AStarGrid(this.canvas.width, this.canvas.height);

    this.timeScale = 1;
    this.foodSpawnRate = 0.03;
    this.customDNA = [5, 5, 5, 5];
    this.clickSpawn = null;
    this.isPaused = false;
    this.time = 0;

    this.stats = {
      generation: 1,
      lifespans: [],
      topDNA: null,
      totalDeaths: 0,
      totalBirths: 0,
    };

    this.init();
    this.setupEventListeners();
    this.animate();
  }

  resizeCanvas() {
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;
    this.grid = new AStarGrid(this.canvas.width, this.canvas.height);
  }

  init() {
    for (let i = 0; i < 10; i++) {
      const x = Math.random() * this.canvas.width;
      const y = Math.random() * this.canvas.height;
      this.pets.push(
        new Pet(x, y, null, this.canvas.width, this.canvas.height)
      );
    }

    for (let i = 0; i < 20; i++) {
      this.spawnFood();
    }

    for (let i = 0; i < 2; i++) {
      this.spawnPredator();
    }
  }

  reset() {
    this.pets = [];
    this.food = [];
    this.predators = [];
    this.particles = [];
    this.stats = {
      generation: 1,
      lifespans: [],
      topDNA: null,
      totalDeaths: 0,
      totalBirths: 0,
    };
    this.init();
    showToast("🔄 Ecosystem Reset!");
  }

  spawnFood() {
    const x = Math.random() * this.canvas.width;
    const y = Math.random() * this.canvas.height;
    this.food.push(new Food(x, y));
  }

  spawnPredator() {
    const x = Math.random() * this.canvas.width;
    const y = Math.random() * this.canvas.height;
    this.predators.push(
      new Predator(x, y, this.canvas.width, this.canvas.height)
    );
  }

  spawnCustomPet(x, y) {
    const pet = new Pet(
      x,
      y,
      [...this.customDNA],
      this.canvas.width,
      this.canvas.height
    );
    this.pets.push(pet);

    for (let i = 0; i < 10; i++) {
      this.particles.push(new Particle(x, y, "#60a5fa"));
    }

    showToast("✨ Custom Pet Spawned!");
  }

  createParticles(x, y, color, count = 8) {
    for (let i = 0; i < count; i++) {
      this.particles.push(new Particle(x, y, color));
    }
  }

  update() {
    if (this.isPaused) return;

    this.time += this.timeScale;
    const deltaTime = this.timeScale;

    for (let i = this.particles.length - 1; i >= 0; i--) {
      this.particles[i].update();
      if (this.particles[i].isDead()) {
        this.particles.splice(i, 1);
      }
    }

    for (let i = this.pets.length - 1; i >= 0; i--) {
      const pet = this.pets[i];
      pet.behaviors(this.food, this.predators, this.pets, this.grid);
      pet.update(deltaTime);

      for (let j = this.food.length - 1; j >= 0; j--) {
        if (
          pet.position.dist(this.food[j].position) <
          pet.size + this.food[j].radius
        ) {
          pet.eat(this.food[j]);
          this.createParticles(
            this.food[j].position.x,
            this.food[j].position.y,
            "#34d399",
            5
          );
          this.food.splice(j, 1);
        }
      }

      for (const predator of this.predators) {
        if (pet.position.dist(predator.position) < pet.size + predator.size) {
          const lifespan = (Date.now() - pet.birthTime) / 1000;
          this.stats.lifespans.push(lifespan);
          this.stats.totalDeaths++;
          this.createParticles(pet.position.x, pet.position.y, "#f87171", 12);
          this.pets.splice(i, 1);
          break;
        }
      }

      if (pet.isDead()) {
        const lifespan = (Date.now() - pet.birthTime) / 1000;
        this.stats.lifespans.push(lifespan);
        this.stats.totalDeaths++;
        this.createParticles(pet.position.x, pet.position.y, "#94a3b8", 8);
        this.pets.splice(i, 1);
      }
    }

    for (let i = 0; i < this.pets.length; i++) {
      if (this.pets[i].canReproduce()) {
        for (let j = i + 1; j < this.pets.length; j++) {
          if (this.pets[j].canReproduce()) {
            const dist = this.pets[i].position.dist(this.pets[j].position);
            if (dist < this.pets[i].size + this.pets[j].size) {
              const child = this.pets[i].reproduce(this.pets[j]);
              this.pets.push(child);
              this.stats.generation = Math.max(
                this.stats.generation,
                child.generation
              );
              this.stats.totalBirths++;
              this.createParticles(
                child.position.x,
                child.position.y,
                "#fbbf24",
                10
              );
            }
          }
        }
      }
    }

    for (const predator of this.predators) {
      predator.hunt(this.pets);
      predator.update();
    }

    if (
      Math.random() < this.foodSpawnRate * deltaTime &&
      this.food.length < 30
    ) {
      this.spawnFood();
    }

    if (this.pets.length > 0) {
      const bestPet = this.pets.reduce((best, pet) => {
        return pet.energy > best.energy ? pet : best;
      });
      this.stats.topDNA = bestPet.dna;
    }
  }

  render() {
    this.ctx.fillStyle = "rgba(10, 14, 39, 0.15)";
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    for (const particle of this.particles) {
      particle.render(this.ctx);
    }

    for (const f of this.food) {
      f.render(this.ctx, this.time);
    }

    for (const pet of this.pets) {
      pet.render(this.ctx, this.time);
    }

    for (const predator of this.predators) {
      predator.render(this.ctx);
    }

    this.updateUI();
  }

  updateUI() {
    // Update top bar stats
    document.getElementById("pet-count-top").textContent = this.pets.length;
    document.getElementById("food-count-top").textContent = this.food.length;
    document.getElementById("predator-count-top").textContent =
      this.predators.length;
    document.getElementById("generation-top").textContent =
      this.stats.generation;

    // Update DNA display
    if (this.stats.topDNA) {
      const dnaStr = this.stats.topDNA.map((g) => g.toFixed(1)).join(", ");
      document.getElementById(
        "top-dna"
      ).textContent = `[${dnaStr}] - Speed, Size, Sense, Health`;
    }
  }

  updateTraitPreviews() {
    const speed = this.customDNA[0];
    const size = this.customDNA[1];
    const sense = this.customDNA[2];
    const health = this.customDNA[3];

    document.getElementById("preview-speed").textContent = (
      1 +
      (speed / 10) * 4
    ).toFixed(1);
    document.getElementById("preview-size").textContent = (
      4 +
      (size / 10) * 10
    ).toFixed(1);
    document.getElementById("preview-sense").textContent = Math.floor(
      50 + (sense / 10) * 150
    );
    document.getElementById("preview-health").textContent = Math.floor(
      50 + (health / 10) * 100
    );
  }

  setupEventListeners() {
    window.addEventListener("resize", () => this.resizeCanvas());

    const sliders = ["speed", "size", "sense", "health"];
    sliders.forEach((name, index) => {
      const slider = document.getElementById(`${name}-slider`);
      const display = document.getElementById(`${name}-value`);
      slider.addEventListener("input", (e) => {
        const value = parseFloat(e.target.value);
        display.textContent = value;
        this.customDNA[index] = value;
        this.updateTraitPreviews();
      });
    });

    const timeSlider = document.getElementById("timescale-slider");
    const timeDisplay = document.getElementById("timescale-value");
    timeSlider.addEventListener("input", (e) => {
      this.timeScale = parseFloat(e.target.value);
      timeDisplay.textContent = this.timeScale.toFixed(1) + "x";
    });

    const foodSlider = document.getElementById("foodrate-slider");
    const foodDisplay = document.getElementById("foodrate-value");
    foodSlider.addEventListener("input", (e) => {
      this.foodSpawnRate = parseFloat(e.target.value) / 100;
      foodDisplay.textContent = e.target.value + "%";
    });

    document.getElementById("spawn-btn").addEventListener("click", () => {
      this.clickSpawn = true;
      showToast("👆 Click on canvas to spawn!", 1500);
    });

    document.getElementById("pause-btn").addEventListener("click", () => {
      this.isPaused = !this.isPaused;
      const btn = document.getElementById("pause-btn");
      const overlay = document.getElementById("pause-overlay");
      if (this.isPaused) {
        btn.innerHTML = "▶️ Resume";
        overlay.classList.add("visible");
        showToast("⏸️ Paused");
      } else {
        btn.innerHTML = "⏸️ Pause";
        overlay.classList.remove("visible");
        showToast("▶️ Resumed");
      }
    });

    document.getElementById("reset-btn").addEventListener("click", () => {
      if (confirm("Are you sure you want to reset the ecosystem?")) {
        this.reset();
      }
    });

    document.getElementById("spawn-food-btn").addEventListener("click", () => {
      for (let i = 0; i < 5; i++) {
        this.spawnFood();
      }
      showToast("🍎 +5 Food Spawned!");
    });

    document
      .getElementById("spawn-predator-btn")
      .addEventListener("click", () => {
        this.spawnPredator();
        showToast("⚠️ Predator Spawned!");
      });

    this.canvas.addEventListener("click", (e) => {
      if (this.clickSpawn) {
        this.spawnCustomPet(e.clientX, e.clientY);
        this.clickSpawn = false;
      }
    });

    document.addEventListener("keydown", (e) => {
      if (e.code === "Space") {
        e.preventDefault();
        document.getElementById("pause-btn").click();
      }
    });

    this.updateTraitPreviews();
  }

  animate() {
    this.update();
    this.render();
    requestAnimationFrame(() => this.animate());
  }
}

const canvas = document.getElementById("ecosystem-canvas");
const ecosystem = new EcosystemEngine(canvas);
