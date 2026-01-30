const root = document.documentElement;
const themeSelect = document.getElementById("theme");

function applyTheme(theme) {
  if (theme === "Light") {
    root.style.setProperty("--bg-dark", "#f8fafc");
    root.style.setProperty("--accent", "#0284c7");
  } else {
    root.style.setProperty("--bg-dark", "#020617");
    root.style.setProperty("--accent", "#38bdf8");
  }
}

themeSelect?.addEventListener("change", (e) => {
  applyTheme(e.target.value);
});

applyTheme(themeSelect?.value || "Dark");
