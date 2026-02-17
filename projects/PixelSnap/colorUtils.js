const preview = document.getElementById("colorPreview");

canvas.addEventListener("click", function (e) {
  const rect = canvas.getBoundingClientRect();

  const x = Math.floor(e.clientX - rect.left);
  const y = Math.floor(e.clientY - rect.top);

  const pixel = ctx.getImageData(x, y, 1, 1).data;

  let r = pixel[0];
  let g = pixel[1];
  let b = pixel[2];

  let hex = rgbToHex(r, g, b);
  let hsl = rgbToHsl(r, g, b);

  preview.style.background = hex;

  document.getElementById("hexCode").innerText = hex;
  document.getElementById("rgbCode").innerText = `R: ${r}, G: ${g}, B: ${b}`;
  document.getElementById("hslCode").innerText = hsl;

  document.getElementById("colorName").innerText = "Custom Pixel";
});

/* HEX Converter */
function rgbToHex(r, g, b) {
  return (
    "#" +
    [r, g, b]
      .map(x => x.toString(16).padStart(2, "0"))
      .join("")
      .toUpperCase()
  );
}

/* HSL Converter */
function rgbToHsl(r, g, b) {
  r /= 255;
  g /= 255;
  b /= 255;

  let max = Math.max(r, g, b),
    min = Math.min(r, g, b);

  let h,
    s,
    l = (max + min) / 2;

  if (max === min) {
    h = s = 0;
  } else {
    let d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);

    switch (max) {
      case r:
        h = (g - b) / d + (g < b ? 6 : 0);
        break;
      case g:
        h = (b - r) / d + 2;
        break;
      case b:
        h = (r - g) / d + 4;
        break;
    }

    h /= 6;
  }

  return `H: ${Math.round(h * 360)}°  S: ${Math.round(
    s * 100
  )}%  L: ${Math.round(l * 100)}%`;
}

/* Copy Button */
document.getElementById("copyBtn").addEventListener("click", () => {
  const hex = document.getElementById("hexCode").innerText;
  const rgb = document.getElementById("rgbCode").innerText;
  const hsl = document.getElementById("hslCode").innerText;

  navigator.clipboard.writeText(`${hex}\n${rgb}\n${hsl}`);

  alert("✅ Color Codes Copied!");
});
