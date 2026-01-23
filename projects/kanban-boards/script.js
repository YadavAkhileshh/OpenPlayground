function addTask() {
  const input = document.getElementById("taskInput");
  if (!input.value) return;

  const task = document.createElement("div");
  task.className = "task";
  task.textContent = input.value;
  task.draggable = true;

  task.addEventListener("dragstart", e => {
    e.dataTransfer.setData("text", e.target.id);
    dragged = task;
  });

  document.getElementById("todo").appendChild(task);
  input.value = "";
}

let dragged = null;

document.querySelectorAll(".column").forEach(col => {
  col.addEventListener("dragover", e => e.preventDefault());
  col.addEventListener("drop", () => {
    if (dragged) col.appendChild(dragged);
  });
});
