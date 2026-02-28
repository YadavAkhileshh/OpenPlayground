const show = (id) => {
  document
    .querySelectorAll(".screen")
    .forEach((s) => s.classList.remove("active"));
  document.getElementById(id).classList.add("active");
};
let selRows = 6,
  selCols = 7;
document.querySelectorAll(".d-btn").forEach((btn) => {
  btn.addEventListener("click", () => {
    document
      .querySelectorAll(".d-btn")
      .forEach((b) => b.classList.remove("active"));
    btn.classList.add("active");
    selRows = +btn.dataset.rows;
    selCols = +btn.dataset.cols;
  });
});
document.getElementById("btnLaunch").onclick = () => {
  show("gameScreen");
  startChain(selRows, selCols);
};
document.getElementById("btnAgainC").onclick = () => {
  show("gameScreen");
  startChain(ROWS, COLS);
};
document.getElementById("btnMenuC").onclick = () => show("startScreen");
