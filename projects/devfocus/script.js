let time = 25 * 60;
let timerInterval = null;
let sessions = localStorage.getItem("sessions") || 0;
let distractions = localStorage.getItem("distractions") || 0;
let logs = JSON.parse(localStorage.getItem("logs")) || [];

const timerDisplay = document.getElementById("timer");
const startBtn = document.getElementById("start");
const pauseBtn = document.getElementById("pause");
const resetBtn = document.getElementById("reset");
const logBtn = document.getElementById("logDistraction");
const input = document.getElementById("distractionInput");
const logList = document.getElementById("logList");

const sessionDisplay = document.getElementById("sessions");
const distractionDisplay = document.getElementById("distractions");

sessionDisplay.textContent = sessions;
distractionDisplay.textContent = distractions;

function updateTimer() {
    const minutes = Math.floor(time / 60);
    const seconds = time % 60;
    timerDisplay.textContent = 
        `${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
}

function startTimer() {
    if (timerInterval) return;
    timerInterval = setInterval(() => {
        if (time > 0) {
            time--;
            updateTimer();
        } else {
            clearInterval(timerInterval);
            timerInterval = null;
            sessions++;
            localStorage.setItem("sessions", sessions);
            sessionDisplay.textContent = sessions;
            alert("Focus session completed!");
        }
    }, 1000);
}

function pauseTimer() {
    clearInterval(timerInterval);
    timerInterval = null;
}

function resetTimer() {
    pauseTimer();
    time = 25 * 60;
    updateTimer();
}

function logDistraction() {
    const text = input.value.trim();
    if (!text) return;

    const entry = {
        text,
        time: new Date().toLocaleTimeString()
    };

    logs.push(entry);
    distractions++;

    localStorage.setItem("logs", JSON.stringify(logs));
    localStorage.setItem("distractions", distractions);

    distractionDisplay.textContent = distractions;
    input.value = "";
    renderLogs();
}

function renderLogs() {
    logList.innerHTML = "";
    logs.forEach(log => {
        const li = document.createElement("li");
        li.textContent = `${log.time} - ${log.text}`;
        logList.appendChild(li);
    });
}

startBtn.addEventListener("click", startTimer);
pauseBtn.addEventListener("click", pauseTimer);
resetBtn.addEventListener("click", resetTimer);
logBtn.addEventListener("click", logDistraction);

updateTimer();
renderLogs();