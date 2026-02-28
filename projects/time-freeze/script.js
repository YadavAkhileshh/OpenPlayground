  const obstacle = document.getElementById("obstacle");
  const game = document.getElementById("game");

  let obstacleX = 600;
  let speed = 4;
  let freeze = false;

  function moveObstacle() {
    if (!freeze) {
      obstacleX -= speed;
      obstacle.style.left = obstacleX + "px";

      if (obstacleX < -40) {
        obstacleX = 600;
      }

      // Collision
      let player = document.getElementById("player");
      let pRect = player.getBoundingClientRect();
      let oRect = obstacle.getBoundingClientRect();

      if (
        pRect.right > oRect.left &&
        pRect.left < oRect.right &&
        pRect.bottom > oRect.top &&
        pRect.top < oRect.bottom
      ) {
        alert("💥 Game Over!");
        location.reload();
      }
    }
    requestAnimationFrame(moveObstacle);
  }

  moveObstacle();

  // Freeze time
  document.addEventListener("keydown", (e) => {
    if (e.code === "Space") {
      freeze = true;
      game.classList.add("freeze");
    }
  });

  document.addEventListener("keyup", (e) => {
    if (e.code === "Space") {
      freeze = false;
      game.classList.remove("freeze");
    }
  });