const game = document.getElementById("game");
const player = document.getElementById("player");
const scoreText = document.getElementById("score");

let isJumping = false;
let score = 0;
let gameOver = false;

/* ---------------- PLAYER JUMP ---------------- */
document.addEventListener("keydown", (e) => {
  if (e.code === "Space" && !isJumping && !gameOver) {
    jump();
  }
});

function jump() {
  isJumping = true;
  let position = 10;

  const upInterval = setInterval(() => {
    if (position >= 130) {
      clearInterval(upInterval);

      const downInterval = setInterval(() => {
        if (position <= 10) {
          clearInterval(downInterval);
          isJumping = false;
        }
        position -= 5;
        player.style.bottom = position + "px";
      }, 20);
    }

    position += 5;
    player.style.bottom = position + "px";
  }, 20);
}

/* ---------------- CLOUD CREATION ---------------- */
function createCloud() {
  if (gameOver) return;

  const cloud = document.createElement("div");
  cloud.classList.add("cloud");
  cloud.style.left = Math.random() * 340 + "px";
  game.appendChild(cloud);

  let cloudTop = -50;

  const fallInterval = setInterval(() => {
    if (gameOver) {
      clearInterval(fallInterval);
      cloud.remove();
      return;
    }

    cloudTop += 4;
    cloud.style.top = cloudTop + "px";

    // Collision Detection
    const playerRect = player.getBoundingClientRect();
    const cloudRect = cloud.getBoundingClientRect();

    if (
      cloudRect.bottom >= playerRect.top &&
      cloudRect.left <= playerRect.right &&
      cloudRect.right >= playerRect.left
    ) {
      endGame();
    }

    // Remove cloud after leaving screen
    if (cloudTop > 500) {
      clearInterval(fallInterval);
      cloud.remove();
    }
  }, 20);
}

/* ---------------- SCORE ---------------- */
setInterval(() => {
  if (!gameOver) {
    score++;
    scoreText.innerText = "Score: " + score;
  }
}, 1000);

/* ---------------- GAME OVER ---------------- */
function endGame() {
  gameOver = true;
  alert("Game Over! Your Score: " + score);
  location.reload();
}

/* ---------------- START GAME ---------------- */
setInterval(createCloud, 1500);
