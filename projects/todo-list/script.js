console.log("Script Loaded!");

window.saveTasks = function () {
    let tasks = [];
    document.querySelectorAll(".task").forEach(task => {
        tasks.push({
            id: task.id,
            title: task.querySelector("strong").textContent,
            description: task.querySelector("p").textContent,
            dueDate: task.querySelector(".due-date").textContent,
            column: task.closest(".column").id
        });
    });

    console.log("Saving tasks:", tasks);
    localStorage.setItem("kanbanTasks", JSON.stringify(tasks));
};

console.log("Script Loaded!");

function allowDrop(event) {
    event.preventDefault();
}

function drag(event) {
    event.dataTransfer.setData("text", event.target.id);
}

function drop(event) {
    event.preventDefault();
    let data = event.dataTransfer.getData("text");
    let task = document.getElementById(data);
    event.target.appendChild(task);
    applyTaskColor(task, event.target.closest(".column").id);
    saveTasks();
    checkDueDates();
    updateLeaderboard();
    updateProgress();
}

function addTask(columnId) {
    let title = prompt("Enter task title:");
    let description = prompt("Enter task description:");
    
    let dueDate = prompt("Set due date (YYYY-MM-DD):");
    let assignedTo = prompt("Assign task to:");
    
    if (title) {
        let taskId = "task-" + Math.random().toString(36).substr(2, 9);
        let task = document.createElement("div");
        
        task.innerHTML = `<strong>${title}</strong>
            <p>${description}</p>
            <p>Due: <span class="due-date">${dueDate || "N/A"}</span></p>
            <label>Assigned to: 
                <select class="assigned-to" onchange="updateLeaderboard()">
                    <option value="Worker 1">Worker 1</option>
                    <option value="Worker 2">Worker 2</option>
                    <option value="Worker 3">Worker 3</option>
                </select>
            </label>
            <button onclick="addComment('${taskId}')">💬</button>
            <button onclick="editTask(this)">✏️</button>
            <button onclick="deleteTask(this)">❌</button>
            <div class="comments" id="comments-${taskId}"></div>`;
        task.setAttribute("draggable", true);
        task.setAttribute("id", taskId);
        task.ondragstart = drag;
        document.getElementById(columnId).querySelector(".task-list").appendChild(task);
        applyTaskColor(task, columnId);
        saveTasks();
        updateProgress();
        checkDueDates();
        updateLeaderboard();
    }
}
function editTask(button, taskId) {
    let task = button.parentElement;
    let newTitle = prompt("Edit task title:", task.querySelector("strong").textContent);
    let newDescription = prompt("Edit task description:", task.querySelector("p").textContent);
    let newDueDate = prompt("Edit due date (YYYY-MM-DD):", task.querySelector(".due-date").textContent);
    if (newTitle) task.querySelector("strong").textContent = newTitle;
    if (newDescription) task.querySelector("p").textContent = newDescription;
    if (newDueDate) task.querySelector(".due-date").textContent = newDueDate;
    saveTasks();
}
function addComment(taskId) {
    let comment = prompt("Enter your comment:");
    if (comment) {
        let commentDiv = document.createElement("p");
        commentDiv.textContent = comment;
        document.getElementById("comments-" + taskId).appendChild(commentDiv);
        saveTasks();

    }
}
function deleteTask(button) {
    if (confirm("Are you sure you want to delete this task?")) {
        button.parentElement.remove();
        saveTasks();
        updateProgress();
        updateLeaderboard();
        saveTasks();
    }
}

window.saveTasks = function () {
    let tasks = [];
    document.querySelectorAll(".task").forEach(task => {
        let comments = [];
        task.querySelectorAll(".comments p").forEach(comment => comments.push(comment.textContent));

        tasks.push({
            id: task.id,
            title: task.querySelector("strong").textContent,
            description: task.querySelector("p").textContent,
            dueDate: task.querySelector(".due-date").textContent,
            assignedTo: task.querySelector(".assigned-to") ? task.querySelector(".assigned-to").value : "",
            column: task.closest(".column") ? task.closest(".column").id : "",
            comments: comments
        });
    });

    console.log("Saving tasks:", tasks); // ✅ Debugging
    localStorage.setItem("kanbanTasks", JSON.stringify(tasks));
};


function loadTasks() {
    let tasks = JSON.parse(localStorage.getItem("kanbanTasks")) || [];
    console.log("Loaded tasks:", tasks); // ✅ Debugging

    tasks.forEach(taskData => {
        let task = document.createElement("div");
        task.className = "task";
        task.innerHTML = `<strong>${taskData.title}</strong>
            <p>${taskData.description}</p>
            <p>Due: <span class="due-date">${taskData.dueDate}</span></p>
            <label>Assigned to: 
                <select class="assigned-to" onchange="saveTasks()">
                    <option value="Worker 1" ${taskData.assignedTo === "Worker 1" ? "selected" : ""}>Worker 1</option>
                    <option value="Worker 2" ${taskData.assignedTo === "Worker 2" ? "selected" : ""}>Worker 2</option>
                    <option value="Worker 3" ${taskData.assignedTo === "Worker 3" ? "selected" : ""}>Worker 3</option>
                </select>
            </label>
            <button onclick="deleteTask(this)">❌</button>
            <div class="comments" id="comments-${taskData.id}"></div>`;

        task.setAttribute("draggable", true);
        task.setAttribute("id", taskData.id);
        task.ondragstart = drag;

        let column = document.getElementById(taskData.column);
        if (column) {
            column.querySelector(".task-list").appendChild(task);
        } else {
            console.warn(`Column ${taskData.column} not found!`);
        }

        taskData.comments.forEach(comment => {
            let commentDiv = document.createElement("p");
            commentDiv.textContent = comment;
            document.getElementById("comments-" + taskData.id).appendChild(commentDiv);
        });
    });
}



function toggleTheme() {
    document.body.classList.toggle("dark-theme");
    let theme = document.body.classList.contains("dark-theme") ? "dark" : "light";
    localStorage.setItem("theme", theme);
    document.getElementById("theme-toggle").textContent = theme === "dark" ? "☀️" : "🌙";
}
function exportTasks() {
    let tasks = localStorage.getItem("kanbanTasks");
    let blob = new Blob([tasks], { type: "application/json" });
    let a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "kanban_tasks.json";
    a.click();
}

function importTasks() {
    let input = document.createElement("input");
    input.type = "file";
    input.accept = "application/json";
    input.onchange = function(event) {
        let file = event.target.files[0];
        let reader = new FileReader();
        reader.onload = function() {
            localStorage.setItem("kanbanTasks", reader.result);
            location.reload();
        };
        reader.readAsText(file);
    };
    input.click();
}
function updateProgress() {
    let totalTasks = document.querySelectorAll(".task").length;
    let completedTasks = document.querySelectorAll("#done .task").length;
    let progressPercentage = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;
    document.getElementById("progress-bar").style.width = progressPercentage + "%";
    document.getElementById("progress-bar").textContent = Math.round(progressPercentage) + "%";
}

document.addEventListener("DOMContentLoaded", () => {

    console.log("Page loaded. Loading tasks...");
    loadTasks();
    updateProgress();
    updateLeaderboard();
    if (localStorage.getItem("theme") === "dark") {
        document.body.classList.add("dark-theme");
        document.getElementById("theme-toggle").textContent = "🌙";
    }
});