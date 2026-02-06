function addShape(type) {

  const shape = document.createElement("div");
  shape.className = "shape";
  shape.dataset.type = type;

  shape.style.left = "50px";
  shape.style.top = "50px";
  shape.style.background = fillColor.value;

  if (type === "rect") {
    shape.style.width = "100px";
    shape.style.height = "60px";
  }

  if (type === "circle") {
    shape.style.width = "80px";
    shape.style.height = "80px";
    shape.style.borderRadius = "50%";
  }

  if (type === "ellipse") {
    shape.style.width = "120px";
    shape.style.height = "60px";
    shape.style.borderRadius = "50%";
  }

  if (type === "triangle") {
    shape.style.width = "0";
    shape.style.height = "0";
    shape.style.borderLeft = "40px solid transparent";
    shape.style.borderRight = "40px solid transparent";
    shape.style.borderBottom = "80px solid " + fillColor.value;
    shape.style.background = "transparent";
  }

  if (type === "line") {
    shape.style.width = "100px";
    shape.style.height = "2px";
  }

  if (type === "text") {
    shape.className = "shape text-box";
    shape.style.color = textColor.value;
    shape.style.background = "transparent";
    shape.innerText = "Double-click to edit";

    shape.ondblclick = () => {
      shape.contentEditable = true;
      shape.focus();
    };
  }

  shape.onmousedown = dragMouseDown;
  shape.onclick = () => selectShape(shape);

  canvas.appendChild(shape);
  selectShape(shape);
}

/* Add Image */
function addImage() {

  let url = document.getElementById("imgURL").value;

  if (!url) return alert("Enter Image URL!");

  const shape = document.createElement("div");
  shape.className = "shape";
  shape.dataset.type = "image";

  shape.style.width = "150px";
  shape.style.height = "100px";
  shape.style.left = "50px";
  shape.style.top = "50px";

  const img = document.createElement("img");
  img.src = url;

  shape.appendChild(img);

  shape.onmousedown = dragMouseDown;
  shape.onclick = () => selectShape(shape);

  canvas.appendChild(shape);
  selectShape(shape);
}
