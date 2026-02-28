let tasks = JSON.parse(localStorage.getItem("tasks")) || [];

// ---------- TASK LOGIC ----------
function addTask() {
  const subject = document.getElementById("subject").value;
  const hours = document.getElementById("hours").value;
  const priority = document.getElementById("priority").value;

  if (!subject || !hours) return alert("Fill all fields!");

  tasks.push({
    subject,
    hours: Number(hours),
    priority,
    completed: false
  });

  saveAndRender();
}

function toggleTask(index) {
  tasks[index].completed = !tasks[index].completed;
  saveAndRender();
}

function saveAndRender() {
  localStorage.setItem("tasks", JSON.stringify(tasks));
  renderTasks();
  generateSuggestions();
}

function renderTasks() {
  const list = document.getElementById("taskList");
  list.innerHTML = "";

  tasks.forEach((task, index) => {
    const li = document.createElement("li");
    li.innerHTML = `
      <input type="checkbox" ${task.completed ? "checked" : ""} 
      onclick="toggleTask(${index})">
      <strong>${task.subject}</strong> - ${task.hours} hrs 
      (${task.priority})
    `;
    list.appendChild(li);
  });
}

// ---------- SMART AI-LIKE LOGIC ----------
function generateSuggestions() {
  const suggestionBox = document.getElementById("suggestions");
  suggestionBox.innerHTML = "";

  let totalHours = tasks.reduce((sum, t) => sum + t.hours, 0);
  let incomplete = tasks.filter(t => !t.completed);
  let highPriority = incomplete.filter(t => t.priority === "high");

  if (totalHours > 8) {
    suggestionBox.innerHTML += "⚠️ You planned too many hours today. Consider breaks.<br>";
  }

  if (highPriority.length > 0) {
    suggestionBox.innerHTML += "🔥 Focus on HIGH priority subjects first.<br>";
  }

  if (incomplete.length === 0 && tasks.length > 0) {
    suggestionBox.innerHTML += "🎉 Great job! All tasks completed.";
  }

  if (incomplete.length > 3) {
    suggestionBox.innerHTML += "🧠 Try splitting tasks into smaller chunks.";
  }
}

// ---------- POMODORO TIMER ----------
let time = 25 * 60;
let timerInterval;

function startTimer() {
  if (timerInterval) return;

  timerInterval = setInterval(() => {
    time--;
    updateTimer();

    if (time <= 0) {
      clearInterval(timerInterval);
      timerInterval = null;
      alert("⏰ Time's up! Take a break.");
    }
  }, 1000);
}

function resetTimer() {
  clearInterval(timerInterval);
  timerInterval = null;
  time = 25 * 60;
  updateTimer();
}

function updateTimer() {
  const minutes = Math.floor(time / 60);
  const seconds = time % 60;
  document.getElementById("time").innerText =
    `${minutes}:${seconds.toString().padStart(2, "0")}`;
}

renderTasks();
generateSuggestions();
