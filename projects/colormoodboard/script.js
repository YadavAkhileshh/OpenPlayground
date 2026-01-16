document.addEventListener("DOMContentLoaded", () => {

  const paletteEl = document.getElementById("palette");
  const generateBtn = document.getElementById("generateBtn");
  const exportBtn = document.getElementById("exportBtn");
  const moodSelect = document.getElementById("moodSelect");

  /* ---------- Utils ---------- */
  function randomBetween(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  function hslToHex(h, s, l) {
    s /= 100;
    l /= 100;

    const k = n => (n + h / 30) % 12;
    const a = s * Math.min(l, 1 - l);
    const f = n =>
      l - a * Math.max(-1, Math.min(k(n) - 3, Math.min(9 - k(n), 1)));

    return (
      "#" +
      [f(0), f(8), f(4)]
        .map(v => Math.round(v * 255).toString(16).padStart(2, "0"))
        .join("")
    );
  }

  /* ---------- Color by mood ---------- */
  function generateColorByMood(mood) {
    let h, s, l;

    switch (mood) {
      case "warm":
        h = randomBetween(10, 60);
        s = randomBetween(65, 85);
        l = randomBetween(45, 60);
        break;

      case "pastel":
        h = randomBetween(0, 360);
        s = randomBetween(40, 60);
        l = randomBetween(75, 88);
        break;

      case "dark":
        h = randomBetween(0, 360);
        s = randomBetween(30, 60);
        l = randomBetween(18, 30);
        break;

      default: // random
        h = randomBetween(0, 360);
        s = randomBetween(50, 80);
        l = randomBetween(40, 60);
    }

    return hslToHex(h, s, l);
  }

  /* ---------- Palette generation ---------- */
  function generatePalette(count = 5) {
    // Clear + force reflow (THIS FIXES THE BUG)
    paletteEl.innerHTML = "";
    paletteEl.offsetHeight;

    const mood = moodSelect.value;

    for (let i = 0; i < count; i++) {
      const color = generateColorByMood(mood);

      const card = document.createElement("div");
      card.className = "color-card";
      card.style.backgroundColor = color;

      // Reset animation cleanly
      card.style.animation = "none";
      card.offsetHeight;
      card.style.animation = "";
      card.style.animationDelay = `${i * 80}ms`;

      const label = document.createElement("div");
      label.className = "color-code";
      label.textContent = color;

      card.appendChild(label);

      card.addEventListener("click", () => {
        navigator.clipboard.writeText(color);
        label.textContent = "Copied!";
        setTimeout(() => (label.textContent = color), 800);
      });

      paletteEl.appendChild(card);
    }
  }

  /* ---------- Export ---------- */
  exportBtn.addEventListener("click", () => {
    const cards = document.querySelectorAll(".color-card");
    if (!cards.length) return;

    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");

    canvas.width = 600;
    canvas.height = 120;

    const blockWidth = canvas.width / cards.length;

    cards.forEach((card, i) => {
      ctx.fillStyle = card.style.backgroundColor;
      ctx.fillRect(i * blockWidth, 0, blockWidth, canvas.height);
    });

    const link = document.createElement("a");
    link.href = canvas.toDataURL("image/png");
    link.download = "color-palette.png";
    link.click();
  });

  /* ---------- Events ---------- */
  generateBtn.addEventListener("click", generatePalette);
  moodSelect.addEventListener("change", generatePalette);

  /* ---------- Initial load ---------- */
  generatePalette();
});
