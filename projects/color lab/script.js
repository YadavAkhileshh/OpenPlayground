// script.js — Color Palette Lab Main Logic

let palette = [];
let savedPalettes = [];
let exportFmt = "hex";

const hueSlider = document.getElementById("hueSlider");
const satSlider = document.getElementById("satSlider");
const lightSlider = document.getElementById("lightSlider");
const modeSelect = document.getElementById("modeSelect");
const strip = document.getElementById("paletteStrip");
const contrastGrid = document.getElementById("contrastGrid");
const exportBox = document.getElementById("exportBox");

function init() {
  // Populate mode dropdown
  CONFIG.HARMONY_MODES.forEach((m) => {
    const opt = document.createElement("option");
    opt.value = m;
    opt.textContent = m.charAt(0).toUpperCase() + m.slice(1);
    modeSelect.appendChild(opt);
  });

  // Load saved
  const stored = Utils.load();
  if (stored?.savedPalettes) savedPalettes = stored.savedPalettes;

  generate();
  renderPresets();
  renderSaved();

  // Sliders
  hueSlider.addEventListener("input", () => {
    document.getElementById("hueVal").textContent = hueSlider.value + "°";
    generate();
  });
  satSlider.addEventListener("input", () => {
    document.getElementById("satVal").textContent = satSlider.value + "%";
    generate();
  });
  lightSlider.addEventListener("input", () => {
    document.getElementById("lightVal").textContent = lightSlider.value + "%";
    generate();
  });
  modeSelect.addEventListener("change", generate);
  document.getElementById("generateBtn").addEventListener("click", generate);

  // Export tabs
  document.querySelectorAll(".tab-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      document
        .querySelectorAll(".tab-btn")
        .forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");
      exportFmt = btn.dataset.fmt;
      renderExport();
    });
  });

  document.getElementById("copyBtn").addEventListener("click", () => {
    Utils.copyToClipboard(exportBox.textContent);
    document.getElementById("copyBtn").textContent = "Copied!";
    setTimeout(
      () =>
        (document.getElementById("copyBtn").textContent = "Copy to Clipboard"),
      1500,
    );
  });

  document.getElementById("saveBtn").addEventListener("click", () => {
    savedPalettes.unshift({ colors: [...palette], date: Date.now() });
    if (savedPalettes.length > 10) savedPalettes.pop();
    Utils.save({ savedPalettes });
    renderSaved();
  });
}

function generate() {
  const hue = parseInt(hueSlider.value);
  const sat = parseInt(satSlider.value);
  const light = parseInt(lightSlider.value);
  const mode = modeSelect.value;
  palette = Utils.generateHarmony(hue, mode, sat, light);
  renderStrip();
  renderContrast();
  renderExport();
}

function renderStrip() {
  strip.innerHTML = "";
  palette.forEach((hex) => {
    const sw = document.createElement("div");
    sw.className = "swatch";
    sw.style.background = hex;
    sw.innerHTML = `<div class="swatch-hex">${hex}</div><div class="swatch-copy-hint">Click to copy</div>`;
    sw.addEventListener("click", () => {
      Utils.copyToClipboard(hex);
      sw.querySelector(".swatch-copy-hint").textContent = "Copied!";
      setTimeout(
        () =>
          (sw.querySelector(".swatch-copy-hint").textContent = "Click to copy"),
        1200,
      );
    });
    strip.appendChild(sw);
  });
}

function renderContrast() {
  contrastGrid.innerHTML = "";
  palette.forEach((fg) => {
    palette.forEach((bg) => {
      const ratio = Utils.contrast(fg, bg);
      const wcag = Utils.wcagLabel(parseFloat(ratio));
      const cell = document.createElement("div");
      cell.className = "contrast-cell";
      cell.style.background = bg;
      cell.title = `${fg} on ${bg}`;
      cell.innerHTML = `
        <div class="contrast-ratio" style="color:${fg}">${ratio}</div>
        <div class="contrast-badge" style="color:${fg};background:${wcag.ok ? "rgba(0,255,0,0.2)" : "rgba(255,0,0,0.2)"}">${wcag.label}</div>`;
      contrastGrid.appendChild(cell);
    });
  });
}

function renderExport() {
  if (exportFmt === "hex") {
    exportBox.textContent = palette.join("\n");
  } else if (exportFmt === "css") {
    exportBox.textContent = `:root {\n${Utils.toCSSVars(palette)}\n}`;
  } else {
    exportBox.textContent = `const palette = [\n${palette.map((h) => `  "${h}"`).join(",\n")}\n];`;
  }
}

function renderPresets() {
  const list = document.getElementById("presetList");
  list.innerHTML = "";
  CONFIG.PRESET_PALETTES.forEach((preset) => {
    const hexColors = preset.hues.map((h) =>
      Utils.hslToHex(h, preset.sat, preset.light),
    );
    const item = document.createElement("div");
    item.className = "preset-item";
    item.innerHTML = `<div class="mini-swatch">${hexColors.map((c) => `<div class="mini-dot" style="background:${c}"></div>`).join("")}</div><span class="preset-name">${preset.name}</span>`;
    item.addEventListener("click", () => {
      palette = hexColors;
      renderStrip();
      renderContrast();
      renderExport();
    });
    list.appendChild(item);
  });
}

function renderSaved() {
  const list = document.getElementById("savedList");
  list.innerHTML = "";
  if (!savedPalettes.length) {
    list.innerHTML =
      '<div style="font-size:0.72rem;color:var(--dim)">No saved palettes yet.</div>';
    return;
  }
  savedPalettes.forEach((sp, i) => {
    const item = document.createElement("div");
    item.className = "saved-item";
    item.innerHTML = `<div class="mini-swatch">${sp.colors.map((c) => `<div class="mini-dot" style="background:${c}"></div>`).join("")}</div><span class="preset-name">Palette ${i + 1}</span>`;
    item.addEventListener("click", () => {
      palette = sp.colors;
      renderStrip();
      renderContrast();
      renderExport();
    });
    list.appendChild(item);
  });
}

init();
