class QuantumLab {
  constructor() {
    this.canvas = document.getElementById("quantumCanvas");
    this.ctx = this.canvas.getContext("2d");
    this.particles = [];
    this.entanglements = [];
    this.observing = false;
    this.uncertainty = 50;
    this.entanglementStrength = 30;

    this.init();
  }

  init() {
    this.resizeCanvas();
    this.setupEventListeners();
    this.loadQuantumData();
    this.animate();
    this.createBackgroundNoise();
  }

  resizeCanvas() {
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;
  }

  setupEventListeners() {
    window.addEventListener("resize", () => this.resizeCanvas());

    document.getElementById("createParticle").addEventListener("click", () => {
      this.createParticle();
    });

    document.getElementById("entangleBtn").addEventListener("click", () => {
      this.entangleRandom();
    });

    document.getElementById("observeBtn").addEventListener("click", () => {
      this.observe();
    });

    document.getElementById("resetBtn").addEventListener("click", () => {
      this.resetUniverse();
    });

    document.getElementById("uncertainty").addEventListener("input", (e) => {
      this.uncertainty = e.target.value;
      this.updateUncertainty();
    });

    document.getElementById("entanglement").addEventListener("input", (e) => {
      this.entanglementStrength = e.target.value;
    });
  }

  async loadQuantumData() {
    try {
      const response = await fetch("project.json");
      const data = await response.json();
      this.quantumConstants = data.quantumConstants;
      this.particleTypes = data.particleTypes;
    } catch (error) {
      console.error("Failed to load quantum data");
    }
  }

  createParticle() {
    const type = document.querySelector('input[name="particle"]:checked').value;
    const particle = {
      id: Math.random().toString(36).substr(2, 9),
      type: type,
      x: Math.random() * this.canvas.width,
      y: Math.random() * this.canvas.height,
      vx: (Math.random() - 0.5) * 2,
      vy: (Math.random() - 0.5) * 2,
      spin: Math.random() > 0.5 ? "up" : "down",
      energy: Math.random() * 100,
      entangled: null,
      color: this.getParticleColor(type),
      size: Math.random() * 10 + 5,
      probability: Math.random(),
    };

    this.particles.push(particle);
    this.updateParticleCount();
    this.createQuantumRipple(particle.x, particle.y);
  }

  getParticleColor(type) {
    const colors = {
      electron: "#00ffff",
      photon: "#ffff00",
      quark: "#ff00ff",
    };
    return colors[type] || "#ffffff";
  }

  createQuantumRipple(x, y) {
    const ripple = document.createElement("div");
    ripple.className = "quantum-glow";
    ripple.style.left = x - 100 + "px";
    ripple.style.top = y - 100 + "px";
    ripple.style.width = "200px";
    ripple.style.height = "200px";
    ripple.style.background =
      "radial-gradient(circle, rgba(0,255,255,0.3) 0%, transparent 70%)";
    ripple.style.position = "absolute";
    ripple.style.pointerEvents = "none";
    ripple.style.animation = "quantumPulse 1s forwards";

    document.querySelector(".probability-cloud").appendChild(ripple);

    setTimeout(() => ripple.remove(), 1000);
  }

  entangleRandom() {
    if (this.particles.length < 2) return;

    const available = this.particles.filter((p) => !p.entangled);
    if (available.length < 2) return;

    const idx1 = Math.floor(Math.random() * available.length);
    let idx2;
    do {
      idx2 = Math.floor(Math.random() * available.length);
    } while (idx2 === idx1);

    const p1 = available[idx1];
    const p2 = available[idx2];

    p1.entangled = p2.id;
    p2.entangled = p1.id;

    this.entanglements.push({
      p1: p1.id,
      p2: p2.id,
      strength: this.entanglementStrength,
    });

    this.createEntanglementEffect(p1, p2);
  }

  createEntanglementEffect(p1, p2) {
    const line = document.createElement("div");
    line.className = "entanglement-line";
    line.style.left = p1.x + "px";
    line.style.top = p1.y + "px";
    line.style.width = Math.hypot(p2.x - p1.x, p2.y - p1.y) + "px";
    line.style.transform = `rotate(${Math.atan2(p2.y - p1.y, p2.x - p1.x)}rad)`;

    document.querySelector(".probability-cloud").appendChild(line);

    setTimeout(() => line.remove(), 2000);
  }

  observe() {
    this.observing = true;

    // Collapse wave functions
    this.particles.forEach((particle) => {
      if (particle.entangled) {
        // Entangled particles affect each other
        const partner = this.particles.find((p) => p.id === particle.entangled);
        if (partner) {
          partner.spin = particle.spin === "up" ? "down" : "up";
        }
      }

      // Heisenberg uncertainty effect
      if (Math.random() * 100 < this.uncertainty) {
        particle.x += (Math.random() - 0.5) * 50;
        particle.y += (Math.random() - 0.5) * 50;
      }

      particle.probability = 1; // Collapsed
    });

    document.body.classList.add("uncertain");

    setTimeout(() => {
      this.observing = false;
      document.body.classList.remove("uncertain");

      // Reset probabilities
      this.particles.forEach((p) => {
        p.probability = Math.random();
      });
    }, 1000);
  }

  resetUniverse() {
    this.particles = [];
    this.entanglements = [];
    this.updateParticleCount();
  }

