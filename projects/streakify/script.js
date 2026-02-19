let codedDays = JSON.parse(localStorage.getItem("codedDays")) || {};
let notes = JSON.parse(localStorage.getItem("notes")) || {};

const today = new Date().toISOString().split("T")[0];

const currentStreakEl = document.getElementById("currentStreak");
const bestStreakEl = document.getElementById("bestStreak");
const totalDaysEl = document.getElementById("totalDays");
const calendar = document.getElementById("calendar");
const noteList = document.getElementById("noteList");

document.getElementById("markToday").addEventListener("click", markToday);
document.getElementById("resetStreak").addEventListener("click", resetAll);
document.getElementById("saveNote").addEventListener("click", saveNote);

/* MARK TODAY */
function markToday() {
    codedDays[today] = true;
    localStorage.setItem("codedDays", JSON.stringify(codedDays));
    calculateStats();
    renderCalendar();
}

/* RESET */
function resetAll() {
    if (!confirm("Reset all streak data?")) return;
    codedDays = {};
    notes = {};
    localStorage.clear();
    calculateStats();
    renderCalendar();
    renderNotes();
}

/* STATS */
function calculateStats() {
    const dates = Object.keys(codedDays).sort();
    let current = 0;
    let best = 0;
    let temp = 0;

    for (let i = 0; i < dates.length; i++) {
        if (i === 0) {
            temp = 1;
        } else {
            const prev = new Date(dates[i - 1]);
            const curr = new Date(dates[i]);
            const diff = (curr - prev) / (1000 * 60 * 60 * 24);

            if (diff === 1) {
                temp++;
            } else {
                temp = 1;
            }
        }
        best = Math.max(best, temp);
    }

    if (dates.includes(today)) {
        current = temp;
    }

    currentStreakEl.textContent = current;
    bestStreakEl.textContent = best;
    totalDaysEl.textContent = dates.length;
}

/* CALENDAR */
function renderCalendar() {
    calendar.innerHTML = "";
    const now = new Date();

    for (let i = 29; i >= 0; i--) {
        const d = new Date();
        d.setDate(now.getDate() - i);
        const key = d.toISOString().split("T")[0];

        const div = document.createElement("div");
        div.classList.add("day");
        div.textContent = d.getDate();

        if (codedDays[key]) div.classList.add("coded");
        calendar.appendChild(div);
    }
}

/* NOTES */
function saveNote() {
    const text = document.getElementById("dailyNote").value.trim();
    if (!text) return;

    notes[today] = text;
    localStorage.setItem("notes", JSON.stringify(notes));
    document.getElementById("dailyNote").value = "";
    renderNotes();
}

function renderNotes() {
    noteList.innerHTML = "";
    Object.keys(notes).forEach(date => {
        const li = document.createElement("li");
        li.innerHTML = `<strong>${date}</strong><br>${notes[date]}`;
        noteList.appendChild(li);
    });
}

calculateStats();
renderCalendar();
renderNotes();