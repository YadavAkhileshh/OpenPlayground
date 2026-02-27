class PlanetDefender {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext("2d");

    this.canvas.width = 1000;
    this.canvas.height = 600;

    this.planet = { x: 500, y: 550, radius: 40 };
    this.health = 100;
    this.score = 0;
    this.wave = 1;
    this.shields = 3;

    this.enemies = [];
    this.bullets = [];
    this.weapon = "laser";

    this.spawnEnemies();
    this.setupControls();
  }

  setupControls() {
    this.canvas.addEventListener("click", (e) => {
      const rect = this.canvas.getBoundingClientRect();
      this.shoot(e.clientX - rect.left, e.clientY - rect.top);
    });
  }

  spawnEnemies() {
    for (let i = 0; i < 5 + this.wave * 2; i++) {
      this.enemies.push({
        x: Math.random() * 1000,
        y: -50 - Math.random() * 200,
        vx: Math.random() * 2 - 1,
        vy: 1 + Math.random(),
        radius: 20,
        health: 2,
      });
    }
  }

  shoot(tx, ty) {
    const dx = tx - this.planet.x;
    const dy = ty - this.planet.y;
    const dist = Math.sqrt(dx * dx + dy * dy);
    this.bullets.push({
      x: this.planet.x,
      y: this.planet.y,
      vx: (dx / dist) * 10,
      vy: (dy / dist) * 10,
      radius: 5,
      weapon: this.weapon,
    });
  }

  update() {
    this.enemies.forEach((e, i) => {
      e.x += e.vx;
      e.y += e.vy;
      if (e.y > this.canvas.height) {
        this.enemies.splice(i, 1);
        this.health -= 10;
      }
    });

    this.bullets.forEach((b, i) => {
      b.x += b.vx;
      b.y += b.vy;
      if (
        b.x < 0 ||
        b.x > this.canvas.width ||
        b.y < 0 ||
        b.y > this.canvas.height
      ) {
        this.bullets.splice(i, 1);
      }
    });

    if (this.enemies.length === 0) {
      this.wave++;
      this.spawnEnemies();
    }
  }

  render() {
    this.ctx.fillStyle = "#000814";
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    this.ctx.fillStyle = "#00D9FF";
    this.ctx.beginPath();
    this.ctx.arc(
      this.planet.x,
      this.planet.y,
      this.planet.radius,
      0,
      Math.PI * 2,
    );
    this.ctx.fill();

    this.enemies.forEach((e) => {
      this.ctx.font = "30px Arial";
      this.ctx.fillText("👾", e.x - 15, e.y + 10);
    });

    this.bullets.forEach((b) => {
      this.ctx.fillStyle = b.weapon === "laser" ? "#39FF14" : "#FFD700";
      this.ctx.beginPath();
      this.ctx.arc(b.x, b.y, b.radius, 0, Math.PI * 2);
      this.ctx.fill();
    });
  }
}
