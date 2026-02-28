const boxes = document.querySelectorAll(".color-box");
const colorDisplay = document.getElementById("colorDisplay");
const message = document.getElementById("message");
const resetBtn = document.getElementById("reset");

let colors = [];
let pickedColor;

function generateColors(num) {
  let arr = [];
  for (let i = 0; i < num; i++) {
    arr.push(randomColor());
  }
  return arr;
}

function randomColor() {
  const r = Math.floor(Math.random() * 256);
  const g = Math.floor(Math.random() * 256);
  const b = Math.floor(Math.random() * 256);
  return `rgb(${r}, ${g}, ${b})`;
}

function pickColor() {
  return colors[Math.floor(Math.random() * colors.length)];
}

function resetGame() {
  colors = generateColors(6);
  pickedColor = pickColor();
  colorDisplay.textContent = pickedColor;
  message.textContent = "";

  boxes.forEach((box, i) => {
    box.style.backgroundColor = colors[i];
    box.style.display = "block";
  });
}

boxes.forEach(box => {
  box.addEventListener("click", function () {
    const clickedColor = this.style.backgroundColor;

    if (clickedColor === pickedColor) {
      message.textContent = "🎉 Correct!";
      boxes.forEach(b => b.style.backgroundColor = pickedColor);
    } else {
      this.style.backgroundColor = "#232323";
      message.textContent = "❌ Try Again!";
    }
  });
});

resetBtn.addEventListener("click", resetGame);

resetGame();