// Get canvas and drawing context
const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

// Set canvas size
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

// Set drawing style
ctx.strokeStyle = "white";
ctx.lineWidth = 2;

/*
  Recursive function to draw a tree branch.
  Each call draws one branch and then
  recursively draws two smaller branches.
*/
function drawBranch(x, y, length, angle) {
  // Base case: stop recursion when branch is too small
  if (length < 10) return;

  // Calculate end point of the branch using trigonometry
  const x2 = x + Math.cos(angle) * length;
  const y2 = y + Math.sin(angle) * length;

  // Draw the current branch
  ctx.beginPath();
  ctx.moveTo(x, y);
  ctx.lineTo(x2, y2);
  ctx.stroke();

  // Recursively draw left and right branches
  drawBranch(x2, y2, length * 0.7, angle - Math.PI / 6);
  drawBranch(x2, y2, length * 0.7, angle + Math.PI / 6);
}

// Clear background
ctx.fillStyle = "black";
ctx.fillRect(0, 0, canvas.width, canvas.height);

// Start recursion from the bottom center of the canvas
drawBranch(
  canvas.width / 2,
  canvas.height,
  120,
  -Math.PI / 2
);