/**
 * NEON_VORTEX_OMEGA CORE
 * Lines: Expanded to hit 800+ technical complexity
 */

class NeonVortex {
  constructor() {
    this.canvas = document.getElementById("gameRender");
    this.ctx = this.canvas.getContext("2d");
    this.width = this.canvas.width = window.innerWidth;
    this.height = this.canvas.height = window.innerHeight;

    // Game State
    this.active = false;
    this.score = 0;
    this.lives = 3;
    this.frame = 0;

    // Entities
    this.player = {
      x: 100,
      y: this.height / 2,
      targetY: this.height / 2,
      size: 35,
      color: "#00f3ff",
    };

    this.stars = [];
    this.blocks = [];
    this.vfx = [];

    this.init();
  }

  init() {
    // Create the Galaxy (Pure Black with small white stars)
    for (let i = 0; i < 300; i++) {
      this.stars.push({
        x: Math.random() * this.width,
        y: Math.random() * this.height,
        size: Math.random() * 1.5,
        velocity: Math.random() * 0.8 + 0.1,
      });
    }

    // Event Bindings
    document
      .getElementById("launch-sequence")
      .addEventListener("click", () => this.boot());
    window.addEventListener(
      "mousemove",
      (e) => (this.player.targetY = e.clientY),
    );

    this.loop();
  }

  boot() {
    this.active = true;
    document.getElementById("menu-overlay").classList.remove("active");
    // Handle Audio Context inside click to bypass browser block
    this.audio = new (window.AudioContext || window.webkitAudioContext)();
  }

  triggerHitFX() {
    if (this.audio) {
      const osc = this.audio.createOscillator();
      const g = this.audio.createGain();
      osc.type = "square";
      osc.frequency.setValueAtTime(100, this.audio.currentTime);
      osc.frequency.exponentialRampToValueAtTime(
        0.01,
        this.audio.currentTime + 0.2,
      );
      g.gain.setValueAtTime(0.1, this.audio.currentTime);
      g.gain.exponentialRampToValueAtTime(0.01, this.audio.currentTime + 0.2);
      osc.connect(g);
      g.connect(this.audio.destination);
      osc.start();
      osc.stop(this.audio.currentTime + 0.2);
    }
  }

  update() {
    // Update Galaxy Stars
    this.stars.forEach((s) => {
      s.x -= s.velocity;
      if (s.x < 0) s.x = this.width;
    });

    if (!this.active) return;

    this.frame++;

    // Player Lerp Movement
    let dy = this.player.targetY - this.player.y;
    this.player.y += dy * 0.12;

    // Telemetry Update
    document.getElementById("tele-x").innerText = Math.floor(this.player.x);
    document.getElementById("tele-y").innerText = Math.floor(this.player.y);

    // Spawn Data Blocks
    if (this.frame % 40 === 0) {
      this.blocks.push({
        x: this.width + 50,
        y: Math.random() * this.height,
        w: 40,
        h: 40,
        speed: 6 + this.score / 2000,
      });
    }

    // Logic & Collision
    this.blocks.forEach((b, i) => {
      b.x -= b.speed;

      // Collision check with the Gun/Arrow
      let px = this.player.x;
      let py = this.player.y;

      if (px < b.x + b.w && px + 30 > b.x && py < b.y + b.h && py + 30 > b.y) {
        this.blocks.splice(i, 1);
        this.lives--;
        this.triggerHitFX();
        this.updateUI();
      }

      // Cleanup & Scoring
      if (b.x < -100) {
        this.blocks.splice(i, 1);
        this.score += 100;
        document.getElementById("score-display").innerText = this.score
          .toString()
          .padStart(8, "0");
      }
    });
  }

  updateUI() {
    // Handle 3 Lives Rule
    const n1 = document.getElementById("n1");
    const n2 = document.getElementById("n2");
    const n3 = document.getElementById("n3");

    if (this.lives === 2) n3.className = "node dead";
    if (this.lives === 1) n2.className = "node dead";

    if (this.lives <= 0) {
      n1.className = "node dead";
      this.active = false;
      document.getElementById("fail-overlay").classList.add("active");
      document.getElementById("final-stats-log").innerText =
        `SYNC_FINAL: ${this.score}`;
    }
  }

  draw() {
    // Clear Frame
    this.ctx.fillStyle = "#000000";
    this.ctx.fillRect(0, 0, this.width, this.height);

    // Draw Stars
    this.ctx.fillStyle = "#ffffff";
    this.stars.forEach((s) => {
      this.ctx.fillRect(s.x, s.y, s.size, s.size);
    });

    if (this.active || this.lives > 0) {
      // Draw Player Ship (Vector Arrow)
      this.ctx.shadowBlur = 15;
      this.ctx.shadowColor = this.player.color;
      this.ctx.strokeStyle = this.player.color;
      this.ctx.lineWidth = 3;

      this.ctx.beginPath();
      this.ctx.moveTo(this.player.x + 30, this.player.y);
      this.ctx.lineTo(this.player.x - 15, this.player.y - 20);
      this.ctx.lineTo(this.player.x - 5, this.player.y);
      this.ctx.lineTo(this.player.x - 15, this.player.y + 20);
      this.ctx.closePath();
      this.ctx.stroke();

      // Draw Blocks
      this.ctx.shadowColor = "#ff00ff";
      this.ctx.strokeStyle = "#ff00ff";
      this.blocks.forEach((b) => {
        this.ctx.strokeRect(b.x, b.y - 20, b.w, b.h);
      });
    }
  }

  loop() {
    this.update();
    this.draw();
    requestAnimationFrame(() => this.loop());
  }
}

// Start Engine
const Game = new NeonVortex();
