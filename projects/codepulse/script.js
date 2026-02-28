/* TAB NAVIGATION */
const buttons = document.querySelectorAll(".navbar button");
const tabs = document.querySelectorAll(".tab");

buttons.forEach(btn => {
    btn.addEventListener("click", () => {
        tabs.forEach(tab => tab.classList.remove("active"));
        document.getElementById(btn.dataset.tab).classList.add("active");
    });
});

/* STORAGE */
let tasks = JSON.parse(localStorage.getItem("tasks")) || [];
let moods = JSON.parse(localStorage.getItem("moods")) || [];
let sessions = Number(localStorage.getItem("sessions")) || 0;

/* DASHBOARD */
const totalTasks = document.getElementById("totalTasks");
const totalMoods = document.getElementById("totalMoods");
const totalSessions = document.getElementById("totalSessions");

function updateDashboard() {
    totalTasks.textContent = tasks.length;
    totalMoods.textContent = moods.length;
    totalSessions.textContent = sessions;
}
updateDashboard();

/* TASK MANAGER */
const taskTitle = document.getElementById("taskTitle");
const taskPriority = document.getElementById("taskPriority");
const taskList = document.getElementById("taskList");

document.getElementById("addTask").addEventListener("click", () => {
    if (!taskTitle.value.trim()) return;

    const task = {
        title: taskTitle.value,
        priority: taskPriority.value,
        time: new Date().toLocaleString()
    };

    tasks.push(task);
    localStorage.setItem("tasks", JSON.stringify(tasks));
    taskTitle.value = "";
    renderTasks();
    updateDashboard();
});

function renderTasks() {
    taskList.innerHTML = "";
    tasks.forEach(t => {
        const li = document.createElement("li");
        li.textContent = `${t.title} (${t.priority})`;
        taskList.appendChild(li);
    });
}
renderTasks();

/* MOOD TRACKER */
const moodSelect = document.getElementById("moodSelect");
const moodNote = document.getElementById("moodNote");
const moodList = document.getElementById("moodList");

document.getElementById("logMood").addEventListener("click", () => {
    if (!moodSelect.value) return;

    const mood = {
        mood: moodSelect.value,
        note: moodNote.value,
        date: new Date().toLocaleDateString()
    };

    moods.push(mood);
    localStorage.setItem("moods", JSON.stringify(moods));
    moodSelect.value = "";
    moodNote.value = "";
    renderMoods();
    updateAnalytics();
    updateDashboard();
});

function renderMoods() {
    moodList.innerHTML = "";
    moods.forEach(m => {
        const li = document.createElement("li");
        li.textContent = `${m.date} - ${m.mood} ${m.note}`;
        moodList.appendChild(li);
    });
}
renderMoods();

/* FOCUS TIMER */
let time = 25 * 60;
let interval = null;
const display = document.getElementById("timerDisplay");

function updateTimer() {
    const min = Math.floor(time / 60);
    const sec = time % 60;
    display.textContent = `${String(min).padStart(2, "0")}:${String(sec).padStart(2, "0")}`;
}

document.getElementById("startFocus").onclick = () => {
    if (interval) return;
    interval = setInterval(() => {
        if (time > 0) {
            time--;
            updateTimer();
        } else {
            clearInterval(interval);
            interval = null;
            sessions++;
            localStorage.setItem("sessions", sessions);
            updateDashboard();
            alert("Focus session completed!");
        }
    }, 1000);
};

document.getElementById("pauseFocus").onclick = () => {
    clearInterval(interval);
    interval = null;
};

document.getElementById("resetFocus").onclick = () => {
    time = 25 * 60;
    updateTimer();
};

updateTimer();

/* ANALYTICS */
function updateAnalytics() {
    const moodCount = {};
    moods.forEach(m => {
        moodCount[m.mood] = (moodCount[m.mood] || 0) + 1;
    });

    let common = "N/A";
    let max = 0;

    for (let m in moodCount) {
        if (moodCount[m] > max) {
            max = moodCount[m];
            common = m;
        }
    }

    document.getElementById("commonMood").textContent = common;

    const high = tasks.filter(t => t.priority === "High").length;
    document.getElementById("highTasks").textContent = high;
}
updateAnalytics();