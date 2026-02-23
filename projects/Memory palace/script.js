class MemoryPalace {
  constructor() {
    this.canvas = document.getElementById("palaceCanvas");
    this.ctx = this.canvas.getContext("2d");
    this.minimapCanvas = document.getElementById("minimapCanvas");
    this.minimapCtx = this.minimapCanvas.getContext("2d");

    this.player = {
      x: 0,
      y: 0,
      rotation: 0,
      room: "entry",
    };

    this.rooms = {
      entry: { x: 0, y: 0, objects: [], memories: [] },
      library: { x: 10, y: 0, objects: [], memories: [] },
      garden: { x: 0, y: 10, objects: [], memories: [] },
      study: { x: -10, y: 0, objects: [], memories: [] },
      attic: { x: 0, y: -10, objects: [], memories: [] },
      basement: { x: 10, y: 10, objects: [], memories: [] },
    };

    this.memoryType = "loci";
    this.fov = 60; // Field of view
    this.viewDistance = 20;

    this.init();
  }

  init() {
    this.resizeCanvas();
    this.setupEventListeners();
    this.loadPalaceData();
    this.createInitialObjects();
    this.animate();
  }

  resizeCanvas() {
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;
  }

  setupEventListeners() {
    window.addEventListener("resize", () => this.resizeCanvas());

    // Room selection
    document.querySelectorAll(".room-btn").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        document
          .querySelectorAll(".room-btn")
          .forEach((b) => b.classList.remove("active"));
        e.target.classList.add("active");
        this.player.room = e.target.dataset.room;
        this.updateUI();
      });
    });

    // Memory type
    document.querySelectorAll(".type-btn").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        document
          .querySelectorAll(".type-btn")
          .forEach((b) => b.classList.remove("active"));
        e.target.classList.add("active");
        this.memoryType = e.target.dataset.type;
      });
    });

    // Place memory
    document.getElementById("placeMemoryBtn").addEventListener("click", () => {
      this.placeMemory();
    });

    // Navigation
    document
      .getElementById("moveForward")
      .addEventListener("click", () => this.move(0, -1));
    document
      .getElementById("moveBack")
      .addEventListener("click", () => this.move(0, 1));
    document
      .getElementById("moveLeft")
      .addEventListener("click", () => this.move(-1, 0));
    document
      .getElementById("moveRight")
      .addEventListener("click", () => this.move(1, 0));
    document
      .getElementById("rotateLeft")
      .addEventListener("click", () => this.rotate(-10));
    document
      .getElementById("rotateRight")
      .addEventListener("click", () => this.rotate(10));

    // Keyboard controls
    document.addEventListener("keydown", (e) => {
      switch (e.key) {
        case "w":
          this.move(0, -1);
          break;
        case "s":
          this.move(0, 1);
          break;
        case "a":
          this.move(-1, 0);
          break;
        case "d":
          this.move(1, 0);
          break;
        case "q":
          this.rotate(-10);
          break;
        case "e":
          this.rotate(10);
          break;
      }
    });
  }

  async loadPalaceData() {
    try {
      const response = await fetch("project.json");
      const data = await response.json();
      this.memoryTechniques = data.memoryTechniques;
      this.roomThemes = data.roomThemes;
    } catch (error) {
      console.error("Failed to load palace data");
    }
  }

  createInitialObjects() {
    // Create architectural objects for each room
    for (let [roomName, room] of Object.entries(this.rooms)) {
      // Add walls
      for (let i = -5; i <= 5; i++) {
        room.objects.push({
          type: "wall",
          x: i,
          y: -5,
          z: 0,
          width: 1,
          height: 3,
          depth: 1,
        });
        room.objects.push({
          type: "wall",
          x: i,
          y: 5,
          z: 0,
          width: 1,
          height: 3,
          depth: 1,
        });
      }

      // Add columns
      for (let i = -3; i <= 3; i += 2) {
        for (let j = -3; j <= 3; j += 2) {
          room.objects.push({
            type: "column",
            x: i,
            y: j,
            z: 0,
            width: 0.5,
            height: 4,
            depth: 0.5,
            color: "#cd7f32",
          });
        }
      }

      // Add room-specific objects
      if (roomName === "library") {
        for (let i = -4; i <= 4; i += 2) {
          room.objects.push({
            type: "bookshelf",
            x: -4,
            y: i,
            z: 0,
            width: 0.5,
            height: 3,
            depth: 2,
            color: "#8b4513",
          });
        }
      }

      if (roomName === "garden") {
        for (let i = 0; i < 5; i++) {
          room.objects.push({
            type: "tree",
            x: Math.random() * 8 - 4,
            y: Math.random() * 8 - 4,
            z: 0,
            width: 0.8,
            height: 3,
            depth: 0.8,
            color: "#228b22",
          });
        }
      }
    }
  }

  placeMemory() {
    const text = document.getElementById("memoryInput").value.trim();
    if (!text) return;

    const room = this.rooms[this.player.room];
    const memory = {
      id: Date.now(),
      text: text,
      type: this.memoryType,
      x: this.player.x,
      y: this.player.y,
      z: 0,
      color: this.getMemoryColor(this.memoryType),
      timestamp: new Date().toLocaleString(),
    };

    room.memories.push(memory);

    // Add visual object for memory
    room.objects.push({
      type: "memory",
      memoryId: memory.id,
      x: this.player.x,
      y: this.player.y,
      z: 0,
      width: 0.5,
      height: 1,
      depth: 0.5,
      color: memory.color,
    });

    this.updateMemoryList();
    document.getElementById("memoryInput").value = "";

    // Visual feedback
    this.createMemoryEffect(this.player.x, this.player.y);
  }

  getMemoryColor(type) {
    const colors = {
      loci: "#ffd700",
      image: "#ff6b6b",
      story: "#4ecdc4",
    };
    return colors[type] || "#ffffff";
  }

  createMemoryEffect(x, y) {
    // Create particle effect for memory placement
    for (let i = 0; i < 10; i++) {
      setTimeout(() => {
        const effect = document.createElement("div");
        effect.className = "memory-object";
        effect.style.left = "50%";
        effect.style.top = "50%";
        effect.style.width = "20px";
        effect.style.height = "20px";
        effect.style.background = "#ffd700";
        effect.style.borderRadius = "50%";
        effect.style.transform = `translate(-50%, -50%) scale(${Math.random()})`;
        effect.style.transition = "all 1s";
        document.body.appendChild(effect);

        setTimeout(() => effect.remove(), 1000);
      }, i * 100);
    }
  }

  move(dx, dy) {
    const newX = this.player.x + dx;
    const newY = this.player.y + dy;

    // Check collision with walls
    const room = this.rooms[this.player.room];
    const collision = room.objects.some(
      (obj) =>
        obj.type === "wall" &&
        Math.abs(newX - obj.x) < 1 &&
        Math.abs(newY - obj.y) < 1,
    );

    if (!collision) {
      this.player.x = newX;
      this.player.y = newY;
      this.checkMemoryProximity();
    }

    this.updateMinimap();
  }

  rotate(angle) {
    this.player.rotation = (this.player.rotation + angle) % 360;
  }

  checkMemoryProximity() {
    const room = this.rooms[this.player.room];
    const nearbyMemory = room.memories.find(
      (m) =>
        Math.abs(m.x - this.player.x) < 2 && Math.abs(m.y - this.player.y) < 2,
    );

    if (nearbyMemory) {
      document.getElementById("memoryHint").textContent =
        `✨ ${nearbyMemory.text}`;
    } else {
      document.getElementById("memoryHint").textContent =
        "Click on objects to recall memories";
    }
  }

  updateMemoryList() {
    const room = this.rooms[this.player.room];
    const list = document.getElementById("memoryList");

    list.innerHTML = room.memories
      .map(
        (m) => `
            <div class="memory-item" onclick="memoryPalace.recallMemory('${m.id}')">
                <div class="memory-text">${m.text}</div>
                <div class="memory-meta">${m.type} • ${m.timestamp}</div>
            </div>
        `,
      )
      .join("");
  }

  recallMemory(id) {
    const room = this.rooms[this.player.room];
    const memory = room.memories.find((m) => m.id == id);
    if (memory) {
      // Teleport to memory location
      this.player.x = memory.x;
      this.player.y = memory.y;

      // Show recall effect
      document.getElementById("memoryHint").textContent =
        `📝 Recalling: ${memory.text}`;
      setTimeout(() => {
        document.getElementById("memoryHint").textContent =
          "Click on objects to recall memories";
      }, 3000);
    }
  }

  updateUI() {
    document.getElementById("currentRoom").textContent =
      this.player.room.charAt(0).toUpperCase() + this.player.room.slice(1);
    this.updateMemoryList();
  }

  updateMinimap() {
    this.minimapCtx.fillStyle = "#1a1a2e";
    this.minimapCtx.fillRect(0, 0, 150, 150);

    // Draw rooms
    this.minimapCtx.strokeStyle = "#ffd700";
    this.minimapCtx.lineWidth = 1;

    for (let [name, room] of Object.entries(this.rooms)) {
      const x = (room.x + 10) * 5;
      const y = (room.y + 10) * 5;

      this.minimapCtx.strokeRect(x - 20, y - 20, 40, 40);
      this.minimapCtx.fillStyle =
        this.player.room === name ? "rgba(255,215,0,0.3)" : "transparent";
      this.minimapCtx.fillRect(x - 20, y - 20, 40, 40);

      // Draw player
      if (this.player.room === name) {
        this.minimapCtx.fillStyle = "#ffd700";
        this.minimapCtx.beginPath();
        this.minimapCtx.arc(
          x + this.player.x * 2,
          y + this.player.y * 2,
          3,
          0,
          Math.PI * 2,
        );
        this.minimapCtx.fill();
      }
    }
  }

  draw3D() {
    this.ctx.fillStyle = "#1a1a2e";
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    const room = this.rooms[this.player.room];
    const objects = room.objects;

    // Sort objects by distance for proper rendering
    objects.sort((a, b) => {
      const distA = Math.hypot(a.x - this.player.x, a.y - this.player.y);
      const distB = Math.hypot(b.x - this.player.x, b.y - this.player.y);
      return distB - distA;
    });

    objects.forEach((obj) => {
      const dx = obj.x - this.player.x;
      const dy = obj.y - this.player.y;
      const distance = Math.hypot(dx, dy);

      if (distance > this.viewDistance) return;

      // Convert to screen coordinates (simple 3D projection)
      const angle = (Math.atan2(dy, dx) * 180) / Math.PI;
      const relativeAngle = ((angle - this.player.rotation + 360) % 360) - 180;

      if (Math.abs(relativeAngle) > this.fov) return;

      const screenX =
        (relativeAngle / this.fov) * this.canvas.width + this.canvas.width / 2;
      const size = (this.viewDistance - distance) * 50;
      const screenY = this.canvas.height / 2 - obj.z * 50 - size / 2;

      // Draw object
      this.ctx.fillStyle = obj.color || this.getObjectColor(obj.type);
      this.ctx.shadowColor = "#ffd700";
      this.ctx.shadowBlur = obj.type === "memory" ? 20 : 0;

      if (obj.type === "wall") {
        this.ctx.fillRect(screenX - size / 2, screenY, size, size * 3);
      } else if (obj.type === "column") {
        this.ctx.beginPath();
        this.ctx.arc(screenX, screenY + size, size / 2, 0, Math.PI * 2);
        this.ctx.fill();
      } else if (obj.type === "memory") {
        this.ctx.beginPath();
        this.ctx.arc(screenX, screenY + size / 2, size / 2, 0, Math.PI * 2);
        this.ctx.fill();

        // Draw memory icon
        this.ctx.fillStyle = "#ffffff";
        this.ctx.font = `${size}px monospace`;
        this.ctx.fillText("🧠", screenX - size / 2, screenY);
      }
    });

    this.ctx.shadowBlur = 0;
  }

  getObjectColor(type) {
    const colors = {
      wall: "#4a4a5a",
      column: "#8b8b9a",
      bookshelf: "#8b4513",
      tree: "#228b22",
      memory: "#ffd700",
    };
    return colors[type] || "#ffffff";
  }

  animate() {
    this.draw3D();
    this.updateMinimap();
    requestAnimationFrame(() => this.animate());
  }
}

// Initialize
const memoryPalace = new MemoryPalace();
