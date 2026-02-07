const analyzeBtn = document.getElementById("analyzeRepo");

const healthScoreEl = document.getElementById("healthScore");
const healthStatusEl = document.getElementById("healthStatus");

const commitScoreEl = document.getElementById("commitScore");
const issueScoreEl = document.getElementById("issueScore");
const prScoreEl = document.getElementById("prScore");
const contributorScoreEl = document.getElementById("contributorScore");
const docScoreEl = document.getElementById("docScore");

analyzeBtn.addEventListener("click", analyzeRepo);

function analyzeRepo() {
    const commits = Number(document.getElementById("commits").value) || 0;
    const issuesOpen = Number(document.getElementById("issuesOpen").value) || 0;
    const issuesClosed = Number(document.getElementById("issuesClosed").value) || 0;
    const prsMerged = Number(document.getElementById("prsMerged").value) || 0;
    const contributors = Number(document.getElementById("contributors").value) || 0;
    const docs = Number(document.getElementById("docs").value) || 0;

    const commitScore = calculateCommits(commits);
    const issueScore = calculateIssues(issuesOpen, issuesClosed);
    const prScore = calculatePRs(prsMerged);
    const contributorScore = calculateContributors(contributors);
    const documentationScore = docs;

    const total =
        commitScore +
        issueScore +
        prScore +
        contributorScore +
        documentationScore;

    updateUI(
        commitScore,
        issueScore,
        prScore,
        contributorScore,
        documentationScore,
        total
    );
}

function calculateCommits(commits) {
    if (commits > 50) return 20;
    if (commits > 30) return 15;
    if (commits > 10) return 10;
    return 5;
}

function calculateIssues(open, closed) {
    if (closed === 0 && open === 0) return 10;
    const ratio = closed / (open + closed);
    if (ratio > 0.7) return 20;
    if (ratio > 0.4) return 15;
    return 8;
}

function calculatePRs(prs) {
    if (prs > 20) return 20;
    if (prs > 10) return 15;
    if (prs > 5) return 10;
    return 5;
}

function calculateContributors(count) {
    if (count > 10) return 20;
    if (count > 5) return 15;
    if (count > 2) return 10;
    return 5;
}

function updateUI(c, i, p, con, d, total) {
    commitScoreEl.textContent = c;
    issueScoreEl.textContent = i;
    prScoreEl.textContent = p;
    contributorScoreEl.textContent = con;
    docScoreEl.textContent = d;

    healthScoreEl.textContent = total;

    if (total >= 80) healthStatusEl.textContent = "Excellent Repository";
    else if (total >= 60) healthStatusEl.textContent = "Healthy Repository";
    else if (total >= 40) healthStatusEl.textContent = "Moderate Health";
    else healthStatusEl.textContent = "Needs Attention";
}