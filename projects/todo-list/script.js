/* =========================
   THEME (DARK MODE)
========================= */

const themeToggle = document.getElementById("themeToggle");

document.addEventListener("DOMContentLoaded", () => {
  // Load theme
  const savedTheme = localStorage.getItem("theme");
  if (savedTheme === "dark") {
    document.body.classList.add("dark-theme");
    themeToggle.textContent = "☀️ Light Mode";
  } else {
    themeToggle.textContent = "🌙 Dark Mode";
  }

  loadTasks();
  updateProgress();
  updateLeaderboard();
});

themeToggle.addEventListener("click", () => {
  document.body.classList.toggle("dark-theme");
  const isDark = document.body.classList.contains("dark-theme");

  localStorage.setItem("theme", isDark ? "dark" : "light");
  themeToggle.textContent = isDark ? "☀️ Light Mode" : "🌙 Dark Mode";
});

/* =========================
   DRAG & DROP
========================= */

function allowDrop(e) {
  e.preventDefault();
}

function renderTodos() {
    todoList.innerHTML = '';
    todos.forEach((todo, index) => {
        const li = document.createElement('li');
        const priority = todo.priority || 'low';
        li.className = `todo-item ${todo.completed ? 'completed' : ''} ${priority}`;
        li.innerHTML = `
                <div>
                    <span class="todo-text">${todo.text}</span>
                    ${todo.dueDate ? `<small>Due: ${todo.dueDate}</small>` : ''}
                </div>
                <div class="todo-actions">
                    <button class="complete-btn" onclick="toggleComplete(${index})">
                        <i class="ri-check-line"></i>
                    </button>
                    <button class="edit-btn" onclick="editTask(${index})">
                        <i class="ri-edit-line"></i>
                    </button>
                    <button class="delete-btn" onclick="deleteTodo(${index})">
                        <i class="ri-delete-bin-line"></i>
                    </button>
                </div>
        `;


        todoList.appendChild(li);

    });
    updateProgress();

}

function drop(e) {
  e.preventDefault();
  const id = e.dataTransfer.getData("text");
  const task = document.getElementById(id);
  const column = e.target.closest(".column");

    if (text) {
        todos.push({
            text,
            completed: false,
            dueDate,
            priority
        });

        todoInput.value = '';
        dueDateInput.value = '';
        priorityInput.value = 'low';

        saveTodos();
        renderTodos();
    }
    addModal.classList.add('hidden');

}
function editTask(index) {
    const todo = todos[index];
    const newText = prompt("Edit task title:", todo.text);
    const newDueDate = prompt("Edit due date (YYYY-MM-DD):", todo.dueDate || '');
    const newPriority = prompt("Edit priority (low, medium, high):", todo.priority || 'low');
    if (newText !== null && newText.trim() !== '') {
        todo.text = newText.trim();
    }
    if (newDueDate !== null) {
        todo.dueDate = newDueDate.trim() || null;
    }
    if (newPriority && ['low', 'medium', 'high'].includes(newPriority.toLowerCase())) {
        todo.priority = newPriority.toLowerCase();
    }
    saveTodos();
    renderTodos();
}

/* =========================
   TASK CRUD
========================= */

function addTask(columnId) {
  const title = prompt("Enter task title:");
  if (!title) return;

  const description = prompt("Enter task description:") || "";
  const dueDate = prompt("Set due date (YYYY-MM-DD):") || "N/A";

  const taskId = "task-" + Math.random().toString(36).slice(2, 9);
  const task = document.createElement("div");

  task.className = "task";
  task.id = taskId;
  task.draggable = true;
  task.ondragstart = drag;

  task.innerHTML = `
    <strong>${title}</strong>
    <p>${description}</p>
    <p>Due: <span class="due-date">${dueDate}</span></p>

    <label>Assigned to:
      <select class="assigned-to" onchange="updateLeaderboard(); saveTasks();">
        <option value="Worker 1">Worker 1</option>
        <option value="Worker 2">Worker 2</option>
        <option value="Worker 3">Worker 3</option>
      </select>
    </label>

    <button onclick="addComment('${taskId}')">💬</button>
    <button onclick="editTask(this)">✏️</button>
    <button onclick="deleteTask(this)">❌</button>

    <div class="comments" id="comments-${taskId}"></div>
  `;

  document
    .getElementById(columnId)
    .querySelector(".task-list")
    .appendChild(task);

  applyTaskColor(task, columnId);
  saveTasks();
  updateProgress();
  updateLeaderboard();
  checkDueDates();
}

