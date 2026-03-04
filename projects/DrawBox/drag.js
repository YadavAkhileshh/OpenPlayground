function selectShape(shape) {
  if (selectedShape) selectedShape.classList.remove("selected");

  selectedShape = shape;
  shape.classList.add("selected");
}

/* Dragging */
function dragMouseDown(e) {

  const el = e.target.closest(".shape");

  if (el.classList.contains("text-box") && document.activeElement === el) {
    return;
  }

  selectShape(el);

  e.preventDefault();

  let shiftX = e.clientX - el.getBoundingClientRect().left;
  let shiftY = e.clientY - el.getBoundingClientRect().top;

  function moveAt(event) {

    let x = event.clientX - shiftX - canvas.getBoundingClientRect().left;
    let y = event.clientY - shiftY - canvas.getBoundingClientRect().top;

    x = Math.max(0, Math.min(canvas.clientWidth - el.offsetWidth, x));
    y = Math.max(0, Math.min(canvas.clientHeight - el.offsetHeight, y));

    el.style.left = x + "px";
    el.style.top = y + "px";
  }

  function stopMove() {
    document.removeEventListener("mousemove", moveAt);
    document.removeEventListener("mouseup", stopMove);
  }

  document.addEventListener("mousemove", moveAt);
  document.addEventListener("mouseup", stopMove);
}

/* Disable editing when clicking outside */
document.addEventListener("click", (e) => {
  if (selectedShape && selectedShape.dataset.type === "text") {
    if (e.target !== selectedShape) {
      selectedShape.contentEditable = false;
    }
  }
});
