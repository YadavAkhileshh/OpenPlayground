let health = 100;
let energy = 100;
let day = 1;
let timer;

const healthBar = document.getElementById("health-bar");
const energyBar = document.getElementById("energy-bar");
const dayText = document.getElementById("day");
const message = document.getElementById("message");

function updateUI() {
  healthBar.style.width = health + "%";
  energyBar.style.width = energy + "%";
  dayText.textContent = "Day: " + day;
}

function startGame() {
  clearInterval(timer);
  message.textContent = "";

  timer = setInterval(() => {
    energy -= 5;

    if (energy <= 0) {
      energy = 0;
      health -= 10;
    }

    if (health <= 0) {
      health = 0;
      message.textContent = "Game Over";
      clearInterval(timer);
    }

    day++;
    updateUI();
  }, 1000);
}

function restartGame() {
  clearInterval(timer);
  health = 100;
  energy = 100;
  day = 1;
  message.textContent = "";
  updateUI();
}

document.getElementById("start-btn").addEventListener("click", startGame);
document.getElementById("restart-btn").addEventListener("click", restartGame);

updateUI();
