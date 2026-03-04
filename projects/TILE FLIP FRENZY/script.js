const show = (id) => {
  document
    .querySelectorAll(".screen")
    .forEach((s) => s.classList.remove("active"));
  document.getElementById(id).classList.add("active");
};
document.getElementById("bEasy").textContent =
  localStorage.getItem("tf_4") || "—";
document.getElementById("bMed").textContent =
  localStorage.getItem("tf_5") || "—";
document.getElementById("bHard").textContent =
  localStorage.getItem("tf_6") || "—";
document.querySelectorAll(".lv-btn").forEach((btn) => {
  btn.addEventListener("click", () => {
    document
      .querySelectorAll(".lv-btn")
      .forEach((b) => b.classList.remove("active"));
    btn.classList.add("active");
    selectedGrid = +btn.dataset.grid;
  });
});
document.getElementById("btnStart").onclick = () => {
  show("gameScreen");
  startGameFlow();
};
document.getElementById("btnAgain").onclick = () => {
  show("gameScreen");
  startGameFlow();
};
document.getElementById("btnMenu2").onclick = () => show("startScreen");
