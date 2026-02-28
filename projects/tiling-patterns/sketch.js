// Get canvas and drawing context
const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

// Set canvas size to match the window
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

// Define the size of each tile
const tileSize = 40;

// Paint background once
ctx.fillStyle = "black";
ctx.fillRect(0, 0, canvas.width, canvas.height);

// Loop through the canvas using a grid (tiling)
for (let y = 0; y < canvas.height; y += tileSize) {
  for (let x = 0; x < canvas.width; x += tileSize) {

    /*
      For each tile, randomly choose one of two diagonals.
      This simple rule, repeated across the grid,
      creates a structured tiling pattern.
    */
    const choice = Math.random() > 0.5;

    ctx.strokeStyle = "white";
    ctx.lineWidth = 2;

    ctx.beginPath();
    if (choice) {
      // Diagonal from top-left to bottom-right
      ctx.moveTo(x, y);
      ctx.lineTo(x + tileSize, y + tileSize);
    } else {
      // Diagonal from bottom-left to top-right
      ctx.moveTo(x, y + tileSize);
      ctx.lineTo(x + tileSize, y);
    }
    ctx.stroke();
  }
}