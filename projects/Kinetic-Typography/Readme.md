// ==================================================
// Canvas Setup
// ==================================================

const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

// ==================================================
// ✍️ Kinetic Typography Logic
// ==================================================

/*
  Kinetic typography treats text as a collection
  of independent visual elements.

  Instead of moving the entire word as one block,
  we animate each character separately using time
  and mathematical functions.
*/

// Text to animate
const text = "MOVE WITH ME";

// Typography settings
const fontSize = 80;
ctx.font = `${fontSize}px sans-serif`;
ctx.textAlign = "center";
ctx.textBaseline = "middle";

// Pre-calculate letter spacing
const letterSpacing = 45;

// Time variable for animation
let time = 0;

// ==================================================
// Animation Loop
// ==================================================

function animate() {
  // Clear background each frame
  ctx.fillStyle = "#0e0e0e";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Starting position (centered text)
  const startX = canvas.width / 2 - (text.length - 1) * letterSpacing / 2;
  const baseY = canvas.height / 2;

  // Draw each character individually
  for (let i = 0; i < text.length; i++) {
    const char = text[i];

    /*
      Each character gets its own vertical offset
      based on a sine wave.

      - time controls animation
      - index offsets the phase
      - result feels like a flowing wave
    */
    const offsetY = Math.sin(time + i * 0.4) * 25;

    ctx.fillStyle = "#eaeaea";
    ctx.fillText(
      char,
      startX + i * letterSpacing,
      baseY + offsetY
    );
  }

  // Increment time for next frame
  time += 0.05;

  requestAnimationFrame(animate);
}

// Start animation
animate();