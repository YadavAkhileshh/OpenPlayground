const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");
const resetBtn = document.getElementById("resetBtn");

// Physics constants
const g = 9.81;          // gravity
const length = 180;      // pendulum length (pixels)
const origin = {
  x: canvas.width / 2,
  y: 80
};

// State variables
let angle = Math.PI / 4; // initial angle (45°)
let angularVelocity = 0;
let angularAcceleration = 0;
const damping = 0.995;

// Reset simulation
resetBtn.addEventListener("click", () => {
  angle = Math.PI / 4;
  angularVelocity = 0;
});

// Main loop
function update() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Physics calculation
  angularAcceleration = (-g / length) * Math.sin(angle);
  angularVelocity += angularAcceleration;
  angularVelocity *= damping;
  angle += angularVelocity;

  drawPendulum();
  requestAnimationFrame(update);
}

// Drawing
function drawPendulum() {
  const bobX = origin.x + length * Math.sin(angle);
  const bobY = origin.y + length * Math.cos(angle);

  // Rod
  ctx.beginPath();
  ctx.moveTo(origin.x, origin.y);
  ctx.lineTo(bobX, bobY);
  ctx.strokeStyle = "#94a3b8";
  ctx.lineWidth = 2;
  ctx.stroke();

  // Pivot
  ctx.beginPath();
  ctx.arc(origin.x, origin.y, 5, 0, Math.PI * 2);
  ctx.fillStyle = "#e5e7eb";
  ctx.fill();

  // Bob
  ctx.beginPath();
  ctx.arc(bobX, bobY, 12, 0, Math.PI * 2);
  ctx.fillStyle = "#38bdf8";
  ctx.fill();
}

update();
