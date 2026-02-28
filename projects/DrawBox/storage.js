function saveCanvas() {

  const data = [];

  Array.from(canvas.children).forEach(c => {
    data.push({
      type: c.dataset.type,
      left: c.style.left,
      top: c.style.top,
      width: c.style.width,
      height: c.style.height,
      background: c.style.background,
      color: c.style.color,
      innerHTML: c.innerHTML
    });
  });

  localStorage.setItem("miniFigmaPro", JSON.stringify(data));

  alert("Canvas Saved ✅");
}

function loadCanvas() {

  const data =
    JSON.parse(localStorage.getItem("miniFigmaPro") || "[]");

  clearCanvas();

  data.forEach(d => {

    const shape = document.createElement("div");
    shape.className = "shape";
    shape.dataset.type = d.type;

    shape.style.left = d.left;
    shape.style.top = d.top;
    shape.style.width = d.width;
    shape.style.height = d.height;
    shape.style.background = d.background;
    shape.style.color = d.color;
    shape.innerHTML = d.innerHTML;

    if (d.type === "text") {
      shape.className = "shape text-box";
      shape.ondblclick = () => {
        shape.contentEditable = true;
        shape.focus();
      };
    }

    shape.onmousedown = dragMouseDown;
    shape.onclick = () => selectShape(shape);

    canvas.appendChild(shape);
  });
}
