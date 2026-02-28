const taskList = document.getElementById("taskList");
const addTaskBtn = document.getElementById("addTaskBtn");

let tasks = [];

function updateStats() {
  document.getElementById("totalTasks").textContent = tasks.length;
  document.getElementById("completedTasks").textContent =
    tasks.filter(t => t.done).length;
  document.getElementById("pendingTasks").textContent =
    tasks.filter(t => !t.done).length;
}

function renderTasks() {
  taskList.innerHTML = "";

  tasks.forEach((task, index) => {
    const div = document.createElement("div");
    div.className = "task";
    if (task.done) div.classList.add("completed");

    div.innerHTML = `
      <span>${task.title}</span>
      <button onclick="toggleTask(${index})">
        ${task.done ? "Undo" : "Done"}
      </button>
    `;

    taskList.appendChild(div);
  });

  updateStats();
}

window.toggleTask = function(index) {
  tasks[index].done = !tasks[index].done;
  renderTasks();
};

addTaskBtn.addEventListener("click", () => {
  const title = prompt("Enter task name:");
  if (!title) return;

  tasks.push({ title, done: false });
  renderTasks();
});

renderTasks();