function makeDraggable(note, data) {
  let dx = 0, dy = 0, dragging = false;

  note.addEventListener("mousedown", e => {
    dragging = true;
    dx = e.clientX - note.offsetLeft;
    dy = e.clientY - note.offsetTop;
    note.style.zIndex = Date.now();
  });

  document.addEventListener("mousemove", e => {
    if (!dragging) return;
    note.style.left = e.clientX - dx + "px";
    note.style.top = e.clientY - dy + "px";
  });

  document.addEventListener("mouseup", () => {
    if (!dragging) return;
    dragging = false;
    data.x = note.offsetLeft;
    data.y = note.offsetTop;
    saveAll();
  });
}