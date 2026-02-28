/* MOCK ISSUE DATA */
const mockIssues = [
    { title: "Fix login bug", label: "bug", priority: "High", status: "Open", days: 0 },
    { title: "Add dark mode", label: "feature", priority: "Medium", status: "Closed", days: 5 },
    { title: "Update README", label: "documentation", priority: "Low", status: "Closed", days: 2 },
    { title: "Crash on submit", label: "bug", priority: "High", status: "Open", days: 0 },
    { title: "Improve performance", label: "feature", priority: "Medium", status: "Closed", days: 7 }
];

let issues = [];

const issueList = document.getElementById("issueList");
const totalIssuesEl = document.getElementById("totalIssues");
const openIssuesEl = document.getElementById("openIssues");
const closedIssuesEl = document.getElementById("closedIssues");
const avgResolutionEl = document.getElementById("avgResolution");
const commonLabelEl = document.getElementById("commonLabel");
const highPriorityEl = document.getElementById("highPriorityCount");

document.getElementById("loadRepo").addEventListener("click", loadRepo);
document.getElementById("filterLabel").addEventListener("change", renderIssues);
document.getElementById("filterPriority").addEventListener("change", renderIssues);

function loadRepo() {
    issues = [...mockIssues];
    renderIssues();
    updateSummary();
    updateAnalytics();
}

function renderIssues() {
    issueList.innerHTML = "";

    const labelFilter = document.getElementById("filterLabel").value;
    const priorityFilter = document.getElementById("filterPriority").value;

    issues
        .filter(i => !labelFilter || i.label === labelFilter)
        .filter(i => !priorityFilter || i.priority === priorityFilter)
        .forEach(issue => {
            const li = document.createElement("li");
            li.innerHTML = `
                <strong>${issue.title}</strong><br>
                Label: ${issue.label} | Priority: ${issue.priority}<br>
                Status: ${issue.status}
            `;
            issueList.appendChild(li);
        });
}

function updateSummary() {
    totalIssuesEl.textContent = issues.length;
    openIssuesEl.textContent = issues.filter(i => i.status === "Open").length;
    closedIssuesEl.textContent = issues.filter(i => i.status === "Closed").length;

    const resolved = issues.filter(i => i.status === "Closed");
    const avg = resolved.length
        ? Math.round(resolved.reduce((a, b) => a + b.days, 0) / resolved.length)
        : 0;

    avgResolutionEl.textContent = avg;
}

function updateAnalytics() {
    const labelCount = {};
    let highPriority = 0;

    issues.forEach(i => {
        labelCount[i.label] = (labelCount[i.label] || 0) + 1;
        if (i.priority === "High") highPriority++;
    });

    let common = "N/A";
    let max = 0;
    for (let l in labelCount) {
        if (labelCount[l] > max) {
            max = labelCount[l];
            common = l;
        }
    }

    commonLabelEl.textContent = common;
    highPriorityEl.textContent = highPriority;
}