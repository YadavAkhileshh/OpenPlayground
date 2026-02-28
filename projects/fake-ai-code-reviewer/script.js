const reviewBtn = document.getElementById("reviewBtn");
const codeInput = document.getElementById("codeInput");

const reviewResult = document.getElementById("reviewResult");
const scoreEl = document.getElementById("score");
const issuesEl = document.getElementById("issues");
const suggestionsEl = document.getElementById("suggestions");

reviewBtn.addEventListener("click", reviewCode);

function reviewCode() {
  const code = codeInput.value.trim();

  if (!code) {
    alert("Please paste some code first!");
    return;
  }

  const lines = code.split("\n");
  let score = 100;
  const issues = [];
  const suggestions = [];

  // Rule 1: Long lines
  lines.forEach((line, index) => {
    if (line.length > 120) {
      score -= 2;
      issues.push(`Line ${index + 1} is too long`);
      suggestions.push("Break long lines for better readability");
    }
  });

  // Rule 2: Missing comments
  const commentCount = lines.filter(l => l.trim().startsWith("//") || l.trim().startsWith("/*")).length;
  if (commentCount === 0) {
    score -= 15;
    issues.push("No comments detected");
    suggestions.push("Add comments to explain complex logic");
  }

  // Rule 3: Magic numbers
  if (code.match(/\b\d{2,}\b/)) {
    score -= 10;
    issues.push("Magic numbers detected");
    suggestions.push("Use constants instead of hardcoded numbers");
  }

  // Rule 4: Console logs
  if (code.includes("console.log")) {
    score -= 5;
    issues.push("Debug console logs found");
    suggestions.push("Remove console logs before production");
  }

  // Rule 5: Naming conventions
  if (code.match(/\b[a-z]+_[a-z]+\b/)) {
    score -= 5;
    issues.push("Inconsistent naming convention detected");
    suggestions.push("Use camelCase for JavaScript variables");
  }

  score = Math.max(score, 40);

  displayResults(score, issues, suggestions);
}

function displayResults(score, issues, suggestions) {
  reviewResult.classList.remove("hidden");
  scoreEl.textContent = score;

  issuesEl.innerHTML = "";
  suggestionsEl.innerHTML = "";

  if (issues.length === 0) {
    issuesEl.innerHTML = "<li>No major issues detected 🎉</li>";
  } else {
    issues.forEach(issue => {
      const li = document.createElement("li");
      li.textContent = issue;
      issuesEl.appendChild(li);
    });
  }

  suggestions.forEach(suggestion => {
    const li = document.createElement("li");
    li.textContent = suggestion;
    suggestionsEl.appendChild(li);
  });
}