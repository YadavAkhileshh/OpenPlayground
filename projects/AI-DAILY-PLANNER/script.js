let taskInput = document.getElementById("taskInput");
let priority = document.getElementById("priority");
let taskList = document.getElementById("taskList");
let suggestion = document.getElementById("suggestion");

let tasks = JSON.parse(localStorage.getItem("tasks")) || [];

displayTasks();

function addTask() {
  if (taskInput.value === "") return;

  let task = {
    text: taskInput.value,
    priority: priority.value,
    done: false
  };

  tasks.push(task);
  localStorage.setItem("tasks", JSON.stringify(tasks));
  taskInput.value = "";
  displayTasks();
  smartSuggestion();
}

function displayTasks() {
  taskList.innerHTML = "";
  tasks.forEach((task, index) => {
    let li = document.createElement("li");
    li.innerHTML = `
      <span class="${task.done ? "done" : ""}">
        ${task.text} (${task.priority})
      </span>
      <div>
        <button onclick="markDone(${index})">✔</button>
        <button onclick="deleteTask(${index})">❌</button>
      </div>
    `;
    taskList.appendChild(li);
  });
}

function markDone(index) {
  tasks[index].done = !tasks[index].done;
  localStorage.setItem("tasks", JSON.stringify(tasks));
  displayTasks();
}

function deleteTask(index) {
  tasks.splice(index, 1);
  localStorage.setItem("tasks", JSON.stringify(tasks));
  displayTasks();
}

function smartSuggestion() {
  let highTasks = tasks.filter(t => t.priority === "High" && !t.done);
  if (highTasks.length > 0) {
    suggestion.innerText = "💡 Suggestion: Do high priority task first!";
  } else {
    suggestion.innerText = "🎉 You're doing great! Keep going!";
  }
}