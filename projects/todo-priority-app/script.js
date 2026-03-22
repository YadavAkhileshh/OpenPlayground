let tasks = JSON.parse(localStorage.getItem("tasks")) || [];

// Save tasks to localStorage
function saveTasks() {
  localStorage.setItem("tasks", JSON.stringify(tasks));
}

// Render tasks on UI
function renderTasks() {
  document.getElementById("todo").innerHTML = "<h3>To-Do</h3>";
  document.getElementById("progress").innerHTML = "<h3>In Progress</h3>";
  document.getElementById("done").innerHTML = "<h3>Done</h3>";

 const priorityOrder = { High: 1, Medium: 2, Low: 3 };

let sortedTasks = tasks
  .map((task, index) => ({ ...task, index })) // keep original index
  .sort((a, b) => {
    // first sort by column
    if (a.status !== b.status) return 0;

    // then by priority
    return priorityOrder[a.priority] - priorityOrder[b.priority];
  });

sortedTasks.forEach(({ text, priority, status, index }) => {
  let div = document.createElement("div");
  div.classList.add("task", priority.toLowerCase());

  div.innerHTML = `
    <span>${text}</span>
    <div class="actions">
      <button onclick="moveTask(${index})">Move</button>
      <button onclick="deleteTask(${index})">Delete</button>
    </div>
  `;

  document.getElementById(status).appendChild(div);
});

  updateCount();
}

// Add new task
function addTask() {
  let text = document.getElementById("taskInput").value.trim();
  let priority = document.getElementById("priority").value;

  if (!text) return;

  tasks.push({
    text,
    priority,
    status: "todo"
  });

  saveTasks();
  renderTasks();

  document.getElementById("taskInput").value = "";
}

// Move task across columns
function moveTask(index) {
  if (tasks[index].status === "todo") {
    tasks[index].status = "progress";
  } else if (tasks[index].status === "progress") {
    tasks[index].status = "done";
  } else {
    // Remove task if already in Done
    tasks.splice(index, 1);
  }

  saveTasks();
  renderTasks();
}

// Delete task
function deleteTask(index) {
  tasks.splice(index, 1);
  saveTasks();
  renderTasks();
}

// Update task count
function updateCount() {
  document.getElementById("count").innerText =
    "Tasks: " + tasks.length;
}

// Load tasks on page load
renderTasks();