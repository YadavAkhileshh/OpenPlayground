const starCanvas = document.getElementById("stars");
const sctx = starCanvas.getContext("2d");

starCanvas.width = window.innerWidth;
starCanvas.height = window.innerHeight;

const stars = Array.from({ length: 300 }, () => ({
  x: Math.random() * starCanvas.width,
  y: Math.random() * starCanvas.height,
  z: Math.random() * 2 + 0.5,
}));

function drawStars() {
  sctx.clearRect(0, 0, starCanvas.width, starCanvas.height);

  stars.forEach((s) => {
    s.y += s.z;
    if (s.y > starCanvas.height) s.y = 0;

    sctx.fillStyle = "white";
    sctx.fillRect(s.x, s.y, 1.2, 1.2);
  });

  requestAnimationFrame(drawStars);
}

drawStars();
