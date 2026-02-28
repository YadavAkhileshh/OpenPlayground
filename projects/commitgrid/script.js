let contributions = JSON.parse(localStorage.getItem("contributions")) || {};

const heatmap = document.getElementById("heatmap");
const totalCommitsEl = document.getElementById("totalCommits");
const currentStreakEl = document.getElementById("currentStreak");
const bestStreakEl = document.getElementById("bestStreak");

const today = new Date().toISOString().split("T")[0];

document.getElementById("addCommit").addEventListener("click", addCommit);
document.getElementById("resetGrid").addEventListener("click", resetGrid);

/* ADD COMMIT */
function addCommit() {
    contributions[today] = (contributions[today] || 0) + 1;
    save();
    render();
}

/* RESET */
function resetGrid() {
    if (!confirm("Reset all contribution data?")) return;
    contributions = {};
    localStorage.clear();
    render();
}

/* SAVE */
function save() {
    localStorage.setItem("contributions", JSON.stringify(contributions));
}

/* RENDER */
function render() {
    heatmap.innerHTML = "";
    renderGrid();
    updateStats();
}

/* GRID */
function renderGrid() {
    const start = new Date();
    start.setFullYear(start.getFullYear() - 1);

    for (let i = 0; i < 371; i++) {
        const date = new Date(start);
        date.setDate(start.getDate() + i);
        const key = date.toISOString().split("T")[0];

        const div = document.createElement("div");
        div.classList.add("day");

        const count = contributions[key] || 0;
        div.classList.add(`level-${getLevel(count)}`);

        heatmap.appendChild(div);
    }
}

/* INTENSITY */
function getLevel(count) {
    if (count === 0) return 0;
    if (count < 3) return 1;
    if (count < 6) return 2;
    if (count < 9) return 3;
    return 4;
}

/* STATS */
function updateStats() {
    const dates = Object.keys(contributions).sort();
    let total = 0;
    let best = 0;
    let current = 0;
    let temp = 0;

    dates.forEach((d, i) => {
        total += contributions[d];
        if (i === 0) {
            temp = 1;
        } else {
            const prev = new Date(dates[i - 1]);
            const curr = new Date(d);
            const diff = (curr - prev) / (1000 * 60 * 60 * 24);

            if (diff === 1) temp++;
            else temp = 1;
        }
        best = Math.max(best, temp);
    });

    if (dates.includes(today)) current = temp;

    totalCommitsEl.textContent = total;
    bestStreakEl.textContent = best;
    currentStreakEl.textContent = current;
}

render();