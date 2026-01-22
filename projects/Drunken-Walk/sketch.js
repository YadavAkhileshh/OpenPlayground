// Get the canvas element from the DOM
const canvas = document.getElementById("canvas");

// Get the 2D drawing context
const ctx = canvas.getContext("2d");

// Set canvas size to match the browser window
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

// Start the walker from the center of the canvas
let x = canvas.width / 2;
let y = canvas.height / 2;

// Paint the background once (not every frame)
ctx.fillStyle = "black";
ctx.fillRect(0, 0, canvas.width, canvas.height);

// Set the thickness of the path
ctx.lineWidth = 1;

// Perform a finite number of steps to avoid infinite loops
for (let i = 0; i < 15000; i++) {
  // Store previous position before moving
  const prevX = x;
  const prevY = y;

  /*
    Generate a random value between 0 and 4.
    Each range corresponds to a movement direction:
    0–1 → move right
    1–2 → move left
    2–3 → move down
    3–4 → move up

    This randomness is the core idea of the
    "Drunken Walk" algorithm.
  */
  const step = Math.random() * 4;

  if (step < 1) x += 2;
  else if (step < 2) x -= 2;
  else if (step < 3) y += 2;
  else y -= 2;

  /*
    Use HSL color space so the hue changes gradually
    as the number of steps increases, creating
    smooth color variation along the path.
  */
  ctx.strokeStyle = `hsl(${i / 40}, 70%, 60%)`;

  // Draw a line from the previous position to the new position
  ctx.beginPath();
  ctx.moveTo(prevX, prevY);
  ctx.lineTo(x, y);
  ctx.stroke();
}