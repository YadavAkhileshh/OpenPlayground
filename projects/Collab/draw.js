const canvas = document.getElementById("board");
const ctx = canvas.getContext("2d");

let painting = false;
let brushColor = "#ff00ff";
let brushSize = 5;

// Resize canvas properly
function resizeCanvas() {
  canvas.width = canvas.offsetWidth;
  canvas.height = canvas.offsetHeight;
}
window.addEventListener("resize", resizeCanvas);
resizeCanvas();

// Start Drawing
function startDraw(e) {
  painting = true;
  draw(e);
}

// Stop Drawing
function stopDraw() {
  painting = false;
  ctx.beginPath();
}

// Draw Function
function draw(e) {
  if (!painting) return;

  ctx.lineWidth = brushSize;
  ctx.lineCap = "round";
  ctx.strokeStyle = brushColor;

  ctx.lineTo(e.offsetX, e.offsetY);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(e.offsetX, e.offsetY);
}

// Mouse Events
canvas.addEventListener("mousedown", startDraw);
canvas.addEventListener("mouseup", stopDraw);
canvas.addEventListener("mousemove", draw);
