const palette = document.getElementById("palette");
const generateBtn = document.getElementById("generateBtn");

function generateColor() {
  const hex = Math.floor(Math.random() * 0xffffff)
    .toString(16)
    .padStart(6, "0");
  return `#${hex}`;
}

function generatePalette() {
  palette.innerHTML = "";

  for (let i = 0; i < 5; i++) {
    const color = generateColor();
    const colorDiv = document.createElement("div");

    colorDiv.classList.add("color");
    colorDiv.style.backgroundColor = color;
    colorDiv.innerText = color;

    colorDiv.addEventListener("click", () => {
      navigator.clipboard.writeText(color);
      colorDiv.innerText = "Copied!";
      setTimeout(() => (colorDiv.innerText = color), 800);
    });

    palette.appendChild(colorDiv);
  }
}

generateBtn.addEventListener("click", generatePalette);

// Generate palette on load
generatePalette();