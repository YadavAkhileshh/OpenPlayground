const game = new ConstellationHunt(
  document.getElementById("starCanvas"),
  document.getElementById("targetCanvas"),
);

const scoreDisplay = document.getElementById("score");
const levelDisplay = document.getElementById("level");
const foundDisplay = document.getElementById("found");
const timerDisplay = document.getElementById("timer");
const constellationName = document.getElementById("constellationName");
const discoveredList = document.getElementById("discoveredList");
const hintBtn = document.getElementById("hintBtn");
const clearBtn = document.getElementById("clearBtn");
const skipBtn = document.getElementById("skipBtn");
const connectionStatus = document.getElementById("connectionStatus");
const hintText = document.getElementById("hintText");

game.onConstellationFound = (name) => {
  const item = document.createElement("div");
  item.className = "discovered-item";
  item.textContent = "⭐ " + name;

  if (discoveredList.querySelector(".empty-state")) {
    discoveredList.innerHTML = "";
  }

  discoveredList.appendChild(item);
};

game.onGameOver = () => {
  alert(`Time Up!\nScore: ${game.score}\nFound: ${game.found}`);
};

function gameLoop() {
  game.render();
  scoreDisplay.textContent = game.score;
  levelDisplay.textContent = game.level;
  foundDisplay.textContent = game.found + "/5";
  timerDisplay.textContent = game.timer;
  constellationName.textContent = game.currentConstellation.name;
  requestAnimationFrame(gameLoop);
}

gameLoop();
