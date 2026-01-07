const palette = document.getElementById("palette");
const generateBtn = document.getElementById("generateBtn");

const COLOR_COUNT = 5;
let colors = Array(COLOR_COUNT).fill(null);
let locked = Array(COLOR_COUNT).fill(false);

// Generate a random hex color
function randomColor() {
    return "#" + Math.floor(Math.random() * 16777215)
        .toString(16)
        .padStart(6, "0")
        .toUpperCase();
}

// Generate palette
function generatePalette() {
    for (let i = 0; i < COLOR_COUNT; i++) {
        if (!locked[i]) {
            colors[i] = randomColor();
        }
    }

    renderPalette();
}

// Render the palette boxes
function renderPalette() {
    palette.innerHTML = "";

    for (let i = 0; i < COLOR_COUNT; i++) {
        const box = document.createElement("div");
        box.className = "color-box";
        box.style.background = colors[i];
        box.dataset.color = colors[i];

        if (locked[i]) box.classList.add("locked");

        const lockDot = document.createElement("div");
        lockDot.className = "lock-indicator";

        const hex = document.createElement("div");
        hex.className = "hex";
        hex.textContent = colors[i];

        // Single click to copy
        hex.addEventListener("click", (e) => {
            e.stopPropagation();
            navigator.clipboard.writeText(colors[i]);
            hex.textContent = "Copied!";
            setTimeout(() => (hex.textContent = colors[i]), 700);
        });

        // Double click to lock/unlock
        box.addEventListener("dblclick", () => {
            locked[i] = !locked[i];
            box.classList.toggle("locked");
        });

        box.appendChild(lockDot);
        box.appendChild(hex);
        palette.appendChild(box);
    }
}

// Initial load
generateBtn.addEventListener("click", generatePalette);
generatePalette();
