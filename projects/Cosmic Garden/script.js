class CosmicGarden {
  constructor() {
    this.canvas = document.getElementById("gardenCanvas");
    this.ctx = this.canvas.getContext("2d");
    this.plants = [];
    this.selectedSeed = "star";
    this.energy = 100;
    this.season = "spring";
    this.growthSpeed = 1;
    this.constellations = [];

    this.init();
  }

  init() {
    this.resizeCanvas();
    this.setupEventListeners();
    this.loadGardenData();
    this.createStars();
    this.animate();
    this.startSeasonCycle();
  }

  resizeCanvas() {
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;
  }

  setupEventListeners() {
    window.addEventListener("resize", () => this.resizeCanvas());

    // Seed selection
    document.querySelectorAll(".seed").forEach((seed) => {
      seed.addEventListener("click", () => {
        document
          .querySelectorAll(".seed")
          .forEach((s) => s.classList.remove("active"));
        seed.classList.add("active");
        this.selectedSeed = seed.dataset.type;
      });
    });

    // Plant button
    document.getElementById("plantBtn").addEventListener("click", () => {
      this.plantAtRandom();
    });

    // Water button
    document.getElementById("waterBtn").addEventListener("click", () => {
      this.waterAll();
    });

    // Harvest button
    document.getElementById("harvestBtn").addEventListener("click", () => {
      this.harvestEnergy();
    });

    // Growth speed slider
    document.getElementById("growthSpeed").addEventListener("input", (e) => {
      this.growthSpeed = parseFloat(e.target.value);
    });

    // Canvas click for planting
    this.canvas.addEventListener("click", (e) => {
      const rect = this.canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      // Check if clicked on existing plant
      const clickedPlant = this.plants.find(
        (p) => Math.hypot(p.x - x, p.y - y) < 20,
      );

      if (clickedPlant) {
        this.interactWithPlant(clickedPlant);
      } else {
        this.plantAt(x, y);
      }
    });
  }

  async loadGardenData() {
    try {
      const response = await fetch("project.json");
      const data = await response.json();
      this.plantTypes = data.plantTypes;
      this.cosmicEvents = data.cosmicEvents;
    } catch (error) {
      console.error("Failed to load garden data");
    }
  }

  createStars() {
    // Create background stars
    for (let i = 0; i < 200; i++) {
      const star = document.createElement("div");
      star.className = "cosmic-particle";
      star.style.left = Math.random() * 100 + "%";
      star.style.width = Math.random() * 3 + 1 + "px";
      star.style.height = star.style.width;
      star.style.background = `hsl(${Math.random() * 60 + 200}, 70%, 70%)`;
      star.style.animationDuration = Math.random() * 10 + 10 + "s";
      star.style.animationDelay = Math.random() * -20 + "s";
      document.querySelector(".garden-universe").appendChild(star);
    }
  }

  plantAtRandom() {
    const x = Math.random() * this.canvas.width;
    const y = Math.random() * this.canvas.height;
    this.plantAt(x, y);
  }

  plantAt(x, y) {
    if (this.energy < 10) {
      this.showMessage("Not enough cosmic energy!", "error");
      return;
    }

    const seed = this.selectedSeed;
    const plantType = this.plantTypes[seed];

    if (!plantType) return;

    const plant = {
      id: Math.random().toString(36).substr(2, 9),
      type: seed,
      x: x,
      y: y,
      stage: 0,
      maxStage: plantType.stages,
      growth: 0,
      health: 100,
      color: plantType.color,
      size: plantType.baseSize,
      lastWatered: Date.now(),
      lastGrowth: Date.now(),
      children: [],
      constellation: null,
    };

    this.plants.push(plant);
    this.energy -= 10;
    this.updateStats();

    // Create planting effect
    this.createPlantingRing(x, y);
  }

  createPlantingRing(x, y) {
    const ring = document.createElement("div");
    ring.className = "growth-ring";
    ring.style.left = x - 50 + "px";
    ring.style.top = y - 50 + "px";
    ring.style.borderColor = this.getPlantColor(this.selectedSeed);
    document.querySelector(".garden-universe").appendChild(ring);

    setTimeout(() => ring.remove(), 2000);
  }

  getPlantColor(type) {
    const colors = {
      star: "#ffd700",
      flower: "#ff6b6b",
      crystal: "#4ecdc4",
      nebula: "#a8e6cf",
      mushroom: "#9370db",
      void: "#2d2d4a",
    };
    return colors[type] || "#ffffff";
  }

  waterAll() {
    if (this.energy < 20) {
      this.showMessage("Not enough energy to water!", "error");
      return;
    }

    this.plants.forEach((plant) => {
      plant.lastWatered = Date.now();
      plant.health = Math.min(100, plant.health + 20);

      // Create water effect
      this.createWaterDroplet(plant.x, plant.y);
    });

    this.energy -= 20;
    this.updateStats();
    this.showMessage("All plants watered! ✨", "success");
  }

  createWaterDroplet(x, y) {
    for (let i = 0; i < 5; i++) {
      setTimeout(() => {
        const droplet = document.createElement("div");
        droplet.className = "droplet";
        droplet.style.left = x - 5 + (Math.random() - 0.5) * 20 + "px";
        droplet.style.top = y - 20 + "px";
        droplet.style.width = Math.random() * 10 + 5 + "px";
        droplet.style.height = droplet.style.width;
        document.querySelector(".garden-universe").appendChild(droplet);

        setTimeout(() => droplet.remove(), 1000);
      }, i * 100);
    }
  }

  harvestEnergy() {
    let harvested = 0;

    this.plants = this.plants.filter((plant) => {
      if (plant.stage >= plant.maxStage - 1) {
        harvested += 20;

        // Create harvest effect
        this.createHarvestEffect(plant.x, plant.y, plant.type);
        return false;
      }
      return true;
    });

    this.energy += harvested;
    this.updateStats();

    if (harvested > 0) {
      this.showMessage(`Harvested ${harvested} cosmic energy! ⭐`, "success");
    } else {
      this.showMessage("No mature plants to harvest", "info");
    }
  }

  createHarvestEffect(x, y, type) {
    for (let i = 0; i < 10; i++) {
      setTimeout(() => {
        const particle = document.createElement("div");
        particle.className = "harvest-particle";
        particle.style.left = x + "px";
        particle.style.top = y + "px";
        particle.textContent = ["⭐", "✨", "💫"][
          Math.floor(Math.random() * 3)
        ];
        particle.style.color = this.getPlantColor(type);
        particle.style.setProperty("--tx", (Math.random() - 0.5) * 100 + "px");
        particle.style.setProperty("--ty", -50 + Math.random() * -50 + "px");
        document.querySelector(".garden-universe").appendChild(particle);

        setTimeout(() => particle.remove(), 1000);
      }, i * 50);
    }
  }

  interactWithPlant(plant) {
    if (plant.stage >= plant.maxStage - 1) {
      // Mature plant - harvest or special interaction
      this.harvestPlant(plant);
    } else {
      // Feed plant energy
      if (this.energy >= 5) {
        plant.growth += 20;
        plant.health = Math.min(100, plant.health + 10);
        this.energy -= 5;

        this.showMessage(`Boosted ${plant.type} growth! 🌱`, "success");
        this.createGrowthRing(plant.x, plant.y);
      }
    }
  }

  harvestPlant(plant) {
    this.energy += 30;
    this.plants = this.plants.filter((p) => p.id !== plant.id);
    this.updateStats();
    this.createHarvestEffect(plant.x, plant.y, plant.type);
    this.showMessage(`Harvested mature ${plant.type}! ✨`, "success");
  }

  createGrowthRing(x, y) {
    const ring = document.createElement("div");
    ring.className = "growth-ring";
    ring.style.left = x - 30 + "px";
    ring.style.top = y - 30 + "px";
    ring.style.width = "60px";
    ring.style.height = "60px";
    ring.style.borderColor = "#ffd700";
    document.querySelector(".garden-universe").appendChild(ring);

    setTimeout(() => ring.remove(), 1000);
  }

  updateStats() {
    document.getElementById("plantCount").textContent = this.plants.length;
    document.getElementById("energyCount").textContent = Math.floor(
      this.energy,
    );

    const starCount = this.plants.filter((p) => p.type === "star").length;
    document.getElementById("starCount").textContent = starCount;
  }

  showMessage(msg, type) {
    const info = document.getElementById("plantInfo");
    info.textContent = msg;
    info.style.color =
      type === "error"
        ? "#ff6b6b"
        : type === "success"
          ? "#4ecdc4"
          : "rgba(255,255,255,0.7)";

    setTimeout(() => {
      info.textContent = "Click on plants to interact";
      info.style.color = "rgba(255,255,255,0.7)";
    }, 3000);
  }

  startSeasonCycle() {
    const seasons = ["spring", "summer", "autumn", "winter"];
    let index = 0;

    setInterval(() => {
      index = (index + 1) % seasons.length;
      this.season = seasons[index];

      const seasonEmoji = {
        spring: "🌱",
        summer: "☀️",
        autumn: "🍂",
        winter: "❄️",
      };

      document.getElementById("season").textContent =
        `${seasonEmoji[this.season]} Cosmic ${this.season.charAt(0).toUpperCase() + this.season.slice(1)}`;

      // Season effects
      this.plants.forEach((plant) => {
        switch (this.season) {
          case "spring":
            plant.growth += 5;
            break;
          case "summer":
            plant.health = Math.min(100, plant.health + 10);
            break;
          case "autumn":
            if (Math.random() > 0.7) {
              this.createHarvestEffect(plant.x, plant.y, "seed");
            }
            break;
          case "winter":
            plant.growth -= 2;
            plant.health -= 5;
            break;
        }
      });
    }, 30000); // Change season every 30 seconds
  }

  drawPlants() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    // Sort by y for depth
    const sortedPlants = [...this.plants].sort((a, b) => a.y - b.y);

    sortedPlants.forEach((plant) => {
      // Update growth
      const now = Date.now();
      if (now - plant.lastGrowth > 1000 / this.growthSpeed) {
        if (plant.health > 0 && plant.stage < plant.maxStage) {
          plant.growth += 1;
          if (plant.growth >= 100) {
            plant.stage++;
            plant.growth = 0;

            // Stage up effect
            this.createGrowthRing(plant.x, plant.y);
          }
        }
        plant.lastGrowth = now;
      }

      // Calculate size based on stage
      const size = plant.size * (1 + plant.stage * 0.5);

      // Draw plant
      this.ctx.save();
      this.ctx.translate(plant.x, plant.y);

      // Draw glow
      const gradient = this.ctx.createRadialGradient(0, 0, 0, 0, 0, size * 2);
      gradient.addColorStop(0, plant.color);
      gradient.addColorStop(1, "transparent");

      this.ctx.beginPath();
      this.ctx.arc(0, 0, size * 1.5, 0, Math.PI * 2);
      this.ctx.fillStyle = gradient;
      this.ctx.globalAlpha = 0.3;
      this.ctx.fill();

      // Draw plant shape based on type
      this.ctx.globalAlpha = 1;
      this.ctx.shadowColor = plant.color;
      this.ctx.shadowBlur = 20;

      switch (plant.type) {
        case "star":
          this.drawStar(0, 0, size, 5, plant.color);
          break;
        case "flower":
          this.drawFlower(0, 0, size, plant.color);
          break;
        case "crystal":
          this.drawCrystal(0, 0, size, plant.color);
          break;
        case "nebula":
          this.drawNebula(0, 0, size, plant.color);
          break;
        case "mushroom":
          this.drawMushroom(0, 0, size, plant.color);
          break;
        case "void":
          this.drawVoid(0, 0, size, plant.color);
          break;
      }

      this.ctx.restore();

      // Draw health bar
      if (plant.health < 100) {
        this.ctx.fillStyle = "rgba(255,0,0,0.5)";
        this.ctx.fillRect(plant.x - 15, plant.y - size - 15, 30, 5);
        this.ctx.fillStyle = "#4ecdc4";
        this.ctx.fillRect(
          plant.x - 15,
          plant.y - size - 15,
          30 * (plant.health / 100),
          5,
        );
      }

      // Draw growth stage indicator
      this.ctx.fillStyle = "#ffd700";
      this.ctx.font = "12px Quicksand";
      this.ctx.fillText(
        "⭐".repeat(plant.stage + 1),
        plant.x - 15,
        plant.y - size - 25,
      );
    });
  }

  drawStar(x, y, size, points, color) {
    const step = Math.PI / points;
    let angle = -Math.PI / 2;

    this.ctx.beginPath();
    for (let i = 0; i <= points * 2; i++) {
      const r = i % 2 === 0 ? size : size / 2;
      const px = x + Math.cos(angle) * r;
      const py = y + Math.sin(angle) * r;

      if (i === 0) this.ctx.moveTo(px, py);
      else this.ctx.lineTo(px, py);

      angle += step;
    }

    this.ctx.closePath();
    this.ctx.fillStyle = color;
    this.ctx.fill();

    // Inner glow
    this.ctx.shadowBlur = 30;
    this.ctx.fill();
  }

  drawFlower(x, y, size, color) {
    // Petals
    for (let i = 0; i < 6; i++) {
      const angle = (i / 6) * Math.PI * 2;
      const px = x + Math.cos(angle) * size * 0.6;
      const py = y + Math.sin(angle) * size * 0.6;

      this.ctx.beginPath();
      this.ctx.ellipse(px, py, size * 0.4, size * 0.2, angle, 0, Math.PI * 2);
      this.ctx.fillStyle = color;
      this.ctx.fill();
    }

    // Center
    this.ctx.beginPath();
    this.ctx.arc(x, y, size * 0.3, 0, Math.PI * 2);
    this.ctx.fillStyle = "#ffd700";
    this.ctx.fill();
  }

  drawCrystal(x, y, size, color) {
    this.ctx.beginPath();
    this.ctx.moveTo(x, y - size);
    this.ctx.lineTo(x + size * 0.8, y + size * 0.5);
    this.ctx.lineTo(x + size * 0.3, y + size * 0.8);
    this.ctx.lineTo(x - size * 0.3, y + size * 0.8);
    this.ctx.lineTo(x - size * 0.8, y + size * 0.5);
    this.ctx.closePath();

    this.ctx.fillStyle = color;
    this.ctx.fill();

    // Facets
    this.ctx.strokeStyle = "rgba(255,255,255,0.3)";
    this.ctx.lineWidth = 1;
    this.ctx.stroke();
  }

  drawNebula(x, y, size, color) {
    for (let i = 0; i < 5; i++) {
      const offset = i * 0.2;
      const gradient = this.ctx.createRadialGradient(
        x + Math.sin(offset) * 5,
        y + Math.cos(offset) * 5,
        0,
        x,
        y,
        size,
      );
      gradient.addColorStop(0, color);
      gradient.addColorStop(0.5, "transparent");

      this.ctx.beginPath();
      this.ctx.arc(
        x + Math.sin(offset) * 10,
        y + Math.cos(offset) * 10,
        size * (0.5 + offset),
        0,
        Math.PI * 2,
      );
      this.ctx.fillStyle = gradient;
      this.ctx.fill();
    }
  }

  drawMushroom(x, y, size, color) {
    // Stem
    this.ctx.fillStyle = "#8b4513";
    this.ctx.fillRect(x - size * 0.2, y, size * 0.4, size * 0.8);

    // Cap
    this.ctx.beginPath();
    this.ctx.ellipse(
      x,
      y - size * 0.3,
      size * 0.8,
      size * 0.3,
      0,
      0,
      Math.PI * 2,
    );
    this.ctx.fillStyle = color;
    this.ctx.fill();

    // Spots
    for (let i = 0; i < 3; i++) {
      this.ctx.beginPath();
      this.ctx.arc(
        x - size * 0.3 + i * size * 0.3,
        y - size * 0.4,
        size * 0.1,
        0,
        Math.PI * 2,
      );
      this.ctx.fillStyle = "#ffffff";
      this.ctx.fill();
    }
  }

  drawVoid(x, y, size, color) {
    // Dark hole
    this.ctx.beginPath();
    this.ctx.arc(x, y, size, 0, Math.PI * 2);

    const gradient = this.ctx.createRadialGradient(x, y, 0, x, y, size);
    gradient.addColorStop(0, "black");
    gradient.addColorStop(0.5, color);
    gradient.addColorStop(1, "transparent");

    this.ctx.fillStyle = gradient;
    this.ctx.fill();

    // Accretion disk
    this.ctx.beginPath();
    this.ctx.ellipse(x, y, size * 1.5, size * 0.5, 0, 0, Math.PI * 2);
    this.ctx.fillStyle = "rgba(255,215,0,0.1)";
    this.ctx.fill();
  }

  animate() {
    this.drawPlants();
    requestAnimationFrame(() => this.animate());
  }
}

// Initialize
const cosmicGarden = new CosmicGarden();
