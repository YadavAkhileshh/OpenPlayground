let tasks = JSON.parse(localStorage.getItem("tasks")) || [];
let timer;
let timeLeft = 25 * 60;

const taskList = document.getElementById("taskList");

function addTask() {
  const input = document.getElementById("taskInput");
  if (input.value.trim() === "") return;

  tasks.push({ text: input.value, done: false });
  input.value = "";
  save();
  render();
}

function toggleTask(index) {
  tasks[index].done = !tasks[index].done;
  save();
  render();
}

function render() {
  taskList.innerHTML = "";
  tasks.forEach((task, index) => {
    taskList.innerHTML += `
      <li class="${task.done ? "done" : ""}">
        ${task.text}
        <input type="checkbox" ${task.done ? "checked" : ""}
        onclick="toggleTask(${index})"/>
      </li>
    `;
  });

  updateSummary();
}

function updateSummary() {
  const completed = tasks.filter(t => t.done).length;
  document.getElementById("total").innerText = tasks.length;
  document.getElementById("completed").innerText = completed;
  document.getElementById("pending").innerText = tasks.length - completed;
}

function save() {
  localStorage.setItem("tasks", JSON.stringify(tasks));
}

/* TIMER */
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
  const min = String(Math.floor(timeLeft / 60)).padStart(2, "0");
  const sec = String(timeLeft % 60).padStart(2, "0");
  document.getElementById("timer").innerText = `${min}:${sec}`;
}

render();
updateTimer();
