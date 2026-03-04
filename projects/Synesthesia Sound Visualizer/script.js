class SynesthesiaCanvas {
  constructor() {
    this.canvas = document.getElementById("soundCanvas");
    this.ctx = this.canvas.getContext("2d");
    this.mouseTrail = document.getElementById("mouseTrail");
    this.fpsCounter = document.getElementById("fpsCounter");

    this.mouse = { x: 0, y: 0, vx: 0, vy: 0 };
    this.lastMouse = { x: 0, y: 0 };
    this.particles = [];
    this.frames = 0;
    this.lastFpsUpdate = performance.now();

    this.config = {
      frequency: 1,
      harmonic: "sine",
      colorMode: "psychedelic",
      visualization: "waves",
      time: 0,
    };

    this.init();
  }

  init() {
    this.resizeCanvas();
    this.setupEventListeners();
    this.loadConfig();
    this.animate();
  }

  resizeCanvas() {
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;
  }

  setupEventListeners() {
    window.addEventListener("resize", () => this.resizeCanvas());

    document.addEventListener("mousemove", (e) => {
      this.lastMouse.x = this.mouse.x;
      this.lastMouse.y = this.mouse.y;
      this.mouse.x = e.clientX;
      this.mouse.y = e.clientY;
      this.mouse.vx = this.mouse.x - this.lastMouse.x;
      this.mouse.vy = this.mouse.y - this.lastMouse.y;

      // Update mouse trail
      this.mouseTrail.style.left = this.mouse.x - 10 + "px";
      this.mouseTrail.style.top = this.mouse.y - 10 + "px";
      this.mouseTrail.style.background = this.getColorFromPosition();
      this.mouseTrail.style.width = 20 + Math.abs(this.mouse.vx) * 2 + "px";
      this.mouseTrail.style.height = 20 + Math.abs(this.mouse.vy) * 2 + "px";
    });

    // Frequency slider
    document.getElementById("freqSlider").addEventListener("input", (e) => {
      this.config.frequency = parseFloat(e.target.value);
    });

    // Harmonic buttons
    document.querySelectorAll(".harmonic").forEach((btn) => {
      btn.addEventListener("click", () => {
        document
          .querySelectorAll(".harmonic")
          .forEach((b) => b.classList.remove("active"));
        btn.classList.add("active");
        this.config.harmonic = btn.dataset.harmonic;
      });
    });

    // Color mode
    document.getElementById("colorModeBtn").addEventListener("click", (e) => {
      const modes = ["psychedelic", "monochrome", "thermal"];
      const currentIndex = modes.indexOf(this.config.colorMode);
      this.config.colorMode = modes[(currentIndex + 1) % modes.length];
      e.target.textContent = `🌈 ${this.config.colorMode}`;
    });

    // Visualization buttons
    document.querySelectorAll(".viz-btn").forEach((btn) => {
      btn.addEventListener("click", () => {
        document
          .querySelectorAll(".viz-btn")
          .forEach((b) => b.classList.remove("active"));
        btn.classList.add("active");
        this.config.visualization = btn.dataset.viz;
      });
    });
  }

  async loadConfig() {
    try {
      const response = await fetch("project.json");
      const data = await response.json();
      // Apply any initial config from JSON
      if (data.initialHarmonic) {
        this.config.harmonic = data.initialHarmonic;
      }
    } catch (error) {
      console.log("Using default config");
    }
  }

  getColorFromPosition() {
    const hue =
      ((this.mouse.x / this.canvas.width) * 360 + this.config.time * 10) % 360;
    const saturation = 80 + Math.sin(this.config.time) * 20;
    const lightness = 50 + Math.cos(this.mouse.y / 100) * 20;
    return `hsl(${hue}, ${saturation}%, ${lightness}%)`;
  }

  generateWave(x) {
    const t = this.config.time;
    const freq = this.config.frequency * 0.01;

    switch (this.config.harmonic) {
      case "sine":
        return Math.sin(x * freq + t) * Math.cos(t * 0.1);
      case "square":
        return Math.sign(Math.sin(x * freq + t)) * Math.sin(t * 0.2);
      case "triangle":
        return Math.asin(Math.sin(x * freq + t)) * 0.5;
      default:
        return Math.sin(x * freq + t);
    }
  }

  drawWaves() {
    this.ctx.beginPath();
    const amplitude = 100;

    for (let x = 0; x < this.canvas.width; x += 2) {
      const y1 =
        this.canvas.height / 2 +
        this.generateWave(x + this.mouse.x) * amplitude;
      const y2 =
        this.canvas.height / 2 +
        this.generateWave(x + this.mouse.y) * amplitude * 0.5;

      const color = this.getColorFromPosition();
      this.ctx.strokeStyle = color;
      this.ctx.lineWidth = 2;

      if (x === 0) {
        this.ctx.moveTo(x, y1);
      } else {
        this.ctx.lineTo(x, y1);
      }
    }
    this.ctx.stroke();

    // Second wave
    this.ctx.beginPath();
    for (let x = 0; x < this.canvas.width; x += 2) {
      const y =
        this.canvas.height / 3 +
        this.generateWave(x * 0.5 + this.mouse.x * 0.1) * amplitude * 0.3;
      if (x === 0) {
        this.ctx.moveTo(x, y);
      } else {
        this.ctx.lineTo(x, y);
      }
    }
    this.ctx.strokeStyle = "rgba(255,255,255,0.3)";
    this.ctx.stroke();
  }

  drawParticles() {
    // Add new particles at mouse position
    if (Math.random() > 0.7) {
      this.particles.push({
        x: this.mouse.x,
        y: this.mouse.y,
        vx: (Math.random() - 0.5) * 5,
        vy: (Math.random() - 0.5) * 5,
        life: 1,
        color: this.getColorFromPosition(),
      });
    }

    // Update and draw particles
    this.particles = this.particles.filter((p) => {
      p.x += p.vx;
      p.y += p.vy;
      p.life -= 0.005;

      if (p.life <= 0) return false;

      this.ctx.beginPath();
      this.ctx.arc(p.x, p.y, 5 * p.life, 0, Math.PI * 2);
      this.ctx.fillStyle = p.color
        .replace("hsl", "hsla")
        .replace(")", `, ${p.life})`);
      this.ctx.fill();

      return true;
    });
  }

  drawMandala() {
    const centerX = this.mouse.x;
    const centerY = this.mouse.y;
    const radius = 100 + Math.sin(this.config.time) * 50;
    const petals = 12 + Math.floor(Math.sin(this.config.time * 0.5) * 4);

    for (let i = 0; i < petals; i++) {
      const angle = (i / petals) * Math.PI * 2 + this.config.time;
      const x = centerX + Math.cos(angle) * radius;
      const y = centerY + Math.sin(angle) * radius;

      const gradient = this.ctx.createRadialGradient(
        centerX,
        centerY,
        0,
        x,
        y,
        radius,
      );
      gradient.addColorStop(0, this.getColorFromPosition());
      gradient.addColorStop(1, "transparent");

      this.ctx.beginPath();
      this.ctx.arc(
        x,
        y,
        30 + Math.sin(angle + this.config.time) * 20,
        0,
        Math.PI * 2,
      );
      this.ctx.fillStyle = gradient;
      this.ctx.fill();

      // Draw connecting lines
      this.ctx.beginPath();
      this.ctx.moveTo(centerX, centerY);
      this.ctx.lineTo(x, y);
      this.ctx.strokeStyle = `hsla(${(angle * 180) / Math.PI}, 70%, 60%, 0.3)`;
      this.ctx.lineWidth = 1;
      this.ctx.stroke();
    }
  }

  updateFPS() {
    this.frames++;
    const now = performance.now();
    const delta = now - this.lastFpsUpdate;

    if (delta >= 1000) {
      const fps = Math.round((this.frames * 1000) / delta);
      this.fpsCounter.textContent = `FPS: ${fps}`;
      this.frames = 0;
      this.lastFpsUpdate = now;
    }
  }

  animate() {
    this.ctx.fillStyle = "rgba(0, 0, 0, 0.1)";
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    this.config.time += 0.02;

    switch (this.config.visualization) {
      case "waves":
        this.drawWaves();
        break;
      case "particles":
        this.drawParticles();
        break;
      case "mandala":
        this.drawMandala();
        break;
    }

    this.updateFPS();
    requestAnimationFrame(() => this.animate());
  }
}

// Initialize
new SynesthesiaCanvas();
