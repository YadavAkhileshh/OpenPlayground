// Get canvas and drawing context
const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

// Set canvas size
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

// Store all generated circles
const circles = [];

// Limit the number of placement attempts
// to avoid infinite loops
const maxAttempts = 5000;

// Circle constructor
function Circle(x, y) {
  this.x = x;
  this.y = y;
  this.r = 1;          // initial radius
  this.growing = true; // whether the circle is still growing
}

// Check if a circle overlaps any existing circle
function isOverlapping(circle) {
  for (let other of circles) {
    const dx = circle.x - other.x;
    const dy = circle.y - other.y;
    const dist = Math.sqrt(dx * dx + dy * dy);

    // If distance is smaller than combined radii,
    // circles are overlapping
    if (dist < circle.r + other.r + 2) {
      return true;
    }
  }
  return false;
}

// Try placing new circles at random positions
for (let i = 0; i < maxAttempts; i++) {
  const x = Math.random() * canvas.width;
  const y = Math.random() * canvas.height;

  const newCircle = new Circle(x, y);

  // Only add the circle if it doesn't overlap
  if (!isOverlapping(newCircle)) {
    circles.push(newCircle);
  }
}

// Grow circles until they hit another circle or the canvas edge
let growing = true;
while (growing) {
  growing = false;

  for (let c of circles) {
    if (c.growing) {

      // Stop growing if the circle hits the canvas edge
      if (
        c.x + c.r >= canvas.width ||
        c.x - c.r <= 0 ||
        c.y + c.r >= canvas.height ||
        c.y - c.r <= 0
      ) {
        c.growing = false;
      } else {
        // Stop growing if the circle touches another circle
        for (let other of circles) {
          if (c !== other) {
            const dx = c.x - other.x;
            const dy = c.y - other.y;
            const dist = Math.sqrt(dx * dx + dy * dy);

            if (dist < c.r + other.r + 2) {
              c.growing = false;
              break;
            }
          }
        }
      }

      // Increase radius if still growing
      if (c.growing) {
        c.r += 0.5;
        growing = true;
      }
    }
  }
}

// Draw all circles
ctx.strokeStyle = "white";
ctx.lineWidth = 1;

for (let c of circles) {
  ctx.beginPath();
  ctx.arc(c.x, c.y, c.r, 0, Math.PI * 2);
  ctx.stroke();
}