/* TAB HANDLING */
const navButtons = document.querySelectorAll(".nav button");
const tabs = document.querySelectorAll(".tab");

navButtons.forEach(btn => {
    btn.addEventListener("click", () => {
        tabs.forEach(tab => tab.classList.remove("active"));
        document.getElementById(btn.dataset.tab).classList.add("active");
    });
});

/* STORAGE */
let bugs = JSON.parse(localStorage.getItem("bugs")) || [];

/* ELEMENTS */
const bugTitle = document.getElementById("bugTitle");
const bugDesc = document.getElementById("bugDesc");
const severity = document.getElementById("severity");
const statusSelect = document.getElementById("status");
const bugList = document.getElementById("bugList");

const totalBugs = document.getElementById("totalBugs");
const criticalBugs = document.getElementById("criticalBugs");
const resolvedBugs = document.getElementById("resolvedBugs");

/* ADD BUG */
document.getElementById("submitBug").addEventListener("click", () => {
    if (!bugTitle.value.trim() || !bugDesc.value.trim()) return;

    const bug = {
        title: bugTitle.value,
        desc: bugDesc.value,
        severity: severity.value,
        status: statusSelect.value,
        date: new Date().toLocaleString()
    };

    bugs.push(bug);
    saveBugs();
    clearForm();
    renderBugs();
    updateStats();
});

/* HELPERS */
function saveBugs() {
    localStorage.setItem("bugs", JSON.stringify(bugs));
}

function clearForm() {
    bugTitle.value = "";
    bugDesc.value = "";
}

/* RENDER BUGS */
function renderBugs() {
    bugList.innerHTML = "";

    bugs.forEach((bug, index) => {
        const li = document.createElement("li");

        li.innerHTML = `
            <strong>${bug.title}</strong><br>
            <small>${bug.date}</small>
            <p>${bug.desc}</p>
            <span>Severity: ${bug.severity}</span><br>
            <span>Status: ${bug.status}</span>
        `;

        li.addEventListener("click", () => cycleStatus(index));
        bugList.appendChild(li);
    });
}

/* STATUS FLOW */
function cycleStatus(index) {
    const order = ["Open", "In Review", "Resolved"];
    let current = order.indexOf(bugs[index].status);
    bugs[index].status = order[(current + 1) % order.length];
    saveBugs();
    renderBugs();
    updateStats();
}

/* STATS */
function updateStats() {
    totalBugs.textContent = bugs.length;
    criticalBugs.textContent = bugs.filter(b => b.severity === "Critical").length;
    resolvedBugs.textContent = bugs.filter(b => b.status === "Resolved").length;
}

renderBugs();
updateStats();