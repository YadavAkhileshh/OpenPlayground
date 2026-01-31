let tasks = JSON.parse(localStorage.getItem("tasks")) || [];
let timer;
let timeLeft = 25 * 60;

// TASK FUNCTIONS
function addTask() {
  const input = document.getElementById("taskInput");
  if (input.value.trim() === "") return;

  tasks.push({ text: input.value, done: false });
  input.value = "";
  saveTasks();
  renderTasks();
}

function toggleTask(index) {
  tasks[index].done = !tasks[index].done;
  saveTasks();
  renderTasks();
}

function saveTasks() {
  localStorage.setItem("tasks", JSON.stringify(tasks));
}

function renderTasks() {
  const list = document.getElementById("taskList");
  list.innerHTML = "";

  tasks.forEach((task, index) => {
    list.innerHTML += `
      <li class="${task.done ? "completed" : ""}">
        ${task.text}
        <input type="checkbox" ${task.done ? "checked" : ""} onclick="toggleTask(${index})">
      </li>
    `;
  });

  updateStats();
}

function updateStats() {
  const completed = tasks.filter(t => t.done).length;
  document.getElementById("totalTasks").innerText = tasks.length;
  document.getElementById("completedTasks").innerText = completed;
  document.getElementById("pendingTasks").innerText = tasks.length - completed;
}

// TIMER FUNCTIONS
function startTimer() {
  if (timer) return;
  timer = setInterval(() => {
    if (timeLeft <= 0) {
      clearInterval(timer);
      timer = null;
      alert("Focus session complete!");
      return;
    }
    timeLeft--;
    updateTimer();
  }, 1000);
}

function resetTimer() {
  clearInterval(timer);
  timer = null;
  timeLeft = 25 * 60;
  updateTimer();
}

function updateTimer() {
  const minutes = String(Math.floor(timeLeft / 60)).padStart(2, "0");
  const seconds = String(timeLeft % 60).padStart(2, "0");
  document.getElementById("timer").innerText = `${minutes}:${seconds}`;
}

renderTasks();
updateTimer();
