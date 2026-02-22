const FONTS = {
  big: {
    height: 6,
    chars: {
      A: ["  #  ", "#   #", "#####", "#   #", "#   #", "     "],
      B: ["#### ", "#   #", "#### ", "#   #", "#### ", "     "],
      C: [" ####", "#    ", "#    ", "#    ", " ####", "     "],
      D: ["#### ", "#   #", "#   #", "#   #", "#### ", "     "],
      E: ["#####", "#    ", "#### ", "#    ", "#####", "     "],
      F: ["#####", "#    ", "#### ", "#    ", "#    ", "     "],
      G: [" ####", "#    ", "# ###", "#   #", " ####", "     "],
      H: ["#   #", "#   #", "#####", "#   #", "#   #", "     "],
      I: ["#####", "  #  ", "  #  ", "  #  ", "#####", "     "],
      J: ["#####", "   # ", "   # ", "#  # ", " ##  ", "     "],
      K: ["#   #", "#  # ", "###  ", "#  # ", "#   #", "     "],
      L: ["#    ", "#    ", "#    ", "#    ", "#####", "     "],
      M: ["#   #", "## ##", "# # #", "#   #", "#   #", "     "],
      N: ["#   #", "##  #", "# # #", "#  ##", "#   #", "     "],
      O: [" ### ", "#   #", "#   #", "#   #", " ### ", "     "],
      P: ["#### ", "#   #", "#### ", "#    ", "#    ", "     "],
      Q: [" ### ", "#   #", "# # #", "#  ##", " ####", "     "],
      R: ["#### ", "#   #", "#### ", "#  # ", "#   #", "     "],
      S: [" ####", "#    ", " ### ", "    #", "#### ", "     "],
      T: ["#####", "  #  ", "  #  ", "  #  ", "  #  ", "     "],
      U: ["#   #", "#   #", "#   #", "#   #", " ### ", "     "],
      V: ["#   #", "#   #", "#   #", " # # ", "  #  ", "     "],
      W: ["#   #", "#   #", "# # #", "## ##", "#   #", "     "],
      X: ["#   #", " # # ", "  #  ", " # # ", "#   #", "     "],
      Y: ["#   #", " # # ", "  #  ", "  #  ", "  #  ", "     "],
      Z: ["#####", "   # ", "  #  ", " #   ", "#####", "     "],
      0: [" ### ", "#  ##", "# # #", "##  #", " ### ", "     "],
      1: ["  #  ", " ##  ", "  #  ", "  #  ", "#####", "     "],
      2: [" ### ", "#   #", "  ## ", " #   ", "#####", "     "],
      3: ["#### ", "    #", " ### ", "    #", "#### ", "     "],
      4: ["#   #", "#   #", "#####", "    #", "    #", "     "],
      5: ["#####", "#    ", "#### ", "    #", "#### ", "     "],
      6: [" ### ", "#    ", "#### ", "#   #", " ### ", "     "],
      7: ["#####", "   # ", "  #  ", " #   ", "#    ", "     "],
      8: [" ### ", "#   #", " ### ", "#   #", " ### ", "     "],
      9: [" ### ", "#   #", " ####", "    #", " ### ", "     "],
      "!": ["  #  ", "  #  ", "  #  ", "     ", "  #  ", "     "],
      "?": [" ### ", "#   #", "  ## ", "     ", "  #  ", "     "],
      " ": ["     ", "     ", "     ", "     ", "     ", "     "],
    },
  },
};

function transformChar(rows, style) {
  if (style === "block")
    return rows.map((r) => r.replace(/#/g, "█").replace(/ /g, "░"));
  if (style === "shadow")
    return rows.map((r) => r.replace(/#/g, "▓").replace(/ /g, " "));
  if (style === "thin")
    return rows.map((r) => r.replace(/#/g, "│").replace(/ /g, " "));
  if (style === "dots")
    return rows.map((r) => r.replace(/#/g, "●").replace(/ /g, " "));
  return rows;
}

function render() {
  const text = document
    .getElementById("text-input")
    .value.toUpperCase()
    .slice(0, 20);
  const style = document.getElementById("style-select").value;
  const font = FONTS.big;
  const h = font.height;
  const lines = Array(h).fill("");

  for (const char of text) {
    const def = font.chars[char] || font.chars[" "];
    const transformed = transformChar(def, style);
    transformed.forEach((row, i) => {
      lines[i] += row + " ";
    });
  }

  const output = lines.join("\n");
  document.getElementById("ascii-output").textContent = output;

  const allLines = output.split("\n");
  document.getElementById("stat-chars").textContent =
    `CHARS: ${output.replace(/\n/g, "").replace(/ /g, "").length}`;
  document.getElementById("stat-lines").textContent =
    `LINES: ${allLines.length}`;
  document.getElementById("stat-width").textContent =
    `WIDTH: ${Math.max(...allLines.map((l) => l.length))}`;
}

function copyOutput() {
  const text = document.getElementById("ascii-output").textContent;
  navigator.clipboard.writeText(text).then(() => {
    const toast = document.getElementById("toast");
    toast.classList.add("show");
    setTimeout(() => toast.classList.remove("show"), 2000);
  });
}

document.getElementById("text-input").addEventListener("input", render);
document.getElementById("style-select").addEventListener("change", render);
render();