  updateParticleCount() {
    document.getElementById("particleCount").textContent =
      this.particles.length;
  }

  updateUncertainty() {
    // Visual feedback for uncertainty
    this.ctx.filter = `blur(${this.uncertainty / 20}px)`;
  }

  updateStats() {
    // Update spin statistics
    const upSpins = this.particles.filter((p) => p.spin === "up").length;
    const downSpins = this.particles.length - upSpins;
    const upPercent = this.particles.length
      ? Math.round((upSpins / this.particles.length) * 100)
      : 50;
    const downPercent = 100 - upPercent;
    document.getElementById("spinStat").innerHTML =
      `Spin: ↑ ${upPercent}% ↓ ${downPercent}%`;

    // Update energy (average)
    if (this.particles.length) {
      const avgEnergy =
        this.particles.reduce((sum, p) => sum + p.energy, 0) /
        this.particles.length;
      const energyBars = Math.round(avgEnergy / 10);
      document.getElementById("energyStat").innerHTML =
        `Energy: ${"▰".repeat(energyBars)}${"▱".repeat(10 - energyBars)}`;
    }

    // Update entropy (randomness)
    const entropyBars = Math.round(this.uncertainty / 10);
    document.getElementById("entropyStat").innerHTML =
      `Entropy: ${"▰".repeat(entropyBars)}${"▱".repeat(10 - entropyBars)}`;
  }

  createBackgroundNoise() {
    // Create quantum noise particles
    for (let i = 0; i < 50; i++) {
      const particle = document.createElement("div");
      particle.className = "particle";
      particle.style.left = Math.random() * 100 + "%";
      particle.style.top = Math.random() * 100 + "%";
      particle.style.width = Math.random() * 4 + 1 + "px";
      particle.style.height = particle.style.width;
      particle.style.background = `rgba(0, 255, 255, ${Math.random() * 0.3})`;
      particle.style.animationDelay = Math.random() * 3 + "s";
      document.querySelector(".probability-cloud").appendChild(particle);
    }
  }

  drawParticles() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    // Draw entanglements first
    this.ctx.beginPath();
    this.ctx.strokeStyle = "rgba(255, 0, 255, 0.2)";
    this.ctx.lineWidth = 1;

    this.particles.forEach((p1) => {
      if (p1.entangled) {
        const p2 = this.particles.find((p) => p.id === p1.entangled);
        if (p2) {
          this.ctx.beginPath();
          this.ctx.moveTo(p1.x, p1.y);
          this.ctx.lineTo(p2.x, p2.y);
          this.ctx.strokeStyle = `rgba(255, 0, 255, ${this.entanglementStrength / 100})`;
          this.ctx.stroke();

          // Draw entanglement symbol
          this.ctx.font = "12px monospace";
          this.ctx.fillStyle = "#ff00ff";
          this.ctx.fillText("⚛️", (p1.x + p2.x) / 2, (p1.y + p2.y) / 2);
        }
      }
    });

    // Draw particles
    this.particles.forEach((p) => {
      // Update position
      if (!this.observing) {
        p.x += p.vx;
        p.y += p.vy;

        // Boundary check with quantum tunneling
        if (p.x < 0 || p.x > this.canvas.width) {
          p.vx *= -1;
          if (Math.random() * 100 < 10) {
            // 10% chance to tunnel
            p.x = Math.random() * this.canvas.width;
          }
        }
        if (p.y < 0 || p.y > this.canvas.height) {
          p.vy *= -1;
          if (Math.random() * 100 < 10) {
            p.y = Math.random() * this.canvas.height;
          }
        }

        // Probability cloud
        p.probability = 0.3 + Math.sin(Date.now() * 0.001 + p.id.length) * 0.2;
      }

      // Draw particle
      const gradient = this.ctx.createRadialGradient(
        p.x,
        p.y,
        0,
        p.x,
        p.y,
        p.size * 2,
      );
      gradient.addColorStop(0, p.color);
      gradient.addColorStop(1, "transparent");

      this.ctx.beginPath();
      this.ctx.arc(p.x, p.y, p.size * p.probability, 0, Math.PI * 2);
      this.ctx.fillStyle = gradient;
      this.ctx.fill();

      // Draw spin indicator
      this.ctx.font = "10px monospace";
      this.ctx.fillStyle = "#ffffff";
      this.ctx.fillText(p.spin === "up" ? "↑" : "↓", p.x - 5, p.y - 10);

      // Draw type symbol
      const symbols = {
        electron: "e⁻",
        photon: "γ",
        quark: "q",
      };
      this.ctx.fillStyle = "#ffffff";
      this.ctx.font = "bold 12px monospace";
      this.ctx.fillText(symbols[p.type], p.x + 10, p.y - 10);
    });

    this.updateStats();
  }

  animate() {
    this.drawParticles();
    requestAnimationFrame(() => this.animate());
  }
}

// Add keyframe animation dynamically
const style = document.createElement("style");
style.textContent = `
    @keyframes quantumPulse {
        0% { opacity: 0.3; transform: scale(1); }
        50% { opacity: 0.6; transform: scale(1.5); }
        100% { opacity: 0; transform: scale(2); }
    }
`;
document.head.appendChild(style);

// Initialize
const quantumLab = new QuantumLab();
