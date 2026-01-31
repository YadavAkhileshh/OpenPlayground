// Get canvas and drawing context
const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

// Set canvas size to match window
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

// Size of each terrain cell (controls resolution)
const scale = 8;

// Number of columns and rows in the terrain grid
const cols = Math.floor(canvas.width / scale);
const rows = Math.floor(canvas.height / scale);

// Generate a grid of random values (base noise)
const noise = [];
for (let y = 0; y <= rows; y++) {
  noise[y] = [];
  for (let x = 0; x <= cols; x++) {
    noise[y][x] = Math.random();
  }
}

// Linear interpolation helper function
function lerp(a, b, t) {
  return a + (b - a) * t;
}

/*
  Smooth noise sampling using bilinear interpolation.
  This creates smooth transitions between random values,
  similar to Perlin noise behavior.
*/
function smoothNoise(x, y) {
  const x0 = Math.floor(x);
  const x1 = x0 + 1;
  const y0 = Math.floor(y);
  const y1 = y0 + 1;

  const sx = x - x0;
  const sy = y - y0;

  const n0 = lerp(noise[y0][x0], noise[y0][x1], sx);
  const n1 = lerp(noise[y1][x0], noise[y1][x1], sx);

  return lerp(n0, n1, sy);
}

// Draw the terrain
for (let y = 0; y < rows; y++) {
  for (let x = 0; x < cols; x++) {

    // Sample smooth noise at a lower frequency
    const value = smoothNoise(x * 0.1, y * 0.1);

    // Map height value to grayscale color
    const shade = Math.floor(value * 255);
    ctx.fillStyle = `rgb(${shade}, ${shade}, ${shade})`;

    // Draw terrain cell
    ctx.fillRect(
      x * scale,
      y * scale,
      scale,
      scale
    );
  }
}