let contributions = JSON.parse(localStorage.getItem("contributions")) || [];

function saveData() {
  localStorage.setItem("contributions", JSON.stringify(contributions));
}

function updateDashboard() {
  const totalPR = contributions.filter(c => c.type === "PR").length;
  const mergedPR = contributions.filter(c => c.type === "PR" && c.status === "Merged").length;
  const totalIssues = contributions.filter(c => c.type === "Issue").length;

  document.getElementById("totalPR").textContent = totalPR;
  document.getElementById("mergedPR").textContent = mergedPR;
  document.getElementById("totalIssues").textContent = totalIssues;

  calculateStreak();
}

function calculateStreak() {
  if (contributions.length === 0) {
    document.getElementById("streak").textContent = "0 days";
    return;
  }

  const dates = contributions.map(c => new Date(c.date))
    .sort((a, b) => b - a);

  let streak = 1;
  for (let i = 0; i < dates.length - 1; i++) {
    const diff = (dates[i] - dates[i + 1]) / (1000 * 60 * 60 * 24);
    if (diff === 1) {
      streak++;
    } else {
      break;
    }
  }

  document.getElementById("streak").textContent = `${streak} days`;
}

function renderList() {
  const list = document.getElementById("contributionList");
  list.innerHTML = "";

  contributions.forEach(c => {
    const li = document.createElement("li");
    li.innerHTML = `
      <span>${c.type} - ${c.status}</span>
      <span>${c.date}</span>
    `;
    list.appendChild(li);
  });
}

function addContribution() {
  const type = document.getElementById("type").value;
  const status = document.getElementById("status").value;
  const date = document.getElementById("date").value;

  if (!date) {
    alert("Please select a date.");
    return;
  }

  contributions.push({ type, status, date });
  saveData();
  updateDashboard();
  renderList();

  document.getElementById("date").value = "";
}

updateDashboard();
renderList();
