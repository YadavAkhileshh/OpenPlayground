// ======================= CONFIG =======================
const CONFIG = {
  WIDTH: 900,
  HEIGHT: 550,

  ANT_COUNT: 200,
  ANT_SPEED: 1.2,
  TURN_RATE: 0.3,

  SENSOR_DIST: 12,
  SENSOR_ANGLE: Math.PI / 6,

  PHEROMONE_DECAY: 0.992,
  PHEROMONE_STRENGTH: 1,

  FOOD_SOURCES: 3,
  FOOD_AMOUNT: 700
};

// ======================= STATE ========================
const state = {
  ants: [],
  pheromones: [],
  foods: [],
  running: true,
  speed: 1
};

// ======================= CONSTANTS ====================
const NEST = {
  x: CONFIG.WIDTH / 2,
  y: CONFIG.HEIGHT / 2
};

// ======================= UTILS ========================
function rand(min, max) {
  return Math.random() * (max - min) + min;
}

// ======================= ANT ==========================
class Ant {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.angle = rand(0, Math.PI * 2);
    this.hasFood = false;
  }

  sensePheromones() {
    const sample = offset => {
      const sx = this.x + Math.cos(this.angle + offset) * CONFIG.SENSOR_DIST;
      const sy = this.y + Math.sin(this.angle + offset) * CONFIG.SENSOR_DIST;
      let strength = 0;

      for (let p of state.pheromones) {
        const dx = p.x - sx;
        const dy = p.y - sy;
        if (dx * dx + dy * dy < 100) strength += p.strength;
      }
      return strength;
    };

    const left = sample(-CONFIG.SENSOR_ANGLE);
    const center = sample(0);
    const right = sample(CONFIG.SENSOR_ANGLE);

    if (left > right) this.angle -= CONFIG.TURN_RATE;
    else if (right > left) this.angle += CONFIG.TURN_RATE;
    else this.angle += rand(-0.05, 0.05);
  }

  interactWithFood() {
    for (let food of state.foods) {
      const dx = food.x - this.x;
      const dy = food.y - this.y;
      if (dx * dx + dy * dy < 36 && food.amount > 0 && !this.hasFood) {
        this.hasFood = true;
        food.amount--;
        this.angle += Math.PI;
      }
    }
  }

  interactWithNest() {
    const dx = NEST.x - this.x;
    const dy = NEST.y - this.y;
    if (dx * dx + dy * dy < 64 && this.hasFood) {
      this.hasFood = false;
      this.angle = rand(0, Math.PI * 2);
    }
  }

  move() {
    this.x += Math.cos(this.angle) * CONFIG.ANT_SPEED;
    this.y += Math.sin(this.angle) * CONFIG.ANT_SPEED;

    if (this.x < 0 || this.x > CONFIG.WIDTH) this.angle += Math.PI;
    if (this.y < 0 || this.y > CONFIG.HEIGHT) this.angle += Math.PI;
  }

  update() {
    this.sensePheromones();
    this.move();
    this.interactWithFood();
    this.interactWithNest();

    state.pheromones.push({
      x: this.x,
      y: this.y,
      strength: CONFIG.PHEROMONE_STRENGTH,
      carrying: this.hasFood
    });
  }
}

// ======================= FOOD =========================
function createFood() {
  state.foods = [];
  for (let i = 0; i < CONFIG.FOOD_SOURCES; i++) {
    state.foods.push({
      x: rand(80, CONFIG.WIDTH - 80),
      y: rand(80, CONFIG.HEIGHT - 80),
      amount: CONFIG.FOOD_AMOUNT
    });
  }
}

// ======================= PHEROMONES ===================
function updatePheromones() {
  state.pheromones.forEach(p => p.strength *= CONFIG.PHEROMONE_DECAY);
  state.pheromones = state.pheromones.filter(p => p.strength > 0.05);
}

// ======================= RENDER =======================
const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");
canvas.width = CONFIG.WIDTH;
canvas.height = CONFIG.HEIGHT;

function render() {
  ctx.clearRect(0, 0, CONFIG.WIDTH, CONFIG.HEIGHT);

  // pheromones
  state.pheromones.forEach(p => {
    ctx.fillStyle = p.carrying
      ? "rgba(0,255,0,0.25)"
      : "rgba(0,255,255,0.18)";
    ctx.fillRect(p.x, p.y, 2, 2);
  });

  // nest
  ctx.fillStyle = "orange";
  ctx.beginPath();
  ctx.arc(NEST.x, NEST.y, 8, 0, Math.PI * 2);
  ctx.fill();

  // food
  ctx.fillStyle = "green";
  state.foods.forEach(f => {
    ctx.beginPath();
    ctx.arc(f.x, f.y, 6, 0, Math.PI * 2);
    ctx.fill();
  });

  // ants
  ctx.fillStyle = "white";
  state.ants.forEach(a => {
    ctx.fillRect(a.x, a.y, 2, 2);
  });

  // HUD
  ctx.fillStyle = "#94a3b8";
  ctx.fillText(`Ants: ${state.ants.length}`, 10, 20);
  ctx.fillText(`Pheromones: ${state.pheromones.length}`, 10, 40);
}

// ======================= LOOP =========================
function step() {
  if (!state.running) return;

  for (let i = 0; i < state.speed; i++) {
    state.ants.forEach(a => a.update());
    updatePheromones();
  }
}

function loop() {
  step();
  render();
  requestAnimationFrame(loop);
}

// ======================= CONTROLS =====================
document.getElementById("toggle").onclick = () => {
  state.running = !state.running;
  document.getElementById("toggle").textContent =
    state.running ? "Pause" : "Resume";
};

document.getElementById("reset").onclick = init;

document.getElementById("speed").oninput = e => {
  state.speed = +e.target.value;
};

// ======================= INIT =========================
function init() {
  state.ants = [];
  state.pheromones = [];
  createFood();

  for (let i = 0; i < CONFIG.ANT_COUNT; i++) {
    state.ants.push(new Ant(NEST.x, NEST.y));
  }
}

init();
loop();
