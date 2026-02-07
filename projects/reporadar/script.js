let tasks = JSON.parse(localStorage.getItem("reporadarTasks")) || [];

const repoName = document.getElementById("repoName");
const issueTitle = document.getElementById("issueTitle");
const difficulty = document.getElementById("difficulty");
const statusSelect = document.getElementById("status");

const backlogList = document.getElementById("backlogList");
const progressList = document.getElementById("progressList");
const completedList = document.getElementById("completedList");

const totalTasks = document.getElementById("totalTasks");
const completedTasks = document.getElementById("completedTasks");
const hardTasks = document.getElementById("hardTasks");

document.getElementById("addTask").addEventListener("click", () => {
    if (!repoName.value.trim() || !issueTitle.value.trim()) return;

    const task = {
        repo: repoName.value,
        title: issueTitle.value,
        difficulty: difficulty.value,
        status: statusSelect.value,
        time: new Date().toLocaleString()
    };

    tasks.push(task);
    saveTasks();
    repoName.value = "";
    issueTitle.value = "";
    renderTasks();
    updateStats();
});

function saveTasks() {
    localStorage.setItem("reporadarTasks", JSON.stringify(tasks));
}

function renderTasks() {
    backlogList.innerHTML = "";
    progressList.innerHTML = "";
    completedList.innerHTML = "";

    tasks.forEach((task, index) => {
        const li = document.createElement("li");
        li.innerHTML = `
            <strong>${task.repo}</strong><br>
            ${task.title}<br>
            <small>${task.difficulty}</small>
        `;

        li.addEventListener("click", () => cycleStatus(index));

        if (task.status === "Backlog") backlogList.appendChild(li);
        if (task.status === "In Progress") progressList.appendChild(li);
        if (task.status === "Completed") completedList.appendChild(li);
    });
}

function cycleStatus(index) {
    const order = ["Backlog", "In Progress", "Completed"];
    let current = order.indexOf(tasks[index].status);
    tasks[index].status = order[(current + 1) % order.length];
    saveTasks();
    renderTasks();
    updateStats();
}

function updateStats() {
    totalTasks.textContent = tasks.length;
    completedTasks.textContent = tasks.filter(t => t.status === "Completed").length;
    hardTasks.textContent = tasks.filter(t => t.difficulty === "Hard").length;
}

renderTasks();
updateStats();