const canvas = document.getElementById("drawingCanvas");
const ctx = canvas.getContext("2d");

const colorPicker = document.getElementById("colorPicker");
const brushSize = document.getElementById("brushSize");
const clearBtn = document.getElementById("clearCanvas");

// Set canvas to full available area
canvas.width = window.innerWidth;
canvas.height = window.innerHeight - document.querySelector("header").offsetHeight - document.querySelector(".controls").offsetHeight;

let painting = false;

// Start drawing
canvas.addEventListener("mousedown", () => {
    painting = true;
    ctx.beginPath();
});

// Stop drawing
canvas.addEventListener("mouseup", () => {
    painting = false;
});

// Drawing handler
canvas.addEventListener("mousemove", (e) => {
    if (!painting) return;

    ctx.strokeStyle = colorPicker.value;
    ctx.lineWidth = brushSize.value;
    ctx.lineCap = "round";

    ctx.lineTo(e.clientX, e.clientY - canvas.offsetTop);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(e.clientX, e.clientY - canvas.offsetTop);
});

// Clear button
clearBtn.addEventListener("click", () => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
});
