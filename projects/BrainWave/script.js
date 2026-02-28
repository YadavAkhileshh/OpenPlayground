function redrawLines() {

  svg.innerHTML = "";

  const canvasRect = canvas.getBoundingClientRect();

  connections.forEach(c => {

    const line = document.createElementNS("http://www.w3.org/2000/svg", "line");

    const r1 = c.from.getBoundingClientRect();
    const r2 = c.to.getBoundingClientRect();

    const x1 = (r1.left + r1.width / 2) - canvasRect.left;
    const y1 = (r1.top + r1.height / 2) - canvasRect.top;

    const x2 = (r2.left + r2.width / 2) - canvasRect.left;
    const y2 = (r2.top + r2.height / 2) - canvasRect.top;

    line.setAttribute("x1", x1 / scale);
    line.setAttribute("y1", y1 / scale);
    line.setAttribute("x2", x2 / scale);
    line.setAttribute("y2", y2 / scale);

    line.classList.add("line");
    svg.appendChild(line);
  });
}

document.addEventListener("wheel", (e) => {

  scale += e.deltaY * -0.001;
  scale = Math.min(Math.max(0.4, scale), 2);

  exportWrapper.style.transform = `scale(${scale})`;

  redrawLines();
});

/* ================= NEW PROJECT ================= */
function newProject() {

  if (!confirm("Start a new project? This will clear everything.")) return;

  nodes = [];
  connections = [];

  canvas.innerHTML = "";
  svg.innerHTML = "";

  localStorage.removeItem("mindmap");
}
