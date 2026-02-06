const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");
const app = document.getElementById("app");
const shakeBtn = document.getElementById("shakeBtn");

const MOVE_AMOUNT = 10;

// Start position
let x = canvas.width / 2;
let y = canvas.height / 2;

// Drawing style
ctx.strokeStyle = "#333";
ctx.lineWidth = 3;
ctx.lineCap = "round";

// Initial dot
ctx.beginPath();
ctx.moveTo(x, y);
ctx.lineTo(x, y);
ctx.stroke();

function draw({ key }) {
  ctx.beginPath();
  ctx.moveTo(x, y);

  switch (key) {
    case "ArrowUp":
      y -= MOVE_AMOUNT;
      break;
    case "ArrowDown":
      y += MOVE_AMOUNT;
      break;
    case "ArrowLeft":
      x -= MOVE_AMOUNT;
      break;
    case "ArrowRight":
      x += MOVE_AMOUNT;
      break;
    default:
      return;
  }

  ctx.lineTo(x, y);
  ctx.stroke();
}

function handleKey(e) {
  if (e.key.includes("Arrow")) {
    e.preventDefault();
    draw(e);
  }
}

function shakeCanvas() {
  app.classList.add("shake");

  setTimeout(() => {
    app.classList.remove("shake");
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.beginPath();
    ctx.moveTo(x, y);
  }, 400);
}

window.addEventListener("keydown", handleKey);
shakeBtn.addEventListener("click", shakeCanvas);
