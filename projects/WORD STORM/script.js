const show = (id) => {
  document
    .querySelectorAll(".screen")
    .forEach((s) => s.classList.remove("active"));
  document.getElementById(id).classList.add("active");
};
document.getElementById("sHi").textContent = localStorage.getItem("ws_hi") || 0;
document.getElementById("sStreak").textContent =
  localStorage.getItem("ws_streak") || 0;
document.getElementById("btnBegin").onclick = () => {
  show("gameScreen");
  startWordGame();
};
document.getElementById("btnStormAgain").onclick = () => {
  show("gameScreen");
  startWordGame();
};
document.getElementById("btnMenuD").onclick = () => {
  document.getElementById("sHi").textContent =
    localStorage.getItem("ws_hi") || 0;
  document.getElementById("sStreak").textContent =
    localStorage.getItem("ws_streak") || 0;
  show("startScreen");
};
document.getElementById("clearBtn").onclick = clearWord;
document.addEventListener("keydown", (e) => {
  if (e.key === "Enter") submitWord();
  if (e.key === "Backspace") {
    const idx = usedIdxs.pop();
    if (idx !== undefined) {
      currentWord = currentWord.slice(0, -1);
      const btn = selectedBtns.pop();
      if (btn) {
        btn.classList.remove("used", "selected");
      }
      document.getElementById("currentWord").textContent = currentWord || "_";
    }
  }
});
