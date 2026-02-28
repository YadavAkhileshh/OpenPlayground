export class Room {
  constructor(x, y, w, h) {
    this.x1 = x;
    this.y1 = y;
    this.x2 = x + w;
    this.y2 = y + h;
    this.center = {
      x: Math.floor((this.x1 + this.x2) / 2),
      y: Math.floor((this.y1 + this.y2) / 2),
    };
  }
  intersects(other) {
    return (
      this.x1 <= other.x2 &&
      this.x2 >= other.x1 &&
      this.y1 <= other.y2 &&
      this.y2 >= other.y1
    );
  }
}

export function generateDungeon(config) {
  let grid = Array(config.map.height)
    .fill()
    .map(() => Array(config.map.width).fill(1)); // 1 = Wall
  let rooms = [];
  for (let i = 0; i < config.generation.maxRooms; i++) {
    let w =
      Math.floor(
        Math.random() * (config.generation.roomMax - config.generation.roomMin),
      ) + config.generation.roomMin;
    let h =
      Math.floor(
        Math.random() * (config.generation.roomMax - config.generation.roomMin),
      ) + config.generation.roomMin;
    let x = Math.floor(Math.random() * (config.map.width - w - 1)) + 1;
    let y = Math.floor(Math.random() * (config.map.height - h - 1)) + 1;
    let newRoom = new Room(x, y, w, h);
    if (!rooms.some((r) => r.intersects(newRoom))) {
      for (let row = y; row < y + h; row++)
        for (let col = x; col < x + w; col++) grid[row][col] = 0; // 0 = Floor
      rooms.push(newRoom);
    }
  }
  return { grid, rooms };
}
