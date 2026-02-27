class EmotionAlchemist {
  constructor() {
    this.canvas = document.getElementById("alchemyCanvas");
    this.ctx = this.canvas.getContext("2d");

    this.selectedIngredients = [];
    this.discoveries = [];
    this.reactions = {};
    this.elements = [];

    this.init();
  }

  init() {
    this.resizeCanvas();
    this.setupEventListeners();
    this.loadAlchemyData();
    this.createParticles();
    this.animate();
  }

  resizeCanvas() {
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;
  }

  setupEventListeners() {
    window.addEventListener("resize", () => this.resizeCanvas());

    // Drag and drop
    document.querySelectorAll(".ingredient").forEach((ing) => {
      ing.addEventListener("dragstart", (e) => {
        e.dataTransfer.setData(
          "text/plain",
          JSON.stringify({
            element: ing.dataset.element,
            emotion: ing.dataset.emotion,
            text: ing.textContent,
          }),
        );
        ing.classList.add("dragging");
      });

      ing.addEventListener("dragend", (e) => {
        ing.classList.remove("dragging");
      });
    });

    // Drop zone (cauldron)
    const cauldron = document.getElementById("cauldron");
    cauldron.addEventListener("dragover", (e) => {
      e.preventDefault();
      cauldron.style.transform = "translateX(-50%) scale(1.05)";
    });

    cauldron.addEventListener("dragleave", () => {
      cauldron.style.transform = "translateX(-50%)";
    });

    cauldron.addEventListener("drop", (e) => {
      e.preventDefault();
      cauldron.style.transform = "translateX(-50%)";

      const data = JSON.parse(e.dataTransfer.getData("text/plain"));
      this.addIngredient(data);
    });

    // Emotion slots click
    document.querySelectorAll(".emotion-slot").forEach((slot) => {
      slot.addEventListener("click", () => {
        const emotion = slot.dataset.emotion;
        const ingredient = {
          element: this.getEmotionElement(emotion),
          emotion: emotion,
          text: slot.textContent,
        };
        this.addIngredient(ingredient);
      });
    });

    // Transmute button
    document.getElementById("transmuteBtn").addEventListener("click", () => {
      this.transmute();
    });
  }

  getEmotionElement(emotion) {
    const map = {
      joy: "air",
      anger: "fire",
      sadness: "water",
      fear: "earth",
      love: "aether",
      surprise: "light",
    };
    return map[emotion] || "unknown";
  }

  async loadAlchemyData() {
    try {
      const response = await fetch("project.json");
      const data = await response.json();
      this.reactions = data.reactions;
      this.elements = data.elements;
    } catch (error) {
      console.error("Failed to load alchemy data");
    }
  }

  addIngredient(ingredient) {
    if (this.selectedIngredients.length >= 2) {
      this.selectedIngredients = [];
    }

    this.selectedIngredients.push(ingredient);
    this.updateSelectedDisplay();
    this.updateFormula();

    // Visual feedback
    this.createBubble();
  }

  updateSelectedDisplay() {
    const container = document.getElementById("selectedIngredients");
    container.innerHTML = this.selectedIngredients
      .map(
        (ing) => `
            <div class="selected-ingredient" style="border-color: ${this.getElementColor(ing.element)}">
                ${ing.text}
            </div>
        `,
      )
      .join("");
  }

  getElementColor(element) {
    const colors = {
      fire: "#ff6b6b",
      water: "#4ecdc4",
      air: "#a8e6cf",
      earth: "#8b4513",
      aether: "#ffd700",
      light: "#ffff00",
    };
    return colors[element] || "#ffffff";
  }

  updateFormula() {
    const formula = document.getElementById("formula");
    if (this.selectedIngredients.length === 0) {
      formula.textContent = "___ + ___ = ???";
    } else if (this.selectedIngredients.length === 1) {
      formula.textContent = `${this.selectedIngredients[0].emotion} + ___ = ???`;
    } else {
      formula.textContent = `${this.selectedIngredients[0].emotion} + ${this.selectedIngredients[1].emotion} = ???`;
    }
  }

  createBubble() {
    const bubbles = document.getElementById("bubbles");
    const bubble = document.createElement("div");
    bubble.className = "bubble";
    bubble.style.left = Math.random() * 100 + "%";
    bubble.style.width = Math.random() * 20 + 10 + "px";
    bubble.style.height = bubble.style.width;
    bubble.style.animationDuration = Math.random() * 2 + 1 + "s";

    bubbles.appendChild(bubble);

    setTimeout(() => bubble.remove(), 2000);
  }

  transmute() {
    if (this.selectedIngredients.length !== 2) {
      this.showMessage("Need two ingredients for transmutation!", "error");
      return;
    }

    const ing1 = this.selectedIngredients[0];
    const ing2 = this.selectedIngredients[1];

    // Find reaction
    const reaction = this.findReaction(ing1.emotion, ing2.emotion);

    if (reaction) {
      this.performReaction(reaction);
    } else {
      this.failedReaction();
    }

    // Clear selected
    this.selectedIngredients = [];
    this.updateSelectedDisplay();
    this.updateFormula();
  }

  findReaction(e1, e2) {
    // Check both orders
    const key1 = `${e1}+${e2}`;
    const key2 = `${e2}+${e1}`;

    return this.reactions[key1] || this.reactions[key2];
  }

  performReaction(reaction) {
    // Add to discoveries
    this.discoveries.unshift({
      formula: reaction.formula,
      result: reaction.result,
      description: reaction.description,
      timestamp: new Date().toLocaleTimeString(),
    });

    this.updateGrimoire();

    // Visual effects
    this.createReactionEffect(reaction);
    this.createFlame(reaction.element);
    this.createPhilosopherFragments(reaction.result);

    // Show message
    this.showMessage(`✨ Transmuted: ${reaction.result}!`, "success");
  }

  failedReaction() {
    this.createFailedEffect();
    this.showMessage("💥 The reaction failed...", "error");
  }

  createReactionEffect(reaction) {
    const flame = document.getElementById("reactionFlame");
    flame.style.width = "100px";
    flame.style.height = "100px";
    flame.style.background = `radial-gradient(circle, ${this.getElementColor(reaction.element)}, #ffd700)`;

    setTimeout(() => {
      flame.style.width = "0";
      flame.style.height = "0";
    }, 1000);

    // Particle explosion
    for (let i = 0; i < 20; i++) {
      setTimeout(() => {
        const particle = document.createElement("div");
        particle.className = "fragment";
        particle.style.left = "50%";
        particle.style.top = "50%";
        particle.textContent = "✨";
        particle.style.setProperty("--tx", (Math.random() - 0.5) * 200 + "px");
        particle.style.setProperty("--ty", (Math.random() - 0.5) * 200 + "px");
        document.querySelector(".philosopher-fragments").appendChild(particle);

        setTimeout(() => particle.remove(), 2000);
      }, i * 50);
    }
  }

  createFlame(element) {
    const flame = document.getElementById("reactionFlame");
    flame.style.background = `radial-gradient(circle, ${this.getElementColor(element)}, #ffd700)`;
  }

  createFailedEffect() {
    for (let i = 0; i < 10; i++) {
      const particle = document.createElement("div");
      particle.className = "fragment";
      particle.style.left = "50%";
      particle.style.top = "50%";
      particle.textContent = "💥";
      particle.style.color = "#ff4444";
      particle.style.setProperty("--tx", (Math.random() - 0.5) * 100 + "px");
      particle.style.setProperty("--ty", (Math.random() - 0.5) * 100 + "px");
      document.querySelector(".philosopher-fragments").appendChild(particle);

      setTimeout(() => particle.remove(), 1000);
    }
  }

  createPhilosopherFragments(result) {
    for (let i = 0; i < 5; i++) {
      const fragment = document.createElement("div");
      fragment.className = "fragment";
      fragment.style.left = "50%";
      fragment.style.top = "50%";
      fragment.textContent = "🔮";
      fragment.style.setProperty("--tx", (Math.random() - 0.5) * 300 + "px");
      fragment.style.setProperty("--ty", (Math.random() - 0.5) * 300 + "px");
      document.querySelector(".philosopher-fragments").appendChild(fragment);

      setTimeout(() => fragment.remove(), 2000);
    }
  }

  updateGrimoire() {
    const grimoire = document.getElementById("discoveries");
    grimoire.innerHTML = this.discoveries
      .map(
        (d) => `
            <div class="discovery">
                <div style="color: #ffd700; font-size: 0.8rem">${d.formula}</div>
                <div style="margin: 5px 0">✨ ${d.result}</div>
                <div style="color: rgba(255,215,0,0.5); font-size: 0.7rem">${d.description}</div>
                <div style="color: rgba(255,255,255,0.3); font-size: 0.6rem; margin-top: 5px">${d.timestamp}</div>
            </div>
        `,
      )
      .join("");
  }

  showMessage(msg, type) {
    const hint = document.createElement("div");
    hint.style.cssText = `
            position: fixed;
            top: 100px;
            left: 50%;
            transform: translateX(-50%);
            background: ${type === "success" ? "rgba(0,255,0,0.2)" : "rgba(255,0,0,0.2)"};
            color: ${type === "success" ? "#00ff00" : "#ff4444"};
            padding: 15px 30px;
            border-radius: 30px;
            border: 1px solid currentColor;
            z-index: 1000;
            animation: msgFade 2s forwards;
        `;
    hint.textContent = msg;
    document.body.appendChild(hint);

    setTimeout(() => hint.remove(), 2000);
  }

  createParticles() {
    // Create background alchemical symbols
    const symbols = ["⚗️", "🔮", "✨", "🔥", "💧", "🌪️", "🌍", "💫"];
    for (let i = 0; i < 30; i++) {
      const particle = document.createElement("div");
      particle.className = "fragment";
      particle.style.left = Math.random() * 100 + "%";
      particle.style.top = Math.random() * 100 + "%";
      particle.textContent =
        symbols[Math.floor(Math.random() * symbols.length)];
      particle.style.opacity = "0.1";
      particle.style.animation = "none";
      particle.style.fontSize = Math.random() * 30 + 10 + "px";
      document.querySelector(".philosopher-fragments").appendChild(particle);
    }
  }

  drawAlchemySymbols() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    // Draw alchemical circles
    this.ctx.strokeStyle = "rgba(255,215,0,0.1)";
    this.ctx.lineWidth = 1;

    for (let i = 0; i < 5; i++) {
      this.ctx.beginPath();
      this.ctx.arc(
        this.canvas.width / 2,
        this.canvas.height / 2,
        100 + i * 50,
        0,
        Math.PI * 2,
      );
      this.ctx.stroke();
    }

    // Draw elements
    this.elements.forEach((element, i) => {
      const angle =
        (i / this.elements.length) * Math.PI * 2 + Date.now() * 0.001;
      const x = this.canvas.width / 2 + Math.cos(angle) * 200;
      const y = this.canvas.height / 2 + Math.sin(angle) * 200;

      this.ctx.font = '30px "MedievalSharp"';
      this.ctx.fillStyle = this.getElementColor(element.name);
      this.ctx.globalAlpha = 0.3;
      this.ctx.fillText(element.symbol, x, y);
    });

    this.ctx.globalAlpha = 1;
  }

  animate() {
    this.drawAlchemySymbols();
    requestAnimationFrame(() => this.animate());
  }
}

// Add keyframe animation
const style = document.createElement("style");
style.textContent = `
    @keyframes msgFade {
        0% { opacity: 0; transform: translateX(-50%) translateY(-20px); }
        10% { opacity: 1; transform: translateX(-50%) translateY(0); }
        90% { opacity: 1; transform: translateX(-50%) translateY(0); }
        100% { opacity: 0; transform: translateX(-50%) translateY(-20px); }
    }
`;
document.head.appendChild(style);

// Initialize
const emotionAlchemist = new EmotionAlchemist();
