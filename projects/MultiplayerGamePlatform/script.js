const gameArea = document.getElementById("gameArea");
const joinBtn = document.getElementById("joinBtn");
const statusText = document.getElementById("status");

let players = [];
let currentPlayer = null;

function randomColor() {
  return `hsl(${Math.random()*360},70%,55%)`;
}

function createPlayer(name) {
  const div = document.createElement("div");
  div.className = "player";
  div.style.background = randomColor();

  const player = {
    name,
    x: Math.random() * 700,
    y: Math.random() * 350,
    el: div
  };

  div.textContent = name[0].toUpperCase();
  gameArea.appendChild(div);

  players.push(player);
  renderPlayers();

  return player;
}

function renderPlayers() {
  players.forEach(p => {
    p.el.style.left = p.x + "px";
    p.el.style.top = p.y + "px";
  });

  statusText.textContent =
    `Status: ${players.length} player(s) in game`;
}

function movePlayer(dx, dy) {
  if (!currentPlayer) return;

  currentPlayer.x += dx;
  currentPlayer.y += dy;

  currentPlayer.x = Math.max(0, Math.min(765, currentPlayer.x));
  currentPlayer.y = Math.max(0, Math.min(415, currentPlayer.y));

  renderPlayers();
}

joinBtn.addEventListener("click", () => {
  const name = document.getElementById("playerName").value.trim();
  if (!name) return;

  currentPlayer = createPlayer(name);
  statusText.textContent = `${name} joined! Use arrow keys to move`;
});

/* Keyboard movement */
document.addEventListener("keydown", e => {
  if (!currentPlayer) return;

  if (e.key === "ArrowUp") movePlayer(0,-10);
  if (e.key === "ArrowDown") movePlayer(0,10);
  if (e.key === "ArrowLeft") movePlayer(-10,0);
  if (e.key === "ArrowRight") movePlayer(10,0);
});

/* Demo: fake other players (simulation) */
setInterval(() => {
  players.forEach(p => {
    if (p !== currentPlayer) {
      p.x += Math.random()*20-10;
      p.y += Math.random()*20-10;
      p.x = Math.max(0, Math.min(765,p.x));
      p.y = Math.max(0, Math.min(415,p.y));
    }
  });
  renderPlayers();
}, 500);