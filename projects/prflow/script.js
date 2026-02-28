let prs = JSON.parse(localStorage.getItem("prs")) || [];

const prList = document.getElementById("prList");
const totalPRsEl = document.getElementById("totalPRs");
const approvedPRsEl = document.getElementById("approvedPRs");
const changesPRsEl = document.getElementById("changesPRs");

document.getElementById("createPR").addEventListener("click", createPR);

/* CREATE PR */
function createPR() {
    const title = document.getElementById("prTitle").value.trim();
    const desc = document.getElementById("prDesc").value.trim();
    const reviewer = document.getElementById("reviewer").value;

    if (!title || !desc) return;

    const pr = {
        title,
        desc,
        reviewer,
        status: "Open",
        comments: [],
        date: new Date().toLocaleString()
    };

    prs.push(pr);
    save();
    clearForm();
    render();
}

/* SAVE */
function save() {
    localStorage.setItem("prs", JSON.stringify(prs));
}

/* CLEAR */
function clearForm() {
    document.getElementById("prTitle").value = "";
    document.getElementById("prDesc").value = "";
}

/* RENDER */
function render() {
    prList.innerHTML = "";

    prs.forEach((pr, index) => {
        const li = document.createElement("li");

        li.innerHTML = `
            <strong>${pr.title}</strong><br>
            Reviewer: ${pr.reviewer}<br>
            Status: ${pr.status}<br>
            <button onclick="approvePR(${index})">Approve</button>
            <button onclick="requestChanges(${index})">Request Changes</button>
        `;

        prList.appendChild(li);
    });

    updateStats();
}

/* ACTIONS */
function approvePR(index) {
    prs[index].status = "Approved";
    save();
    render();
}

function requestChanges(index) {
    prs[index].status = "Changes Requested";
    save();
    render();
}

/* STATS */
function updateStats() {
    totalPRsEl.textContent = prs.length;
    approvedPRsEl.textContent = prs.filter(p => p.status === "Approved").length;
    changesPRsEl.textContent = prs.filter(p => p.status === "Changes Requested").length;
}

render();