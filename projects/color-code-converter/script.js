function hexToRgb() {
  let hex = document.getElementById("hexInput").value.replace("#", "");

  if (hex.length !== 6) {
    document.getElementById("rgbOutput").innerText = "Invalid HEX code";
    return;
  }

  let r = parseInt(hex.substring(0, 2), 16);
  let g = parseInt(hex.substring(2, 4), 16);
  let b = parseInt(hex.substring(4, 6), 16);

  document.getElementById("rgbOutput").innerText =
    "RGB(" + r + ", " + g + ", " + b + ")";
}

function rgbToHex() {
  let r = parseInt(document.getElementById("r").value);
  let g = parseInt(document.getElementById("g").value);
  let b = parseInt(document.getElementById("b").value);

  if (
    r < 0 || r > 255 ||
    g < 0 || g > 255 ||
    b < 0 || b > 255
  ) {
    document.getElementById("hexOutput").innerText = "Invalid RGB values";
    return;
  }

  let hex =
    "#" +
    r.toString(16).padStart(2, "0") +
    g.toString(16).padStart(2, "0") +
    b.toString(16).padStart(2, "0");

  document.getElementById("hexOutput").innerText = hex.toUpperCase();
}
