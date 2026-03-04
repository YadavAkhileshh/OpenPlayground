const canvas = document.getElementById("introCanvas");
const ctx = canvas.getContext("2d");

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

let bowX = -200;
let bowY = canvas.height / 2;

let arrowX = -250;
let arrowY = bowY;

let bowSpeed = 5;
let arrowSpeed = 8;

function drawBow(x, y) {
  ctx.save();
  ctx.beginPath();
  ctx.moveTo(x, y - 110);
  ctx.quadraticCurveTo(x - 80, y, x, y + 110);
  ctx.strokeStyle = "#5c3a1a";
  ctx.lineWidth = 18;
  ctx.lineCap = "round";
  ctx.stroke();

  // string
  ctx.beginPath();
  ctx.moveTo(x, y - 110);
  ctx.lineTo(x, y);
  ctx.lineTo(x, y + 110);
  ctx.strokeStyle = "#eee";
  ctx.lineWidth = 3;
  ctx.stroke();
  ctx.restore();
}

function drawArrow(x, y) {
  ctx.save();
  ctx.translate(x, y);
  ctx.fillStyle = "#c2a26b";
  ctx.fillRect(-45, -2, 55, 4);
  ctx.beginPath();
  ctx.moveTo(10, -8);
  ctx.lineTo(28, 0);
  ctx.lineTo(10, 8);
  ctx.fillStyle = "#444";
  ctx.fill();
  ctx.restore();
}

function introLoop() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Animate bow sliding in
  if (bowX < 200) bowX += bowSpeed;
  drawBow(bowX, bowY);

  // Animate arrow moving into bow
  if (arrowX < bowX - 30) arrowX += arrowSpeed;
  drawArrow(arrowX, arrowY);

  requestAnimationFrame(introLoop);
}

introLoop();

// Transition to main game after 4 seconds
setTimeout(() => {
  window.location.href = "index.html"; // your main game file
}, 4000);