function editTask(btn) {
  const task = btn.parentElement;

  const titleEl = task.querySelector("strong");
  const descEl = task.querySelector("p");
  const dueEl = task.querySelector(".due-date");

  const newTitle = prompt("Edit title:", titleEl.textContent);
  const newDesc = prompt("Edit description:", descEl.textContent);
  const newDue = prompt("Edit due date:", dueEl.textContent);

  if (newTitle) titleEl.textContent = newTitle;
  if (newDesc) descEl.textContent = newDesc;
  if (newDue) dueEl.textContent = newDue;

  saveTasks();
}

function deleteTask(btn) {
  if (confirm("Delete this task?")) {
    btn.parentElement.remove();
    saveTasks();
    updateProgress();
    updateLeaderboard();
  }
}

function addComment(taskId) {
    let comment = prompt("Enter your comment:");
    if (comment) {
        let commentDiv = document.createElement("p");
        commentDiv.textContent = comment;
        document.getElementById("comments-" + taskId).appendChild(commentDiv);
        saveTodos();
    }
}





  const p = document.createElement("p");
  p.textContent = text;
  document.getElementById(`comments-${taskId}`).appendChild(p);

  saveTasks();
}

/* =========================
   SAVE & LOAD
========================= */

function saveTasks() {
  const tasks = [];

  document.querySelectorAll(".task").forEach(task => {
    const comments = [];
    task.querySelectorAll(".comments p").forEach(c => comments.push(c.textContent));

    tasks.push({
      id: task.id,
      title: task.querySelector("strong").textContent,
      description: task.querySelector("p").textContent,
      dueDate: task.querySelector(".due-date").textContent,
      assignedTo: task.querySelector(".assigned-to")?.value || "",
      column: task.closest(".column")?.id || "",
      comments
    });
  });

  localStorage.setItem("kanbanTasks", JSON.stringify(tasks));
}

function loadTasks() {
  const tasks = JSON.parse(localStorage.getItem("kanbanTasks")) || [];

  tasks.forEach(t => {
    const task = document.createElement("div");
    task.className = "task";
    task.id = t.id;
    task.draggable = true;
    task.ondragstart = drag;

    task.innerHTML = `
      <strong>${t.title}</strong>
      <p>${t.description}</p>
      <p>Due: <span class="due-date">${t.dueDate}</span></p>

      <label>Assigned to:
        <select class="assigned-to" onchange="saveTasks(); updateLeaderboard();">
          <option value="Worker 1" ${t.assignedTo === "Worker 1" ? "selected" : ""}>Worker 1</option>
          <option value="Worker 2" ${t.assignedTo === "Worker 2" ? "selected" : ""}>Worker 2</option>
          <option value="Worker 3" ${t.assignedTo === "Worker 3" ? "selected" : ""}>Worker 3</option>
        </select>
      </label>

      <button onclick="addComment('${t.id}')">💬</button>
      <button onclick="editTask(this)">✏️</button>
      <button onclick="deleteTask(this)">❌</button>

      <div class="comments" id="comments-${t.id}"></div>
    `;

    document.getElementById(t.column)?.querySelector(".task-list")?.appendChild(task);

    t.comments.forEach(c => {
      const p = document.createElement("p");
      p.textContent = c;
      document.getElementById(`comments-${t.id}`).appendChild(p);
    });
  });
}

/* =========================
   PROGRESS
========================= */

function updateProgress() {
  const total = document.querySelectorAll(".task").length;
  const done = document.querySelectorAll("#done .task").length;
  const percent = total ? Math.round((done / total) * 100) : 0;

  const bar = document.getElementById("progress-bar");
  if (bar) {
    bar.style.width = percent + "%";
    bar.textContent = percent + "%";
  }
}

/* =========================
   EXPORT / IMPORT
========================= */

function exportTasks() {
  const data = localStorage.getItem("kanbanTasks");
  const blob = new Blob([data], { type: "application/json" });
  const a = document.createElement("a");

  a.href = URL.createObjectURL(blob);
  a.download = "kanban_tasks.json";
  a.click();
}

function importTasks() {
  const input = document.createElement("input");
  input.type = "file";
  input.accept = "application/json";

  input.onchange = e => {
    const reader = new FileReader();
    reader.onload = () => {
      localStorage.setItem("kanbanTasks", reader.result);
      location.reload();
    };
    reader.readAsText(e.target.files[0]);
  };

  input.click();
}
