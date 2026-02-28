const palette = document.getElementById("palette");

function randomColor() {
    const hex = "0123456789ABCDEF";
    let color = "#";
    for (let i = 0; i < 6; i++) {
        color += hex[Math.floor(Math.random() * 16)];
    }
    return color;
}

function generateColors() {
    palette.innerHTML = "";

    for (let i = 0; i < 5; i++) {
        const color = randomColor();
        const box = document.createElement("div");
        box.className = "color-box";
        box.style.background = color;
        box.innerText = color;

        // Copy color on click
        box.addEventListener("click", () => {
            navigator.clipboard.writeText(color);
            alert(`Copied ${color}`);
        });

        palette.appendChild(box);
    }
}

// generate on page load
generateColors();
