import { generateDungeon } from "./any.js";

const canvas = document.getElementById("dungeonCanvas");
const ctx = canvas.getContext("2d");
const config = await fetch("./project.json").then((r) => r.json());

canvas.width = config.map.width * config.map.tileSize;
canvas.height = config.map.height * config.map.tileSize;

let { grid, rooms } = generateDungeon(config);
let player = { x: rooms[0].center.x, y: rooms[0].center.y, hp: 100 };
let enemies = rooms
  .slice(1)
  .map((r) => ({ x: r.center.x, y: r.center.y, hp: 20 }));

function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Draw Map with "Fog" logic
  for (let y = 0; y < config.map.height; y++) {
    for (let x = 0; x < config.map.width; x++) {
      let dist = Math.hypot(x - player.x, y - player.y);
      if (dist > 6) {
        ctx.fillStyle = "#000";
      } else {
        ctx.fillStyle = grid[y][x] === 1 ? "#1a1a1a" : "#0a2a0a";
        if (grid[y][x] === 1) {
          ctx.strokeStyle = "#00ff4133";
          ctx.strokeRect(x * 20, y * 20, 20, 20);
        }
      }
      ctx.fillRect(x * 20, y * 20, 20, 20);
    }
  }

  // Draw Player
  ctx.shadowBlur = 10;
  ctx.shadowColor = "#00ff41";
  ctx.fillStyle = "#00ff41";
  ctx.font = "15px Arial";
  ctx.fillText("@", player.x * 20 + 5, player.y * 20 + 15);

  // Draw Enemies
  enemies.forEach((en) => {
    let dist = Math.hypot(en.x - player.x, en.y - player.y);
    if (dist < 6) {
      ctx.fillStyle = "#ff3300";
      ctx.fillText("x", en.x * 20 + 5, en.y * 20 + 15);
    }
  });
}

window.addEventListener("keydown", (e) => {
  let nx = player.x,
    ny = player.y;
  if (e.key === "ArrowUp") ny--;
  if (e.key === "ArrowDown") ny++;
  if (e.key === "ArrowLeft") nx--;
  if (e.key === "ArrowRight") nx++;

  // Senior Dev Tip: Always check if the coordinates exist in the array first
  if (grid[ny] && grid[ny][nx] !== undefined && grid[ny][nx] === 0) {
    player.x = nx;
    player.y = ny;

    // Combat Logic
    enemies.forEach((en, i) => {
      if (en.x === nx && en.y === ny) {
        en.hp -= 10;
        player.hp -= 5;
        if (en.hp <= 0) enemies.splice(i, 1);
      }
    });
  }

  document.getElementById("hp-val").innerText = Math.max(0, player.hp);
  if (player.hp <= 0)
    document.getElementById("death-screen").classList.remove("hidden");
  draw();
});

draw();
