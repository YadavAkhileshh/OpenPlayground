const brushSizeInput = document.getElementById("brushSize");
const colorPicker = document.getElementById("colorPicker");

const eraserBtn = document.getElementById("eraserBtn");
const clearBtn = document.getElementById("clearBtn");
const saveBtn = document.getElementById("saveBtn");

// Brush Size Change
brushSizeInput.addEventListener("input", (e) => {
  brushSize = e.target.value;
});

// Color Change
colorPicker.addEventListener("input", (e) => {
  brushColor = e.target.value;
});

// Eraser Mode
eraserBtn.addEventListener("click", () => {
  brushColor = "#000010";
});

// Clear Board
clearBtn.addEventListener("click", () => {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
});

// Save Drawing
saveBtn.addEventListener("click", () => {
  const link = document.createElement("a");
  link.download = "syncboard-drawing.png";
  link.href = canvas.toDataURL();
  link.click();
});
