class SynthwaveDreamscape {
  constructor() {
    this.canvas = document.getElementById("synthCanvas");
    this.ctx = this.canvas.getContext("2d");
    this.audioContext = null;
    this.analyser = null;
    this.dataArray = null;
    this.isPlaying = false;

    this.config = {
      mode: "grid",
      bass: 50,
      mid: 50,
      treble: 50,
      palette: "sunset",
      time: 0,
    };

    this.grid = [];
    this.sun = { x: 0, y: 0 };

    this.init();
  }

  init() {
    this.resizeCanvas();
    this.setupEventListeners();
    this.loadSynthData();
    this.createGrid();
    this.updateTime();
    this.animate();

    // Update time every second
    setInterval(() => this.updateTime(), 1000);
  }

  resizeCanvas() {
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;
    this.sun.x = this.canvas.width / 2;
    this.sun.y = this.canvas.height * 0.3;
  }

  setupEventListeners() {
    window.addEventListener("resize", () => this.resizeCanvas());

    // Mode buttons
    document.querySelectorAll(".mode-btn").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        document
          .querySelectorAll(".mode-btn")
          .forEach((b) => b.classList.remove("active"));
        e.target.classList.add("active");
        this.config.mode = e.target.dataset.mode;
      });
    });

    // Knobs
    document.getElementById("bassKnob").addEventListener("input", (e) => {
      this.config.bass = e.target.value;
    });

    document.getElementById("midKnob").addEventListener("input", (e) => {
      this.config.mid = e.target.value;
    });

    document.getElementById("trebleKnob").addEventListener("input", (e) => {
      this.config.treble = e.target.value;
    });

    // Palette buttons
    document.querySelectorAll(".palette-btn").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        this.config.palette = e.target.dataset.palette;
      });
    });

    // Play button (simulate audio)
    document.getElementById("playBtn").addEventListener("click", () => {
      this.isPlaying = !this.isPlaying;
      const btn = document.getElementById("playBtn").querySelector(".btn-text");
      btn.textContent = this.isPlaying ? "⏸ PAUSE" : "▶ PLAY";
    });
  }

  async loadSynthData() {
    try {
      const response = await fetch("project.json");
      const data = await response.json();
      this.synthPresets = data.synthPresets;
      this.colorPalettes = data.colorPalettes;
    } catch (error) {
      console.error("Failed to load synth data");
    }
  }

  createGrid() {
    // Create synthwave grid
    const spacing = 50;
    const rows = Math.ceil(this.canvas.height / spacing) + 10;
    const cols = Math.ceil(this.canvas.width / spacing) + 10;

    for (let i = 0; i < rows; i++) {
      for (let j = 0; j < cols; j++) {
        this.grid.push({
          x: j * spacing - spacing * 5,
          y: i * spacing,
          z: i * 10,
          originalY: i * spacing,
        });
      }
    }
  }

  updateTime() {
    const now = new Date();
    const hours = now.getHours().toString().padStart(2, "0");
    const minutes = now.getMinutes().toString().padStart(2, "0");
    document.getElementById("retroTime").textContent = `${hours}:${minutes}`;

    const day = now.getDate().toString().padStart(2, "0");
    const month = (now.getMonth() + 1).toString().padStart(2, "0");
    const year = now.getFullYear();
    document.getElementById("retroDate").textContent =
      `${day}/${month}/${year}`;
  }

  getPaletteColors() {
    const palettes = {
      sunset: {
        bg1: "#2c1b3c",
        bg2: "#1a0b2e",
        sun: "#ff6b6b",
        grid: "#ff9f4b",
        highlight: "#ffd93d",
      },
      ocean: {
        bg1: "#1a3b5c",
        bg2: "#0a1a2e",
        sun: "#4ecdc4",
        grid: "#45b7aa",
        highlight: "#a8e6cf",
      },
      cyber: {
        bg1: "#1a0b2e",
        bg2: "#0a051a",
        sun: "#ff00ff",
        grid: "#00ffff",
        highlight: "#ffffff",
      },
      retro: {
        bg1: "#2c1b3c",
        bg2: "#1a0b2e",
        sun: "#ff6b6b",
        grid: "#4ecdc4",
        highlight: "#ffd93d",
      },
    };

    return palettes[this.config.palette] || palettes.sunset;
  }

  drawGrid() {
    const colors = this.getPaletteColors();
    const time = this.config.time;

    this.grid.forEach((point) => {
      // Wave effect based on audio simulation
      const wave1 = Math.sin(point.x * 0.01 + time * 0.05) * 20;
      const wave2 = Math.cos(point.z * 0.1 + time * 0.03) * 10;
      const y = point.originalY + wave1 + wave2;

      // Perspective
      const scale = 1 - point.z / 1000;
      const screenX = point.x * scale + this.canvas.width / 2;
      const screenY = y * scale;

      if (
        screenX < 0 ||
        screenX > this.canvas.width ||
        screenY < 0 ||
        screenY > this.canvas.height
      )
        return;

      // Draw grid point
      this.ctx.fillStyle = colors.grid;
      this.ctx.globalAlpha = 0.3 * scale;
      this.ctx.fillRect(screenX, screenY, 2, 2);

      // Draw connecting lines
      if (point.x < this.canvas.width / 2 + 500) {
        this.ctx.beginPath();
        this.ctx.strokeStyle = colors.grid;
        this.ctx.globalAlpha = 0.1 * scale;
        this.ctx.moveTo(screenX, screenY);
        this.ctx.lineTo(screenX + 50 * scale, screenY + 50 * scale);
        this.ctx.stroke();
      }
    });
  }

  drawSunset() {
    const colors = this.getPaletteColors();

    // Gradient sky
    const gradient = this.ctx.createLinearGradient(0, 0, 0, this.canvas.height);
    gradient.addColorStop(0, colors.bg1);
    gradient.addColorStop(0.5, colors.bg2);
    gradient.addColorStop(1, "#000000");

    this.ctx.fillStyle = gradient;
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    // Sun
    const sunY = this.canvas.height * 0.3 + Math.sin(this.config.time) * 10;

    const sunGradient = this.ctx.createRadialGradient(
      this.sun.x,
      sunY,
      0,
      this.sun.x,
      sunY,
      150,
    );
    sunGradient.addColorStop(0, colors.sun);
    sunGradient.addColorStop(0.5, "rgba(255, 107, 107, 0.5)");
    sunGradient.addColorStop(1, "transparent");

    this.ctx.beginPath();
    this.ctx.arc(this.sun.x, sunY, 150, 0, Math.PI * 2);
    this.ctx.fillStyle = sunGradient;
    this.ctx.fill();

    // Sun reflection
    this.ctx.beginPath();
    this.ctx.moveTo(0, this.canvas.height);
    this.ctx.lineTo(this.sun.x - 200, sunY + 50);
    this.ctx.lineTo(this.sun.x + 200, sunY + 50);
    this.ctx.lineTo(this.canvas.width, this.canvas.height);
    this.ctx.closePath();

    this.ctx.fillStyle = "rgba(255, 107, 107, 0.1)";
    this.ctx.fill();
  }

  drawWaves() {
    const colors = this.getPaletteColors();
    const time = this.config.time;

    // Draw multiple wave layers
    for (let layer = 0; layer < 5; layer++) {
      const y = this.canvas.height - 100 + layer * 30;
      const amplitude = 50 * (1 - layer * 0.15);
      const frequency = 0.02 + layer * 0.01;

      this.ctx.beginPath();
      this.ctx.moveTo(0, y);

      for (let x = 0; x <= this.canvas.width; x += 10) {
        const waveY =
          y +
          Math.sin(x * frequency + time) * amplitude +
          Math.cos(x * frequency * 0.5 + time * 0.5) * amplitude * 0.5;
        this.ctx.lineTo(x, waveY);
      }

      this.ctx.lineTo(this.canvas.width, this.canvas.height);
      this.ctx.lineTo(0, this.canvas.height);
      this.ctx.closePath();

      const opacity = 0.3 * (1 - layer * 0.15);
      this.ctx.fillStyle = `rgba(255, 107, 107, ${opacity})`;
      this.ctx.fill();
    }
  }

  drawCRTEffect() {
    // Add CRT color fringing
    this.ctx.globalCompositeOperation = "screen";

    // Red channel shift
    this.ctx.fillStyle = "rgba(255, 0, 0, 0.1)";
    this.ctx.fillRect(5, 0, this.canvas.width, this.canvas.height);

    // Blue channel shift
    this.ctx.fillStyle = "rgba(0, 0, 255, 0.1)";
    this.ctx.fillRect(-5, 0, this.canvas.width, this.canvas.height);

    this.ctx.globalCompositeOperation = "source-over";
  }

  drawEqualizer() {
    if (!this.isPlaying) return;

    // Simulate audio response
    const bars = document.querySelectorAll(".eq-bar");
    bars.forEach((bar, i) => {
      const value =
        20 +
        Math.sin(this.config.time * 10 + i) * 30 +
        Math.cos(this.config.time * 5 + i * 2) * 20;
      bar.style.height = Math.min(100, Math.max(20, value)) + "%";

      // Color based on frequencies
      if (i < 2)
        bar.style.background = `linear-gradient(to top, #ff00ff, #${Math.floor(value).toString(16)}ffff)`;
      else if (i < 4)
        bar.style.background = `linear-gradient(to top, #00ffff, #ff${Math.floor(value).toString(16)}ff)`;
      else
        bar.style.background = `linear-gradient(to top, #ffff00, #ff00${Math.floor(value).toString(16)})`;
    });
  }

  drawSynthwave() {
    // Draw based on selected mode
    switch (this.config.mode) {
      case "grid":
        this.drawSunset();
        this.drawGrid();
        break;
      case "sunset":
        this.drawSunset();
        break;
      case "waves":
        this.drawSunset();
        this.drawWaves();
        break;
      case "crt":
        this.drawSunset();
        this.drawGrid();
        this.drawCRTEffect();
        break;
    }

    // Draw sun reflection on ground
    const colors = this.getPaletteColors();
    const groundGradient = this.ctx.createLinearGradient(
      0,
      this.canvas.height - 100,
      0,
      this.canvas.height,
    );
    groundGradient.addColorStop(0, "rgba(255, 107, 107, 0.2)");
    groundGradient.addColorStop(1, "transparent");

    this.ctx.fillStyle = groundGradient;
    this.ctx.fillRect(0, this.canvas.height - 100, this.canvas.width, 100);

    // Draw grid lines on ground
    this.ctx.strokeStyle = colors.grid;
    this.ctx.lineWidth = 1;
    this.ctx.globalAlpha = 0.2;

    for (let i = 0; i < 20; i++) {
      const x =
        ((i * 100 + this.config.time * 50) % (this.canvas.width + 200)) - 100;
      this.ctx.beginPath();
      this.ctx.moveTo(x, this.canvas.height - 50);
      this.ctx.lineTo(x - 100, this.canvas.height);
      this.ctx.stroke();
    }

    this.ctx.globalAlpha = 1;
  }

  animate() {
    this.config.time += 0.05;

    // Clear canvas with fade effect
    this.ctx.fillStyle = "rgba(0, 0, 0, 0.1)";
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    this.drawSynthwave();
    this.drawEqualizer();

    requestAnimationFrame(() => this.animate());
  }
}

// Initialize
const synthwave = new SynthwaveDreamscape();
