class NeuralDreamscape {
  constructor() {
    this.canvas = document.getElementById("dreamCanvas");
    this.ctx = this.canvas.getContext("2d");
    this.thoughts = [];
    this.currentDream = null;
    this.particles = [];
    this.neuralNetwork = [];
    this.frame = 0;

    this.config = {
      intensity: 1,
      style: "abstract",
      colorPalette: "neon",
      thought: "",
    };

    this.init();
  }

  async init() {
    this.resizeCanvas();
    this.setupEventListeners();
    await this.loadNeuralData();
    this.createNeuralNetwork();
    this.animate();
    this.createParticles();
  }

  resizeCanvas() {
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;
  }

  setupEventListeners() {
    window.addEventListener("resize", () => this.resizeCanvas());

    document.getElementById("generateBtn").addEventListener("click", () => {
      this.generateDream();
    });

    document
      .getElementById("thoughtInput")
      .addEventListener("keypress", (e) => {
        if (e.key === "Enter") {
          this.generateDream();
        }
      });

    document
      .getElementById("intensitySlider")
      .addEventListener("input", (e) => {
        this.config.intensity = parseFloat(e.target.value);
      });

    document.getElementById("styleSelect").addEventListener("change", (e) => {
      this.config.style = e.target.value;
    });

    document.querySelectorAll(".color-preset").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        this.config.colorPalette = e.target.dataset.colors;
        this.updateColorPalette();
      });
    });
  }

  async loadNeuralData() {
    try {
      const response = await fetch("project.json");
      const data = await response.json();
      this.neuralPatterns = data.neuralPatterns;
      this.colorPalettes = data.colorPalettes;
      this.dreamInterpretations = data.dreamInterpretations;
    } catch (error) {
      console.error("Failed to load neural data:", error);
      // Fallback patterns
      this.neuralPatterns = {
        abstract: ["waves", "noise", "flow"],
        geometric: ["triangles", "circles", "lines"],
        organic: ["cells", "vines", "roots"],
        cosmic: ["stars", "nebula", "galaxy"],
      };
    }
  }

  generateDream() {
    const thought = document.getElementById("thoughtInput").value.trim();
    if (!thought) {
      this.showStatus("Please enter a thought...", "error");
      return;
    }

    this.config.thought = thought;
    this.currentDream = {
      thought: thought,
      timestamp: Date.now(),
      parameters: { ...this.config },
      interpretation: this.interpretThought(thought),
    };

    // Save to gallery
    this.saveToGallery(this.currentDream);

    // Trigger visual generation
    this.createDreamVisualization();

    // Show status
    this.showStatus(`Dreaming: "${thought}"`, "success");

    // Clear input
    document.getElementById("thoughtInput").value = "";
  }

  interpretThought(thought) {
    const words = thought.toLowerCase().split(" ");
    const interpretations = [];

    // Simple "AI" interpretation based on keywords
    const keywords = {
      ocean: ["flowing", "deep", "mysterious"],
      forest: ["organic", "growth", "wild"],
      city: ["geometric", "structured", "busy"],
      space: ["cosmic", "vast", "infinite"],
      love: ["warm", "connected", "radiant"],
      time: ["cyclical", "eternal", "flowing"],
    };

    for (const [key, values] of Object.entries(keywords)) {
      if (thought.toLowerCase().includes(key)) {
        interpretations.push(...values);
      }
    }

    return interpretations.length ? interpretations : ["abstract", "dreamlike"];
  }

  createDreamVisualization() {
    // Clear existing particles
    this.particles = [];

    // Create new particle system based on thought
    const numParticles = Math.floor(100 * this.config.intensity);
    const thoughtWords = this.config.thought.split(" ");

    for (let i = 0; i < numParticles; i++) {
      const word = thoughtWords[i % thoughtWords.length];
      this.particles.push({
        x: Math.random() * this.canvas.width,
        y: Math.random() * this.canvas.height,
        vx: (Math.random() - 0.5) * 2,
        vy: (Math.random() - 0.5) * 2,
        size: Math.random() * 10 + 5,
        word: word,
        life: 1,
        color: this.getColorFromWord(word, i),
      });
    }

    // Add neural connections
    this.createNeuralConnections();
  }

  getColorFromWord(word, index) {
    const palettes = {
      warm: ["#ff6b6b", "#ff8e8e", "#ffb3b3", "#ffd9d9"],
      cool: ["#4ecdc4", "#a8e6cf", "#d4f3f0", "#b8e1ff"],
      neon: ["#ff00ff", "#00ffff", "#ffff00", "#ff3366"],
      mono: ["#ffffff", "#cccccc", "#999999", "#666666"],
    };

    const palette = palettes[this.config.colorPalette] || palettes.neon;
    return palette[index % palette.length];
  }

  createNeuralNetwork() {
    // Create neural network visualization nodes
    const numNodes = 50;
    for (let i = 0; i < numNodes; i++) {
      this.neuralNetwork.push({
        x: Math.random() * this.canvas.width,
        y: Math.random() * this.canvas.height,
        connections: [],
        pulse: Math.random() * Math.PI * 2,
      });
    }

    // Create connections
    for (let i = 0; i < this.neuralNetwork.length; i++) {
      const numConnections = Math.floor(Math.random() * 5) + 2;
      for (let j = 0; j < numConnections; j++) {
        const target = Math.floor(Math.random() * this.neuralNetwork.length);
        if (target !== i) {
          this.neuralNetwork[i].connections.push(target);
        }
      }
    }
  }

  createNeuralConnections() {
    // Update neural network based on current dream
    this.neuralNetwork.forEach((node) => {
      node.active = Math.random() > 0.7;
    });
  }

  createParticles() {
    // Create background particles
    for (let i = 0; i < 100; i++) {
      const particle = document.createElement("div");
      particle.className = "neural-particle";
      particle.style.left = Math.random() * 100 + "%";
      particle.style.width = Math.random() * 3 + 1 + "px";
      particle.style.height = particle.style.width;
      particle.style.background = `hsl(${Math.random() * 360}, 70%, 60%)`;
      particle.style.animationDelay = Math.random() * 20 + "s";
      particle.style.animationDuration = Math.random() * 10 + 10 + "s";
      document.querySelector(".neural-universe").appendChild(particle);
    }
  }

  saveToGallery(dream) {
    this.thoughts.unshift(dream);
    if (this.thoughts.length > 12) this.thoughts.pop();

    this.updateGallery();
    localStorage.setItem("dreams", JSON.stringify(this.thoughts));
  }

  updateGallery() {
    const gallery = document.getElementById("galleryThumbnails");
    gallery.innerHTML = this.thoughts
      .map(
        (dream, index) => `
            <div class="gallery-thumb" onclick="neuralDreamscape.loadDream(${index})" 
                 style="background: linear-gradient(45deg, ${this.getColorFromWord(dream.thought, 0)}, ${this.getColorFromWord(dream.thought, 1)})">
            </div>
        `,
      )
      .join("");
  }

  loadDream(index) {
    const dream = this.thoughts[index];
    if (dream) {
      this.config = { ...dream.parameters };
      this.currentDream = dream;
      this.createDreamVisualization();

      document.getElementById("thoughtInput").value = dream.thought;
      document.getElementById("intensitySlider").value =
        dream.parameters.intensity;
      document.getElementById("styleSelect").value = dream.parameters.style;
      this.config.colorPalette = dream.parameters.colorPalette;

      this.showStatus(`Loaded: ${dream.thought}`, "info");
    }
  }

  showStatus(message, type) {
    const status = document.getElementById("aiStatus");
    const dot = status.querySelector(".status-dot");

    status.innerHTML = `<span class="status-dot" style="background: ${type === "error" ? "#ff0000" : type === "success" ? "#00ff00" : "#ffff00"}"></span> ${message}`;

    setTimeout(() => {
      status.innerHTML = `<span class="status-dot"></span> Neural Network Active`;
    }, 3000);
  }

  updateColorPalette() {
    // Trigger redraw with new colors
    if (this.currentDream) {
      this.createDreamVisualization();
    }
  }

  drawAbstract() {
    // Abstract wave pattern
    this.ctx.globalCompositeOperation = "screen";

    for (let i = 0; i < 10; i++) {
      this.ctx.beginPath();
      const offset = this.frame * 0.01 + i;

      for (let x = 0; x < this.canvas.width; x += 10) {
        const y =
          this.canvas.height / 2 +
          Math.sin(x * 0.01 + offset) * 100 * this.config.intensity +
          Math.cos(x * 0.02 + offset) * 50;

        if (x === 0) {
          this.ctx.moveTo(x, y);
        } else {
          this.ctx.lineTo(x, y);
        }
      }

      this.ctx.strokeStyle = this.getColorFromWord("wave", i);
      this.ctx.lineWidth = 2;
      this.ctx.stroke();
    }
  }

  drawGeometric() {
    // Geometric patterns
    const size = 50 * this.config.intensity;
    const cols = Math.floor(this.canvas.width / size);
    const rows = Math.floor(this.canvas.height / size);

    for (let i = 0; i < cols; i++) {
      for (let j = 0; j < rows; j++) {
        const x = i * size;
        const y = j * size;
        const phase = (i + j + this.frame * 0.05) % 1;

        this.ctx.beginPath();

        if (Math.random() > 0.5) {
          // Triangle
          this.ctx.moveTo(x + size / 2, y);
          this.ctx.lineTo(x + size, y + size);
          this.ctx.lineTo(x, y + size);
        } else {
          // Square
          this.ctx.rect(x, y, size, size);
        }

        this.ctx.closePath();
        this.ctx.fillStyle = this.getColorFromWord("geo", i + j);
        this.ctx.globalAlpha = 0.3 * phase;
        this.ctx.fill();
      }
    }
  }

  drawOrganic() {
    // Organic flowing patterns
    this.ctx.globalCompositeOperation = "lighter";

    for (let i = 0; i < 20; i++) {
      const x = this.canvas.width / 2 + Math.sin(this.frame * 0.02 + i) * 200;
      const y = this.canvas.height / 2 + Math.cos(this.frame * 0.03 + i) * 200;

      const gradient = this.ctx.createRadialGradient(x, y, 0, x, y, 200);
      gradient.addColorStop(0, this.getColorFromWord("organic", i));
      gradient.addColorStop(1, "transparent");

      this.ctx.beginPath();
      this.ctx.arc(x, y, 150 * this.config.intensity, 0, Math.PI * 2);
      this.ctx.fillStyle = gradient;
      this.ctx.fill();
    }
  }

  drawCosmic() {
    // Cosmic dust and stars
    for (let i = 0; i < 100; i++) {
      const x =
        (Math.sin(i * 0.1 + this.frame * 0.01) * 0.5 + 0.5) * this.canvas.width;
      const y =
        (Math.cos(i * 0.1 + this.frame * 0.02) * 0.5 + 0.5) *
        this.canvas.height;

      this.ctx.beginPath();
      this.ctx.arc(x, y, 2 * this.config.intensity, 0, Math.PI * 2);
      this.ctx.fillStyle = this.getColorFromWord("cosmic", i);
      this.ctx.fill();

      // Draw connections
      if (i % 10 === 0) {
        this.ctx.beginPath();
        this.ctx.moveTo(x, y);
        this.ctx.lineTo(this.canvas.width / 2, this.canvas.height / 2);
        this.ctx.strokeStyle = `rgba(255,255,255,0.1)`;
        this.ctx.stroke();
      }
    }
  }

  drawParticles() {
    // Update and draw thought particles
    this.particles = this.particles.filter((p) => {
      p.x += p.vx;
      p.y += p.vy;
      p.life -= 0.001;

      // Wrap around screen
      if (p.x < 0) p.x = this.canvas.width;
      if (p.x > this.canvas.width) p.x = 0;
      if (p.y < 0) p.y = this.canvas.height;
      if (p.y > this.canvas.height) p.y = 0;

      // Draw particle with word
      this.ctx.font = `${p.size}px 'Inter', monospace`;
      this.ctx.fillStyle = p.color
        .replace(")", `, ${p.life})`)
        .replace("rgb", "rgba");
      this.ctx.fillText(p.word, p.x, p.y);

      return p.life > 0;
    });
  }

  drawNeuralNetwork() {
    // Draw neural connections
    this.neuralNetwork.forEach((node, i) => {
      node.pulse += 0.05;

      node.connections.forEach((targetId) => {
        const target = this.neuralNetwork[targetId];
        if (target) {
          this.ctx.beginPath();
          this.ctx.moveTo(node.x, node.y);
          this.ctx.lineTo(target.x, target.y);

          const pulse = Math.sin(node.pulse) * 0.5 + 0.5;
          this.ctx.strokeStyle = `rgba(0, 255, 255, ${pulse * 0.2})`;
          this.ctx.stroke();
        }
      });

      // Draw node
      this.ctx.beginPath();
      this.ctx.arc(node.x, node.y, 3, 0, Math.PI * 2);
      this.ctx.fillStyle = node.active ? "#00ffff" : "rgba(255,255,255,0.3)";
      this.ctx.fill();
    });
  }

  animate() {
    this.frame++;

    // Clear canvas with fade effect
    this.ctx.fillStyle = "rgba(10, 10, 15, 0.1)";
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    // Draw based on selected style
    switch (this.config.style) {
      case "abstract":
        this.drawAbstract();
        break;
      case "geometric":
        this.drawGeometric();
        break;
      case "organic":
        this.drawOrganic();
        break;
      case "cosmic":
        this.drawCosmic();
        break;
    }

    // Draw neural network and particles
    this.drawNeuralNetwork();
    this.drawParticles();

    requestAnimationFrame(() => this.animate());
  }
}

// Initialize
const neuralDreamscape = new NeuralDreamscape();
