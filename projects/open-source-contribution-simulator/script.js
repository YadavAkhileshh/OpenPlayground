const issueSelect = document.getElementById("issueSelect");
const branchInput = document.getElementById("branchInput");
const createBranchBtn = document.getElementById("createBranchBtn");

const commitMsg = document.getElementById("commitMsg");
const commitBtn = document.getElementById("commitBtn");
const commitList = document.getElementById("commitList");

const openPrBtn = document.getElementById("openPrBtn");
const prStatus = document.getElementById("prStatus");

const reviewSection = document.getElementById("reviewSection");

let branchCreated = false;
let commits = [];
let prOpened = false;

createBranchBtn.addEventListener("click", () => {
  if (!issueSelect.value) {
    alert("Select an issue first!");
    return;
  }

  if (!branchInput.value) {
    alert("Enter branch name!");
    return;
  }

  branchCreated = true;
  prStatus.textContent = `Branch "${branchInput.value}" created ✔️`;
});

commitBtn.addEventListener("click", () => {
  if (!branchCreated) {
    alert("Create a branch first!");
    return;
  }

  if (!commitMsg.value.trim()) {
    alert("Write a commit message!");
    return;
  }

  commits.push(commitMsg.value);
  const li = document.createElement("li");
  li.textContent = commitMsg.value;
  commitList.appendChild(li);

  commitMsg.value = "";
});

openPrBtn.addEventListener("click", () => {
  if (commits.length === 0) {
    alert("Add at least one commit!");
    return;
  }

  prOpened = true;
  prStatus.textContent = "Pull Request opened 🎉 Waiting for review...";
  reviewSection.classList.remove("hidden");
});

reviewSection.addEventListener("click", e => {
  if (!e.target.dataset.review) return;

  if (e.target.dataset.review === "approve") {
    prStatus.textContent = "PR approved and merged 🚀";
    reviewSection.classList.add("hidden");
  }

  if (e.target.dataset.review === "changes") {
    prStatus.textContent = "Changes requested ❌ Add more commits";
  }
});