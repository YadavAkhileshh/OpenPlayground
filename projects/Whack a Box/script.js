const box = document.getElementById("box");
const scoreText = document.getElementById("score");

let score = 0;
let color = "";
let clicked = false;

function randomPos() {
  return Math.floor(Math.random() * 235);
}

function randomColor() {
  const r = Math.random();
  if (r < 0.5) return "green";
  if (r < 0.75) return "golden";
  return "red";
}

function showBox() {
  clicked = false;
  color = randomColor();

  box.className = `box ${color}`;
  box.style.left = randomPos() + "px";
  box.style.top = randomPos() + "px";
  box.style.display = "block";

  setTimeout(() => {
    if (!clicked && (color === "green" || color === "golden")) {
      score -= 1;
      updateScore();
    }
    box.style.display = "none";
  }, 900);
}

box.addEventListener("click", () => {
  if (clicked) return;
  clicked = true;

  if (color === "green") score += 1;
  if (color === "golden") score += 4;
  if (color === "red") score -= 3;

  updateScore();
  box.style.display = "none";
});

function updateScore() {
  scoreText.textContent = score;
}

function resetGame() {
  score = 0;
  updateScore();
}

setInterval(showBox, 1200);
