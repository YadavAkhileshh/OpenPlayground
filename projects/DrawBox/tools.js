/* Page Size */
function changePageSize() {

  const size = document.getElementById("pageSize").value;

  if (size === "custom") {
    const w = prompt("Width in px?");
    const h = prompt("Height in px?");
    canvas.style.width = w + "px";
    canvas.style.height = h + "px";
    return;
  }

  if (size === "A4") {
    canvas.style.width = "794px";
    canvas.style.height = "1123px";
    return;
  }

  const [w, h] = size.split("x");

  canvas.style.width = w + "px";
  canvas.style.height = h + "px";
}

/* Background */
function setCanvasBG() {
  canvas.style.background = bgColor.value;
}

/* Clear */
function clearCanvas() {
  canvas.innerHTML = "";
  selectedShape = null;
}
