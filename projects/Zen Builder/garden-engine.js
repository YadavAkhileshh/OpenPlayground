// Zen Garden Engine
class ZenGarden {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext("2d");
    this.canvas.width = canvas.offsetWidth;
    this.canvas.height = canvas.offsetHeight;

    // Garden state
    this.elements = [];
    this.rakeLines = [];
    this.currentTool = "rake";
    this.harmony = 0;

    // Element counts
    this.counts = {
      rocks: 0,
      plants: 0,
      trees: 0,
      water: 0,
      bridges: 0,
      lanterns: 0,
      flowers: 0,
    };

    // Zen wisdom quotes
    this.wisdomQuotes = [
      "In the beginner's mind there are many possibilities, but in the expert's mind there are few.",
      "The obstacle is the path.",
      "Let go or be dragged.",
      "The quieter you become, the more you can hear.",
      "Sitting quietly, doing nothing, spring comes, and the grass grows by itself.",
      "When you reach the top of the mountain, keep climbing.",
      "The moon does not fight. It attacks no one. It does not worry. It does not try to crush others.",
      "Before enlightenment: chop wood, carry water. After enlightenment: chop wood, carry water.",
    ];

    this.setupCanvas();
    this.drawSandBase();
  }

  setupCanvas() {
    this.canvas.addEventListener("click", (e) => this.handleClick(e));
    this.canvas.addEventListener("mousemove", (e) => this.handleMouseMove(e));
  }

  drawSandBase() {
    // Base sand color
    this.ctx.fillStyle = "#E8DCC4";
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    // Add subtle texture
    for (let i = 0; i < 200; i++) {
      const x = Math.random() * this.canvas.width;
      const y = Math.random() * this.canvas.height;
      const size = Math.random() * 2;
      this.ctx.fillStyle = `rgba(139, 111, 71, ${Math.random() * 0.1})`;
      this.ctx.fillRect(x, y, size, size);
    }
  }

  handleClick(e) {
    const rect = this.canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    switch (this.currentTool) {
      case "rake":
        this.addRakeLine(x, y);
        break;
      case "rock":
        this.addElement("rock", x, y);
        this.counts.rocks++;
        break;
      case "plant":
        this.addElement("plant", x, y);
        this.counts.plants++;
        break;
      case "tree":
        this.addElement("tree", x, y);
        this.counts.trees++;
        break;
      case "water":
        this.addElement("water", x, y);
        this.counts.water++;
        break;
      case "bridge":
        this.addElement("bridge", x, y);
        this.counts.bridges++;
        break;
      case "lantern":
        this.addElement("lantern", x, y);
        this.counts.lanterns++;
        break;
      case "flower":
        this.addElement("flower", x, y);
        this.counts.flowers++;
        break;
    }

    this.calculateHarmony();
    this.render();
  }

  handleMouseMove(e) {
    // Future: preview placement
  }

  addRakeLine(x, y) {
    this.rakeLines.push({
      x: x,
      y: y,
      length: 100,
      angle: Math.random() * Math.PI * 2,
      pattern: Math.random() > 0.5 ? "wave" : "circle",
    });
  }

  addElement(type, x, y) {
    this.elements.push({
      type: type,
      x: x,
      y: y,
      size: this.getElementSize(type),
      rotation: Math.random() * Math.PI * 2,
    });
  }

  getElementSize(type) {
    const sizes = {
      rock: 40 + Math.random() * 30,
      plant: 30 + Math.random() * 20,
      tree: 60 + Math.random() * 40,
      water: 50,
      bridge: 80,
      lantern: 35,
      flower: 25,
    };
    return sizes[type] || 30;
  }

  calculateHarmony() {
    let score = 0;
    const total = this.elements.length;

    if (total === 0) {
      this.harmony = 0;
      return;
    }

    // Balance of elements
    const rockRatio = this.counts.rocks / total;
    const plantRatio =
      (this.counts.plants + this.counts.trees + this.counts.flowers) / total;
    const waterRatio = this.counts.water / total;

    // Ideal ratios (rocks: 30-40%, plants: 20-30%, water: 10-20%)
    if (rockRatio >= 0.3 && rockRatio <= 0.4) score += 30;
    else if (rockRatio >= 0.2 && rockRatio <= 0.5) score += 20;
    else score += 10;

    if (plantRatio >= 0.2 && plantRatio <= 0.3) score += 30;
    else if (plantRatio >= 0.15 && plantRatio <= 0.4) score += 20;
    else score += 10;

    if (waterRatio >= 0.1 && waterRatio <= 0.2) score += 20;
    else if (waterRatio > 0) score += 10;

    // Rake lines add harmony
    score += Math.min(this.rakeLines.length * 2, 20);

    this.harmony = Math.min(score, 100);
  }

  render() {
    // Redraw base
    this.drawSandBase();

    // Draw rake lines
    this.rakeLines.forEach((line) => this.drawRakeLine(line));

    // Draw elements (back to front)
    this.elements.sort((a, b) => a.y - b.y);
    this.elements.forEach((element) => this.drawElement(element));
  }

  drawRakeLine(line) {
    this.ctx.save();
    this.ctx.strokeStyle = "rgba(139, 111, 71, 0.3)";
    this.ctx.lineWidth = 2;

    if (line.pattern === "wave") {
      this.ctx.beginPath();
      for (let i = 0; i < line.length; i += 5) {
        const offsetX = Math.sin(i * 0.1) * 10;
        this.ctx.lineTo(
          line.x + Math.cos(line.angle) * i + offsetX,
          line.y + Math.sin(line.angle) * i,
        );
      }
      this.ctx.stroke();
    } else {
      // Circular pattern
      this.ctx.beginPath();
      this.ctx.arc(line.x, line.y, 30, 0, Math.PI * 2);
      this.ctx.stroke();
    }

    this.ctx.restore();
  }

  drawElement(element) {
    this.ctx.save();
    this.ctx.translate(element.x, element.y);
    this.ctx.rotate(element.rotation);

    switch (element.type) {
      case "rock":
        this.drawRock(element.size);
        break;
      case "plant":
        this.drawPlant(element.size);
        break;
      case "tree":
        this.drawTree(element.size);
        break;
      case "water":
        this.drawWater(element.size);
        break;
      case "bridge":
        this.drawBridge(element.size);
        break;
      case "lantern":
        this.drawLantern(element.size);
        break;
      case "flower":
        this.drawFlower(element.size);
        break;
    }

    this.ctx.restore();
  }

  drawRock(size) {
    // Shadow
    this.ctx.fillStyle = "rgba(0, 0, 0, 0.2)";
    this.ctx.beginPath();
    this.ctx.ellipse(5, 5, size * 0.4, size * 0.3, 0, 0, Math.PI * 2);
    this.ctx.fill();

    // Rock
    this.ctx.fillStyle = "#6B7280";
    this.ctx.beginPath();
    this.ctx.ellipse(0, 0, size * 0.4, size * 0.35, 0, 0, Math.PI * 2);
    this.ctx.fill();

    // Highlight
    this.ctx.fillStyle = "rgba(255, 255, 255, 0.2)";
    this.ctx.beginPath();
    this.ctx.ellipse(
      -size * 0.1,
      -size * 0.1,
      size * 0.15,
      size * 0.1,
      0,
      0,
      Math.PI * 2,
    );
    this.ctx.fill();
  }

  drawPlant(size) {
    this.ctx.strokeStyle = "#4A7C59";
    this.ctx.lineWidth = 3;
    this.ctx.lineCap = "round";

    // Stems
    for (let i = 0; i < 3; i++) {
      const angle = (i - 1) * 0.3;
      this.ctx.beginPath();
      this.ctx.moveTo(0, 0);
      this.ctx.quadraticCurveTo(
        Math.sin(angle) * size * 0.3,
        -size * 0.5,
        Math.sin(angle) * size * 0.5,
        -size,
      );
      this.ctx.stroke();
    }

    // Leaves
    this.ctx.fillStyle = "#7C9885";
    for (let i = 0; i < 5; i++) {
      const angle = (i / 5) * Math.PI * 2;
      const x = Math.cos(angle) * size * 0.3;
      const y = Math.sin(angle) * size * 0.3 - size * 0.5;
      this.ctx.beginPath();
      this.ctx.ellipse(x, y, 8, 15, angle, 0, Math.PI * 2);
      this.ctx.fill();
    }
  }

  drawTree(size) {
    // Trunk
    this.ctx.fillStyle = "#8B6F47";
    this.ctx.fillRect(-size * 0.1, -size * 0.3, size * 0.2, size * 0.5);

    // Foliage
    this.ctx.fillStyle = "#4A7C59";
    this.ctx.beginPath();
    this.ctx.arc(0, -size * 0.5, size * 0.4, 0, Math.PI * 2);
    this.ctx.fill();

    this.ctx.fillStyle = "#7C9885";
    this.ctx.beginPath();
    this.ctx.arc(-size * 0.2, -size * 0.4, size * 0.3, 0, Math.PI * 2);
    this.ctx.fill();

    this.ctx.beginPath();
    this.ctx.arc(size * 0.2, -size * 0.4, size * 0.3, 0, Math.PI * 2);
    this.ctx.fill();
  }

  drawWater(size) {
    this.ctx.fillStyle = "rgba(184, 212, 232, 0.6)";
    this.ctx.beginPath();
    this.ctx.ellipse(0, 0, size, size * 0.6, 0, 0, Math.PI * 2);
    this.ctx.fill();

    // Ripples
    this.ctx.strokeStyle = "rgba(184, 212, 232, 0.8)";
    this.ctx.lineWidth = 2;
    for (let i = 1; i <= 3; i++) {
      this.ctx.beginPath();
      this.ctx.arc(0, 0, size * 0.3 * i, 0, Math.PI * 2);
      this.ctx.stroke();
    }
  }

  drawBridge(size) {
    this.ctx.fillStyle = "#8B6F47";
    this.ctx.fillRect(-size * 0.5, -10, size, 20);

    // Rails
    this.ctx.strokeStyle = "#6B5436";
    this.ctx.lineWidth = 3;
    this.ctx.beginPath();
    this.ctx.moveTo(-size * 0.5, -15);
    this.ctx.lineTo(size * 0.5, -15);
    this.ctx.moveTo(-size * 0.5, 15);
    this.ctx.lineTo(size * 0.5, 15);
    this.ctx.stroke();
  }

  drawLantern(size) {
    // Base
    this.ctx.fillStyle = "#6B7280";
    this.ctx.fillRect(-size * 0.3, 0, size * 0.6, size * 0.2);

    // Body
    this.ctx.fillStyle = "#FAF9F6";
    this.ctx.fillRect(-size * 0.35, -size * 0.6, size * 0.7, size * 0.6);

    // Top
    this.ctx.fillStyle = "#6B7280";
    this.ctx.beginPath();
    this.ctx.moveTo(-size * 0.4, -size * 0.6);
    this.ctx.lineTo(0, -size * 0.8);
    this.ctx.lineTo(size * 0.4, -size * 0.6);
    this.ctx.closePath();
    this.ctx.fill();

    // Glow
    this.ctx.fillStyle = "rgba(255, 200, 100, 0.3)";
    this.ctx.fillRect(-size * 0.25, -size * 0.5, size * 0.5, size * 0.4);
  }

  drawFlower(size) {
    // Petals
    this.ctx.fillStyle = "#FFB7C5";
    for (let i = 0; i < 5; i++) {
      const angle = (i / 5) * Math.PI * 2;
      const x = Math.cos(angle) * size * 0.3;
      const y = Math.sin(angle) * size * 0.3;
      this.ctx.beginPath();
      this.ctx.arc(x, y, size * 0.3, 0, Math.PI * 2);
      this.ctx.fill();
    }

    // Center
    this.ctx.fillStyle = "#FFC0CB";
    this.ctx.beginPath();
    this.ctx.arc(0, 0, size * 0.2, 0, Math.PI * 2);
    this.ctx.fill();
  }

  clear() {
    this.elements = [];
    this.rakeLines = [];
    this.counts = {
      rocks: 0,
      plants: 0,
      trees: 0,
      water: 0,
      bridges: 0,
      lanterns: 0,
      flowers: 0,
    };
    this.harmony = 0;
    this.render();
  }

  getRandomWisdom() {
    return this.wisdomQuotes[
      Math.floor(Math.random() * this.wisdomQuotes.length)
    ];
  }
}
