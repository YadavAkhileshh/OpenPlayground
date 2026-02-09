class Ecosystem {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext("2d");
    this.canvas.width = 800;
    this.canvas.height = 600;
    this.organisms = [];
    this.flora = 50;
    this.fauna = 50;
    this.water = 50;
    this.balance = 0;
    this.time = 0;
  }
  addOrganism(type, x, y) {
    const organism = {
      type,
      x,
      y,
      age: 0,
      energy: 100,
      size: type.includes("tree")
        ? 40
        : type.includes("plant") ||
            type.includes("grass") ||
            type.includes("flower")
          ? 20
          : 30,
    };
    this.organisms.push(organism);
    this.updateBalance();
  }
  updateBalance() {
    const counts = {
      plant: 0,
      tree: 0,
      flower: 0,
      grass: 0,
      rabbit: 0,
      deer: 0,
      fox: 0,
      bird: 0,
      butterfly: 0,
      fish: 0,
    };
    this.organisms.forEach((o) => counts[o.type]++);
    const totalFlora =
      counts.plant + counts.tree + counts.flower + counts.grass;
    const totalHerbivores =
      counts.rabbit + counts.deer + counts.butterfly + counts.fish;
    const totalPredators = counts.fox + counts.bird;
    this.flora = Math.min(100, totalFlora * 10);
    this.fauna = Math.min(100, (totalHerbivores + totalPredators) * 8);
    const diversity = Object.values(counts).filter((v) => v > 0).length;
    this.balance = Math.round(
      ((this.flora + this.fauna + this.water) / 3) * 0.7 + diversity * 3,
    );
    if (this.onBalanceUpdate) this.onBalanceUpdate();
  }
  rain() {
    this.water = Math.min(100, this.water + 20);
    this.organisms.forEach((o) => {
      if (["plant", "tree", "flower", "grass"].includes(o.type)) {
        o.energy = Math.min(100, o.energy + 10);
      }
    });
  }
  sunshine() {
    this.organisms.forEach((o) => {
      if (["plant", "tree", "flower", "grass"].includes(o.type)) {
        o.energy = Math.min(100, o.energy + 15);
      }
    });
    this.water = Math.max(0, this.water - 5);
  }
  update() {
    this.time++;
    this.organisms.forEach((o, i) => {
      o.age++;
      if (o.age > 1000) this.organisms.splice(i, 1);
      if (["plant", "tree", "flower", "grass"].includes(o.type)) {
        o.energy -= 0.1;
        if (this.water > 20) o.energy += 0.2;
      } else {
        o.energy -= 0.2;
        const nearbyFlora = this.organisms.filter(
          (other) =>
            ["plant", "tree", "flower", "grass"].includes(other.type) &&
            Math.hypot(o.x - other.x, o.y - other.y) < 50,
        );
        if (
          nearbyFlora.length > 0 &&
          ["rabbit", "deer", "butterfly", "fish"].includes(o.type)
        ) {
          o.energy += 0.3;
        }
        if (["fox", "bird"].includes(o.type)) {
          const nearbyHerb = this.organisms.filter(
            (other) =>
              ["rabbit", "deer"].includes(other.type) &&
              Math.hypot(o.x - other.x, o.y - other.y) < 50,
          );
          if (nearbyHerb.length > 0) o.energy += 0.5;
        }
      }
      if (o.energy <= 0) this.organisms.splice(i, 1);
    });
    this.water = Math.max(0, this.water - 0.05);
    this.updateBalance();
  }
  render() {
    this.ctx.fillStyle = "#E3F2FD";
    this.ctx.fillRect(0, 0, this.canvas.width, 300);
    this.ctx.fillStyle = "#C8E6C9";
    this.ctx.fillRect(0, 300, this.canvas.width, 200);
    this.ctx.fillStyle = "#A5D6A7";
    this.ctx.fillRect(0, 500, this.canvas.width, 100);
    this.organisms.forEach((o) => {
      this.ctx.font = "30px Arial";
      const emojis = {
        plant: "🌱",
        tree: "🌳",
        flower: "🌸",
        grass: "🌾",
        rabbit: "🐰",
        deer: "🦌",
        fox: "🦊",
        bird: "🐦",
        butterfly: "🦋",
        fish: "🐟",
      };
      this.ctx.fillText(emojis[o.type] || "?", o.x - 15, o.y + 15);
    });
  }
  clear() {
    this.organisms = [];
    this.flora = 50;
    this.fauna = 50;
    this.water = 50;
    this.updateBalance();
  }
}
